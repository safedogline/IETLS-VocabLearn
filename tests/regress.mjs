// Regression harness: renders every view against a deterministic state fixture
// and writes a snapshot per view. Run before and after a refactor and diff the
// two snapshot directories to prove no rendering behaviour changed.
//
//   node --experimental-vm-modules tests/regress.mjs out <dir>
//   node --experimental-vm-modules tests/regress.mjs check <dir>
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { loadApp, renderView, VIEWS, root } from "./dom-shim.mjs";

const DAY = 86400000;
const NOW = Date.parse("2026-11-14T09:00:00+08:00");

/** Build a state that exercises records, reviews, favorites, notes and a session. */
function buildFixture(app, seed) {
  // Use the app's own IELTS book so every renderer sees the real 3674-word data.
  const state = app.api.state;
  const book = state.books.find(item => item.id === "ielts-zhenjing-local");
  if (!book) throw new Error("IELTS book did not load");

  state.activeBookId = book.id;
  state.settings = {
    ...state.settings,
    theme: seed.theme,
    glassOpacity: seed.glassOpacity,
    glassEnabled: true,
    glassMigrated: true,
    accent: seed.accent,
    globalFontSize: seed.globalFontSize,
    showSyllableMarks: seed.showSyllableMarks,
    listeningQuiz: seed.listeningQuiz,
  };

  book.words.forEach((word, index) => {
    const key = `${book.id}:${word.word.toLowerCase()}`;
    if (index % 3 === 0) {
      state.records[key] = { box: index % 6, dueAt: NOW - DAY, seen: index % 9, correct: index % 5, wrong: index % 3, lastSeen: NOW - (index % 40) * 3600000, introducedAt: NOW - (index % 40) * DAY };
    } else if (index % 5 === 0) {
      state.known[key] = true;
    }
    if (index % 7 === 0) state.favoriteWords.push(key);
    if (index % 97 === 0) state.notes[key] = `笔记 ${index}`;
    if (index % 53 === 0) state.likes[key] = index % 5;
  });
  state.reviews[book.id] = book.words.slice(0, 200).filter(word => state.records[`${book.id}:${word.word.toLowerCase()}`]).map(word => {
    const record = state.records[`${book.id}:${word.word.toLowerCase()}`];
    return { word: word.word.toLowerCase(), box: record.box, dueAt: record.dueAt, seen: record.seen, correct: record.correct, wrong: record.wrong, lastSeen: record.lastSeen };
  });

  state.daily["2026-11-14"] = { learned: 20, reviewed: 43, seconds: 3600 };
  state.daily["2026-11-13"] = { learned: 18, reviewed: 30, seconds: 2400 };
  state.checkins = ["2026-11-13", "2026-11-14"];
  state.favoriteSentences = book.words.slice(3, 6).map(word => ({ en: word.example, zh: word.exampleTranslation, word: word.word }));
  state.listening = { index: 12, done: { 0: true, 1: true, 5: true } };
}

function capture(seed) {
  const app = loadApp({ quiet: true });
  // The IELTS module loads asynchronously; wait for it deterministically.
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const tick = () => {
      const book = app.api.state.books.find(item => item.id === "ielts-zhenjing-local");
      if (book) {
        try {
          buildFixture(app, seed);
          const out = {};
          for (const view of VIEWS) out[view] = normalise(renderView(app, view));
          out["session-new"] = captureSession(app, "new");
          out["session-review"] = captureSession(app, "review");
          out["order-editor"] = app.api.renderOrderEditor();
          out["calendar"] = app.api.renderCalendar();
          out["recent-rows"] = app.api.recentRows(app.api.currentBook());
          out["empty-home"] = app.api.emptyHome();
          out["theme"] = JSON.stringify({
            theme: app.document.body.dataset.theme,
            glass: app.document.body.dataset.glass,
            glassOpacity: app.document.body.dataset.glassOpacity,
            sidebar: app.document.body.dataset.sidebar,
          });
          resolve(out);
        } catch (error) {
          reject(error);
        }
        return;
      }
      if (++attempts > 200) { reject(new Error("vocabulary never loaded")); return; }
      setTimeout(tick, 25);
    };
    tick();
  });
}

function captureSession(app, mode) {
  app.api.startSession(mode, { replace: true });
  const session = app.api.session;
  if (!session) return "no-session";
  const view = session.mode === "review" ? "review" : "home";
  return normalise(app.document.getElementById(`view-${view}`).innerHTML);
}

/** Strip values that legitimately vary between runs (timings, dates). */
function normalise(html) {
  return String(html)
    .replace(/\b1[6-9]\d{11}\b/g, "<ts>")
    .replace(/width:\d+%/g, "width:<pct>")
    // Whitespace between tags is not render-affecting for these block-level
    // layouts, so a pure re-indent of a template must not count as a diff.
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ");
}

const SEEDS = [
  { name: "light", theme: "light", glassOpacity: 0.82, accent: "uk", globalFontSize: 0, showSyllableMarks: true, listeningQuiz: false },
  { name: "deep", theme: "deep", glassOpacity: 0.5, accent: "us", globalFontSize: 2, showSyllableMarks: false, listeningQuiz: true },
  { name: "night", theme: "night", glassOpacity: 1, accent: "uk", globalFontSize: -1, showSyllableMarks: true, listeningQuiz: false },
];

async function main() {
  const [mode = "out", dirArg = "tests/snapshots/current"] = process.argv.slice(2);
  const dir = path.resolve(root, dirArg);
  const results = {};
  for (const seed of SEEDS) results[seed.name] = await capture(seed);

  if (mode === "out" || mode === "write") {
    mkdirSync(dir, { recursive: true });
    for (const [seedName, views] of Object.entries(results)) {
      for (const [view, html] of Object.entries(views)) {
        writeFileSync(path.join(dir, `${seedName}.${view}.html`), html);
      }
    }
    console.log(`wrote ${Object.keys(results).length * VIEWS.length} snapshots to ${dirArg}`);
    for (const [seedName, views] of Object.entries(results)) {
      const line = Object.entries(views).map(([view, html]) => `${view}:${html.length}`).join(" ");
      console.log(`  ${seedName} ${line}`);
    }
    return;
  }

  if (mode === "check") {
    if (!existsSync(dir)) { console.error(`missing baseline ${dirArg}`); process.exit(2); }
    const failures = [];
    const seen = new Set();
    for (const [seedName, views] of Object.entries(results)) {
      for (const [view, html] of Object.entries(views)) {
        const file = `${seedName}.${view}.html`;
        seen.add(file);
        const baseline = readFileSync(path.join(dir, file), "utf8");
        if (baseline !== html) {
          failures.push({ file, baseline, actual: html });
        }
      }
    }
    for (const file of readdirSync(dir)) if (!seen.has(file)) failures.push({ file, baseline: "(exists)", actual: "(missing)" });
    if (!failures.length) {
      console.log(`PASS all ${seen.size} snapshots identical to ${dirArg}`);
      return;
    }
    console.error(`FAIL ${failures.length} snapshot(s) changed`);
    for (const failure of failures.slice(0, 6)) {
      const at = firstDifference(failure.baseline, failure.actual);
      console.error(`  ${failure.file} differs at ${at}`);
      console.error(`    before: …${failure.baseline.slice(Math.max(0, at - 60), at + 90)}…`);
      console.error(`    after : …${failure.actual.slice(Math.max(0, at - 60), at + 90)}…`);
    }
    process.exit(1);
  }

  console.error("usage: regress.mjs out|check <dir>");
  process.exit(2);
}

function firstDifference(a, b) {
  const limit = Math.min(a.length, b.length);
  for (let index = 0; index < limit; index++) if (a[index] !== b[index]) return index;
  return limit;
}

const started = performance.now();
main().then(() => {
  console.log(`(${Math.round(performance.now() - started)} ms)`);
  process.exit(0);
}).catch(error => {
  console.error("regress failed:", error.message);
  console.error(error.stack.split("\n").slice(0, 6).join("\n"));
  process.exit(1);
});
