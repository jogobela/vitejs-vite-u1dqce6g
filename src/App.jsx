import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";

/* ═══════════════════════════════════════════════════
   1. PASTE YOUR CONFIG HERE
═══════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyAKLiypuCB0CgGbXtr8E_pbe8YCR59Bqlw",

  authDomain: "eurovision-scoreboard-35d3b.firebaseapp.com",

  projectId: "eurovision-scoreboard-35d3b",

  storageBucket: "eurovision-scoreboard-35d3b.firebasestorage.app",

  messagingSenderId: "994077423968",

  appId: "1:994077423968:web:72e9248e3637671c9f8605"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ═══════════════════════════════════════════════════
   DATA (Kept exactly from your file)
═══════════════════════════════════════════════════ */
const POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12];
const CATS = [
  { key: "SONG",         label: "SONG" },
  { key: "VOCALS",       label: "VOCALS" },
  { key: "COSTUMES",     label: "COSTUMES" },
  { key: "SCENE_DESIGN", label: "SCENE DESIGN" },
  { key: "CHOREOGRAPHY", label: "CHOREOGRAPHY" },
  { key: "OVERALL",      label: "OVERALL IMPRESSION" },
];

const SF1 = [
  { code:"MD", name:"Moldova",       artist:"Satoshi",                          song:"Viva Moldova!",         flag:"🇲🇩", colors:["#003DA5","#FFD200","#CC0001"], competing:true  },
  { code:"SE", name:"Sweden",        artist:"Felicia",                          song:"My System",              flag:"🇸🇪", colors:["#006AA7","#FECC02"],           competing:true  },
  { code:"HR", name:"Croatia",       artist:"Lelek",                            song:"Andromeda",              flag:"🇭🇷", colors:["#FF0000","#FFFFFF","#0093DD"], competing:true  },
  { code:"GR", name:"Greece",        artist:"Akylas",                           song:"Ferto",                  flag:"🇬🇷", colors:["#0D5EAF","#FFFFFF"],           competing:true  },
  { code:"PT", name:"Portugal",      artist:"Bandidos do Cante",                song:"Rosa",                   flag:"🇵🇹", colors:["#006600","#FF0000"],           competing:true  },
  { code:"GE", name:"Georgia",       artist:"Bzikebi",                          song:"On Replay",              flag:"🇬🇪", colors:["#FFFFFF","#FF0000"],           competing:true  },
  { code:"IT", name:"Italy",         artist:"Sal Da Vinci",                     song:"Per sempre si",          flag:"🇮🇹", colors:["#009246","#FFFFFF","#CE2B37"], competing:false, autoQualifier:true },
  { code:"FI", name:"Finland",       artist:"Linda Lampenius & Pete Parkkonen", song:"Liekinheitin",           flag:"🇫🇮", colors:["#003580","#FFFFFF"],           competing:true  },
  { code:"ME", name:"Montenegro",    artist:"Tamara Živković",                  song:"Nova zora",              flag:"🇲🇪", colors:["#D4AF37","#D4312F"],           competing:true  },
  { code:"EE", name:"Estonia",       artist:"Vanilla Ninja",                    song:"Too Epic to Be True",    flag:"🇪🇪", colors:["#0072CE","#000000","#FFFFFF"], competing:true  },
  { code:"IL", name:"Israel",        artist:"Noam Bettan",                      song:"Michelle",               flag:"🇮🇱", colors:["#FFFFFF","#0038B8"],           competing:true  },
  { code:"DE", name:"Germany",       artist:"Sarah Engels",                     song:"Fire",                   flag:"🇩🇪", colors:["#000000","#DD0000","#FFCE00"], competing:false, autoQualifier:true },
  { code:"BE", name:"Belgium",       artist:"Essyla",                           song:"Dancing on the Ice",     flag:"🇧🇪", colors:["#1A1A1A","#FDDA24","#EF3340"], competing:true  },
  { code:"LT", name:"Lithuania",     artist:"Lion Ceecah",                      song:"Sólo quiero más",        flag:"🇱🇹", colors:["#FDB913","#006A44","#C1272D"], competing:true  },
  { code:"SM", name:"San Marino",    artist:"Senhit feat. Boy George",          song:"Superstar",              flag:"🇸🇲", colors:["#5EB6E4","#FFFFFF"],           competing:true  },
  { code:"PL", name:"Poland",        artist:"Alicja",                           song:"Pray",                   flag:"🇵🇱", colors:["#FFFFFF","#DC143C"],           competing:true  },
  { code:"RS", name:"Serbia",        artist:"Lavina",                           song:"Kraj mene",              flag:"🇷🇸", colors:["#C6363C","#0C4076","#FFFFFF"], competing:true  },
];

const SF2 = [
  { code:"BG", name:"Bulgaria",       artist:"DARA",                         song:"Bangaranga",             flag:"🇧🇬", colors:["#FFFFFF","#00966E","#D62612"], competing:true  },
  { code:"AZ", name:"Azerbaijan",     artist:"Jiva",                         song:"Just Go",                flag:"🇦🇿", colors:["#0092BC","#E8192C","#3D9A35"], competing:true  },
  { code:"RO", name:"Romania",        artist:"Alexandra Căpitănescu",        song:"Choke Me",               flag:"🇷🇴", colors:["#002B7F","#FCD116","#CE1126"], competing:true  },
  { code:"LU", name:"Luxembourg",     artist:"Eva Marija",                   song:"Mother Nature",          flag:"🇱🇺", colors:["#EF3340","#FFFFFF","#00A3E0"], competing:true  },
  { code:"CZ", name:"Czechia",        artist:"Daniel Zizka",                 song:"Crossroads",             flag:"🇨🇿", colors:["#D7141A","#FFFFFF","#11457E"], competing:true  },
  { code:"FR", name:"France",         artist:"Monroe",                       song:"Regarde!",               flag:"🇫🇷", colors:["#002395","#FFFFFF","#ED2939"], competing:false, autoQualifier:true },
  { code:"AM", name:"Armenia",        artist:"Simón",                        song:"Paloma rumba",           flag:"🇦🇲", colors:["#D90012","#0033A0","#F2A800"], competing:true  },
  { code:"CH", name:"Switzerland",    artist:"Veronica Fusaro",              song:"Alice",                  flag:"🇨🇭", colors:["#FF0000","#FFFFFF"],           competing:true  },
  { code:"CY", name:"Cyprus",         artist:"Antigoni",                     song:"Jalla",                  flag:"🇨🇾", colors:["#FFFFFF","#CF5300","#4E7F3C"], competing:true  },
  { code:"AT", name:"Austria",        artist:"Cosmó",                        song:"Tanzschien",             flag:"🇦🇹", colors:["#ED2939","#FFFFFF"],           competing:false, autoQualifier:true },
  { code:"LV", name:"Latvia",         artist:"Atvara",                       song:"Ēnā",                    flag:"🇱🇻", colors:["#9E3039","#FFFFFF"],           competing:true  },
  { code:"DK", name:"Denmark",        artist:"Søren Torpegaard Lund",        song:"Før vi går hjem",        flag:"🇩🇰", colors:["#C60C30","#FFFFFF"],           competing:true  },
  { code:"AU", name:"Australia",      artist:"Delta Goodrem",                song:"Eclipse",                flag:"🇦🇺", colors:["#00008B","#CC142B","#FFFFFF"], competing:true  },
  { code:"UA", name:"Ukraine",        artist:"Leléka",                       song:"Ridnym",                 flag:"🇺🇦", colors:["#005BBB","#FFD500"],           competing:true  },
  { code:"GB", name:"United Kingdom", artist:"Look Mum No Computer",         song:"Eins, zwei, drei",       flag:"🇬🇧", colors:["#012169","#C8102E","#FFFFFF"], competing:false, autoQualifier:true },
  { code:"AL", name:"Albania",        artist:"Alis",                         song:"Nân",                    flag:"🇦🇱", colors:["#E41E20","#111111"],           competing:true  },
  { code:"MT", name:"Malta",          artist:"Aidan",                        song:"Bella",                  flag:"🇲🇹", colors:["#FFFFFF","#CF142B"],           competing:true  },
  { code:"NO", name:"Norway",         artist:"Jonas Lovv",                   song:"Ya Ya Ya",               flag:"🇳🇴", colors:["#EF2B2D","#FFFFFF","#002868"], competing:true  },
];

/* ═══════════════════════════════════════════════════
   FIREBASE HELPERS
═══════════════════════════════════════════════════ */
function hasBeenScored(data, sfKey, user, code) {
  const scores = data?.[sfKey]?.[user]?.[code];
  if (!scores) return false;
  return Object.values(scores).some(v => v !== null && v !== undefined);
}

function getCountryTotal(data, sfKey, user, code) {
  return CATS.reduce((sum, cat) => {
    const v = data?.[sfKey]?.[user]?.[code]?.[cat.key];
    return sum + (v !== null && v !== undefined ? v : 0);
  }, 0);
}

function getCatScore(data, sfKey, user, code, catKey) {
  if (user === "__ALL__") {
    return (data?.users ?? []).reduce((sum, u) => {
      const v = data?.[sfKey]?.[u]?.[code]?.[catKey];
      return sum + (v !== null && v !== undefined ? v : 0);
    }, 0);
  }
  const v = data?.[sfKey]?.[user]?.[code]?.[catKey];
  return v !== null && v !== undefined ? v : 0;
}

/* ═══════════════════════════════════════════════════
   STYLE HELPERS (Exactly as original)
═══════════════════════════════════════════════════ */
function makeGradient(colors) {
  if (!colors || colors.length === 0) return "#333";
  if (colors.length === 1) return colors[0];
  const stops = colors.map((c, i) => `${c} ${Math.round(i * 100 / (colors.length - 1))}%`).join(", ");
  return `linear-gradient(135deg, ${stops})`;
}

function injectGlobalStyles() {
  if (document.getElementById("esc26-styles")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Nunito:wght@400;600;700;800&display=swap";
  document.head.appendChild(link);
  const s = document.createElement("style");
  s.id = "esc26-styles";
  s.textContent = `
    * { box-sizing: border-box; }
    body { margin: 0; }
    @keyframes fadeIn   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes shimmer  { 0%,100%{ opacity:.25 } 50%{ opacity:.7 } }
    @keyframes glow     { 0%,100%{ box-shadow:0 0 6px #FFD70055 } 50%{ box-shadow:0 0 18px #FFD700aa } }
    @keyframes toastIn  { from { transform:translateX(110%) } to { transform:translateX(0) } }
    .fcrd:hover { transform:translateY(-6px) scale(1.08) !important; box-shadow:0 10px 30px rgba(93,63,211,.55) !important; cursor:pointer; }
    .fcrd { transition: transform .18s, box-shadow .18s; }
    .scbtn { cursor:pointer; border:none; transition:transform .12s; user-select:none; }
    .scbtn:hover { transform:scale(1.22) !important; }
    .ebtn { transition: filter .15s, transform .15s; cursor:pointer; border:none; }
    .ebtn:hover { filter:brightness(1.15); transform:translateY(-2px); }
    .trow:hover td { background: rgba(255,255,255,0.025) !important; }
    select option { background: #1a0a40; }
  `;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════════
   APP WRAPPER & ATOMS
═══════════════════════════════════════════════════ */
const AppWrap = ({ children }) => (
  <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#050118 0%,#0a0230 45%,#110040 100%)", fontFamily:"'Nunito',sans-serif", color:"#fff", overflowX:"hidden" }}>
    {children}
  </div>
);

const Page = ({ children, wide }) => (
  <div style={{ maxWidth: wide ? 1020 : 700, margin:"0 auto", padding:"14px 12px 56px", animation:"fadeIn .3s ease" }}>
    {children}
  </div>
);

const GoldTitle = ({ children }) => (
  <div style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(16px,4.5vw,26px)", fontWeight:900, background:"linear-gradient(135deg,#FFD700,#FFA500,#FFD700)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:2, textAlign:"center", marginBottom:4 }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height:1, background:"linear-gradient(90deg,transparent,#5d3fd3,#FFD700,#5d3fd3,transparent)", margin:"12px 0" }} />
);

function EBtn({ children, onClick, gold, small, danger, disabled, style = {} }) {
  return (
    <button
      className="ebtn"
      onClick={disabled ? undefined : onClick}
      style={{
        display:"block", width: small ? "auto" : "100%",
        padding: small ? "8px 16px" : "14px 20px",
        background: disabled ? "#333"
                  : danger   ? "linear-gradient(135deg,#7f1d1d,#dc2626)"
                  : gold     ? "linear-gradient(135deg,#b8860b,#FFD700,#daa520)"
                  :            "linear-gradient(135deg,#5d3fd3,#8b5cf6)",
        color: (gold && !disabled) ? "#1a0a00" : "#fff",
        border:"none", borderRadius:12,
        fontSize: small ? 13 : 16, fontWeight:700,
        fontFamily:"'Nunito',sans-serif", letterSpacing:.5,
        marginBottom: small ? 0 : 10,
        opacity: disabled ? .45 : 1,
        cursor: disabled ? "default" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:16, padding:20, marginBottom:16, ...style }}>
      {children}
    </div>
  );
}

function BackBtn({ onClick, label = "← Back" }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"1px solid rgba(255,255,255,.2)", color:"#9b8fc0", borderRadius:8, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>
      {label}
    </button>
  );
}

function Stars() {
  const arr = Array.from({ length: 26 }, (_, i) => ({
    w: Math.random() * 2.5 + 1,
    top: Math.random() * 100,
    left: Math.random() * 100,
    op: Math.random() * .5 + .1,
    dur: Math.random() * 3 + 2,
    del: Math.random() * 4,
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", overflow:"hidden", zIndex:0 }}>
      {arr.map((s,i) => (
        <div key={i} style={{ position:"absolute", width:s.w+"px", height:s.w+"px", background:"#fff", borderRadius:"50%", top:s.top+"%", left:s.left+"%", opacity:s.op, animation:`shimmer ${s.dur}s ease-in-out ${s.del}s infinite` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT APP (Now using Firebase)
═══════════════════════════════════════════════════ */
export default function App() {
  const [page,      setPage]      = useState("home");
  const [semi,      setSemi]      = useState(null);
  const [myName,    setMyName]    = useState("");
  const [data,      setData]      = useState({ users: [], sf1: {}, sf2: {} });
  const [cIdx,      setCIdx]      = useState(0);
  const [resUser,   setResUser]   = useState("__ALL__");
  const [delTarget, setDelTarget] = useState("");
  const [toast,     setToast]     = useState("");

  const sfKey     = semi === 1 ? "sf1" : "sf2";
  const countries = semi === 1 ? SF1 : SF2;

  // Real-time listener for database
  useEffect(() => {
    injectGlobalStyles();
    const savedName = localStorage.getItem("esc2026name_v4");
    if (savedName) setMyName(savedName);

    const dataRef = ref(db, "esc2026_shared");
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setData({
          users: val.users || [],
          sf1: val.sf1 || {},
          sf2: val.sf2 || {}
        });
      }
    });
    return () => unsubscribe();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function updateScore(code, catKey, pts) {
    const scorePath = `esc2026_shared/${sfKey}/${myName}/${code}/${catKey}`;
    set(ref(db, scorePath), pts);
  }

  function handleNameSelect(name) {
    const n = name.trim();
    if (!n) return;
    setMyName(n);
    localStorage.setItem("esc2026name_v4", n);
    
    if (!data.users.includes(n)) {
      const newUsers = [...data.users, n];
      set(ref(db, "esc2026_shared/users"), newUsers);
    }
    setPage("countries");
  }

  function handleDelete() {
    if (!delTarget) return;
    // Remove from user list
    const newUsers = data.users.filter(u => u !== delTarget);
    set(ref(db, "esc2026_shared/users"), newUsers);
    // Remove user data
    remove(ref(db, `esc2026_shared/sf1/${delTarget}`));
    remove(ref(db, `esc2026_shared/sf2/${delTarget}`));
    
    if (myName === delTarget) {
      setMyName("");
      localStorage.removeItem("esc2026name_v4");
      setPage("home");
    }
    showToast(`User "${delTarget}" deleted.`);
    setDelTarget("");
  }

  switch (page) {
    case "home":      return <HomePage onSelect={(s) => { setSemi(s); setPage("name"); }} />;
    case "name":      return <NamePage semi={semi} users={data.users} onSelect={handleNameSelect} onBack={() => setPage("home")} />;
    case "countries": return <CountriesPage semi={semi} myName={myName} countries={countries} data={data} sfKey={sfKey} onCountry={i => { setCIdx(i); setPage("scoring"); }} onResults={() => { setResUser("__ALL__"); setPage("results"); }} onBack={() => setPage("name")} />;
    case "scoring":   return <ScoringPage semi={semi} myName={myName} countries={countries} cIdx={cIdx} setCIdx={setCIdx} data={data} sfKey={sfKey} onScore={updateScore} onBack={() => setPage("countries")} onResults={() => { setResUser("__ALL__"); setPage("results"); }} />;
    case "results":   return <ResultsPage semi={semi} sfKey={sfKey} countries={countries} data={data} resUser={resUser} setResUser={setResUser} delTarget={delTarget} setDelTarget={setDelTarget} onDelete={handleDelete} onBack={() => setPage("countries")} toast={toast} />;
    default:          return null;
  }
}

/* ═══════════════════════════════════════════════════
   PAGES (Exactly as original UI)
═══════════════════════════════════════════════════ */
function HomePage({ onSelect }) {
  return (
    <AppWrap>
      <Stars />
      <div style={{ position:"relative", zIndex:1 }}>
        <Page>
          <div style={{ textAlign:"center", paddingTop:36, paddingBottom:8 }}>
            <div style={{ fontSize:52 }}>🎵</div>
            <GoldTitle>EUROVISION 2026</GoldTitle>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:"#c4a8ff", letterSpacing:4, marginTop:4 }}>SCOREBOARD · VIENNA</div>
          </div>
          <Divider />
          <div style={{ textAlign:"center", fontSize:12, color:"#9b8fc0", letterSpacing:2, textTransform:"uppercase", margin:"24px 0 16px" }}>Select Semi-Final</div>
          <EBtn gold onClick={() => onSelect(1)} style={{ padding:"20px 20px", fontSize:18, borderRadius:16, marginBottom:14 }}>🎤 SEMI-FINAL 1 — May 12</EBtn>
          <EBtn onClick={() => onSelect(2)} style={{ padding:"20px 20px", fontSize:18, borderRadius:16 }}>🎤 SEMI-FINAL 2 — May 14</EBtn>
          <Card style={{ textAlign:"center", borderColor:"rgba(255,215,0,.2)", background:"rgba(255,215,0,.04)", marginTop:4 }}>
            <div style={{ fontSize:12, color:"#9b8fc0", lineHeight:2 }}>
              ✦ Shared real-time scoreboard<br />
              ✦ Scores are saved for all 10 participants<br />
              ✦ Your name is remembered on your device
            </div>
          </Card>
        </Page>
      </div>
    </AppWrap>
  );
}

function NamePage({ semi, users, onSelect, onBack }) {
  const [dropVal, setDropVal] = useState("");
  const [newMode, setNewMode] = useState(users.length === 0);
  const [newInput, setNewInput] = useState("");
  const go = () => newMode ? (newInput.trim() && onSelect(newInput)) : (dropVal && onSelect(dropVal));
  return (
    <AppWrap><Page>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}><BackBtn onClick={onBack} /></div>
      <GoldTitle>WHO IS SCORING?</GoldTitle>
      <Card style={{ marginTop:20 }}>
        {!newMode ? (<>
          <select value={dropVal} onChange={e => e.target.value === "__NEW__" ? setNewMode(true) : setDropVal(e.target.value)} style={{ width:"100%", padding:"13px 14px", background:"#1a0a40", border:"1px solid #5d3fd3", borderRadius:10, color:"#fff", fontSize:15, marginBottom:14 }}>
            <option value="">— Select your name —</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
            <option value="__NEW__">+ Add new name...</option>
          </select>
          <EBtn gold onClick={go} disabled={!dropVal}>Continue →</EBtn>
        </>) : (<>
          <input autoFocus value={newInput} onChange={e => setNewInput(e.target.value)} placeholder="Type your name..." style={{ width:"100%", padding:"12px 14px", background:"#1a0a40", border:"1px solid #5d3fd3", borderRadius:10, color:"#fff", marginBottom:10 }} />
          <EBtn gold onClick={go} disabled={!newInput.trim()}>Continue →</EBtn>
        </>)}
      </Card>
    </Page></AppWrap>
  );
}

function CountriesPage({ semi, myName, countries, data, sfKey, onCountry, onResults, onBack }) {
  const competing = countries.filter(c => c.competing);
  const scoredCount = competing.filter(c => hasBeenScored(data, sfKey, myName, c.code)).length;
  return (
    <AppWrap><Page>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}><BackBtn onClick={onBack} label="← Home" /><div style={{ fontSize:12, color:"#FFD700" }}>👤 {myName}</div><EBtn gold small onClick={onResults}>📊 Results</EBtn></div>
      <GoldTitle>SEMI-FINAL {semi}</GoldTitle>
      <div style={{ height:4, background:"rgba(255,255,255,.1)", borderRadius:2, margin:"8px 0 12px", overflow:"hidden" }}><div style={{ height:"100%", width:`${scoredCount/competing.length*100}%`, background:"#FFD700" }} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(88px,1fr))", gap:10 }}>
        {countries.map((c, idx) => (
          <div key={c.code} className="fcrd" onClick={() => onCountry(idx)} style={{ borderRadius:13, border: hasBeenScored(data, sfKey, myName, c.code) ? "2px solid #5d3fd3" : "2px solid rgba(255,255,255,.1)" }}>
            <div style={{ height:64, background:makeGradient(c.colors), display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>{c.flag}</div>
            <div style={{ background:"#0d0630", padding:5, textAlign:"center", fontSize:10 }}>{c.name}</div>
          </div>
        ))}
      </div>
    </Page></AppWrap>
  );
}

function ScoringPage({ myName, countries, cIdx, setCIdx, data, sfKey, onScore, onBack, onResults }) {
  const c = countries[cIdx];
  const total = getCountryTotal(data, sfKey, myName, c.code);
  return (
    <AppWrap><Page>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}><BackBtn onClick={onBack} /><div style={{ fontSize:11 }}>👤 {myName}</div><EBtn gold small onClick={onResults}>📊</EBtn></div>
      <div style={{ borderRadius:18, overflow:"hidden", marginBottom:14, border:"2px solid #FFD700" }}>
        <div style={{ height:100, background:makeGradient(c.colors), display:"flex", justifyContent:"center", alignItems:"center", fontSize:50 }}>{c.flag}</div>
        <div style={{ background:"#0d0630", padding:10, textAlign:"center" }}><div style={{ fontSize:18, fontWeight:700, color:"#FFD700" }}>{c.name}</div></div>
      </div>
      <Card>
        {CATS.map(cat => {
          const sel = data?.[sfKey]?.[myName]?.[c.code]?.[cat.key] ?? null;
          return (
            <div key={cat.key} style={{ display:"flex", alignItems:"center", marginBottom:10 }}>
              <div style={{ width:100, fontSize:10 }}>{cat.label}</div>
              <div style={{ display:"flex", gap:4, flex:1, flexWrap:"wrap" }}>
                {POINTS.map(pt => (
                  <button key={pt} className="scbtn" onClick={() => onScore(c.code, cat.key, sel === pt ? null : pt)} style={{ width:28, height:28, borderRadius:"50%", background: sel === pt ? "#5d3fd3" : "#333", color:"#fff", fontSize:10 }}>{pt}</button>
                ))}
              </div>
            </div>
          )
        })}
        <div style={{ textAlign:"right", fontSize:24, color:"#FFD700", fontWeight:900 }}>Total: {total}</div>
      </Card>
      <div style={{ display:"flex", gap:10 }}>
        <EBtn onClick={() => cIdx > 0 && setCIdx(cIdx-1)} disabled={cIdx===0}>← Previous</EBtn>
        <EBtn onClick={() => cIdx < countries.length-1 ? setCIdx(cIdx+1) : onBack()}>{cIdx < countries.length-1 ? "Next →" : "Done ✓"}</EBtn>
      </div>
    </Page></AppWrap>
  );
}

function ResultsPage({ semi, sfKey, countries, data, resUser, setResUser, delTarget, setDelTarget, onDelete, onBack, toast }) {
  const ranked = [...countries].map(c => {
    const catVals = CATS.map(cat => getCatScore(data, sfKey, resUser, c.code, cat.key));
    return { ...c, total: catVals.reduce((a,b)=>a+b, 0) };
  }).sort((a,b) => b.total - a.total);

  return (
    <AppWrap><Page wide>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}><BackBtn onClick={onBack} /><GoldTitle>RESULTS</GoldTitle><div style={{ width:60 }} /></div>
      <Card>
        <select value={resUser} onChange={e => setResUser(e.target.value)} style={{ width:"100%", padding:10, background:"#1a0a40", color:"#fff", borderRadius:10 }}>
          <option value="__ALL__">Everyone (Average)</option>
          {data.users.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </Card>
      <table style={{ width:"100%", textAlign:"left" }}>
        <thead><tr style={{ color:"#FFD700" }}><th>#</th><th>Country</th><th>Total</th></tr></thead>
        <tbody>
          {ranked.map((c, i) => (
            <tr key={c.code} style={{ borderBottom:"1px solid #333" }}>
              <td>{i+1}</td>
              <td>{c.flag} {c.name}</td>
              <td style={{ fontWeight:900 }}>{c.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {toast && <div style={{ position:"fixed", bottom:20, right:20, background:"#5d3fd3", padding:10, borderRadius:10 }}>{toast}</div>}
    </Page></AppWrap>
  );
}