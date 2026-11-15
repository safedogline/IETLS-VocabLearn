// Minimal DOM/browser shim so app.js can be loaded by node for regression
// testing. It implements only what app.js actually touches; it is not a DOM.
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class ClassList {
  constructor(node) { this.node = node; }
  get set() { return new Set(String(this.node.className || "").split(/\s+/).filter(Boolean)); }
  write(set) { this.node.className = [...set].join(" "); }
  add(...names) { const set = this.set; names.forEach(name => set.add(name)); this.write(set); }
  remove(...names) { const set = this.set; names.forEach(name => set.delete(name)); this.write(set); }
  contains(name) { return this.set.has(name); }
  toggle(name, force) {
    const set = this.set;
    const on = force === undefined ? !set.has(name) : Boolean(force);
    if (on) set.add(name); else set.delete(name);
    this.write(set);
    return on;
  }
}

class Element {
  constructor(tag = "div", id = "") {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = "";
    this.classList = new ClassList(this);
    this.dataset = {};
    const properties = new Map();
    this.style = {
      setProperty: (name, value) => properties.set(name, String(value)),
      removeProperty: name => properties.delete(name),
      getPropertyValue: name => properties.get(name) ?? "",
      __properties: properties,
    };
    this.children = [];
    this.attributes = {};
    this._html = "";
    this._text = "";
    this.value = "";
    this.title = "";
    this.hidden = false;
  }
  get innerHTML() { return this._html; }
  set innerHTML(value) { this._html = String(value); }
  get textContent() { return this._text; }
  set textContent(value) { this._text = String(value); }
  appendChild(node) { this.children.push(node); return node; }
  append(node) { this.children.push(node); }
  remove() {}
  addEventListener() {}
  removeEventListener() {}
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  closest() { return null; }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  matches() { return false; }
  showModal() { this.open = true; }
  close() { this.open = false; }
  focus() {}
  blur() {}
  click() {}
  play() { return Promise.resolve(); }
  pause() {}
  getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; }
}

function createDocument() {
  const registry = new Map();
  const make = (id) => {
    if (!registry.has(id)) registry.set(id, new Element("section", id));
    return registry.get(id);
  };
  const body = new Element("body", "body");
  const head = new Element("head", "head");
  const documentElement = new Element("html", "html");
  const listeners = [];
  return {
    body,
    head,
    documentElement,
    title: "",
    getElementById: make,
    createElement: tag => new Element(tag),
    createTextNode: text => ({ text }),
    querySelector: selector => (selector === ".app-shell" ? new Element("div", "app-shell") : null),
    querySelectorAll: () => [],
    addEventListener: (type, handler) => listeners.push({ type, handler }),
    removeEventListener: () => {},
    listeners,
    __registry: registry,
    __make: make,
  };
}

const VIEWS = ["home", "review", "listen", "listening", "dict", "words", "sentences", "materials", "settings", "appearance"];

// Snapshots are byte-compared, so anything time-dependent has to be pinned.
// `todayKey()` drives the "11月14日星期六" heading, the calendar strip, and the
// daily counters, so a run on any other day would diff even against unchanged
// code. Pin the clock to the instant the baseline was captured.
const FIXED_NOW = Date.parse("2026-11-14T09:00:00+08:00");

/** A Date whose "now" never moves. Explicit arguments still behave normally. */
function frozenDate() {
  const RealDate = Date;
  return class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(FIXED_NOW);
      else super(...args);
    }
    static now() { return FIXED_NOW; }
  };
}

/**
 * Load app.js inside a fresh sandbox.
 * @param {object} options
 * @param {string|null} options.stateJson  pre-existing localStorage value
 * @param {object|null} options.serverState  what GET /__ielts_state returns
 * @param {boolean} options.quiet  suppress console noise from expected failures
 */
export function loadApp({ stateJson = null, serverState = null, quiet = true, randomSeed = 0x2f6e2b1 } = {}) {
  const document = createDocument();
  VIEWS.forEach(view => document.__make(`view-${view}`));
  const storage = new Map();
  if (stateJson != null) storage.set("cixu-desktop-v1", stateJson);

  const localStorage = {
    getItem: key => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: key => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: index => [...storage.keys()][index] ?? null,
  };

  const ipcMessages = [];
  const windowListeners = new Map();
  const window = {
    localStorage,
    addEventListener: (type, handler) => windowListeners.set(type, handler),
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    speechSynthesis: { cancel() {}, speak() {} },
    ipc: { postMessage: message => ipcMessages.push(String(message)) },
    requestAnimationFrame: fn => setTimeout(fn, 0),
  };

  const network = { puts: [], gets: 0 };
  const fetchImpl = async (url, options = {}) => {
    if (options.method === "PUT") {
      network.puts.push({ url, body: String(options.body), keepalive: Boolean(options.keepalive) });
      return { ok: true, status: 200, json: async () => null, text: async () => "ok" };
    }
    network.gets += 1;
    if (url === "./__ielts_state" || url === "/__ielts_state") {
      if (serverState == null) return { ok: true, status: 204, json: async () => null, text: async () => "" };
      return { ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(serverState)), text: async () => "" };
    }
    // Serve project files from disk so phonetics/syllables/materials load for real.
    const candidate = path.resolve(root, String(url).replace(/^\.?\//, ""));
    if (candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()) {
      const text = readFileSync(candidate, "utf8");
      return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text };
    }
    return { ok: false, status: 404, json: async () => null, text: async () => "" };
  };

  const consoleImpl = quiet
    ? { ...console, log() {}, info() {}, warn() {}, debug() {} }
    : console;

  // Deterministic randomness: multiple-choice options are shuffled with
  // Math.random, so an unseeded run would make snapshot diffs meaningless.
  const seededMath = Object.create(Math);
  let seed = randomSeed;
  seededMath.random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const sandbox = {
    document,
    window,
    localStorage,
    console: consoleImpl,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame: fn => setTimeout(fn, 0),
    fetch: fetchImpl,
    indexedDB: undefined,
    Audio: class { play() { return Promise.resolve(); } pause() {} },
    Blob: class {},
    URL: { createObjectURL: () => "blob:x", revokeObjectURL() {} },
    Intl,
    Date: frozenDate(),
    Math: seededMath,
    JSON,
    Map,
    Set,
    Promise,
    Error,
    Number,
    String,
    Object,
    Array,
    Boolean,
    RegExp,
    performance: { now: () => 0 },
    navigator: { language: "zh-CN" },
    location: { href: "http://127.0.0.1:47777/index.html", origin: "http://127.0.0.1:47777" },
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    isSecureContext: true,
    __network: network,
    __ipc: ipcMessages,
    __storage: storage,
    __windowListeners: windowListeners,
    __views: VIEWS,
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;

  const source = readFileSync(path.join(root, "app.js"), "utf8");
  const script = `(function(){
${source}
;globalThis.__api = {
  get state() { return state; },
  get session() { return session; },
  get currentView() { return currentView; },
  set currentView(value) { currentView = value; },
  get currentBookId() { return currentBookId; },
  get listen() { return listen; },
  getModal: () => ({ open: false }),
  renderShell, renderHome, renderReview, renderWords, renderDict, renderSentences, renderMaterials,
  renderSettings, renderAppearance, renderListen, renderListening, renderSession, renderOrderEditor,
  applyTheme, applySidebar, parseImport, normalizeWord, escapeCsvRow, escapeHtml, gradeWord,
  startSession, continueWord, revealAnswer, chooseOption, exitSession, allDue, dueWords, bookStats,
  masteredCount, streakDays, todayStats, totalMinutes, recordKey, loadState, normalizeState,
  currentBook: () => currentBook(), wordsForScope, tabOrder, recentRows, renderCalendar, emptyHome,
  renderSidebarBooks, showModal, toast, exportBackup, importFile, toggleKnown, toggleFavWord,
  toggleFavSentence, isFavoriteSentence, groupWordsOf, wordAudioPath, wordIndex, findWord,
  loadIeltsBook, speakingWord: word => word?.word, playAudio, speak, speakWord: text => speak(text),
  listeningAudioUrl, parseImportFile: (text, name) => parseImport(text, name),
  loadDatabaseState, saveDatabaseState,
};
})();`;

  const moduleCache = new Map();
  const importModuleDynamically = (specifier) => {
    const resolved = path.resolve(root, specifier.replace(/^\.\//, ""));
    if (!moduleCache.has(resolved)) {
      const code = readFileSync(resolved, "utf8")
        .replace(/export\s+default\s+(\w+)\s*;?\s*$/, "export default $1;");
      moduleCache.set(resolved, import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`));
    }
    return moduleCache.get(resolved);
  };

  vm.createContext(sandbox);
  new vm.Script(script, { filename: "app.js", importModuleDynamically }).runInContext(sandbox);
  return { api: sandbox.__api, document, window, storage, network, ipc: ipcMessages, sandbox };
}

/** Render one view and return its HTML. */
export function renderView(app, view) {
  app.api.currentView = view;
  const map = {
    home: () => app.api.renderHome(),
    review: () => app.api.renderReview(),
    words: () => app.api.renderWords(),
    listen: () => app.api.renderListen(),
    listening: () => app.api.renderListening(),
    dict: () => app.api.renderDict(),
    sentences: () => app.api.renderSentences(),
    materials: () => app.api.renderMaterials(),
    settings: () => app.api.renderSettings(),
    appearance: () => app.api.renderAppearance(),
  };
  map[view]();
  return app.document.getElementById(`view-${view}`).innerHTML;
}

export { root, VIEWS };
