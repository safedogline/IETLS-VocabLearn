const STORAGE_KEY = "cixu-desktop-v1";
const BACKUP_DB = "cixu-progress-backup";
const BACKUP_STORE = "state";
const STATE_API = "./__ielts_state";
const DAY = 86400000;
const IELTS_BOOK_ID = "ielts-zhenjing-local";
const DEFAULT_SETTINGS = {
  groupSize: 20,
  globalFontSize: 0,
  vocabularyStart: 1,
  vocabularyCategory: "all",
  reviewChunk: 100,
  accent: "uk",
  autoPronounce: true,
  spellHint: true,
  splitMnemonic: true,
  confuseAnalyze: true,
  listeningQuiz: false,
  showSyllableMarks: true,
  theme: "light",
  glassOpacity: 0.82,
  glassEnabled: true,
  glassMigrated: false,
  alwaysOnTop: false,
  chineseFont: "noto-sans",
  englishFont: "arial",
  followSystem: false,
  mnemonicOrder: ["phrase", "variant", "root", "derive", "note", "synonym"],
};
const FONT_OPTIONS = {
  chinese: {
    "noto-sans": { label: "思源黑体 / 微软雅黑", local: ["Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", "微软雅黑", "PingFang SC"] },
    "yahei": { label: "微软雅黑", local: ["Microsoft YaHei", "微软雅黑", "Noto Sans CJK SC", "PingFang SC"] },
    "noto-serif": { label: "思源宋体 / 宋体", local: ["Noto Serif CJK SC", "Source Han Serif SC", "SimSun", "宋体", "Songti SC"] },
    "songti": { label: "宋体", local: ["SimSun", "宋体", "Songti SC", "Noto Serif CJK SC"] },
    "kaiti": { label: "楷体", local: ["KaiTi", "楷体", "STKaiti", "Noto Serif CJK SC"] },
  },
  english: {
    "arial": { label: "Arial", local: ["Arial", "Liberation Sans"] },
    "times-new-roman": { label: "Times New Roman", local: ["Times New Roman", "Liberation Serif"] },
    "georgia": { label: "Georgia", local: ["Georgia", "Liberation Serif"] },
    "verdana": { label: "Verdana", local: ["Verdana", "DejaVu Sans"] },
    "inter": { label: "Inter", local: ["Inter", "Segoe UI", "Arial"] },
  },
};
const TAB_LABELS = { phrase: "词组搭配", variant: "特殊变形", root: "词根", derive: "派生", note: "笔记", synonym: "近义" };
const NAV_TITLES = { home: "今日学习", review: "复习队列", listen: "随身听", listening: "听力 179", dict: "词典", words: "词书浏览", sentences: "例句库", materials: "资料", settings: "学习偏好", appearance: "外观" };
const sampleBook = {
  id: "starter-01", name: "入门示例词书", category: "示例", createdAt: Date.now(), words: [
    { word: "abundant", meaning: "大量的；充裕的", phonetic: "/əˈbʌndənt/", example: "The region has abundant natural resources.", translation: "这个地区自然资源丰富。" },
    { word: "accomplish", meaning: "完成；实现", phonetic: "/əˈkʌmplɪʃ/", example: "She accomplished everything she had planned.", translation: "她完成了计划中的所有事情。" },
    { word: "adapt", meaning: "适应；改编", phonetic: "/əˈdæpt/", example: "It takes time to adapt to a new environment.", translation: "适应新环境需要时间。" },
    { word: "adequate", meaning: "足够的；合格的", phonetic: "/ˈædɪkwət/", example: "The room was small but adequate.", translation: "房间虽小，但够用。" },
    { word: "advocate", meaning: "提倡；拥护；倡导者", phonetic: "/ˈædvəkeɪt/", example: "Many people advocate public transport.", translation: "许多人提倡公共交通。" },
    { word: "allocate", meaning: "分配；拨出", phonetic: "/ˈæləkeɪt/", example: "The school allocated funds for new books.", translation: "学校拨款购置新书。" },
    { word: "ambiguous", meaning: "模棱两可的；含糊的", phonetic: "/æmˈbɪɡjuəs/", example: "The instructions were deliberately ambiguous.", translation: "说明是故意写得含糊的。" },
    { word: "assess", meaning: "评估；评价", phonetic: "/əˈses/", example: "We need to assess the impact of the change.", translation: "我们需要评估这项变化的影响。" },
    { word: "capacity", meaning: "能力；容量", phonetic: "/kəˈpæsəti/", example: "The hall has a seating capacity of 500.", translation: "大厅可容纳 500 名观众。" },
    { word: "coherent", meaning: "连贯的；有条理的", phonetic: "/koʊˈhɪrənt/", example: "She gave a clear and coherent explanation.", translation: "她的解释清晰且有条理。" },
    { word: "consecutive", meaning: "连续的；连贯的", phonetic: "/kənˈsekjətɪv/", example: "It rained for three consecutive days.", translation: "雨连续下了三天。" },
    { word: "considerable", meaning: "相当大的；重要的", phonetic: "/kənˈsɪdərəbl/", example: "The project requires considerable effort.", translation: "这个项目需要相当大的努力。" },
    { word: "contribute", meaning: "贡献；促成；投稿", phonetic: "/kənˈtrɪbjuːt/", example: "Regular exercise contributes to good health.", translation: "经常锻炼有助于身体健康。" },
    { word: "decline", meaning: "下降；拒绝；衰退", phonetic: "/dɪˈklaɪn/", example: "The number of visitors declined last year.", translation: "去年访客数量有所下降。" },
    { word: "diverse", meaning: "多样的；不同的", phonetic: "/daɪˈvɜːrs/", example: "The city has a culturally diverse population.", translation: "这座城市的人口具有多元文化背景。" },
    { word: "emerge", meaning: "出现；显露；兴起", phonetic: "/ɪˈmɜːrdʒ/", example: "New evidence emerged during the investigation.", translation: "调查期间出现了新的证据。" },
    { word: "essential", meaning: "必不可少的；本质的", phonetic: "/ɪˈsenʃl/", example: "Water is essential for all forms of life.", translation: "水对所有生命形式都不可或缺。" },
    { word: "evaluate", meaning: "评估；评价", phonetic: "/ɪˈvæljueɪt/", example: "Teachers evaluate students throughout the course.", translation: "教师在整个课程期间评估学生。" },
    { word: "impact", meaning: "影响；冲击", phonetic: "/ˈɪmpækt/", example: "Technology has had a major impact on communication.", translation: "科技对沟通方式产生了重大影响。" },
    { word: "indicate", meaning: "表明；指出；暗示", phonetic: "/ˈɪndɪkeɪt/", example: "The results indicate a change in public opinion.", translation: "结果表明公众意见发生了变化。" },
    { word: "maintain", meaning: "维持；保养；坚持认为", phonetic: "/meɪnˈteɪn/", example: "It is important to maintain a balanced diet.", translation: "保持均衡饮食很重要。" },
    { word: "occur", meaning: "发生；出现；被想到", phonetic: "/əˈkɜːr/", example: "The accident occurred shortly after midnight.", translation: "事故发生在午夜刚过不久。" },
    { word: "significant", meaning: "显著的；重要的", phonetic: "/sɪɡˈnɪfɪkənt/", example: "There has been a significant improvement.", translation: "情况有了显著改善。" },
    { word: "vary", meaning: "变化；使多样化", phonetic: "/ˈveri/", example: "Prices vary according to the season.", translation: "价格随季节变化。" }
  ]
};

let session = null;
let localStateAvailable = false;
let state = loadState();
let currentView = "home";
let currentBookId = session?.sourceBookId || state.activeBookId || state.books[0]?.id || null;
let searchQuery = "";
let scopeSearchQuery = "";
let wordFilter = "all";
let dictQuery = "";
let dictTab = "collins";
let dictSelected = null;
let orderOpen = false;
let toastTimer;
let noteTimer;
let listen = { index: 0, playing: false, sleepMinutes: 0, sleepTimer: null, audio: null };
let listeningData = [];
let listeningState = { index: 0, revealed: false, result: null, typedWord: "", typedSyn: "", message: "" };
let readingGroups = [];
let writingSentences = [];
let readingSynonyms = new Map();
let materialManifest = { grammar: [] };
let materialTab = "writing";
let materialsMessage = "";
let phoneticsMap = {};
let syllablesMap = {};
let sidebarCollapsed = localStorage.getItem("cixu-sidebar") === "1";
let databaseAvailable = false;
let databaseSaveTimer;
let databaseSaveQueue = Promise.resolve();
// The shell only knows a window-level fact; ask it once at startup instead of
// trusting the cached setting, because the window may be restored pinned from the
// previous run while this copy of the page could be stale.
function requestPinnedState() {
  if (!isNativeShell()) return;
  window.ipc?.postMessage("window:pin-query");
}
// A pinned window should still be pinned after a reload, so the saved setting is
// pushed back to the shell on startup; the shell answers through __pinReport,
// which keeps the button honest if it disagrees.
function restorePinnedWindow() {
  if (!isNativeShell() || !state.settings.alwaysOnTop) { renderShell(); return; }
  window.ipc?.postMessage("window:pin-on");
  renderShell();
}
function syncNativeGlass(enabled) {
  // Always push the state instead of trusting a cached flag: after the window is
  // recreated or DWM drops the effect, a stale "already synced" value would
  // silently skip the IPC and leave the window opaque.
  window.ipc?.postMessage(`glass:${enabled ? "on" : "off"}`);
}
function reportGlassState(tag) {
  try {
    const cs = getComputedStyle(document.body);
    const shell = document.querySelector(".app-shell");
    const info = shell ? ` shell=${getComputedStyle(shell).backgroundColor}` : " shell=missing";
    window.ipc?.postMessage(`page-log:${tag} glass=${document.body.dataset.glass} enabled=${state.settings.glassEnabled} opacity=${state.settings.glassOpacity} bodyBg=${cs.backgroundColor}${info}`);
  } catch (error) { window.ipc?.postMessage(`page-log:${tag} error=${error.message}`); }
}
document.addEventListener("keydown", event => {
  if (event.key === "Alt") window.__altDown = true;
});
document.addEventListener("keyup", event => {
  if (event.key === "Alt") window.__altDown = false;
});
window.addEventListener("blur", () => { window.__altDown = false; });
// The desktop shell is frameless, so dragging needs an explicit trigger. The
// grip in the window bar covers the ordinary case; holding Alt over any page
// content keeps working as the original shortcut.
// Must be mousedown, not click: the Rust side answers with
// WM_NCLBUTTONDOWN/HTCAPTION, whose modal loop starts immediately and ends on
// button release, so a click would only arrive after the drag is over.
document.addEventListener("mousedown", event => {
  if (event.button !== 0) return;
  if (event.target.closest('[data-window="drag"]')) { event.preventDefault(); window.ipc?.postMessage("window:drag"); return; }
  if (window.__altDown) window.ipc?.postMessage("window:drag");
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = JSON.parse(raw);
    if (saved && Array.isArray(saved.books) && saved.reviews) {
      localStateAvailable = true;
      saved.records = saved.records || {};
      saved.daily = saved.daily || {};
      saved.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
      if (!saved.settings.glassMigrated) { saved.settings.glassEnabled = true; saved.settings.glassMigrated = true; }
      saved.notes = saved.notes || {};
      saved.favoriteWords = saved.favoriteWords || [];
      saved.favoriteSentences = saved.favoriteSentences || [];
      saved.likes = saved.likes || {};
      saved.known = saved.known || {};
      saved.checkins = saved.checkins || [];
      saved.listening = saved.listening || { index: 0, done: {} };
      saved.listening.done = saved.listening.done || {};
      if (saved.session?.queue?.length) session = saved.session;
      return saved;
    }
    if (raw != null) backupDamagedState(raw);
  } catch (error) {
    console.warn("Could not read saved study data", error);
    const damaged = localStorage.getItem(STORAGE_KEY);
    if (damaged) backupDamagedState(damaged);
  }
  return { books: [sampleBook], records: {}, reviews: {}, daily: {}, notes: {}, favoriteWords: [], favoriteSentences: [], likes: {}, known: {}, checkins: [], listening: { index: 0, done: {} }, activeBookId: sampleBook.id, settings: { ...DEFAULT_SETTINGS } };
}
function backupDamagedState(raw) {
  try {
    localStorage.setItem("cixu-desktop-backup", raw);
    setTimeout(() => toast("学习数据读取失败，原始数据已备份到本地；请勿清除浏览器数据"), 0);
  } catch (error) { console.warn("Could not back up damaged study data", error); }
}
async function loadIeltsBook(attempt = 0) {
  try {
    const module = await import("./ielts/src/pages/vocabulary/vocabulary.js");
    const words = Object.entries(module.default).flatMap(([category, chapter]) => chapter.words.flatMap((group, groupIndex) => group.map((item, wordIndex) => ({
      word: item.word.join(" / "),
      variants: item.word,
      meaning: item.meaning || "",
      partOfSpeech: item.pos || "",
      example: item.example || "",
      exampleTranslation: item.translation || item.exampleTranslation || "",
      syllables: item.syllables || item.syllable || "",
      extra: item.extra && item.extra !== "-" ? item.extra : "",
      category,
      groupNumber: groupIndex + 1,
      groupPosition: wordIndex + 1,
      // `groupWords` is deliberately NOT stored: it is identical for every word
      // in a group and costs ~147 KB of the 1.48 MB book payload. groupWordsOf()
      // rebuilds it from category+groupNumber on demand. Same for `audio`:
      // the referenced mp3 files are not distributed, so the path is derived in
      // wordAudioPath() instead of being written 3674 times (~300 KB).
    }))));
    if (!words.length) return;
    const book = { id: IELTS_BOOK_ID, name: "雅思词汇真经", category: "22 个主题", createdAt: 0, words };
    const existingIndex = state.books.findIndex(item => item.id === IELTS_BOOK_ID);
    if (existingIndex < 0) state.books.unshift(book);
    else state.books[existingIndex] = book;
    if (!state.activeBookId || state.activeBookId === "starter-01") currentBookId = IELTS_BOOK_ID;
    syncVocabularyStart(book);
    persist(); renderShell();
  } catch (error) {
    if (attempt < 1) { setTimeout(() => loadIeltsBook(attempt + 1), 1200); return; }
    console.warn("IELTS vocabulary source is unavailable", error);
    toast("雅思词书加载失败：请通过本地服务器打开项目");
  }
}
function persist() {
  state.activeBookId = currentBookId;
  if (session?.queue?.length) state.session = session;
  else delete state.session;
  const serialized = JSON.stringify(state);
  try { localStorage.setItem(STORAGE_KEY, serialized); }
  catch (error) { toast("本地存储空间不足，请先导出备份"); }
  saveIndexedState(serialized);
  if (databaseAvailable) {
    clearTimeout(databaseSaveTimer);
    databaseSaveTimer = setTimeout(() => saveDatabaseState(serialized), 80);
  }
}
function openBackupDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(BACKUP_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveIndexedState(serialized) {
  try {
    const db = await openBackupDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(BACKUP_STORE, "readwrite");
      transaction.objectStore(BACKUP_STORE).put(serialized, "latest");
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch (error) { /* IndexedDB may be unavailable in restricted contexts. */ }
}
async function readIndexedState() {
  try {
    const db = await openBackupDatabase();
    const serialized = await new Promise((resolve, reject) => {
      const request = db.transaction(BACKUP_STORE, "readonly").objectStore(BACKUP_STORE).get("latest");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    const saved = typeof serialized === "string" ? JSON.parse(serialized) : null;
    return saved && Array.isArray(saved.books) && saved.reviews ? saved : null;
  } catch (error) { return null; }
}
async function restoreIndexedState() {
  const saved = await readIndexedState();
  if (!saved) return false;
  state = normalizeState(saved);
  session = state.session?.queue?.length ? state.session : null;
  currentBookId = state.activeBookId || state.books[0]?.id || null;
  applyTheme();
  renderShell();
  return true;
}
function saveDatabaseState(serialized, keepalive = false) {
  if (keepalive) return fetch(STATE_API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: serialized, keepalive: true }).catch(() => {});
  databaseSaveQueue = databaseSaveQueue.catch(() => {}).then(() => fetch(STATE_API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: serialized,
    keepalive: false,
  })).catch(() => { databaseAvailable = false; });
  return databaseSaveQueue;
}
window.addEventListener("pagehide", () => {
  clearTimeout(databaseSaveTimer);
  if (!databaseAvailable) return;
  state.activeBookId = currentBookId;
  if (session?.queue?.length) state.session = session;
  else delete state.session;
  saveDatabaseState(JSON.stringify(state), true);
});

async function loadDatabaseState() {
  try {
    const response = await fetch(STATE_API, { cache: "no-store" });
    if (!response.ok) { await restoreIndexedState(); return; }
    databaseAvailable = true;
    if (response.status === 204) {
      const hasLocalProgress = localStateAvailable && (Object.keys(state.records || {}).length > 0 || session?.queue?.length);
      if (hasLocalProgress) saveDatabaseState(JSON.stringify(state));
      else await restoreIndexedState();
      return;
    }
    const saved = await response.json();
    if (!saved || !Array.isArray(saved.books) || !saved.reviews) return;
    state = normalizeState(saved);
    session = state.session?.queue?.length ? state.session : null;
    currentBookId = state.activeBookId || state.books[0]?.id || null;
    applyTheme();
    renderShell();
  } catch (error) { await restoreIndexedState(); }
}

function normalizeState(saved) {
  saved.records = saved.records || {};
  saved.daily = saved.daily || {};
  saved.settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}) };
  if (!saved.settings.glassMigrated) { saved.settings.glassEnabled = true; saved.settings.glassMigrated = true; }
  saved.notes = saved.notes || {};
  saved.favoriteWords = saved.favoriteWords || [];
  saved.favoriteSentences = saved.favoriteSentences || [];
  saved.likes = saved.likes || {};
  saved.known = saved.known || {};
  saved.checkins = saved.checkins || [];
  saved.listening = saved.listening || { index: 0, done: {} };
  saved.listening.done = saved.listening.done || {};
  return saved;
}
function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
function todayKey() { return dateKey(new Date()); }
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function currentBook() { return state.books.find(book => book.id === currentBookId) || state.books[0]; }
function recordKey(bookId, word) { return `${bookId}:${word.word.toLowerCase()}`; }
function bookIdFor(word) { return word?._bookId || session?.bookId || currentBookId; }
function getRecord(bookId, word) {
  const key = recordKey(bookId, word);
  if (!state.records[key]) state.records[key] = { box: 0, dueAt: 0, seen: 0, correct: 0, wrong: 0, lastSeen: 0 };
  return state.records[key];
}
function isKnown(word, bookId = bookIdFor(word)) { return Boolean(state.known[recordKey(bookId, word)]); }
function likeCount(word, bookId = bookIdFor(word)) { return state.likes[recordKey(bookId, word)] || 0; }
// A book's words, indexed by lowercased spelling. Rebuilt lazily per book object
// and cached in a WeakMap, so replacing or deleting a book invalidates the index
// automatically. Without this, dueWords() and collocationsOf() did a linear
// `words.find()` inside another linear loop (O(n^2) over 3674 words).
const wordLookup = new WeakMap();
function wordIndex(book) {
  if (!book || !Array.isArray(book.words)) return new Map();
  let index = wordLookup.get(book);
  if (!index) {
    index = new Map();
    for (const word of book.words) {
      const key = String(word.word).toLowerCase();
      // First occurrence wins, matching the `find()` semantics this replaces.
      if (!index.has(key)) index.set(key, word);
    }
    wordLookup.set(book, index);
  }
  return index;
}
function findWord(text, bookId = currentBookId) {
  return wordIndex(state.books.find(book => book.id === bookId)).get(String(text).toLowerCase());
}
function dueWords(bookId = currentBookId) {
  const now = Date.now();
  const index = wordIndex(state.books.find(book => book.id === bookId));
  return (state.reviews[bookId] || []).map(item => ({ item, word: index.get(String(item.word).toLowerCase()) })).filter(entry => entry.word && entry.item.dueAt <= now && !isKnown(entry.word, bookId)).sort((a, b) => a.item.dueAt - b.item.dueAt);
}
function bookStats(book) {
  // Read records directly instead of calling getRecord(), which minted an empty
  // record for every word and bloated both state.records and every saved payload.
  const records = book.words.map(word => state.records[recordKey(book.id, word)]).filter(Boolean);
  const known = book.words.filter(word => isKnown(word, book.id)).length;
  const learned = records.filter(record => record.box > 0).length;
  const due = dueWords(book.id).length;
  const introducedToday = records.filter(record => record.introducedAt && new Date(record.introducedAt).toDateString() === new Date().toDateString()).length;
  return { learned, due, introducedToday, known };
}
function allDue() { return state.books.reduce((sum, book) => sum + dueWords(book.id).length, 0); }
// The word's group (the textbook cluster it came from). Stored books may carry
// `groupWords` directly (imported reading books do); the built-in IELTS book does
// not, so the group is reconstructed once per book from category + groupNumber.
const groupLookup = new WeakMap();
function groupWordsOf(word) {
  if (Array.isArray(word?.groupWords)) return word.groupWords;
  if (!word || !word.groupNumber) return [];
  const book = state.books.find(item => item.id === bookIdFor(word));
  if (!book) return [];
  let groups = groupLookup.get(book);
  if (!groups) {
    groups = new Map();
    for (const entry of book.words) {
      if (!entry.groupNumber) continue;
      const key = `${entry.category}|${entry.groupNumber}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(entry.word);
    }
    groupLookup.set(book, groups);
  }
  return groups.get(`${word.category}|${word.groupNumber}`) || [];
}
// Audio for the built-in wordbook: the theme-level mp3 files are not
// redistributed with this project, so this path normally 404s and playAudio()
// falls back to speech synthesis. Derived rather than stored (see loadIeltsBook).
function wordAudioPath(word) {
  if (word?.audio) return word.audio;
  if (!word?.category) return "";
  const head = String(word.word).split(" / ")[0];
  return `/ielts/public/vocabulary/audio/${encodeURIComponent(word.category)}/${encodeURIComponent(head)}.mp3`;
}
function todayStats() { return state.daily[todayKey()] || { learned: 0, reviewed: 0, seconds: 0 }; }
function totalMinutes() { return Math.round(Object.values(state.daily).reduce((sum, day) => sum + (day.seconds || 0), 0) / 60); }
function masteredCount() { return Object.values(state.records).filter(record => record.box >= 3).length + Object.keys(state.known).length; }
function streakDays() {
  const set = new Set(state.checkins);
  const cursor = new Date();
  if (!set.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(dateKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
function addSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;
  const today = state.daily[todayKey()] || (state.daily[todayKey()] = { learned: 0, reviewed: 0, seconds: 0 });
  today.seconds = (today.seconds || 0) + Math.min(seconds, 3600);
}
function escapeCsvRow(line, delimiter) {
  const result = []; let field = ""; let quoted = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"' && quoted && line[index + 1] === '"') { field += '"'; index++; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { result.push(field.trim()); field = ""; }
    else field += char;
  }
  result.push(field.trim()); return result;
}
function parseImport(text, fileName) {
  if (fileName.toLowerCase().endsWith(".json") || /^[\s]*[\[{]/.test(text)) {
    const parsed = JSON.parse(text);
    const source = Array.isArray(parsed) ? parsed : parsed.words;
    if (!Array.isArray(source)) throw new Error("JSON 需要是词条数组，或含 words 数组的对象");
    return { name: parsed.name || fileName.replace(/\.[^.]+$/, ""), words: source.map(item => item && typeof item === "object" && !Array.isArray(item) ? normalizeWord(item) : null) };
  }
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) throw new Error("文件中没有词条");
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const rows = lines.map(line => escapeCsvRow(line, delimiter));
  const headerNames = ["word", "term", "headword", "meaning", "definition", "translation", "example", "sentence", "phonetic", "audio", "category"];
  const first = rows[0].map(value => value.toLowerCase());
  const hasHeader = first.some(value => headerNames.includes(value));
  const headers = hasHeader ? first : ["word", "meaning", "example", "translation", "phonetic", "audio", "category"];
  const records = rows.slice(hasHeader ? 1 : 0).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
  return { name: fileName.replace(/\.[^.]+$/, ""), words: records.map(normalizeWord) };
}
// Import guard rails: the file picker accepts arbitrary user files, so every
// field is bounded before it enters state and reaches localStorage.
const MAX_IMPORT_WORDS = 20000;
const MAX_FIELD_CHARS = 2000;
const MAX_BOOKS = 60;
const MAX_JSON_BYTES = 32 * 1024 * 1024;
function clampText(value) {
  return String(value ?? "").trim().slice(0, MAX_FIELD_CHARS);
}
function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function normalizeWord(item) {
  if (!isPlainObject(item)) return null;
  const get = (...keys) => { for (const key of keys) { const text = clampText(item[key]); if (text) return text; } return ""; };
  const meaning = get("meaning", "definition", "translation", "释义", "中文", "意思");
  const phonetic = get("phonetic", "pronunciation", "音标");
  const audio = get("audio", "audioUrl", "audio_url", "发音");
  const category = get("category", "group", "unit", "分类", "单元");
  const exampleTranslation = get("exampleTranslation", "example_translation", "translationExample", "例句翻译");
  return {
    word: get("word", "term", "headword", "单词", "词条", "英文"),
    meaning,
    example: get("example", "sentence", "例句"),
    exampleTranslation,
    syllables: get("syllables", "syllable", "音节"),
    // Imported files only carry one Chinese gloss, so both fields share it.
    translation: meaning,
    phonetic,
    audio,
    category,
  };
}
function applyTheme() {
  const theme = state.settings.followSystem ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "deep" : "light") : state.settings.theme;
  document.body.dataset.theme = theme || "deep";
  const chineseFont = FONT_OPTIONS.chinese[state.settings.chineseFont] || FONT_OPTIONS.chinese[DEFAULT_SETTINGS.chineseFont];
  const englishFont = FONT_OPTIONS.english[state.settings.englishFont] || FONT_OPTIONS.english[DEFAULT_SETTINGS.englishFont];
  let fontStyle = document.getElementById("selected-font-faces");
  if (!fontStyle) { fontStyle = document.createElement("style"); fontStyle.id = "selected-font-faces"; document.head.append(fontStyle); }
  const face = (locals, range, generic) => `@font-face{font-family:"VocabLearnMixed";src:${locals.map(name => `local("${name}")`).join(",")};unicode-range:${range};font-weight:100 900;font-style:normal}`;
  fontStyle.textContent = `${face(englishFont.local, "U+0000-024F", "sans-serif")}${face(chineseFont.local, "U+2E80-2EFF,U+3000-303F,U+31C0-31EF,U+3200-32FF,U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+FE30-FE4F,U+FF00-FFEF", "sans-serif")}`;
  document.documentElement.style.setProperty("--global-font-size", `${state.settings.globalFontSize || 0}px`);
  const glassOpacity = state.settings.glassEnabled ? Math.max(0, Math.min(1, Number(state.settings.glassOpacity ?? DEFAULT_SETTINGS.glassOpacity))) : 1;
  document.documentElement.style.setProperty("--glass-opacity", glassOpacity);
  document.documentElement.style.setProperty("--glass-alpha", `${Math.round(glassOpacity * 100)}%`);
  document.body.dataset.glassOpacity = String(Math.round(glassOpacity * 100));
  document.body.dataset.glass = !state.settings.glassEnabled || glassOpacity === 1 ? "off" : glassOpacity === 0 ? "clear" : "on";
  syncNativeGlass(Boolean(state.settings.glassEnabled));
  reportGlassState("applyTheme");
}
function applySidebar() {
  document.body.dataset.sidebar = sidebarCollapsed ? "collapsed" : "expanded";
  const button = document.getElementById("sidebar-toggle");
  if (button) {
    button.textContent = sidebarCollapsed ? "»" : "☰";
    button.title = sidebarCollapsed ? "展开侧栏" : "收起侧栏";
    button.setAttribute("aria-label", button.title);
  }
}
// True only inside the desktop shell, which exposes window.ipc. The browser
// build must not gain the window bar (it would overlap the normal page).
function isNativeShell() {
  return Boolean(window.ipc?.postMessage);
}
function applyNativeChrome() {
  if (isNativeShell()) document.body.dataset.native = "on";
  else delete document.body.dataset.native;
  reflectPinnedWindow();
}
// The shell owns the real pin state: it survives a page reload and the window
// manager can change it. The button therefore only mirrors what the shell last
// reported through window.__pinReport, and pressing it sends a request.
function reflectPinnedWindow() {
  const button = document.querySelector('[data-action="pin-window"]');
  if (!button) return;
  const pinned = Boolean(state.settings.alwaysOnTop);
  button.setAttribute("aria-pressed", pinned ? "true" : "false");
  button.title = pinned ? "取消置顶" : "固定在其它窗口之上";
  button.setAttribute("aria-label", button.title);
}
function togglePinWindow() {
  if (!isNativeShell()) return toast("浏览器打开时无法置顶窗口");
  state.settings.alwaysOnTop = !state.settings.alwaysOnTop;
  window.ipc?.postMessage(state.settings.alwaysOnTop ? "window:pin-on" : "window:pin-off");
  reflectPinnedWindow();
  persist();
  toast(state.settings.alwaysOnTop ? "窗口已置顶" : "已取消置顶");
}
// Called from Rust after every pin change, so the UI can never drift from the
// window manager, for example when the pin is restored on startup.
window.__pinReport = pinned => {
  if (state.settings.alwaysOnTop === Boolean(pinned)) return;
  state.settings.alwaysOnTop = Boolean(pinned);
  reflectPinnedWindow();
};
function renderShell() {
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === currentView));
  document.getElementById("review-nav-count").textContent = allDue();
  renderSidebarBooks();
  if (currentView === "home") renderHome();
  if (currentView === "review") renderReview();
  if (currentView === "words") renderWords();
  if (currentView === "listen") renderListen();
  if (currentView === "listening") renderListening();
  if (currentView === "dict") renderDict();
  if (currentView === "sentences") renderSentences();
  if (currentView === "materials") renderMaterials();
  if (currentView === "settings") renderSettings();
  if (currentView === "appearance") renderAppearance();
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active-view", view.id === `view-${currentView}`));
}
function renderSidebarBooks() {
  const target = document.getElementById("book-list");
  if (!target) return;
  if (!state.books.length) { target.innerHTML = '<div class="empty-books">还没有词书</div>'; return; }
  target.innerHTML = state.books.map(book => {
    const stats = bookStats(book);
    return `<button class="book-row ${book.id === currentBookId ? "selected" : ""}" data-book="${escapeHtml(book.id)}"><span class="book-dot"></span><span>${escapeHtml(book.name)}</span><span class="book-remaining">${book.words.length - stats.learned - stats.known}</span></button>`;
  }).join("");
}
function renderHome() {
  const book = currentBook();
  if (!book) { document.getElementById("view-home").innerHTML = emptyHome(); return; }
  const stats = bookStats(book);
  const daily = todayStats();
  const settings = state.settings;
  const percent = book.words.length ? Math.round((stats.learned + stats.known) * 100 / book.words.length) : 0;
  const fresh = book.words.length - stats.learned - stats.known;
  const categories = [...new Set(book.words.map(word => word.category).filter(Boolean))];
  const scopedWords = wordsForScope(book, settings.vocabularyCategory);
  const scopeOptions = categories.map(category => `<option value="${escapeHtml(category)}" ${settings.vocabularyCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("");
  const scopeMatches = scopeSearchQuery.trim() ? book.words.map((word, index) => ({ word, index })).filter(({ word }) => `${word.word} ${word.meaning || ""}`.toLowerCase().includes(scopeSearchQuery.trim().toLowerCase())).slice(0, 8) : [];
  const metrics = [
    ["今日新学", daily.learned, "词", "今天累计"],
    ["待复习", allDue(), "词", "到期词条"],
    ["今日时长", Math.round((daily.seconds || 0) / 60), "分", `累计 ${totalMinutes()} 分钟`],
    ["累计掌握", masteredCount(), "词", "含已标熟"],
  ].map(([label, value, unit, note]) => `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}<span class="metric-unit">${unit}</span></div><div class="metric-note">${note}</div></div>`).join("");
  const heading = `<div class="page-heading"><div><p class="eyebrow">${new Intl.DateTimeFormat("zh-CN", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1>今天，继续积累</h1></div><div class="date-label">本地学习记录</div></div>`;
  const bookSummary = renderBookSummary(book, stats, percent, fresh);
  document.getElementById("view-home").innerHTML = `
    ${heading}
    <div class="overview-grid">${metrics}</div>
    <div class="section-heading"><h2>当前词书</h2><button class="quiet-link" data-view="words">管理词书 →</button></div>
    ${bookSummary}
    ${renderScopePanel(book, scopedWords, scopeOptions, scopeMatches)}
    ${renderHomeFooter(book)}
    <section class="recent-section"><div class="section-heading"><h2>最近学习</h2><button class="quiet-link" data-view="words">查看全部 →</button></div><div class="table-wrap"><table><thead><tr><th>单词</th><th>释义</th><th>状态</th></tr></thead><tbody>${recentRows(book)}</tbody></table></div></section>`;
}
function renderBookSummary(book, stats, percent, fresh) {
  const known = stats.known ? ` · 已标熟 ${stats.known}` : "";
  const primaryAction = session ? "resume-session" : "start-from-scope";
  const primaryLabel = session?.mode === "review" ? "继续复习" : "继续学习";
  const primaryDisabled = fresh === 0 && session?.mode !== "review" ? "disabled" : "";
  const reviewDisabled = stats.due || session?.mode === "review" ? "" : "disabled";
  const reviewLabel = session?.mode === "review" ? "继续复习" : `复习 ${stats.due || ""}`;
  const cover = `<div class="book-cover">${escapeHtml(book.name.slice(0, 1))}</div>`;
  const subtitle = `${book.words.length} 个词条 · ${escapeHtml(book.category || "自定义词书")}${known}`;
  const progressFill = `<div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>`;
  const main = `<div class="book-summary-main"><div class="book-summary-title">${escapeHtml(book.name)}</div><div class="book-summary-sub">${subtitle}</div>${progressFill}</div>`;
  const counter = `<div class="summary-progress">${stats.learned + stats.known} / ${book.words.length}</div>`;
  const primary = `<button class="primary-button" data-action="${primaryAction}" ${primaryDisabled}>${primaryLabel}</button>`;
  const review = `<button class="secondary-button" data-action="start-review" ${reviewDisabled}>${reviewLabel}</button>`;
  const actions = `<div class="summary-actions">${primary}${review}<button class="secondary-button" data-view="settings">计划</button></div>`;
  return `<div class="book-summary">${cover}${main}${counter}${actions}</div>`;
}
// The learning start point: which word index and theme the next new-word
// session begins at, plus a search box that jumps straight to a match.
function renderScopePanel(book, scopedWords, scopeOptions, scopeMatches) {
  const settings = state.settings;
  const total = scopedWords.length || 1;
  const start = Math.min(settings.vocabularyStart || 1, total);
  const preview = scopedWords[start - 1]?.word || "超出主题范围";
  const scopeLabel = settings.vocabularyCategory === "all" ? "共" : "主题内共";
  const stepButton = (dir, label, glyph) => `<button type="button" data-step="${dir}" aria-label="${label}">${glyph}</button>`;
  const startInput = `<input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="${String(total).length}" value="${start}" data-scope="vocabularyStart" aria-label="从第几个词开始">`;
  const stepperButtons = `<span class="stepper-buttons">${stepButton(1, "增加起始词", "+")}${stepButton(-1, "减少起始词", "−")}</span>`;
  const stepper = `<span class="number-stepper">${startInput}${stepperButtons}</span>`;
  const startPreview = `<span class="scope-word-preview" id="scope-word-preview">${escapeHtml(preview)}</span>`;
  const startField = `<label class="scope-start-label">从第几个词开始${stepper}${startPreview}</label>`;
  const categoryField = `<label class="scope-category-label">主题<select class="setting-select scope-select" data-scope="vocabularyCategory"><option value="all" ${settings.vocabularyCategory === "all" ? "selected" : ""}>全部主题</option>${scopeOptions}</select></label>`;
  const matchRows = scopeMatches.map(({ word, index }) => {
    const categoryIndex = wordsForScope(book, word.category || "all").findIndex(item => item === word) + 1;
    const status = isKnown(word, book.id) ? "已标熟" : getRecord(book.id, word).introducedAt ? "学过" : "待学习";
    return `<button class="scope-search-result" data-scope-word="${index}"><strong>${escapeHtml(word.word)}</strong><span>${escapeHtml(word.category || "未分类")} · 第 ${categoryIndex} 词 · ${status}</span><small>${escapeHtml(word.meaning || "")}</small></button>`;
  }).join("");
  const results = scopeMatches.length
    ? `<div class="scope-search-results">${matchRows}</div>`
    : scopeSearchQuery.trim() ? '<div class="scope-search-empty">没有匹配词条</div>' : "";
  const panelHead = `<div class="study-panel-header"><span>选择学习起点</span><span class="pill">仅影响新词</span></div>`;
  const count = `<span class="scope-count">${scopeLabel} ${scopedWords.length} 个词条</span>`;
  const startButton = `<button class="primary-button scope-start-button" data-action="start-from-scope" ${scopedWords.length ? "" : "disabled"}>开始学习</button>`;
  const controls = `<div class="scope-controls">${startField}${categoryField}${count}${startButton}</div>`;
  const searchInput = `<input type="search" class="scope-search-input" data-scope-search placeholder="搜索单词或释义" value="${escapeHtml(scopeSearchQuery)}" aria-label="搜索学习起点词条">`;
  return `<section class="study-panel scope-panel">${panelHead}${controls}<div class="scope-search">${searchInput}${results}</div></section>`;
}
// Streak calendar and the shortcut tiles, side by side.
function renderHomeFooter(book) {
  const checkinLabel = state.checkins.includes(todayKey()) ? "今日已签到" : "今日签到";
  const calendar = `<section class="study-panel"><div class="study-panel-header"><span>签到日历</span><span class="pill">连续 ${streakDays()} 天</span></div>${renderCalendar()}<button class="secondary-button full-button" data-action="checkin">${checkinLabel}</button></section>`;
  const shortcuts = [
    ["listen", "♫", "随身听", `${book.words.length} 个词条`, `data-view="listen"`],
    ["dict", "⌕", "词典", "查词与例句", `data-view="dict"`],
    ["sentences", "¶", "句库", `${state.favoriteSentences.length} 条例句`, `data-view="sentences"`],
    ["favorites", "☆", "生词本", `${state.favoriteWords.length} 个收藏`, `data-action="open-favorites"`],
    ["backup", "⇩", "导出备份", "词书与进度 JSON", `id="backup-button"`],
  ].map(([, icon, title, note, attrs]) => `<button class="quick-action" ${attrs}><span class="quick-action-icon">${icon}</span><span><strong>${title}</strong><small>${note}</small></span></button>`).join("");
  return `<div class="study-layout">${calendar}<section class="study-panel"><div class="study-panel-header"><span>快捷入口</span></div><div class="quick-actions">${shortcuts}</div></section></div>`;
}
function renderCalendar() {
  const days = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - 6);
  for (let index = 0; index < 7; index++) {
    const key = dateKey(cursor);
    const checked = state.checkins.includes(key);
    const isToday = key === todayKey();
    days.push(`<div class="calendar-day ${checked ? "checked" : ""} ${isToday ? "today" : ""}"><span>${["日", "一", "二", "三", "四", "五", "六"][cursor.getDay()]}</span><strong>${cursor.getDate()}</strong><i>${checked ? "✓" : ""}</i></div>`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return `<div class="calendar">${days.join("")}</div>`;
}
function recentRowState(word, record, bookId) {
  if (isKnown(word, bookId)) return "已标熟";
  if (record.box >= 3) return "已掌握";
  return record.box ? "学习中" : "待学习";
}
function recentRows(book) {
  const entries = book.words
    .map(word => ({ word, record: getRecord(book.id, word) }))
    .filter(item => item.record.lastSeen)
    .sort((a, b) => b.record.lastSeen - a.record.lastSeen)
    .slice(0, 5);
  const rows = entries.map(({ word, record }) => {
    const state = recentRowState(word, record, book.id);
    return `<tr><td>${escapeHtml(word.word)}</td><td>${escapeHtml(word.meaning)}</td><td><span class="word-state">${state}</span></td></tr>`;
  }).join("");
  return rows || '<tr><td colspan="3" class="word-state">还没有学习记录</td></tr>';
}
function emptyHome() {
  const heading = '<div class="page-heading"><div><p class="eyebrow">本地学习</p><h1>先导入一本词书</h1></div></div>';
  const body = '<section class="study-panel"><div class="empty-state"><div class="empty-mark">＋</div><strong>选择 CSV、TSV 或 JSON 词书文件</strong><p>词书和进度会保存在当前浏览器中。</p><button class="primary-button" id="empty-import">导入词书</button></div></section>';
  return `${heading}${body}`;
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function phoneticKey(word) {
  return String(word.word || "").split(" / ")[0].toLowerCase().replace(/\s+/g, " ").trim();
}
function accentLabel() { return state.settings.accent === "us" ? "美" : "英"; }
function phoneticOf(word) {
  const own = String(word.phonetic || "").trim();
  if (own) return own;
  const entry = phoneticsMap[phoneticKey(word)];
  if (!entry) return "";
  const accent = state.settings.accent === "us" ? "us" : "uk";
  const value = entry[accent] || entry.uk || entry.us || "";
  return value ? `/${value}/` : "";
}
async function loadPhonetics() {
  try {
    const response = await fetch("./ielts/phonetics.json");
    if (!response.ok) return;
    phoneticsMap = await response.json();
    if (session) renderSession(); else renderShell();
  } catch (error) { /* phonetics are optional */ }
}
async function loadSyllables() {
  try {
    const response = await fetch("./ielts/syllables.json");
    if (!response.ok) return;
    syllablesMap = await response.json();
    if (session) renderSession();
  } catch (error) { /* syllable data is optional */ }
}
function meaningOf(word) {
  const pos = String(word.partOfSpeech || "").trim();
  const meaning = String(word.meaning || "暂无释义").trim();
  if (!pos) return meaning;
  if (meaning.toLowerCase().startsWith(pos.toLowerCase())) return meaning;
  return `${pos}${pos.endsWith(".") ? "" : "."} ${meaning}`;
}
function syllableDisplay(word) {
  const base = String(word?.word || "").split(" / ")[0].toLowerCase().trim();
  if (word?.syllables) return String(word.syllables).replace(/[.-]/g, "·");
  if (syllablesMap[base]) return syllablesMap[base];
  return base;
}
function wordsForScope(book, category = "all") {
  return book?.words.filter(word => category === "all" || word.category === category) || [];
}
function startSession(mode, { replace = false, fromScope = false } = {}) {
  if (!replace && session?.queue?.length) {
    currentBookId = session.sourceBookId || session.bookId || currentBookId;
    currentView = session.mode === "review" ? "review" : "home";
    renderShell();
    if (session.wordStartedAt) renderSession();
    else { prepareWord(); renderSession(); }
    return;
  }
  const book = currentBook(); if (!book) return;
  const stats = bookStats(book);
  let words = [];
  if (mode === "review") words = dueWords(book.id).map(entry => entry.word).slice(0, state.settings.reviewChunk || 100);
  else {
    const start = Math.max(1, Number(state.settings.vocabularyStart) || 1);
    const category = state.settings.vocabularyCategory || "all";
    const scopedWords = wordsForScope(book, category);
    words = fromScope
      ? scopedWords.slice(start - 1).filter(word => !isKnown(word, book.id))
      : scopedWords.filter((word, index) => {
        const record = getRecord(book.id, word);
        return index + 1 >= start && !isKnown(word, book.id) && !record.introducedAt && record.box === 0 && record.seen === 0;
      });
    words = words.slice(0, state.settings.groupSize || 20);
  }
  if (mode === "review" && !words.length) words = state.books.flatMap(source => dueWords(source.id).map(entry => ({ ...entry.word, _bookId: source.id }))).slice(0, state.settings.reviewChunk || 100);
  if (!words.length) { toast(mode === "review" ? "目前没有到期的复习词条" : "今天的新词已完成"); return; }
  session = createSession(mode, words, words[0]._bookId || book.id, book.id);
  persist();
  currentView = mode === "review" ? "review" : "home";
  prepareWord();
  renderShell();
  renderSession();
}
function createSession(mode, words, bookId, sourceBookId) {
  const now = Date.now();
  return {
    mode,
    bookId,
    sourceBookId,
    words,
    queue: words.map(word => ({ word, streak: 0, passes: 0 })),
    total: words.length,
    completed: 0,
    // New words must be recalled three times before they retire from the group.
    required: mode === "new" ? 3 : 1,
    answered: false,
    revealed: false,
    material: false,
    spelling: false,
    choice: null,
    answerGrade: null,
    noteDraft: "",
    startedAt: now,
    wordStartedAt: now,
  };
}
function syncVocabularyStart(book) {
  if (!book || book.id !== IELTS_BOOK_ID) return;
  const category = state.settings.vocabularyCategory || "all";
  const start = Math.max(1, Number(state.settings.vocabularyStart) || 1);
  const scopedWords = wordsForScope(book, category);
  const next = scopedWords.findIndex((word, index) => {
    const record = getRecord(book.id, word);
    return index + 1 >= start && !isKnown(word, book.id) && !record.introducedAt && record.box === 0 && record.seen === 0;
  });
  if (next >= 0) state.settings.vocabularyStart = next + 1;
  else state.settings.vocabularyStart = scopedWords.length || 1;
}
function currentSessionWord() { return session?.queue?.[0]?.word || null; }
function prepareWord() {
  if (!session) return;
  const entry = session.queue[0];
  if (!entry) return;
  persist();
  const word = entry.word;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  session.answered = false;
  session.revealed = false;
  session.spelling = false;
  session.answerGrade = null;
  session.answerSource = null;
  session.choiceInspect = [];
  session.collocationTranslations = {};
  session.noteDraft = state.notes[recordKey(bookId, word)] || "";
  session.wordStartedAt = Date.now();
  session.choice = record.box <= 1 ? buildChoice(word, bookId) : null;
  persist();
  activeStudyTab = tabOrder()[0] || "phrase";
  if (!entry.autoPlayed && (state.settings.autoPronounce || (state.settings.listeningQuiz && session.choice))) {
    entry.autoPlayed = true;
    setTimeout(() => playAudio(word), 120);
  }
}
let activeStudyTab = "phrase";
function tabOrder() {
  const order = (state.settings.mnemonicOrder || DEFAULT_SETTINGS.mnemonicOrder).filter(tab => TAB_LABELS[tab]);
  return order.length ? order : [...DEFAULT_SETTINGS.mnemonicOrder];
}
function buildChoice(word, bookId) {
  const pool = state.books.find(book => book.id === bookId)?.words || [];
  const correct = meaningOf(word);
  const groupWords = groupWordsOf(word);
  const sameGroup = pool.filter(item => item !== word && item.meaning && groupWords.includes(item.word) && meaningOf(item) !== correct);
  const rest = pool.filter(item => item !== word && item.meaning && !sameGroup.includes(item) && meaningOf(item) !== correct);
  const chosen = [];
  const seen = new Set([correct]);
  const take = list => {
    for (const item of shuffle(list)) {
      const meaning = meaningOf(item);
      if (seen.has(meaning)) continue;
      seen.add(meaning);
      chosen.push({ word: item.word, meaning, correct: false, confusable: groupWords.includes(item.word) });
      if (chosen.length >= 3) break;
    }
  };
  take(sameGroup);
  if (chosen.length < 3) take(rest);
  const options = [{ word: word.word, meaning: correct, correct: true, confusable: false }].concat(chosen);
  return { options: shuffle(options), selected: null };
}
function sessionTopline(word, bookId) {
  const phonetic = phoneticOf(word);
  const phoneticBlock = phonetic
    ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phonetic)}`
    : escapeHtml(word.partOfSpeech || "");
  const favorite = state.favoriteWords.includes(recordKey(bookId, word));
  const known = isKnown(word, bookId);
  const spellButton = state.settings.spellHint ? '<button class="word-tool" data-action="spell">abc 拼写</button>' : "";
  const playButton = '<button class="word-tool" data-action="play-audio">▶ 发音</button>';
  const favButton = `<button class="word-tool ${favorite ? "active" : ""}" data-action="fav-word">☆ ${favorite ? "已收藏" : "收藏"}</button>`;
  const knownButton = `<button class="word-tool ${known ? "active" : ""}" data-action="known">${known ? "已标熟" : "标熟"}</button>`;
  const likeButton = `<button class="like-pill" data-action="like">👍 ${likeCount(word, bookId)}</button>`;
  const tools = `<div class="word-tools">${playButton}${favButton}${spellButton}${knownButton}${likeButton}</div>`;
  return `<div class="learn-topline"><span class="word-phonetic">${phoneticBlock}</span>${tools}</div>`;
}
function renderSession() {
  if (!session) return renderShell();
  const entry = session.queue[0];
  if (!entry) return renderShell();
  const word = entry.word;
  const bookId = bookIdFor(word);
  const root = document.getElementById(`view-${session.mode === "review" ? "review" : "home"}`);
  if (!root) return;
  const total = session.total;
  const progress = Math.round(session.completed * 100 / total);
  const variants = word.variants?.length > 1 ? word.variants : [];
  const revealed = session.answered;
  const listening = state.settings.listeningQuiz && session.choice && !revealed;
  const spellingResult = revealed && session.answerSource === "spelling";
  const tabs = tabOrder();
  const panels = revealed && !session.choice ? `<div class="study-tabs">${tabs.map(tab => `<button class="study-tab ${activeStudyTab === tab ? "selected" : ""}" data-study-tab="${tab}">${TAB_LABELS[tab]}</button>`).join("")}</div>${renderTabPanel(word, activeStudyTab)}` : "";
  const spellInput = '<input id="spell-input" class="spell-input" autocomplete="off" autocapitalize="off" placeholder="输入拼写，回车检查">';
  const spellBox = `<div class="spell-box">${spellInput}<div class="spell-actions"><button class="answer-button again" data-action="cancel-spell">取消</button><button class="answer-button known" data-action="check-spell">检查</button></div></div>`;
  const actions = session.spelling
    ? spellBox
    : revealed
      ? (session.choice
        ? `<button class="answer-button known action-right" data-action="continue">继续</button>`
        : `<button class="answer-button again action-left" data-action="undo">记错了</button><button class="answer-button known action-right" data-action="continue">下一词</button>`)
      : (session.choice
        ? `<button class="answer-button known action-right" data-action="reveal">看答案</button>`
        : `<button class="answer-button again action-left" data-grade="again">不认识</button><button class="answer-button unsure action-center" data-grade="unsure">模糊</button><button class="answer-button known action-right" data-grade="known">认识</button>`);
  const displayWord = session.choice && revealed && state.settings.showSyllableMarks !== false ? syllableDisplay(word) : word.word.split(" / ")[0];
  const topline = sessionTopline(word, bookId);
  const modeLabel = session.mode === "review" ? "复习" : "新词学习";
  const streakLabel = entry.streak ? ` · 连对 ${entry.streak}/${session.required}` : "";
  const toolbarProgress = `${modeLabel} · ${Math.min(session.completed + 1, total)} / ${total}${streakLabel}`;
  const toolbar = `<div class="learn-toolbar"><button data-action="exit-session">← 返回</button><span>${toolbarProgress}</span><span>${total - session.completed} 剩余</span></div>`;
  root.innerHTML = `<div class="learn-layout">${toolbar}
   <article class="learn-card ${revealed ? "answered" : "recalling"}"><div class="learn-progress"><span style="width:${progress}%"></span></div>
  <div class="learn-body">
  ${topline}
   <h1 class="learn-word">${session.spelling ? "拼写测试" : listening ? "🎧 听音选义" : escapeHtml(displayWord)}</h1>
  ${!session.spelling && !listening && variants.length ? `<div class="word-variants">${variants.map(variant => `<span>${escapeHtml(variant)}</span>`).join("")}</div>` : ""}
  ${session.spelling ? `<div class="word-meaning spell-hint">${escapeHtml(meaningOf(word))}</div>` : ""}
   ${session.choice && !session.spelling ? `<div class="choice-stage"><div class="choice-prompt" ${revealed ? 'aria-hidden="true"' : ""}>${revealed || !listening ? "" : "听发音，选择对应词义"}</div>${!spellingResult ? renderChoice(word) : ""}</div>` : ""}
   ${(!session.choice || spellingResult) && revealed ? `<div class="word-meaning">${escapeHtml(meaningOf(word))}</div>` : ""}
  ${panels}
  </div>
  <div class="answer-actions">${actions}</div>
   ${revealed && session.answerGrade === "unsure" ? '<div class="unsure-hint">模糊按“没记住”处理，这个词稍后会在本组再次出现。</div>' : ""}
   </article></div>`;
   fitLearnCard();
   watchLearnCard();
   normalizeChoiceHeights();
   if (session.spelling) setTimeout(() => document.getElementById("spell-input")?.focus(), 30);
 }
// The card is content-sized so the four options and the answer bar stay in one
// column, but it must never be taller than the space left under the window's own
// chrome (drag bar, sidebar strip, toolbar). Measured rather than hard-coded:
// those offsets differ per breakpoint and between the desktop shell and a browser.
function fitLearnCard() {
  const card = document.querySelector(".learn-card");
  if (!card) return;
  const available = Math.round(window.innerHeight - card.getBoundingClientRect().top - 8);
  const next = available > 160 ? `${available}px` : "";
  if (card.style.maxHeight !== next) card.style.maxHeight = next;
}
// The toolbar can wrap and the heading can shrink after the first paint, which
// moves the card down a few pixels. Refitting on layout changes keeps the cap
// true without measuring in a fixed timeout.
let learnCardObserver = null;
function watchLearnCard() {
  if (typeof ResizeObserver === "undefined") return;
  const card = document.querySelector(".learn-card");
  learnCardObserver?.disconnect();
  learnCardObserver = null;
  if (!card?.parentElement) return;
  learnCardObserver = new ResizeObserver(() => fitLearnCard());
  learnCardObserver.observe(card.parentElement);
}
function normalizeChoiceHeights() {
  const list = document.querySelector(".choice-list");
  if (!list) return;
  list.style.removeProperty("--choice-row-height");
  requestAnimationFrame(() => {
    const options = [...list.querySelectorAll(".choice-option")];
    if (!options.length) return;
    // The stylesheet already encodes how tight a row may get at this window size
    // (36px on narrow windows, 42px on short ones, 48px otherwise). Measure the
    // content against that floor instead of a hard-coded 48, so all four options
    // stay above the answer bar on a 350x450 window.
    const floor = parseFloat(getComputedStyle(options[0]).minHeight) || 48;
    const needed = Math.max(...options.map(option => {
      const content = option.querySelector(".choice-meaning");
      const style = getComputedStyle(option);
      return content.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 2;
    }));
    const rowHeight = Math.ceil(Math.max(floor, needed));
    list.style.setProperty("--choice-row-height", `${rowHeight}px`);
  });
}
function renderChoice() {
  if (!session?.choice) return "";
  const choice = session.choice;
  const inspected = Array.isArray(session.choiceInspect) ? session.choiceInspect : [];
  const locked = choice.selected != null;
  return `<div class="choice-list">${choice.options.map((option, index) => {
    let cls = `choice-option ${String(option.meaning || "").length > 22 ? "long-meaning" : ""}`;
    if (locked) {
      if (option.correct) cls += " correct";
      else if (choice.selected === index) cls += " wrong";
      // Gold means "opened to peek at the word"; a corrected pick keeps its own
      // colour so the button that was pressed stays identifiable.
      if (inspected.includes(index) && !option.correct && choice.selected !== index) cls += " inspect";
    }
    const showWord = locked && (option.correct || choice.selected === index || inspected.includes(index));
    return `<button class="${cls}" data-choice="${index}"><span class="choice-meaning">${escapeHtml(option.meaning)}</span><span class="choice-word">${showWord && option.word ? escapeHtml(option.word) : ""}</span></button>`;
  }).join("")}</div>`;
}
const MORPHEME_PREFIXES = [
  ["contra", "相反"], ["trans", "跨越；转变"], ["inter", "之间"], ["super", "在上；超过"], ["under", "在下；不足"], ["over", "过度；在上"],
  ["multi", "多"], ["micro", "微小"], ["macro", "宏大"], ["auto", "自己"], ["anti", "反对"], ["extra", "额外；超出"],
  ["pre", "在前；预先"], ["post", "在后"], ["sub", "在下；次于"], ["de", "否定；向下"], ["dis", "否定；分开"], ["con", "共同；加强"],
  ["com", "共同；加强"], ["ex", "向外；出"], ["in", "进入；否定"], ["im", "进入；否定"], ["re", "再；向后"], ["pro", "向前；支持"],
  ["per", "贯穿；彻底"], ["un", "否定"], ["non", "非"], ["mis", "错误"], ["co", "共同"]
];
const MORPHEME_ROOTS = [
  ["struct", "建造"], ["spect", "看"], ["port", "携带"], ["duct", "引导"], ["ject", "投掷"], ["miss", "送；派"],
  ["script", "写"], ["scrib", "写"], ["graph", "写；画"], ["log", "言语；学科"], ["bio", "生命"], ["geo", "土地"],
  ["therm", "热"], ["chron", "时间"], ["phon", "声音"], ["photo", "光"], ["cred", "相信"], ["fer", "带来"],
  ["form", "形状"], ["gen", "产生"], ["gress", "行走"], ["grad", "步；级"], ["lect", "选择；读"], ["loc", "地方"],
  ["man", "手"], ["mar", "海"], ["meter", "测量"], ["min", "小"], ["mot", "移动"], ["mov", "移动"],
  ["nov", "新"], ["ped", "脚"], ["puls", "推； pulse"], ["pend", "悬挂"], ["pos", "放置"], ["prim", "第一"],
  ["rupt", "破裂"], ["sect", "切"], ["sens", "感觉"], ["sent", "感觉"], ["serv", "服务；保持"], ["sist", "站立"],
  ["sol", "太阳；单独"], ["spec", "看"], ["spir", "呼吸"], ["tact", "触摸"], ["tempor", "时间"], ["tend", "伸展"],
  ["terr", "土地"], ["tract", "拉；抽"], ["vac", "空"], ["vent", "来"], ["ver", "真实"], ["vis", "看"],
  ["vid", "看"], ["voc", "声音；召唤"], ["vol", "意愿"], ["fund", "基础"], ["dur", "持久"], ["cap", "拿；头"],
  ["tain", "握住"], ["fact", "做"], ["fect", "做"], ["dict", "说"], ["flu", "流动"], ["fluct", "波动"],
  ["mort", "死"], ["nat", "出生"], ["par", "准备；相等"], ["plic", "折叠"], ["press", "压"], ["sci", "知道"],
  ["sequ", "跟随"], ["sist", "站立"], ["sta", "站立"], ["uni", "一"], ["viv", "生命"]
];
const MORPHEME_SUFFIXES = [
  ["ability", "能力"], ["ibility", "能力"], ["ization", "化"], ["isation", "化"], ["ation", "名词后缀"], ["ition", "名词后缀"],
  ["sion", "名词后缀"], ["tion", "名词后缀"], ["ment", "名词后缀"], ["ness", "名词后缀"], ["ance", "名词后缀"], ["ence", "名词后缀"],
  ["ity", "名词后缀"], ["ism", "主义；状态"], ["ist", "人"], ["ship", "状态；关系"], ["hood", "状态"], ["dom", "领域；状态"],
  ["able", "能…的"], ["ible", "能…的"], ["ous", "充满…的"], ["ful", "充满…的"], ["less", "没有…的"], ["ive", "有…性质的"],
  ["ic", "…的"], ["al", "…的"], ["ary", "…的；场所"], ["ish", "略…的"], ["like", "像…的"], ["ly", "副词后缀"],
  ["ize", "使…化"], ["ise", "使…化"], ["ify", "使…"], ["en", "使…"], ["ward", "向…"], ["wise", "方式"],
  ["er", "人；比较级"], ["or", "人"], ["ant", "人；…的"], ["ent", "人；…的"]
];
const MEANING_STOPWORDS = ["大量", "足够", "状态", "行为", "动作", "情况", "方面", "东西", "表示", "进行", "某种", "一个", "一种", "的人", "的事", "使", "或", "与", "和", "及", "等", "地", "得"];
function wordBase(word) { return (word.word || "").split(" / ")[0].split(" ")[0]; }
function posOf(word) { return (word.partOfSpeech || "").toLowerCase(); }
function completeExample(example) {
  const text = String(example || "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 20 || /\.\.\.|…/.test(text)) return "";
  if (!/^["“‘'A-Z]/.test(text) || /[,;:，；：]$/.test(text)) return "";
  if (text.split(/\s+/).filter(Boolean).length < 5) return "";
  const brackets = [["(", ")"], ["[", "]"], ["（", "）"]];
  if (brackets.some(([left, right]) => (text.match(new RegExp(`\\${left}`, "g")) || []).length !== (text.match(new RegExp(`\\${right}`, "g")) || []).length)) return "";
  return text;
}
function meaningTokens(meaning) {
  return String(meaning || "").toLowerCase().replace(/^[a-z]+\.?\s*/, "").split(/[；;，,、/（）()\s]+/).map(token => token.replace(/[的地得]/g, "")).filter(token => token.length >= 2 && !MEANING_STOPWORDS.includes(token));
}
function collocationsOf(word) {
  const result = [];
  const example = completeExample(word.example);
  if (example) result.push({ text: example, translation: word.exampleTranslation || word.translation || "", kind: "例句" });
  const book = state.books.find(item => item.id === bookIdFor(word));
  const index = wordIndex(book);
  groupWordsOf(word).slice(0, 5).forEach(item => {
    if (item.toLowerCase() === word.word.toLowerCase()) return;
    const match = index.get(item.toLowerCase());
    result.push({ text: item, translation: match ? meaningOf(match) : "", kind: "同组词" });
  });
  return result;
}
function pluralOf(base) {
  if (/(s|x|ch|sh)$/i.test(base)) return base + "es";
  if (/[^aeiou]y$/i.test(base)) return base.slice(0, -1) + "ies";
  return base + "s";
}
function inflectionsOf(word) {
  const base = wordBase(word);
  const pos = posOf(word);
  const out = [];
  if (/^v/.test(pos) || /verb/.test(pos)) {
    out.push(base + "s");
    out.push(/e$/i.test(base) ? base + "d" : base + "ed");
    out.push(/e$/i.test(base) ? base.slice(0, -1) + "ing" : base + "ing");
  }
  if (/^n/.test(pos) || /noun/.test(pos)) out.push(pluralOf(base));
  if (/^adj/.test(pos) || /adjective/.test(pos)) {
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "ier" : base.length <= 7 ? base + "er" : "more " + base);
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "iest" : base.length <= 7 ? base + "est" : "most " + base);
    out.push(/y$/i.test(base) ? base.slice(0, -1) + "ily" : base + "ly");
  }
  if (!out.length) out.push(pluralOf(base));
  return [...new Set(out.filter(item => item.toLowerCase() !== base.toLowerCase() && item.length > 2))].slice(0, 5);
}
function derivativesOf(word) {
  const base = wordBase(word);
  const pos = posOf(word);
  const out = [];
  if (/^adj/.test(pos) || /adjective/.test(pos)) {
    if (/ant$/i.test(base)) out.push(base.slice(0, -3) + "ance");
    else if (/ent$/i.test(base)) out.push(base.slice(0, -3) + "ence");
    out.push(base + "ness");
    if (!/ly$/i.test(base)) out.push(/y$/i.test(base) ? base.slice(0, -1) + "ily" : base + "ly");
  }
  if (/^v/.test(pos) || /verb/.test(pos)) {
    out.push(/e$/i.test(base) ? base.slice(0, -1) + "tion" : base + "tion");
    out.push(base + "ment");
    out.push(base + "er");
  }
  if (/^n/.test(pos) || /noun/.test(pos)) {
    out.push(base + "al");
    out.push(base + "ous");
  }
  if (!out.length) out.push(base + "ness", base + "ly");
  return [...new Set(out.filter(item => item.toLowerCase() !== base.toLowerCase()))].slice(0, 6);
}
function morphAnalyze(word) {
  const raw = wordBase(word).toLowerCase().replace(/[^a-z]/g, "");
  if (raw.length < 5) return null;
  const parts = [];
  let rest = raw;
  const prefix = MORPHEME_PREFIXES.filter(([text]) => rest.startsWith(text) && rest.length > text.length + 3).sort((a, b) => b[0].length - a[0].length)[0];
  if (prefix) { parts.push({ type: "前缀", text: prefix[0] + "-", meaning: prefix[1] }); rest = rest.slice(prefix[0].length); }
  let stem = rest;
  const suffix = MORPHEME_SUFFIXES.filter(([text]) => stem.endsWith(text) && stem.length > text.length + 2).sort((a, b) => b[0].length - a[0].length)[0];
  if (suffix) stem = stem.slice(0, stem.length - suffix[0].length);
  const root = MORPHEME_ROOTS.filter(([text]) => stem.includes(text)).sort((a, b) => b[0].length - a[0].length)[0];
  if (root) {
    const index = stem.indexOf(root[0]);
    if (index > 0) parts.push({ type: "词干", text: stem.slice(0, index), meaning: "" });
    parts.push({ type: "词根", text: root[0], meaning: root[1] });
    if (index + root[0].length < stem.length) parts.push({ type: "词干", text: stem.slice(index + root[0].length), meaning: "" });
  } else if (stem) parts.push({ type: "词干", text: stem, meaning: "" });
  if (suffix) parts.push({ type: "后缀", text: "-" + suffix[0], meaning: suffix[1] });
  return parts.length >= 2 ? parts : null;
}
function spellingChunks(word) {
  const base = wordBase(word);
  if (base.length <= 6) return [base];
  const target = Math.ceil(base.length / 3);
  const chunks = [];
  let index = 0;
  while (index < base.length) {
    let end = Math.min(base.length, index + target);
    if (end < base.length) {
      const nextVowel = base.slice(end).search(/[aeiouy]/i);
      if (nextVowel >= 0 && nextVowel <= 2) end = end + nextVowel;
    }
    chunks.push(base.slice(index, end));
    index = end;
  }
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) chunks[chunks.length - 2] += chunks.pop();
  return chunks;
}
function relatedWordsOf(word, bookId) {
  const book = state.books.find(item => item.id === bookId);
  const tokens = meaningTokens(word.meaning);
  if (!book || !tokens.length) return [];
  return book.words.filter(item => item !== word && item.meaning).map(item => ({ word: item, score: meaningTokens(item.meaning).filter(token => tokens.includes(token)).length })).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);
}
function generatedNote(word, bookId) {
  const base = wordBase(word);
  const parts = morphAnalyze(word);
  const lines = [`拼写切分：${spellingChunks(word).join(" · ")}`];
  if (parts) lines.push(`构词：${parts.map(part => `${part.text}${part.meaning ? `（${part.meaning}）` : ""}`).join(" + ")}`);
  const collocations = collocationsOf(word).slice(0, 3).map(item => item.text);
  if (collocations.length) lines.push(`搭配/同组：${collocations.join("；")}`);
  if (word.example) lines.push(`例句：${word.example}${word.translation ? `（${word.translation}）` : ""}`);
  const related = relatedWordsOf(word, bookId).slice(0, 3).map(item => item.word.word);
  if (related.length) lines.push(`相关词：${related.join("、")}`);
  lines.push(`记忆点：把「${base}」和上面的例句场景绑在一起，先想画面再想中文。`);
  return lines.join("\n");
}
function collocationRow(item, index) {
  const showTranslation = Boolean(session.collocationTranslations?.[index]);
  const label = showTranslation ? "显示英文" : "显示中文释义";
  const text = showTranslation ? item.translation || "暂无译文" : item.text;
  return `<button type="button" class="collocation-row ${showTranslation ? "translation-shown" : ""}" data-collocation="${index}" aria-label="${label}"><span class="collocation-text">${escapeHtml(text)}</span><span class="tab-src">${item.kind}</span></button>`;
}
// Chips for a list of related words, plus the "释义匹配" rows that explain
// why each one was picked.
function relatedChips(related) {
  if (!related.length) return "";
  const rows = related.map(item => `<div class="collocation-row"><span class="collocation-text"><strong>${escapeHtml(item.word.word)}</strong> ${escapeHtml(item.word.meaning || "")}</span><span class="tab-src">释义匹配</span></div>`).join("");
  return `<div class="collocation-list">${rows}</div>`;
}
function tabPhrasePanel(word, bookId) {
  const items = collocationsOf(word);
  // The 例句库 view tells the reader to tap ☆ here, so this button must exist:
  // without it no element ever emitted data-action="fav-sentence" and
  // favourite sentences stayed permanently empty.
  const faved = isFavoriteSentence(word, bookId);
  const saveRow = word.example
    ? `<div class="sentence-save-row"><p class="tab-src">例句收藏</p><button type="button" class="word-tool ${faved ? "active" : ""}" data-action="fav-sentence" aria-pressed="${faved}">☆ ${faved ? "已收藏例句" : "收藏例句"}</button></div>`
    : "";
  const list = items.length
    ? `<div class="collocation-list">${items.map(collocationRow).join("")}</div>`
    : '<p class="tab-empty">没有可用的例句或同组词。</p>';
  return `<div class="tab-panel"><h3>词组搭配</h3>${saveRow}${list}</div>`;
}
function tabSynonymPanel(word, bookId) {
  const related = relatedWordsOf(word, bookId);
  const groups = groupWordsOf(word).filter(item => item.toLowerCase() !== word.word.toLowerCase()).slice(0, 6);
  const reading = readingSynonyms.get(wordBase(word).toLowerCase());
  const readingSyns = reading?.synonyms || word.synonyms || [];
  let body = "";
  if (readingSyns.length) body += `<p class="tab-note">阅读 538 同义替换</p>${chipRow(readingSyns)}`;
  body += relatedChips(related);
  if (groups.length) body += `<p class="tab-note">同组词</p>${chipRow(groups)}`;
  if (!readingSyns.length && !related.length && !groups.length) {
    body += `${chipRow(derivativesOf(word))}<p class="tab-note">没有语义匹配，展示同词族形式。</p>`;
  }
  return `<div class="tab-panel"><h3>近义与相关</h3>${body}<p class="tab-src">按阅读 538、释义关键词与同组词匹配</p></div>`;
}
function renderTabPanel(word, tab) {
  const bookId = bookIdFor(word);
  if (tab === "phrase") return tabPhrasePanel(word, bookId);
  if (tab === "root") {
    const parts = morphAnalyze(word);
    if (parts) {
      const rows = parts.map(part => `<div class="root-part"><span class="root-type">${part.type}</span><strong>${escapeHtml(part.text)}</strong><span>${escapeHtml(part.meaning || "词干")}</span></div>`).join("");
      const equation = escapeHtml(parts.map(part => part.text).join(" + "));
      const extra = word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : "";
      return `<div class="tab-panel"><h3>词根词缀</h3><div class="root-parts">${rows}</div><p class="tab-note">${equation} = ${escapeHtml(wordBase(word))}</p>${extra}<p class="tab-src">按常见词根词缀表匹配，非词源考证</p></div>`;
    }
    if (!state.settings.splitMnemonic) {
      const extra = word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : "";
      return `<div class="tab-panel"><h3>词根词缀</h3><p class="tab-note">拆分助记已在学习偏好中关闭。</p>${extra}</div>`;
    }
    const extra = word.extra ? `<p class="tab-note">${escapeHtml(word.extra)}</p>` : "";
    return `<div class="tab-panel"><h3>词根词缀</h3>${chipRow(spellingChunks(word))}<p class="tab-note">未匹配到常见词根，按拼写切分。</p>${extra}</div>`;
  }
  if (tab === "variant") {
    const forms = inflectionsOf(word);
    return `<div class="tab-panel"><h3>特殊变形</h3>${chipRow(forms)}<p class="tab-src">按词性规则推导，实际拼写以词典为准</p></div>`;
  }
  if (tab === "derive") {
    const forms = derivativesOf(word);
    const variants = (word.variants || []).length > 1 ? `<p class="tab-note">词条变形：${escapeHtml(word.variants.join(" / "))}</p>` : "";
    return `<div class="tab-panel"><h3>派生词</h3>${chipRow(forms)}${variants}<p class="tab-src">按构词规则推导，仅供参考</p></div>`;
  }
  if (tab === "note") {
    const draft = escapeHtml(session?.noteDraft || state.notes[recordKey(bookId, word)] || "");
    return `<div class="tab-panel"><h3>我的笔记</h3><textarea id="note-input" class="note-input" placeholder="记录词根、搭配或自己的记忆点">${draft}</textarea><div class="note-actions"><button class="quiet-link" data-action="gen-note">生成参考笔记</button><span class="tab-src">自动保存到本设备</span></div></div>`;
  }
  if (tab === "synonym") return tabSynonymPanel(word, bookId);
  return "";
}
function markAnswer(grade) {
  const word = currentSessionWord();
  if (!word) return;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  const now = Date.now();
  record.seen++;
  record.lastSeen = now;
  if (session.mode === "new" && !record.introducedAt) record.introducedAt = now;
  if (grade === "again") record.wrong++; else record.correct++;
  session.answered = true;
  session.answerGrade = grade;
  session.answerSource = session.spelling ? "spelling" : session.choice ? "choice" : "self";
}
function gradeWord(grade) {
  if (!session || session.answered) return;
  markAnswer(grade);
  session.revealed = true;
  renderSession();
}
function chooseOption(index) {
  if (!session?.choice || session.answered) return;
  const option = session.choice.options[index];
  if (!option) return;
  session.choice.selected = index;
  markAnswer(option.correct ? "known" : "again");
  renderSession();
}
function inspectChoice(index) {
  if (!session?.choice || !session.answered) return;
  if (!session.choice.options[index]) return;
  // The correct option shows its word as soon as the answer is in, and the
  // selected one is already on screen, so neither needs opening.
  if (index === session.choice.selected || session.choice.options[index].correct) return;
  const inspected = Array.isArray(session.choiceInspect) ? session.choiceInspect : (session.choiceInspect = []);
  if (!inspected.includes(index)) inspected.push(index);
  persist();
  renderSession();
}
function revealAnswer() {
  if (!session?.choice || session.answered) return;
  session.choice.selected = -2;
  markAnswer("again");
  renderSession();
}
function continueWord() {
  if (!session?.answered) return;
  const entry = session.queue[0];
  if (!entry) return;
  const word = entry.word;
  const bookId = bookIdFor(word);
  const record = getRecord(bookId, word);
  const now = Date.now();
  const grade = session.answerGrade;
  if (grade === "known") record.box = Math.min(5, record.box + 1);
  else if (grade === "again") record.box = Math.max(0, record.box - 1);
  const intervals = [10 * 60000, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const dueDelay = grade === "unsure" ? 6 * 60 * 60 * 1000 : intervals[record.box];
  const queue = state.reviews[bookId] || (state.reviews[bookId] = []);
  const existing = queue.find(item => item.word === word.word.toLowerCase());
  if (session.mode === "review" || grade !== "known" || record.box < 3) {
    if (existing) existing.dueAt = now + dueDelay;
    else queue.push({ word: word.word.toLowerCase(), dueAt: now + dueDelay });
  } else if (existing) state.reviews[bookId] = queue.filter(item => item.word !== word.word.toLowerCase());
  const today = state.daily[todayKey()] || (state.daily[todayKey()] = { learned: 0, reviewed: 0, seconds: 0 });
  if (entry.passes === 0) { if (session.mode === "review") today.reviewed++; else today.learned++; }
  entry.passes++;
  addSeconds((Date.now() - session.wordStartedAt) / 1000);
  session.queue.shift();
  let mastered = false;
  if (grade === "known") { entry.streak += 1; mastered = entry.streak >= session.required; }
  else entry.streak = 0;
  if (mastered) session.completed++;
  else {
    const gap = grade === "again" ? Math.min(4, session.queue.length) : Math.min(3, session.queue.length);
    session.queue.splice(gap, 0, entry);
  }
  if (session.mode === "new") syncVocabularyStart(state.books.find(book => book.id === session.sourceBookId));
  persist();
  if (!session.queue.length) {
    const mode = session.mode;
    session = null;
    persist();
    renderShell();
    toast(mode === "review" ? "复习完成，进度已保存" : "本轮学习完成，进度已保存");
  } else {
    prepareWord();
    renderSession();
  }
}
function undoWord() {
  if (!session?.answered) return;
  const word = currentSessionWord();
  const record = getRecord(bookIdFor(word), word);
  record.seen = Math.max(0, record.seen - 1);
  if (session.answerGrade === "again") record.wrong = Math.max(0, record.wrong - 1);
  else record.correct = Math.max(0, record.correct - 1);
  session.answered = false;
  session.revealed = false;
  session.answerGrade = null;
  if (session.choice) session.choice.selected = null;
  renderSession();
}
function exitSession() {
  if (session) addSeconds((Date.now() - session.wordStartedAt) / 1000);
  persist();
  renderShell();
}
function renderReview() {
  const due = state.books.flatMap(book => dueWords(book.id).map(({ item, word }) => ({ book, item, word }))).sort((a, b) => a.item.dueAt - b.item.dueAt);
  const chunk = state.settings.reviewChunk;
  const startLabel = due.length ? `开始复习 · ${Math.min(due.length, chunk)}` : "开始复习";
  const metrics = [
    ["今天到期", due.length, "词"],
    ["已完成复习", todayStats().reviewed || 0, "词"],
    ["词书数量", state.books.length, "本"],
  ].map(([label, value, unit]) => `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}<span class="metric-unit">${unit}</span></div></div>`).join("");
  const rows = due.slice(0, 50).map(({ book, word }) => {
    const copy = `<div class="queue-row-copy"><div class="queue-word">${escapeHtml(word.word)}</div><div class="queue-meta">${escapeHtml(book.name)} · ${escapeHtml(word.meaning || "暂无释义")}</div></div>`;
    const open = `<div class="queue-actions"><button data-action="review-single" data-book="${escapeHtml(book.id)}" data-word="${escapeHtml(word.word)}">复习</button></div>`;
    return `<div class="queue-row"><span class="queue-priority"></span>${copy}${open}</div>`;
  }).join("");
  const list = due.length
    ? `<div class="review-queue">${rows}</div>`
    : `<section class="study-panel"><div class="empty-state"><div class="empty-mark">✓</div><strong>目前没有到期词条</strong><p>学习新词后，系统会根据掌握情况安排复习。</p><button class="secondary-button" data-view="home">去学习新词</button></div></section>`;
  const heading = `<div class="page-heading"><div><p class="eyebrow">按到期时间排序 · 每小结 ${chunk} 词</p><h1>复习队列</h1></div><button class="primary-button" data-action="start-review" ${due.length ? "" : "disabled"}>${startLabel}</button></div>`;
  const queueHead = '<div class="section-heading"><h2>待复习词条</h2></div>';
  document.getElementById("view-review").innerHTML = `${heading}<div class="overview-grid">${metrics}</div>${queueHead}${list}`;
}
const WORD_FILTERS = [["all", "全部"], ["new", "未学习"], ["learning", "复习中"], ["done", "复习完成"], ["known", "已标熟"], ["fav", "已收藏"]];
function wordMatchesFilter(word, book) {
  const record = getRecord(book.id, word);
  const known = isKnown(word, book.id);
  if (wordFilter === "fav") return state.favoriteWords.includes(recordKey(book.id, word));
  if (wordFilter === "known") return known;
  if (known) return false;
  if (wordFilter === "new") return record.box === 0;
  if (wordFilter === "learning") return record.box > 0 && record.box < 3;
  if (wordFilter === "done") return record.box >= 3;
  return true;
}
function renderWordRow(word, book) {
  const record = getRecord(book.id, word);
  const known = isKnown(word, book.id);
  const label = known ? "已标熟" : record.box >= 3 ? "复习完成" : record.box ? "复习中" : "未学习";
  const favorite = state.favoriteWords.includes(recordKey(book.id, word));
  const name = escapeHtml(word.word);
  const audio = `<button class="audio-mini" data-action="play-word" data-word="${name}">♪</button>`;
  const actions = `<button data-action="fav-word" data-word="${name}">${favorite ? "已收藏" : "收藏"}</button><button data-action="known-word" data-word="${name}">${known ? "取消标熟" : "标熟"}</button>`;
  return `<tr><td><span class="table-word">${audio}${name}</span></td><td>${escapeHtml(word.meaning || "")}</td><td><span class="word-state">${label}</span></td><td class="row-actions">${actions}</td></tr>`;
}
function renderBookManagementRow(book) {
  const stats = bookStats(book);
  return `<div class="book-management-row"><strong>${escapeHtml(book.name)}</strong><span>${book.words.length} 词条</span><span>${stats.learned} 已学</span><button class="danger-link" data-action="delete-book" data-book="${escapeHtml(book.id)}">删除本地词书</button></div>`;
}
function renderWords() {
  const root = document.getElementById("view-words");
  const book = currentBook();
  if (!book) { root.innerHTML = emptyHome(); return; }
  const needle = searchQuery.toLowerCase();
  const filtered = book.words.filter(word => wordMatchesFilter(word, book))
    .filter(word => `${word.word} ${word.meaning} ${word.example}`.toLowerCase().includes(needle));
  const heading = `<div class="page-heading"><div><p class="eyebrow">本地词书与学习记录</p><h1>词书浏览</h1></div><div class="heading-actions"><button class="quiet-link" id="help-button">格式说明</button><button class="primary-button" id="words-import">＋ 导入词书</button></div></div>`;
  const bookChips = state.books.map(item => `<button class="book-chip ${item.id === book.id ? "selected" : ""}" data-book="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${item.words.length}</button>`).join("");
  const selector = `<div class="book-selector">${bookChips}<button class="book-chip" id="books-export">导出词书与进度</button></div>`;
  const tabs = `<div class="filter-tabs">${WORD_FILTERS.map(([value, label]) => `<button class="filter-tab ${wordFilter === value ? "selected" : ""}" data-filter-tab="${value}">${label}</button>`).join("")}</div>`;
  const search = `<div class="filters"><input class="search-input" id="word-search" placeholder="搜索单词、释义或例句" value="${escapeHtml(searchQuery)}"><span class="date-label">显示 ${filtered.length} / ${book.words.length}</span></div>`;
  const bodyRows = filtered.slice(0, 300).map(word => renderWordRow(word, book)).join("") || '<tr><td colspan="4">没有匹配的词条</td></tr>';
  const head = "<thead><tr><th>单词</th><th>释义</th><th>状态</th><th>操作</th></tr></thead>";
  const table = `<div class="word-table"><table>${head}<tbody>${bodyRows}</tbody></table></div>`;
  const management = `<div class="book-management">${state.books.map(renderBookManagementRow).join("")}</div>`;
  root.innerHTML = `${heading}${selector}${tabs}${search}${table}${management}`;
}
function renderListen() {
  const book = currentBook();
  const root = document.getElementById("view-listen");
  if (!book || !book.words.length) { root.innerHTML = emptyHome(); return; }
  if (listen.index >= book.words.length) listen.index = 0;
  const word = book.words[listen.index];
  const upcoming = book.words.slice(listen.index, listen.index + 30);
  const heading = `<div class="page-heading"><div><p class="eyebrow">随身听 · 本地词表</p><h1>${escapeHtml(book.name)}</h1></div><div class="date-label">${listen.index + 1} / ${book.words.length}</div></div>`;
  const phonetic = phoneticOf(word);
  const phoneticBlock = phonetic ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phonetic)}` : "";
  const posBlock = word.partOfSpeech ? `· ${escapeHtml(word.partOfSpeech)}` : "";
  const wordLine = `<div class="listen-word">${escapeHtml(word.word.split(" / ")[0])}</div>`;
  const phoneticLine = `<div class="listen-phonetic">${phoneticBlock} ${posBlock}</div>`;
  const meaningLine = `<div class="listen-meaning">${escapeHtml(meaningOf(word))}</div>`;
  const exampleBlock = `<div class="listen-example"><p>${escapeHtml(word.example || "此词条没有收录例句")}</p><p class="muted">${escapeHtml(word.translation || "")}</p></div>`;
  const sleepLabel = listen.sleepMinutes ? `⏱ ${listen.sleepMinutes}分` : "⏱ 定时";
  const prevButton = '<button class="icon-toggle" data-action="listen-prev">◀</button>';
  const playButton = `<button class="listen-play" data-action="listen-play">${listen.playing ? "❚❚" : "▶"}</button>`;
  const nextButton = '<button class="icon-toggle" data-action="listen-next">▶</button>';
  const sleepButton = `<button class="icon-toggle" data-action="listen-sleep">${sleepLabel}</button>`;
  const controls = `<div class="listen-controls">${prevButton}${playButton}${nextButton}${sleepButton}</div>`;
  const main = `<section class="listen-main">${wordLine}${phoneticLine}${meaningLine}${exampleBlock}${controls}</section>`;
  const rows = upcoming.map((item, offset) => {
    const classes = `listen-row ${offset === 0 ? "current" : ""}`;
    return `<button class="${classes}" data-action="listen-jump" data-index="${listen.index + offset}"><span>${listen.index + offset + 1}</span><strong>${escapeHtml(item.word.split(" / ")[0])}</strong><small>${escapeHtml(item.meaning || "")}</small></button>`;
  }).join("");
  const list = `<aside class="listen-list"><div class="listen-list-head">词表</div>${rows}</aside>`;
  root.innerHTML = `${heading}<div class="listen-layout">${main}${list}</div>`;
}
async function loadListeningData() {
  try {
    const response = await fetch("./ielts/listening/listening179.json");
    if (!response.ok) throw new Error("HTTP " + response.status);
    listeningData = await response.json();
    listeningState.index = Math.min(state.listening.index || 0, Math.max(0, listeningData.length - 1));
    if (currentView === "listening") renderListening();
  } catch (error) {
    listeningState.message = "听力数据加载失败。请通过本地服务器打开本项目（不要直接双击 index.html）。";
    if (currentView === "listening") renderListening();
  }
}
function listeningAudioUrl(word) { return `./ielts/listening/179_audios/${encodeURIComponent(word)}.mp3`; }
function playListeningAudio(word) {
  const item = word || listeningData[listeningState.index];
  if (!item) return;
  stopAudio();
  const audio = new Audio(listeningAudioUrl(item.word));
  listen.audio = audio;
  audio.play().catch(() => speak(item.word));
}
function normalizeListenText(value) { return String(value || "").trim().toLowerCase().replace(/\s+/g, " "); }
function checkListening() {
  const item = listeningData[listeningState.index];
  if (!item) return;
  const wordInput = document.getElementById("listening-word");
  const synInput = document.getElementById("listening-syn");
  listeningState.typedWord = wordInput ? wordInput.value : listeningState.typedWord;
  listeningState.typedSyn = synInput ? synInput.value : listeningState.typedSyn;
  const typedWord = normalizeListenText(listeningState.typedWord);
  const typedSyns = listeningState.typedSyn.split(/[,，]/).map(normalizeListenText).filter(Boolean);
  const wordOk = typedWord === normalizeListenText(item.word);
  const missing = (item.replace || []).filter(syn => !typedSyns.includes(normalizeListenText(syn)));
  listeningState.result = { wordOk, missing, typedSyns };
  listeningState.revealed = true;
  if (wordOk && !missing.length) { state.listening.done[item.index] = true; persist(); }
  else delete state.listening.done[item.index];
  persist();
  renderListening();
}
function nextListening(step) {
  if (!listeningData.length) return;
  listeningState.index = (listeningState.index + step + listeningData.length) % listeningData.length;
  state.listening.index = listeningState.index;
  listeningState.revealed = false;
  listeningState.result = null;
  listeningState.typedWord = "";
  listeningState.typedSyn = "";
  persist();
  renderListening();
  playListeningAudio();
}
function renderListeningEmpty() {
  const message = escapeHtml(listeningState.message || "正在加载听力材料…");
  const heading = `<div class="page-heading"><div><p class="eyebrow">听力 179 考点词</p><h1>听力</h1></div><div class="date-label">本地材料</div></div>`;
  const body = `<section class="study-panel"><div class="empty-state"><div class="empty-mark">♫</div><strong>${message}</strong><p>文件位置：ielts/listening/listening179.json 与 179_audios/。</p><button class="secondary-button" data-action="load-listening">重新加载</button></div></section>`;
  return `${heading}${body}`;
}
// Draft input, grading feedback and the revealed answer for one dictation item.
function renderListeningCard(item, total) {
  const result = listeningState.result;
  const showAnswer = listeningState.revealed;
  const top = `<div class="listening-top"><span class="pill">${listeningState.index + 1} / ${total}</span><button class="word-tool" data-action="listening-play">▶ 播放音频</button><button class="word-tool" data-action="listening-reveal">${showAnswer ? "隐藏答案" : "显示答案"}</button></div>`;
  const wordInput = `<label>考点词<input id="listening-word" class="search-input" autocomplete="off" placeholder="听发音，输入单词或词组" value="${escapeHtml(listeningState.typedWord)}"></label>`;
  const synInput = `<label>同义替换（英文逗号分隔）<input id="listening-syn" class="search-input" autocomplete="off" placeholder="例如：book, reserve" value="${escapeHtml(listeningState.typedSyn)}"></label>`;
  const inputs = `<div class="listening-inputs">${wordInput}${synInput}</div>`;
  let feedback = "";
  if (result) {
    const grade = result.wordOk && !result.missing.length ? "ok" : "bad";
    const wordLine = result.wordOk ? "考点词正确" : `考点词错误：应为 <strong>${escapeHtml(item.word)}</strong>`;
    const synLine = result.missing.length ? `；还缺同义词：${result.missing.map(value => `<strong>${escapeHtml(value)}</strong>`).join("、")}` : "；同义替换完整";
    feedback = `<div class="listening-result ${grade}">${wordLine}${synLine}</div>`;
  }
  let answer = "";
  if (showAnswer) {
    const typeTag = item.type ? `<span class="tab-src">${escapeHtml(item.type)}</span>` : "";
    const chips = (item.replace || []).map(syn => {
      const hit = result && !result.missing.includes(syn) && result.typedSyns.includes(normalizeListenText(syn));
      return `<span class="chip ${hit ? "hit" : ""}">${escapeHtml(syn)}</span>`;
    }).join("");
    answer = `<div class="listening-answer"><div class="listening-answer-head"><strong>${escapeHtml(item.word)}</strong>${typeTag}<span class="tab-src">${escapeHtml(item.meaning || "")}</span></div><div class="chip-row">${chips}</div></div>`;
  }
  const prevAction = `<button class="secondary-button" data-action="listening-prev">← 上一题</button>`;
  const checkAction = `<button class="primary-button" data-action="listening-check">检查</button>`;
  const nextAction = `<button class="secondary-button" data-action="listening-next">下一题 →</button>`;
  const hint = '<p class="kbd-hint">回车检查；Tab 从考点词切到同义替换；按 ` 播放音频。</p>';
  const actions = `<div class="listening-actions">${prevAction}${checkAction}${nextAction}</div>${hint}`;
  return `<section class="listening-card">${top}${inputs}${feedback}${answer}${actions}</section>`;
}
function renderListeningRow(entry, index) {
  const classes = `listening-row ${index === listeningState.index ? "current" : ""} ${state.listening.done[entry.index] ? "done" : ""}`;
  const indexCell = `<span class="listening-index">${entry.index}</span>`;
  const wordCell = `<span class="listening-word">${escapeHtml(entry.word)}</span>`;
  const typeCell = `<span class="listening-type">${escapeHtml(entry.type || "")}</span>`;
  const meaningCell = `<span class="listening-meaning">${escapeHtml(entry.meaning || "")}</span>`;
  const synCell = `<span class="listening-syns">${escapeHtml((entry.replace || []).join(" / "))}</span>`;
  const playButton = `<button class="audio-mini" data-action="listening-play-one" data-word="${escapeHtml(entry.word)}">▶</button>`;
  return `<div class="${classes}" data-action="listening-jump" data-index="${index}">${indexCell}${wordCell}${typeCell}${meaningCell}${synCell}${playButton}</div>`;
}
function renderListeningTable() {
  const rows = listeningData.map(renderListeningRow).join("");
  return `<section class="listening-list-section"><div class="section-heading"><h2>全部考点词</h2><span class="date-label">点击行切换</span></div><div class="listening-table">${rows}</div></section>`;
}
function renderListening() {
  const root = document.getElementById("view-listening");
  const total = listeningData.length;
  const done = Object.keys(state.listening.done || {}).length;
  if (!total) { root.innerHTML = renderListeningEmpty(); return; }
  const heading = `<div class="page-heading"><div><p class="eyebrow">听力 179 考点词</p><h1>听力听写</h1></div><div class="date-label">已完成 ${done} / ${total}</div></div>`;
  root.innerHTML = `${heading}${renderListeningCard(listeningData[listeningState.index], total)}${renderListeningTable()}`;
}
function chipRow(values) {
  return `<div class="chip-row">${values.map(item => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div>`;
}
// "相关" tab: reading-538 synonyms first, then words sharing the meaning,
// and only when neither exists does it fall back to the whole word group.
function dictSynonymBody(selected, book, selectedGroup) {
  const related = relatedWordsOf(selected, book.id);
  const reading = readingSynonyms.get(wordBase(selected).toLowerCase());
  const readingSyns = reading?.synonyms || selected.synonyms || [];
  let body = "";
  if (readingSyns.length) {
    body += `<p class="tab-note">阅读 538 同义替换</p>${chipRow(readingSyns)}`;
  }
  if (related.length) {
    const rows = related.map(item => `<div class="collocation-row"><span class="collocation-text"><strong>${escapeHtml(item.word.word)}</strong> ${escapeHtml(item.word.meaning || "")}</span><span class="tab-src">释义匹配</span></div>`).join("");
    body += `<div class="collocation-list">${rows}</div>`;
  }
  if (!readingSyns.length && !related.length) {
    body += selectedGroup.length
      ? `${chipRow(selectedGroup)}<p class="tab-note">没有语义匹配，展示同组词。</p>`
      : '<p class="tab-empty">没有可匹配的相关词。</p>';
  }
  return body;
}
function dictDetail(selected, body) {
  if (!selected) return '<p class="tab-empty">搜索一个词开始。</p>';
  const phonetic = phoneticOf(selected);
  const phoneticBlock = phonetic ? `<span class="accent-tag">${accentLabel()}</span>${escapeHtml(phonetic)}` : "";
  const head = `<div class="dict-head"><div><h2>${escapeHtml(selected.word)}</h2><p class="dict-phonetic">${phoneticBlock}</p></div><button class="word-audio" data-action="play-word" data-word="${escapeHtml(selected.word)}">▶ 发音</button></div>`;
  return `${head}<div class="dict-body">${body}</div>`;
}
function renderDict() {
  const book = currentBook();
  const root = document.getElementById("view-dict");
  if (!book) { root.innerHTML = emptyHome(); return; }
  const query = dictQuery.trim().toLowerCase();
  const results = (query ? book.words.filter(word => `${word.word} ${word.meaning} ${word.example}`.toLowerCase().includes(query)) : book.words).slice(0, 30);
  const selected = (dictSelected && findWord(dictSelected, book.id)) || results[0] || null;
  const tabs = [["collins", "释义"], ["derive", "变形"], ["root", "词根"], ["synonym", "相关"], ["exam", "同组"], ["note", "笔记"]];
  let body = '<p class="tab-empty">没有匹配的词条。</p>';
  if (selected) {
    const key = recordKey(book.id, selected);
    const selectedGroup = groupWordsOf(selected);
    if (dictTab === "collins") {
      const example = escapeHtml(selected.example || "此词条没有收录例句");
      body = `<div class="dict-meaning">${escapeHtml(meaningOf(selected))}</div><p class="dict-example">${example}</p><p class="dict-trans">${escapeHtml(selected.translation || "")}</p>`;
    } else if (dictTab === "derive") {
      body = (selected.variants || []).length ? chipRow(selected.variants) : '<p class="tab-empty">没有派生形式。</p>';
    } else if (dictTab === "root") {
      body = selected.extra ? `<p class="dict-example">${escapeHtml(selected.extra)}</p>` : '<p class="tab-empty">没有词根词缀数据。</p>';
    } else if (dictTab === "synonym") {
      body = dictSynonymBody(selected, book, selectedGroup);
    } else if (dictTab === "exam") {
      body = selectedGroup.length ? chipRow(selectedGroup) : '<p class="tab-empty">没有同组词数据。</p>';
    } else if (dictTab === "note") {
      body = state.notes[key] ? `<p class="dict-example">${escapeHtml(state.notes[key])}</p>` : '<p class="tab-empty">还没有笔记，可在学习卡片中记录。</p>';
    }
  }
  const heading = `<div class="page-heading"><div><p class="eyebrow">本地词典 · 不联网</p><h1>词典</h1></div><div class="date-label">${book.name}</div></div>`;
  const searchRow = `<div class="dict-search"><input class="search-input" id="dict-search" placeholder="搜索单词、释义或例句" value="${escapeHtml(dictQuery)}"></div>`;
  const tabRow = `<div class="filter-tabs">${tabs.map(([value, label]) => `<button class="filter-tab ${dictTab === value ? "selected" : ""}" data-dict-tab="${value}">${label}</button>`).join("")}</div>`;
  const resultRows = results.map(word => {
    const classes = `dict-row ${selected === word ? "selected" : ""}`;
    const head = `<strong>${escapeHtml(word.word.split(" / ")[0])}</strong>`;
    const tail = `<small>${escapeHtml(word.meaning || "")}</small>`;
    return `<button class="${classes}" data-dict-word="${escapeHtml(word.word)}">${head}${tail}</button>`;
  }).join("") || '<p class="tab-empty">无结果</p>';
  root.innerHTML = `${heading}${searchRow}${tabRow}<div class="dict-layout"><div class="dict-results">${resultRows}</div><section class="dict-detail">${dictDetail(selected, body)}</section></div>`;
}
function sentenceCard(item) {
  const label = `<p class="sentence-cn"><span class="sentence-label">是什么意思</span>${escapeHtml(item.translation || "")}</p>`;
  const foot = `<div class="sentence-foot"><span>${escapeHtml(item.word)} · ${escapeHtml(item.source || "")}</span><button class="quiet-link" data-action="unfav-sentence" data-key="${escapeHtml(item.id)}">移除</button></div>`;
  return `<article class="sentence-card"><p class="sentence-en">${escapeHtml(item.sentence)}</p>${label}${foot}</article>`;
}
function renderSentences() {
  const root = document.getElementById("view-sentences");
  const items = state.favoriteSentences;
  const heading = `<div class="page-heading"><div><p class="eyebrow">收藏的例句</p><h1>例句库</h1><p class="page-sub">收藏学习卡片中的例句，英文原句下方标注它是什么意思。</p></div><div class="date-label">${items.length} 条</div></div>`;
  const empty = `<section class="study-panel"><div class="empty-state"><div class="empty-mark">¶</div><strong>还没有任何例句</strong><p>点击例句卡片的 ☆ 收藏例句，这里会显示英文原句和它是什么意思。</p><button class="secondary-button" data-view="home">去学习</button></div></section>`;
  root.innerHTML = `${heading}${items.length ? `<div class="sentence-list">${items.map(sentenceCard).join("")}</div>` : empty}`;
}
async function loadReferenceData() {
  try {
    const [readingModule, writingModule] = await Promise.all([
      import("./ielts/reading/reading538words.js"),
      import("./ielts/writing/100sentences.js")
    ]);
    readingGroups = readingModule.default || [];
    writingSentences = writingModule.default || [];
    readingSynonyms = new Map();
    readingGroups.forEach(group => (group.words || []).forEach(row => {
      const word = String(row[1] || "").toLowerCase().split(" / ")[0];
      if (!word) return;
      readingSynonyms.set(word, { synonyms: row[4] || [], meanings: row[3] || [], pos: row[2] || [], group: group.title || "" });
    }));
  } catch (error) {
    materialsMessage = "阅读/写作资料加载失败。请通过本地服务器打开本项目。";
  }
  try {
    const response = await fetch("./ielts/materials.json");
    if (response.ok) materialManifest = await response.json();
  } catch (error) { /* manifest is optional */ }
  if (currentView === "materials") renderMaterials();
}
function materialsEmpty(message) {
  const text = materialsMessage || message;
  return `<section class="materials-panel"><div class="empty-state"><strong>${text}</strong><button class="secondary-button" data-action="load-references">重新加载</button></div></section>`;
}
function materialsWritingBody(writing) {
  if (!writing.length) return materialsEmpty("写作资料未加载");
  // Titles and sentence cards share one ordered walk, so the section headers
  // stay in the position the source file put them.
  const parts = writingSentences.map(item => {
    if (item && item.title) return `<div class="writing-section">${escapeHtml(item.title)}</div>`;
    if (!item || !item.sentence) return "";
    const no = item.no ? `<span class="writing-no">${item.no}</span>` : "";
    const alt = item.chatgpt && item.chatgpt !== item.translationFromBook
      ? `<p class="writing-en alt">${escapeHtml(item.chatgpt)}</p>` : "";
    const remark = item.remark ? `<p class="tab-src">${escapeHtml(item.remark)}</p>` : "";
    return `<article class="writing-card"><p class="writing-cn">${no}${escapeHtml(item.sentence)}</p><p class="writing-en">${escapeHtml(item.translationFromBook || "")}</p>${alt}${remark}</article>`;
  }).join("");
  const head = `<div class="materials-head"><strong>写作 100 句</strong><span class="tab-src">${writing.length} 句 · 中文原句 + 参考译文</span></div>`;
  return `<section class="materials-panel">${head}${parts}</section>`;
}
function readingRow(row) {
  const word = `<span class="reading-word">${escapeHtml(row[1])}</span>`;
  const pos = `<span class="reading-pos">${escapeHtml((row[2] || []).join("."))}</span>`;
  const meaning = `<span class="reading-meaning">${escapeHtml((row[3] || []).join("；"))}</span>`;
  const syns = `<span class="reading-syns">${escapeHtml((row[4] || []).join(" / "))}</span>`;
  return `<div class="reading-row">${word}${pos}${meaning}${syns}</div>`;
}
function materialsReadingBody(readingCount) {
  if (!readingGroups.length) return materialsEmpty("阅读资料未加载");
  const groups = readingGroups.map(group => {
    const require = group.require ? ` · ${escapeHtml(group.require)}` : "";
    const head = `<div class="reading-group-head"><strong>${escapeHtml(group.title || "")}</strong><span class="tab-src">${escapeHtml(group.define || "")}${require}</span></div>`;
    const rows = (group.words || []).map(readingRow).join("");
    return `<div class="reading-group">${head}${rows}</div>`;
  }).join("");
  const head = `<div class="materials-head"><strong>阅读 538 考点词</strong><span class="tab-src">${readingGroups.length} 组 · ${readingCount} 词</span><button class="primary-button" data-action="import-reading-book">导入为词书</button></div>`;
  return `<section class="materials-panel">${head}${groups}</section>`;
}
function materialsGrammarBody() {
  const files = materialManifest.grammar || [];
  const links = files.map(file => {
    const href = `./ielts/grammar/${encodeURIComponent(file.name)}`;
    return `<a class="material-link" href="${href}" target="_blank" rel="noopener"><span class="material-link-name">${escapeHtml(file.name)}</span><span class="material-link-size">${Math.round(file.size / 1024)} KB</span><span class="material-link-open">打开 →</span></a>`;
  }).join("");
  const head = `<div class="materials-head"><strong>语法资料</strong><span class="tab-src">本地 PDF / SVG</span></div>`;
  return `<section class="materials-panel">${head}${files.length ? links : '<p class="tab-empty">没有找到语法资料文件。</p>'}</section>`;
}
function renderMaterials() {
  const root = document.getElementById("view-materials");
  const tabs = [["writing", "写作 100 句"], ["reading", "阅读 538 词"], ["grammar", "语法资料"]];
  const writing = writingSentences.filter(item => item && item.sentence);
  const readingCount = readingGroups.reduce((sum, group) => sum + (group.words || []).length, 0);
  let body = "";
  if (materialTab === "writing") body = materialsWritingBody(writing);
  if (materialTab === "reading") body = materialsReadingBody(readingCount);
  if (materialTab === "grammar") body = materialsGrammarBody();
  const heading = `<div class="page-heading"><div><p class="eyebrow">本地资料库</p><h1>资料</h1></div><div class="date-label">不联网 · 随项目分发</div></div>`;
  const tabRow = `<div class="filter-tabs">${tabs.map(([value, label]) => `<button class="filter-tab ${materialTab === value ? "selected" : ""}" data-material-tab="${value}">${label}</button>`).join("")}</div>`;
  root.innerHTML = `${heading}${tabRow}${body}`;
}
function importReadingBook() {
  if (!readingGroups.length) { toast("阅读资料未加载"); return; }
  const words = [];
  const seen = new Set();
  readingGroups.forEach(group => {
    const groupWords = (group.words || []).map(row => String(row[1]));
    (group.words || []).forEach(row => {
      const name = String(row[1] || "").trim();
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      const pos = (row[2] || []).join(".");
      const meaning = (row[3] || []).join("；");
      words.push({ word: name, variants: [name], meaning: `${pos} ${meaning}`.trim(), partOfSpeech: pos, synonyms: row[4] || [], category: group.title || "阅读 538", groupNumber: group.title || "", groupWords, audio: "" });
    });
  });
  const book = { id: "ielts-reading-538", name: "阅读 538 考点词", category: "阅读", createdAt: Date.now(), words };
  const index = state.books.findIndex(item => item.id === book.id);
  if (index < 0) state.books.push(book); else state.books[index] = book;
  currentBookId = book.id;
  persist(); currentView = "home"; renderShell();
  toast(`已导入阅读 538 词书（${words.length} 词）`);
}
function renderSettings() {
  const s = state.settings;
  const row = (label, desc, control) => `<div class="settings-row"><div><strong>${label}</strong>${desc ? `<small>${desc}</small>` : ""}</div>${control}</div>`;
  const toggle = (key, on) => `<button class="switch ${on ? "on" : ""}" data-toggle="${key}" role="switch" aria-checked="${on}"></button>`;
  const options = (key, values, value) => `<select class="setting-select" data-setting="${key}">${values.map(([v, label]) => `<option value="${v}" ${String(v) === String(value) ? "selected" : ""}>${label}</option>`).join("")}</select>`;
  const fontStepper = `<span class="font-stepper"><button type="button" data-font-step="-1" aria-label="减小全局字号">−</button><output>${s.globalFontSize > 0 ? `+${s.globalFontSize}` : s.globalFontSize}px</output><button type="button" data-font-step="1" aria-label="增大全局字号">+</button></span>`;
  const windowButton = (cmd, label) => `<button class="secondary-button" type="button" data-window="${cmd}">${label}</button>`;
  const windowActions = `<span class="window-actions">${windowButton("minimize", "最小化")}${windowButton("maximize", "最大化")}${windowButton("close", "关闭")}</span>`;
  const accentToggle = `<button class="segmented" data-action="toggle-accent"><span class="${s.accent === "uk" ? "on" : ""}">英式</span><span class="${s.accent === "us" ? "on" : ""}">美式</span></button>`;
  const rows = [
    row("窗口操作", "控制应用窗口", windowActions),
    row("全局字号", "所有页面文字整体调整，每次改变 1px", fontStepper),
    row("单词发音类型", "", accentToggle),
    row("自动发音", "进入卡片时自动播放", toggle("autoPronounce", s.autoPronounce)),
    row("拼写", "学习、复习时提供拼写提示", toggle("spellHint", s.spellHint)),
    row("学习节奏", "每组新词数量", options("groupSize", [[10, "10 词/组"], [20, "20 词/组"], [30, "30 词/组"]], s.groupSize)),
    row("复习节奏", "每次复习小结数量", options("reviewChunk", [[50, "50 词/小结"], [100, "100 词/小结"], [150, "150 词/小结"]], s.reviewChunk)),
    row("听音选义题型", "听到发音后选择释义", toggle("listeningQuiz", s.listeningQuiz)),
    row("答题后显示音节标记", "答题后在单词中显示音节分隔点", toggle("showSyllableMarks", s.showSyllableMarks !== false)),
    row("拆分助记", "学习时自动拆分单词", toggle("splitMnemonic", s.splitMnemonic)),
    row("混淆项辨析", "显示选择题错误选项词义", toggle("confuseAnalyze", s.confuseAnalyze)),
    row("助记顺序", "调整学习卡片内容顺序", `<button class="quiet-link" data-action="order-open">${orderOpen ? "收起" : "调整"}</button>`),
  ].join("");
  const appearanceRow = row("外观与沉浸场景", "主题、字体与背景", '<button class="quiet-link" data-view="appearance">前往 →</button>');
  const heading = '<div class="page-heading"><div><p class="eyebrow">学习设置</p><h1>学习偏好</h1></div><div class="date-label">仅保存在本设备</div></div>';
  const orderCard = orderOpen ? renderOrderEditor() : "";
  const appearanceCard = `<section class="settings-card">${appearanceRow}</section>`;
  document.getElementById("view-settings").innerHTML = `${heading}<section class="settings-card">${rows}</section>${orderCard}${appearanceCard}`;
}
function orderRow(tab, index) {
  const total = tabOrder().length;
  const up = `<button data-action="order-move" data-index="${index}" data-dir="-1" ${index === 0 ? "disabled" : ""}>↑</button>`;
  const down = `<button data-action="order-move" data-index="${index}" data-dir="1" ${index === total - 1 ? "disabled" : ""}>↓</button>`;
  return `<div class="order-row"><span>${TAB_LABELS[tab]}</span><div class="order-actions">${up}${down}</div></div>`;
}
function renderOrderEditor() {
  const head = `<div class="settings-row"><div><strong>助记顺序</strong><small>从上到下排列，使用箭头调整</small></div></div>`;
  const rows = tabOrder().map(orderRow).join("");
  return `<section class="settings-card order-card">${head}${rows}</section>`;
}
function appearanceSwitchRow(label, desc, key, on, ariaLabel = "") {
  const aria = ariaLabel ? ` aria-label="${ariaLabel}"` : "";
  return `<div class="settings-row"><div><strong>${label}</strong><small>${desc}</small></div><button class="switch ${on ? "on" : ""}" data-toggle="${key}" role="switch" aria-checked="${on}"${aria}></button></div>`;
}
function renderAppearance() {
  const s = state.settings;
  const themes = [["light", "明亮"], ["deep", "深邃"], ["night", "极夜"]];
  const opacityPercent = Math.round(Math.max(0, (s.glassOpacity ?? DEFAULT_SETTINGS.glassOpacity) * 100));
  const fontSelect = (key, options, value, label) => {
    const choices = Object.entries(options)
      .map(([id, option]) => `<option value="${id}" ${value === id ? "selected" : ""}>${option.label}</option>`)
      .join("");
    const select = `<select class="setting-select font-select" data-font-family="${key}" aria-label="${label}">${choices}</select>`;
    return `<label class="font-select-row"><span>${label}</span>${select}</label>`;
  };
  const themeCards = themes.map(([value, label]) => `<button class="theme-card ${s.theme === value ? "selected" : ""}" data-theme-set="${value}"><span class="theme-preview ${value}"></span><strong>${label}</strong></button>`).join("");
  // 0% is a legitimate setting but it strips every panel to fully transparent,
  // which reads as a broken UI; say so rather than silently looking wrong.
  const clearWarning = s.glassEnabled && opacityPercent === 0
    ? '<small class="opacity-warning">当前为完全透明，背景内容可能看不清；把滑块往右调即可恢复。侧栏始终保留一层淡色底。</small>'
    : "";
  const heading = `<div class="page-heading"><div><p class="eyebrow">外观</p><h1>主题与字体</h1></div><div class="date-label">跟随系统时可自动切换</div></div>`;
  const themeGrid = `<div class="theme-grid">${themeCards}</div>`;
  const glassRow = appearanceSwitchRow("透明窗口", "窗口右上角的 ⠿ 可拖动，也可按住 Alt 拖动页面", "glassEnabled", s.glassEnabled, "透明窗口");
  const opacityHint = `<strong>透明度</strong><small>0% 背景透明，100% 不透明</small>${clearWarning}`;
  const slider = `<label class="opacity-control"><input type="range" min="0" max="100" step="1" value="${opacityPercent}" data-glass-opacity aria-label="透明度" ${s.glassEnabled ? "" : "disabled"}><output data-glass-opacity-value>${opacityPercent}%</output></label>`;
  const opacityRow = `<div class="settings-row"><div>${opacityHint}</div>${slider}</div>`;
  const followRow = appearanceSwitchRow("跟随系统", "根据系统深浅色自动切换", "followSystem", s.followSystem);
  const chineseFont = fontSelect("chineseFont", FONT_OPTIONS.chinese, s.chineseFont || DEFAULT_SETTINGS.chineseFont, "中文字体");
  const englishFont = fontSelect("englishFont", FONT_OPTIONS.english, s.englishFont || DEFAULT_SETTINGS.englishFont, "英文字体");
  const card = `<section class="settings-card">${glassRow}${opacityRow}${followRow}<div class="font-family-grid">${chineseFont}${englishFont}</div></section>`;
  document.getElementById("view-appearance").innerHTML = `${heading}${themeGrid}${card}`;
}
function toast(message) { const node = document.getElementById("toast"); node.textContent = message; node.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove("show"), 2600); }
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cixu-backup-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  toast("已导出词书与学习进度");
}
async function importFile(file) {
  try {
    if (file.size > MAX_JSON_BYTES) throw new Error("文件过大（上限 32 MB），请拆分后再导入");
    const text = await file.text();
    if (file.name.toLowerCase().endsWith(".json")) {
      const parsed = JSON.parse(text);
      if (isPlainObject(parsed) && Array.isArray(parsed.books) && isPlainObject(parsed.records) && isPlainObject(parsed.reviews)) {
        const books = parsed.books.filter(book => isPlainObject(book) && typeof book.id === "string" && Array.isArray(book.words)).slice(0, MAX_BOOKS);
        if (!books.length) throw new Error("备份文件里没有可用的词书");
        state = {
          ...parsed,
          books,
          notes: parsed.notes || {},
          favoriteWords: parsed.favoriteWords || [],
          favoriteSentences: parsed.favoriteSentences || [],
          likes: parsed.likes || {},
          known: parsed.known || {},
          checkins: parsed.checkins || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
        session = state.session?.queue?.length ? state.session : null;
        currentBookId = books.some(book => book.id === state.activeBookId) ? state.activeBookId : books[0].id;
        const importedIelts = state.books.find(book => book.id === IELTS_BOOK_ID);
        if (importedIelts) syncVocabularyStart(importedIelts);
        persist(); applyTheme(); currentView = "home"; renderShell(); toast("已恢复词书与学习进度"); return;
      }
    }
    const imported = parseImport(text, file.name);
    const unique = new Map();
    let skipped = 0;
    imported.words.forEach(word => {
      if (!word?.word || !word.meaning || word.word.length > MAX_FIELD_CHARS) { skipped++; return; }
      unique.set(word.word.toLowerCase(), word);
    });
    if (!unique.size) throw new Error("没有有效词条；每个词条必须包含单词和中文释义");
    if (unique.size > MAX_IMPORT_WORDS) throw new Error(`词条过多（上限 ${MAX_IMPORT_WORDS} 条），请拆分后再导入`);
    if (state.books.length >= MAX_BOOKS) throw new Error(`词书数量已达上限（${MAX_BOOKS} 本），请先删除不需要的词书`);
    const id = `book-${Date.now().toString(36)}`;
    state.books.push({ id, name: clampText(imported.name) || "导入词书", category: "导入", createdAt: Date.now(), words: [...unique.values()] }); currentBookId = id; persist(); currentView = "home"; renderShell(); toast(`已导入 ${unique.size} 个词条${skipped ? `，跳过 ${skipped} 个无效词条` : ""}`);
  } catch (error) { showModal("导入失败", error.message || "无法读取该文件"); }
}
function showModal(title, message, confirmLabel = "关闭", onConfirm, cancelLabel = "取消") {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  const cancelButton = `<button class="secondary-button" data-modal-cancel>${escapeHtml(cancelLabel)}</button>`;
  const confirmButton = `<button class="primary-button" data-modal-confirm>${escapeHtml(confirmLabel)}</button>`;
  const body = `<div class="modal"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p><div class="modal-actions">${cancelButton}${confirmButton}</div></div>`;
  backdrop.innerHTML = body;
  document.body.append(backdrop);
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop || event.target.closest("[data-modal-cancel]")) backdrop.remove();
    if (event.target.closest("[data-modal-confirm]")) { backdrop.remove(); onConfirm?.(); }
  });
}
function startFromSelectedScope() {
  const book = currentBook();
  if (!book) return;
  const start = Math.max(1, Number(state.settings.vocabularyStart) || 1);
  const category = state.settings.vocabularyCategory || "all";
  const first = wordsForScope(book, category)[start - 1];
  const description = `${category === "all" ? "全部主题" : category}，第 ${start} 词${first ? `「${first.word}」` : ""}`;
  const begin = () => startSession("new", { replace: true, fromScope: true });
  if (session?.queue?.length) {
    showModal("放弃之前的学习进度？", `当前还有未完成的${session.mode === "review" ? "复习" : "学习"}进度。选择“是”将放弃该进度，并从${description}开始；选择“否”则保留原进度。`, "是，从此起点开始", begin, "否，保留进度");
  } else begin();
}
function speak(text) { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); const utter = new SpeechSynthesisUtterance(text); utter.lang = state.settings.accent === "us" ? "en-US" : "en-GB"; window.speechSynthesis.speak(utter); } else toast("此浏览器不支持系统语音"); }
function stopAudio() { if (listen.audio) { listen.audio.pause(); listen.audio = null; } }
// Word-level mp3 audio is not distributed with this project (see loadIeltsBook),
// so remember URLs that failed: without this the same 404 was re-requested on
// every card, delaying the speech-synthesis fallback by a network round trip.
const missingAudio = new Set();
function playAudio(word) {
  if (!word) return;
  stopAudio();
  const source = wordAudioPath(word);
  const spoken = String(word.word).split(" / ")[0];
  if (!source || missingAudio.has(source)) { speak(spoken); return; }
  const audio = new Audio(source);
  listen.audio = audio;
  audio.onended = () => { if (listen.playing && currentView === "listen") listenNext(true); };
  audio.play().catch(() => { missingAudio.add(source); speak(spoken); });
  audio.onerror = () => { missingAudio.add(source); };
}
function playWord(wordText) { const word = findWord(wordText); if (word) playAudio(word); else speak(wordText); }
function listenNext(auto) {
  const book = currentBook(); if (!book) return;
  listen.index = (listen.index + 1) % book.words.length;
  persist(); renderListen();
  if (auto || listen.playing) playAudio(book.words[listen.index]);
}
function toggleListenPlay() {
  const book = currentBook(); if (!book) return;
  if (listen.playing) { listen.playing = false; stopAudio(); }
  else { listen.playing = true; playAudio(book.words[listen.index]); }
  renderListen();
}
// Cycle the sleep timer: off → 15 → 30 → 60 minutes, restarting the countdown.
function cycleSleepTimer() {
  const values = [0, 15, 30, 60];
  listen.sleepMinutes = values[(values.indexOf(listen.sleepMinutes) + 1) % values.length];
  clearTimeout(listen.sleepTimer);
  if (listen.sleepMinutes) {
    listen.sleepTimer = setTimeout(() => {
      listen.playing = false;
      stopAudio();
      renderListen();
    }, listen.sleepMinutes * 60000);
  }
  renderListen();
}
function toggleFavWord(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  const index = state.favoriteWords.indexOf(key);
  if (index >= 0) { state.favoriteWords.splice(index, 1); toast("已取消收藏"); }
  else { state.favoriteWords.push(key); toast("已收藏"); }
  persist();
  if (session) renderSession(); else renderShell();
}
function toggleKnown(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  if (state.known[key]) { delete state.known[key]; toast("已取消标熟"); }
  else {
    state.known[key] = true;
    state.reviews[bookId] = (state.reviews[bookId] || []).filter(item => item.word !== word.word.toLowerCase());
    toast("已标熟，不再安排学习与复习");
  }
  persist();
  if (session) renderSession(); else renderShell();
}
function toggleLike(word, bookId = bookIdFor(word)) {
  const key = recordKey(bookId, word);
  if (state.likes[key]) { delete state.likes[key]; }
  else state.likes[key] = 1;
  persist();
  if (session) renderSession();
}
// A favourite sentence is identified by word + the first 24 chars of its example,
// because one word can carry several examples across editions.
function favoriteSentenceId(bookId, word) {
  return `${recordKey(bookId, word)}|${String(word.example || "").slice(0, 24)}`;
}
function isFavoriteSentence(word, bookId = bookIdFor(word)) {
  if (!word?.example) return false;
  const id = favoriteSentenceId(bookId, word);
  return state.favoriteSentences.some(item => item.id === id);
}
function toggleFavSentence(word, bookId = bookIdFor(word)) {
  if (!word.example) return toast("此词条没有例句");
  const id = favoriteSentenceId(bookId, word);
  const index = state.favoriteSentences.findIndex(item => item.id === id);
  if (index >= 0) { state.favoriteSentences.splice(index, 1); toast("已取消收藏例句"); }
  else { state.favoriteSentences.push({ id, word: word.word, sentence: word.example, translation: word.translation || "", source: word.category || "" }); toast("已收藏例句"); }
  persist();
}
function toggleCheckin() {
  const key = todayKey();
  if (state.checkins.includes(key)) { toast("今天已经签到"); return; }
  state.checkins.push(key); persist(); renderHome(); toast("签到成功");
}

document.addEventListener("click", event => {
  const windowCommand = event.target.closest("[data-window]")?.dataset.window;
  // "drag" is driven from mousedown (see the listener above); re-sending it on
  // click would ask the shell to start a drag after the button was released.
  if (windowCommand && windowCommand !== "drag") window.ipc?.postMessage(`window:${windowCommand}`);
  const pinButton = event.target.closest('[data-action="pin-window"]');
  if (pinButton) { event.preventDefault(); togglePinWindow(); return; }
  const scopeField = event.target.closest("[data-scope]");
  if (scopeField && !event.target.closest("[data-step]")) return;
  if (event.target.closest("#sidebar-toggle")) {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem("cixu-sidebar", sidebarCollapsed ? "1" : "0");
    applySidebar();
    return;
  }
  const nav = event.target.closest("[data-view]"); if (nav) { if (session) exitSession(); currentView = nav.dataset.view; renderShell(); return; }
  const bookButton = event.target.closest("[data-book]"); if (bookButton && !bookButton.dataset.action) { currentBookId = bookButton.dataset.book; if (session && session.sourceBookId !== currentBookId) { session = null; persist(); } else persist(); renderShell(); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  const scopeWord = event.target.closest("[data-scope-word]");
  if (scopeWord) {
    const book = currentBook();
    const word = book?.words[Number(scopeWord.dataset.scopeWord)];
    if (word) {
      state.settings.vocabularyCategory = word.category || "all";
      const scopedWords = wordsForScope(book, state.settings.vocabularyCategory);
      state.settings.vocabularyStart = scopedWords.indexOf(word) + 1;
      scopeSearchQuery = "";
      persist();
      renderHome();
      toast(`学习起点已设为「${word.word}」`);
    }
    return;
  }
  if (action === "start-new") startSession("new");
  if (action === "start-from-scope") startFromSelectedScope();
  if (action === "resume-session") startSession(session?.mode || "new");
  if (event.target.closest("[data-step]")) {
    const input = document.querySelector('[data-scope="vocabularyStart"]');
    const step = Number(event.target.closest("[data-step]").dataset.step);
    const max = currentBook()?.words.length || 1;
    input.value = Math.max(1, Math.min(max, (Number(input.value) || 1) + step));
    updateScopeWordPreview(input);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  if (action === "start-review") startSession("review");
  if (action === "continue") continueWord();
  if (action === "undo") undoWord();
  if (action === "reveal") revealAnswer();
  if (action === "spell") { if (session && !session.answered) { session.spelling = true; renderSession(); } }
  if (action === "cancel-spell") { if (session) { session.spelling = false; renderSession(); } }
  if (action === "check-spell") {
    const input = document.getElementById("spell-input");
    if (session && input && !session.answered) {
      const target = currentSessionWord().word.split(" / ")[0].split(" ")[0].toLowerCase();
      const value = input.value.trim().toLowerCase();
      session.spelling = false;
      markAnswer(value === target ? "known" : "again");
      session.answerSource = "spelling";
      session.revealed = true;
      renderSession();
      toast(value === target ? "拼写正确" : `拼写错误：${target}`);
    }
  }
  if (action === "exit-session") exitSession();
  if (action === "fav-word") { const word = action && event.target.closest("[data-word]") ? findWord(event.target.closest("[data-word]").dataset.word) : currentSessionWord(); if (word) toggleFavWord(word); }
  if (action === "like") { const word = currentSessionWord(); if (word) toggleLike(word); }
  if (action === "known") { const word = currentSessionWord(); if (word) toggleKnown(word); }
  if (action === "known-word") { const word = findWord(event.target.closest("[data-word]").dataset.word); if (word) toggleKnown(word); }
  if (action === "gen-note") {
    const word = currentSessionWord();
    if (word) {
      const draft = generatedNote(word, bookIdFor(word));
      session.noteDraft = draft;
      state.notes[recordKey(bookIdFor(word), word)] = draft;
      persist();
      const input = document.getElementById("note-input");
      if (input) input.value = draft;
      toast("已生成参考笔记，可继续编辑");
    }
  }
  if (action === "fav-sentence") {
    // Works from a study card and from the dictionary detail pane.
    const word = currentSessionWord() || (dictSelected ? findWord(dictSelected) : null);
    if (word) {
      toggleFavSentence(word);
      if (currentView === "dict") renderDict(); else renderSession();
    }
  }
  if (action === "unfav-sentence") { const id = event.target.closest("[data-key]").dataset.key; state.favoriteSentences = state.favoriteSentences.filter(item => item.id !== id); persist(); renderSentences(); }
  if (action === "play-audio") { const word = currentSessionWord(); if (word) playAudio(word); }
  if (action === "play-word") playWord(event.target.closest("[data-word]").dataset.word);
  if (action === "checkin") toggleCheckin();
  if (action === "open-favorites") { wordFilter = "fav"; currentView = "words"; renderShell(); }
  if (action === "toggle-accent") { state.settings.accent = state.settings.accent === "uk" ? "us" : "uk"; persist(); if (session) renderSession(); else renderShell(); }
  if (action === "order-open") { orderOpen = !orderOpen; renderSettings(); }
  if (action === "order-move") {
    const index = Number(event.target.closest("[data-index]").dataset.index);
    const direction = Number(event.target.closest("[data-dir]").dataset.dir);
    const order = tabOrder();
    const swap = index + direction;
    if (swap >= 0 && swap < order.length) { [order[index], order[swap]] = [order[swap], order[index]]; state.settings.mnemonicOrder = order; persist(); }
    renderSettings();
  }
  if (action === "delete-book") {
    const bookId = event.target.closest("[data-book]").dataset.book;
    showModal("删除本地词书？", "该词书及其本设备上的学习进度都会删除。此操作无法撤销。", "删除", () => {
      state.books = state.books.filter(book => book.id !== bookId);
      delete state.reviews[bookId];
      Object.keys(state.records).filter(key => key.startsWith(`${bookId}:`)).forEach(key => delete state.records[key]);
      currentBookId = state.books[0]?.id || null;
      persist();
      renderShell();
    });
  }
  if (action === "review-single") {
    const bookId = event.target.closest("[data-book]").dataset.book;
    const text = event.target.closest("[data-word]").dataset.word;
    const book = state.books.find(item => item.id === bookId);
    const word = book?.words.find(item => item.word === text);
    if (word) {
      session = createSession("review", [word], book.id, book.id);
      currentView = "review";
      prepareWord();
      renderShell();
      renderSession();
    }
  }
  if (action === "listen-prev") { const book = currentBook(); if (book) { listen.index = (listen.index - 1 + book.words.length) % book.words.length; renderListen(); if (listen.playing) playAudio(book.words[listen.index]); } }
  if (action === "listen-next") listenNext(false);
  if (action === "listen-play") toggleListenPlay();
  if (action === "listen-sleep") cycleSleepTimer();
  if (action === "listen-jump") {
    const index = Number(event.target.closest("[data-index]").dataset.index);
    listen.index = index;
    renderListen();
    if (listen.playing) playAudio(currentBook().words[index]);
  }
  if (action === "load-listening") loadListeningData();
  if (action === "listening-play") playListeningAudio();
  if (action === "listening-play-one") playListeningAudio({ word: event.target.closest("[data-word]").dataset.word });
  if (action === "listening-reveal") { listeningState.revealed = !listeningState.revealed; renderListening(); }
  if (action === "listening-check") checkListening();
  if (action === "listening-prev") nextListening(-1);
  if (action === "listening-next") nextListening(1);
  if (action === "listening-jump") {
    listeningState.index = Number(event.target.closest("[data-index]").dataset.index);
    state.listening.index = listeningState.index;
    listeningState.revealed = false;
    listeningState.result = null;
    listeningState.typedWord = "";
    listeningState.typedSyn = "";
    persist();
    renderListening();
  }
  const themeButton = event.target.closest("[data-theme-set]"); if (themeButton) { state.settings.theme = themeButton.dataset.themeSet; state.settings.followSystem = false; persist(); applyTheme(); renderAppearance(); }
  const filterTab = event.target.closest("[data-filter-tab]"); if (filterTab) { wordFilter = filterTab.dataset.filterTab; renderWords(); }
  const dictTabButton = event.target.closest("[data-dict-tab]"); if (dictTabButton) { dictTab = dictTabButton.dataset.dictTab; renderDict(); }
  const materialTabButton = event.target.closest("[data-material-tab]"); if (materialTabButton) { materialTab = materialTabButton.dataset.materialTab; renderMaterials(); }
  const fontButton = event.target.closest("[data-font-step]"); if (fontButton) {
    const step = Number(fontButton.dataset.fontStep);
    state.settings.globalFontSize = Math.max(-2, Math.min(6, (state.settings.globalFontSize || 0) + step));
    persist();
    applyTheme();
    renderSettings();
    normalizeChoiceHeights();
    return;
  }
  if (action === "import-reading-book") importReadingBook();
  if (action === "load-references") loadReferenceData();
  const dictRow = event.target.closest("[data-dict-word]"); if (dictRow) { dictSelected = dictRow.dataset.dictWord; renderDict(); }
  const toggleButton = event.target.closest("[data-toggle]"); if (toggleButton) { const key = toggleButton.dataset.toggle; state.settings[key] = !state.settings[key]; persist(); applyTheme(); if (currentView === "settings") renderSettings(); else renderAppearance(); }
  const choiceButton = event.target.closest("[data-choice]"); if (choiceButton) { const index = Number(choiceButton.dataset.choice); if (session?.answered) inspectChoice(index); else chooseOption(index); }
  const collocationButton = event.target.closest("[data-collocation]"); if (collocationButton && session) {
    const index = Number(collocationButton.dataset.collocation);
    const item = collocationsOf(currentSessionWord())[index];
    if (item) {
      session.collocationTranslations ||= {};
      session.collocationTranslations[index] = !session.collocationTranslations[index];
      persist();
      renderSession();
    }
  }
  const studyTab = event.target.closest("[data-study-tab]")?.dataset.studyTab; if (studyTab) { activeStudyTab = studyTab; renderSession(); }
  if (event.target.closest("#backup-button") || event.target.closest("#books-export")) exportBackup();
  if (event.target.closest("#import-button") || event.target.closest("#words-import") || event.target.closest("#empty-import")) document.getElementById("file-input").click();
  if (event.target.closest("#help-button")) document.getElementById("help-dialog").showModal();
  const grade = event.target.closest("[data-grade]")?.dataset.grade; if (grade && session) gradeWord(grade);
});
document.getElementById("file-input").addEventListener("change", event => { const file = event.target.files[0]; if (file) importFile(file); event.target.value = ""; });
document.addEventListener("input", event => {
  if (event.target.matches("[data-glass-opacity]")) {
    const value = Math.max(0, Math.min(100, Number(event.target.value)));
    state.settings.glassOpacity = value / 100;
    document.documentElement.style.setProperty("--glass-opacity", state.settings.glassOpacity);
    document.documentElement.style.setProperty("--glass-alpha", `${value}%`);
    document.body.dataset.glass = !state.settings.glassEnabled || value === 100 ? "off" : value === 0 ? "clear" : "on";
    document.body.dataset.glassOpacity = String(value);
    const output = document.querySelector("[data-glass-opacity-value]");
    if (output) output.value = `${value}%`;
    persist();
    applyTheme();
    syncNativeGlass(Boolean(state.settings.glassEnabled));
  }
  if (event.target.matches("[data-scope-search]")) {
    scopeSearchQuery = event.target.value;
    const position = event.target.selectionStart;
    renderHome();
    const input = document.querySelector("[data-scope-search]");
    input?.focus();
    input?.setSelectionRange(position, position);
  }
  if (event.target.matches('[data-scope="vocabularyStart"]')) updateScopeWordPreview(event.target);
  if (event.target.id === "word-search") { searchQuery = event.target.value; const position = event.target.selectionStart; renderWords(); const input = document.getElementById("word-search"); input.focus(); input.setSelectionRange(position, position); }
  if (event.target.id === "dict-search") { dictQuery = event.target.value; dictSelected = null; const position = event.target.selectionStart; renderDict(); const input = document.getElementById("dict-search"); input.focus(); input.setSelectionRange(position, position); }
  if (event.target.id === "listening-word") listeningState.typedWord = event.target.value;
  if (event.target.id === "listening-syn") listeningState.typedSyn = event.target.value;
  if (event.target.id === "note-input" && session) { const word = currentSessionWord(); session.noteDraft = event.target.value; if (word) state.notes[recordKey(bookIdFor(word), word)] = event.target.value; clearTimeout(noteTimer); noteTimer = setTimeout(persist, 400); }
});
function updateScopeWordPreview(input) {
  const book = currentBook();
  if (!book) return;
  const value = String(input.value).replace(/\D/g, "");
  if (input.value !== value) input.value = value;
  const scopedWords = wordsForScope(book, state.settings.vocabularyCategory || "all");
  const index = Math.max(1, Math.min(scopedWords.length || 1, Number(value) || 1)) - 1;
  const word = scopedWords[index];
  const preview = document.getElementById("scope-word-preview");
  if (preview) preview.textContent = word ? `${word.word}${word.category ? ` · ${word.category}` : ""}` : "超出词书范围";
}
document.addEventListener("change", event => {
  const scope = event.target.closest("[data-scope]");
  if (scope) {
    const key = scope.dataset.scope;
    if (key === "vocabularyCategory") {
      state.settings.vocabularyCategory = scope.value;
      state.settings.vocabularyStart = 1;
      persist();
      renderHome();
      toast("主题已切换，起始词已回到该主题第 1 个词");
      event.stopPropagation();
      return;
    }
    const scopedWords = wordsForScope(currentBook(), state.settings.vocabularyCategory || "all");
    state.settings[key] = Math.max(1, Math.min(scopedWords.length || 1, Number(scope.value) || 1));
    persist();
    if (key === "vocabularyStart") {
      scope.value = state.settings[key];
      updateScopeWordPreview(scope);
    }
    toast("新词范围已保存");
    event.stopPropagation();
    return;
  }
  const select = event.target.closest("[data-setting]");
  if (select) {
    const key = select.dataset.setting;
    state.settings[key] = Number(select.value) || select.value;
    persist();
    toast("已保存设置");
  }
  const fontSelect = event.target.closest("[data-font-family]");
  if (fontSelect) {
    state.settings[fontSelect.dataset.fontFamily] = fontSelect.value;
    persist();
    applyTheme();
    return;
  }
  const glassOpacity = event.target.closest("[data-glass-opacity]");
  if (glassOpacity) {
    state.settings.glassOpacity = Math.max(0, Math.min(100, Number(glassOpacity.value))) / 100;
    persist();
    applyTheme();
    return;
  }
});
document.addEventListener("keydown", event => {
  if (event.target.matches('[data-scope="vocabularyStart"]') && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    event.preventDefault();
    const input = event.target;
    const max = wordsForScope(currentBook(), state.settings.vocabularyCategory || "all").length || 1;
    const delta = event.key === "ArrowUp" ? 1 : -1;
    input.value = Math.max(1, Math.min(max, (Number(input.value) || 1) + delta));
    updateScopeWordPreview(input);
    input.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (event.target.id === "listening-word" || event.target.id === "listening-syn") {
    if (event.key === "Enter") { event.preventDefault(); checkListening(); return; }
    if (event.key === "`") { event.preventDefault(); playListeningAudio(); return; }
  }
  if (event.target.id === "spell-input" && event.key === "Enter") { event.preventDefault(); document.querySelector('[data-action="check-spell"]')?.click(); return; }
  if (!session || document.querySelector("dialog[open]")) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (session.answered) document.querySelector('[data-action="undo"]')?.click();
    else if (!session.choice) document.querySelector('[data-grade="again"]')?.click();
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!session.answered && !session.choice) document.querySelector('[data-grade="unsure"]')?.click();
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    if (session.answered) document.querySelector('[data-action="continue"]')?.click();
    else if (session.choice) document.querySelector('[data-action="reveal"]')?.click();
    else if (!session.choice) document.querySelector('[data-grade="known"]')?.click();
    return;
  }
  if (event.code === "Space") { event.preventDefault(); if (session.answered) continueWord(); else if (session.choice) revealAnswer(); else gradeWord("unsure"); }
  if (!session.answered && session.choice && /^[1-4]$/.test(event.key)) { event.preventDefault(); chooseOption(Number(event.key) - 1); }
  if (event.key === "Escape") exitSession();
});
/* The choice rows are sized from the text they hold, so a stale height would
   survive a window resize and push the last option under the answer bar.
   Re-measure (debounced) whenever the viewport changes. */
let choiceResizeTimer = 0;
window.addEventListener("resize", () => {
  clearTimeout(choiceResizeTimer);
  choiceResizeTimer = setTimeout(() => {
    fitLearnCard();
    normalizeChoiceHeights();
  }, 120);
});

applyTheme();
applySidebar();
applyNativeChrome();
requestPinnedState();
restorePinnedWindow();
loadDatabaseState().then(() => {
  loadIeltsBook();
  loadListeningData();
  loadReferenceData();
  loadPhonetics();
  loadSyllables();
});
