// Website check: desktop at 1920 and phones designed separately, light and dark both checked.
//   node scripts/check-website.mjs OUTDIR file://$PWD/zh/index.html file://$PWD/en/index.html …
// For each URL at 390×844 (a phone, DPR 3, emulated through the DevTools protocol — headless Chrome windows cannot be
// narrower than 500) and at 1920×1080, light and dark: a full-page screenshot, and the elements wider than the screen.
import { spawn } from "node:child_process"; import { writeFileSync, mkdirSync } from "node:fs";
const [out, ...urls] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const chrome = spawn("google-chrome", ["--headless=new", "--disable-gpu", "--remote-debugging-port=9333", `--user-data-dir=${out}/profile`, "about:blank"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 1500));
const target = (await (await fetch("http://127.0.0.1:9333/json")).json()).find((t) => t.type === "page");
const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const waiting = new Map();
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d.result); waiting.delete(d.id); } });
const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
for (const url of urls) for (const [w, h, mobile, dpr] of [[390, 844, true, 3], [1920, 1080, false, 1]]) for (const scheme of ["light", "dark"]) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: dpr, mobile });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: scheme }] });
  await send("Page.navigate", { url }); await new Promise((r) => setTimeout(r, 1200));
  const r = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => { const w = innerWidth, o = [];
    document.querySelectorAll("body *").forEach(e => { const b = e.getBoundingClientRect(); if (b.width > 0 && b.right > w + 1 && getComputedStyle(e).position !== "fixed") o.push(e.tagName + "." + e.className + ":" + Math.round(b.right)); });
    return { w, sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, over: o.slice(0, 8) }; })()` });
  const v = r.result.value;
  const name = url.split("/").slice(-2).join("_").replace(/[?#].*/, "").replace(/\W+/g, "-") + `-${w}-${scheme}`;
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(v.h, 12000), scale: 1 } });
  writeFileSync(`${out}/${name}.png`, Buffer.from(shot.data, "base64"));
  console.log(`${name}: viewport ${v.w}, page ${v.sw}${v.sw > v.w ? "  HORIZONTAL SCROLL" : ""}${v.over.length ? "  over: " + v.over.join(", ") : ""}`);
}
ws.close(); chrome.kill();
