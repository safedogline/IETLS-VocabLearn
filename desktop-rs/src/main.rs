#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Seek, Write};
use std::path::{Path, PathBuf};
use std::process::Command;
use std::thread;
use std::time::{SystemTime, UNIX_EPOCH};

use tao::dpi::{LogicalSize, PhysicalPosition, PhysicalSize};
use tao::event::{Event, WindowEvent};
use tao::event_loop::{ControlFlow, EventLoop, EventLoopBuilder};
use tao::window::WindowBuilder;
use tiny_http::{Header, Response, Server};
use wry::{NewWindowResponse, WebViewBuilder};
use rusqlite::{params, Connection};
#[cfg(windows)]
use tao::platform::windows::{WindowBuilderExtWindows, WindowExtWindows};
#[cfg(windows)]
use std::cell::Cell;
#[cfg(windows)]
use windows::{
    core::{IUnknown, Interface},
    Win32::{
        Foundation::HWND,
        Graphics::DirectComposition::{DCompositionCreateDevice2, IDCompositionDevice, IDCompositionTarget, IDCompositionVisual},
        System::Com::{CoInitializeEx, COINIT_APARTMENTTHREADED},
    },
};
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::{GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW};
#[cfg(windows)]
use wry::WebViewBuilderExtWindows;

#[cfg(windows)]
#[link(name = "user32")]
extern "system" {
    fn SetProcessDpiAwarenessContext(context: isize) -> i32;
    fn SetProcessDPIAware() -> i32;
    fn ReleaseCapture() -> i32;
    fn SendMessageW(hwnd: isize, msg: u32, wparam: usize, lparam: isize) -> isize;
}

#[cfg(windows)]
struct CompositionHost {
    device: IDCompositionDevice,
    _target: IDCompositionTarget,
    visual: IDCompositionVisual,
}

#[cfg(windows)]
fn create_composition_host(hwnd: isize) -> windows::core::Result<CompositionHost> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);
        let device: IDCompositionDevice = DCompositionCreateDevice2(None::<&IUnknown>)?;
        let target = device.CreateTargetForHwnd(HWND(hwnd as *mut _), true)?;
        let visual = device.CreateVisual()?;
        target.SetRoot(&visual)?;
        device.Commit()?;
        Ok(CompositionHost { device, _target: target, visual })
    }
}

#[derive(Debug)]
enum WindowCommand {
    SetGlass(bool),
    Minimize,
    ToggleMaximize,
    Close,
    Drag,
    /// Pin the window above every other window. Once pinned the shell drops the
    /// taskbar button and refuses activation, so the pin button you press to
    /// release it is the only thing still standing between the user and an
    /// unreachable window - see `apply_always_on_top`.
    SetAlwaysOnTop(bool),
    /// Read back the pin state, because the page caches it in its settings and
    /// has to agree with what the window manager actually applied.
    QueryAlwaysOnTop,
    /// Re-broadcast from the pin watcher thread while the pin is on.
    EnsureAlwaysOnTop,
}

const APP_TITLE: &str = "IE";
const MIN_WIDTH: f64 = 350.0;
const MIN_HEIGHT: f64 = 450.0;
/// How often a pinned window re-asserts itself. Fast enough to look instant when
/// the user clicks another window, slow enough to cost nothing while idle.
const PIN_POLL_MS: u64 = 700;

#[derive(Serialize, Deserialize, Clone, Copy)]
struct Bounds {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
}

/// Keep the log from growing without bound: the page reports its glass state on
/// every theme change, so a long-lived install writes a lot of small lines.
const LOG_ROTATE_BYTES: u64 = 512 * 1024;

fn log(message: &str) {
    if let Some(path) = config_dir().map(|dir| dir.join("main.log")) {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if fs::metadata(&path).map(|meta| meta.len() > LOG_ROTATE_BYTES).unwrap_or(false) {
            let previous = path.with_extension("log.1");
            let _ = fs::remove_file(&previous);
            let _ = fs::rename(&path, &previous);
        }
        if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
            let stamp = SystemTime::now().duration_since(UNIX_EPOCH).map(|value| value.as_secs()).unwrap_or(0);
            let _ = writeln!(file, "[{stamp}] {message}");
        }
    }
}

fn config_dir() -> Option<PathBuf> {
    std::env::var_os("APPDATA").map(|base| PathBuf::from(base).join("IELTS-Vocabulary"))
}

fn bounds_path() -> Option<PathBuf> {
    config_dir().map(|dir| dir.join("window.json"))
}

fn database_path() -> Option<PathBuf> {
    config_dir().map(|dir| dir.join("study.sqlite"))
}

fn open_database(path: &Path) -> rusqlite::Result<Connection> {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let connection = Connection::open(path)?;
    connection.execute_batch("CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), state_json TEXT NOT NULL, updated_at INTEGER NOT NULL);")?;
    Ok(connection)
}

fn load_database_state(path: &Path) -> Option<String> {
    let connection = open_database(path).ok()?;
    connection.query_row("SELECT state_json FROM app_state WHERE id = 1", [], |row| row.get(0)).ok()
}

fn save_database_state(path: &Path, state: &str) -> rusqlite::Result<()> {
    let connection = open_database(path)?;
    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH).map(|value| value.as_secs() as i64).unwrap_or(0);
    connection.execute("INSERT INTO app_state (id, state_json, updated_at) VALUES (1, ?1, ?2) ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at", params![state, timestamp])?;
    Ok(())
}

fn load_bounds() -> Option<Bounds> {
    let text = fs::read_to_string(bounds_path()?).ok()?;
    let bounds: Bounds = serde_json::from_str(&text).ok()?;
    if bounds.width < MIN_WIDTH as u32 || bounds.height < MIN_HEIGHT as u32 {
        return None;
    }
    Some(bounds)
}

/// A saved position can point at a monitor that is no longer connected (external
/// display unplugged, resolution changed, remote session). Left alone the window
/// would be restored entirely off-screen and the app would look like it failed to
/// launch, so pull it back onto whichever monitor is now available.
fn ensure_window_on_screen(window: &tao::window::Window) {
    let Ok(position) = window.outer_position() else { return };
    let size = window.outer_size();
    let overlaps = |monitor: &tao::monitor::MonitorHandle| {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let left = position.x.max(monitor_position.x);
        let top = position.y.max(monitor_position.y);
        let right = (position.x + size.width as i32).min(monitor_position.x + monitor_size.width as i32);
        let bottom = (position.y + size.height as i32).min(monitor_position.y + monitor_size.height as i32);
        // Require a grabbable strip, not just a single pixel of overlap.
        right - left >= 120 && bottom - top >= 60
    };
    if window.available_monitors().any(|monitor| overlaps(&monitor)) {
        return;
    }
    let target = window
        .primary_monitor()
        .or_else(|| window.current_monitor())
        .or_else(|| window.available_monitors().next());
    if let Some(monitor) = target {
        let monitor_position = monitor.position();
        let monitor_size = monitor.size();
        let x = monitor_position.x + ((monitor_size.width as i32 - size.width as i32) / 2).max(0);
        let y = monitor_position.y + ((monitor_size.height as i32 - size.height as i32) / 2).max(0);
        window.set_outer_position(PhysicalPosition::new(x, y));
        log(&format!("window was off-screen at {},{}, re-centred to {x},{y}", position.x, position.y));
    } else {
        window.set_outer_position(PhysicalPosition::new(80, 80));
        log("window was off-screen and no monitor was reported, moved to 80,80");
    }
}

fn save_bounds(bounds: Bounds) {
    if let Some(path) = bounds_path() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(text) = serde_json::to_string(&bounds) {
            let _ = fs::write(path, text);
        }
    }
}

fn find_root() -> Option<PathBuf> {
    let exe = std::env::current_exe().ok()?;
    let mut dir = exe.parent()?.to_path_buf();
    for _ in 0..5 {
        if dir.join("index.html").is_file() && dir.join("app.js").is_file() {
            return Some(dir);
        }
        dir = dir.parent()?.to_path_buf();
    }
    let cwd = std::env::current_dir().ok()?;
    if cwd.join("index.html").is_file() && cwd.join("app.js").is_file() {
        return Some(cwd);
    }
    None
}

fn mime_for(path: &Path) -> &'static str {
    match path.extension().and_then(|value| value.to_str()).unwrap_or("").to_ascii_lowercase().as_str() {
        "html" => "text/html; charset=utf-8",
        "js" | "mjs" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" => "application/json; charset=utf-8",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "mp4" => "video/mp4",
        "pdf" => "application/pdf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ttf" => "font/ttf",
        "xml" => "application/xml",
        "md" => "text/markdown; charset=utf-8",
        "txt" => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn percent_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut output = Vec::with_capacity(bytes.len());
    let mut index = 0;
    while index < bytes.len() {
        if bytes[index] == b'%' && index + 2 < bytes.len() {
            let high = (bytes[index + 1] as char).to_digit(16);
            let low = (bytes[index + 2] as char).to_digit(16);
            if let (Some(high), Some(low)) = (high, low) {
                output.push(((high << 4) | low) as u8);
                index += 3;
                continue;
            }
        }
        output.push(bytes[index]);
        index += 1;
    }
    String::from_utf8_lossy(&output).into_owned()
}

fn header(name: &str, value: &str) -> Header {
    Header::from_bytes(name.as_bytes(), value.as_bytes()).expect("valid header")
}

fn header_value(request: &tiny_http::Request, name: &str) -> Option<String> {
    // `Header::equiv` requires a `&'static str`, so compare by value instead.
    request
        .headers()
        .iter()
        .find(|item| item.field.as_str().as_str().eq_ignore_ascii_case(name))
        .map(|item| item.value.as_str().to_string())
}

/// Outcome of inspecting a `Range` header.
enum RangeSpec {
    /// Serve this inclusive byte span as 206.
    Satisfiable(u64, u64),
    /// Ignore the header and send the whole file with 200. Used for multi-range
    /// requests, which are legal to answer with the full entity, and for headers
    /// this server does not understand.
    Ignore,
    /// The client asked for bytes that do not exist; RFC 7233 requires 416 plus
    /// `Content-Range: bytes */total`. Answering 200 here would make a media
    /// element treat a truncated file as complete.
    Unsatisfiable,
}

/// Parse a single `bytes=start-end` range.
///
/// Multi-range requests deliberately fall back to the whole file: returning 200
/// for a request we do not fully understand is always legal, and the only media
/// user here is an `<audio>` element that issues single ranges.
fn parse_range(value: &str, total: u64) -> RangeSpec {
    let Some(spec) = value.strip_prefix("bytes=") else {
        return RangeSpec::Ignore;
    };
    let spec = spec.trim();
    if spec.contains(',') {
        return RangeSpec::Ignore;
    }
    if total == 0 {
        return RangeSpec::Unsatisfiable;
    }
    let Some((start, end)) = spec.split_once('-') else {
        return RangeSpec::Ignore;
    };
    let (start, end) = (start.trim(), end.trim());
    if start.is_empty() {
        // Suffix range: the last N bytes.
        let Ok(length) = end.parse::<u64>() else {
            return RangeSpec::Ignore;
        };
        if length == 0 {
            return RangeSpec::Unsatisfiable;
        }
        let length = length.min(total);
        return RangeSpec::Satisfiable(total - length, total - 1);
    }
    let Ok(start) = start.parse::<u64>() else {
        return RangeSpec::Ignore;
    };
    if start >= total {
        return RangeSpec::Unsatisfiable;
    }
    let end = if end.is_empty() {
        total - 1
    } else {
        match end.parse::<u64>() {
            Ok(value) => value.min(total - 1),
            Err(_) => return RangeSpec::Ignore,
        }
    };
    if end < start {
        return RangeSpec::Unsatisfiable;
    }
    RangeSpec::Satisfiable(start, end)
}

/// Headers sent with every response. The app is a loopback-only personal tool,
/// but a permissive document policy still matters because it can render user
/// supplied vocabulary files, so lock it down to what the page actually needs.
fn document_headers() -> Vec<Header> {
    vec![
        header("X-Content-Type-Options", "nosniff"),
        header("Referrer-Policy", "no-referrer"),
        header("X-Frame-Options", "DENY"),
        header(
            "Content-Security-Policy",
            "default-src 'self'; \
             script-src 'self'; \
             style-src 'self' 'unsafe-inline'; \
             img-src 'self' data: blob:; \
             media-src 'self' data: blob: https:; \
             font-src 'self'; \
             connect-src 'self'; \
             object-src 'none'; \
             base-uri 'none'; \
             form-action 'none'; \
             frame-ancestors 'none'",
        ),
    ]
}

fn with_common_headers(mut response: Response<std::fs::File>) -> Response<std::fs::File> {
    for item in document_headers() {
        response.add_header(item);
    }
    response
}

fn plain_error(status: u16, body: &str) -> Response<std::io::Cursor<Vec<u8>>> {
    let mut response = Response::from_string(body.to_string()).with_status_code(status);
    response.add_header(header("Content-Type", "text/plain; charset=utf-8"));
    for item in document_headers() {
        response.add_header(item);
    }
    response
}

fn start_server(root: PathBuf, database: Option<PathBuf>) -> std::io::Result<u16> {
    let mut last_error = String::from("no free local port");
    for port in 47800u16..47820 {
        match Server::http(("127.0.0.1", port)) {
            Ok(server) => {
                serve_in_background(server, root, database);
                return Ok(port);
            }
            Err(error) => last_error = error.to_string(),
        }
    }
    Err(std::io::Error::new(std::io::ErrorKind::AddrInUse, last_error))
}

/// Serve one state-database request (`GET` or `PUT /__ielts_state`).
fn respond_state(mut request: tiny_http::Request, database: &Path) {
    let method = request.method().as_str().to_string();
    match method.as_str() {
        "GET" => {
            let response = match load_database_state(database) {
                Some(state) => {
                    let mut response = Response::from_string(state);
                    response.add_header(header("Content-Type", "application/json; charset=utf-8"));
                    response.add_header(header("Cache-Control", "no-store"));
                    response
                }
                None => Response::from_data(Vec::new()).with_status_code(204),
            };
            let _ = request.respond(response);
        }
        "PUT" => {
            // The state blob is a local study database of a few megabytes; cap it
            // so a stuck client cannot make the shell allocate without bound.
            const MAX_STATE_BYTES: u64 = 64 * 1024 * 1024;
            let mut body = String::new();
            let result = request
                .as_reader()
                .take(MAX_STATE_BYTES)
                .read_to_string(&mut body)
                .and_then(|_| save_database_state(database, &body).map_err(std::io::Error::other));
            let response = match result {
                Ok(()) => Response::from_data(b"ok".to_vec()).with_header(header("Content-Type", "text/plain")),
                Err(error) => {
                    log(&format!("database save error: {error}"));
                    plain_error(500, "database error")
                }
            };
            let _ = request.respond(response);
        }
        _ => {
            let _ = request.respond(plain_error(405, "Method not allowed"));
        }
    }
}

/// Serve one static file, honouring `Range` so audio playback can seek.
fn respond_file(request: tiny_http::Request, file_path: &Path) {
    let content_type = mime_for(file_path);
    let total = fs::metadata(file_path).map(|meta| meta.len()).unwrap_or(0);
    let is_head = request.method().as_str().eq_ignore_ascii_case("HEAD");

    if is_head {
        let mut response = Response::empty(200);
        response.add_header(header("Content-Type", content_type));
        response.add_header(header("Content-Length", &total.to_string()));
        response.add_header(header("Accept-Ranges", "bytes"));
        response.add_header(header("Cache-Control", "no-cache"));
        for item in document_headers() {
            response.add_header(item);
        }
        let _ = request.respond(response);
        return;
    }

    let range = header_value(&request, "range")
        .map(|value| parse_range(&value, total))
        .unwrap_or(RangeSpec::Ignore);

    if let RangeSpec::Unsatisfiable = range {
        let mut response = plain_error(416, "Requested range not satisfiable");
        response.add_header(header("Content-Range", &format!("bytes */{total}")));
        response.add_header(header("Accept-Ranges", "bytes"));
        let _ = request.respond(response);
        return;
    }

    let Ok(mut file) = File::open(file_path) else {
        log(&format!("open error {}", file_path.display()));
        let _ = request.respond(plain_error(404, "Not found"));
        return;
    };

    match range {
        RangeSpec::Satisfiable(start, end) => {
            if file.seek(std::io::SeekFrom::Start(start)).is_err() {
                let _ = request.respond(plain_error(500, "seek failed"));
                return;
            }
            let length = end - start + 1;
            let mut response = Response::new(
                tiny_http::StatusCode(206),
                Vec::new(),
                file.take(length),
                Some(length as usize),
                None,
            );
            response.add_header(header("Content-Type", content_type));
            response.add_header(header("Accept-Ranges", "bytes"));
            response.add_header(header("Content-Range", &format!("bytes {start}-{end}/{total}")));
            response.add_header(header("Cache-Control", "no-cache"));
            for item in document_headers() {
                response.add_header(item);
            }
            let _ = request.respond(response);
        }
        RangeSpec::Ignore => {
            let mut response = with_common_headers(Response::from_file(file));
            response.add_header(header("Content-Type", content_type));
            response.add_header(header("Accept-Ranges", "bytes"));
            response.add_header(header("Cache-Control", "no-cache"));
            let _ = request.respond(response);
        }
        // Handled above, before the file is opened.
        RangeSpec::Unsatisfiable => {}
    }
}

fn serve_in_background(server: Server, root: PathBuf, database: Option<PathBuf>) {
    let canonical_root = root.canonicalize().unwrap_or_else(|_| root.clone());
    thread::spawn(move || {
        for request in server.incoming_requests() {
            let raw_path = request.url().split('?').next().unwrap_or("/");
            let decoded = percent_decode(raw_path);
            let relative = if decoded == "/" { "/index.html".to_string() } else { decoded };

            if relative == "/__ielts_health" {
                let _ = request.respond(Response::from_data(b"ielts-vocab-health".to_vec()).with_header(header("Content-Type", "text/plain")));
                continue;
            }
            if relative == "/__ielts_state" {
                match database.as_ref() {
                    Some(path) => respond_state(request, path),
                    None => {
                        let _ = request.respond(plain_error(404, "Not found"));
                    }
                }
                continue;
            }

            let candidate = root.join(relative.trim_start_matches('/'));
            let resolved = candidate.canonicalize();
            match resolved {
                Ok(path) if path.starts_with(&canonical_root) && path.is_file() => respond_file(request, &path),
                _ => {
                    let _ = request.respond(plain_error(404, "Not found"));
                }
            }
        }
    });
}

fn app_already_running() -> bool {
    (47800u16..47820).any(probe_instance)
}

fn probe_instance(port: u16) -> bool {
    use std::io::{Read, Write};
    use std::net::{SocketAddr, TcpStream};
    use std::time::Duration;
    let address: SocketAddr = match format!("127.0.0.1:{port}").parse() {
        Ok(address) => address,
        Err(_) => return false,
    };
    if let Ok(mut stream) = TcpStream::connect_timeout(&address, Duration::from_millis(200)) {
        let _ = stream.set_read_timeout(Some(Duration::from_millis(700)));
        let _ = stream.set_write_timeout(Some(Duration::from_millis(700)));
        let request = b"GET /__ielts_health HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n";
        if stream.write_all(request).is_ok() {
            let mut received = Vec::new();
            let mut buffer = [0u8; 256];
            loop {
                match stream.read(&mut buffer) {
                    Ok(0) => break,
                    Ok(size) => {
                        received.extend_from_slice(&buffer[..size]);
                        if received.windows(18).any(|window| window == b"ielts-vocab-health") {
                            return true;
                        }
                        if received.len() > 4096 {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    }
    false
}

fn open_external(url: &str) {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let _ = Command::new("cmd")
            .args(["/C", "start", "", url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = url;
    }
}

fn error_page(message: &str) -> String {
    format!(
        "<!doctype html><meta charset=\"utf-8\"><title>{title}</title><body style=\"margin:0;background:#12141c;color:#e9ebf2;font:14px/1.8 'Microsoft YaHei',sans-serif;display:grid;place-items:center;height:100vh\"><div style=\"max-width:560px;padding:32px;border:1px solid #2e3446;border-radius:16px;background:#1e2230\"><h1 style=\"font-size:20px;margin:0 0 12px\">{title}</h1><p style=\"color:#98a0b3;margin:0\">{message}</p></div></body>",
        title = APP_TITLE,
        message = message
    )
}

fn default_window_size<T: 'static>(event_loop: &EventLoop<T>) -> PhysicalSize<u32> {
    let _ = event_loop;
    PhysicalSize::new(350, 450)
}

/// Pin or unpin the window, keeping it reachable either way.
///
/// A pinned window is raised with `HWND_TOPMOST`, but pinning also has to survive
/// the user switching away from the app: while unpinned the shell hides the
/// taskbar button and refuses focus, so a pinned window that nothing keeps on top
/// could still end up stranded behind a maximised window with no way back.
/// Applying `TOPMOST` on every pass re-raises the window and makes it visible
/// again, which is exactly what the pin promises.
///
/// `WS_EX_NOACTIVATE` deliberately is not part of this. It keeps a window from
/// being activated at all, which also stops Windows handing it keyboard focus:
/// with it set the page never receives key events, so the 1-4 and arrow
/// shortcuts went dead whenever the window was pinned. Staying on top does not
/// need it - `TOPMOST` plus the re-raise poll is enough - and the focused window
/// is supposed to keep its shortcuts.
fn apply_always_on_top(window: &tao::window::Window, always_on_top: bool) {
    window.set_always_on_top(always_on_top);
    #[cfg(windows)]
    unsafe {
        let hwnd = HWND(window.hwnd() as *mut _);
        let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE) as u32;
        let next = if always_on_top {
            // Pinned: keep the window out of the taskbar and out of the alt-tab
            // list. Activation stays allowed so the keyboard keeps working.
            style | WS_EX_TOOLWINDOW.0
        } else {
            // Unpinned: give the window its taskbar button back. Only the bits
            // this function owns are cleared, everything else is left alone.
            style & !(WS_EX_TOOLWINDOW.0 | WS_EX_NOACTIVATE.0)
        };
        if next != style {
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, next as isize);
        }
    }
}

/// Keep activation available on a pinned window.
///
/// Windows ORs `WS_EX_NOACTIVATE` in on its own when `WS_EX_TOOLWINDOW` is
/// applied to a window that already exists, which would leave the page without
/// keyboard focus and kill the 1-4 / arrow shortcuts while pinned. Writing the
/// style once is therefore not enough: read it back and drop the bit again.
#[cfg(windows)]
fn keep_window_activatable(window: &tao::window::Window) {
    unsafe {
        let hwnd = HWND(window.hwnd() as *mut _);
        let style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE) as u32;
        if style & WS_EX_NOACTIVATE.0 != 0 {
            let next = style & !WS_EX_NOACTIVATE.0;
            SetWindowLongPtrW(hwnd, GWL_EXSTYLE, next as isize);
        }
    }
}

fn sync_webview_bounds(webview: &wry::WebView, width: u32, height: u32, scale: f64) {
    let _ = scale;
    let _ = webview.set_bounds(wry::Rect {
        position: wry::dpi::Position::Physical(wry::dpi::PhysicalPosition::new(0, 0)),
        size: wry::dpi::Size::Physical(wry::dpi::PhysicalSize::new(width.max(1), height.max(1))),
    });
}

fn main() -> wry::Result<()> {
    #[cfg(windows)]
    unsafe {
        const PER_MONITOR_AWARE_V2: isize = -4;
        if SetProcessDpiAwarenessContext(PER_MONITOR_AWARE_V2) == 0 {
            SetProcessDPIAware();
        }
    }
    std::env::set_var("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", "--force-device-scale-factor=1");
    if app_already_running() {
        return Ok(());
    }
    let mut event_loop_builder = EventLoopBuilder::<WindowCommand>::with_user_event();
    let event_loop = event_loop_builder.build();
    let event_proxy = event_loop.create_proxy();
    // The IPC handler takes ownership of `event_proxy`; the pin watcher thread
    // needs its own handle on the same loop.
    let outer_pin_proxy = event_proxy.clone();
    // Tracks what the window manager was last told, so the watcher thread has
    // something to poll and the page can ask for the truth on load.
    let always_on_top = Cell::new(false);
    let bounds = load_bounds();
    let mut window_builder = WindowBuilder::new()
        .with_title(APP_TITLE)
        .with_transparent(true)
        .with_decorations(false)
        .with_resizable(true)
        .with_min_inner_size(LogicalSize::new(MIN_WIDTH, MIN_HEIGHT));
    #[cfg(windows)]
    {
        window_builder = window_builder
            .with_no_redirection_bitmap(true)
            .with_undecorated_shadow(false);
    }
    if let Ok(icon) = tao::window::Icon::from_rgba(include_bytes!("../icon.rgba").to_vec(), 64, 64) {
        window_builder = window_builder.with_window_icon(Some(icon));
    }
    window_builder = match bounds {
        Some(saved) => window_builder
            .with_inner_size(PhysicalSize::new(saved.width.max(MIN_WIDTH as u32), saved.height.max(MIN_HEIGHT as u32)))
            .with_position(PhysicalPosition::new(saved.x, saved.y)),
        None => window_builder.with_inner_size(default_window_size(&event_loop)),
    };
    let window = window_builder.build(&event_loop).expect("failed to create window");
    if bounds.is_some() {
        // Only a restored position can be stale; a fresh default window is fine.
        ensure_window_on_screen(&window);
    }
    #[cfg(windows)]
    let composition_host = create_composition_host(window.hwnd()).expect("failed to create DirectComposition host");
    let webview = if let Some(root) = find_root() {
        match start_server(root.clone(), database_path()) {
            Ok(port) => {
                let origin = format!("http://127.0.0.1:{port}");
                log(&format!("root={} port={port}", root.display()));
                let url = format!("{origin}/index.html");
                let origin_for_nav = origin.clone();
                let glass_proxy = event_proxy.clone();
                let builder = WebViewBuilder::new()
                    .with_url(&url)
                    .with_transparent(true)
                    .with_background_color((0, 0, 0, 0))
                    .with_ipc_handler(move |request| {
                        let body = request.body();
                        let event = if body == "glass:on" {
                            Some(WindowCommand::SetGlass(true))
                        } else if body == "glass:off" {
                            Some(WindowCommand::SetGlass(false))
                        } else if body.starts_with("page-log:") {
                            log(&format!("PAGE {}", &body[9..]));
                            None
                        } else { match body.as_str() {
                            "window:minimize" => Some(WindowCommand::Minimize),
                            "window:maximize" => Some(WindowCommand::ToggleMaximize),
                            "window:close" => Some(WindowCommand::Close),
                            "window:drag" => Some(WindowCommand::Drag),
                            "window:pin-on" => Some(WindowCommand::SetAlwaysOnTop(true)),
                            "window:pin-off" => Some(WindowCommand::SetAlwaysOnTop(false)),
                            "window:pin-query" => Some(WindowCommand::QueryAlwaysOnTop),
                            _ => None,
                        }};
                        if let Some(event) = event {
                            let proxy = if matches!(event, WindowCommand::SetGlass(_)) { &glass_proxy } else { &event_proxy };
                            let _ = proxy.send_event(event);
                        }
                    })
                    .with_navigation_handler(move |target| {
                        if target.starts_with(&origin_for_nav) {
                            true
                        } else {
                            if target.starts_with("http://") || target.starts_with("https://") {
                                open_external(&target);
                            }
                            false
                        }
                    })
                    .with_new_window_req_handler(move |target, _features| {
                        if target.starts_with("http://") || target.starts_with("https://") {
                            open_external(&target);
                        }
                        NewWindowResponse::Deny
                    });
                #[cfg(windows)]
                let builder = builder.with_composition_visual_target(composition_host.visual.cast()?);
                builder.build(&window)?
            }
            Err(error) => {
                log(&format!("server error: {error}"));
                let builder = WebViewBuilder::new()
                    .with_html(error_page("本地服务启动失败，请重新打开程序。"))
                    .with_transparent(true)
                    .with_background_color((0, 0, 0, 0));
                #[cfg(windows)]
                let builder = builder.with_composition_visual_target(composition_host.visual.cast()?);
                builder.build(&window)?
            }
        }
    } else {
        log("web root not found");
        let builder = WebViewBuilder::new()
            .with_html(error_page(
                "未找到学习资料。请把本程序放在包含 index.html、app.js 和 ielts 文件夹的目录中，不要单独移动 exe。",
            ))
            .with_transparent(true)
            .with_background_color((0, 0, 0, 0));
        #[cfg(windows)]
        let builder = builder.with_composition_visual_target(composition_host.visual.cast()?);
        builder.build(&window)?
    };

    #[cfg(windows)]
    unsafe {
        composition_host.device.Commit()?;
        composition_host.device.WaitForCommitCompletion()?;
    }

    let initial_size = window.inner_size();
    sync_webview_bounds(&webview, initial_size.width, initial_size.height, window.scale_factor());
    // The caller cannot supply a WndProc, so a pinned window would have no way to
    // notice it is sinking behind another window. Watch for that instead and
    // re-raise it; the poll is cheap and only runs while the pin is on.
    #[cfg(windows)]
    let pin_proxy = outer_pin_proxy;
    thread::spawn(move || loop {
        thread::sleep(std::time::Duration::from_millis(PIN_POLL_MS));
        if pin_proxy.send_event(WindowCommand::EnsureAlwaysOnTop).is_err() {
            break;
        }
    });
    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;
        match event {
            Event::UserEvent(WindowCommand::SetGlass(enabled)) => {
                log(&format!("glass page state enabled={enabled} composition=true"));
            }
            Event::UserEvent(WindowCommand::Minimize) => window.set_minimized(true),
            Event::UserEvent(WindowCommand::ToggleMaximize) => {
                if window.is_maximized() { window.set_maximized(false); } else { window.set_maximized(true); }
            }
            Event::UserEvent(WindowCommand::Close) => *control_flow = ControlFlow::Exit,
            Event::UserEvent(WindowCommand::Drag) => {
                #[cfg(windows)] unsafe {
                    const WM_NCLBUTTONDOWN: u32 = 0x00A1;
                    const HTCAPTION: usize = 2;
                    ReleaseCapture();
                    SendMessageW(window.hwnd(), WM_NCLBUTTONDOWN, HTCAPTION, 0);
                }
            }
            Event::UserEvent(WindowCommand::SetAlwaysOnTop(enabled)) => {
                always_on_top.set(enabled);
                apply_always_on_top(&window, enabled);
                keep_window_activatable(&window);
                log(&format!("window pin enabled={enabled}"));
                webview.evaluate_script(&format!(
                    "window.__pinReport && window.__pinReport({});",
                    if enabled { "true" } else { "false" }
                )).ok();
            }
            Event::UserEvent(WindowCommand::QueryAlwaysOnTop) => {
                let enabled = always_on_top.get();
                webview.evaluate_script(&format!(
                    "window.__pinReport && window.__pinReport({});",
                    if enabled { "true" } else { "false" }
                )).ok();
            }
            Event::UserEvent(WindowCommand::EnsureAlwaysOnTop) => {
                if always_on_top.get() {
                    apply_always_on_top(&window, true);
                    keep_window_activatable(&window);
                }
            }
            Event::WindowEvent { event: WindowEvent::CloseRequested, .. } => {
                let size = window.inner_size();
                let position = window.outer_position().unwrap_or(PhysicalPosition::new(0, 0));
                save_bounds(Bounds { width: size.width, height: size.height, x: position.x, y: position.y });
                *control_flow = ControlFlow::Exit;
            }
            Event::WindowEvent { event: WindowEvent::Resized(size), .. } => {
                sync_webview_bounds(&webview, size.width, size.height, window.scale_factor());
            }
            Event::WindowEvent { event: WindowEvent::ScaleFactorChanged { .. }, .. } => {
                let size = window.inner_size();
                sync_webview_bounds(&webview, size.width, size.height, window.scale_factor());
            }
            _ => {}
        }
    });
}
