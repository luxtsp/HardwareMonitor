const API = "/stats";
const INTERVAL = 5000;
const CIRC = 2 * Math.PI * 12;

const pulse      = document.getElementById("pulse");
const statusText = document.getElementById("status-text");
const lastUpdate = document.getElementById("last-updated");
const ringFill   = document.getElementById("ring-fill");
const cdLabel    = document.getElementById("countdown-label");

// ── helpers ──────────────────────────────────────────────
function levelClass(val, warn, danger) {
if (val == null) return "null";
if (val >= danger) return "danger";
if (val >= warn)   return "warn";
return "";
}

function setCard(id, value, unit, warn, danger, maxVal) {
const valEl = document.getElementById(`val-${id}`);
const barEl = document.getElementById(`bar-${id}`);
const cardEl = document.getElementById(`card-${id}`);

const cls = levelClass(value, warn, danger);

if (value == null) {
    valEl.textContent = "N/A";
    valEl.className = "card-value null";
    barEl.style.width = "0%";
    barEl.className = "bar-fill";
} else {
    valEl.textContent = Number(value).toFixed(1);
    valEl.className = "card-value " + cls;
    const pct = Math.min((value / maxVal) * 100, 100);
    barEl.style.width = pct + "%";
    barEl.className = "bar-fill " + cls;
}

// flash top-border animation
cardEl.classList.remove("updated");
void cardEl.offsetWidth; // reflow
cardEl.classList.add("updated");
setTimeout(() => cardEl.classList.remove("updated"), 500);
}

// ── fetch ─────────────────────────────────────────────────
async function fetchStats() {
try {
    const res  = await fetch(API);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    const u = data.usage;
    const t = data.temps;

    // Usage (warn @70, danger @90, max 100)
    setCard("cpu-usage",     u.cpu,     "%", 70, 90, 100);
    setCard("ram-usage",     u.ram,     "%", 70, 90, 100);
    setCard("storage-usage", u.storage, "%", 80, 95, 100);

    // Temps (warn @70°C, danger @90°C, max 110°C)
    setCard("cpu-temp",         t.cpu,         "°C", 70, 90, 110);
    setCard("gpu-temp",         t.gpu,         "°C", 70, 90, 110);
    setCard("motherboard-temp", t.motherboard, "°C", 60, 80, 100);
    setCard("nvme-temp",        t.nvme,        "°C", 55, 70,  80);

    pulse.className = "live";
    statusText.textContent = "LIVE";
    lastUpdate.textContent = "last updated " + new Date().toLocaleTimeString();

} catch (e) {
    pulse.className = "err";
    statusText.textContent = "ERROR — is server.py running?";
    console.error(e);
}
}

// ── countdown ring ────────────────────────────────────────
let remaining = INTERVAL;
let lastTick  = performance.now();

function tickRing(ts) {
const delta = ts - lastTick;
lastTick = ts;
remaining = Math.max(0, remaining - delta);

const progress = 1 - remaining / INTERVAL;       // 0 → 1
const offset   = CIRC * (1 - progress);          // dashoffset goes CIRC → 0
ringFill.style.strokeDashoffset = offset;

const secs = Math.ceil(remaining / 1000);
cdLabel.textContent = `NEXT IN ${secs}s`;

requestAnimationFrame(tickRing);
}

requestAnimationFrame(tickRing);

function poll() {
remaining = INTERVAL;
fetchStats();
}

poll();
setInterval(poll, INTERVAL);