import React, { useState, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Genevieve · Rooms & Ratios — childcare
// Brand frame: pink #9c2d54 · status traffic-lights: green #008037 · yellow #FFE600 · red #f80808
// Ratios per Queensland / National Quality Framework (decision support only)
// ---------------------------------------------------------------------------

const C = {
  green: "#008037", greenDeep: "#02622b", greenSoft: "#e7f3ec",
  yellow: "#FFE600", amber: "#caa400", amberSoft: "#fff8cc",
  red: "#f80808", redSoft: "#fde7e7", redText: "#a40606",
  ink: "#16271d", slate: "#5c6b62", line: "#e4eae6",
  paper: "#fbe1ec", white: "#ffffff",
  // ── Brand accent (childcare pink): buttons / frame / header. Status stays green/amber/red. ──
  brand: "#9c2d54", brandDeep: "#7a1f42", brandSoft: "#fbe1ec",
};

const RATIO = { nursery: 4, toddler: 5, kindy: 11, oshc: 15 };
const ROOM_META = {
  nursery: { name: "Nursery", band: "0–24 months", ratio: "1:4" },
  toddler: { name: "Toddlers", band: "24–36 months", ratio: "1:5" },
  kindy:   { name: "Kindy", band: "36 mo – preschool", ratio: "1:11" },
  oshc:    { name: "OSHC", band: "Over preschool", ratio: "1:15" },
};

// Allergen library. sev: 1 monitor · 2 moderate · 3 anaphylaxis
const ALLERGENS = {
  milk: {
    label: "Cow's milk protein", severity: "Anaphylaxis", sev: 3, epipen: true,
    plan: "Adrenaline (EpiPen) on file. Follow the ASCIA action plan — give adrenaline first, then call 000.",
    avoidFoods: ["Dairy milk, cheese, yoghurt", "Butter & cream", "Milk custard / ice cream"],
    avoidPlay: ["Milk-carton & yoghurt-tub sensory play", "Cream or butter-based playdough", "Whipped-cream messy play"],
    swaps: ["Oat or soy milk at the table", "Water-based paint & taste-safe dough"],
  },
  nuts: {
    label: "Peanut & tree nut", severity: "Anaphylaxis", sev: 3, epipen: true,
    plan: "Adrenaline (EpiPen) on file. Strict nut-free table. Give adrenaline first, then call 000.",
    avoidFoods: ["Peanut butter & nut spreads", "Muesli / snack bars with nuts", "Satay & some sauces"],
    avoidPlay: ["Nut or nut-shell sensory bins", "Bird-feeder craft using nuts", "Some scented playdough"],
    swaps: ["Sunflower-seed butter (SunButter)", "Rice, oat or cornflour sensory bins"],
  },
  egg: {
    label: "Egg", severity: "Moderate", sev: 2, epipen: false,
    plan: "No adrenaline on file. Antihistamine plan — monitor closely and call family.",
    avoidFoods: ["Egg & mayonnaise", "Quiche, frittata, some cakes", "Egg-wash pastries"],
    avoidPlay: ["Eggshell mosaic craft", "Egg-carton craft (residue)", "Homemade paint/dough using egg"],
    swaps: ["Cardboard-tube crafts", "Commercial taste-safe paint"],
  },
  wheat: {
    label: "Wheat / gluten (coeliac)", severity: "Intolerance", sev: 1, epipen: false,
    plan: "No adrenaline needed. Strict gluten avoidance to prevent illness; separate utensils & board.",
    avoidFoods: ["Bread, pasta, wheat crackers", "Standard flour in cooking", "Some sauces & gravies"],
    avoidPlay: ["Standard playdough (wheat flour)", "Cloud dough & papier-mâché", "Dyed-pasta threading craft"],
    swaps: ["Gluten-free or cornflour playdough", "Rice threading & cornflour cloud dough"],
  },
};

// Enrolled roster per room. Allergy kids carry contacts + parent notes.
const ROSTER = {
  nursery: [
    { name: "Ethan", age: "12 mo", allergy: "milk",
      contacts: [{ name: "Sarah Bennett", rel: "Mum", phone: "0412 334 556" }, { name: "Mark Bennett", rel: "Dad", phone: "0423 110 982" }],
      notes: ["Mum: reflux med given at home each morning — none needed here.", "Use his labelled oat-milk bottle only, please."] },
    { name: "Olivia", age: "10 mo" }, { name: "Ava", age: "8 mo" },
    { name: "Noah", age: "14 mo" }, { name: "Mia", age: "16 mo" },
    { name: "Liam", age: "20 mo" }, { name: "Isla", age: "22 mo" },
    { name: "Lucas", age: "9 mo" },
  ],
  toddler: [
    { name: "Amelia", age: "26 mo", allergy: "nuts",
      contacts: [{ name: "Priya Rao", rel: "Mum", phone: "0410 882 071" }, { name: "Dev Rao", rel: "Dad", phone: "0432 556 109" }],
      notes: ["Dad: EpiPen lives in Amelia's red pouch in her bag.", "Mum: she knows not to share food — a gentle reminder helps."] },
    { name: "Jack", age: "31 mo" }, { name: "Charlotte", age: "28 mo" },
    { name: "Oliver", age: "33 mo" }, { name: "Grace", age: "29 mo" },
    { name: "Henry", age: "35 mo" }, { name: "Ruby", age: "27 mo" },
    { name: "Leo", age: "32 mo" }, { name: "Chloe", age: "30 mo" },
    { name: "Max", age: "34 mo" },
  ],
  kindy: [
    { name: "Sophie", age: "3 yr", allergy: "egg",
      contacts: [{ name: "Hannah Wells", rel: "Mum", phone: "0419 663 220" }],
      notes: ["Mum: baked egg traces are usually fine — but no scrambled or boiled egg."] },
    { name: "Thomas", age: "4 yr", allergy: "wheat",
      contacts: [{ name: "Kate Lawson", rel: "Mum", phone: "0438 220 117" }, { name: "James Lawson", rel: "Dad", phone: "0401 778 540" }],
      notes: ["Mum: separate toaster & board are essential — even crumbs make him unwell.", "GF snacks are in the labelled blue container."] },
    { name: "Mason", age: "3 yr" }, { name: "Ella", age: "4 yr" },
    { name: "Harper", age: "3 yr" }, { name: "Archie", age: "4 yr" },
    { name: "Zoe", age: "3 yr" }, { name: "Hugo", age: "4 yr" },
    { name: "Evie", age: "3 yr" }, { name: "Felix", age: "4 yr" },
    { name: "Layla", age: "3 yr" }, { name: "Oscar", age: "4 yr" },
  ],
  oshc: [
    { name: "Riley", age: "6 yr" }, { name: "Ben", age: "7 yr" },
    { name: "Holly", age: "6 yr" }, { name: "Jasper", age: "8 yr" },
    { name: "Tara", age: "7 yr" }, { name: "Cody", age: "6 yr" },
  ],
};

const E = (name, q) => ({ name, q }); // q = qualified (Cert III+)

const SCENARIOS = {
  open: {
    label: "Open · 7:30am",
    note: "Numbers are low and staff are arriving — rooms are over-resourced. Balance to combine and free staff.",
    rooms: {
      nursery: { present: 2, educators: [E("Priya", true)] },
      toddler: { present: 2, educators: [E("Sam", true)] },
      kindy:   { present: 4, educators: [E("Jordan", true)] },
      oshc:    { present: 0, educators: [] },
    },
  },
  full: {
    label: "Full day · 10:00am",
    note: "Peak attendance, fully staffed — this is what a compliant floor looks like.",
    rooms: {
      nursery: { present: 8, educators: [E("Priya", true), E("Mia", true)] },
      toddler: { present: 10, educators: [E("Sam", true), E("Leah", false)] },
      kindy:   { present: 12, educators: [E("Jordan", true), E("Tom", true)] },
      oshc:    { present: 0, educators: [] },
    },
  },
  pickup: {
    label: "Pickup · 5:15pm",
    note: "An educator left for the day — the Toddlers room is now out of ratio. Balance to fix it.",
    rooms: {
      nursery: { present: 4, educators: [E("Priya", true)] },
      toddler: { present: 9, educators: [E("Leah", false)] },
      kindy:   { present: 6, educators: [E("Jordan", true), E("Tom", true)] },
      oshc:    { present: 0, educators: [] },
    },
  },
};

const childrenOf = (key, present) => ROSTER[key].slice(0, present);
const allergyKids = (key, present) => childrenOf(key, present).filter((c) => c.allergy);
const getContacts = (c) => c.contacts || [{ name: `${c.name}'s parent`, rel: "Primary contact", phone: "On file" }];
const ANA_KIDS = Object.values(ROSTER).flat().filter((c) => c.allergy && ALLERGENS[c.allergy].sev === 3).map((c) => c.name);

// Attendance (clock in / out). Drives the present count, which drives ratios.
const SEED_TIMES = ["7:42am", "7:55am", "8:03am", "8:10am", "8:18am", "8:25am", "8:31am", "8:39am", "8:47am", "8:54am", "9:02am", "9:10am"];
const initAttendance = (roomsObj) => {
  const a = {};
  Object.keys(roomsObj).forEach((k) => {
    ROSTER[k].forEach((c, i) => { const inn = i < roomsObj[k].present; a[`${k}:${c.name}`] = { in: inn, time: inn ? SEED_TIMES[i % SEED_TIMES.length] : null }; });
  });
  return a;
};
const isIn = (att, key, name) => !!(att[`${key}:${name}`] && att[`${key}:${name}`].in);
const presentKids = (att, key) => ROSTER[key].filter((c) => isIn(att, key, c.name));
const presentCount = (att, key) => presentKids(att, key).length;
const liveRoomsFrom = (roomsObj, att) => { const o = {}; Object.keys(roomsObj).forEach((k) => { o[k] = { present: presentCount(att, k), educators: roomsObj[k].educators }; }); return o; };

function statusOf(key, room) {
  const required = Math.ceil(room.present / RATIO[key]);
  const have = room.educators.length;
  const hasQ = room.educators.some((e) => e.q);
  if (room.present === 0) return { level: "closed", required, have, hasQ };
  if (have < required) return { level: "red", required, have, hasQ };
  if (!hasQ) return { level: "amber", required, have, hasQ };
  return { level: "green", required, have, hasQ };
}

const LEVEL = {
  green:  { dot: C.green, bg: C.greenSoft, text: C.greenDeep, label: "In ratio" },
  amber:  { dot: C.amber, bg: C.amberSoft, text: "#7a6300", label: "Needs a qualified educator" },
  red:    { dot: C.red, bg: C.redSoft, text: C.redText, label: "Out of ratio" },
  closed: { dot: "#b9c4bd", bg: "#f0f3f1", text: C.slate, label: "Closed" },
};

const req = (key, room) => Math.ceil(room.present / RATIO[key]);

function balance(rooms) {
  const next = JSON.parse(JSON.stringify(rooms));
  const notes = [];
  const keys = ["nursery", "toddler", "kindy", "oshc"];
  const takeSpare = (k, needQ) => {
    const r = next[k];
    if (r.educators.length <= req(k, r)) return null;
    const quals = r.educators.filter((e) => e.q);
    if (needQ && quals.length >= 2) { const i = r.educators.findIndex((e) => e.q); return r.educators.splice(i, 1)[0]; }
    const ti = r.educators.findIndex((e) => !e.q);
    if (ti > -1) return r.educators.splice(ti, 1)[0];
    return r.educators.pop();
  };
  keys.forEach((k) => {
    let guard = 0;
    while (next[k].present > 0 && next[k].educators.length < req(k, next[k]) && guard < 8) {
      guard++;
      const needQ = !next[k].educators.some((e) => e.q);
      const donor = keys.find((j) => j !== k && next[j].educators.length > req(j, next[j]));
      if (!donor) break;
      const moved = takeSpare(donor, needQ);
      if (!moved) break;
      next[k].educators.push(moved);
      notes.push(`Moved ${moved.name} → ${ROOM_META[k].name} to restore ratio.`);
    }
  });
  keys.forEach((k) => {
    const r = next[k];
    if (r.present > 0 && r.educators.length >= req(k, r) && !r.educators.some((e) => e.q)) {
      const donor = keys.find((j) => j !== k && next[j].educators.filter((e) => e.q).length >= 2);
      if (donor) {
        const qi = next[donor].educators.findIndex((e) => e.q);
        const q = next[donor].educators.splice(qi, 1)[0];
        const ti = r.educators.findIndex((e) => !e.q);
        const out = ti > -1 ? r.educators.splice(ti, 1)[0] : null;
        r.educators.push(q);
        if (out) next[donor].educators.push(out);
        notes.push(`Swapped ${q.name} into ${ROOM_META[k].name} so a qualified educator leads the room.`);
      }
    }
  });
  const n = next.nursery.present, t = next.toddler.present;
  if (n > 0 && t > 0) {
    const sep = Math.ceil(n / 4) + Math.ceil(t / 5);
    const merged = Math.ceil(n / 4 + t / 5);
    if (merged < sep) notes.push(`Combine Nursery + Toddlers into one under-3 room (${n + t} children) — stays in ratio with ${merged} educator${merged > 1 ? "s" : ""} and frees ${sep - merged} for breaks or float cover.`);
  }
  if (notes.length === 0) notes.push("All rooms are already in ratio with a qualified educator — nothing to change.");
  return { rooms: next, notes };
}

// ---------------------------------------------------------------------------
// Reusable bits
// ---------------------------------------------------------------------------
function Dot({ level, size = 12 }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: LEVEL[level].dot, display: "inline-block", flexShrink: 0, animation: level === "red" ? "pulse 1.6s infinite" : "none" }} />;
}

function FillBar({ value, max, color }) {
  const pct = Math.min(value / max, 1) * 100;
  return <div style={{ height: 6, background: C.line, borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width .4s ease" }} /></div>;
}

function SeverityBar({ level }) {
  const labels = { 1: "Monitor", 2: "Moderate", 3: "Anaphylaxis" };
  const cols = [C.green, C.amber, C.red];
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < level ? cols[level - 1] : C.line }} />)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 11, color: C.slate }}>Reaction severity on file</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: cols[level - 1] }}>{labels[level]}</span>
      </div>
      {level === 3 && <div style={{ fontSize: 11.5, color: C.redText, marginTop: 6, fontWeight: 600 }}>⚠ Severity can change without warning — act on the first symptoms, every time.</div>}
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.white, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: "0 1px 2px rgba(0,0,0,.05)" }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.red }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.yellow }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />
      </div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17, color: "#ffffff" }}>Genevieve</div>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#ffd9e6", fontWeight: 600 }}>Rooms &amp; Ratios</div>
      </div>
    </div>
  );
}

function Legend() {
  const item = (node, text) => <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.slate }}>{node}<span>{text}</span></div>;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", marginTop: 18 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>What you're looking at</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "10px 22px" }}>
        {item(<Dot level="green" />, "Room status: in ratio")}
        {item(<Dot level="amber" />, "In ratio, but no qualified educator in the room")}
        {item(<Dot level="red" />, "Out of ratio — act now")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.green }} />, "Educator dot: qualified (Cert III+)")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.amber }} />, "Educator dot: support / trainee (not yet qualified)")}
        {item(<span style={{ fontSize: 12 }}>⚠</span>, "Child with an allergy — tap for the care plan")}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>Tap any room to see children, allergies, contacts and parent notes.</div>
    </div>
  );
}

function RoomCard({ roomKey, room, att, onOpen }) {
  const s = statusOf(roomKey, room);
  const meta = ROOM_META[roomKey];
  const lv = LEVEL[s.level];
  const fill = s.required ? Math.min(s.have / s.required, 1) : 0;
  const allergies = presentKids(att, roomKey).filter((c) => c.allergy);
  const enrolled = ROSTER[roomKey].length;
  return (
    <div onClick={() => onOpen(roomKey)} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 2px rgba(20,39,29,.04)", cursor: "pointer", transition: "transform .15s ease, box-shadow .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(20,39,29,.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,39,29,.04)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: C.ink }}>{meta.name}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{meta.band} · ratio {meta.ratio}</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}><Dot level={s.level} size={9} />{lv.label}</div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 16, alignItems: "flex-end" }}>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{room.present}</div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>children present</div></div>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, lineHeight: 1, color: s.level === "red" ? C.red : C.ink }}>{s.have}<span style={{ fontSize: 16, color: C.slate, fontWeight: 600 }}> / {s.required || 0}</span></div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>educators (have / need)</div></div>
      </div>
      <div style={{ marginTop: 14 }}><FillBar value={s.have} max={s.required || 1} color={lv.dot} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, minHeight: 24, alignItems: "center" }}>
        {room.educators.length === 0 && <span style={{ fontSize: 12, color: C.slate, fontStyle: "italic" }}>{room.present === 0 ? "Room closed" : "No educator assigned"}</span>}
        {room.educators.map((e, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, color: C.ink, background: C.paper, border: `1px solid ${C.line}`, padding: "3px 9px 3px 7px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 7, background: e.q ? C.green : C.amber }} />{e.name}{e.q ? <span style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>✓</span> : <span style={{ fontSize: 10, color: C.amber, fontWeight: 700 }}>trainee</span>}
          </span>
        ))}
        <span style={{ fontSize: 12, fontWeight: 700, color: C.greenDeep, background: C.greenSoft, padding: "3px 9px", borderRadius: 999 }}>🕑 {room.present}/{enrolled} signed in</span>
        {allergies.length > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: C.redText, background: C.redSoft, padding: "3px 9px", borderRadius: 999 }}>⚠ {allergies.length} allergy</span>}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>Sign in / out &amp; view children →</div>
    </div>
  );
}

function buildAlerts(rooms, att) {
  const ratio = [], care = [];
  Object.keys(rooms).forEach((k) => {
    const s = statusOf(k, rooms[k]);
    const name = ROOM_META[k].name;
    if (s.level === "red") ratio.push({ level: "red", title: `${name} out of ratio`, body: `${rooms[k].present} children, ${s.have} educator${s.have === 1 ? "" : "s"} — needs ${s.required}.` });
    if (s.level === "amber") ratio.push({ level: "amber", title: `${name} needs a qualified educator`, body: "In headcount, but only trainee educators are in the room." });
    presentKids(att, k).filter((c) => c.allergy).forEach((c) => {
      const a = ALLERGENS[c.allergy];
      care.push({ level: a.sev === 3 ? "red" : "amber", title: `${c.name} · ${a.label}`, body: `${a.severity}. Keep ${name}'s allergen-safe table set.` });
    });
  });
  return { ratio, care };
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
function Backdrop({ onClose, children }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(16,31,23,.45)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }}>{children}</div>;
}

function Section({ title, children, tone }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: tone === "green" ? C.green : C.slate, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: C.ink }}><span style={{ color: tone === "green" ? C.green : C.slate }}>{tone === "green" ? "✓" : "•"}</span>{t}</div>)}
      </div>
    </div>
  );
}

function ChildModal({ child, roomName, notes, onAddNote, onClose }) {
  const a = child.allergy ? ALLERGENS[child.allergy] : null;
  const contacts = getContacts(child);
  const [draft, setDraft] = useState("");
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 480, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{child.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{child.age} · {roomName}</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>

        {!a && <div style={{ marginTop: 18, background: C.greenSoft, color: C.greenDeep, borderRadius: 12, padding: "14px 16px", fontSize: 14, fontWeight: 600 }}>No dietary or medical alerts on file.</div>}

        {a && (
          <>
            <div style={{ marginTop: 16, background: a.sev === 3 ? C.redSoft : C.amberSoft, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: a.sev === 3 ? C.redText : "#7a6300" }}>{a.label}</span>
                {a.epipen && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: C.red }}>EpiPen</span>}
              </div>
              <div style={{ marginTop: 12 }}><SeverityBar level={a.sev} /></div>
              <div style={{ fontSize: 13, color: C.ink, marginTop: 12, lineHeight: 1.5 }}>{a.plan}</div>
            </div>
            <Section title="Keep off their plate">{a.avoidFoods}</Section>
            <Section title="Avoid in play & craft">{a.avoidPlay}</Section>
            <Section title="Safe swaps" tone="green">{a.swaps}</Section>
          </>
        )}

        {/* Sleep profile */}
        {CHILD_SLEEP[child.name] && (() => { const sp = SLEEP_PROFILE[CHILD_SLEEP[child.name]]; return (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Rest &amp; sleep</div>
            <div style={{ background: softFor(sp.color), borderRadius: 10, padding: "11px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 14 }}>🛌</span><span style={{ fontWeight: 700, fontSize: 13.5, color: sp.color }}>{sp.label}</span></div>
              <div style={{ fontSize: 12.5, color: C.ink, marginTop: 5 }}>{sp.note}</div>
            </div>
          </>
        ); })()}

        {/* Emergency contacts */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Emergency contacts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {contacts.map((ct, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <span><span style={{ fontWeight: 700, fontSize: 13.5 }}>{ct.name}</span><span style={{ fontSize: 12, color: C.slate }}> · {ct.rel}</span></span>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: C.brand }}>{ct.phone}</span>
            </div>
          ))}
        </div>

        {/* Parent notes */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Notes from parents</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(notes || []).length === 0 && <div style={{ fontSize: 13, color: C.slate, fontStyle: "italic" }}>No notes yet.</div>}
          {(notes || []).map((nt, i) => (
            <div key={i} style={{ background: "#fffdf2", border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.yellow}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: C.ink }}>{nt}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note from a parent…" style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "var(--body)", outline: "none" }} />
          <button onClick={() => { if (draft.trim()) { onAddNote(child.name, draft.trim()); setDraft(""); } }} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 13, padding: "0 16px", borderRadius: 10 }}>Add</button>
        </div>
      </div>
    </Backdrop>
  );
}

function SeatingPlan({ roomKey, att, onClose }) {
  const kids = presentKids(att, roomKey);
  const flagged = kids.filter((c) => c.allergy);
  const safe = kids.filter((c) => !c.allergy);
  const allergens = [...new Set(flagged.map((c) => c.allergy))];
  const foods = [...new Set(allergens.flatMap((k) => ALLERGENS[k].avoidFoods))];
  const play = [...new Set(allergens.flatMap((k) => ALLERGENS[k].avoidPlay))];
  const swaps = [...new Set(allergens.flatMap((k) => ALLERGENS[k].swaps))];
  const tables = [];
  for (let i = 0; i < safe.length; i += 6) tables.push(safe.slice(i, i + 6));
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 620, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Allergy-safe seating &amp; play</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{ROOM_META[roomKey].name} · {kids.length} children</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>
        <div style={{ marginTop: 16, border: `2px solid ${C.green}`, borderRadius: 14, padding: 16, background: C.greenSoft }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 15 }}>🛡️</span><span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.greenDeep }}>Allergen-safe table</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {flagged.map((c, i) => <span key={i} style={{ fontSize: 13, fontWeight: 700, color: C.greenDeep, background: C.white, border: `1px solid ${C.green}55`, padding: "5px 11px", borderRadius: 999 }}>{c.name} · {ALLERGENS[c.allergy].label}</span>)}
          </div>
          <div style={{ fontSize: 12.5, color: C.ink, marginTop: 10 }}>Excluded from this table: {allergens.map((k) => ALLERGENS[k].label).join(" · ")}. Wipe with separate cloths and seat a qualified educator here.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 12 }}>
          {tables.map((tb, i) => <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6 }}>Table {i + 1}</div><div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{tb.map((c) => c.name).join(", ")}</div></div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
          <Section title="Keep off the safe table">{foods}</Section>
          <Section title="Swap into today's menu" tone="green">{swaps}</Section>
        </div>
        <Section title="Adjust today's play & craft">{play}</Section>
        <div style={{ fontSize: 11.5, color: C.slate, marginTop: 16, lineHeight: 1.5 }}>Generated from each child's profile. Genevieve suggests the plan — your nominated supervisor signs off.</div>
      </div>
    </Backdrop>
  );
}

function RoomModal({ roomKey, room, att, notesByChild, onClose, onChild, onSeating, onToggle }) {
  const s = statusOf(roomKey, room);
  const meta = ROOM_META[roomKey];
  const lv = LEVEL[s.level];
  const enrolled = ROSTER[roomKey];
  const hasAllergy = presentKids(att, roomKey).some((c) => c.allergy);
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 560, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{meta.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{meta.band} · ratio {meta.ratio} · {room.present} present</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, marginTop: 14 }}><Dot level={s.level} size={9} />{lv.label} · {s.have}/{s.required} educators</div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Educators</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {room.educators.map((e, i) => <span key={i} style={{ fontSize: 13, fontWeight: 600, background: C.paper, border: `1px solid ${C.line}`, padding: "5px 11px 5px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: e.q ? C.green : C.amber }} />{e.name} {e.q ? <span style={{ color: C.green, fontWeight: 700, fontSize: 11 }}>qualified</span> : <span style={{ color: C.amber, fontWeight: 700, fontSize: 11 }}>trainee</span>}</span>)}
          {room.educators.length === 0 && <span style={{ fontSize: 13, color: C.slate, fontStyle: "italic" }}>None assigned</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate }}>Sign-in · {room.present}/{enrolled.length} in — tap a name for their file</div>
          {hasAllergy && <button onClick={() => onSeating(roomKey)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 12.5, padding: "7px 12px", borderRadius: 999, boxShadow: "0 3px 10px rgba(156,45,84,.25)" }}>🛡️ Seating &amp; play plan</button>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {enrolled.map((c, i) => {
            const sev = c.allergy ? ALLERGENS[c.allergy].sev : 0;
            const note = (notesByChild[c.name] || []).length;
            const rec = att[`${roomKey}:${c.name}`] || {};
            const signedIn = !!rec.in;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${c.allergy && signedIn ? C.red + "55" : C.line}`, background: !signedIn ? "#f7f8f7" : c.allergy ? C.redSoft : C.white, borderRadius: 12, padding: "9px 10px 9px 12px", opacity: signedIn ? 1 : 0.72 }}>
                <button onClick={() => onChild(c)} style={{ flex: 1, textAlign: "left", border: "none", background: "transparent", padding: 0, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{c.name} {c.allergy && <span style={{ fontSize: 11, color: sev === 3 ? C.red : C.amber }}>⚠</span>}</span>
                  <span style={{ fontSize: 12, color: C.slate }}>{c.age}{note ? ` · ${note} note${note > 1 ? "s" : ""}` : ""}</span>
                </button>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: signedIn ? C.greenDeep : C.slate, minWidth: 72, textAlign: "right" }}>{signedIn ? `In ${rec.time || ""}` : "Signed out"}</span>
                <button onClick={() => onToggle(roomKey, c.name)} style={{ border: `1px solid ${signedIn ? C.line : C.brand}`, background: signedIn ? C.white : C.brand, color: signedIn ? C.slate : C.white, fontWeight: 700, fontSize: 12, padding: "6px 11px", borderRadius: 999, whiteSpace: "nowrap" }}>{signedIn ? "Sign out" : "Sign in"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
}

// ---------------------------------------------------------------------------
// Outdoor play setup — traffic lights + capacity & UV bars
// ---------------------------------------------------------------------------
// Areas (zones) available outdoors, with live capacity
const ZONES = {
  "Toddler soft zone": { children: 5, max: 6 },
  "Sandpit & water play": { children: 6, max: 8 },
  "Climbing frame": { children: 6, max: 6 },
  "Bike & scooter track": { children: 4, max: 5 },
  "Shade garden (quiet)": { children: 3, max: 10 },
};
const zoneLevel = (z) => (z.children > z.max ? "red" : z.children === z.max ? "amber" : "green");
const zoneLabel = (z) => (z.children > z.max ? "Over capacity" : z.children === z.max ? "At capacity" : "Open");

// Age-group cohorts playing together outdoors this session
const OUTDOOR = {
  time: "10:30am",
  uv: 2, // 1 low · 2 high · 3 extreme
  groups: [
    {
      key: "under3", name: "Under 3s", band: "0–36 months", from: "Nursery + Toddlers",
      area: "Toddler yard · fenced from bikes",
      children: 13, required: 3, ratioText: "1:4 + 1:5 combined",
      math: "5 under-2s (1:4) + 8 under-3s (1:5) → 3 educators",
      educators: [E("Priya", true), E("Mia", true), E("Sam", true)],
      zones: ["Toddler soft zone", "Sandpit & water play"],
      epipen: ["Ethan · milk", "Amelia · nuts"], aware: [],
    },
    {
      key: "kindy", name: "Kindy 3–5s", band: "36 mo – preschool", from: "Kindy",
      area: "Main playground",
      children: 12, required: 2, ratioText: "1:11",
      math: "12 children at 1:11 → 2 educators",
      educators: [E("Jordan", true), E("Tom", true)],
      zones: ["Climbing frame", "Bike & scooter track", "Shade garden (quiet)"],
      epipen: [], aware: ["Sophie · egg", "Thomas · coeliac"],
    },
  ],
};
const groupLevel = (g) => (g.educators.length < g.required ? "red" : !g.educators.some((e) => e.q) ? "amber" : "green");

function UVBar({ level }) {
  const labels = { 1: "Low", 2: "High — hats on, water at 11:00", 3: "Extreme — shade only" };
  const cols = [C.green, C.amber, C.red];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>UV &amp; heat</span><span style={{ fontSize: 12, fontWeight: 700, color: cols[level - 1] }}>{labels[level]}</span></div>
      <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < level ? cols[level - 1] : C.line }} />)}</div>
    </div>
  );
}

function GroupCard({ g }) {
  const lvl = groupLevel(g);
  const lv = LEVEL[lvl];
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${lv.dot}`, borderRadius: 16, padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: C.ink }}>{g.name}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{g.band} · from {g.from} · ratio {g.ratioText}</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999, whiteSpace: "nowrap" }}><Dot level={lvl} size={9} />{lvl === "green" ? "In ratio" : lv.label}</div>
      </div>

      <div style={{ display: "flex", gap: 26, marginTop: 16, alignItems: "flex-end" }}>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{g.children}</div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>children in cohort</div></div>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, lineHeight: 1, color: lvl === "red" ? C.red : C.ink }}>{g.educators.length}<span style={{ fontSize: 16, color: C.slate, fontWeight: 600 }}> / {g.required}</span></div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>staff on board / needed</div></div>
        <div style={{ flex: 1, minWidth: 120 }}><FillBar value={g.educators.length} max={g.required} color={lv.dot} /><div style={{ fontSize: 11, color: C.slate, marginTop: 6 }}>{g.math}</div></div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "16px 0 8px" }}>Staff on board</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {g.educators.map((e, i) => <span key={i} style={{ fontSize: 12.5, fontWeight: 600, background: C.paper, border: `1px solid ${C.line}`, padding: "4px 11px 4px 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: e.q ? C.green : C.amber }} />{e.name} {e.q ? <span style={{ color: C.green, fontWeight: 700, fontSize: 10.5 }}>qualified</span> : <span style={{ color: C.amber, fontWeight: 700, fontSize: 10.5 }}>trainee</span>}</span>)}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "16px 0 8px" }}>Areas in use · {g.area}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {g.zones.map((zn, i) => {
          const z = ZONES[zn]; const zl = zoneLevel(z);
          return (
            <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 12.5, fontWeight: 600, color: C.ink }}>{zn}</span><Dot level={zl} size={8} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.slate, margin: "6px 0 5px" }}><span>{z.children}/{z.max}</span><span style={{ fontWeight: 700, color: LEVEL[zl].text }}>{zoneLabel(z)}</span></div>
              <FillBar value={z.children} max={z.max} color={LEVEL[zl].dot} />
            </div>
          );
        })}
      </div>

      {(g.epipen.length > 0 || g.aware.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {g.epipen.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: C.redText, background: C.redSoft, padding: "4px 10px", borderRadius: 999 }}>⚠ EpiPen out: {n}</span>)}
          {g.aware.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "#7a6300", background: C.amberSoft, padding: "4px 10px", borderRadius: 999 }}>allergy-aware: {n}</span>)}
        </div>
      )}
    </div>
  );
}

function Playground() {
  const total = OUTDOOR.groups.reduce((a, g) => a + g.children, 0);
  const onBoard = OUTDOOR.groups.reduce((a, g) => a + g.educators.length, 0);
  const needed = OUTDOOR.groups.reduce((a, g) => a + g.required, 0);
  const supOk = onBoard >= needed;
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🌳</span>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Outdoor play setup</div>
        <span style={{ fontSize: 12, color: C.slate }}>{OUTDOOR.time} session · {total} children outdoors</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>Children are grouped into the age cohorts that play together, each with its own ratio and staff on board. The play areas each cohort is using sit underneath, on the same traffic light.</div>

      {/* top status strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12, marginBottom: 14 }} className="strip">
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}><UVBar level={OUTDOOR.uv} /></div>
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${supOk ? C.green : C.red}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Total outdoor supervision</div>
          <div style={{ fontFamily: "var(--display)", fontSize: 22, fontWeight: 800, color: supOk ? C.green : C.red }}>{onBoard} <span style={{ fontSize: 14, color: C.slate, fontWeight: 600 }}>/ {needed} needed</span></div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{supOk ? "Both cohorts in ratio" : "A cohort is short — call a float educator"}</div>
        </div>
      </div>

      {/* age-group cohort cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="rooms">
        {OUTDOOR.groups.map((g) => <GroupCard key={g.key} g={g} />)}
      </div>

      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Cohorts, area limits and which groups combine are your service's settings. Genevieve checks each cohort against ratio, keeps the under-3s fenced from the bike track, flags areas at capacity, watches UV, and reminds staff which EpiPens go outside.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rest & sleep time — safe-sleep check timer + sleeper profiles
// ---------------------------------------------------------------------------
const SLEEP_PROFILE = {
  fast:   { label: "Out like a light", color: C.green, note: "Settles fast and sleeps soundly." },
  more:   { label: "Needs a longer rest", color: C.green, note: "Sleeps deeply — wakes grumpy if cut short, let them run on." },
  slow:   { label: "Slow to settle", color: C.amber, note: "Needs patting or quiet company to drift off." },
  resist: { label: "Resists rest", color: C.red, note: "Fights sleep — offer a quiet activity so the others can settle." },
  quiet:  { label: "Quiet rester (no nap)", color: C.slate, note: "Has dropped the daytime nap — quiet play instead of sleep." },
};
const CHILD_SLEEP = { Olivia: "fast", Ethan: "more", Ava: "fast", Amelia: "fast", Charlotte: "slow", Jack: "resist", Sophie: "quiet", Thomas: "quiet", Mason: "quiet", Ella: "quiet" };
const softFor = (c) => (c === C.green ? C.greenSoft : c === C.amber ? C.amberSoft : c === C.red ? C.redSoft : "#eef1ef");

const SLEEP = {
  time: "12:30pm", interval: 10, room: "Under-3 rest room", supervisor: E("Sam", true),
  sleepers: [
    { name: "Olivia", profile: "fast", state: "asleep", mins: 42 },
    { name: "Ethan", profile: "more", state: "asleep", mins: 50 },
    { name: "Amelia", profile: "fast", state: "asleep", mins: 30 },
    { name: "Ava", profile: "fast", state: "asleep", mins: 38 },
    { name: "Charlotte", profile: "slow", state: "settling", mins: 18 },
    { name: "Jack", profile: "resist", state: "awake", mins: 0 },
  ],
  quiet: { supervisor: E("Jordan", true), area: "Kindy quiet corner", names: ["Sophie", "Thomas", "Mason", "Ella"] },
};
const STATE = { asleep: { label: "Asleep", level: "green" }, settling: { label: "Settling", level: "amber" }, awake: { label: "Awake / restless", level: "red" } };

function sleeperAlert(s) {
  if (s.state === "settling" && s.mins >= 15) return { level: "amber", text: `Still settling after ${s.mins} min — try patting or dimming the lights.` };
  if (s.state === "awake") return { level: "amber", text: "Resisting rest — settle with a quiet activity so the others stay asleep." };
  return null;
}

function SleeperCard({ s }) {
  const p = SLEEP_PROFILE[s.profile];
  const st = STATE[s.state];
  const alert = sleeperAlert(s);
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink }}>{s.name}</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: LEVEL[st.level].bg, color: LEVEL[st.level].text, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}><Dot level={st.level} size={8} />{st.label}</span>
      </div>
      <div style={{ display: "inline-block", marginTop: 9, fontSize: 12, fontWeight: 700, color: p.color, background: softFor(p.color), padding: "4px 10px", borderRadius: 999 }}>{p.label}</div>
      <div style={{ fontSize: 12, color: C.slate, marginTop: 8 }}>{s.state === "asleep" ? `Asleep ${s.mins} min` : s.state === "settling" ? `Settling ${s.mins} min` : "Not yet resting"}</div>
      {alert && <div style={{ marginTop: 10, background: LEVEL[alert.level].bg, color: LEVEL[alert.level].text, borderRadius: 9, padding: "8px 10px", fontSize: 12, fontWeight: 600, display: "flex", gap: 7 }}><span>⚠</span>{alert.text}</div>}
    </div>
  );
}

function Sleep() {
  const [checkAgo, setCheckAgo] = useState(11); // minutes since last safety check
  const level = checkAgo >= SLEEP.interval ? "red" : checkAgo >= SLEEP.interval - 3 ? "amber" : "green";
  const label = level === "red" ? "Safety check overdue" : level === "amber" ? "Check due soon" : "Check up to date";
  const asleep = SLEEP.sleepers.filter((s) => s.state === "asleep").length;

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🛌</span>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Rest &amp; sleep time</div>
        <span style={{ fontSize: 12, color: C.slate }}>{SLEEP.time} · {SLEEP.room} · {asleep} asleep</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>Each child carries a sleep profile so staff know who settles fast and who needs support — and the safe-sleep timer keeps the regulated physical checks on schedule.</div>

      {/* top strip: safety-check timer (the regulated alert) + supervision */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 14 }} className="strip">
        <div style={{ background: level === "red" ? C.redSoft : C.white, border: `1px solid ${level === "red" ? C.red + "44" : C.line}`, borderLeft: `6px solid ${LEVEL[level].dot}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Dot level={level} size={11} /><span style={{ fontWeight: 800, fontSize: 15, color: LEVEL[level].text }}>{label}</span></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, marginTop: 6, lineHeight: 1 }}>{checkAgo} min <span style={{ fontSize: 13, color: C.slate, fontWeight: 600 }}>since last check</span></div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>Service policy: physical visual check every {SLEEP.interval} min</div>
          </div>
          <button onClick={() => setCheckAgo(0)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 14, padding: "12px 18px", borderRadius: 11, boxShadow: "0 4px 12px rgba(156,45,84,.25)" }}>✓ Log safety check</button>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.green}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Sleep-room supervision</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: C.ink }}><span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />{SLEEP.supervisor.name} <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>qualified</span></div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>In ratio · lights dimmed · door to floor open for sightline</div>
        </div>
      </div>

      {/* sleeper board */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
        {SLEEP.sleepers.map((s, i) => <SleeperCard key={i} s={s} />)}
      </div>

      {/* quiet (non-nap) group */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink }}>Quiet rest group</span>
          <span style={{ fontSize: 12, color: C.slate }}>· {SLEEP.quiet.area} · {SLEEP.quiet.supervisor.name}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {SLEEP.quiet.names.map((n, i) => <span key={i} style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, background: "#eef1ef", padding: "4px 11px", borderRadius: 999 }}>{n}</span>)}
        </div>
        <div style={{ fontSize: 12, color: C.slate, marginTop: 10 }}>Children who've dropped the nap rest with books, puzzles and drawing — never forced to sleep, never woken early.</div>
      </div>

      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Safe-sleep note: Genevieve prompts and logs the timing of physical checks — it does not replace an educator's visual and physical check of each sleeping child, which stays the staff member's responsibility under your safe-sleep policy and the National Law.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function GenevieveChildcare() {
  const [scenarioKey, setScenarioKey] = useState("open");
  const [override, setOverride] = useState(null);
  const [banner, setBanner] = useState(null);
  const [openRoom, setOpenRoom] = useState(null);
  const [openChild, setOpenChild] = useState(null);
  const [seatingRoom, setSeatingRoom] = useState(null);

  // parent notes, seeded from roster, editable in-session
  const [notesByChild, setNotesByChild] = useState(() => {
    const m = {};
    Object.values(ROSTER).flat().forEach((c) => { if (c.notes) m[c.name] = [...c.notes]; });
    return m;
  });
  const addNote = (name, text) => setNotesByChild((p) => ({ ...p, [name]: [...(p[name] || []), text] }));

  // attendance (clock in/out), seeded from the scenario, editable in-session
  const [attendance, setAttendance] = useState(() => initAttendance(SCENARIOS["open"].rooms));
  const toggleAttendance = (key, name) => setAttendance((p) => { const cur = p[`${key}:${name}`] || {}; return { ...p, [`${key}:${name}`]: { in: !cur.in, time: !cur.in ? "just now" : null } }; });

  const base = SCENARIOS[scenarioKey];
  const baseRooms = override || base.rooms;
  const rooms = useMemo(() => liveRoomsFrom(baseRooms, attendance), [baseRooms, attendance]);
  useEffect(() => { setOverride(null); setBanner(null); setOpenRoom(null); setOpenChild(null); setSeatingRoom(null); setAttendance(initAttendance(SCENARIOS[scenarioKey].rooms)); }, [scenarioKey]);

  const alerts = useMemo(() => buildAlerts(rooms, attendance), [rooms, attendance]);
  const worst = useMemo(() => {
    const lv = Object.keys(rooms).map((k) => statusOf(k, rooms[k]).level);
    if (lv.includes("red")) return "red";
    if (lv.includes("amber")) return "amber";
    return "green";
  }, [rooms]);
  const redCount = Object.keys(rooms).filter((k) => statusOf(k, rooms[k]).level === "red").length;
  const amberCount = Object.keys(rooms).filter((k) => statusOf(k, rooms[k]).level === "amber").length;
  const heroText = worst === "green" ? "Centre is in ratio" : worst === "red" ? `${redCount} room${redCount > 1 ? "s" : ""} out of ratio` : `${amberCount} room${amberCount > 1 ? "s" : ""} need attention`;
  const onBalance = () => { const { rooms: next, notes } = balance(rooms); setOverride(next); setBanner(notes); };

  return (
    <div style={{ fontFamily: "var(--body)", background: C.paper, minHeight: "100vh", color: C.ink, padding: "0 0 56px", border: "6px solid #9c2d54", boxSizing: "border-box" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        :root{ --display:'Plus Jakarta Sans',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif; }
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(248,8,8,.5)}70%{box-shadow:0 0 0 7px rgba(248,8,8,0)}100%{box-shadow:0 0 0 0 rgba(248,8,8,0)}}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box} button{cursor:pointer;font-family:var(--body)}
        @media (max-width:760px){.grid2{grid-template-columns:1fr !important}.rooms{grid-template-columns:1fr !important}.strip{grid-template-columns:1fr !important}}
      `}</style>

      <header style={{ background: "linear-gradient(135deg,#8e2247,#c0436f)", borderBottom: "none", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 5, color: "#ffffff" }}>
        <Logo />
        <div style={{ textAlign: "right", lineHeight: 1.2, color: "#ffffff" }}><div style={{ fontWeight: 700, fontSize: 14 }}>Sunrise Early Learning</div><div style={{ fontSize: 12, color: "#ffd9e6" }}>Labrador, Gold Coast QLD</div></div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
          {Object.keys(SCENARIOS).map((k) => { const active = k === scenarioKey; return <button key={k} onClick={() => setScenarioKey(k)} style={{ border: `1px solid ${active ? C.brand : C.line}`, background: active ? C.brand : C.white, color: active ? C.white : C.ink, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 999, transition: "all .15s ease" }}>{SCENARIOS[k].label}</button>; })}
        </div>

        <div style={{ marginTop: 16, background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${LEVEL[worst].dot}`, borderRadius: 18, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: LEVEL[worst].bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Dot level={worst} size={26} /></div>
            <div><div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{heroText}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 4, maxWidth: 470 }}>{base.note}</div></div>
          </div>
          <button onClick={onBalance} style={{ background: C.brand, color: C.white, border: "none", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 12, boxShadow: "0 4px 14px rgba(156,45,84,.28)", transition: "transform .12s ease" }} onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")} onMouseUp={(e) => (e.currentTarget.style.transform = "none")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>⚡ Balance rooms</button>
        </div>

        {banner && <div style={{ marginTop: 12, background: C.brandSoft, border: `1px solid ${C.brand}33`, borderRadius: 14, padding: "14px 18px", animation: "fade .3s ease" }}><div style={{ fontWeight: 700, color: C.brandDeep, fontSize: 13, marginBottom: 6 }}>Genevieve rebalanced your floor</div>{banner.map((n, i) => <div key={i} style={{ fontSize: 13, color: C.ink, display: "flex", gap: 8, marginTop: 2 }}><span style={{ color: C.brand, fontWeight: 700 }}>→</span> {n}</div>)}</div>}

        <Legend />

        <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, marginTop: 18, alignItems: "start" }}>
          <div className="rooms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {Object.keys(rooms).map((k) => <RoomCard key={k} roomKey={k} room={rooms[k]} att={attendance} onOpen={setOpenRoom} />)}
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, position: "sticky", top: 88 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Live alerts</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, marginBottom: 8 }}>Ratio &amp; staffing</div>
            {alerts.ratio.length === 0 ? <div style={{ background: C.greenSoft, borderRadius: 12, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: C.greenDeep, display: "flex", gap: 8 }}><Dot level="green" size={10} /> All rooms in ratio</div> : alerts.ratio.map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8, animation: "fade .25s ease" }}><Dot level={a.level} size={10} /><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "16px 0 8px" }}>Allergy care</div>
            {alerts.care.length === 0 ? <div style={{ fontSize: 13, color: C.slate }}>No allergy children present.</div> : alerts.care.map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 13 }}>⚠</span><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
          </div>
        </div>

        <Playground />

        <Sleep />

        <div style={{ marginTop: 26, fontSize: 11.5, color: C.slate, lineHeight: 1.5 }}>Educator-to-child ratios shown are based on the Queensland / National Quality Framework minimums (Nursery 1:4 · Toddlers 1:5 · Kindy 1:11 · OSHC 1:15). Genevieve is a decision-support tool to help your team stay organised and in ratio — it does not replace your nominated supervisor's judgement or your obligations under the National Law.</div>
      </div>

      {openRoom && !seatingRoom && <RoomModal roomKey={openRoom} room={rooms[openRoom]} att={attendance} notesByChild={notesByChild} onClose={() => setOpenRoom(null)} onChild={(c) => setOpenChild(c)} onSeating={(k) => setSeatingRoom(k)} onToggle={toggleAttendance} />}
      {openChild && <ChildModal child={openChild} roomName={ROOM_META[openRoom]?.name || ""} notes={notesByChild[openChild.name]} onAddNote={addNote} onClose={() => setOpenChild(null)} />}
      {seatingRoom && <SeatingPlan roomKey={seatingRoom} att={attendance} onClose={() => setSeatingRoom(null)} />}
    </div>
  );
}
