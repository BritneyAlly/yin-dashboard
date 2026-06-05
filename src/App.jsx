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
  "I am a sought-after hair health consultant who commands premium rates and changes lives.",
  "If not me, then who?",
];

const SKINCARE_SCHEDULE = {
  Sunday:    { treatment: "Mandelic Acid", type: "acid", color: "#e8a0b0" },
  Monday:    { treatment: "Azelaic Acid", type: "acid", color: "#b8a0e0" },
  Tuesday:   { treatment: "Hydration Day", type: "hydration", color: "#90c8e0" },
  Wednesday: { treatment: "Azelaic Acid", type: "acid", color: "#b8a0e0" },
  Thursday:  { treatment: "Mandelic Acid", type: "acid", color: "#e8a0b0" },
  Friday:    { treatment: "Azelaic Acid", type: "acid", color: "#b8a0e0" },
  Saturday:  { treatment: "Hydration Day", type: "hydration", color: "#90c8e0" },
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
  workout: { label: "Workouts", target: 4, icon: "🏋🏽", color: "#e8a090" },
  walk:    { label: "Walks", target: 3, icon: "🚶🏽‍♀️", color: "#80c8a0" },
  read:    { label: "Reading Sessions", target: 4, icon: "📖", color: "#b0a0e0" },
};

const THREADS_DAYS = ["Tuesday","Thursday","Saturday"];

function getNextRice(last) {
  if (!last) return null;
  const d = new Date(last); d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.round((new Date(dateStr) - new Date(todayKey())) / 86400000);
}

function calcStreak(dailyData, checkKeys) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = d.toISOString().split("T")[0];
    const dh = (dailyData || {})[k] || {};
    const done = checkKeys.filter(h => dh[h]).length;
    if ((done / checkKeys.length) >= 0.6) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

function streakEmoji(s) {
  if (s >= 30) return "🔥";
  if (s >= 14) return "⚡";
  if (s >= 7)  return "✨";
  if (s >= 3)  return "🌱";
  return "💫";
}

export default function Dashboard() {
  const [data, setData] = useState(load);
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
  const [newEvent, setNewEvent] = useState("");
  const [eventType, setEventType] = useState("appointment");
  const teaRef = useRef();
  const fiberRef = useRef();

  const today_k = todayKey();
  const week_k = getWeekMon();
  const month_k = getMonth();
  const isMandatoryThreadsDay = THREADS_DAYS.includes(todayDOW);

  useEffect(() => { save(data); saveCloud(data); }, [data]);
  useEffect(() => { loadCloud().then(cloud => { if (cloud && Object.keys(cloud).length > 0) setData(cloud); }); }, []);
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

  const td = (k) => ((data.daily || {})[today_k] || {})[k];
  const setTd = (k, v) => setData(p => ({ ...p, daily: { ...p.daily, [today_k]: { ...(p.daily||{})[today_k], [k]: v } } }));
  const toggle = (k) => setTd(k, !td(k));
  const wk = (k) => ((data.weekly || {})[week_k] || {})[k] || 0;
  const incWk = (k) => setData(p => ({ ...p, weekly: { ...p.weekly, [week_k]: { ...(p.weekly||{})[week_k], [k]: wk(k)+1 } } }));
  const decWk = (k) => setData(p => ({ ...p, weekly: { ...p.weekly, [week_k]: { ...(p.weekly||{})[week_k], [k]: Math.max(0,wk(k)-1) } } }));

  const teaLog = td("teas") || [];
  const addTea = (tea) => { setTd("teas", [...teaLog, { tea, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) }]); setShowTeaMenu(false); setTeaInput(""); };
  const removeTea = (i) => { const t=[...teaLog]; t.splice(i,1); setTd("teas",t); };

  const fiberLog = td("fiber") || [];
  const fiberTotal = fiberLog.reduce((s,e) => s + e.g, 0);
  const addFiber = (name, g) => { setTd("fiber", [...fiberLog, { name, g: parseFloat(g), id: Date.now() }]); setShowFiberMenu(false); setFiberCustomG(""); setFiberCustomName(""); };
  const removeFiber = (id) => setTd("fiber", fiberLog.filter(e => e.id !== id));

  const lastRice = data.lastRiceTreatment || "2026-05-17";
  const nextRice = getNextRice(lastRice);
  const riceCountdown = daysUntil(nextRice);
  const markRiceDone = () => setData(p => ({ ...p, lastRiceTreatment: today_k }));

  const mood = td("mood") || 0;
  const priority = td("priority") || "";
  const win = td("win") || "";

  const monthIncome = (data.income || {})[month_k] || [];
  const addIncome = () => {
    if (!incomeAmt) return;
    setData(p => ({ ...p, income: { ...p.income, [month_k]: [...monthIncome, { amt: parseFloat(incomeAmt), note: incomeNote, date: today_k, id: Date.now() }] } }));
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

  const networkLog = data.network || [];
  const addNetwork = () => {
    if (!networkName) return;
    setData(p => ({ ...p, network: [...(p.network||[]), { name: networkName, note: networkNote, followUp: networkFollowUp, date: today_k, id: Date.now(), done: false }] }));
    setNetworkName(""); setNetworkNote(""); setNetworkFollowUp("");
  };
  const toggleNetworkDone = (id) => setData(p => ({ ...p, network: p.network.map(n => n.id===id ? {...n,done:!n.done} : n) }));
  const removeNetwork = (id) => setData(p => ({ ...p, network: p.network.filter(n=>n.id!==id) }));

  const sundayReset = (data.sundayReset || {})[week_k] || { worked:"", didnt:"", carrying:"", intention:"" };
  const setSundayReset = (field, val) => setData(p => ({ ...p, sundayReset: { ...p.sundayReset, [week_k]: { ...sundayReset, [field]: val } } }));
  const moneyReview = (data.moneyReview || {})[week_k] || { income:"", spent:"", gap:"", plan:"" };
  const setMoneyReview = (field, val) => setData(p => ({ ...p, moneyReview: { ...p.moneyReview, [week_k]: { ...moneyReview, [field]: val } } }));

  const dailyChecks = ["vitaminIron","vitaminD","skincareAM","skincarePM","todayTreatment","jobApps","tradingStudy","tradeSession","threadsPost","socialPost","journaled","sleep7","scalpMassage","lowManip"];
  const doneCount = dailyChecks.filter(k=>td(k)).length + (teaLog.length>0?1:0) + (fiberTotal>=25?1:0) + (mood>0?1:0) + (win.length>0?1:0);
  const totalChecks = dailyChecks.length + 4;
  // Calendar
  const calEvents = data.calEvents || {};
  const calMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const calDayKey = (d) => d.toISOString().split("T")[0];
  const addEvent = () => {
    if (!newEvent.trim() || !selectedDay) return;
    const entry = { text: newEvent.trim(), type: eventType, id: Date.now() };
    setData(p => ({ ...p, calEvents: { ...p.calEvents, [selectedDay]: [...(p.calEvents?.[selectedDay]||[]), entry] } }));
    setNewEvent("");
  };
  const removeEvent = (day, id) => setData(p => ({ ...p, calEvents: { ...p.calEvents, [day]: p.calEvents[day].filter(e=>e.id!==id) } }));
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const getFirstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const eventTypeColors = { appointment:"#c090d0", bill:"#e8a070", reminder:"#70b8d0", personal:"#90c870" };

  const pct = Math.round((doneCount/totalChecks)*100);
  const streak = calcStreak(data.daily, dailyChecks);
  const todaySkincare = SKINCARE_SCHEDULE[todayDOW];

  const inp = { fontFamily:"'DM Sans',sans-serif", fontSize:13, color:"#2a1a3a", background:"rgba(245,238,252,0.55)", border:"1px solid rgba(200,180,225,0.4)", borderRadius:10, padding:"8px 12px", outline:"none", width:"100%" };
  const cardStyle = (delay=0) => ({ background:"rgba(255,251,254,0.86)", backdropFilter:"blur(16px)", borderRadius:20, padding:"18px 20px", marginBottom:12, border:"1px solid rgba(220,200,235,0.45)", boxShadow:"0 2px 24px rgba(140,100,180,0.07)", animation:`fadeUp 0.4s ${delay}s ease forwards`, opacity:0 });
  const pillBtn = (active, color="#9060c0") => ({ padding:"7px 18px", borderRadius:30, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12.5, fontWeight:500, letterSpacing:0.4, background:active?color:"rgba(235,225,248,0.7)", color:active?"#fff":"#9070b0", boxShadow:active?`0 3px 12px ${color}55`:"none", transition:"all 0.2s" });

  const Row = ({ label, k, note, color="#9060c0" }) => {
    const checked = !!td(k);
    return (
      <div onClick={()=>toggle(k)} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 8px", borderRadius:10, cursor:"pointer", background:checked?`${color}14`:"transparent", transition:"background 0.15s" }}>
        <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1, border:`2px solid ${checked?color:"rgba(180,150,210,0.4)"}`, background:checked?color:"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
          {checked && <span style={{color:"#fff",fontSize:10,fontWeight:800}}>✓</span>}
        </div>
        <div>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13.5, color:checked?color:"#2a1a3a", textDecoration:checked?"line-through":"none", opacity:checked?0.7:1, margin:0, lineHeight:1.4 }}>{label}</p>
          {note && !checked && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:10.5, color:"rgba(130,100,160,0.55)", fontStyle:"italic", margin:"2px 0 0" }}>{note}</p>}
        </div>
      </div>
    );
  };

  const SectionHead = ({icon,title,sub}) => (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:20}}>{icon}</span>
        <span style={{fontSize:17,fontWeight:500,color:"#1e0e2e"}}>{title}</span>
      </div>
      {sub && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#a080c0",marginTop:2,marginLeft:28,fontStyle:"italic"}}>{sub}</p>}
    </div>
  );

  const Divider = () => <div style={{height:1,background:"rgba(200,180,220,0.2)",margin:"8px 0"}}/>;

  const CounterRow = ({k,label,target,icon,color}) => {
    const val=wk(k); const done=val>=target; const p=Math.min((val/target)*100,100);
    return (
      <div style={{marginBottom:12,padding:"10px 12px",borderRadius:12,background:done?`${color}18`:"rgba(240,232,250,0.4)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
          <span style={{fontSize:18}}>{icon}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,flex:1,color:done?color:"#2a1a3a",fontWeight:500,textDecoration:done?"line-through":"none",opacity:done?0.75:1}}>{label}</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:done?color:"#9070b0"}}>{val}/{target}</span>
          <button onClick={()=>decWk(k)} style={{width:26,height:26,borderRadius:7,border:`1.5px solid ${color}60`,background:"transparent",color,fontSize:15,cursor:"pointer",fontWeight:700}}>−</button>
          <button onClick={()=>incWk(k)} style={{width:26,height:26,borderRadius:7,border:"none",background:color,color:"#fff",fontSize:15,cursor:"pointer",fontWeight:700}}>+</button>
        </div>
        <div style={{height:5,borderRadius:3,background:"rgba(200,180,220,0.2)",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${p}%`,background:`linear-gradient(90deg,${color}88,${color})`,borderRadius:3,transition:"width 0.4s ease"}}/>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#fdf0f8 0%,#f5eaf8 30%,#ece8f5 60%,#edf4f0 100%)", fontFamily:"'Playfair Display',Georgia,serif", color:"#2a1a3a", paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(180,140,210,0.3);border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes affirmFade{0%{opacity:0;transform:translateY(5px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-5px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .rhov:hover{background:rgba(180,140,210,0.08)!important;}
        input::placeholder,textarea::placeholder{color:rgba(140,110,170,0.45);}
        select{-webkit-appearance:none;}
        button{transition:opacity 0.15s;}
        button:hover{opacity:0.82;}
        .gold-shimmer{
          background: linear-gradient(90deg, #b8860b 0%, #ffd700 25%, #fffacd 50%, #ffd700 75%, #b8860b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.3px;
          line-height: 1.5;
        }
      `}</style>

      {/* MOTTO */}
      <div style={{padding:"12px 20px 0",textAlign:"center"}}>
        <p className="gold-shimmer" style={{margin:0}}>"I'd rather die enormous than live dormant — that's how we on it." — Jay-Z</p>
      </div>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#f0d8ec 0%,#ddd0ee 40%,#c8d5eb 100%)",padding:"26px 20px 22px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 60%,rgba(255,255,255,0.32) 0%,transparent 55%),radial-gradient(ellipse at 80% 15%,rgba(255,255,255,0.2) 0%,transparent 50%)"}}/>
        <div style={{position:"relative",zIndex:1}}>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,letterSpacing:3.5,textTransform:"uppercase",color:"#8060a8",fontWeight:600,margin:0}}>
            {todayDOW} · {today.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
          </p>
          <h1 style={{margin:"5px 0 2px",fontSize:28,fontWeight:600,fontStyle:"italic",color:"#1e0a30",letterSpacing:0.3}}>Your Optimal Life ✦</h1>
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:14,marginBottom:2,flexWrap:"wrap"}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#7050a0",margin:0}}>{pct}% of today complete</p>
            <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.35)",borderRadius:20,padding:"3px 12px"}}>
              <span style={{fontSize:14}}>{streakEmoji(streak)}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:"#5a2a8a"}}>{streak} day streak</span>
              {streak === 0 && <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9070b0"}}>— start today</span>}
            </div>
          </div>

          <div style={{maxWidth:460,margin:"14px auto 14px",background:"rgba(255,255,255,0.3)",borderRadius:24,padding:"10px 20px",minHeight:46,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p key={affirmIdx} style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:12.5,color:"#3a1a5a",fontStyle:"italic",lineHeight:1.55,margin:0,animation:"affirmFade 7s ease forwards",textAlign:"center"}}>
              ✦ {AFFIRMATIONS[affirmIdx]}
            </p>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap",marginBottom:14}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${todaySkincare.color}28`,borderRadius:20,padding:"5px 14px",border:`1px solid ${todaySkincare.color}55`}}>
              <span style={{fontSize:12}}>✨</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#4a2a6a",fontWeight:500}}>Today: <strong>{todaySkincare.treatment}</strong></span>
            </div>
            {riceCountdown !== null && (
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(160,200,140,0.22)",borderRadius:20,padding:"5px 14px",border:"1px solid rgba(110,170,90,0.35)"}}>
                <span style={{fontSize:12}}>🌾</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#2a4a18",fontWeight:500}}>
                  {riceCountdown===0?"Rice treatment TODAY!":riceCountdown>0?`Rice in ${riceCountdown}d`:`Rice ${Math.abs(riceCountdown)}d overdue`}
                </span>
              </div>
            )}
          </div>

          <div style={{display:"flex",justifyContent:"center"}}>
            <div style={{position:"relative",width:68,height:68}}>
              <svg width={68} height={68} style={{transform:"rotate(-90deg)"}}>
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e090c0"/><stop offset="100%" stopColor="#8060d0"/></linearGradient></defs>
                <circle cx={34} cy={34} r={27} fill="none" stroke="rgba(200,180,220,0.22)" strokeWidth={7}/>
                <circle cx={34} cy={34} r={27} fill="none" stroke="url(#rg)" strokeWidth={7} strokeDasharray={`${(pct/100)*170} 170`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.6s ease"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:"#5a2a8a"}}>{pct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{display:"flex",justifyContent:"center",gap:6,padding:"14px 14px 8px",flexWrap:"wrap"}}>
        {[["today","Today"],["weekly","Weekly"],["calendar","Calendar"],["income","Income"],["trades","Trading"],["network","Network"],["notes","Notes"]].map(([k,l])=>(
          <button key={k} style={pillBtn(tab===k)} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"8px 14px"}}>

        {/* ══ TODAY ══ */}
        {tab==="today" && (<>

          {/* History Day Viewer */}
          {historyDay && historyDay !== today_k && (() => {
            const hd = (data.daily||{})[historyDay] || {};
            const hChecks = dailyChecks.filter(k => hd[k]);
            const hPct = Math.round((hChecks.length / dailyChecks.length) * 100);
            const hTeas = hd.teas || [];
            const hFiber = (hd.fiber||[]).reduce((s,e)=>s+e.g,0);
            const hWin = hd.win || "";
            const hMood = hd.mood || 0;
            const moodEmojis = ["","😔","😐","🙂","😊","🌟"];
            return (
              <div style={{...cardStyle(0), border:"2px solid rgba(160,120,200,0.4)", background:"rgba(245,238,255,0.9)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#9060c0",textTransform:"uppercase",letterSpacing:1.5,margin:0}}>Viewing Past Day</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600,color:"#3a2a4a",margin:"2px 0 0"}}>{new Date(historyDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</p>
                  </div>
                  <button onClick={()=>setHistoryDay(null)} style={{padding:"5px 12px",borderRadius:20,border:"none",background:"rgba(160,120,200,0.15)",color:"#7050a0",fontFamily:"'DM Sans',sans-serif",fontSize:12,cursor:"pointer",fontWeight:500}}>✕ Close</button>
                </div>
                <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                  <div style={{background:"rgba(160,120,200,0.12)",borderRadius:12,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center"}}>
                    <p style={{fontSize:24,fontWeight:600,color:"#7050a0",margin:0,fontFamily:"'DM Sans',sans-serif"}}>{hPct}%</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#9070b0",margin:"2px 0 0"}}>completed</p>
                  </div>
                  {hMood>0&&<div style={{background:"rgba(160,120,200,0.12)",borderRadius:12,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center"}}>
                    <p style={{fontSize:20,margin:0}}>{["😔","😐","🙂","😊","🌟"][hMood-1]}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#9070b0",margin:"2px 0 0"}}>{["Rough","Low","Okay","Good","Thriving"][hMood-1]}</p>
                  </div>}
                  {hFiber>0&&<div style={{background:"rgba(120,180,100,0.12)",borderRadius:12,padding:"10px 14px",flex:1,minWidth:80,textAlign:"center"}}>
                    <p style={{fontSize:18,fontWeight:600,color:"#50a030",margin:0,fontFamily:"'DM Sans',sans-serif"}}>{hFiber.toFixed(0)}g</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#70a050",margin:"2px 0 0"}}>fiber</p>
                  </div>}
                </div>
                {hWin&&<div style={{background:"rgba(240,200,100,0.12)",borderRadius:10,padding:"8px 12px",marginBottom:10,border:"1px solid rgba(220,180,60,0.25)"}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9a7020",margin:"0 0 2px",fontWeight:600}}>🏆 Win</p>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3a2a1a",margin:0}}>{hWin}</p>
                </div>}
                {hTeas.length>0&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#5a7a50",margin:"0 0 8px"}}>🍵 {hTeas.map(t=>t.tea).join(", ")}</p>}
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {dailyChecks.map(k=>{
                    const done = !!hd[k];
                    const labels = {"vitaminIron":"Iron","vitaminD":"Vit D","skincareAM":"AM Skin","skincarePM":"PM Skin","todayTreatment":"Treatment","jobApps":"Job App","tradingStudy":"Trading Study","tradeSession":"Trade","threadsPost":"Threads","socialPost":"Social","journaled":"Journal","sleep7":"Sleep","scalpMassage":"Scalp","lowManip":"Low Manip"};
                    return <span key={k} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,padding:"3px 9px",borderRadius:20,background:done?"rgba(120,180,100,0.2)":"rgba(200,180,220,0.15)",color:done?"#3a6a20":"#9070b0",border:`1px solid ${done?"rgba(100,160,80,0.3)":"rgba(180,150,210,0.2)"}`}}>{done?"✓":""} {labels[k]||k}</span>;
                  })}
                </div>
              </div>
            );
          })()}

          {/* Day navigator for history */}
          {!historyDay && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:10}}>
              <button onClick={()=>{const d=new Date(today_k+"T12:00:00");d.setDate(d.getDate()-1);setHistoryDay(localDateStr(d));}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9060c0",background:"rgba(200,180,230,0.2)",border:"1px solid rgba(180,150,210,0.3)",borderRadius:20,padding:"5px 14px",cursor:"pointer"}}>‹ View previous day</button>
            </div>
          )}
          {historyDay && historyDay !== today_k && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10}}>
              <button onClick={()=>{const d=new Date(historyDay+"T12:00:00");d.setDate(d.getDate()-1);setHistoryDay(localDateStr(d));}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9060c0",background:"rgba(200,180,230,0.2)",border:"1px solid rgba(180,150,210,0.3)",borderRadius:20,padding:"5px 14px",cursor:"pointer"}}>‹ Earlier</button>
              <button onClick={()=>{const d=new Date(historyDay+"T12:00:00");d.setDate(d.getDate()+1);const next=localDateStr(d);setHistoryDay(next===today_k?null:next);}} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9060c0",background:"rgba(200,180,230,0.2)",border:"1px solid rgba(180,150,210,0.3)",borderRadius:20,padding:"5px 14px",cursor:"pointer"}}>Later ›</button>
            </div>
          )}

          <div style={cardStyle(0)}>
            <SectionHead icon="🎯" title="Today's One Priority" sub="The single most important move you make today" />
            <input value={priority} onChange={e=>setTd("priority",e.target.value)} placeholder="What must happen today no matter what?" style={{...inp,fontSize:14,fontWeight:500}}/>
            {priority && <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#9060c0",marginTop:6,fontStyle:"italic"}}>✦ Stay locked in.</p>}
          </div>

          <div style={cardStyle(0.04)}>
            <SectionHead icon="🌡️" title="Mood & Energy" sub="Rate yourself honestly — patterns reveal truth over time" />
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[1,2,3,4,5].map(n=>{
                const labels=["Rough","Low","Okay","Good","Thriving"];
                const colors=["#e08080","#e8a870","#e8d060","#90c870","#60c8a0"];
                const active=mood===n;
                return (
                  <div key={n} onClick={()=>setTd("mood",n)} style={{flex:1,textAlign:"center",padding:"10px 4px",borderRadius:12,cursor:"pointer",background:active?`${colors[n-1]}25`:"rgba(240,232,250,0.4)",border:`2px solid ${active?colors[n-1]:"transparent"}`,transition:"all 0.2s"}}>
                    <p style={{fontSize:20,margin:"0 0 3px"}}>{["😔","😐","🙂","😊","🌟"][n-1]}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,color:active?colors[n-1]:"#a080b0",fontWeight:active?600:400,margin:0}}>{labels[n-1]}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle(0.07)}>
            <SectionHead icon="🏆" title="Win of the Day" sub="One thing you did, built, closed, or showed up for" />
            <input value={win} onChange={e=>setTd("win",e.target.value)} placeholder="Today I…" style={{...inp,fontSize:13.5}}/>
          </div>

          <div style={cardStyle(0.09)}>
            <SectionHead icon="💊" title="Vitamins" sub="Iron between meals · away from tea · D with a fatty meal" />
            <Row label="Iron supplement (between meals)" k="vitaminIron" note="Space 1hr before/after tea for best absorption" color="#e08090"/>
            <Row label="Vitamin D" k="vitaminD" note="Take with a meal containing healthy fat" color="#f0b040"/>
          </div>

          <div style={cardStyle(0.11)}>
            <SectionHead icon="🍵" title="Daily Tea Log" sub="Log every cup — track tannin timing around iron" />
            <div style={{position:"relative"}} ref={teaRef}>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={teaInput} onChange={e=>setTeaInput(e.target.value)} onFocus={()=>setShowTeaMenu(true)} placeholder="Search or select tea…" style={{...inp,flex:1}}/>
                <button onClick={()=>{if(teaInput.trim())addTea(teaInput.trim());}} style={{padding:"8px 14px",borderRadius:10,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c890b8,#9860b0)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,flexShrink:0}}>+ Log</button>
              </div>
              {showTeaMenu && (
                <div style={{position:"absolute",top:"100%",left:0,right:56,zIndex:50,background:"rgba(255,250,255,0.98)",borderRadius:12,boxShadow:"0 8px 28px rgba(140,100,180,0.18)",border:"1px solid rgba(200,180,225,0.4)",maxHeight:200,overflowY:"auto"}}>
                  {TEAS.filter(t=>t.toLowerCase().includes(teaInput.toLowerCase())).map(t=>(
                    <div key={t} onClick={()=>addTea(t)} className="rhov" style={{padding:"9px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#4a2a6a",cursor:"pointer",borderBottom:"1px solid rgba(200,180,220,0.12)"}}>{t}</div>
                  ))}
                </div>
              )}
            </div>
            {teaLog.length>0 ? (
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {teaLog.map((t,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px 4px 12px",background:"rgba(140,190,160,0.18)",borderRadius:20,border:"1px solid rgba(100,160,120,0.25)"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#2a5a3a"}}>🍵 {t.tea}</span>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#6a9a70"}}>{t.time}</span>
                    <span onClick={()=>removeTea(i)} style={{cursor:"pointer",color:"#c08090",fontSize:14,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
            ) : <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"rgba(140,110,160,0.45)",fontStyle:"italic"}}>No teas logged yet today</p>}
          </div>

          <div style={cardStyle(0.13)}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <SectionHead icon="🌱" title="Fiber Intake" sub="Goal: 25g+ daily — hormone balance & gut health"/>
              <div style={{textAlign:"right",flexShrink:0}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:24,fontWeight:600,color:fiberTotal>=25?"#50a840":"#c07030",margin:0,lineHeight:1}}>{fiberTotal.toFixed(1)}g</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#a080b0",margin:"2px 0 0"}}>of 25g</p>
              </div>
            </div>
            <div style={{height:6,borderRadius:3,background:"rgba(200,180,220,0.2)",overflow:"hidden",marginBottom:10}}>
              <div style={{height:"100%",width:`${Math.min((fiberTotal/25)*100,100)}%`,background:"linear-gradient(90deg,#90c860,#50a840)",borderRadius:3,transition:"width 0.4s ease"}}/>
            </div>
            <div ref={fiberRef}>
              <button onClick={()=>setShowFiberMenu(v=>!v)} style={{width:"100%",padding:"8px",borderRadius:10,border:"1px dashed rgba(140,180,100,0.5)",background:"rgba(160,210,120,0.1)",color:"#4a7a30",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",fontWeight:500}}>
                {showFiberMenu ? "▲ Close" : "+ Add food"}
              </button>
              {showFiberMenu && (
                <div style={{marginTop:6,borderRadius:12,border:"1px solid rgba(160,200,120,0.3)",overflow:"hidden",background:"rgba(255,252,255,0.98)"}}>
                  {FIBER_FOODS.filter(f=>f.name!=="Custom").map(f=>(
                    <div key={f.name} onClick={()=>addFiber(f.name,f.g)} className="rhov" style={{display:"flex",justifyContent:"space-between",padding:"11px 14px",cursor:"pointer",borderBottom:"1px solid rgba(160,200,120,0.12)"}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#3a5a20"}}>{f.name}</span>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:"#5a8a30"}}>{f.g}g</span>
                    </div>
                  ))}
                  <div style={{padding:"10px 14px",borderTop:"1px solid rgba(160,200,120,0.2)",background:"rgba(240,250,235,0.5)"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#5a7a40",margin:"0 0 8px",fontWeight:600}}>Custom food</p>
                    <input value={fiberCustomName} onChange={e=>setFiberCustomName(e.target.value)} placeholder="Food name" style={{...inp,marginBottom:6,fontSize:13}}/>
                    <div style={{display:"flex",gap:6}}>
                      <input value={fiberCustomG} onChange={e=>setFiberCustomG(e.target.value)} placeholder="Fiber grams (e.g. 4)" type="number" style={{...inp,flex:1,fontSize:13}}/>
                      <button onClick={(e)=>{e.stopPropagation();if(fiberCustomG&&fiberCustomName)addFiber(fiberCustomName,fiberCustomG);}} style={{padding:"8px 16px",borderRadius:8,border:"none",background:"#70b040",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,cursor:"pointer",flexShrink:0,fontWeight:500}}>Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {fiberLog.length>0 && (
              <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
                {fiberLog.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px 3px 11px",background:"rgba(140,200,100,0.15)",borderRadius:20,border:"1px solid rgba(110,170,80,0.25)"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#3a5a20"}}>{e.name} · <strong>{e.g}g</strong></span>
                    <span onClick={()=>removeFiber(e.id)} style={{cursor:"pointer",color:"#c08090",fontSize:13,lineHeight:1}}>×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle(0.15)}>
            <SectionHead icon="✨" title="Skincare" sub={`${todayDOW}: ${todaySkincare.treatment}`}/>
            <div style={{background:`${todaySkincare.color}1e`,borderRadius:10,padding:"8px 12px",marginBottom:10,borderLeft:`3px solid ${todaySkincare.color}`}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#4a2a6a",margin:0,fontWeight:500}}>
                {todaySkincare.type==="acid"?`PM: Apply ${todaySkincare.treatment} after cleanse, before moisturizer`:"Deep hydration — hyaluronic acid, barrier repair, no actives tonight"}
              </p>
            </div>
            <Row label="AM: Cleanse → moisturize → SPF 30+" k="skincareAM" note="SPF daily is your #1 anti-aging investment" color="#e0a0c0"/>
            <Row label={`PM: ${todaySkincare.treatment} applied`} k="todayTreatment" note={todaySkincare.type==="acid"?"After cleansing, before moisturizer":"Hyaluronic acid + rich moisturizer"} color={todaySkincare.color}/>
            <Row label="PM: Moisturize & seal" k="skincarePM" note="Lock in treatment — face oil optional on top" color="#e0a0c0"/>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#a080b0",fontStyle:"italic",margin:"4px 0 0"}}>📅 Sun Mandelic · Mon Azelaic · Tue Hydration · Wed Azelaic · Thu Mandelic · Fri Azelaic · Sat Hydration</p>
          </div>

          <div style={cardStyle(0.17)}>
            <SectionHead icon="🪷" title="Hair Health" sub="Rice treatment every 2 weeks · scalp care daily"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(160,200,140,0.14)",borderRadius:12,padding:"10px 14px",marginBottom:10,border:"1px solid rgba(110,170,90,0.22)"}}>
              <div>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,fontWeight:600,color:"#2a4a18",margin:0}}>🌾 Rice Water Treatment</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#5a7a48",margin:"2px 0 0"}}>Last: {lastRice} · Next: {nextRice}{riceCountdown===0?" ← TODAY!":riceCountdown>0?` (${riceCountdown}d)`:` (${Math.abs(riceCountdown)}d overdue)`}</p>
              </div>
              {riceCountdown<=0&&(
                <button onClick={markRiceDone} style={{padding:"7px 14px",borderRadius:10,border:"none",cursor:"pointer",background:data.lastRiceTreatment===today_k?"rgba(90,150,70,0.25)":"linear-gradient(135deg,#a8d088,#68b048)",color:data.lastRiceTreatment===today_k?"#3a6a20":"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500}}>
                  {data.lastRiceTreatment===today_k?"✓ Done!":"Mark done"}
                </button>
              )}
            </div>
            <Row label="Scalp massage with hair oil" k="scalpMassage" note="4 min daily shown to increase shaft thickness (Koyama et al.)" color="#c0a0e0"/>
            <Row label="Low-manipulation style today" k="lowManip" note="Protective styles reduce mechanical breakage" color="#c0a0e0"/>
          </div>

          <div style={cardStyle(0.19)}>
            <SectionHead icon="💰" title="Financial Goals" sub="Job apps · trading · content"/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#a080b0",textTransform:"uppercase",letterSpacing:1,margin:"0 0 4px"}}>Job Search</p>
            <Row label="Applied for at least 1 job today" k="jobApps" note="5+ quality apps/week = ~1 interview every 2 weeks" color="#e89060"/>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#a080b0",textTransform:"uppercase",letterSpacing:1,margin:"4px 0 4px"}}>Trading</p>
            <Row label="Trading study session (30+ min)" k="tradingStudy" note="Goal: learn by end of month — daily is the path" color="#60b0c0"/>
            <Row label="Paper trade or market review" k="tradeSession" note="Log it in the Trading tab" color="#60b0c0"/>
            <Divider/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#a080b0",textTransform:"uppercase",letterSpacing:1,margin:"4px 0 4px"}}>Content</p>
            <Row label={`Threads post${isMandatoryThreadsDay?" (📌 REQUIRED — "+todayDOW+")":""}`} k="threadsPost" note={`Schedule: Tue · Thu · Sat${isMandatoryThreadsDay?" ← you're on!":""}`} color={isMandatoryThreadsDay?"#c030a0":"#b090d0"}/>
            <Row label="Social media post (1x this week)" k="socialPost" note="Hair, wellness, or business content — any platform" color="#c030a0"/>
          </div>

          <div style={cardStyle(0.21)}>
            <SectionHead icon="🕊️" title="Wellness & Mind" sub="Sleep · reflection · social connection"/>
            <Row label="Slept 7–9 hours" k="sleep7" note="Skin repair, hormone reset, and hair growth all peak during sleep" color="#9090e0"/>
            <Row label="Journaled or reflected (5+ min)" k="journaled" note="The most important relationship you have is with yourself" color="#9090e0"/>
            <Row label="Meaningful social connection today" k="social" note="1–3 hrs/day of real connection is the science-backed sweet spot" color="#9090e0"/>
          </div>
        </>)}

        {/* ══ WEEKLY ══ */}
        {tab==="weekly" && (<>
          <p style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9070b0",marginBottom:14,fontStyle:"italic"}}>Week of {week_k}</p>

          <div style={cardStyle(0)}>
            <SectionHead icon="🎯" title="Movement & Learning"/>
            {Object.entries(WEEKLY).map(([k,v])=><CounterRow key={k} k={k} {...v}/>)}
          </div>

          <div style={cardStyle(0.06)}>
            <SectionHead icon="🧵" title="Content Schedule" sub="Threads: Tue · Thu · Sat · Social: 1x/week"/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
              {DOW.map(d=>{
                const req=THREADS_DAYS.includes(d); const isT=d===todayDOW;
                return (
                  <div key={d} style={{flex:1,minWidth:50,textAlign:"center",padding:"9px 4px",borderRadius:12,background:req?(isT?"linear-gradient(135deg,#d040a0,#9030b8)":"rgba(190,70,150,0.14)"):"rgba(235,228,248,0.45)",border:isT?`2px solid ${req?"#d040a0":"#b0a0d0"}`:"1px solid rgba(200,180,225,0.3)"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,textTransform:"uppercase",letterSpacing:0.8,color:req?(isT?"#fff":"#b030a0"):"#b0a0c0",margin:"0 0 3px",fontWeight:600}}>{d.slice(0,3)}</p>
                    <p style={{fontSize:15,margin:0}}>{req?"📝":"—"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle(0.09)}>
            <SectionHead icon="✨" title="Skincare Week"/>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {DOW.map(d=>{
                const sc=SKINCARE_SCHEDULE[d]; const isT=d===todayDOW;
                return (
                  <div key={d} style={{flex:1,minWidth:60,textAlign:"center",padding:"9px 4px",borderRadius:12,background:isT?`${sc.color}38`:`${sc.color}16`,border:isT?`2px solid ${sc.color}`:`1px solid ${sc.color}35`}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:9.5,textTransform:"uppercase",letterSpacing:0.8,color:"#7050a0",margin:"0 0 3px",fontWeight:600}}>{d.slice(0,3)}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#3a2a4a",margin:0,fontWeight:isT?600:400,lineHeight:1.3}}>{sc.treatment.replace(" Acid","").replace("Hydration Day","Hydrate")}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={cardStyle(0.12)}>
            <SectionHead icon="🌙" title="Sunday Reset" sub={isSunday?"Tonight is your reset — take 10 minutes":"Your weekly close ritual — available every Sunday"}/>
            {[
              {field:"worked",label:"What worked this week?",ph:"Wins, breakthroughs, moments of alignment…"},
              {field:"didnt",label:"What didn't work?",ph:"Be honest — no judgment, just data…"},
              {field:"carrying",label:"What are you carrying into next week?",ph:"Unfinished things, energy, intentions…"},
              {field:"intention",label:"One intention for next week",ph:"How do you want to show up?"},
            ].map(({field,label,ph})=>(
              <div key={field} style={{marginBottom:10}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#7050a0",fontWeight:500,margin:"0 0 5px"}}>{label}</p>
                <textarea value={sundayReset[field]} onChange={e=>setSundayReset(field,e.target.value)} placeholder={ph} style={{...inp,minHeight:60,resize:"vertical",lineHeight:1.6}}/>
              </div>
            ))}
          </div>

          <div style={cardStyle(0.15)}>
            <SectionHead icon="💵" title="Weekly Money Review" sub="10 minutes every Sunday — women who build wealth do this religiously"/>
            {[
              {field:"income",label:"What came in?",ph:"Clients, job leads, sales…"},
              {field:"spent",label:"What went out?",ph:"Expenses, bills, purchases…"},
              {field:"gap",label:"What's the gap?",ph:"Where are you vs where you need to be?"},
              {field:"plan",label:"One financial move next week",ph:"What are you committing to?"},
            ].map(({field,label,ph})=>(
              <div key={field} style={{marginBottom:10}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#7050a0",fontWeight:500,margin:"0 0 5px"}}>{label}</p>
                <textarea value={moneyReview[field]} onChange={e=>setMoneyReview(field,e.target.value)} placeholder={ph} style={{...inp,minHeight:54,resize:"vertical",lineHeight:1.6}}/>
              </div>
            ))}
          </div>
        </>)}

        {/* ══ INCOME ══ */}
        {tab==="income" && (<>
          <div style={cardStyle(0)}>
            <SectionHead icon="💵" title="Income Tracker" sub={today.toLocaleString("default",{month:"long",year:"numeric"})}/>
            <div style={{background:"linear-gradient(135deg,rgba(180,230,150,0.25),rgba(140,210,110,0.18))",borderRadius:14,padding:"14px",marginBottom:14,border:"1px solid rgba(110,180,80,0.28)",textAlign:"center"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#3a6a20",letterSpacing:1.8,textTransform:"uppercase",margin:0}}>This Month</p>
              <p style={{fontSize:40,fontWeight:400,color:"#1a4a0a",margin:"4px 0 0",fontStyle:"italic"}}>${totalIncome.toFixed(2)}</p>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={incomeAmt} onChange={e=>setIncomeAmt(e.target.value)} placeholder="Amount $" type="number" style={{...inp,flex:"0 0 110px"}}/>
              <input value={incomeNote} onChange={e=>setIncomeNote(e.target.value)} placeholder="Source (client, job, sale…)" style={{...inp,flex:1}}/>
            </div>
            <button onClick={addIncome} style={{width:"100%",padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#98d068,#60a838)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Add Income</button>
            {monthIncome.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(130,100,150,0.45)",fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No income logged yet this month</p>
              : [...monthIncome].reverse().map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:"rgba(140,210,100,0.1)",marginBottom:6,border:"1px solid rgba(110,180,80,0.18)"}}>
                  <div style={{flex:1}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:"#1a4a0a",margin:0,fontWeight:600}}>${e.amt.toFixed(2)}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#4a7a30",margin:"2px 0 0"}}>{e.note||"—"} · {e.date}</p>
                  </div>
                  <span onClick={()=>removeIncome(e.id)} style={{cursor:"pointer",color:"#c08090",fontSize:17,padding:4}}>×</span>
                </div>
              ))
            }
          </div>
        </>)}

        {/* ══ TRADING ══ */}
        {tab==="trades" && (<>
          <div style={cardStyle(0)}>
            <SectionHead icon="📈" title="Trade Tracker" sub={`${today.toLocaleString("default",{month:"long",year:"numeric"})} · Goal: learn by end of month`}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{background:totalPL>=0?"rgba(140,210,100,0.18)":"rgba(220,120,120,0.15)",borderRadius:12,padding:"12px 14px",border:`1px solid ${totalPL>=0?"rgba(100,180,70,0.28)":"rgba(200,80,80,0.25)"}`}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#7a5a9a",letterSpacing:1.2,textTransform:"uppercase",margin:0}}>Live P&L</p>
                <p style={{fontSize:26,fontWeight:400,color:totalPL>=0?"#1a5a0a":"#7a1a1a",margin:"4px 0 0"}}>{totalPL>=0?"+":""}${totalPL.toFixed(2)}</p>
              </div>
              <div style={{background:"rgba(160,140,220,0.14)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(130,110,200,0.22)"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#7a5a9a",letterSpacing:1.2,textTransform:"uppercase",margin:0}}>Paper P&L</p>
                <p style={{fontSize:26,fontWeight:400,color:totalPaper>=0?"#3a2a8a":"#7a1a5a",margin:"4px 0 0"}}>{totalPaper>=0?"+":""}${totalPaper.toFixed(2)}</p>
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
            <button onClick={addTrade} style={{width:"100%",padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#7888d8,#4858b8)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Log Trade</button>
            {monthTrades.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(130,100,150,0.45)",fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No trades yet — start with paper trades while you learn</p>
              : [...monthTrades].reverse().map(e=>{
                const pos=e.amt>=0;
                return (
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,background:e.type==="paper"?"rgba(130,110,210,0.08)":(pos?"rgba(120,200,90,0.1)":"rgba(210,100,100,0.1)"),border:`1px solid ${e.type==="paper"?"rgba(130,110,200,0.18)":(pos?"rgba(90,170,60,0.22)":"rgba(190,70,70,0.22)")}`}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:e.type==="paper"?"#4030a0":(pos?"#1a5a0a":"#7a1a1a")}}>{pos?"+":""}${e.amt.toFixed(2)}</span>
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,padding:"2px 8px",borderRadius:20,background:e.type==="paper"?"rgba(130,110,200,0.18)":"rgba(70,150,50,0.18)",color:e.type==="paper"?"#4030a0":"#1a4a0a"}}>{e.type}</span>
                      </div>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#7a5a9a",margin:"2px 0 0"}}>{e.note||"—"} · {e.date}</p>
                    </div>
                    <span onClick={()=>removeTrade(e.id)} style={{cursor:"pointer",color:"#c08090",fontSize:17,padding:4}}>×</span>
                  </div>
                );
              })
            }
            <div style={{background:"rgba(190,210,235,0.2)",borderRadius:12,padding:"12px 14px",marginTop:6,border:"1px solid rgba(130,170,210,0.22)"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#3a4a70",margin:0,lineHeight:1.6}}>💡 <strong>Rule:</strong> Don't go live until you're consistently profitable on paper for 30+ days. Losses on paper are lessons. Losses live are tuition.</p>
            </div>
          </div>
        </>)}

        {/* ══ NETWORK ══ */}
        {tab==="network" && (<>
          <div style={cardStyle(0)}>
            <SectionHead icon="🤝" title="Network Log" sub="One meaningful connection a week = 52 relationships intentionally built per year"/>
            <input value={networkName} onChange={e=>setNetworkName(e.target.value)} placeholder="Name" style={{...inp,marginBottom:7}}/>
            <input value={networkNote} onChange={e=>setNetworkNote(e.target.value)} placeholder="How you met / what they do" style={{...inp,marginBottom:7}}/>
            <input value={networkFollowUp} onChange={e=>setNetworkFollowUp(e.target.value)} placeholder="Follow-up action (e.g. send IG, schedule call…)" style={{...inp,marginBottom:8}}/>
            <button onClick={addNetwork} style={{width:"100%",padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c890c8,#9060b0)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Add Connection</button>
            {networkLog.length===0
              ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(130,100,150,0.45)",fontStyle:"italic",textAlign:"center",padding:"8px 0"}}>No connections logged yet — who did you meet this week?</p>
              : [...networkLog].reverse().map(n=>(
                <div key={n.id} style={{padding:"12px 14px",borderRadius:12,marginBottom:8,background:n.done?"rgba(140,200,120,0.12)":"rgba(200,180,230,0.15)",border:`1px solid ${n.done?"rgba(100,170,80,0.25)":"rgba(180,150,220,0.3)"}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,fontWeight:600,color:"#2a1a3a",margin:"0 0 2px",textDecoration:n.done?"line-through":"none",opacity:n.done?0.6:1}}>{n.name}</p>
                      {n.note&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#6a4a8a",margin:"0 0 2px"}}>{n.note}</p>}
                      {n.followUp&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#9060b0",margin:"0 0 2px",fontStyle:"italic"}}>→ {n.followUp}</p>}
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#b090c0",margin:0}}>{n.date}</p>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>toggleNetworkDone(n.id)} style={{padding:"5px 10px",borderRadius:8,border:"none",cursor:"pointer",background:n.done?"rgba(100,170,80,0.2)":"rgba(160,130,200,0.2)",color:n.done?"#3a7a20":"#7040a0",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500}}>
                        {n.done?"✓ Done":"Mark done"}
                      </button>
                      <span onClick={()=>removeNetwork(n.id)} style={{cursor:"pointer",color:"#c08090",fontSize:17,padding:"4px 2px"}}>×</span>
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
            {/* Month nav */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()-1,1))} style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(200,180,220,0.4)",background:"rgba(240,232,250,0.5)",color:"#7050a0",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <h3 style={{fontSize:18,fontWeight:500,color:"#1e0e2e",margin:0}}>
                {calMonth.toLocaleString("default",{month:"long",year:"numeric"})}
              </h3>
              <button onClick={()=>setCalMonth(d=>new Date(d.getFullYear(),d.getMonth()+1,1))} style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(200,180,220,0.4)",background:"rgba(240,232,250,0.5)",color:"#7050a0",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>

            {/* Day headers */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
                <div key={d} style={{textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#a080b0",padding:"4px 0"}}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array(getFirstDayOfMonth(calMonth)).fill(null).map((_,i)=>(
                <div key={`empty-${i}`}/>
              ))}
              {Array(getDaysInMonth(calMonth)).fill(null).map((_,i)=>{
                const dayNum = i+1;
                const dayDate = new Date(calMonth.getFullYear(), calMonth.getMonth(), dayNum);
                const dayKey = calDayKey(dayDate);
                const isToday = dayKey === today_k;
                const isSelected = dayKey === selectedDay;
                const events = calEvents[dayKey] || [];
                const hasEvents = events.length > 0;
                return (
                  <div key={dayNum} onClick={()=>setSelectedDay(isSelected ? null : dayKey)} style={{
                    textAlign:"center", padding:"6px 2px", borderRadius:10, cursor:"pointer",
                    background: isSelected ? "linear-gradient(135deg,#d0a0e0,#a070c0)" : isToday ? "rgba(180,140,220,0.2)" : "rgba(240,232,250,0.3)",
                    border: isToday ? "2px solid rgba(160,120,200,0.5)" : "1px solid transparent",
                    transition:"all 0.15s",
                  }}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:isToday?700:400,color:isSelected?"#fff":isToday?"#6030a0":"#3a2a4a",margin:0}}>{dayNum}</p>
                    {hasEvents && (
                      <div style={{display:"flex",justifyContent:"center",gap:2,marginTop:2,flexWrap:"wrap"}}>
                        {events.slice(0,3).map(e=>(
                          <div key={e.id} style={{width:5,height:5,borderRadius:"50%",background:isSelected?"rgba(255,255,255,0.8)":eventTypeColors[e.type]||"#c090d0"}}/>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:12,paddingTop:10,borderTop:"1px solid rgba(200,180,220,0.2)"}}>
              {Object.entries(eventTypeColors).map(([type,color])=>(
                <div key={type} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:color}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#8060a0",textTransform:"capitalize"}}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected day events */}
          {selectedDay && (
            <div style={cardStyle(0.04)}>
              <SectionHead icon="📅" title={new Date(selectedDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} sub=""/>

              {/* Add event */}
              <input value={newEvent} onChange={e=>setNewEvent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEvent()}
                placeholder="Add appointment, bill, or reminder…"
                style={{...inp,marginBottom:8}}/>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                {Object.entries(eventTypeColors).map(([type,color])=>(
                  <button key={type} onClick={()=>setEventType(type)} style={{
                    padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",
                    background:eventType===type?color:"rgba(235,225,248,0.7)",
                    color:eventType===type?"#fff":"#8060a0",
                    fontFamily:"'DM Sans',sans-serif",fontSize:11.5,fontWeight:500,textTransform:"capitalize",
                    transition:"all 0.2s",
                  }}>{type}</button>
                ))}
              </div>
              <button onClick={addEvent} style={{width:"100%",padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#c890d0,#9060b0)",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,marginBottom:14}}>+ Add</button>

              {/* Event list */}
              {(calEvents[selectedDay]||[]).length===0
                ? <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(130,100,150,0.45)",fontStyle:"italic",textAlign:"center"}}>Nothing scheduled — tap above to add</p>
                : (calEvents[selectedDay]||[]).map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,marginBottom:6,background:`${eventTypeColors[e.type]||"#c090d0"}14`,border:`1px solid ${eventTypeColors[e.type]||"#c090d0"}35`}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:eventTypeColors[e.type]||"#c090d0",flexShrink:0}}/>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13.5,color:"#2a1a3a",flex:1,margin:0}}>{e.text}</p>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#9070b0",textTransform:"capitalize",flexShrink:0}}>{e.type}</span>
                    <span onClick={()=>removeEvent(selectedDay,e.id)} style={{cursor:"pointer",color:"#c08090",fontSize:17,padding:4,flexShrink:0}}>×</span>
                  </div>
                ))
              }
            </div>
          )}

          {/* Upcoming events */}
          {(() => {
            const upcoming = [];
            for (let i=0; i<30; i++) {
              const d = new Date(); d.setDate(d.getDate()+i);
              const k = calDayKey(d);
              if (calEvents[k]?.length) {
                calEvents[k].forEach(e => upcoming.push({...e, date:k, dateLabel: d.toLocaleDateString("en-US",{month:"short",day:"numeric"})}));
              }
            }
            if (!upcoming.length) return null;
            return (
              <div style={cardStyle(0.08)}>
                <SectionHead icon="🔜" title="Upcoming (Next 30 Days)" sub=""/>
                {upcoming.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,marginBottom:5,background:`${eventTypeColors[e.type]||"#c090d0"}10`,border:`1px solid ${eventTypeColors[e.type]||"#c090d0"}28`}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:eventTypeColors[e.type]||"#9060c0",minWidth:36,flexShrink:0}}>{e.dateLabel}</div>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#2a1a3a",flex:1,margin:0}}>{e.text}</p>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#b090c0",textTransform:"capitalize",flexShrink:0}}>{e.type}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </>)}

        {/* ══ NOTES ══ */}
        {tab==="notes" && (<>
          <div style={cardStyle(0)}>
            <SectionHead icon="📓" title="Daily Reflection" sub=""/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,background:"rgba(200,180,220,0.15)",borderRadius:12,padding:"8px 12px"}}>
              <button onClick={()=>{const d=new Date(viewDay+"T12:00:00");d.setDate(d.getDate()-1);setViewDay(localDateStr(d));}} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(200,180,220,0.4)",background:"transparent",color:"#7050a0",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <div style={{textAlign:"center"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:"#3a2a4a",margin:0}}>
                  {viewDay===today_k?"Today ✦":new Date(viewDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
                </p>
                {viewDay!==today_k&&<button onClick={()=>setViewDay(today_k)} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#9060c0",background:"none",border:"none",cursor:"pointer",textDecoration:"underline",padding:0,marginTop:2}}>back to today</button>}
              </div>
              <button onClick={()=>{const d=new Date(viewDay+"T12:00:00");d.setDate(d.getDate()+1);const next=localDateStr(d);if(next<=today_k)setViewDay(next);}} style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(200,180,220,0.4)",background:"transparent",color:viewDay===today_k?"#d0c0e0":"#7050a0",fontSize:18,cursor:viewDay===today_k?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
            </div>
            <textarea value={(data.notes||{})[viewDay]||""} onChange={e=>setData(p=>({...p,notes:{...p.notes,[viewDay]:e.target.value}}))}
              placeholder="Body… Energy… Mindset… What I'm proud of… What I'm releasing… What I'm calling in…"
              style={{...inp,minHeight:190,resize:"vertical",lineHeight:1.75,fontSize:15,fontFamily:"'Playfair Display',Georgia,serif"}}/>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"rgba(150,120,180,0.5)",textAlign:"right",marginTop:5}}>Saved automatically ✦</p>
          </div>

          {/* MONTHLY PROGRESS */}
          <div style={cardStyle(0.04)}>
            <SectionHead icon="📸" title="Monthly Progress" sub={`${today.toLocaleString("default",{month:"long",year:"numeric"})} — document your results, not just your effort`}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[
                {key:"hairProgress", icon:"🪷", label:"Hair", color:"#c0a0e0", placeholder:"Shedding level, thickness, scalp health, gray patch update…"},
                {key:"skinProgress", icon:"✨", label:"Skin", color:"#e8a0b0", placeholder:"Texture, brightness, breakouts, how your protocol is working…"},
              ].map(({key,icon,label,color,placeholder})=>(
                <div key={key} style={{background:`${color}14`,borderRadius:14,padding:"12px 14px",border:`1px solid ${color}40`}}>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#3a2a4a",margin:"0 0 6px",display:"flex",alignItems:"center",gap:5}}><span>{icon}</span>{label}</p>
                  <textarea
                    value={(data.monthProgress||{})[month_k]?.[key]||""}
                    onChange={e=>setData(p=>({...p,monthProgress:{...p.monthProgress,[month_k]:{...(p.monthProgress||{})[month_k],[key]:e.target.value}}}))}
                    placeholder={placeholder}
                    style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6,fontSize:12,padding:"7px 10px",background:"rgba(255,252,255,0.7)"}}
                  />
                </div>
              ))}
            </div>
            <div style={{background:"rgba(200,180,230,0.12)",borderRadius:14,padding:"12px 14px",border:"1px solid rgba(180,150,220,0.25)"}}>
              <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#3a2a4a",margin:"0 0 6px"}}>💰 Overall this month</p>
              <textarea
                value={(data.monthProgress||{})[month_k]?.overall||""}
                onChange={e=>setData(p=>({...p,monthProgress:{...p.monthProgress,[month_k]:{...(p.monthProgress||{})[month_k],overall:e.target.value}}}))}
                placeholder="Energy levels, body changes, mood patterns, financial movement, wins you're most proud of…"
                style={{...inp,minHeight:70,resize:"vertical",lineHeight:1.6,fontSize:12,background:"rgba(255,252,255,0.7)"}}
              />
            </div>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"rgba(150,120,180,0.5)",marginTop:8,fontStyle:"italic",textAlign:"center"}}>
              📅 Fill this in on the 1st of each month — your results over time are the proof of your consistency
            </p>
          </div>

          {/* AUTOMATIC MONTHLY REPORT */}
          {(() => {
            const [reportYear, reportMonthNum] = month_k.split("-").map(Number);
            const daysInMonth = new Date(reportYear, reportMonthNum, 0).getDate();
            const allDays = Array.from({length: daysInMonth}, (_, i) => {
              const d = `${reportYear}-${String(reportMonthNum).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`;
              return { key: d, habits: (data.daily||{})[d] || {} };
            });
            const daysWithData = allDays.filter(d => Object.keys(d.habits).length > 0);
            const totalDays = daysWithData.length;

            // Habit completion
            const habitScores = dailyChecks.map(hk => ({
              key: hk,
              count: daysWithData.filter(d => d.habits[hk]).length
            }));
            const avgCompletion = totalDays > 0 ? Math.round(daysWithData.reduce((s,d) => {
              const done = dailyChecks.filter(hk => d.habits[hk]).length;
              return s + (done / dailyChecks.length) * 100;
            }, 0) / totalDays) : 0;

            // Mood
            const moodDays = daysWithData.filter(d => d.habits.mood > 0);
            const avgMood = moodDays.length > 0 ? (moodDays.reduce((s,d) => s + (d.habits.mood||0), 0) / moodDays.length).toFixed(1) : null;
            const moodLabels = ["","Rough","Low","Okay","Good","Thriving"];

            // Fiber
            const fiberDaysHit = daysWithData.filter(d => (d.habits.fiber||[]).reduce((s,e)=>s+e.g,0) >= 25).length;

            // Weekly data
            const weeklyData = data.weekly || {};
            const monthWorkouts = Object.entries(weeklyData).filter(([wk]) => wk.startsWith(month_k.slice(0,7).replace("-",""))||true).reduce((s,[,v]) => s + (v.workout||0), 0);
            const monthWalks = Object.values(weeklyData).reduce((s,v) => s + (v.walk||0), 0);
            const monthReads = Object.values(weeklyData).reduce((s,v) => s + (v.read||0), 0);

            // Wins
            const wins = daysWithData.filter(d => d.habits.win && d.habits.win.trim().length > 0);

            // Streak best
            let bestStreak = 0, currentStreak = 0;
            allDays.forEach(d => {
              const done = dailyChecks.filter(hk => d.habits[hk]).length;
              if ((done / dailyChecks.length) >= 0.6) { currentStreak++; bestStreak = Math.max(bestStreak, currentStreak); }
              else currentStreak = 0;
            });

            const statCard = (icon, label, value, sub, color) => (
              <div style={{background:`${color}12`,borderRadius:14,padding:"12px 14px",border:`1px solid ${color}30`,textAlign:"center"}}>
                <p style={{fontSize:16,margin:"0 0 2px"}}>{icon}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:22,fontWeight:600,color,margin:0,lineHeight:1}}>{value}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#9070b0",margin:"3px 0 1px",fontWeight:600,textTransform:"uppercase",letterSpacing:0.8}}>{label}</p>
                {sub&&<p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10.5,color:"#a090b8",margin:0}}>{sub}</p>}
              </div>
            );

            return (
              <div style={cardStyle(0.08)}>
                <div style={{marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:20}}>📊</span>
                    <span style={{fontSize:17,fontWeight:500,color:"#1e0e2e"}}>Monthly Report</span>
                  </div>
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#a080c0",marginTop:2,marginLeft:28,fontStyle:"italic"}}>{today.toLocaleString("default",{month:"long",year:"numeric"})} · {totalDays} active days tracked</p>
                </div>

                {totalDays === 0 ? (
                  <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(150,120,180,0.5)",fontStyle:"italic",textAlign:"center",padding:"16px 0"}}>No data yet this month — start checking off habits and your report will build automatically 🌸</p>
                ) : (<>
                  {/* Hero stat */}
                  <div style={{background:"linear-gradient(135deg,rgba(180,140,220,0.2),rgba(160,120,200,0.15))",borderRadius:16,padding:"16px",marginBottom:12,textAlign:"center",border:"1px solid rgba(160,120,200,0.25)"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:48,fontWeight:700,color:"#7050a0",margin:0,lineHeight:1}}>{avgCompletion}%</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9070b0",margin:"4px 0 0",textTransform:"uppercase",letterSpacing:1.5}}>Average Daily Completion</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#b090c0",margin:"4px 0 0",fontStyle:"italic"}}>
                      {avgCompletion >= 80 ? "Outstanding month 🔥" : avgCompletion >= 60 ? "Solid effort — keep building ✨" : avgCompletion >= 40 ? "Good start — push harder next month 💪" : "Every day is a new chance 🌱"}
                    </p>
                  </div>

                  {/* Stats grid */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                    {statCard("🔥","Best Streak",`${bestStreak}d`,"consecutive days","#e8a090")}
                    {statCard("🌡️","Avg Mood",avgMood?`${avgMood}/5`:"—",avgMood?moodLabels[Math.round(parseFloat(avgMood))]:"no data","#90c8a0")}
                    {statCard("🌱","Fiber Days",`${fiberDaysHit}d`,`hit 25g+ goal`,"#80c860")}
                    {statCard("💰","Income",`$${totalIncome.toFixed(0)}`,`${monthIncome.length} entries`,"#90c840")}
                    {statCard("📈","Paper P&L",`${totalPaper>=0?"+":""}$${Math.abs(totalPaper).toFixed(0)}`,`${monthTrades.filter(t=>t.type==="paper").length} trades`,"#7878d0")}
                    {statCard("🏆","Wins",`${wins.length}d`,`days with a win logged`,"#f0b040")}
                  </div>

                  {/* Habit breakdown */}
                  <div style={{background:"rgba(200,180,230,0.1)",borderRadius:14,padding:"14px",marginBottom:12,border:"1px solid rgba(180,150,220,0.2)"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#7050a0",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:1}}>Habit Breakdown</p>
                    {[
                      {k:"vitaminIron",label:"Iron supplement"},
                      {k:"vitaminD",label:"Vitamin D"},
                      {k:"sleep7",label:"7–9hrs sleep"},
                      {k:"skincareAM",label:"AM skincare"},
                      {k:"todayTreatment",label:"PM treatment"},
                      {k:"scalpMassage",label:"Scalp massage"},
                      {k:"jobApps",label:"Job application"},
                      {k:"tradingStudy",label:"Trading study"},
                      {k:"threadsPost",label:"Threads post"},
                      {k:"journaled",label:"Journaled"},
                    ].map(({k,label}) => {
                      const count = habitScores.find(h=>h.key===k)?.count || 0;
                      const pctH = totalDays > 0 ? Math.round((count/totalDays)*100) : 0;
                      const color = pctH >= 80 ? "#60b040" : pctH >= 50 ? "#c0a030" : "#c05050";
                      return (
                        <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#5a4a6a",flex:1,minWidth:120}}>{label}</span>
                          <div style={{flex:2,height:6,borderRadius:3,background:"rgba(200,180,220,0.2)",overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pctH}%`,background:color,borderRadius:3,transition:"width 0.6s ease"}}/>
                          </div>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color,minWidth:36,textAlign:"right"}}>{pctH}%</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Wins log */}
                  {wins.length > 0 && (
                    <div style={{background:"rgba(240,200,100,0.08)",borderRadius:14,padding:"14px",border:"1px solid rgba(220,180,60,0.2)"}}>
                      <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"#9a7020",margin:"0 0 10px",textTransform:"uppercase",letterSpacing:1}}>🏆 Wins This Month</p>
                      {wins.slice(-10).map(d=>(
                        <div key={d.key} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#b09040",minWidth:50,flexShrink:0,marginTop:2}}>{new Date(d.key+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12.5,color:"#3a2a1a",margin:0,lineHeight:1.4}}>{d.habits.win}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>)}
              </div>
            );
          })()}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {l:"Streak",v:`${streak}d ${streakEmoji(streak)}`,s:streak>=7?"Don't break the chain":streak>=1?"Keep going":"Start today",c:"#b890d0"},
              {l:"Today",v:`${pct}%`,s:`${doneCount}/${totalChecks} complete`,c:"#9878c0"},
            ].map(s=>(
              <div key={s.l} style={{...cardStyle(0),marginBottom:0,padding:"15px 16px"}}>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#a080c0",letterSpacing:1.2,textTransform:"uppercase",margin:0}}>{s.l}</p>
                <p style={{fontSize:28,fontWeight:400,color:s.c,margin:"3px 0 2px",fontStyle:"italic"}}>{s.v}</p>
                <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:11.5,color:"#9070b0",margin:0}}>{s.s}</p>
              </div>
            ))}
          </div>
        </>)}

      </div>
    </div>
  );
}