import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';

/* ══════════════════════════════════════════════════
   FIREBASE CONFIG
══════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: 'AIzaSyAKLiypuCB0cGgXlr8t_pbe8YCR59Bqlw',
  authDomain: 'eurovision-scoreboard-35d3b.firebaseapp.com',
  databaseURL: 'https://eurovision-scoreboard-35d3b-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'eurovision-scoreboard-35d3b',
  storageBucket: 'eurovision-scoreboard-35d3b.firebasestorage.app',
  messagingSenderId: '994077423968',
  appId: '1:994077423968:web:72e9248e3637671c9f8605',
};
const fbApp = initializeApp(firebaseConfig);
const db = getDatabase(fbApp);

/* ══════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════ */
const POINTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12];
const CATS = [
  { key: 'SONG',         label: 'SONG'               },
  { key: 'VOCALS',       label: 'VOCALS'              },
  { key: 'COSTUMES',     label: 'COSTUMES'            },
  { key: 'SCENE_DESIGN', label: 'SCENE DESIGN'        },
  { key: 'CHOREOGRAPHY', label: 'CHOREOGRAPHY'        },
  { key: 'OVERALL',      label: 'OVERALL IMPRESSION'  },
];

/* ══════════════════════════════════════════════════
   SEMI-FINAL 1
══════════════════════════════════════════════════ */
const SF1 = [
  { code:'MD', name:'Moldova',       artist:'Satoshi',                          song:'Viva Moldova!',        flag:'🇲🇩', colors:['#003DA5','#FFD200','#CC0001'], competing:true  },
  { code:'SE', name:'Sweden',        artist:'Felicia',                          song:'My System',             flag:'🇸🇪', colors:['#006AA7','#FECC02'],           competing:true  },
  { code:'HR', name:'Croatia',       artist:'Lelek',                            song:'Andromeda',             flag:'🇭🇷', colors:['#FF0000','#FFFFFF','#0093DD'], competing:true  },
  { code:'GR', name:'Greece',        artist:'Akylas',                           song:'Ferto',                 flag:'🇬🇷', colors:['#0D5EAF','#FFFFFF'],           competing:true  },
  { code:'PT', name:'Portugal',      artist:'Bandidos do Cante',                song:'Rosa',                  flag:'🇵🇹', colors:['#006600','#FF0000'],           competing:true  },
  { code:'GE', name:'Georgia',       artist:'Bzikebi',                          song:'On Replay',             flag:'🇬🇪', colors:['#FFFFFF','#FF0000'],           competing:true  },
  { code:'IT', name:'Italy',         artist:'Sal Da Vinci',                     song:'Per sempre si',         flag:'🇮🇹', colors:['#009246','#FFFFFF','#CE2B37'], competing:false, autoQualifier:true },
  { code:'FI', name:'Finland',       artist:'Linda Lampenius & Pete Parkkonen', song:'Liekinheitin',          flag:'🇫🇮', colors:['#003580','#FFFFFF'],           competing:true  },
  { code:'ME', name:'Montenegro',    artist:'Tamara Živković',                  song:'Nova zora',             flag:'🇲🇪', colors:['#D4AF37','#D4312F'],           competing:true  },
  { code:'EE', name:'Estonia',       artist:'Vanilla Ninja',                    song:'Too Epic to Be True',   flag:'🇪🇪', colors:['#0072CE','#000000','#FFFFFF'], competing:true  },
  { code:'IL', name:'Israel',        artist:'Noam Bettan',                      song:'Michelle',              flag:'🇮🇱', colors:['#FFFFFF','#0038B8'],           competing:true  },
  { code:'DE', name:'Germany',       artist:'Sarah Engels',                     song:'Fire',                  flag:'🇩🇪', colors:['#000000','#DD0000','#FFCE00'], competing:false, autoQualifier:true },
  { code:'BE', name:'Belgium',       artist:'Essyla',                           song:'Dancing on the Ice',    flag:'🇧🇪', colors:['#1A1A1A','#FDDA24','#EF3340'], competing:true  },
  { code:'LT', name:'Lithuania',     artist:'Lion Ceecah',                      song:'Sólo quiero más',       flag:'🇱🇹', colors:['#FDB913','#006A44','#C1272D'], competing:true  },
  { code:'SM', name:'San Marino',    artist:'Senhit feat. Boy George',          song:'Superstar',             flag:'🇸🇲', colors:['#5EB6E4','#FFFFFF'],           competing:true  },
  { code:'PL', name:'Poland',        artist:'Alicja',                           song:'Pray',                  flag:'🇵🇱', colors:['#FFFFFF','#DC143C'],           competing:true  },
  { code:'RS', name:'Serbia',        artist:'Lavina',                           song:'Kraj mene',             flag:'🇷🇸', colors:['#C6363C','#0C4076','#FFFFFF'], competing:true  },
];

/* ══════════════════════════════════════════════════
   SEMI-FINAL 2
══════════════════════════════════════════════════ */
const SF2 = [
  { code:'BG', name:'Bulgaria',        artist:'DARA',                         song:'Bangaranga',            flag:'🇧🇬', colors:['#FFFFFF','#00966E','#D62612'], competing:true  },
  { code:'AZ', name:'Azerbaijan',      artist:'Jiva',                         song:'Just Go',               flag:'🇦🇿', colors:['#0092BC','#E8192C','#3D9A35'], competing:true  },
  { code:'RO', name:'Romania',         artist:'Alexandra Căpitănescu',        song:'Choke Me',              flag:'🇷🇴', colors:['#002B7F','#FCD116','#CE1126'], competing:true  },
  { code:'LU', name:'Luxembourg',      artist:'Eva Marija',                   song:'Mother Nature',         flag:'🇱🇺', colors:['#EF3340','#FFFFFF','#00A3E0'], competing:true  },
  { code:'CZ', name:'Czechia',         artist:'Daniel Zizka',                 song:'Crossroads',            flag:'🇨🇿', colors:['#D7141A','#FFFFFF','#11457E'], competing:true  },
  { code:'FR', name:'France',          artist:'Monroe',                       song:'Regarde!',              flag:'🇫🇷', colors:['#002395','#FFFFFF','#ED2939'], competing:false, autoQualifier:true },
  { code:'AM', name:'Armenia',         artist:'Simón',                        song:'Paloma rumba',          flag:'🇦🇲', colors:['#D90012','#0033A0','#F2A800'], competing:true  },
  { code:'CH', name:'Switzerland',     artist:'Veronica Fusaro',              song:'Alice',                 flag:'🇨🇭', colors:['#FF0000','#FFFFFF'],           competing:true  },
  { code:'CY', name:'Cyprus',          artist:'Antigoni',                     song:'Jalla',                 flag:'🇨🇾', colors:['#FFFFFF','#CF5300','#4E7F3C'], competing:true  },
  { code:'AT', name:'Austria',         artist:'Cosmó',                        song:'Tanzschein',            flag:'🇦🇹', colors:['#ED2939','#FFFFFF'],           competing:false, autoQualifier:true },
  { code:'LV', name:'Latvia',          artist:'Atvara',                       song:'Ēnā',                   flag:'🇱🇻', colors:['#9E3039','#FFFFFF'],           competing:true  },
  { code:'DK', name:'Denmark',         artist:'Søren Torpegaard Lund',        song:'Før vi går hjem',       flag:'🇩🇰', colors:['#C60C30','#FFFFFF'],           competing:true  },
  { code:'AU', name:'Australia',       artist:'Delta Goodrem',                song:'Eclipse',               flag:'🇦🇺', colors:['#00008B','#CC142B','#FFFFFF'], competing:true  },
  { code:'UA', name:'Ukraine',         artist:'Leléka',                       song:'Ridnym',                flag:'🇺🇦', colors:['#005BBB','#FFD500'],           competing:true  },
  { code:'GB', name:'United Kingdom',  artist:'Look Mum No Computer',         song:'Eins, zwei, drei',      flag:'🇬🇧', colors:['#012169','#C8102E','#FFFFFF'], competing:false, autoQualifier:true },
  { code:'AL', name:'Albania',         artist:'Alis',                         song:'Nân',                   flag:'🇦🇱', colors:['#E41E20','#111111'],           competing:true  },
  { code:'MT', name:'Malta',           artist:'Aidan',                        song:'Bella',                 flag:'🇲🇹', colors:['#FFFFFF','#CF142B'],           competing:true  },
  { code:'NO', name:'Norway',          artist:'Jonas Lovv',                   song:'Ya Ya Ya',              flag:'🇳🇴', colors:['#EF2B2D','#FFFFFF','#002868'], competing:true  },
];

/* ══════════════════════════════════════════════════
   GRAND FINAL
══════════════════════════════════════════════════ */
const FINAL = [
  { code:'DK', name:'Denmark',        artist:'Søren Torpegaard Lund',       song:'Før vi går hjem',       flag:'🇩🇰', colors:['#C60C30','#FFFFFF'] },
  { code:'DE', name:'Germany',        artist:'Sarah Engels',                song:'Fire',                  flag:'🇩🇪', colors:['#000000','#DD0000','#FFCE00'] },
  { code:'IL', name:'Israel',         artist:'Noam Bettan',                 song:'Michelle',              flag:'🇮🇱', colors:['#FFFFFF','#0038B8'] },
  { code:'BE', name:'Belgium',        artist:'Essyla',                      song:'Dancing on the Ice',    flag:'🇧🇪', colors:['#1A1A1A','#FDDA24','#EF3340'] },
  { code:'AL', name:'Albania',        artist:'Alis',                        song:'Nân',                   flag:'🇦🇱', colors:['#E41E20','#111111'] },
  { code:'GR', name:'Greece',         artist:'Akylas',                      song:'Ferto',                 flag:'🇬🇷', colors:['#0D5EAF','#FFFFFF'] },
  { code:'UA', name:'Ukraine',        artist:'Leléka',                      song:'Ridnym',                flag:'🇺🇦', colors:['#005BBB','#FFD500'] },
  { code:'AU', name:'Australia',      artist:'Delta Goodrem',               song:'Eclipse',               flag:'🇦🇺', colors:['#00008B','#CC142B','#FFFFFF'] },
  { code:'RS', name:'Serbia',         artist:'Lavina',                      song:'Kraj mene',             flag:'🇷🇸', colors:['#C6363C','#0C4076','#FFFFFF'] },
  { code:'MT', name:'Malta',          artist:'Aidan',                       song:'Bella',                 flag:'🇲🇹', colors:['#FFFFFF','#CF142B'] },
  { code:'CZ', name:'Czechia',        artist:'Daniel Zizka',                song:'Crossroads',            flag:'🇨🇿', colors:['#D7141A','#FFFFFF','#11457E'] },
  { code:'BG', name:'Bulgaria',       artist:'DARA',                        song:'Bangaranga',            flag:'🇧🇬', colors:['#FFFFFF','#00966E','#D62612'] },
  { code:'HR', name:'Croatia',        artist:'Lelek',                       song:'Andromeda',             flag:'🇭🇷', colors:['#FF0000','#FFFFFF','#0093DD'] },
  { code:'GB', name:'United Kingdom', artist:'Look Mum No Computer',        song:'Eins, zwei, drei',      flag:'🇬🇧', colors:['#012169','#C8102E','#FFFFFF'] },
  { code:'FR', name:'France',         artist:'Monroe',                      song:'Regarde!',              flag:'🇫🇷', colors:['#002395','#FFFFFF','#ED2939'] },
  { code:'MD', name:'Moldova',        artist:'Satoshi',                     song:'Viva Moldova!',         flag:'🇲🇩', colors:['#003DA5','#FFD200','#CC0001'] },
  { code:'FI', name:'Finland',        artist:'Linda Lampenius & Pete Parkkonen', song:'Liekinheitin',    flag:'🇫🇮', colors:['#003580','#FFFFFF'] },
  { code:'PL', name:'Poland',         artist:'Alicja',                      song:'Pray',                  flag:'🇵🇱', colors:['#FFFFFF','#DC143C'] },
  { code:'LT', name:'Lithuania',      artist:'Lion Ceecah',                 song:'Sólo quiero más',       flag:'🇱🇹', colors:['#FDB913','#006A44','#C1272D'] },
  { code:'SE', name:'Sweden',         artist:'Felicia',                     song:'My System',             flag:'🇸🇪', colors:['#006AA7','#FECC02'] },
  { code:'CY', name:'Cyprus',         artist:'Antigoni',                    song:'Jalla',                 flag:'🇨🇾', colors:['#FFFFFF','#CF5300','#4E7F3C'] },
  { code:'IT', name:'Italy',          artist:'Sal Da Vinci',                song:'Per sempre si',         flag:'🇮🇹', colors:['#009246','#FFFFFF','#CE2B37'] },
  { code:'NO', name:'Norway',         artist:'Jonas Lovv',                  song:'Ya Ya Ya',              flag:'🇳🇴', colors:['#EF2B2D','#FFFFFF','#002868'] },
  { code:'RO', name:'Romania',        artist:'Alexandra Căpitănescu',       song:'Choke Me',              flag:'🇷🇴', colors:['#002B7F','#FCD116','#CE1126'] },
  { code:'AT', name:'Austria',        artist:'Cosmó',                       song:'Tanzschein',            flag:'🇦🇹', colors:['#ED2939','#FFFFFF'] },
];

/* ══════════════════════════════════════════════════
   EUROVISION ASIA — NATIONAL FINALS
   isArtist:true marks participant objects so
   components know to display name/song differently.
   Updated schedule (Aug–Nov 2026):
   - Bhutan: 11 Aug (unchanged, already voted)
   - Philippines: 30 Aug — full lineup added
   - South Korea: 4 Sep
   - Nepal: 19 Sep
   - Laos: 23–24 Sep
   - Thailand: 27 Sep
   - Bangladesh: 30 Sep
   - Vietnam: 3 Oct
   - Mongolia: 10 Oct (new)
   - Malaysia: no national final — artist Aina Abdul
     already internally selected, song not yet released
   - Cambodia: TBA
   - 14 Nov: The 1st Eurovision Song Contest Asia (grand final)
══════════════════════════════════════════════════ */
const ASIA_NATIONALS = [
  {
    id: 'bhutan', name: 'Bhutan', show: 'Rhythm of Bhutan',
    date: '11 August 2026', flag: '🇧🇹',
    colors: ['#FF6B00','#FFD700'],
    participants: [
      { code:'karma',   name:'Karma Drupchu',          song:'Pha Yuel',            subtitle:'The Homeland',  colors:['#92400E','#FCD34D'], isArtist:true },
      { code:'sangay',  name:'The Sangay Lhaden Band', song:'Pemi Tshewang Tashi', subtitle:'The Legend',    colors:['#7F1D1D','#FCA5A5'], isArtist:true },
      { code:'nyendra', name:'Nyendra',                song:'Lhayi Semo',           subtitle:'The Angel',    colors:['#4C1D95','#C4B5FD'], isArtist:true },
      { code:'pelden',  name:'Pelden Wangchuk',        song:"Jo'Druel",            subtitle:'The Journey',  colors:['#1E3A5F','#93C5FD'], isArtist:true },
      { code:'baeyul',  name:'Baeyul301',              song:'Drenpa',              subtitle:'The Memories', colors:['#14532D','#86EFAC'], isArtist:true },
    ],
  },
  {
    id: 'philippines', name: 'Philippines', show: 'Philippine Selection Night',
    date: '30 August 2026', flag: '🇵🇭',
    colors: ['#0038A8','#CE1126'],
    participants: [
      { code:'dna',          name:'DNA',                                                     song:'Between Bituin',        colors:['#0038A8','#93C5FD'], isArtist:true },
      { code:'saga',         name:'SAGA',                                                     song:'Broken Beyond Repair',  colors:['#7F1D1D','#FCA5A5'], isArtist:true },
      { code:'cherie',       name:'Elha Nympha, Esang de Torres, Lance Reblando & Nar Cabico', song:"Cheri(e)",             colors:['#CE1126','#FCD34D'], isArtist:true },
      { code:'diyan',        name:'Jason Dy & Sassa Dagdag',                                   song:'Di Yan (Red Flag)',    colors:['#B91C1C','#111111'], isArtist:true },
      { code:'goodforyou',   name:'Ryssi Avila',                                               song:'Good For You',         colors:['#FBBF24','#92400E'], isArtist:true },
      { code:'makeitexist',  name:'AJAA',                                                      song:'Make It Exist',        colors:['#4C1D95','#C4B5FD'], isArtist:true },
      { code:'mapadama',     name:'JM dela Cerna & Marielle Montellano',                       song:'Mapadama',             colors:['#0F766E','#5EEAD4'], isArtist:true },
      { code:'reasontolive', name:'KHIMO',                                                     song:'Reason to Live',       colors:['#1E3A5F','#93C5FD'], isArtist:true },
      { code:'roundnround',  name:"VVINK & WRIVE Russu",                                       song:"Round N' Round",       colors:['#DA251D','#FFCD00'], isArtist:true },
      { code:'sobrasobra',   name:'CARMELLE',                                                  song:'Sobra-Sobra',          colors:['#EC4899','#FBCFE8'], isArtist:true },
    ],
  },
  { id:'southkorea',  name:'South Korea', show:"Korea's Next Wave",           date:'4 September 2026',        flag:'🇰🇷', colors:['#CD2E3A','#003478'], participants:[] },
  { id:'nepal',       name:'Nepal',       show:'Nepal Decides',               date:'19 September 2026',       flag:'🇳🇵', colors:['#003893','#DC143C'], participants:[] },
  { id:'laos',        name:'Laos',        show:'Sieng Lao: The One',         date:'23–24 September 2026',     flag:'🇱🇦', colors:['#CE1126','#003DA5'], participants:[] },
  { id:'thailand',    name:'Thailand',    show:"Thailand's Chosen One",       date:'27 September 2026',       flag:'🇹🇭', colors:['#A51931','#002868'], participants:[] },
  { id:'bangladesh',  name:'Bangladesh',  show:'Voice of Bangladesh',         date:'30 September 2026',       flag:'🇧🇩', colors:['#006A4E','#F42A41'], participants:[] },
  { id:'vietnam',     name:'Vietnam',     show:'TBA',                         date:'3 October 2026',          flag:'🇻🇳', colors:['#DA251D','#FFCD00'], participants:[] },
  { id:'mongolia',    name:'Mongolia',    show:'TBA',                         date:'10 October 2026',         flag:'🇲🇳', colors:['#C4272F','#015197'], participants:[] },
  { id:'malaysia',    name:'Malaysia',    show:'No national final — Aina Abdul internally selected (song TBA)', date:'—', flag:'🇲🇾', colors:['#CC0001','#003DA5'], participants:[] },
  { id:'cambodia',    name:'Cambodia',    show:'TBA',                         date:'TBA',                     flag:'🇰🇭', colors:['#032EA1','#E00025'], participants:[] },
];

/* ══════════════════════════════════════════════════
   ROUTING HELPERS
══════════════════════════════════════════════════ */
function sfKeyFromSemi(semi, asiaShow) {
  if (semi === 1) return 'sf1';
  if (semi === 2) return 'sf2';
  if (semi === 3) return 'final';
  if (semi === 'asia' && asiaShow) return `asia_${asiaShow}`;
  return 'sf1';
}

function countriesFromSemi(semi, asiaShow) {
  if (semi === 1) return SF1;
  if (semi === 2) return SF2;
  if (semi === 3) return FINAL;
  if (semi === 'asia' && asiaShow) {
    const nat = ASIA_NATIONALS.find(n => n.id === asiaShow);
    return nat ? nat.participants : [];
  }
  return [];
}

function getEventTitle(semi, asiaShow) {
  if (semi === 1) return 'SEMI-FINAL 1';
  if (semi === 2) return 'SEMI-FINAL 2';
  if (semi === 3) return 'GRAND FINAL';
  if (semi === 'asia' && asiaShow) {
    const nat = ASIA_NATIONALS.find(n => n.id === asiaShow);
    return nat ? nat.show.toUpperCase() : 'EUROVISION ASIA';
  }
  return '';
}

function getEventShort(semi, asiaShow) {
  if (semi === 1) return 'Semi-Final 1';
  if (semi === 2) return 'Semi-Final 2';
  if (semi === 3) return 'Grand Final';
  if (semi === 'asia' && asiaShow) {
    const nat = ASIA_NATIONALS.find(n => n.id === asiaShow);
    return nat ? nat.show : 'Eurovision Asia';
  }
  return '';
}

/* ══════════════════════════════════════════════════
   SCORE HELPERS
══════════════════════════════════════════════════ */
function hasBeenScored(data, sfKey, user, code) {
  const entry = data?.[sfKey]?.[user]?.[code];
  if (!entry) return false;
  return Object.values(entry).some(v => v !== null && v !== undefined);
}

function getCountryTotal(data, sfKey, user, code) {
  return CATS.reduce((sum, cat) => {
    const v = data?.[sfKey]?.[user]?.[code]?.[cat.key];
    return sum + (v !== null && v !== undefined ? Number(v) : 0);
  }, 0);
}

function getCatScore(data, sfKey, user, code, catKey) {
  if (user === '__ALL__') {
    return (data?.users ?? []).reduce((sum, u) => {
      const v = data?.[sfKey]?.[u]?.[code]?.[catKey];
      return sum + (v !== null && v !== undefined ? Number(v) : 0);
    }, 0);
  }
  const v = data?.[sfKey]?.[user]?.[code]?.[catKey];
  return v !== null && v !== undefined ? Number(v) : 0;
}

/* ══════════════════════════════════════════════════
   STYLE UTILITIES
══════════════════════════════════════════════════ */
function makeGradient(colors) {
  if (!colors?.length) return '#333';
  if (colors.length === 1) return colors[0];
  const stops = colors.map((c, i) => `${c} ${Math.round((i * 100) / (colors.length - 1))}%`).join(', ');
  return `linear-gradient(135deg, ${stops})`;
}

function injectStyles() {
  if (document.getElementById('esc26')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Nunito:wght@400;600;700;800&display=swap';
  document.head.appendChild(link);
  const s = document.createElement('style');
  s.id = 'esc26';
  s.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #050118; }
    @keyframes fadeIn  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    @keyframes shimmer { 0%,100% { opacity:.2 } 50% { opacity:.65 } }
    @keyframes glow    { 0%,100% { box-shadow:0 0 6px #FFD70055 } 50% { box-shadow:0 0 22px #FFD700aa } }
    @keyframes spin    { to { transform: rotate(360deg) } }
    @keyframes toast   { from { transform:translateX(120%) } to { transform:translateX(0) } }
    .fcrd { cursor:pointer; transition: transform .18s, box-shadow .18s; }
    .fcrd:hover { transform:translateY(-6px) scale(1.07); box-shadow:0 10px 28px rgba(93,63,211,.6); }
    .scbtn {
      cursor: pointer !important; border: none;
      display: inline-flex; align-items: center; justify-content: center;
      transition: transform .1s, background .1s;
      user-select: none; -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent; touch-action: manipulation;
      position: relative; z-index: 1;
    }
    .scbtn:hover  { transform: scale(1.18); }
    .scbtn:active { transform: scale(.88); }
    .ebtn { cursor: pointer; border: none; transition: filter .15s, transform .12s; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
    .ebtn:hover  { filter: brightness(1.13); transform: translateY(-2px); }
    .ebtn:active { transform: scale(.97); }
    .trow:hover td { background: rgba(255,255,255,.03) !important; }
    select option  { background: #1a0a40; }
  `;
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════
   UI ATOMS
══════════════════════════════════════════════════ */
const Wrap = ({ children }) => (
  <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#050118 0%,#0a0230 45%,#110040 100%)', fontFamily:"'Nunito',sans-serif", color:'#fff', overflowX:'hidden' }}>
    {children}
  </div>
);

const Page = ({ children, wide }) => (
  <div style={{ maxWidth: wide ? 1020 : 660, margin:'0 auto', padding:'16px 12px 56px', animation:'fadeIn .3s ease' }}>
    {children}
  </div>
);

const GoldTitle = ({ children }) => (
  <div style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(17px,4.5vw,26px)', fontWeight:900, background:'linear-gradient(135deg,#FFD700,#FFA500,#FFD700)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', textAlign:'center', marginBottom:6 }}>
    {children}
  </div>
);

const Divider = () => (
  <div style={{ height:1, background:'linear-gradient(90deg,transparent,#5d3fd3,#FFD700,#5d3fd3,transparent)', margin:'12px 0' }} />
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:'rgba(255,255,255,.055)', border:'1px solid rgba(255,255,255,.1)', borderRadius:16, padding:20, marginBottom:14, ...style }}>
    {children}
  </div>
);

function Btn({ children, onClick, gold, small, danger, disabled, style = {} }) {
  return (
    <button type="button" className="ebtn" onClick={disabled ? undefined : onClick} style={{
      display:'block', width: small ? 'auto' : '100%',
      padding: small ? '8px 18px' : '14px 20px',
      borderRadius:12, fontSize: small ? 13 : 16, fontWeight:800,
      fontFamily:"'Nunito',sans-serif", letterSpacing:.4,
      marginBottom: small ? 0 : 10, opacity: disabled ? .4 : 1,
      background: disabled ? '#1e1040' : danger ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : gold ? 'linear-gradient(135deg,#b8860b,#FFD700,#daa520)' : 'linear-gradient(135deg,#5d3fd3,#8b5cf6)',
      color: gold && !disabled ? '#1a0a00' : '#fff',
      ...style,
    }}>
      {children}
    </button>
  );
}

function BackBtn({ onClick, label = '← Back' }) {
  return (
    <button type="button" className="ebtn" onClick={onClick} style={{ background:'none', border:'1px solid rgba(255,255,255,.2)', color:'#9b8fc0', borderRadius:8, padding:'5px 12px', fontSize:12, fontFamily:"'Nunito',sans-serif" }}>
      {label}
    </button>
  );
}

const STARS = Array.from({ length: 28 }, (_, i) => ({
  w:   (Math.sin(i * 3.7) * 0.5 + 0.5) * 2.5 + 0.8,
  top: (Math.sin(i * 1.3) * 0.5 + 0.5) * 100,
  left:(Math.cos(i * 1.7) * 0.5 + 0.5) * 100,
  op:  (Math.sin(i * 2.1) * 0.5 + 0.5) * 0.55 + 0.08,
  dur: (Math.sin(i)       * 0.5 + 0.5) * 3 + 2,
  del: (Math.cos(i)       * 0.5 + 0.5) * 4,
}));

const Stars = () => (
  <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
    {STARS.map((s, i) => (
      <div key={i} style={{ position:'absolute', width:s.w+'px', height:s.w+'px', background:'#fff', borderRadius:'50%', top:s.top+'%', left:s.left+'%', opacity:s.op, animation:`shimmer ${s.dur}s ease-in-out ${s.del}s infinite` }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════ */
export default function App() {
  const [page,      setPage]      = useState('home');
  const [semi,      setSemi]      = useState(1);
  const [asiaShow,  setAsiaShow]  = useState(null);
  const [myName,    setMyName]    = useState(() => { try { return localStorage.getItem('esc26_user') || ''; } catch { return ''; } });
  const [data,      setData]      = useState({ users:[], sf1:{}, sf2:{}, final:{} });
  const [connected, setConnected] = useState(false);
  const [cIdx,      setCIdx]      = useState(0);
  const [resUser,   setResUser]   = useState('__ALL__');
  const [delTarget, setDelTarget] = useState('');
  const [toast,     setToast]     = useState('');

  const sfKey     = sfKeyFromSemi(semi, asiaShow);
  const countries = countriesFromSemi(semi, asiaShow);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const dbRef = ref(db, 'esc2026');
    const unsub = onValue(dbRef, snap => {
      setData(snap.val() ?? { users:[], sf1:{}, sf2:{}, final:{} });
      setConnected(true);
    }, err => { console.error(err); setConnected(true); });
    return () => unsub();
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function updateScore(code, catKey, pts) {
    if (!myName) return;
    const path = `esc2026/${sfKey}/${myName}/${code}/${catKey}`;
    if (pts === null) remove(ref(db, path)).catch(console.error);
    else              set(ref(db, path), pts).catch(console.error);
  }

  function handleNameSelect(name) {
    const n = name.trim();
    if (!n) return;
    setMyName(n);
    try { localStorage.setItem('esc26_user', n); } catch {}
    const current = Array.isArray(data?.users) ? data.users : [];
    if (!current.includes(n)) set(ref(db, 'esc2026/users'), [...current, n]).catch(console.error);
    setCIdx(0);
    setPage('countries');
  }

  function handleDelete() {
    if (!delTarget) return;
    const newUsers = (Array.isArray(data?.users) ? data.users : []).filter(u => u !== delTarget);
    set(ref(db, 'esc2026/users'), newUsers).catch(console.error);
    remove(ref(db, `esc2026/sf1/${delTarget}`)).catch(console.error);
    remove(ref(db, `esc2026/sf2/${delTarget}`)).catch(console.error);
    remove(ref(db, `esc2026/final/${delTarget}`)).catch(console.error);
    ASIA_NATIONALS.forEach(nat => remove(ref(db, `esc2026/asia_${nat.id}/${delTarget}`)).catch(console.error));
    if (myName === delTarget) {
      setMyName('');
      try { localStorage.removeItem('esc26_user'); } catch {}
      setPage('home');
    }
    showToast(`User "${delTarget}" deleted.`);
    setDelTarget('');
  }

  function handleNationalSelect(natId) {
    setAsiaShow(natId);
    setSemi('asia');
    setPage('name');
  }

  if (!connected) return (
    <Wrap>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:20 }}>
        <div style={{ width:44, height:44, border:'3px solid rgba(255,215,0,.2)', borderTopColor:'#FFD700', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
        <div style={{ color:'#9b8fc0', fontSize:13, letterSpacing:3 }}>CONNECTING TO DATABASE…</div>
      </div>
    </Wrap>
  );

  const nameBack = () => semi === 'asia' ? setPage('asia_home') : setPage('home');

  if (page === 'home')      return <HomePage onSelect={sf => { setSemi(sf); setPage('name'); }} onSelectAsia={() => setPage('asia_home')} />;
  if (page === 'asia_home') return <AsiaHomePage onSelect={handleNationalSelect} onBack={() => setPage('home')} />;
  if (page === 'name')      return <NamePage semi={semi} asiaShow={asiaShow} users={Array.isArray(data.users) ? data.users : []} savedName={myName} onSelect={handleNameSelect} onBack={nameBack} />;
  if (page === 'countries') return <CountriesPage semi={semi} asiaShow={asiaShow} myName={myName} countries={countries} data={data} sfKey={sfKey} onCountry={i => { setCIdx(i); setPage('scoring'); }} onResults={() => { setResUser('__ALL__'); setPage('results'); }} onBack={() => setPage('name')} />;
  if (page === 'scoring')   return <ScoringPage myName={myName} countries={countries} cIdx={cIdx} setCIdx={setCIdx} data={data} sfKey={sfKey} onScore={updateScore} onBack={() => setPage('countries')} onResults={() => { setResUser('__ALL__'); setPage('results'); }} />;
  if (page === 'results')   return <ResultsPage semi={semi} asiaShow={asiaShow} sfKey={sfKey} countries={countries} data={data} resUser={resUser} setResUser={setResUser} delTarget={delTarget} setDelTarget={setDelTarget} onDelete={handleDelete} onBack={() => setPage('countries')} toast={toast} noSeparator={semi === 3 || semi === 'asia'} />;
  return null;
}

/* ══════════════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════════════ */
function HomePage({ onSelect, onSelectAsia }) {
  return (
    <Wrap>
      <Stars />
      <div style={{ position:'relative', zIndex:1 }}>
        <Page>
          <div style={{ textAlign:'center', paddingTop:36, paddingBottom:8 }}>
            <div style={{ fontSize:52, lineHeight:1 }}>🎵</div>
            <div style={{ marginTop:12 }}><GoldTitle>EUROVISION SCOREBOARD</GoldTitle></div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:'#c4a8ff', letterSpacing:4, marginTop:4 }}>VIENNA 2026 · ASIA 2026</div>
          </div>
          <Divider />
          <div style={{ textAlign:'center', fontSize:12, color:'#9b8fc0', letterSpacing:2, textTransform:'uppercase', margin:'22px 0 14px' }}>
            Select Event
          </div>

          {/* Grand Final — most prominent */}
          <Btn gold onClick={() => onSelect(3)} style={{ padding:20, fontSize:18, borderRadius:16, marginBottom:12, border:'2px solid rgba(255,215,0,.4)', boxShadow:'0 0 24px rgba(255,215,0,.18)' }}>
            ⭐ GRAND FINAL — May 17
            <div style={{ fontSize:10, fontWeight:600, marginTop:5, opacity:.8 }}>
              25 countries · Denmark · Germany · Israel · Belgium · Albania · Greece · Ukraine · Australia · Serbia · Malta · Czechia · Bulgaria · Croatia · United Kingdom · France · Moldova · Finland · Poland · Lithuania · Sweden · Cyprus · Italy · Norway · Romania · Austria
            </div>
          </Btn>

          <Btn onClick={() => onSelect(1)} style={{ padding:'14px 20px', fontSize:15, borderRadius:14, marginBottom:10, opacity:.8 }}>
            🎤 Semi-Final 1 — May 12
            <div style={{ fontSize:10, fontWeight:600, marginTop:4, opacity:.8 }}>Moldova · Sweden · Croatia · Greece · Portugal · Georgia · Finland · Montenegro · Estonia · Israel · Belgium · Lithuania · San Marino · Poland · Serbia</div>
          </Btn>

          <Btn onClick={() => onSelect(2)} style={{ padding:'14px 20px', fontSize:15, borderRadius:14, marginBottom:18, opacity:.8 }}>
            🎤 Semi-Final 2 — May 14
            <div style={{ fontSize:10, fontWeight:600, marginTop:4, opacity:.8 }}>Bulgaria · Azerbaijan · Romania · Luxembourg · Czechia · Armenia · Switzerland · Cyprus · Latvia · Denmark · Australia · Ukraine · Albania · Malta · Norway</div>
          </Btn>

          {/* Divider between Eurovision and Eurovision Asia */}
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(0,180,120,.5),rgba(0,180,120,.5),transparent)', margin:'4px 0 16px' }} />

          {/* Eurovision Asia */}
          <button type="button" className="ebtn" onClick={onSelectAsia} style={{
            display:'block', width:'100%', padding:20, borderRadius:16, marginBottom:10, border:'none',
            background:'linear-gradient(135deg,#064e3b,#065f46,#047857)',
            fontFamily:"'Nunito',sans-serif", cursor:'pointer', textAlign:'left',
            boxShadow:'0 0 20px rgba(4,120,87,.3)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:32 }}>🌏</span>
              <div>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:900, color:'#6EE7B7', letterSpacing:1 }}>EUROVISION ASIA</div>
                <div style={{ fontSize:11, color:'rgba(110,231,183,.75)', marginTop:3, fontWeight:600 }}>10 National Finals · Aug – Nov 2026</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.55)', marginTop:2 }}>Bhutan · Philippines · South Korea · Nepal · Laos · Thailand · Bangladesh · Vietnam · Mongolia · Malaysia · Cambodia</div>
              </div>
            </div>
          </button>

          <Card style={{ textAlign:'center', borderColor:'rgba(255,215,0,.2)', background:'rgba(255,215,0,.04)', marginTop:6 }}>
            <div style={{ fontSize:12, color:'#9b8fc0', lineHeight:2 }}>
              ✦ Each person scores independently<br />
              ✦ All scores sync in real time for everyone with the link<br />
              ✦ Your name is remembered next time you open the link
            </div>
          </Card>
        </Page>
      </div>
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   ASIA HOME PAGE — list of national finals
══════════════════════════════════════════════════ */
function AsiaHomePage({ onSelect, onBack }) {
  return (
    <Wrap>
      <Page>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <BackBtn onClick={onBack} />
          <div style={{ fontSize:12, color:'#6EE7B7', fontWeight:700 }}>Eurovision Asia</div>
          <div style={{ width:60 }} />
        </div>

        <div style={{ textAlign:'center', paddingTop:16, paddingBottom:8 }}>
          <div style={{ fontSize:44, lineHeight:1 }}>🌏</div>
          <div style={{ marginTop:10 }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(17px,4.5vw,26px)', fontWeight:900, background:'linear-gradient(135deg,#6EE7B7,#34D399,#6EE7B7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', textAlign:'center', marginBottom:4 }}>
              EUROVISION ASIA
            </div>
          </div>
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:11, color:'#6EE7B7', opacity:.7, letterSpacing:4, marginTop:4 }}>NATIONAL FINALS 2026</div>
        </div>
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,#065f46,#6EE7B7,#065f46,transparent)', margin:'12px 0 20px' }} />

        <div style={{ textAlign:'center', fontSize:12, color:'#9b8fc0', letterSpacing:2, textTransform:'uppercase', marginBottom:16 }}>
          Select National Final
        </div>

        {ASIA_NATIONALS.map(nat => {
          const hasArtists = nat.participants.length > 0;
          return (
            <div key={nat.id} style={{ marginBottom:8 }}>
              <button type="button" className={hasArtists ? 'ebtn' : ''} onClick={() => hasArtists && onSelect(nat.id)}
                style={{
                  display:'block', width:'100%', padding:'13px 16px', borderRadius:12, border:'none',
                  background: hasArtists ? makeGradient(nat.colors) : 'rgba(255,255,255,0.04)',
                  opacity: hasArtists ? 1 : 0.5,
                  cursor: hasArtists ? 'pointer' : 'default',
                  fontFamily:"'Nunito',sans-serif",
                  border: hasArtists ? 'none' : '1px solid rgba(255,255,255,.08)',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:26, flexShrink:0 }}>{nat.flag}</span>
                  <div style={{ flex:1, textAlign:'left' }}>
                    <div style={{ fontSize:14, fontWeight:800, color:'#fff', textShadow: hasArtists ? '0 1px 4px rgba(0,0,0,.4)' : 'none' }}>{nat.name}</div>
                    <div style={{ fontSize:10, marginTop:2, color: hasArtists ? 'rgba(255,255,255,.8)' : '#6b5fa0', fontWeight:600 }}>
                      {nat.show !== 'TBA' ? nat.show : 'Show TBA'}
                      {nat.date !== 'TBA' && nat.date !== '—' ? ` · ${nat.date}` : nat.date === 'TBA' ? ' · Date TBA' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color: hasArtists ? 'rgba(255,255,255,.85)' : '#6b5fa0', flexShrink:0 }}>
                    {hasArtists ? `${nat.participants.length} artists →` : 'Coming Soon'}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </Page>
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   NAME PAGE
══════════════════════════════════════════════════ */
function NamePage({ semi, asiaShow, users, savedName, onSelect, onBack }) {
  const [dropVal,  setDropVal]  = useState(savedName || '');
  const [newMode,  setNewMode]  = useState(users.length === 0);
  const [newInput, setNewInput] = useState('');

  const eventLabel = getEventShort(semi, asiaShow);
  const isAsia     = semi === 'asia';

  function handleDrop(val) {
    if (val === '__NEW__') { setNewMode(true); setDropVal(''); }
    else setDropVal(val);
  }

  const canGo = newMode ? !!newInput.trim() : !!dropVal;
  function go() {
    if (newMode && newInput.trim()) onSelect(newInput);
    else if (!newMode && dropVal)   onSelect(dropVal);
  }

  return (
    <Wrap>
      <Page>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <BackBtn onClick={onBack} />
          <div style={{ fontSize:12, color: isAsia ? '#6EE7B7' : '#9b8fc0', fontWeight: isAsia ? 700 : 400 }}>{eventLabel}</div>
          <div style={{ width:60 }} />
        </div>

        <GoldTitle>WHO IS SCORING?</GoldTitle>
        <div style={{ textAlign:'center', fontSize:12, color:'#9b8fc0', letterSpacing:2, marginBottom:20 }}>Select your name to continue</div>
        <Divider />

        <Card style={{ marginTop:20 }}>
          {!newMode ? (
            <>
              <div style={{ fontSize:11, color:'#9b8fc0', letterSpacing:1, marginBottom:10, fontWeight:700 }}>SELECT YOUR NAME:</div>
              <select value={dropVal} onChange={e => handleDrop(e.target.value)}
                style={{ width:'100%', padding:'13px 14px', background:'rgba(93,63,211,.18)', border:'1px solid rgba(93,63,211,.5)', borderRadius:10, color: dropVal ? '#fff' : '#9b8fc0', fontSize:15, fontFamily:"'Nunito',sans-serif", fontWeight:700, outline:'none', marginBottom:14, cursor:'pointer' }}>
                <option value="">— Select your name —</option>
                {users.map(u => <option key={u} value={u}>{u}</option>)}
                <option value="__NEW__">+ Add new name…</option>
              </select>
              <Btn gold onClick={go} disabled={!canGo}>Continue →</Btn>
            </>
          ) : (
            <>
              <div style={{ fontSize:11, color:'#9b8fc0', letterSpacing:1, marginBottom:10, fontWeight:700 }}>ENTER YOUR NAME:</div>
              <input autoFocus value={newInput} onChange={e => setNewInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()}
                placeholder="Type your name…"
                style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, color:'#fff', fontSize:15, fontFamily:"'Nunito',sans-serif", outline:'none', marginBottom:10 }} />
              <Btn gold onClick={go} disabled={!canGo} style={{ marginBottom:8 }}>Continue →</Btn>
              {users.length > 0 && (
                <button type="button" onClick={() => { setNewMode(false); setNewInput(''); }}
                  style={{ background:'none', border:'none', color:'#8b5cf6', fontSize:13, cursor:'pointer', fontFamily:"'Nunito',sans-serif", textDecoration:'underline' }}>
                  ← Back to name list
                </button>
              )}
            </>
          )}
        </Card>
      </Page>
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   COUNTRIES / ARTISTS PAGE
══════════════════════════════════════════════════ */
function CountriesPage({ semi, asiaShow, myName, countries, data, sfKey, onCountry, onResults, onBack }) {
  const scoredCount = countries.filter(c => hasBeenScored(data, sfKey, myName, c.code)).length;
  const title       = getEventTitle(semi, asiaShow);
  const isAsia      = semi === 'asia';

  return (
    <Wrap>
      <Page>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:6 }}>
          <BackBtn onClick={onBack} label="← Change name" />
          <div style={{ fontSize:12, color:'#FFD700', fontWeight:800 }}>👤 {myName}</div>
          <Btn gold small onClick={onResults}>📊 Results</Btn>
        </div>

        <GoldTitle>{title}</GoldTitle>
        <div style={{ textAlign:'center', fontSize:12, color:'#9b8fc0', marginTop:4 }}>
          Scored: {scoredCount} / {countries.length} {isAsia ? 'artists' : 'countries'}
        </div>

        <div style={{ height:4, background:'rgba(255,255,255,.1)', borderRadius:2, margin:'8px 0 12px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${countries.length ? (scoredCount / countries.length) * 100 : 0}%`, background: isAsia ? 'linear-gradient(90deg,#047857,#6EE7B7)' : 'linear-gradient(90deg,#5d3fd3,#FFD700)', transition:'width .5s' }} />
        </div>
        <Divider />

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))', gap:10, marginTop:14 }}>
          {countries.map((c, idx) => {
            const scored = hasBeenScored(data, sfKey, myName, c.code);
            const total  = getCountryTotal(data, sfKey, myName, c.code);
            const isArt  = !!c.isArtist;

            return (
              <div key={c.code} className="fcrd" onClick={() => onCountry(idx)}
                style={{ borderRadius:13, overflow:'hidden', position:'relative',
                  border: scored ? '2px solid #5d3fd3' : c.autoQualifier ? '2px solid #FFD700' : '2px solid rgba(255,255,255,.1)',
                }}>

                {/* Top section: flag emoji for countries, artist name text for Asia */}
                <div style={{ height:64, background:makeGradient(c.colors), display:'flex', alignItems:'center', justifyContent:'center', padding: isArt ? '4px 5px' : 0 }}>
                  {isArt ? (
                    <div style={{ fontSize:9, fontWeight:800, color:'#fff', textAlign:'center', lineHeight:1.4, wordBreak:'break-word', textShadow:'0 1px 3px rgba(0,0,0,.6)', padding:'0 2px' }}>
                      {c.name}
                    </div>
                  ) : (
                    <div style={{ fontSize:32 }}>{c.flag}</div>
                  )}
                </div>

                {/* Bottom section */}
                <div style={{ background:'#0d0630', padding:'5px 5px 7px', textAlign:'center' }}>
                  {isArt ? (
                    <div style={{ fontSize:8, fontWeight:600, color:'#bbb', lineHeight:1.3 }}>{c.song}</div>
                  ) : (
                    <>
                      <div style={{ fontSize:9, fontWeight:700, color:'#ddd', lineHeight:1.3 }}>{c.name}</div>
                      {c.autoQualifier && <div style={{ fontSize:8, color:'#FFD700', marginTop:1, fontWeight:800 }}>★ AUTO</div>}
                    </>
                  )}
                  {scored && <div style={{ fontSize:9.5, color:'#8b5cf6', marginTop:1, fontWeight:800 }}>{total} pts</div>}
                </div>

                {scored && (
                  <div style={{ position:'absolute', top:3, right:3, background:'#5d3fd3', color:'#fff', fontSize:9, fontWeight:800, borderRadius:'50%', width:16, height:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>
                )}
              </div>
            );
          })}
        </div>

        <Btn gold onClick={onResults} style={{ marginTop:20 }}>📊 View Results</Btn>
      </Page>
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   SCORING PAGE
══════════════════════════════════════════════════ */
function ScoringPage({ myName, countries, cIdx, setCIdx, data, sfKey, onScore, onBack, onResults }) {
  const c     = countries[cIdx];
  const total = getCountryTotal(data, sfKey, myName, c.code);
  const isArt = !!c.isArtist;

  return (
    <Wrap>
      <Page>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:6 }}>
          <BackBtn onClick={onBack} label="← All" />
          <div style={{ fontSize:11, color:'#9b8fc0' }}>{cIdx + 1} / {countries.length} · 👤 {myName}</div>
          <Btn gold small onClick={onResults}>📊</Btn>
        </div>

        {/* Hero card */}
        <div style={{ borderRadius:18, overflow:'hidden', marginBottom:14, border:'2px solid rgba(255,255,255,.12)', boxShadow:'0 8px 40px rgba(0,0,0,.45)' }}>

          {/* Banner: flag for countries, artist name for Asia */}
          <div style={{ height:118, background:makeGradient(c.colors), display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding: isArt ? '12px 20px' : 0 }}>
            {isArt ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:'clamp(15px,3.6vw,22px)', fontWeight:900, color:'#fff', textShadow:'0 2px 12px rgba(0,0,0,.6)', lineHeight:1.3 }}>
                  {c.name}
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize:56, filter:'drop-shadow(0 3px 10px rgba(0,0,0,.5))' }}>{c.flag}</div>
                {c.autoQualifier && (
                  <div style={{ position:'absolute', top:8, right:8, background:'#FFD700', color:'#1a0a00', fontSize:9, fontWeight:800, borderRadius:20, padding:'3px 9px', letterSpacing:1, animation:'glow 2s ease-in-out infinite' }}>
                    ★ AUTOMATIC QUALIFIER
                  </div>
                )}
              </>
            )}
          </div>

          {/* Dark info strip */}
          <div style={{ background:'#0d0630', padding:'11px 16px' }}>
            {isArt ? (
              <>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:'#6EE7B7' }}>{c.song}</div>
                {c.subtitle && <div style={{ fontSize:13, color:'#c4a8ff', marginTop:2, fontStyle:'italic' }}>({c.subtitle})</div>}
              </>
            ) : (
              <>
                <div style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:700, color:'#FFD700' }}>{c.name}</div>
                <div style={{ fontSize:13, color:'#c4a8ff', marginTop:2 }}>{c.artist}</div>
                <div style={{ fontSize:12, color:'#9b8fc0', fontStyle:'italic', marginTop:1 }}>"{c.song}"</div>
              </>
            )}
          </div>
        </div>

        {/* Score categories */}
        <Card>
          {CATS.map((cat, ci) => {
            const sel    = data?.[sfKey]?.[myName]?.[c.code]?.[cat.key] ?? null;
            const selNum = sel !== null ? Number(sel) : null;
            return (
              <div key={cat.key} style={{ display:'flex', alignItems:'center', gap:6, paddingBottom: ci < CATS.length-1 ? 10 : 0, marginBottom: ci < CATS.length-1 ? 10 : 0, borderBottom: ci < CATS.length-1 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                <div style={{ width:104, flexShrink:0, fontSize:10, fontWeight:800, letterSpacing:.7, color: selNum !== null ? '#c4a8ff' : '#6b5fa0' }}>
                  {cat.label}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4, flex:1 }}>
                  {POINTS.map(pt => {
                    const active = selNum === pt;
                    return (
                      <button key={pt} type="button" className="scbtn"
                        onClick={() => onScore(c.code, cat.key, active ? null : pt)}
                        style={{
                          width:30, height:30, borderRadius:'50%', fontSize:11, fontWeight:800, fontFamily:"'Nunito',sans-serif",
                          background: active ? (pt===12 ? 'linear-gradient(135deg,#b91c1c,#ef4444)' : pt===10 ? 'linear-gradient(135deg,#c2410c,#f97316)' : 'linear-gradient(135deg,#5d3fd3,#8b5cf6)') : 'rgba(255,255,255,.08)',
                          color: active ? '#fff' : '#777',
                          border: active ? '2px solid rgba(255,255,255,.3)' : '1px solid rgba(255,255,255,.12)',
                          transform: active ? 'scale(1.12)' : 'scale(1)',
                          boxShadow: active ? '0 2px 8px rgba(0,0,0,.4)' : 'none',
                          transition:'all .12s',
                        }}>
                        {pt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Total */}
          <div style={{ marginTop:14, paddingTop:14, borderTop:'2px solid rgba(255,215,0,.3)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:'#FFD700', fontWeight:700, letterSpacing:2 }}>TOTAL SCORE</div>
            <div style={{ fontFamily:"'Cinzel',serif", fontSize:30, fontWeight:900, background: total > 0 ? 'linear-gradient(135deg,#FFD700,#FFA500)' : 'none', WebkitBackgroundClip: total > 0 ? 'text' : 'none', WebkitTextFillColor: total > 0 ? 'transparent' : '#555', color: total > 0 ? 'transparent' : '#555' }}>
              {total}
            </div>
          </div>
        </Card>

        {/* Prev / Next */}
        <div style={{ display:'flex', gap:10 }}>
          <Btn onClick={() => setCIdx(cIdx-1)} disabled={cIdx===0} style={{ flex:1, background:'linear-gradient(135deg,#2d1b6e,#4c2889)', marginBottom:0 }}>← Previous</Btn>
          <Btn onClick={() => cIdx < countries.length-1 ? setCIdx(cIdx+1) : onBack()} style={{ flex:1, marginBottom:0 }}>
            {cIdx < countries.length-1 ? 'Next →' : 'Done ✓'}
          </Btn>
        </div>
      </Page>
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   RESULTS PAGE
══════════════════════════════════════════════════ */
function ResultsPage({ semi, asiaShow, sfKey, countries, data, resUser, setResUser, delTarget, setDelTarget, onDelete, onBack, toast, noSeparator }) {
  const isAsia = semi === 'asia';

  const ranked = [...countries]
    .map(c => {
      const catVals = CATS.map(cat => getCatScore(data, sfKey, resUser, c.code, cat.key));
      const total   = catVals.reduce((s, v) => s + v, 0);
      return { ...c, catVals, total };
    })
    .sort((a, b) => b.total - a.total);

  // For semi-finals only: determine qualifiers
  const compRanked = ranked.filter(c => c.competing);
  const qualCodes  = new Set(compRanked.slice(0, 10).map(c => c.code));

  // Separator: after 10th qualifier in semi-finals
  let sepAfterIdx = -1;
  if (!noSeparator) {
    let seen = 0;
    for (let i = 0; i < ranked.length; i++) {
      if (ranked[i].competing && ++seen === 10) { sepAfterIdx = i; break; }
    }
  }

  const isIndividual = resUser !== '__ALL__';
  const title        = getEventTitle(semi, asiaShow);

  const userOpts = [
    { val:'__ALL__', label:'👥 Everyone Together' },
    ...(Array.isArray(data.users) ? data.users : []).map(u => ({ val:u, label:`👤 ${u}` })),
  ];

  return (
    <Wrap>
      <Page wide>
        {/* Nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
          <BackBtn onClick={onBack} />
          <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, color: isAsia ? '#6EE7B7' : '#FFD700', fontWeight:700 }}>
            {title} · RESULTS
          </div>
          <div style={{ width:60 }} />
        </div>

        {/* User selector */}
        <Card style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:12 }}>
          <div style={{ fontSize:11, color:'#9b8fc0', fontWeight:700, letterSpacing:1, flexShrink:0 }}>SHOWING SCORES FOR:</div>
          <select value={resUser} onChange={e => setResUser(e.target.value)}
            style={{ flex:1, minWidth:160, padding:'10px 12px', background:'rgba(93,63,211,.2)', border:'1px solid rgba(93,63,211,.45)', borderRadius:10, color:'#fff', fontSize:14, fontWeight:700, fontFamily:"'Nunito',sans-serif", outline:'none', cursor:'pointer' }}>
            {userOpts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>
        </Card>

        {/* Legend */}
        <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
          {!noSeparator && <>
            <LegendItem bg="rgba(93,63,211,.22)"  bd="1px solid rgba(93,63,211,.5)"  circle={false} label="Qualifies" />
            <LegendItem bg="rgba(255,215,0,.07)"  bd="1px solid rgba(255,215,0,.3)"  circle={false} label="Auto-qualifier" />
            <LegendItem bg="rgba(220,38,38,.1)"   bd="1px solid rgba(220,38,38,.28)" circle={false} label="Does not qualify" />
          </>}
          <LegendItem bg="rgba(185,28,28,.85)" bd="2px solid #ef4444" circle={true} label="12 pts (individual)" />
          <LegendItem bg="rgba(194,65,12,.85)" bd="2px solid #f97316" circle={true} label="10 pts (individual)" />
          {!isIndividual && <div style={{ fontSize:11, color:'#9b8fc0', fontStyle:'italic' }}>(12/10 highlights on individual view only)</div>}
        </div>

        {/* Table */}
        <div style={{ overflowX:'auto', borderRadius:14, border:'1px solid rgba(255,255,255,.1)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
            <thead>
              <tr style={{ background:'rgba(93,63,211,.35)' }}>
                <th style={{ padding:'9px 6px',  fontSize:10, color:'#9b8fc0', textAlign:'center' }}>#</th>
                <th style={{ padding:'9px 10px', fontSize:10, color:'#9b8fc0', textAlign:'left'   }}>{isAsia ? 'ARTIST' : 'COUNTRY'}</th>
                {CATS.map(cat => (
                  <th key={cat.key} style={{ padding:'9px 3px', fontSize:8, color:'#9b8fc0', textAlign:'center', whiteSpace:'nowrap' }}>{cat.label}</th>
                ))}
                <th style={{ padding:'9px 8px', fontSize:10, color: isAsia ? '#6EE7B7' : '#FFD700', textAlign:'center', fontFamily:"'Cinzel',serif" }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((c, rowIdx) => {
                const isArt  = !!c.isArtist;
                const isAuto = !!c.autoQualifier;
                const isQ    = !noSeparator && qualCodes.has(c.code);

                // Row styling
                let rowBg, rowBd, rankDisplay, rankColor, totalColor;
                if (noSeparator) {
                  rowBg       = 'rgba(93,63,211,.07)';
                  rowBd       = 'rgba(93,63,211,.15)';
                  rankDisplay = rowIdx + 1;
                  rankColor   = isAsia ? '#6EE7B7' : '#8b5cf6';
                  totalColor  = isAsia ? '#6EE7B7' : '#FFD700';
                } else {
                  rowBg       = isAuto ? 'rgba(255,215,0,.07)'  : isQ ? 'rgba(93,63,211,.09)'  : 'rgba(220,38,38,.05)';
                  rowBd       = isAuto ? 'rgba(255,215,0,.18)'  : isQ ? 'rgba(93,63,211,.17)'  : 'rgba(220,38,38,.12)';
                  rankDisplay = isAuto ? '★' : isQ ? compRanked.findIndex(x => x.code === c.code) + 1 : '—';
                  rankColor   = isAuto ? '#FFD700' : isQ ? '#8b5cf6' : '#dc2626';
                  totalColor  = isAuto ? '#FFD700' : isQ ? '#8b5cf6' : '#f87171';
                }

                return (
                  <>
                    <tr key={c.code} className="trow" style={{ borderBottom:`1px solid ${rowBd}` }}>
                      {/* Rank */}
                      <td style={{ background:rowBg, padding:'9px 6px', textAlign:'center', fontSize:13, fontWeight:700, color:rankColor }}>
                        {rankDisplay}
                      </td>

                      {/* Artist / Country column */}
                      <td style={{ background:rowBg, padding:'8px 10px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                          {/* Left indicator: colored dot for artists, flag emoji for countries */}
                          {isArt ? (
                            <div style={{ width:22, height:22, borderRadius:'50%', background:makeGradient(c.colors), flexShrink:0, border:'1px solid rgba(255,255,255,.2)' }} />
                          ) : (
                            <span style={{ fontSize:18 }}>{c.flag}</span>
                          )}
                          <div>
                            <div style={{ fontSize:11, fontWeight:700, color: isAuto ? '#FFD700' : '#fff' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize:9, color:'#6b5fa0', marginTop:1 }}>
                              {isArt ? c.song : c.artist}
                            </div>
                          </div>
                          {isAuto && (
                            <span style={{ flexShrink:0, padding:'1px 7px', borderRadius:20, fontSize:8, fontWeight:800, background:'rgba(255,215,0,.15)', color:'#FFD700', border:'1px solid rgba(255,215,0,.3)' }}>AUTO</span>
                          )}
                        </div>
                      </td>

                      {/* Category score cells — exactly CATS.length */}
                      {c.catVals.map((val, ci) => {
                        const is12 = isIndividual && val === 12;
                        const is10 = isIndividual && val === 10;
                        return (
                          <td key={ci} style={{ background:rowBg, textAlign:'center', padding:'7px 3px' }}>
                            <span style={{
                              display:'inline-flex', alignItems:'center', justifyContent:'center',
                              minWidth:26, height:26, borderRadius:'50%', fontSize:11, fontWeight:800, padding:'0 3px',
                              background: is12 ? 'rgba(185,28,28,.9)' : is10 ? 'rgba(194,65,12,.9)' : 'transparent',
                              color:      is12||is10 ? '#fff' : val > 0 ? '#c4a8ff' : '#555',
                              border:     is12 ? '2px solid #ef4444' : is10 ? '2px solid #f97316' : 'none',
                              boxShadow:  is12 ? '0 0 10px rgba(239,68,68,.5)' : is10 ? '0 0 8px rgba(249,115,22,.4)' : 'none',
                            }}>
                              {val}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td style={{ background:rowBg, textAlign:'center', padding:'8px 6px' }}>
                        <span style={{ fontFamily:"'Cinzel',serif", fontSize:17, fontWeight:900, color:totalColor }}>
                          {c.total}
                        </span>
                      </td>
                    </tr>

                    {/* Qualifier separator — semi-finals only */}
                    {rowIdx === sepAfterIdx && (
                      <tr key={`sep-${c.code}`}>
                        <td colSpan={CATS.length + 3} style={{ padding:'2px 0' }}>
                          <div style={{ height:2, background:'linear-gradient(90deg,transparent,#dc2626 20%,#dc2626 80%,transparent)', position:'relative' }}>
                            <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%) translateY(-50%)', background:'#dc2626', color:'#fff', fontSize:8.5, fontWeight:800, padding:'2px 12px', borderRadius:20, whiteSpace:'nowrap' }}>
                              ── DOES NOT QUALIFY ──
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Delete user */}
        <div style={{ height:1, background:'linear-gradient(90deg,transparent,#5d3fd3,transparent)', margin:'28px 0 16px' }} />
        <Card style={{ borderColor:'rgba(220,38,38,.22)', background:'rgba(220,38,38,.04)' }}>
          <div style={{ fontSize:11, color:'#f87171', fontWeight:800, letterSpacing:1, marginBottom:12 }}>
            ⚠ DELETE USER — remove test data before sharing the link
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
            <select value={delTarget} onChange={e => setDelTarget(e.target.value)}
              style={{ flex:1, minWidth:140, padding:'9px 12px', background:'rgba(220,38,38,.1)', border:'1px solid rgba(220,38,38,.32)', borderRadius:10, color:'#fff', fontSize:13, fontFamily:"'Nunito',sans-serif", outline:'none', cursor:'pointer' }}>
              <option value="">— select user —</option>
              {(Array.isArray(data.users) ? data.users : []).map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <Btn danger small onClick={onDelete} disabled={!delTarget}>🗑 Delete</Btn>
          </div>
          {delTarget && (
            <div style={{ fontSize:11, color:'#f87171', marginTop:8 }}>
              This permanently deletes all scores for "{delTarget}" across all events. Click Delete to confirm.
            </div>
          )}
        </Card>
      </Page>

      {toast && (
        <div style={{ position:'fixed', bottom:24, right:16, background:'#1a1040', border:'1px solid #5d3fd3', color:'#fff', padding:'10px 18px', borderRadius:10, fontSize:14, animation:'toast .3s ease', zIndex:9999, boxShadow:'0 4px 24px rgba(0,0,0,.5)' }}>
          {toast}
        </div>
      )}
    </Wrap>
  );
}

/* ══════════════════════════════════════════════════
   LEGEND ITEM helper
══════════════════════════════════════════════════ */
function LegendItem({ bg, bd, circle, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#9b8fc0' }}>
      <div style={{ width:circle?14:12, height:circle?14:12, background:bg, border:bd, borderRadius:circle?'50%':3, flexShrink:0 }} />
      {label}
    </div>
  );
}
