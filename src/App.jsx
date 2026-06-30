import React, { useState, useEffect, useRef } from "react";
import { supabase } from './supabase.js'

const SK = "yin-final-v1";
const load = () => { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const save = (s) => { try { localStorage.setItem(SK, JSON.stringify(s)); } catch {} };
const saveCloud = async (s) => { try { await supabase.from('dashboard_data').upsert({ id: 'yin', data: s, updated_at: new Date() }); } catch {} };
const loadCloud = async () => { try { const { data } = await supabase.from('dashboard_data').select('data').eq('id','yin').single(); return data?.data || {}; } catch { return {}; } };

const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const todayKey = () => localDateStr();
const getWeekMon = () => {
  const d = new Date(); const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d); mon.setDate(diff);
  return localDateStr(mon);
};
const getMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today = new Date();
const todayDOW = DOW[today.getDay()];
const isSunday = todayDOW === "Sunday";

const AFFIRMATIONS = [
  "I am a woman who deserves love, success, and respect — and I show up every day as proof of that.",
  "My body is healing, strengthening, and thriving. I give it what it needs and it rewards me abundantly.",
  "Financial freedom is not a dream — it is my destination, and every action I take today moves me closer to it.",
  "If not me, then who?",
];

const SKINCARE_SCHEDULE = {
  Sunday:    { treatment: "Mandelic Acid", type: "acid", color: "#C9A8B2" },
  Monday:    { treatment: "Azelaic Acid", type: "acid", color: "#B8A9C4" },
  Tuesday:   { treatment: "Hydration Day", type: "hydration", color: "#A8BFC9" },
  Wednesday: { treatment: "Azelaic Acid", type: "acid", color: "#B8A9C4" },
  Thursday:  { treatment: "Mandelic Acid", type: "acid", color: "#C9A8B2" },
  Friday:    { treatment: "Azelaic Acid", type: "acid", color: "#B8A9C4" },
  Saturday:  { treatment: "Hydration Day", type: "hydration", color: "#A8BFC9" },
};

const TEAS = ["Green tea","Nettle tea","Spearmint tea","Ginger tea","Chamomile tea","Rooibos","Peppermint tea","Hibiscus tea","Other"];

const FIBER_FOODS = [
  { name: "Lentils (1 cup cooked)", g: 15.6 },
  { name: "Black beans (1 cup)", g: 15 },
  { name: "Chickpeas (1 cup)", g: 12.5 },
  { name: "Avocado (1 whole)", g: 10 },
  { name: "Chia seeds (2 tbsp)", g: 8 },
  { name: "Broccoli (1 cup)", g: 5.1 },
  { name: "Apple (1 medium)", g: 4.4 },
  { name: "Oats (1 cup cooked)", g: 4 },
  { name: "Spinach (1 cup cooked)", g: 4 },
  { name: "Sweet potato (1 medium)", g: 3.8 },
  { name: "Banana (1 medium)", g: 3.1 },
  { name: "Brown rice (1 cup)", g: 3.5 },
  { name: "Almonds (1 oz)", g: 3.5 },
  { name: "Custom", g: 0 },
];

const WEEKLY = {
  walk: { label: "Walks", target: 3, icon: "🚶🏽‍♀️", color: "#7BA68A" },
  read: { label: "Reading Sessions", target: 4, icon: "📖", color: "#8A7BA6" },
  tradingStudy: { label: "Trading Study", target: 3, icon: "📈", color: "#7BA6A6" },
};

const WORKOUT_SCHEDULE = [
  { day: "Monday",   type: "Strength", short: "Mon" },
  { day: "Tuesday",  type: "Pilates",  short: "Tue" },
  { day: "Thursday", type: "Strength", short: "Thu" },
  { day: "Saturday", type: "Pilates",  short: "Sat" },
];

const BP_COMPANIES = [
  { name:"Stryker",        role:"Clinical Specialist / Mako",              priority:1 },
  { name:"J&J MedTech",   role:"Regional Clinical Sales Specialist",       priority:2 },
  { name:"Zimmer Biomet",  role:"Clinical Specialist, Joints",              priority:3 },
  { name:"Smith+Nephew",   role:"Assoc. Sales Rep, Sports Med",             priority:4 },
  { name:"Arthrex",        role:"Clinical Sales Rep",                       priority:5 },
  { name:"KARL STORZ",     role:"Sales Executive, Surgical",                priority:6 },
];

const BP_PHASES = [
  { phase:"Wk 1–2",  task:"LinkedIn audit + connect with 20+ reps and DMs at Stryker, J&J, Zimmer in Atlanta" },
  { phase:"Wk 2–3",  task:"Position resume: athletic training as clinical adjacent, anatomy expertise, high-stakes environments" },
  { phase:"Wk 3–6",  task:"Apply Stryker first, then J&J, Zimmer, Smith+Nephew. 2 informational calls per week" },
  { phase:"Mo 2–3",  task:"Interview prep + OR shadow. Study hip/knee surgical approach. Own your story cold" },
];

const STAGE_COLORS = {
  "Lead":"#B8A9C4","Proposal Sent":"#C9A870","In Build":"#7A9AB8",
  "Delivered":"#8A7BA6","Paid":"#7BA68A","Ongoing":"#6A9A8A",
};
const STAGES = ["Lead","Proposal Sent","In Build","Delivered","Paid","Ongoing"];

// Daily score checks — recalculated around new set
const DAILY_SCORE_CHECKS = ["vitaminIron","vitaminD","skincareAM","skincarePM","todayTreatment","sleep7","journaled"];
// Additional scored items (computed separately): mood set, tea logged, fiber 25g+, win of day

function getNextRice(last) {
  if (!last) return null;
  const d = new Date(last); d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr) - new Date(todayKey())) / 86400000);
}
function calcStreak(dailyData) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = localDateStr(d);
    const dh = (dailyData || {})[k] || {};
    const checksDone = DAILY_SCORE_CHECKS.filter(h => dh[h]).length;
    const teaDone = (dh.teas||[]).length > 0 ? 1 : 0;
    const fiberDone = (dh.fiber||[]).reduce((s,e)=>s+e.g,0) >= 25 ? 1 : 0;
    const moodDone = (dh.mood||0) > 0 ? 1 : 0;
    const winDone = (dh.win||"").length > 5 ? 1 : 0;
    const total = checksDone + teaDone + fiberDone + moodDone + winDone;
    const totalPossible = DAILY_SCORE_CHECKS.length + 4;
    if ((total / totalPossible) >= 0.6) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}
function fmtDate(s) {
  return new Date(s+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}

// ── Design tokens ──
const C = {
  bg: "#F8F5F3",
  ivory: "#F2EEE9",
  border: "#E8E4DF",
  borderDark: "#DDD9D2",
  rose: "#C9A8B2",
  roseLight: "#EDE0E4",
  roseMid: "#D9BEC5",
  text: "#1C1A18",
  textMid: "#5A5550",
  textLight: "#9A948E",
  textFaint: "#C4BFB9",
  gold: "#B8956A",
  goldLight: "#D4AF80",
  green: "#7BA68A",
  blue: "#7A9AB8",
  purple: "#8A7BA6",
};

export default function Dashboard() {
  const [data, setData] = useState(load);
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [tab, setTab] = useState("today");
  const [affirmIdx, setAffirmIdx] = useState(0);
  const [teaInput, setTeaInput] = useState("");
  const [showTeaMenu, setShowTeaMenu] = useState(false);
  const [showFiberMenu, setShowFiberMenu] = useState(false);
  const [fiberCustomG, setFiberCustomG] = useState("");
  const [fiberCustomName, setFiberCustomName] = useState("");
  const [incomeAmt, setIncomeAmt] = useState("");
  const [incomeNote, setIncomeNote] = useState("");
  const [tradeAmt, setTradeAmt] = useState("");
  const [tradeNote, setTradeNote] = useState("");
  const [tradeType, setTradeType] = useState("paper");
  const [networkName, setNetworkName] = useState("");
  const [networkNote, setNetworkNote] = useState("");
  const [networkFollowUp, setNetworkFollowUp] = useState("");
  const [viewDay, setViewDay] = useState(todayKey());
  const [historyDay, setHistoryDay] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [newEvent, setNewEvent] = useState({ text:"", type:"event", time:"", location:"", description:"" });
  const [newTodo, setNewTodo] = useState("");
  const [todoType, setTodoType] = useState("personal");
  const [newClientName, setNewClientName] = useState("");
  const [newClientStage, setNewClientStage] = useState("Lead");
  const [newClientNote, setNewClientNote] = useState("");
  const [newDecision, setNewDecision] = useState("");
  const teaRef = useRef();
  const fiberRef = useRef();

  const today_k = todayKey();
  const week_k = getWeekMon();
  const month_k = getMonth();

  // ── Supabase sync with cloudLoaded gate ──
  useEffect(() => {
    loadCloud().then(cloud => {
      if (cloud && Object.keys(cloud).length > 0) setData(cloud);
      setCloudLoaded(true);
    });
  }, []);
  useEffect(() => {
    if (!cloudLoaded) return;
    save(data);
    saveCloud(data);
  }, [data, cloudLoaded]);

  useEffect(() => {
    const t = setInterval(() => setAffirmIdx(i => (i + 1) % AFFIRMATIONS.length), 7000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const h = (e) => {
      if (teaRef.current && !teaRef.current.contains(e.target)) setShowTeaMenu(false);
      if (fiberRef.current && !fiberRef.current.contains(e.target)) setShowFiberMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Daily helpers ──
  const td = (k) => ((data.daily || {})[today_k] || {})[k];
  const setTd = (k, v) => setData(p => ({ ...p, daily: { ...p.daily, [today_k]: { ...(p.daily||{})[today_k], [k]: v } } }));
  const toggle = (k) => setTd(k, !td(k));
  const wk = (k) => ((data.weekly || {})[week_k] || {})[k] || 0;
  const incWk = (k) => setData(p => ({ ...p, weekly: { ...p.weekly, [week_k]: { ...(p.weekly||{})[week_k], [k]: wk(k)+1 } } }));
  const decWk = (k) => setData(p => ({ ...p, weekly: { ...p.weekly, [week_k]: { ...(p.weekly||{})[week_k], [k]: Math.max(0,wk(k)-1) } } }));

  // ── Wins feed with auto-win reversal ──
  const addWin = (text, winId) => {
    setData(p => {
      const wins = p.wins || [];
      const id = winId || `${Date.now()}-${text.slice(0,10)}`;
      const existing = wins.findIndex(w => w.winId === id);
      if (existing > -1) return p; // already exists, don't duplicate
      const updated = [{ text, date: today_k, id: Date.now(), winId: id }, ...wins].slice(0, 40);
      return { ...p, wins: updated };
    });
  };
  const removeWinById = (winId) => {
    setData(p => ({ ...p, wins: (p.wins||[]).filter(w => w.winId !== winId) }));
  };

  // ── Tea ──
  const teaLog = td("teas") || [];
  const addTea = (tea) => { setTd("teas", [...teaLog, { tea, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]); setShowTeaMenu(false); setTeaInput(""); };
  const removeTea = (i) => { const t=[...teaLog]; t.splice(i,1); setTd("teas",t); };

  // ── Fiber ──
  const fiberLog = td("fiber") || [];
  const fiberTotal = fiberLog.reduce((s,e) => s + e.g, 0);
  const addFiber = (name, g) => { setTd("fiber", [...fiberLog, { name, g: parseFloat(g), id: Date.now() }]); setShowFiberMenu(false); setFiberCustomG(""); setFiberCustomName(""); };
  const removeFiber = (id) => setTd("fiber", fiberLog.filter(e => e.id !== id));

  // ── Hair ──
  const lastRice = data.lastRiceTreatment || "2026-05-17";
  const nextRice = getNextRice(lastRice);
  const riceCountdown = daysUntil(nextRice);
  const markRiceDone = () => setData(p => ({ ...p, lastRiceTreatment: today_k }));

  const mood = td("mood") || 0;
  const priority = td("priority") || "";
  const win = td("win") || "";

  // ── Finance ──
  const monthIncome = (data.income || {})[month_k] || [];
  const addIncome = () => {
    if (!incomeAmt) return;
    const entry = { amt: parseFloat(incomeAmt), note: incomeNote, date: today_k, id: Date.now() };
    setData(p => ({ ...p, income: { ...p.income, [month_k]: [...monthIncome, entry] } }));
    addWin(`Income logged: $${parseFloat(incomeAmt).toFixed(0)}${incomeNote ? " — " + incomeNote : ""}`, `income-${entry.id}`);
    setIncomeAmt(""); setIncomeNote("");
  };
  const removeIncome = (id) => setData(p => ({ ...p, income: { ...p.income, [month_k]: monthIncome.filter(e=>e.id!==id) } }));
  const totalIncome = monthIncome.reduce((s,e) => s+e.amt, 0);

  const monthTrades = (data.trades || {})[month_k] || [];
  const addTrade = () => {
    if (!tradeAmt) return;
    setData(p => ({ ...p, trades: { ...p.trades, [month_k]: [...monthTrades, { amt: parseFloat(tradeAmt), note: tradeNote, type: tradeType, date: today_k, id: Date.now() }] } }));
    setTradeAmt(""); setTradeNote("");
  };
  const removeTrade = (id) => setData(p => ({ ...p, trades: { ...p.trades, [month_k]: monthTrades.filter(e=>e.id!==id) } }));
  const totalPL = monthTrades.filter(t=>t.type==="live").reduce((s,e)=>s+e.amt,0);
  const totalPaper = monthTrades.filter(t=>t.type==="paper").reduce((s,e)=>s+e.amt,0);

  // ── Network ──
  const networkLog = data.network || [];
  const addNetwork = () => {
    if (!networkName) return;
    const id = Date.now();
    setData(p => ({ ...p, network: [...(p.network||[]), { name: networkName, note: networkNote, followUp: networkFollowUp, date: today_k, id, done: false }] }));
    addWin(`New connection: ${networkName}`, `network-${id}`);
    setNetworkName(""); setNetworkNote(""); setNetworkFollowUp("");
  };
  const toggleNetworkDone = (id) => setData(p => ({ ...p, network: p.network.map(n => n.id===id ? {...n,done:!n.done} : n) }));
  const removeNetwork = (id) => setData(p => ({ ...p, network: p.network.filter(n=>n.id!==id) }));

  // ── Weekly reviews ──
  const sundayReset = (data.sundayReset || {})[week_k] || { worked:"", didnt:"", carrying:"", intention:"" };
  const setSundayReset = (field, val) => setData(p => ({ ...p, sundayReset: { ...p.sundayReset, [week_k]: { ...sundayReset, [field]: val } } }));
  const moneyReview = (data.moneyReview || {})[week_k] || { income:"", spent:"", gap:"", plan:"" };
  const setMoneyReview = (field, val) => setData(p => ({ ...p, moneyReview: { ...p.moneyReview, [week_k]: { ...moneyReview, [field]: val } } }));

  // ── Workouts — with win reversal on uncheck ──
  const workouts = (data.workouts || {})[week_k] || {};
  const toggleWorkout = (day) => {
    const wasChecked = !!workouts[day];
    const updated = { ...workouts, [day]: !wasChecked };
    const type = WORKOUT_SCHEDULE.find(w => w.day === day)?.type || "Workout";
    const workoutWinId = `workout-${week_k}-${day}`;
    const perfectWinId = `perfect-week-${week_k}`;

    if (wasChecked) {
      // Unchecking: remove the win entry
      setData(p => {
        const newWorkouts = { ...p.workouts, [week_k]: updated };
        const newWins = (p.wins||[]).filter(w => w.winId !== workoutWinId && w.winId !== perfectWinId);
        return { ...p, workouts: newWorkouts, wins: newWins };
      });
    } else {
      setData(p => ({ ...p, workouts: { ...p.workouts, [week_k]: updated } }));
      addWin(`${type} done — ${day}`, workoutWinId);
      const doneCount = Object.values(updated).filter(Boolean).length;
      if (doneCount === 4) addWin("Perfect week — all 4 workouts done", perfectWinId);
    }
  };
  const workoutsDone = Object.values(workouts).filter(Boolean).length;

  // ── Weigh-in ──
  const weighLog = data.weighLog || [];
  const thisWeekWeigh = weighLog.find(w => w.week === week_k);
  const setWeighIn = (val) => {
    const entry = { week: week_k, weight: parseFloat(val), date: today_k };
    setData(p => {
      const log = p.weighLog || [];
      const existing = log.findIndex(w => w.week === week_k);
      const updated = existing > -1 ? log.map((w,i) => i===existing ? entry : w) : [entry, ...log];
      return { ...p, weighLog: updated };
    });
  };
  const lastWeekWeigh = weighLog[1];
  const weighDiff = thisWeekWeigh && lastWeekWeigh ? (thisWeekWeigh.weight - lastWeekWeigh.weight).toFixed(1) : null;

  // ── Big Picture helpers ──
  const bp = data.bigPicture || {};
  const setBP = (key, val) => setData(p => ({ ...p, bigPicture: { ...(p.bigPicture||{}), [key]: val } }));
  const bpTracks = bp.tracks || {};
  const setTrack = (trackKey, val) => setBP("tracks", { ...bpTracks, [trackKey]: { ...(bpTracks[trackKey]||{}), ...val } });

  const ba = bpTracks.britally || {};
  const ds = bpTracks.devicesales || {};
  const fn = bpTracks.foundation || {};
  const bpPipeline = ba.pipeline || [];
  const bpDecisions = fn.decisionQueue || [];
  const bpCompanies = ds.targetCompanies || BP_COMPANIES.map(c => ({ ...c, applied: false, interview: false }));
  const bpCounters = ds.counters || { apps: 0, calls: 0 };
  const bpReview = (bp.weeklyReview || {})[week_k] || { wins:"", stalled:"", ba:"", ds:"", fn:"" };
  const setBPReview = (field, val) => setBP("weeklyReview", { ...(bp.weeklyReview||{}), [week_k]: { ...bpReview, [field]: val } });

  const addClient = () => {
    if (!newClientName.trim()) return;
    const client = { id: Date.now(), name: newClientName.trim(), stage: newClientStage, note: newClientNote.trim() };
    setTrack("britally", { pipeline: [...bpPipeline, client] });
    addWin(`New client added: ${newClientName.trim()}`, `client-add-${client.id}`);
    setNewClientName(""); setNewClientNote("");
  };
  const removeClient = (id) => setTrack("britally", { pipeline: bpPipeline.filter(c => c.id !== id) });
  const updateClientStage = (id, stage) => {
    setTrack("britally", { pipeline: bpPipeline.map(c => c.id===id ? {...c,stage} : c) });
    if (stage === "Paid") addWin(`Client paid: ${bpPipeline.find(c=>c.id===id)?.name||""}`, `client-paid-${id}`);
  };

  const addDecision = () => {
    if (!newDecision.trim()) return;
    setTrack("foundation", { decisionQueue: [...bpDecisions, { id: Date.now(), text: newDecision.trim(), date: today_k, resolved: false }] });
    setNewDecision("");
  };
  const toggleDecision = (id) => {
    const updated = bpDecisions.map(d => d.id===id ? {...d,resolved:!d.resolved} : d);
    setTrack("foundation", { decisionQueue: updated });
    const resolved = updated.find(d=>d.id===id);
    if (resolved?.resolved) addWin(`Decision resolved: ${resolved.text}`, `decision-${id}`);
    else removeWinById(`decision-${id}`);
  };
  const removeDecision = (id) => setTrack("foundation", { decisionQueue: bpDecisions.filter(d => d.id !== id) });

  const toggleCompany = (i, field) => {
    const updated = bpCompanies.map((c,idx) => idx===i ? {...c,[field]:!c[field]} : c);
    setTrack("devicesales", { targetCompanies: updated });
    if (field==="applied" && !bpCompanies[i].applied) addWin(`Applied to ${bpCompanies[i].name}`, `applied-${bpCompanies[i].name}`);
    if (field==="interview" && !bpCompanies[i].interview) addWin(`Interview scheduled at ${bpCompanies[i].name}`, `interview-${bpCompanies[i].name}`);
  };
  const adjCounter = (key, delta) => {
    const updated = { ...bpCounters, [key]: Math.max(0, (bpCounters[key]||0)+delta) };
    setTrack("devicesales", { counters: updated });
    if (key==="apps" && updated.apps===1) addWin("First job application sent this week", `first-app-${week_k}`);
  };

  const saveBPReview = () => {
    const entry = {
      week: week_k, date: today_k, energy: bp.energy || 0,
      baIncome: totalIncome, apps: bpCounters.apps || 0,
      calls: bpCounters.calls || 0, workouts: workoutsDone,
      weight: thisWeekWeigh?.weight || null,
      theMove: bp.theMove || "", ...bpReview,
    };
    const log = bp.progressLog || [];
    const existing = log.findIndex(l => l.week === week_k);
    const updated = existing > -1 ? log.map((l,i) => i===existing ? entry : l) : [entry, ...log];
    setBP("progressLog", updated);
  };

  // ── Computed score ──
  const scoredChecks = DAILY_SCORE_CHECKS.filter(k=>td(k)).length;
  const teaScore = teaLog.length > 0 ? 1 : 0;
  const fiberScore = fiberTotal >= 25 ? 1 : 0;
  const moodScore = mood > 0 ? 1 : 0;
  const winScore = win.length > 5 ? 1 : 0;
  const doneCount = scoredChecks + teaScore + fiberScore + moodScore + winScore;
  const totalChecks = DAILY_SCORE_CHECKS.length + 4;
  const pct = Math.round((doneCount/totalChecks)*100);
  const streak = calcStreak(data.daily);
  const todaySkincare = SKINCARE_SCHEDULE[todayDOW];

  // ── Calendar ──
  const calEvents = data.calEvents || {};
  const calDayKey = (d) => d.toISOString().split("T")[0];
  const addEvent = () => {
    if (!newEvent.text.trim() || !selectedDay) return;
    const entry = { ...newEvent, text: newEvent.text.trim(), id: Date.now() };
    setData(p => ({ ...p, calEvents: { ...p.calEvents, [selectedDay]: [...(p.calEvents?.[selectedDay]||[]), entry] } }));
    setNewEvent({ text:"", type:"event", time:"", location:"", description:"" });
  };
  const removeEvent = (day, id) => setData(p => ({ ...p, calEvents: { ...p.calEvents, [day]: p.calEvents[day].filter(e=>e.id!==id) } }));
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const eventTypeColors = { deadline:"#C9A8B2", event:"#8A7BA6", bill:"#C9A870", appointment:"#7BA6A6" };

  const allTodos = data.todos || [];
  const addTodo = () => {
    if (!newTodo.trim()) return;
    setData(p => ({ ...p, todos: [...(p.todos||[]), { text: newTodo.trim(), type: todoType, done: false, id: Date.now(), created: today_k }] }));
    setNewTodo("");
  };
  const toggleTodoItem = id => setData(p => ({ ...p, todos: (p.todos||[]).map(t => t.id===id ? {...t, done:!t.done, completedOn: !t.done ? today_k : null} : t) }));
  const removeTodoItem = id => setData(p => ({ ...p, todos: (p.todos||[]).filter(t => t.id!==id) }));
  const activeTodos = allTodos.filter(t => !t.done || t.completedOn === today_k);
  const todayCalEvents = (data.calEvents||{})[today_k] || [];

  // ── Styles ──
  const inp = {
    fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.text,
    background:"#FAFAF8", border:`1px solid ${C.border}`,
    borderRadius:6, padding:"9px 12px", outline:"none", width:"100%",
  };
  const cardStyle = (delay=0) => ({
    background:"#FFFFFF", borderRadius:8, padding:"20px 22px", marginBottom:10,
    border:`1px solid ${C.border}`, animation:`fadeUp 0.35s ${delay}s ease forwards`, opacity:0,
  });
  const pillBtn = (active) => ({
    padding:"7px 16px", borderRadius:4, border:`1px solid ${active ? "#FFFFFF" : "rgba(255,255,255,0.4)"}`,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:500,
    letterSpacing:0.3, background:active ? "#FFFFFF" : "transparent",
    color:active ? C.rose : "#FFFFFF", transition:"all 0.15s",
  });

  const Row = ({ label, k, note, color }) => {
    const acc = color || C.rose;
    const checked = !!td(k);
    return (
      <div onClick={()=>toggle(k)} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.border}`, cursor:"pointer" }}>
        <div style={{ width:18, height:18, borderRadius:3, flexShrink:0, marginTop:1, border:`1.5px solid ${checked ? acc : C.borderDark}`, background:checked ? acc : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
          {checked && <span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>}
        </div>
        <div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:checked ? acc : C.text, textDecoration:checked?"line-through":"none", opacity:checked?0.65:1, margin:0, lineHeight:1.4 }}>{label}</p>
          {note && !checked && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, fontStyle:"italic", margin:"2px 0 0" }}>{note}</p>}
        </div>
      </div>
    );
  };

  const SectionHead = ({title, sub, accent}) => (
    <div style={{marginBottom:14}}>
      <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:17, fontWeight:500, color:C.text, margin:0, letterSpacing:0.3}}>{title}</p>
      {sub && <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, margin:"3px 0 0"}}>{sub}</p>}
      <div style={{height:1, background:accent||C.border, marginTop:10}}/>
    </div>
  );

  const Divider = () => <div style={{height:1, background:C.border, margin:"10px 0"}}/>;

  const CounterRow = ({k, label, target, icon, color}) => {
    const val=wk(k); const done=val>=target; const p=Math.min((val/target)*100,100);
    return (
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
          <span style={{fontSize:16}}>{icon}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,flex:1,color:done?color:C.text,fontWeight:500,textDecoration:done?"line-through":"none",opacity:done?0.65:1}}>{label}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:done?color:C.textMid}}>{val}/{target}</span>
          <button onClick={()=>decWk(k)} style={{width:26,height:26,borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:14,cursor:"pointer",fontWeight:700}}>−</button>
          <button onClick={()=>incWk(k)} style={{width:26,height:26,borderRadius:4,border:`1px solid ${color}`,background:color,color:"#fff",fontSize:14,cursor:"pointer",fontWeight:700}}>+</button>
        </div>
        <div style={{height:3,borderRadius:2,background:C.border,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${p}%`,background:color,borderRadius:2,transition:"width 0.4s ease"}}/>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif", color:C.text, paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes affirmFade{0%{opacity:0;transform:translateY(4px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-4px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .row-hover:hover{background:${C.ivory}!important;}
        input::placeholder,textarea::placeholder{color:${C.textFaint};}
        select{-webkit-appearance:none;}
        button:hover{opacity:0.8;}
        .title-shimmer{
          background: linear-gradient(90deg, #C9A8B2 0%, #F0D8DF 25%, #FFF8FA 50%, #F0D8DF 75%, #C9A8B2 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 5s linear infinite;
        }
        .gold-shimmer{
          background: linear-gradient(90deg, #8B6914 0%, #C9A84C 20%, #F0D080 40%, #FFFACD 50%, #F0D080 60%, #C9A84C 80%, #8B6914 100%);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 6s linear infinite;
        }
        textarea{resize:vertical;}
        select option{background:#fff;color:${C.text};}
      `}</style>

      {/* MOTTO */}
      <div style={{padding:"14px 20px 0", textAlign:"center", borderBottom:`1px solid ${C.border}`}}>
        <p className="gold-shimmer" style={{
          margin:"0 0 14px",
          fontFamily:"'Cormorant Garamond',Georgia,serif",
          fontStyle:"italic", fontSize:13.5, fontWeight:500, letterSpacing:0.4, lineHeight:1.6,
        }}>"I'd rather die enormous than live dormant — that's how we on it." — Jay-Z</p>
      </div>

      {/* ── HEADER ── */}
      <div style={{background:"linear-gradient(to bottom, #D9BEC5, #EDE0E4)", padding:"22px 20px 18px", borderBottom:`1px solid ${C.roseMid}`}}>
        <div style={{maxWidth:680, margin:"0 auto"}}>
          <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, letterSpacing:3, textTransform:"uppercase", color:C.textLight, fontWeight:500, margin:"0 0 4px"}}>
            {todayDOW} · {today.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
          </p>
          <h1 className="title-shimmer" style={{
            margin:"0 0 12px", fontSize:30, fontWeight:600, fontStyle:"italic",
            fontFamily:"'Cormorant Garamond',Georgia,serif", letterSpacing:0.5, color:C.text,
          }}>My Optimal Life</h1>

          {/* Affirmation */}
          <div style={{margin:"0 0 14px", minHeight:38, display:"flex", alignItems:"center"}}>
            <p key={affirmIdx} style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:14, color:C.textMid,
              fontStyle:"italic", lineHeight:1.6, margin:0, animation:"affirmFade 7s ease forwards", fontWeight:600,
            }}>
              {AFFIRMATIONS[affirmIdx]}
            </p>
          </div>

          {/* Skincare badge */}
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:16}}>
            <div style={{display:"inline-flex", alignItems:"center", gap:6, background:C.ivory, borderRadius:4, padding:"5px 12px", border:`1px solid ${C.border}`}}>
              <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textMid}}>
                Today's treatment — <strong style={{color:C.rose}}>{todaySkincare.treatment}</strong>
              </span>
            </div>
            {riceCountdown !== null && (
              <div style={{display:"inline-flex", alignItems:"center", gap:6, background:C.ivory, borderRadius:4, padding:"5px 12px", border:`1px solid ${C.border}`}}>
                <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:11.5, color:C.textMid}}>
                  Rice water —{" "}
                  <strong style={{color:riceCountdown<=0?C.rose:C.textMid}}>
                    {riceCountdown===0?"today":riceCountdown>0?`in ${riceCountdown}d`:`${Math.abs(riceCountdown)}d overdue`}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* SYNERGY TILES */}
          <div style={{marginBottom:14}}>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2.5, textTransform:"uppercase", color:C.textFaint, margin:"0 0 8px", fontWeight:600}}>Synergy</p>
            <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:6}}>
              {[
                { label:"Today", value:`${pct}%`, sub:`${doneCount}/${totalChecks}`, color:C.rose },
                { label:"Mood", value:["","😔","😐","🙂","😊","🌟"][mood]||"—", sub:["","Rough","Low","Okay","Good","Thriving"][mood]||"—", color:["","#C07070","#C09060","#A0A040","#70A860","#50A890"][mood]||C.textLight, emoji:true },
                { label:"Fiber", value:`${fiberTotal.toFixed(0)}g`, sub:"of 25g", color:fiberTotal>=25?C.green:fiberTotal>=15?C.gold:"#B07050", bar:Math.min((fiberTotal/25)*100,100) },
                { label:"Income", value:totalIncome>0?`$${Math.round(totalIncome)}`:"—", sub:`${bpPipeline.filter(c=>c.stage!=="Paid").length} active`, color:C.green, onClick:()=>setTab("bigpicture") },
                { label:"Apps", value:bpCounters.apps||0, sub:`${bpCounters.calls||0} calls`, color:(bpCounters.apps||0)>=3?C.green:C.gold, onClick:()=>setTab("bigpicture") },
              ].map((t,i) => (
                <div key={i} onClick={t.onClick} style={{background:C.ivory, borderRadius:6, padding:"10px 6px", textAlign:"center", border:`1px solid ${C.border}`, cursor:t.onClick?"pointer":"default"}}>
                  <p style={{fontFamily:t.emoji?"inherit":"'DM Sans',sans-serif", fontSize:t.emoji?18:15, fontWeight:600, color:t.color, margin:"0 0 2px", lineHeight:1}}>{t.value}</p>
                  {t.bar !== undefined && <div style={{height:2, borderRadius:1, background:C.border, overflow:"hidden", margin:"4px 0"}}><div style={{height:"100%", width:`${t.bar}%`, background:t.color, borderRadius:1}}/></div>}
                  <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9, color:C.textLight, margin:0, textTransform:"uppercase", letterSpacing:0.8}}>{t.label}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9, color:C.textFaint, margin:0}}>{t.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Workouts this week */}
          <div style={{background:C.ivory, borderRadius:6, padding:"12px 14px", border:`1px solid ${C.border}`}}>
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9, letterSpacing:2, textTransform:"uppercase", color:C.textLight, margin:0, fontWeight:600}}>Movement this week</p>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:600, color:C.green, margin:0}}>{workoutsDone}/4</p>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6}}>
              {WORKOUT_SCHEDULE.map(({day,type,short}) => {
                const done = !!workouts[day];
                const typeColor = type==="Strength" ? C.green : C.purple;
                return (
                  <div key={day} onClick={()=>toggleWorkout(day)} style={{background:done?"rgba(123,166,138,0.12)":"#FFFFFF", borderRadius:5, padding:"8px 4px", textAlign:"center", cursor:"pointer", border:`1px solid ${done?"rgba(123,166,138,0.4)":C.border}`, transition:"all 0.15s"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:600, color:done?C.green:C.text, margin:"0 0 2px"}}>{short}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9, color:done?C.green:typeColor, margin:"0 0 4px"}}>{type}</p>
                    <span style={{fontSize:11}}>{done?"✓":"○"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{display:"flex", justifyContent:"center", gap:4, padding:"14px 14px 6px", flexWrap:"wrap", borderBottom:`1px solid ${C.border}`, background:"linear-gradient(to right, #7BA68A, #8A7BA6)"}}>
        {[["today","Today"],["bigpicture","Big Picture"],["weekly","Weekly"],["calendar","Calendar"],["finance","Finance"],["network","Network"],["notes","Notes"]].map(([k,l])=>(
          <button key={k} style={pillBtn(tab===k)} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{maxWidth:680, margin:"0 auto", padding:"12px 14px", background: tab==="today" ? "linear-gradient(to bottom, #F0DDE2, #F8F2F4)" : "transparent", minHeight:"calc(100vh - 200px)"}}>

        {/* ══ BIG PICTURE ══ */}
        {tab==="bigpicture" && (<>

          {/* Wins Feed */}
          {(data.wins||[]).length > 0 && (
            <div style={cardStyle(0)}>
              <SectionHead title="Wins" sub="Captured as you go"/>
              {(data.wins||[]).slice(0,8).map(w => (
                <div key={w.id} style={{display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11, color:C.rose, flexShrink:0, marginTop:3}}>◆</span>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:13, color:C.text, margin:0}}>{w.text}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, margin:"2px 0 0"}}>{fmtDate(w.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* The Move */}
          <div style={{...cardStyle(0.03), borderLeft:`2px solid ${C.rose}`}}>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:9.5, letterSpacing:2, textTransform:"uppercase", color:C.rose, fontWeight:600, margin:"0 0 4px"}}>The move this week</p>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, margin:"0 0 8px", fontStyle:"italic"}}>One thing. Not a list.</p>
            <input value={bp.theMove||""} onChange={e=>setBP("theMove",e.target.value)} placeholder="This week, the most important thing I can do is…" style={{...inp, fontSize:14, fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic"}}/>
          </div>

          {/* BritAlly Track */}
          <div style={cardStyle(0.05)}>
            <SectionHead title="BritAlly" sub="Build · ship · close"/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Status</p>
                <select value={ba.status||""} onChange={e=>setTrack("britally",{status:e.target.value})} style={{...inp, cursor:"pointer"}}>
                  <option value="">Select…</option>
                  {["Building","Active","Paused","Blocked"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Month income</p>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:26, fontWeight:500, color:C.green, margin:0}}>${totalIncome.toFixed(0)}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, margin:0}}>from Finance tab</p>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Weekly goal</p>
              <input value={ba.weeklyGoal||""} onChange={e=>setTrack("britally",{weeklyGoal:e.target.value})} placeholder="e.g. Close 1 new client, finish Derrick's integration" style={inp}/>
            </div>
            <div style={{marginBottom:14}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Next move</p>
              <input value={ba.nextMove||""} onChange={e=>setTrack("britally",{nextMove:e.target.value})} placeholder="One specific action" style={inp}/>
            </div>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px", fontWeight:600}}>Client pipeline</p>
            {bpPipeline.length===0 && <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:12.5, color:C.textFaint, fontStyle:"italic", marginBottom:10}}>No clients yet</p>}
            {bpPipeline.map(c => (
              <div key={c.id} style={{display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:5, marginBottom:6, background:C.ivory, border:`1px solid ${C.border}`}}>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:13.5, fontWeight:600, color:C.text, margin:"0 0 2px"}}>{c.name}</p>
                  {c.note && <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textMid, margin:0}}>{c.note}</p>}
                </div>
                <select value={c.stage} onChange={e=>updateClientStage(c.id,e.target.value)} style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, fontWeight:500, color:C.text, background:C.ivory, border:`1px solid ${C.borderDark}`, borderRadius:4, padding:"4px 8px", cursor:"pointer", outline:"none"}}>
                  {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <span onClick={()=>removeClient(c.id)} style={{cursor:"pointer", color:C.textFaint, fontSize:16, padding:2}}>×</span>
              </div>
            ))}
            <div style={{display:"grid", gridTemplateColumns:"1fr 120px", gap:6, marginBottom:6}}>
              <input value={newClientName} onChange={e=>setNewClientName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addClient()} placeholder="Client name…" style={inp}/>
              <select value={newClientStage} onChange={e=>setNewClientStage(e.target.value)} style={{...inp, cursor:"pointer"}}>
                {STAGES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <input value={newClientNote} onChange={e=>setNewClientNote(e.target.value)} placeholder="Note (optional)" style={{...inp, marginBottom:8}}/>
            <button onClick={addClient} style={{width:"100%", padding:"10px", borderRadius:5, border:`1px solid ${C.roseMid}`, cursor:"pointer", background:C.roseLight, color:C.rose, fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500}}>+ Add client</button>
          </div>

          {/* Device Sales Track */}
          <div style={cardStyle(0.07)}>
            <SectionHead title="Device Sales Push" sub="Ortho · Sports Med · Atlanta"/>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Status</p>
                <select value={ds.status||""} onChange={e=>setTrack("devicesales",{status:e.target.value})} style={{...inp, cursor:"pointer"}}>
                  <option value="">Select…</option>
                  {["Not Started","Building","Active","Paused"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>LinkedIn connections</p>
                <div style={{display:"flex", alignItems:"center", gap:8}}>
                  <button onClick={()=>setTrack("devicesales",{linkedinConnections:Math.max(0,(ds.linkedinConnections||0)-1)})} style={{width:26,height:26,borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:14,cursor:"pointer",fontWeight:700}}>−</button>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:600,color:C.gold}}>{ds.linkedinConnections||0}</span>
                  <button onClick={()=>setTrack("devicesales",{linkedinConnections:(ds.linkedinConnections||0)+1})} style={{width:26,height:26,borderRadius:4,border:`1px solid ${C.gold}`,background:C.gold,color:"#fff",fontSize:14,cursor:"pointer",fontWeight:700}}>+</button>
                </div>
              </div>
            </div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12}}>
              {[
                {label:"Apps this week",key:"apps",color:C.gold},
                {label:"Info calls done",key:"calls",color:C.purple},
              ].map(({label,key,color}) => (
                <div key={key} style={{background:C.ivory, borderRadius:5, padding:"10px", textAlign:"center", border:`1px solid ${C.border}`}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, marginBottom:6}}>{label}</p>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:6}}>
                    <button onClick={()=>adjCounter(key,-1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:13,cursor:"pointer",fontWeight:700}}>−</button>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:600,color}}>{bpCounters[key]||0}</span>
                    <button onClick={()=>adjCounter(key,1)} style={{width:22,height:22,borderRadius:4,border:`1px solid ${color}`,background:color,color:"#fff",fontSize:13,cursor:"pointer",fontWeight:700}}>+</button>
                  </div>
                </div>
              ))}
              <div onClick={()=>setTrack("devicesales",{shadowDone:!ds.shadowDone})} style={{background:ds.shadowDone?"rgba(123,166,138,0.1)":C.ivory, borderRadius:5, padding:"10px", textAlign:"center", border:`1px solid ${ds.shadowDone?"rgba(123,166,138,0.4)":C.border}`, cursor:"pointer"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, marginBottom:6}}>OR shadow</p>
                <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:500, color:ds.shadowDone?C.green:C.textLight, margin:0}}>{ds.shadowDone?"Done ✓":"Not yet"}</p>
              </div>
            </div>
            <div style={{marginBottom:10}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Weekly goal</p>
              <input value={ds.weeklyGoal||""} onChange={e=>setTrack("devicesales",{weeklyGoal:e.target.value})} placeholder="e.g. Apply to Stryker, book 2 informational calls" style={inp}/>
            </div>
            <div style={{marginBottom:14}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Next move</p>
              <input value={ds.nextMove||""} onChange={e=>setTrack("devicesales",{nextMove:e.target.value})} placeholder="One specific action" style={inp}/>
            </div>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px", fontWeight:600}}>Target companies</p>
            {bpCompanies.map((c,i) => (
              <div key={c.name} style={{display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:5, marginBottom:6, background:c.interview?"rgba(123,166,138,0.07)":c.applied?"rgba(184,149,106,0.07)":C.ivory, border:`1px solid ${c.interview?"rgba(123,166,138,0.3)":c.applied?"rgba(184,149,106,0.3)":C.border}`}}>
                <div style={{width:20,height:20,borderRadius:3,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:800,color:"#fff"}}>{c.priority}</span>
                </div>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:C.text,margin:0}}>{c.name}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid,margin:0}}>{c.role}</p>
                </div>
                <button onClick={()=>toggleCompany(i,"applied")} style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${c.applied?C.gold:C.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,background:c.applied?"rgba(184,149,106,0.12)":"transparent",color:c.applied?C.gold:C.textLight}}>
                  {c.applied?"✓ Applied":"Applied?"}
                </button>
                <button onClick={()=>toggleCompany(i,"interview")} style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${c.interview?C.green:C.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,background:c.interview?"rgba(123,166,138,0.12)":"transparent",color:c.interview?C.green:C.textLight}}>
                  {c.interview?"✓ Interview":"Interview?"}
                </button>
              </div>
            ))}
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 10px", fontWeight:600}}>90-day plan</p>
            {BP_PHASES.map(({phase,task}) => (
              <div key={phase} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start",paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,color:C.gold,minWidth:44,flexShrink:0,marginTop:2}}>{phase}</span>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textMid,margin:0,lineHeight:1.55}}>{task}</p>
              </div>
            ))}
          </div>

          {/* Foundation Track */}
          <div style={cardStyle(0.09)}>
            <SectionHead title="Personal Foundation" sub="The base everything else runs on"/>
            <div style={{marginBottom:10}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Weekly goal</p>
              <input value={fn.weeklyGoal||""} onChange={e=>setTrack("foundation",{weeklyGoal:e.target.value})} placeholder="e.g. Sleep 7+ hrs 5 nights, walk daily, no skipped iron" style={inp}/>
            </div>
            <div style={{marginBottom:14}}>
              <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px"}}>Next move</p>
              <input value={fn.nextMove||""} onChange={e=>setTrack("foundation",{nextMove:e.target.value})} placeholder="What would most support you this week?" style={inp}/>
            </div>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:10, color:C.textLight, textTransform:"uppercase", letterSpacing:1, margin:"0 0 5px", fontWeight:600}}>Decision queue</p>
            <p style={{fontFamily:"'DM Sans',sans-serif", fontSize:11, color:C.textLight, margin:"0 0 12px", fontStyle:"italic"}}>Name what you're sitting on so it stops creating drag.</p>
            {bpDecisions.filter(d=>!d.resolved).length===0 && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textFaint,fontStyle:"italic",marginBottom:10}}>No open decisions — clear mind</p>}
            {bpDecisions.filter(d=>!d.resolved).map(d => (
              <div key={d.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",borderRadius:5,marginBottom:6,background:C.ivory,border:`1px solid ${C.border}`}}>
                <div style={{flex:1}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,margin:"0 0 2px",fontWeight:500}}>{d.text}</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:0}}>{fmtDate(d.date)}</p>
                </div>
                <button onClick={()=>toggleDecision(d.id)} style={{padding:"4px 10px",borderRadius:4,border:`1px solid ${C.border}`,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:500,background:"transparent",color:C.textMid,flexShrink:0}}>Resolved</button>
                <span onClick={()=>removeDecision(d.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:16,padding:2}}>×</span>
              </div>
            ))}
            {bpDecisions.filter(d=>d.resolved).length>0 && <>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textTransform:"uppercase",letterSpacing:1,margin:"8px 0 4px"}}>Resolved</p>
              {bpDecisions.filter(d=>d.resolved).map(d => (
                <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",opacity:0.45}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,flex:1,margin:0,textDecoration:"line-through"}}>{d.text}</p>
                  <span onClick={()=>removeDecision(d.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:15}}>×</span>
                </div>
              ))}
            </>}
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input value={newDecision} onChange={e=>setNewDecision(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addDecision()} placeholder="A decision I'm sitting on…" style={{...inp,flex:1}}/>
              <button onClick={addDecision} style={{padding:"8px 16px",borderRadius:5,border:`1px solid ${C.green}`,cursor:"pointer",background:C.green,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,flexShrink:0}}>+</button>
            </div>
          </div>

          {/* Weekly Review */}
          <div style={cardStyle(0.11)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:17,fontWeight:500,color:C.text,margin:0}}>Weekly Review</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight,margin:"3px 0 0"}}>10 minutes, every Sunday</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight}}>Energy</span>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setBP("energy",n)} style={{width:22,height:22,padding:0,borderRadius:3,border:`1px solid ${(bp.energy||0)>=n?C.rose:C.border}`,background:(bp.energy||0)>=n?C.roseLight:"transparent",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:(bp.energy||0)>=n?C.rose:C.textFaint,cursor:"pointer"}}>{n}</button>
                ))}
              </div>
            </div>
            <div style={{height:1,background:C.border,marginBottom:14}}/>
            {[
              {key:"wins",label:"What moved this week?",ph:"Wins, momentum, things that clicked…"},
              {key:"stalled",label:"What stalled — and why?",ph:"Honest read, no judgment, just data"},
              {key:"ba",label:"BritAlly pulse",ph:"Client status, income, what needs attention…"},
              {key:"ds",label:"Device sales pulse",ph:"Apps sent, calls booked, what's working…"},
              {key:"fn",label:"How you're actually doing",ph:"Energy, body, mood, what you need…"},
            ].map(({key,label,ph}) => (
              <div key={key} style={{marginBottom:12}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.textMid,margin:"0 0 5px"}}>{label}</p>
                <textarea value={bpReview[key]||""} onChange={e=>setBPReview(key,e.target.value)} placeholder={ph} style={{...inp,minHeight:52,lineHeight:1.6}}/>
              </div>
            ))}
            <button onClick={saveBPReview} style={{width:"100%",padding:"10px",borderRadius:5,border:`1px solid ${C.roseMid}`,cursor:"pointer",background:C.roseLight,color:C.rose,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>Save to progress log</button>
          </div>

          {/* Progress Log */}
          {(bp.progressLog||[]).length > 0 && (
            <div style={cardStyle(0.13)}>
              <SectionHead title="Progress Log" sub="Your trajectory over time"/>
              {(bp.progressLog||[]).map(l => (
                <div key={l.week} style={{background:C.ivory,borderRadius:5,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.text,margin:0}}>Week of {fmtDate(l.week)}</p>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {l.energy>0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.rose}}>Energy {l.energy}/5</span>}
                      {l.baIncome>0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green}}>${Math.round(l.baIncome)}</span>}
                      {l.apps>0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.gold}}>{l.apps} apps</span>}
                      {l.workouts>0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green}}>{l.workouts}/4 workouts</span>}
                      {l.weight && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight}}>{l.weight} lbs</span>}
                    </div>
                  </div>
                  {l.theMove && <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:13,color:C.textMid,fontStyle:"italic",margin:"0 0 6px"}}>"{l.theMove}"</p>}
                  {l.wins && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:"0 0 4px"}}><span style={{color:C.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:0.8}}>Moved — </span>{l.wins}</p>}
                  {l.stalled && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:0}}><span style={{color:C.textLight,fontSize:10,textTransform:"uppercase",letterSpacing:0.8}}>Stalled — </span>{l.stalled}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Weigh-in */}
          <div style={cardStyle(0.14)}>
            <SectionHead title="Weekly Weigh-in" sub="One number, once a week"/>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <input type="number" value={thisWeekWeigh?.weight||""} onChange={e=>setWeighIn(e.target.value)} placeholder="lbs" style={{...inp,width:90,fontSize:16,textAlign:"center"}}/>
              {weighDiff !== null && (
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:parseFloat(weighDiff)<=0?C.green:C.gold,margin:0,fontWeight:600}}>
                  {parseFloat(weighDiff)>0?"+":""}{weighDiff} lbs from last week
                </p>
              )}
            </div>
          </div>
        </>)}

        {/* ══ TODAY ══ */}
        {tab==="today" && (<>

          {historyDay && historyDay !== today_k && (() => {
            const hd = (data.daily||{})[historyDay] || {};
            const hPct = Math.round((DAILY_SCORE_CHECKS.filter(k=>hd[k]).length / DAILY_SCORE_CHECKS.length)*100);
            const hTeas = hd.teas || [];
            const hFiber = (hd.fiber||[]).reduce((s,e)=>s+e.g,0);
            const hWin = hd.win || "";
            const hMood = hd.mood || 0;
            return (
              <div style={{...cardStyle(0), border:`1px solid ${C.roseMid}`, background:C.ivory}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.rose,textTransform:"uppercase",letterSpacing:1.5,margin:0}}>Past day</p>
                    <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:16,fontWeight:500,color:C.text,margin:"2px 0 0"}}>{new Date(historyDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
                  </div>
                  <button onClick={()=>setHistoryDay(null)} style={{padding:"5px 12px",borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer"}}>✕ Close</button>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                  <div style={{background:"#fff",borderRadius:5,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center",border:`1px solid ${C.border}`}}>
                    <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,color:C.rose,margin:0}}>{hPct}%</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:"2px 0 0"}}>completed</p>
                  </div>
                  {hMood>0&&<div style={{background:"#fff",borderRadius:5,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center",border:`1px solid ${C.border}`}}>
                    <p style={{fontSize:18,margin:0}}>{["😔","😐","🙂","😊","🌟"][hMood-1]}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:"2px 0 0"}}>{["Rough","Low","Okay","Good","Thriving"][hMood-1]}</p>
                  </div>}
                  {hFiber>0&&<div style={{background:"#fff",borderRadius:5,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center",border:`1px solid ${C.border}`}}>
                    <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,color:C.green,margin:0}}>{hFiber.toFixed(0)}g</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:"2px 0 0"}}>fiber</p>
                  </div>}
                </div>
                {hWin&&<div style={{background:"#fff",borderRadius:5,padding:"8px 12px",marginBottom:10,border:`1px solid ${C.border}`}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.gold,margin:"0 0 2px",fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>Win</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,margin:0}}>{hWin}</p>
                </div>}
                {hTeas.length>0&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:"0 0 8px"}}>Tea — {hTeas.map(t=>t.tea).join(", ")}</p>}
              </div>
            );
          })()}

          <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:10}}>
            {historyDay && historyDay !== today_k && (
              <button onClick={()=>{const d=new Date(historyDay+"T12:00:00");d.setDate(d.getDate()-1);setHistoryDay(localDateStr(d));}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,background:C.ivory,border:`1px solid ${C.border}`,borderRadius:4,padding:"5px 14px",cursor:"pointer"}}>‹ Earlier</button>
            )}
            {(!historyDay || historyDay === today_k) && (
              <button onClick={()=>{const d=new Date(today_k+"T12:00:00");d.setDate(d.getDate()-1);setHistoryDay(localDateStr(d));}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,background:C.ivory,border:`1px solid ${C.border}`,borderRadius:4,padding:"5px 14px",cursor:"pointer"}}>‹ View previous day</button>
            )}
            {historyDay && historyDay !== today_k && (
              <button onClick={()=>{const d=new Date(historyDay+"T12:00:00");d.setDate(d.getDate()+1);const next=localDateStr(d);setHistoryDay(next===today_k?null:next);}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,background:C.ivory,border:`1px solid ${C.border}`,borderRadius:4,padding:"5px 14px",cursor:"pointer"}}>Later ›</button>
            )}
          </div>

          {/* Command Center */}
          <div style={cardStyle(0)}>
            <SectionHead title="Command Center" sub="To-dos + what's on today"/>
            {todayCalEvents.length > 0 && (
              <div style={{marginBottom:14}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px",fontWeight:500}}>On the calendar today</p>
                {todayCalEvents.map(e => (
                  <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"8px 10px",borderRadius:5,marginBottom:5,background:C.ivory,border:`1px solid ${C.border}`}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:eventTypeColors[e.type]||C.rose,flexShrink:0,marginTop:4}}/>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,margin:0}}>{e.text}</p>
                      {(e.time||e.location) && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight,margin:"2px 0 0"}}>{[e.time,e.location].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textTransform:"capitalize"}}>{e.type}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              <input value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTodo()} placeholder="Add a to-do…" style={{...inp,flex:1}}/>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setTodoType("business")} style={{padding:"8px 10px",borderRadius:5,border:`1px solid ${todoType==="business"?C.rose:C.border}`,cursor:"pointer",background:todoType==="business"?C.roseLight:"transparent",color:todoType==="business"?C.rose:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500}}>Work</button>
                <button onClick={()=>setTodoType("personal")} style={{padding:"8px 10px",borderRadius:5,border:`1px solid ${todoType==="personal"?C.blue:C.border}`,cursor:"pointer",background:todoType==="personal"?"rgba(122,154,184,0.1)":"transparent",color:todoType==="personal"?C.blue:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500}}>Personal</button>
                <button onClick={addTodo} style={{padding:"8px 14px",borderRadius:5,border:"none",cursor:"pointer",background:C.rose,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>+</button>
              </div>
            </div>
            {activeTodos.length === 0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textFaint,fontStyle:"italic"}}>Nothing on your list — add something above</p>
              : (<>
                {activeTodos.filter(t=>!t.done).map(t => {
                  const isWork = t.type==="business";
                  const color = isWork ? C.rose : C.blue;
                  return (
                    <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>toggleTodoItem(t.id)}>
                      <div style={{width:18,height:18,borderRadius:3,flexShrink:0,border:`1.5px solid ${color}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}/>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:C.text,flex:1,margin:0,lineHeight:1.4}}>{t.text}</p>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,fontWeight:500,color:color,textTransform:"uppercase",letterSpacing:0.5,flexShrink:0}}>{isWork?"Work":"Personal"}</span>
                      <span onClick={e=>{e.stopPropagation();removeTodoItem(t.id)}} style={{cursor:"pointer",color:C.textFaint,fontSize:16,padding:2,lineHeight:1}}>×</span>
                    </div>
                  );
                })}
                {activeTodos.filter(t=>t.done).length>0&&(<>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textTransform:"uppercase",letterSpacing:1,margin:"12px 0 5px"}}>Done today</p>
                  {activeTodos.filter(t=>t.done).map(t => {
                    const color = t.type==="business" ? C.rose : C.blue;
                    return (
                      <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.border}`,opacity:0.45,cursor:"pointer"}} onClick={()=>toggleTodoItem(t.id)}>
                        <div style={{width:18,height:18,borderRadius:3,flexShrink:0,border:`1.5px solid ${color}`,background:color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>
                        </div>
                        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textMid,flex:1,margin:0,textDecoration:"line-through"}}>{t.text}</p>
                        <span onClick={e=>{e.stopPropagation();removeTodoItem(t.id)}} style={{cursor:"pointer",color:C.textFaint,fontSize:16,padding:2}}>×</span>
                      </div>
                    );
                  })}
                </>)}
              </>)
            }
          </div>

          {/* Priority */}
          <div style={cardStyle(0.04)}>
            <SectionHead title="Today's One Priority" sub="The single most important move you make today"/>
            <input value={priority} onChange={e=>setTd("priority",e.target.value)} placeholder="What must happen today no matter what?" style={{...inp,fontSize:14}}/>
          </div>

          {/* Mood */}
          <div style={cardStyle(0.06)}>
            <SectionHead title="Mood & Energy" sub="Rate honestly — patterns reveal truth over time"/>
            <div style={{display:"flex",gap:6,justifyContent:"center"}}>
              {[1,2,3,4,5].map(n=>{
                const labels=["Rough","Low","Okay","Good","Thriving"];
                const colors=["#C07070","#C09060","#A0A040","#70A860","#50A890"];
                const active=mood===n;
                return (
                  <div key={n} onClick={()=>setTd("mood",n)} style={{flex:1,textAlign:"center",padding:"10px 4px",borderRadius:5,cursor:"pointer",background:active?`${colors[n-1]}18`:C.ivory,border:`1px solid ${active?colors[n-1]:C.border}`,transition:"all 0.15s"}}>
                    <p style={{fontSize:18,margin:"0 0 4px"}}>{["😔","😐","🙂","😊","🌟"][n-1]}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,color:active?colors[n-1]:C.textLight,fontWeight:active?600:400,margin:0}}>{labels[n-1]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Win */}
          <div style={cardStyle(0.08)}>
            <SectionHead title="Win of the Day" sub="One thing you did, built, closed, or showed up for"/>
            <input value={win} onChange={e=>{setTd("win",e.target.value);if(e.target.value.length>5)addWin(e.target.value,`daily-win-${today_k}`);}} placeholder="Today I…" style={{...inp,fontSize:13.5}}/>
          </div>

          {/* Vitamins */}
          <div style={cardStyle(0.10)}>
            <SectionHead title="Vitamins" sub="Iron between meals · away from tea · D with a fatty meal"/>
            <Row label="Iron supplement (between meals)" k="vitaminIron" note="Space 1hr before/after tea for best absorption" color={C.rose}/>
            <Row label="Vitamin D" k="vitaminD" note="Take with a meal containing healthy fat" color={C.gold}/>
          </div>

          {/* Tea */}
          <div style={cardStyle(0.12)}>
            <SectionHead title="Daily Tea Log" sub="Track tannin timing around iron"/>
            <div style={{position:"relative"}} ref={teaRef}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={teaInput} onChange={e=>setTeaInput(e.target.value)} onFocus={()=>setShowTeaMenu(true)} placeholder="Search or select tea…" style={{...inp,flex:1}}/>
                <button onClick={()=>{if(teaInput.trim())addTea(teaInput.trim());}} style={{padding:"8px 14px",borderRadius:5,border:`1px solid ${C.border}`,cursor:"pointer",background:C.ivory,color:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,flexShrink:0}}>+ Log</button>
              </div>
              {showTeaMenu && (
                <div style={{position:"absolute",top:"100%",left:0,right:70,zIndex:50,background:"#FFFFFF",borderRadius:6,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",border:`1px solid ${C.border}`,maxHeight:200,overflowY:"auto"}}>
                  {TEAS.filter(t=>t.toLowerCase().includes(teaInput.toLowerCase())).map(t=>(
                    <div key={t} onClick={()=>addTea(t)} className="row-hover" style={{padding:"9px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`}}>{t}</div>
                  ))}
                </div>
              )}
            </div>
            {teaLog.length>0 ? (
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {teaLog.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px 4px 12px",background:C.ivory,borderRadius:4,border:`1px solid ${C.border}`}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid}}>{t.tea}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight}}>{t.time}</span>
                    <span onClick={()=>removeTea(i)} style={{cursor:"pointer",color:C.textFaint,fontSize:14,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
            ) : <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textFaint,fontStyle:"italic"}}>No teas logged yet today</p>}
          </div>

          {/* Fiber */}
          <div style={cardStyle(0.14)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <SectionHead title="Fiber Intake" sub="Goal: 25g+ daily — hormone balance & gut health"/>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:26,fontWeight:500,color:fiberTotal>=25?C.green:C.gold,margin:0,lineHeight:1}}>{fiberTotal.toFixed(1)}g</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:"2px 0 0"}}>of 25g</p>
              </div>
            </div>
            <div style={{height:3,borderRadius:2,background:C.border,overflow:"hidden",marginBottom:12}}>
              <div style={{height:"100%",width:`${Math.min((fiberTotal/25)*100,100)}%`,background:fiberTotal>=25?C.green:C.gold,borderRadius:2,transition:"width 0.4s ease"}}/>
            </div>
            <div ref={fiberRef}>
              <button onClick={()=>setShowFiberMenu(v=>!v)} style={{width:"100%",padding:"8px",borderRadius:5,border:`1px dashed ${C.borderDark}`,background:C.ivory,color:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:400}}>
                {showFiberMenu ? "Close" : "+ Add food"}
              </button>
              {showFiberMenu && (
                <div style={{marginTop:6,borderRadius:5,border:`1px solid ${C.border}`,overflow:"hidden",background:"#FFFFFF"}}>
                  {FIBER_FOODS.filter(f=>f.name!=="Custom").map(f=>(
                    <div key={f.name} onClick={()=>addFiber(f.name,f.g)} className="row-hover" style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text}}>{f.name}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:C.green}}>{f.g}g</span>
                    </div>
                  ))}
                  <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,background:C.ivory}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid,margin:"0 0 8px",fontWeight:600}}>Custom</p>
                    <input value={fiberCustomName} onChange={e=>setFiberCustomName(e.target.value)} placeholder="Food name" style={{...inp,marginBottom:6,fontSize:13}}/>
                    <div style={{display:"flex",gap:6}}>
                      <input value={fiberCustomG} onChange={e=>setFiberCustomG(e.target.value)} placeholder="Fiber grams" type="number" style={{...inp,flex:1,fontSize:13}}/>
                      <button onClick={()=>{if(fiberCustomG&&fiberCustomName)addFiber(fiberCustomName,fiberCustomG);}} style={{padding:"8px 16px",borderRadius:5,border:"none",background:C.green,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",flexShrink:0,fontWeight:500}}>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {fiberLog.length>0 && (
              <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
                {fiberLog.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px 3px 11px",background:C.ivory,borderRadius:4,border:`1px solid ${C.border}`}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textMid}}>{e.name} · <strong>{e.g}g</strong></span>
                    <span onClick={()=>removeFiber(e.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:13,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skincare */}
          <div style={cardStyle(0.16)}>
            <SectionHead title="Skincare" sub={`${todayDOW}: ${todaySkincare.treatment}`}/>
            <div style={{background:C.ivory,borderRadius:5,padding:"8px 12px",marginBottom:12,borderLeft:`2px solid ${C.rose}`}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textMid,margin:0}}>
                {todaySkincare.type==="acid"?`PM: Apply ${todaySkincare.treatment} after cleanse, before moisturizer`:"Deep hydration — hyaluronic acid, barrier repair, no actives tonight"}
              </p>
            </div>
            <Row label="AM: Cleanse → moisturize → SPF 30+" k="skincareAM" note="SPF daily is your #1 anti-aging investment" color={C.rose}/>
            <Row label={`PM: ${todaySkincare.treatment} applied`} k="todayTreatment" note={todaySkincare.type==="acid"?"After cleansing, before moisturizer":"Hyaluronic acid + rich moisturizer"} color={C.rose}/>
            <Row label="PM: Moisturize & seal" k="skincarePM" note="Lock in treatment — face oil optional on top" color={C.rose}/>
            <div style={{height:1,background:C.border,margin:"10px 0 6px"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:C.textFaint,fontStyle:"italic",margin:0}}>Sun Mandelic · Mon Azelaic · Tue Hydration · Wed Azelaic · Thu Mandelic · Fri Azelaic · Sat Hydration</p>
          </div>

          {/* Wellness */}
          <div style={cardStyle(0.18)}>
            <SectionHead title="Wellness & Mind" sub="Sleep · reflection · connection"/>
            <Row label="Slept 7–9 hours" k="sleep7" note="Skin repair, hormone reset, and hair growth all peak during sleep" color={C.purple}/>
            <Row label="Journaled or reflected (5+ min)" k="journaled" note="The most important relationship you have is with yourself" color={C.purple}/>
            <Row label="Meaningful social connection today" k="social" note="1–3 hrs/day of real connection is the science-backed sweet spot" color={C.purple}/>
          </div>

          {/* Hair — rice water tracker */}
          <div style={cardStyle(0.20)}>
            <SectionHead title="Hair Health" sub="Rice treatment every 2 weeks"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.ivory,borderRadius:5,padding:"10px 14px",border:`1px solid ${C.border}`}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:500,color:C.text,margin:0}}>Rice Water Treatment</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textMid,margin:"2px 0 0"}}>Last: {lastRice} · Next: {nextRice}{riceCountdown===0?" — today":riceCountdown>0?` (${riceCountdown}d)`:` (${Math.abs(riceCountdown)}d overdue)`}</p>
              </div>
              {riceCountdown<=0&&(
                <button onClick={markRiceDone} style={{padding:"7px 14px",borderRadius:4,border:`1px solid ${C.border}`,cursor:"pointer",background:data.lastRiceTreatment===today_k?C.ivory:"#FFFFFF",color:data.lastRiceTreatment===today_k?C.green:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500}}>
                  {data.lastRiceTreatment===today_k?"✓ Done":"Mark done"}
                </button>
              )}
            </div>
          </div>
        </>)}

        {/* ══ WEEKLY ══ */}
        {tab==="weekly" && (<>
          <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textLight,marginBottom:14,fontStyle:"italic"}}>Week of {week_k}</p>
          <div style={cardStyle(0)}>
            <SectionHead title="Movement & Learning"/>
            {Object.entries(WEEKLY).map(([k,v])=><CounterRow key={k} k={k} {...v}/>)}
          </div>
          <div style={cardStyle(0.05)}>
            <SectionHead title="Skincare Week"/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {DOW.map(d=>{
                const sc=SKINCARE_SCHEDULE[d]; const isT=d===todayDOW;
                return (
                  <div key={d} style={{flex:1,minWidth:60,textAlign:"center",padding:"9px 4px",borderRadius:5,background:isT?C.roseLight:C.ivory,border:`1px solid ${isT?C.roseMid:C.border}`}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,textTransform:"uppercase",letterSpacing:0.8,color:isT?C.rose:C.textLight,margin:"0 0 4px",fontWeight:600}}>{d.slice(0,3)}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:isT?C.rose:C.textMid,margin:0,fontWeight:isT?500:400,lineHeight:1.3}}>{sc.treatment.replace(" Acid","").replace("Hydration Day","Hydrate")}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={cardStyle(0.09)}>
            <SectionHead title="Sunday Reset" sub={isSunday?"Tonight is your reset — take 10 minutes":"Your weekly close ritual"}/>
            {[
              {field:"worked",label:"What worked this week?",ph:"Wins, breakthroughs, moments of alignment…"},
              {field:"didnt",label:"What didn't work?",ph:"Be honest — no judgment, just data…"},
              {field:"carrying",label:"What are you carrying into next week?",ph:"Unfinished things, energy, intentions…"},
              {field:"intention",label:"One intention for next week",ph:"How do you want to show up?"},
            ].map(({field,label,ph})=>(
              <div key={field} style={{marginBottom:12}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,fontWeight:500,margin:"0 0 5px"}}>{label}</p>
                <textarea value={sundayReset[field]} onChange={e=>setSundayReset(field,e.target.value)} placeholder={ph} style={{...inp,minHeight:60,lineHeight:1.6}}/>
              </div>
            ))}
          </div>
          <div style={cardStyle(0.12)}>
            <SectionHead title="Weekly Money Review" sub="10 minutes every Sunday"/>
            {[
              {field:"income",label:"What came in?",ph:"Clients, job leads, sales…"},
              {field:"spent",label:"What went out?",ph:"Expenses, bills, purchases…"},
              {field:"gap",label:"What's the gap?",ph:"Where are you vs where you need to be?"},
              {field:"plan",label:"One financial move next week",ph:"What are you committing to?"},
            ].map(({field,label,ph})=>(
              <div key={field} style={{marginBottom:12}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,fontWeight:500,margin:"0 0 5px"}}>{label}</p>
                <textarea value={moneyReview[field]} onChange={e=>setMoneyReview(field,e.target.value)} placeholder={ph} style={{...inp,minHeight:54,lineHeight:1.6}}/>
              </div>
            ))}
          </div>
        </>)}

        {/* ══ FINANCE ══ */}
        {tab==="finance" && (<>
          <div style={cardStyle(0)}>
            <SectionHead title="Income" sub={today.toLocaleString("default",{month:"long",year:"numeric"})}/>
            <div style={{background:C.ivory,borderRadius:5,padding:"16px",marginBottom:16,border:`1px solid ${C.border}`,textAlign:"center"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,letterSpacing:2,textTransform:"uppercase",margin:0}}>This Month</p>
              <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:42,fontWeight:500,color:C.green,margin:"4px 0 0",fontStyle:"italic"}}>${totalIncome.toFixed(2)}</p>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={incomeAmt} onChange={e=>setIncomeAmt(e.target.value)} placeholder="Amount $" type="number" style={{...inp,flex:"0 0 110px"}}/>
              <input value={incomeNote} onChange={e=>setIncomeNote(e.target.value)} placeholder="Source (client, job, sale…)" style={{...inp,flex:1}}/>
            </div>
            <button onClick={addIncome} style={{width:"100%",padding:"10px",borderRadius:5,border:`1px solid ${C.green}`,cursor:"pointer",background:"rgba(123,166,138,0.1)",color:C.green,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Add Income</button>
            {monthIncome.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No income logged yet this month</p>
              : [...monthIncome].reverse().map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:5,background:C.ivory,marginBottom:6,border:`1px solid ${C.border}`}}>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.text,margin:0,fontWeight:600}}>${e.amt.toFixed(2)}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textMid,margin:"2px 0 0"}}>{e.note||"—"} · {e.date}</p>
                  </div>
                  <span onClick={()=>removeIncome(e.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:17,padding:4}}>×</span>
                </div>
              ))
            }
          </div>
          <div style={cardStyle(0.05)}>
            <SectionHead title="Trading" sub={`${today.toLocaleString("default",{month:"long",year:"numeric"})} · Goal: consistent on paper first`}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:totalPL>=0?"rgba(123,166,138,0.1)":"rgba(190,100,100,0.08)",borderRadius:5,padding:"12px 14px",border:`1px solid ${totalPL>=0?"rgba(123,166,138,0.3)":"rgba(190,100,100,0.25)"}`}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,letterSpacing:1.2,textTransform:"uppercase",margin:0}}>Live P&L</p>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,fontWeight:500,color:totalPL>=0?C.green:"#B05050",margin:"4px 0 0"}}>{totalPL>=0?"+":""}${totalPL.toFixed(2)}</p>
              </div>
              <div style={{background:C.ivory,borderRadius:5,padding:"12px 14px",border:`1px solid ${C.border}`}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,letterSpacing:1.2,textTransform:"uppercase",margin:0}}>Paper P&L</p>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:28,fontWeight:500,color:totalPaper>=0?C.purple:"#B05050",margin:"4px 0 0"}}>{totalPaper>=0?"+":""}${totalPaper.toFixed(2)}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
              <input value={tradeAmt} onChange={e=>setTradeAmt(e.target.value)} placeholder="P&L $ (− for loss)" type="number" style={{...inp,flex:"0 0 140px"}}/>
              <select value={tradeType} onChange={e=>setTradeType(e.target.value)} style={{...inp,flex:"0 0 90px",cursor:"pointer"}}>
                <option value="paper">Paper</option>
                <option value="live">Live</option>
              </select>
            </div>
            <input value={tradeNote} onChange={e=>setTradeNote(e.target.value)} placeholder="Ticker, strategy, lesson learned…" style={{...inp,marginBottom:8}}/>
            <button onClick={addTrade} style={{width:"100%",padding:"10px",borderRadius:5,border:`1px solid ${C.blue}`,cursor:"pointer",background:"rgba(122,154,184,0.1)",color:C.blue,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Log Trade</button>
            {monthTrades.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No trades yet — start with paper trades while you learn</p>
              : [...monthTrades].reverse().map(e=>{
                const pos=e.amt>=0;
                return (
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:5,marginBottom:6,background:C.ivory,border:`1px solid ${C.border}`}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:e.type==="paper"?C.purple:(pos?C.green:"#B05050")}}>{pos?"+":""}${e.amt.toFixed(2)}</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,padding:"2px 8px",borderRadius:3,background:C.border,color:C.textMid}}>{e.type}</span>
                      </div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textLight,margin:"2px 0 0"}}>{e.note||"—"} · {e.date}</p>
                    </div>
                    <span onClick={()=>removeTrade(e.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:17,padding:4}}>×</span>
                  </div>
                );
              })
            }
            <div style={{background:C.ivory,borderRadius:5,padding:"12px 14px",marginTop:6,border:`1px solid ${C.border}`}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:0,lineHeight:1.6}}>Don't go live until consistently profitable on paper for 30+ days.</p>
            </div>
          </div>
        </>)}

        {/* ══ NETWORK ══ */}
        {tab==="network" && (<>
          <div style={cardStyle(0)}>
            <SectionHead title="Network Log" sub="One meaningful connection a week — 52 relationships intentionally built per year"/>
            <input value={networkName} onChange={e=>setNetworkName(e.target.value)} placeholder="Name" style={{...inp,marginBottom:7}}/>
            <input value={networkNote} onChange={e=>setNetworkNote(e.target.value)} placeholder="How you met / what they do" style={{...inp,marginBottom:7}}/>
            <input value={networkFollowUp} onChange={e=>setNetworkFollowUp(e.target.value)} placeholder="Follow-up action (e.g. send IG, schedule call…)" style={{...inp,marginBottom:8}}/>
            <button onClick={addNetwork} style={{width:"100%",padding:"10px",borderRadius:5,border:`1px solid ${C.border}`,cursor:"pointer",background:C.ivory,color:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Add Connection</button>
            {networkLog.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No connections logged yet — who did you meet this week?</p>
              : [...networkLog].reverse().map(n=>(
                <div key={n.id} style={{padding:"12px 14px",borderRadius:5,marginBottom:8,background:n.done?"rgba(123,166,138,0.07)":C.ivory,border:`1px solid ${n.done?"rgba(123,166,138,0.3)":C.border}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:C.text,margin:"0 0 2px",textDecoration:n.done?"line-through":"none",opacity:n.done?0.55:1}}>{n.name}</p>
                      {n.note&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:"0 0 2px"}}>{n.note}</p>}
                      {n.followUp&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textLight,margin:"0 0 2px",fontStyle:"italic"}}>→ {n.followUp}</p>}
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:C.textFaint,margin:0}}>{n.date}</p>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>toggleNetworkDone(n.id)} style={{padding:"5px 10px",borderRadius:4,border:`1px solid ${n.done?"rgba(123,166,138,0.4)":C.border}`,cursor:"pointer",background:n.done?"rgba(123,166,138,0.1)":"transparent",color:n.done?C.green:C.textMid,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500}}>
                        {n.done?"✓ Done":"Mark done"}
                      </button>
                      <span onClick={()=>removeNetwork(n.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:17,padding:"4px 2px"}}>×</span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>)}

        {/* ══ CALENDAR ══ */}
        {tab==="calendar" && (<>
          <div style={cardStyle(0)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{width:34,height:34,borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:18,fontWeight:500,color:C.text,margin:0}}>{calMonth.toLocaleString("default",{month:"long",year:"numeric"})}</p>
              <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{width:34,height:34,borderRadius:4,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
                <div key={d} style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.textLight,padding:"4px 0"}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array(getFirstDayOfMonth(calMonth)).fill(null).map((_,i)=><div key={`e-${i}`}/>)}
              {Array(getDaysInMonth(calMonth)).fill(null).map((_,i)=>{
                const dayNum=i+1;
                const dayDate=new Date(calMonth.getFullYear(),calMonth.getMonth(),dayNum);
                const dayKey=calDayKey(dayDate);
                const isToday=dayKey===today_k;
                const isSelected=dayKey===selectedDay;
                const events=calEvents[dayKey]||[];
                return (
                  <div key={dayNum} onClick={()=>setSelectedDay(isSelected?null:dayKey)} style={{textAlign:"center",padding:"6px 2px",borderRadius:4,cursor:"pointer",background:isSelected?C.rose:isToday?C.roseLight:"transparent",border:`1px solid ${isSelected?C.rose:isToday?C.roseMid:C.border}`,transition:"all 0.12s"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:isToday?700:400,color:isSelected?"#fff":isToday?C.rose:C.text,margin:0}}>{dayNum}</p>
                    {events.length>0&&<div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2,flexWrap:"wrap"}}>{events.slice(0,3).map(e=><div key={e.id} style={{width:4,height:4,borderRadius:"50%",background:isSelected?"rgba(255,255,255,0.7)":eventTypeColors[e.type]||C.rose}}/>)}</div>}
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
              {Object.entries(eventTypeColors).map(([type,color])=>(
                <div key={type} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight,textTransform:"capitalize"}}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedDay && (
            <div style={cardStyle(0.04)}>
              <SectionHead title={new Date(selectedDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}/>

              {/* Event form */}
              <div style={{background:C.ivory,borderRadius:5,padding:"14px",marginBottom:14,border:`1px solid ${C.border}`}}>
                <input value={newEvent.text} onChange={e=>setNewEvent(v=>({...v,text:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addEvent()} placeholder="Event title…" style={{...inp,marginBottom:8}}/>
                <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
                  {Object.entries(eventTypeColors).map(([type,color])=>(
                    <button key={type} onClick={()=>setNewEvent(v=>({...v,type}))} style={{padding:"5px 12px",borderRadius:4,border:`1px solid ${newEvent.type===type?color:C.border}`,cursor:"pointer",background:newEvent.type===type?`${color}20`:"transparent",color:newEvent.type===type?color:C.textLight,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,textTransform:"capitalize"}}>{type}</button>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                  <input value={newEvent.time} onChange={e=>setNewEvent(v=>({...v,time:e.target.value}))} placeholder="Time (e.g. 2:00 PM)" style={{...inp,fontSize:12}}/>
                  <input value={newEvent.location} onChange={e=>setNewEvent(v=>({...v,location:e.target.value}))} placeholder="Location (optional)" style={{...inp,fontSize:12}}/>
                </div>
                <textarea value={newEvent.description} onChange={e=>setNewEvent(v=>({...v,description:e.target.value}))} placeholder="Description or notes (optional)" style={{...inp,minHeight:50,lineHeight:1.5,fontSize:12,marginBottom:8}}/>
                <button onClick={addEvent} style={{width:"100%",padding:"9px",borderRadius:4,border:`1px solid ${C.roseMid}`,cursor:"pointer",background:C.roseLight,color:C.rose,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500}}>+ Add Event</button>
              </div>

              {(calEvents[selectedDay]||[]).length===0
                ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontStyle:"italic",textAlign:"center"}}>Nothing scheduled yet</p>
                : (calEvents[selectedDay]||[]).map(e=>(
                  <div key={e.id} style={{padding:"12px 14px",borderRadius:5,marginBottom:6,background:"#FFFFFF",border:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:eventTypeColors[e.type]||C.rose,flexShrink:0,marginTop:5}}/>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:C.text,margin:0,fontWeight:500}}>{e.text}</p>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textTransform:"capitalize"}}>{e.type}</span>
                            <span onClick={()=>removeEvent(selectedDay,e.id)} style={{cursor:"pointer",color:C.textFaint,fontSize:17}}>×</span>
                          </div>
                        </div>
                        {(e.time||e.location) && (
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textLight,margin:"3px 0 0"}}>{[e.time,e.location].filter(Boolean).join(" · ")}</p>
                        )}
                        {e.description && (
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,margin:"4px 0 0",lineHeight:1.5}}>{e.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {(() => {
            const upcoming=[];
            for(let i=0;i<30;i++){const d=new Date();d.setDate(d.getDate()+i);const k=calDayKey(d);if(calEvents[k]?.length){calEvents[k].forEach(e=>upcoming.push({...e,date:k,dateLabel:d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}));}}
            if(!upcoming.length) return null;
            return (
              <div style={cardStyle(0.08)}>
                <SectionHead title="Upcoming — Next 30 Days"/>
                {upcoming.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:eventTypeColors[e.type]||C.rose,minWidth:40,flexShrink:0,marginTop:1}}>{e.dateLabel}</div>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.text,margin:0}}>{e.text}</p>
                      {(e.time||e.location) && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textLight,margin:"2px 0 0"}}>{[e.time,e.location].filter(Boolean).join(" · ")}</p>}
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textTransform:"capitalize",flexShrink:0}}>{e.type}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </>)}

        {/* ══ NOTES ══ */}
        {tab==="notes" && (<>
          <div style={cardStyle(0)}>
            <SectionHead title="Daily Reflection"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:C.ivory,borderRadius:5,padding:"8px 12px",border:`1px solid ${C.border}`}}>
              <button onClick={()=>{const d=new Date(viewDay+"T12:00:00");d.setDate(d.getDate()-1);setViewDay(localDateStr(d));}} style={{width:30,height:30,borderRadius:3,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <div style={{textAlign:"center"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,color:C.text,margin:0}}>{viewDay===today_k?"Today":new Date(viewDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}</p>
                {viewDay!==today_k&&<button onClick={()=>setViewDay(today_k)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:C.rose,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0,marginTop:2}}>back to today</button>}
              </div>
              <button onClick={()=>{const d=new Date(viewDay+"T12:00:00");d.setDate(d.getDate()+1);const next=localDateStr(d);if(next<=today_k)setViewDay(next);}} style={{width:30,height:30,borderRadius:3,border:`1px solid ${C.border}`,background:"transparent",color:viewDay===today_k?C.textFaint:C.textMid,fontSize:16,cursor:viewDay===today_k?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <textarea value={(data.notes||{})[viewDay]||""} onChange={e=>setData(p=>({...p,notes:{...p.notes,[viewDay]:e.target.value}}))}
              placeholder="Body… Energy… Mindset… What I'm proud of… What I'm releasing… What I'm calling in…"
              style={{...inp,minHeight:190,lineHeight:1.75,fontSize:15,fontFamily:"'Cormorant Garamond',Georgia,serif"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,textAlign:"right",marginTop:5}}>Saved automatically</p>
          </div>

          {/* Monthly Progress — overall only, no hair/skin/overall text boxes */}
          <div style={cardStyle(0.04)}>
            <SectionHead title="Monthly Progress" sub={`${today.toLocaleString("default",{month:"long",year:"numeric"})} — document your results`}/>
            <div style={{background:C.ivory,borderRadius:5,padding:"14px",border:`1px solid ${C.border}`}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.textMid,margin:"0 0 8px"}}>This month</p>
              <textarea value={(data.monthProgress||{})[month_k]?.overall||""} onChange={e=>setData(p=>({...p,monthProgress:{...p.monthProgress,[month_k]:{...(p.monthProgress||{})[month_k],overall:e.target.value}}}))} placeholder="Energy levels, body changes, mood patterns, financial movement, wins you're most proud of…" style={{...inp,minHeight:80,lineHeight:1.6,fontSize:13,background:"#FFFFFF"}}/>
            </div>
          </div>

          {/* Monthly Report */}
          {(() => {
            const [reportYear, reportMonthNum] = month_k.split("-").map(Number);
            const daysInMonth = new Date(reportYear, reportMonthNum, 0).getDate();
            const allDays = Array.from({length: daysInMonth}, (_, i) => {
              const d = `${reportYear}-${String(reportMonthNum).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
              return { key: d, habits: (data.daily||{})[d] || {} };
            });
            const daysWithData = allDays.filter(d => Object.keys(d.habits).length > 0);
            const totalDays = daysWithData.length;
            const avgCompletion = totalDays > 0 ? Math.round(daysWithData.reduce((s,d) => {
              const checks = DAILY_SCORE_CHECKS.filter(hk => d.habits[hk]).length;
              const tea = (d.habits.teas||[]).length>0?1:0;
              const fiber = (d.habits.fiber||[]).reduce((s,e)=>s+e.g,0)>=25?1:0;
              const mood = (d.habits.mood||0)>0?1:0;
              const win = (d.habits.win||"").length>5?1:0;
              return s + ((checks+tea+fiber+mood+win)/totalChecks)*100;
            }, 0) / totalDays) : 0;
            const moodDays = daysWithData.filter(d => d.habits.mood > 0);
            const avgMood = moodDays.length > 0 ? (moodDays.reduce((s,d) => s + (d.habits.mood||0), 0) / moodDays.length).toFixed(1) : null;
            const moodLabels = ["","Rough","Low","Okay","Good","Thriving"];
            const fiberDaysHit = daysWithData.filter(d => (d.habits.fiber||[]).reduce((s,e)=>s+e.g,0) >= 25).length;
            const wins = daysWithData.filter(d => d.habits.win && d.habits.win.trim().length > 0);
            let bestStreak = 0, currentStreak = 0;
            allDays.forEach(d => {
              const checks = DAILY_SCORE_CHECKS.filter(hk => d.habits[hk]).length;
              const tea = (d.habits.teas||[]).length>0?1:0;
              const fiber = (d.habits.fiber||[]).reduce((s,e)=>s+e.g,0)>=25?1:0;
              const mood = (d.habits.mood||0)>0?1:0;
              const win = (d.habits.win||"").length>5?1:0;
              if (((checks+tea+fiber+mood+win)/totalChecks) >= 0.6) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); } else currentStreak = 0;
            });
            const statCard = (icon, label, value, sub, color) => (
              <div style={{background:C.ivory,borderRadius:5,padding:"12px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
                <p style={{fontSize:15,margin:"0 0 2px"}}>{icon}</p>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:20,fontWeight:500,color,margin:0,lineHeight:1}}>{value}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,color:C.textLight,margin:"3px 0 1px",fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{label}</p>
                {sub&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,margin:0}}>{sub}</p>}
              </div>
            );
            return (
              <div style={cardStyle(0.08)}>
                <SectionHead title="Monthly Report" sub={`${today.toLocaleString("default",{month:"long",year:"numeric"})} · ${totalDays} active days`}/>
                {totalDays === 0 ? (
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontStyle:"italic",textAlign:"center",padding:"16px 0"}}>No data yet this month — start checking off habits</p>
                ) : (<>
                  <div style={{background:C.ivory,borderRadius:5,padding:"16px",marginBottom:14,textAlign:"center",border:`1px solid ${C.border}`}}>
                    <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:52,fontWeight:500,color:C.rose,margin:0,lineHeight:1}}>{avgCompletion}%</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,margin:"6px 0 0",textTransform:"uppercase",letterSpacing:2}}>Average Daily Completion</p>
                    <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:13,color:C.textMid,margin:"4px 0 0",fontStyle:"italic"}}>{avgCompletion>=80?"Outstanding month":avgCompletion>=60?"Solid effort — keep building":avgCompletion>=40?"Good start — push harder next month":"Every day is a new chance"}</p>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                    {statCard("🔥","Best Streak",`${bestStreak}d`,"consecutive","#C9A870")}
                    {statCard("🌡️","Avg Mood",avgMood?`${avgMood}/5`:"—",avgMood?moodLabels[Math.round(parseFloat(avgMood))]:"no data","#7BA68A")}
                    {statCard("🌱","Fiber",`${fiberDaysHit}d`,"hit 25g+","#7BA68A")}
                    {statCard("💰","Income",`$${totalIncome.toFixed(0)}`,`${monthIncome.length} entries`,"#7BA68A")}
                    {statCard("📈","Paper P&L",`${totalPaper>=0?"+":""}$${Math.abs(totalPaper).toFixed(0)}`,`${monthTrades.filter(t=>t.type==="paper").length} trades`,"#8A7BA6")}
                    {statCard("◆","Wins",`${wins.length}d`,"days with a win","#C9A870")}
                  </div>
                  <div style={{background:C.ivory,borderRadius:5,padding:"14px",marginBottom:14,border:`1px solid ${C.border}`}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:C.textLight,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:1}}>Habit Breakdown</p>
                    {[
                      {k:"vitaminIron",label:"Iron supplement"},{k:"vitaminD",label:"Vitamin D"},
                      {k:"sleep7",label:"7–9hrs sleep"},{k:"skincareAM",label:"AM skincare"},
                      {k:"todayTreatment",label:"PM treatment"},{k:"skincarePM",label:"PM moisturize"},
                      {k:"journaled",label:"Journaled"},
                    ].map(({k,label}) => {
                      const count = daysWithData.filter(d=>d.habits[k]).length;
                      const pctH = totalDays > 0 ? Math.round((count/totalDays)*100) : 0;
                      const color = pctH >= 80 ? C.green : pctH >= 50 ? C.gold : C.rose;
                      return (
                        <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,flex:1,minWidth:110}}>{label}</span>
                          <div style={{flex:2,height:3,borderRadius:2,background:C.border,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pctH}%`,background:color,borderRadius:2,transition:"width 0.5s ease"}}/>
                          </div>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color,minWidth:36,textAlign:"right"}}>{pctH}%</span>
                        </div>
                      );
                    })}
                  </div>
                  {wins.length > 0 && (
                    <div style={{background:C.ivory,borderRadius:5,padding:"14px",border:`1px solid ${C.border}`}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:C.textLight,margin:"0 0 12px",textTransform:"uppercase",letterSpacing:1}}>Wins this month</p>
                      {wins.slice(-10).map(d=>(
                        <div key={d.key} style={{display:"flex",gap:10,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`,alignItems:"flex-start"}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,minWidth:46,flexShrink:0,marginTop:2}}>{new Date(d.key+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:C.textMid,margin:0,lineHeight:1.5}}>{d.habits.win}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>)}
              </div>
            );
          })()}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {l:"Streak",v:`${streak}d`,s:streak>=7?"Don't break the chain":streak>=1?"Keep going":"Start today",c:C.rose},
              {l:"Today",v:`${pct}%`,s:`${doneCount}/${totalChecks} done`,c:C.rose},
            ].map(s=>(
              <div key={s.l} style={{...cardStyle(0),marginBottom:0,padding:"16px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textLight,letterSpacing:1.2,textTransform:"uppercase",margin:0}}>{s.l}</p>
                <p style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:30,fontWeight:500,color:s.c,margin:"3px 0 2px",fontStyle:"italic"}}>{s.v}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:C.textLight,margin:0}}>{s.s}</p>
              </div>
            ))}
          </div>
        </>)}

      </div>
    </div>
  );
}
