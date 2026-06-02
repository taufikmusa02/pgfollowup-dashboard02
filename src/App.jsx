import React, { useState, useMemo, useRef } from "react";
import { 
  Users, AlertTriangle, CheckCircle2, RefreshCw, 
  Search, ArrowLeft, UploadCloud, AlertCircle, X,
  FileSpreadsheet, Terminal, MessageSquare, Image as ImageIcon
} from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend, CartesianGrid,
  LineChart, Line
} from "recharts";

const TODAY = new Date();

// Priority definitions 
const PRIORITY = [
  { key: "no_txn",  label: "No Transaction", short: "No Txn",  color: "#FF5757", bg: "#FFE5E5", border: "#000000" },
  { key: "over_1yr", label: "Over 1 Year",   short: ">1 Year", color: "#FF914D", bg: "#FFF0E5", border: "#000000" },
  { key: "6_12mo",  label: "6 – 12 Months",  short: "6–12 Mo", color: "#FFDE59", bg: "#FFFBE5", border: "#000000" },
  { key: "3_6mo",   label: "3 – 6 Months",   short: "3–6 Mo",  color: "#7ED957", bg: "#EDFBE5", border: "#000000" },
  { key: "1_3mo",   label: "1 – 3 Months",   short: "1–3 Mo",  color: "#5CE1E6", bg: "#E5FAFB", border: "#000000" },
  { key: "lt_1mo",  label: "Within 1 Month", short: "<1 Mo",   color: "#CB6CE6", bg: "#F8E5FB", border: "#000000" },
];

const RETRO_SHADOW = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
const RETRO_SHADOW_HOVER = "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all";
const RETRO_BORDER = "border-2 border-black";

// Default template message
const DEFAULT_TEMPLATE = `Salam [GREET] [NAME]. 
Maaf lama tak followup.
Tadi masa semak rekod Public Gold (PG),
Saya nampak [GREET] [NAME] dah daftar akaun PG sejak tahun [YEAR]. 
Tahniah sebab start kenal PG awal.
Masa tahun [YEAR] dulu, harga emas sekitar RM240 ke RM275 segram. 
Hari ni harga dah cecah RM634 segram. Nilai emas [GREET] [NAME] dah naik lebih 2 kali ganda.
Pakar kewangan unjur harga emas boleh naik sampai RM700 ke RM800 segram hujung tahun ni. 
Sekarang masa paling sesuai untuk sambung simpan balik.
PG ada notify [GREET] [NAME] dah lama tak topup akaun. 
[GREET] [NAME] masih boleh login akaun PG macam biasa tak?
Kalau lupa username atau password, Boleh reply whatsapp ya. Saya terus guide cara reset.
Taufik (PG Dealer)
https://pg2u.my/taufikmusa`;

const QUICK_TEMPLATES = [
  {
    title: "Update Password",
    content: `[GREET] [NAME] boleh update password ikut step dekat sini
https://pg2u.my/taufikmusa/update-password
Boleh update di website Public Gold
https://publicgold.com.my/index.php?route=account/login
*Klik Forgot Password di website untuk reset kalau terlupa password asal`
  },
  {
    title: "Download Apps",
    content: `[GREET] [NAME] boleh download Apps Public Gold dekat sini
Android 📱
https://play.google.com/store/apps/details?id=com.pgmapp.publicgold
iOS 🍎
https://apps.apple.com/my/app/public-gold/id1591580964`
  },
  {
    title: "Kenapa Simpan Emas",
    content: `Salam [GREET] [NAME],
Sekadar berkongsi artikel dari mentor saya, Tuan Mohd Zulkifli Shafie
tentang sebab utama kenapa simpan emas
Moga bermanfaat
https://www.mohdzulkifli.com/2023/08/inilah-sebab-utama-kenapa-saya-simpan-emas.html`
  },
  {
    title: "Buku Wang Emas",
    content: `Salam [GREET] [NAME],
Just nak berkongsi, jika belum baca Buku Wang Emas & Misi Bebas Hutang
Saya sangat sarankan penyimpan emas baca sebab banyak
feedback mereka yang dah baca dan buat apa yang
buku ni sarankan, simpanan mereka bertambah baik.
InsyaAllah.
Buku ni tulisan mentor saya, Tuan Mohd Zulkifli Shafie.
[GREET] [NAME] boleh dapatkan di PGMall, login guna 
PG Code = [PGCode] dan password sendiri sama macam login
di Apps Public Gold.
Link buku dekat sini, PGMall ni macam Shopee macam macam ada, boleh juga shopping benda lain kat sana
https://pgmall.my/p/N108/0071?referralPgCode=taufikbinmusa14@gmail.com
Moga bermanfaat!`
  }
];

function getCategory(lpd) {
  if (!lpd || lpd.toLowerCase().includes("no sales")) return { ...PRIORITY[0], daysSince: null };
  const d = new Date(lpd);
  if (isNaN(d)) return { ...PRIORITY[0], daysSince: null };
  const days = Math.floor((TODAY - d) / 86400000);
  if (days > 365) return { ...PRIORITY[1], daysSince: days };
  if (days > 180) return { ...PRIORITY[2], daysSince: days };
  if (days > 90)  return { ...PRIORITY[3], daysSince: days };
  if (days > 30)  return { ...PRIORITY[4], daysSince: days };
  return { ...PRIORITY[5], daysSince: days };
}

function calcAge(dob) {
  if (!dob || dob === "-") return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  return Math.floor((TODAY - d) / (365.25 * 86400000));
}

function getAgeGroup(age) {
  if (age === null) return "Unknown";
  if (age < 18) return "< 18 tahun";
  if (age <= 29) return "18 - 29";
  if (age <= 39) return "30 - 39";
  if (age <= 49) return "40 - 49";
  if (age <= 55) return "50 - 55";
  return "56+";
}

// Function to guess gender/greeting based on Malay name patterns
function getGreeting(fullName) {
  if (!fullName) return "Cik";
  const upper = fullName.toUpperCase();
  if (upper.includes(" BIN ") || upper.includes(" B. ") || /^(MOHD|MOHAMMAD|MUHAMMAD|MD)\s+/.test(upper)) {
    return "En.";
  }
  if (upper.includes(" BINTI ") || upper.includes(" BT ") || upper.includes(" BT. ") || upper.includes(" BTE ")) {
    return "Cik";
  }
  return "Cik"; // Fallback kepada Cik jika tidak pasti
}

// Function to extract short name for WhatsApp text
function getShortName(fullName) {
  if (!fullName) return "";
  let upper = fullName.toUpperCase().trim();
  
  // Buang awalan MOHD / MOHAMMAD / MUHAMMAD
  const mohdRegex = /^(MOHD\.?|MOHAMMAD|MUHAMMAD|MD\.?)\s+/;
  const hasMohd = mohdRegex.test(upper);
  if (hasMohd) {
    upper = upper.replace(mohdRegex, '');
  }

  // Match apa sahaja sebelum BIN, BINTI, BT, B. (beserta jarak)
  const match = upper.match(/^(.*?)\s+(BIN|BINTI|B\.|BT\.|BTE|BT)\s+/);
  
  let rawName = upper;
  if (match) {
    rawName = match[1];
    // Jika nama asal ada MOHD, kita ambil 1 perkataan pertama sahaja (Cth: Zainul Arifin -> Zainul)
    if (hasMohd) rawName = rawName.split(" ")[0]; 
  } else {
    // Fallback ambil perkataan pertama jika tiada BIN/BINTI
    rawName = upper.split(" ")[0]; 
  }
  
  // Convert kepada Title Case (e.g. IZUL IZAN -> Izul Izan)
  return rawName
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_"));

  const find = (...keys) => {
    for (const k of keys) {
      const idx = headers.findIndex(h => h.includes(k));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const iName    = find("name");
  const iPG      = find("pgcode", "pg_code", "code", "id");
  const iEmail   = find("email");
  const iVerify  = find("verified", "profile_verified");
  const iDOB     = find("dob", "d_o_b_", "birth", "date_of_birth");
  const iRank    = find("rank", "tier", "level");
  const iBranch  = find("branch", "region", "area", "location");
  const iTel     = find("telephone", "phone", "tel", "mobile", "contact");
  const iFront   = find("frontline", "total_frontline");
  const iEmpire  = find("empire", "empire_size", "team_size");
  const iReg     = find("date_register", "register", "joined", "reg_date");
  const iLPD     = find("last_purchase", "last_purchase_date", "last_buy");
  const iAuto    = find("autodebit", "auto_debit", "auto");
  const iAmt     = find("amount", "amt", "price");

  return lines.slice(1).map(line => {
    const c = line.split(sep);
    const g = i => i >= 0 ? (c[i] || "").trim() : "—";
    const pg = g(iPG);
    const age = calcAge(g(iDOB));
    const lpd = g(iLPD);
    const cat = getCategory(lpd);
    let tel = g(iTel).replace(/\D/g, "");
    
    // Auto-fix local 01... numbers to 601...
    if (tel.startsWith("01")) {
      tel = "6" + tel;
    }
    
    let regYear = "Unknown";
    const rawReg = g(iReg);
    if (rawReg && rawReg !== "—") {
      const dReg = new Date(rawReg);
      if (!isNaN(dReg)) {
        regYear = dReg.getFullYear().toString();
      } else {
        const match = rawReg.match(/\d{4}/);
        if (match) regYear = match[0];
      }
    }

    return {
      pgcode: pg === "-" ? "" : pg,
      name: g(iName).replace(/\s+/g, " ") || "Unknown",
      email: g(iEmail), verified: g(iVerify), dob: g(iDOB),
      rank: g(iRank), branch: g(iBranch), telephone: tel,
      frontline: g(iFront), empire: g(iEmpire),
      dateReg: rawReg, lastPurchase: lpd, regYear,
      autodebit: g(iAuto), amount: g(iAmt),
      age, ageGroup: getAgeGroup(age), cat,
    };
  }).filter(r => (r.name && r.name !== "Unknown") || r.pgcode);
}

function initials(name) {
  const w = (name || "").trim().split(" ");
  return (w[0]?.[0] || "") + (w[1]?.[0] || "");
}

function avatarColor(name) {
  const cols = ["#FF5757", "#FF914D", "#FFDE59", "#7ED957", "#5CE1E6", "#CB6CE6", "#FF66C4"];
  let h = 0; 
  for (const ch of (name || "")) h = (h * 31 + ch.charCodeAt(0)) % cols.length;
  return cols[h];
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      // Fallback for document execution since navigator.clipboard is blocked in the iframe policy
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; // Prevents scrolling
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`bg-white text-black font-bold py-1 px-3 text-xs uppercase transition-all ${RETRO_BORDER} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]`}
    >
      {copied ? "COPIED!" : "COPY"}
    </button>
  );
}

function WaBtn({ customer, big, messageTemplate, attachedImage, onNotify }) {
  const tel = customer?.telephone;
  if (!tel || tel.length < 7) return <span className="text-gray-500 text-xs italic font-mono">No number</span>;
  
  const shortName = getShortName(customer.name);
  const greeting = getGreeting(customer.name);
  
  // Replace all dynamic tags
  const customMessage = messageTemplate
    .replace(/\[NAME\]/gi, shortName)
    .replace(/\[GREET\]/gi, greeting)
    .replace(/\[YEAR\]/gi, customer.regYear !== "Unknown" ? customer.regYear : "2021")
    .replace(/\[PGCode\]/gi, customer.pgcode || "");
    
  const encodedMessage = encodeURIComponent(customMessage);
  const href = `https://wa.me/${tel}?text=${encodedMessage}`;
  
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Buka tab baru awal untuk elak popup blocker
    const newTab = window.open('', '_blank');

    if (attachedImage) {
      let copySuccess = false;
      try {
        // Fallback for image copy since navigator.clipboard is blocked in the iframe policy
        const img = document.createElement('img');
        img.src = attachedImage.url;
        img.style.position = "fixed";
        img.style.left = "-9999px";
        document.body.appendChild(img);
        
        const range = document.createRange();
        range.selectNode(img);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        
        copySuccess = document.execCommand('copy');
        sel.removeAllRanges();
        document.body.removeChild(img);
      } catch (err) {
        console.error("Image copy failed", err);
      }

      if (copySuccess) {
        if(onNotify) onNotify("GAMBAR DICOPY! Sila PASTE dalam WhatsApp.");
      } else {
        if(onNotify) onNotify("Browser tidak support auto-copy gambar. Sila hantar manual.");
      }
    }
    
    if (newTab) {
        newTab.location.href = href;
    } else {
        window.location.href = href;
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-bold transition-all whitespace-nowrap border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none bg-[#25D366] text-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5
        ${big ? 'gap-2 rounded-none px-6 py-3 text-base w-full' : 'gap-1.5 rounded-none px-3 py-1.5 text-xs'}`}
    >
      <svg width={big ? 18 : 14} height={big ? 18 : 14} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {big ? "SEND WHATSAPP" : "CHAT"}
    </button>
  );
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function Modal({ c, onClose, messageTemplate, attachedImage, onNotify }) {
  if (!c) return null;
  const av = avatarColor(c.name);
  const shortName = getShortName(c.name);
  
  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div onClick={e => e.stopPropagation()} className={`bg-[#F4F0E6] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <div className={`bg-black text-white px-3 py-2 flex justify-between items-center border-b-2 border-black`}>
          <div className="flex items-center gap-2 font-mono text-sm">
            <Terminal size={14} /> C:\PROFILE.EXE
          </div>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-black border-2 border-black w-6 h-6 flex items-center justify-center font-bold active:translate-y-[1px]">
            <X size={14} />
          </button>
        </div>

        <div className="p-6 relative border-b-2 border-black shrink-0" style={{ backgroundColor: av }}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-white flex items-center justify-center text-2xl font-black text-black ${RETRO_BORDER} ${RETRO_SHADOW}`}>
              {initials(c.name)}
            </div>
            <div>
              <h2 className="text-black font-black text-xl md:text-2xl leading-tight mb-1 uppercase drop-shadow-[2px_2px_0px_rgba(255,255,255,0.7)]">{c.name}</h2>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="bg-black text-white text-xs font-mono px-2 py-0.5 border-2 border-black">{c.pgcode || "NO CODE"}</span>
                {c.rank && c.rank !== "—" && (
                  <span className="bg-white text-black text-xs font-bold px-2 py-0.5 border-2 border-black">{c.rank.toUpperCase()}</span>
                )}
              </div>
              <div className="bg-[#FFFBE5] text-black text-[10px] uppercase font-bold border-2 border-black px-2 py-1 inline-block mt-1">
                SYS.EXTRACTED: <span className="font-black text-blue-700">{getGreeting(c.name)} {getShortName(c.name)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#F4F0E6]">
          <div className="mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 text-black font-bold border-2 border-black ${RETRO_SHADOW}`} style={{ backgroundColor: c.cat.color }}>
              <AlertCircle size={16} />
              <span className="text-sm uppercase tracking-wider">{c.cat.label} {c.cat.daysSince !== null ? `· ${c.cat.daysSince} DAYS AGO` : ""}</span>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-0 border-2 border-black mb-6 bg-white`}>
            {[
              ["BRANCH", c.branch], ["AGE", c.age ? `${c.age} YRS (${c.ageGroup})` : "—"],
              ["REGISTERED", c.dateReg?.split(" ")[0] || "—"], ["LAST BUY", c.lastPurchase?.toLowerCase().includes("no sales") ? "None" : c.lastPurchase?.split(" ")[0] || "—"],
              ["VERIFIED", c.verified], ["AUTODEBIT", c.autodebit + (c.amount && c.amount !== "—" ? ` (RM${c.amount})` : "")],
              ["FRONTLINE", c.frontline], ["EMPIRE SIZE", c.empire],
            ].map(([k, v]) => (
              <div key={k} className="p-3 border-b-2 border-r-2 border-black last:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 even:border-r-0">
                <div className="text-black font-black text-[10px] uppercase tracking-widest mb-1">{k}</div>
                <div className="font-mono text-gray-800 text-sm truncate">{v}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {c.email && c.email !== "—" && (
              <div className={`bg-white p-3 border-2 border-black ${RETRO_SHADOW} break-all`}>
                <span className="block text-[10px] uppercase tracking-widest font-black text-black mb-1">EMAIL ADDRESS</span>
                <span className="font-mono text-sm">{c.email}</span>
              </div>
            )}
            <WaBtn customer={c} big messageTemplate={messageTemplate} attachedImage={attachedImage} onNotify={onNotify} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data, onReset }) {
  const [search, setSearch] = useState("");
  const [pFilter, setPFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("All");
  const [ageFilter, setAgeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [attachedImage, setAttachedImage] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast("Sila muat naik format gambar (JPG/PNG).");
      return;
    }
    
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        setAttachedImage({ url: objectUrl, blob });
      }, 'image/png');
    };
    img.src = objectUrl;
  };

  const branches = useMemo(() => [...new Set(data.map(c=>c.branch).filter(Boolean).filter(b=>b!=="—"))].sort(), [data]);
  const AGE_GROUPS = ["< 18 tahun", "18 - 29", "30 - 39", "40 - 49", "50 - 55", "56+"];
  const years = useMemo(() => [...new Set(data.map(c=>c.regYear).filter(y=>y!=="Unknown"))].sort((a,b)=>b-a), [data]);

  const counts = useMemo(() => {
    const c = { all: data.length };
    PRIORITY.forEach(p => { c[p.key] = data.filter(x => x.cat.key === p.key).length; });
    return c;
  }, [data]);

  const filtered = useMemo(() => data.filter(c => {
    if (pFilter !== "all" && c.cat.key !== pFilter) return false;
    if (branchFilter !== "All" && c.branch !== branchFilter) return false;
    if (ageFilter !== "All" && c.ageGroup !== ageFilter) return false;
    if (yearFilter !== "All" && c.regYear !== yearFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return c.name.toLowerCase().includes(s) || c.pgcode.toLowerCase().includes(s) || c.branch.toLowerCase().includes(s) || c.telephone.includes(s);
    }
    return true;
  }), [data, pFilter, branchFilter, ageFilter, yearFilter, search]);

  const urgent = (counts.no_txn||0) + (counts.over_1yr||0);
  const active = counts.lt_1mo||0;
  const autodebitOn = data.filter(c=>c.autodebit?.toLowerCase()==="yes").length;

  const priorityChartData = PRIORITY.map(p => ({
    name: p.short, value: counts[p.key] || 0, fill: p.color
  })).filter(d => d.value > 0);

  const branchChartData = useMemo(() => {
    const branchCounts = {};
    data.forEach(c => {
        if (c.branch && c.branch !== "—") branchCounts[c.branch] = (branchCounts[c.branch] || 0) + 1;
    });
    return Object.entries(branchCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [data]);

  const yearChartData = useMemo(() => {
    const yCounts = {};
    data.forEach(c => {
      if (c.regYear !== "Unknown") yCounts[c.regYear] = (yCounts[c.regYear] || 0) + 1;
    });
    return Object.entries(yCounts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const ageChartData = useMemo(() => {
    const aCounts = {};
    AGE_GROUPS.forEach(d => aCounts[d] = 0);
    data.forEach(c => {
      if (c.ageGroup && c.ageGroup !== "Unknown" && aCounts[c.ageGroup] !== undefined) aCounts[c.ageGroup]++;
    });
    return AGE_GROUPS.map(name => ({ name, count: aCounts[name] }));
  }, [data]);

  // Generate preview message based on the first filtered customer
  const previewMessage = useMemo(() => {
    if (filtered.length === 0) return "No data available for preview.";
    const c = filtered[0];
    const shortName = getShortName(c.name);
    const greeting = getGreeting(c.name);
    
    return messageTemplate
      .replace(/\[NAME\]/gi, shortName)
      .replace(/\[GREET\]/gi, greeting)
      .replace(/\[YEAR\]/gi, c.regYear !== "Unknown" ? c.regYear : "2021")
      .replace(/\[PGCode\]/gi, c.pgcode || "");
  }, [filtered, messageTemplate]);

  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      {selected && <Modal c={selected} onClose={() => setSelected(null)} messageTemplate={messageTemplate} attachedImage={attachedImage} onNotify={showToast} />}

      {/* Floating Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 font-mono font-bold text-sm uppercase border-2 border-black shadow-[6px_6px_0px_rgba(203,108,230,1)] animate-in slide-in-from-bottom-5 fade-in flex items-center gap-3`}>
          <CheckCircle2 size={18} className="text-[#7ED957]" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-block bg-black text-white px-3 py-1 font-mono text-xs mb-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            SYSTEM.READY_
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
            Follow-Up Center
          </h1>
          <p className="text-sm text-gray-700 font-mono mt-2 font-bold uppercase">
            {data.length} RECORDS · {TODAY.toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"})}
          </p>
        </div>
        <button 
          onClick={onReset} 
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black text-black bg-[#CB6CE6] uppercase ${RETRO_BORDER} ${RETRO_SHADOW_HOVER} w-fit`}
        >
          <ArrowLeft size={16} strokeWidth={3} /> NEW UPLOAD
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label:"TOTAL USERS", val: data.length, icon: Users, bg: "bg-[#5CE1E6]" },
          { label:"URGENT ACTION", val: urgent, icon: AlertTriangle, bg: "bg-[#FF5757]" },
          { label:"ACTIVE <1 MO", val: active, icon: CheckCircle2, bg: "bg-[#7ED957]" },
          { label:"AUTODEBIT ON", val: autodebitOn, icon: RefreshCw, bg: "bg-[#FFDE59]" },
        ].map((m, i) => (
          <div key={i} className={`p-5 ${m.bg} ${RETRO_BORDER} ${RETRO_SHADOW} flex flex-col relative overflow-hidden group`}>
            <div className={`absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-300`}><m.icon size={100} strokeWidth={1.5} /></div>
            <div className="flex items-center gap-2 text-xs font-black text-black mb-3 z-10 uppercase tracking-widest">
              <span className={`p-1.5 bg-black text-white border-2 border-black`}><m.icon size={16} strokeWidth={2.5}/></span>{m.label}
            </div>
            <div className="text-4xl md:text-5xl font-black text-black z-10 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)]">{m.val}</div>
          </div>
        ))}
      </div>

      {/* Message Template Engine - NEW SECTION */}
      <div className={`bg-white p-5 mb-8 flex flex-col md:flex-row gap-6 ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <div className="w-full md:w-1/3 flex flex-col">
          <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-2"><MessageSquare size={20}/> Broadcast Engine</h3>
          <p className="text-sm font-bold font-mono text-gray-700 mb-4">Set your WhatsApp template. Links are generated <span className="text-[#FF5757]">instantly</span>.</p>
          <div className="bg-[#FFFBE5] border-2 border-black p-3 text-xs font-mono mb-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0">
            <span className="block font-black text-black mb-1">PRO-TIP:</span>
            Gunakan <span className="bg-black text-white px-1">{"[NAME]"}</span> untuk nama, <span className="bg-black text-white px-1">{"[GREET]"}</span> untuk En./Cik automatik, <span className="bg-black text-white px-1">{"[YEAR]"}</span> untuk Tahun Register & <span className="bg-black text-white px-1">{"[PGCode]"}</span> untuk ID.
          </div>
          <div className="flex flex-col flex-1 border-2 border-dashed border-gray-300 p-3 bg-gray-50 overflow-hidden relative min-h-[160px] md:min-h-0">
            <span className="text-[10px] font-black uppercase text-gray-500 mb-2 shrink-0">Live Preview (Top Result)</span>
            <div className="text-xs font-mono text-gray-800 whitespace-pre-wrap overflow-y-auto custom-scrollbar flex-1 break-words pb-8">
              {previewMessage}
            </div>
            <div className="absolute bottom-2 right-2">
              <CopyButton text={previewMessage} />
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 relative flex flex-col">
          <textarea 
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            className={`w-full h-48 md:h-full bg-white text-black font-mono text-sm p-4 pb-12 focus:outline-none focus:bg-[#E5FAFB] transition-colors resize-y ${RETRO_BORDER} shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]`}
            placeholder="Type your WhatsApp message template here..."
          />
          <div className="absolute bottom-3 right-3">
            <CopyButton text={messageTemplate} />
          </div>
        </div>
      </div>

      {/* Attachment Section - NEW SECTION */}
      <div className={`bg-[#FFF0E5] p-5 mb-8 ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4">
          <ImageIcon size={20}/> Lampiran Gambar <span className="text-xs text-gray-500 font-mono tracking-normal ml-1">(Optional)</span>
        </h3>
        
        {!attachedImage ? (
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-black bg-white p-6 flex flex-col items-center justify-center text-center hover:bg-[#FFE5E5] transition-colors">
               <UploadCloud size={32} className="mb-2" />
               <span className="font-black text-sm uppercase">Klik atau drop gambar di sini</span>
               <span className="text-[10px] font-mono font-bold mt-1 text-gray-500">Gambar akan di-copy secara automatik. Anda hanya perlu tekan PASTE dalam chat WhatsApp.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 bg-white p-4 border-2 border-black">
            <img src={attachedImage.url} alt="Attachment" className="w-24 h-24 md:w-20 md:h-20 object-cover border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0" />
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
               <div className="font-black text-sm uppercase mb-1">Gambar Sedia Digunakan</div>
               <div className="text-xs font-mono text-gray-600 mb-4 md:mb-3 font-bold bg-[#E5FAFB] px-2 py-1 inline-block border border-black shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                 1. Tekan butang Chat &nbsp; 2. <span className="text-[#FF5757]">Tampal (Paste)</span> dalam WhatsApp
               </div>
               <button onClick={() => setAttachedImage(null)} className={`bg-[#FF5757] text-white px-4 py-1.5 font-black text-[10px] uppercase transition-all ${RETRO_BORDER} shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]`}>
                 BUANG GAMBAR
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Templates - NEW SECTION */}
      <div className={`bg-[#E5FAFB] p-5 mb-8 ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <h3 className="text-lg font-black uppercase flex items-center gap-2 mb-4"><FileSpreadsheet size={20}/> Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_TEMPLATES.map((tpl, i) => (
            <div key={i} className={`flex flex-col bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
              <div className="bg-black text-white px-3 py-2 font-black text-xs uppercase border-b-2 border-black truncate">
                {tpl.title}
              </div>
              <div className="p-3 flex-1 flex flex-col relative group">
                <textarea 
                  readOnly 
                  value={tpl.content} 
                  className="w-full h-24 text-[10px] font-mono text-gray-700 bg-gray-50 p-2 border border-dashed border-gray-300 mb-3 resize-none focus:outline-none custom-scrollbar"
                />
                <div className="flex gap-2 mt-auto">
                  <button 
                    onClick={() => setMessageTemplate(tpl.content)} 
                    className={`flex-1 bg-[#CB6CE6] text-black font-black py-2 text-[10px] uppercase transition-all ${RETRO_BORDER} hover:-translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none`}
                  >
                    USE TEMPLATE
                  </button>
                  <CopyButton text={tpl.content} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Filters Area */}
      <div className={`bg-white p-5 mb-6 ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <h3 className="text-sm font-black text-black mb-4 uppercase tracking-widest border-b-2 border-black pb-2 inline-block">Filter Database</h3>
        <div className="flex flex-wrap gap-3 mb-6">
          {PRIORITY.map(p => {
            const isActive = pFilter === p.key;
            return (
              <button key={p.key} onClick={() => setPFilter(isActive ? "all" : p.key)} className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase transition-all ${RETRO_BORDER} ${isActive ? RETRO_SHADOW : 'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`} style={{ backgroundColor: isActive ? p.color : '#fff', color: '#000' }}>
                {!isActive && <span className="w-2.5 h-2.5 border border-black rounded-full" style={{ backgroundColor: p.color }}></span>}
                {p.short} <span className={`px-2 py-0.5 ml-1 border-l-2 border-black ${isActive ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>{counts[p.key] || 0}</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} strokeWidth={3} className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            <input type="text" placeholder="Search Name, PG Code, Branch..." value={search} onChange={e => setSearch(e.target.value)} className={`w-full bg-white text-black font-mono font-bold text-sm pl-10 pr-4 py-3 focus:outline-none focus:bg-[#FFFBE5] transition-colors placeholder:text-gray-400 ${RETRO_BORDER} shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]`} />
          </div>
          <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)} className={`w-full md:w-auto bg-white text-black font-black uppercase text-sm px-4 py-3 focus:outline-none focus:bg-[#E5FAFB] cursor-pointer appearance-none pr-10 ${RETRO_BORDER} ${RETRO_SHADOW_HOVER}`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px' }}>
            <option value="All">ALL BRANCHES</option>{branches.map(b => <option key={b}>{b}</option>)}
          </select>
          <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className={`w-full md:w-auto bg-white text-black font-black uppercase text-sm px-4 py-3 focus:outline-none focus:bg-[#E5FAFB] cursor-pointer appearance-none pr-10 ${RETRO_BORDER} ${RETRO_SHADOW_HOVER}`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px' }}>
            <option value="All">ALL AGES</option>{AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className={`w-full md:w-auto bg-white text-black font-black uppercase text-sm px-4 py-3 focus:outline-none focus:bg-[#E5FAFB] cursor-pointer appearance-none pr-10 ${RETRO_BORDER} ${RETRO_SHADOW_HOVER}`} style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '16px' }}>
            <option value="All">ALL YEARS</option>{years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table Area */}
      <div className={`bg-white overflow-hidden mb-6 ${RETRO_BORDER} ${RETRO_SHADOW}`}>
        <div className="bg-black text-white px-4 py-2 font-mono text-xs flex justify-between border-b-2 border-black">
          <span>DATA_TABLE.EXE</span><span>RECORDS: {filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-4 border-black text-black font-black uppercase tracking-wider text-xs">
                <th className="px-5 py-4 border-r-2 border-black w-4/12">CUSTOMER INFO</th>
                <th className="px-5 py-4 border-r-2 border-black w-3/12">LOCATION</th>
                <th className="px-5 py-4 border-r-2 border-black w-1/12 text-center">AGE</th>
                <th className="px-5 py-4 border-r-2 border-black w-2/12 text-center">STATUS</th>
                <th className="px-5 py-4 w-2/12 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center bg-gray-50">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Terminal size={48} className="opacity-20" />
                      <p className="font-mono text-gray-500 font-bold uppercase tracking-widest">Query returned 0 results.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c, i) => {
                const av = avatarColor(c.name);
                return (
                  <tr key={(c.pgcode || c.email || "") + i} onClick={() => setSelected(c)} className={`hover:bg-[#FFFBE5] transition-colors cursor-pointer group even:bg-gray-50`}>
                    <td className="px-5 py-3 border-r-2 border-black">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center text-xs font-black text-black shrink-0 ${RETRO_BORDER} shadow-[2px_2px_0px_rgba(0,0,0,1)]`} style={{ backgroundColor: av }}>
                          {initials(c.name)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-black text-black truncate text-sm uppercase flex items-center gap-2">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 font-mono font-bold">{c.pgcode || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-r-2 border-black text-black font-mono text-xs font-bold uppercase truncate max-w-[150px]">{c.branch}</td>
                    <td className="px-5 py-3 border-r-2 border-black text-center text-black font-black font-mono">{c.age !== null ? c.age : "—"}</td>
                    <td className="px-5 py-3 border-r-2 border-black text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold text-black ${RETRO_BORDER} shadow-[2px_2px_0px_rgba(0,0,0,1)]`} style={{ backgroundColor: c.cat.color }}>
                        <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">{c.cat.short}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <WaBtn customer={c} messageTemplate={messageTemplate} attachedImage={attachedImage} onNotify={showToast} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  function processCSVText(text) {
    try {
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setError("PARSE_ERROR: No valid data vectors detected."); return; }
      setError(""); setData(parsed);
    } catch(err) { setError("SYSTEM_FAULT: File structure invalid."); }
  }

  function handleFile(file) {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    
    if (["xlsx", "xls"].includes(ext)) {
      loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js").then(() => {
          const reader = new FileReader();
          reader.onload = e => {
            try {
              const workbook = window.XLSX.read(new Uint8Array(e.target.result), { type: "array" });
              processCSVText(window.XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]));
            } catch (err) { setError("EXCEL_ERROR: Failed to read worksheet data."); }
          };
          reader.readAsArrayBuffer(file);
        }).catch(() => setError("SYSTEM_ERROR: Could not load Excel processing module."));
    } else if (["csv", "txt", "tsv"].includes(ext)) {
      const reader = new FileReader();
      reader.onload = e => processCSVText(e.target.result);
      reader.readAsText(file);
    } else { setError("FILE_ERROR: Requires .CSV, .TSV, .TXT, or Excel (.XLSX/.XLS) extension."); }
  }

  function loadDemoData() {
    const demoCSV = `PGCode,Name,Email,Telephone,Branch,Last Purchase Date,D.O.B.,Autodebit,Amount,Profile Verified,Rank,Date Register
PG001,IZUL IZAN BINTI HAZMI,ahmad@example.com,60123456789,Kuching Sarawak,No Sales,1985-05-20,Yes,150,Yes,Gold,2021-01-10
PG002,MOHD NAZERI BIN ABD SAMAD,siti@example.com,60198765432,Ampang Kuala Lumpur,No Sales,1990-12-01,No,-,Yes,Silver,2021-03-15
PG003,HAFIZ SUIMI,john@example.com,60112233445,Kuching Sarawak,No Sales,1975-08-14,Yes,200,No,Bronze,2021-06-01
PG004,Jane Smith,jane@example.com,60155566677,Johor,2022-11-05,1995-02-28,No,-,Yes,Platinum,2021-11-20
PG005,Ali Bin Abu,ali@example.com,60177788899,Kuala Lumpur,No Sales,1988-07-07,No,-,No,-,2024-01-05`;
    setData(parseCSV(demoCSV));
  }

  // Active Dashboard View
  if (data) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] font-sans selection:bg-[#FF66C4] selection:text-white p-4 md:p-8">
        <Dashboard data={data} onReset={() => setData(null)} />
      </div>
    );
  }

  // Initial Upload View
  return (
    <div className="min-h-screen bg-[#F4F0E6] flex flex-col items-center justify-center p-6 font-sans selection:bg-[#5CE1E6] selection:text-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="w-full max-w-2xl relative z-10">

        <div className="text-center mb-10 pt-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-[#5CE1E6] text-black mb-6 ${RETRO_BORDER} shadow-[6px_6px_0px_rgba(0,0,0,1)]`}><Terminal size={40} strokeWidth={2} /></div>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase drop-shadow-[3px_3px_0px_rgba(255,255,255,1)]">Follow-Up Center</h1>
          <p className="text-black font-mono font-bold text-lg bg-white px-4 py-2 inline-block border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">INITIALIZE SYSTEM WITH EXCEL OR CSV</p>
        </div>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
          className={`border-4 border-dashed p-12 text-center cursor-pointer transition-all duration-200 outline-none mb-8 ${dragging ? "border-black bg-[#CB6CE6] scale-[1.02] shadow-[8px_8px_0px_rgba(0,0,0,1)]" : "border-black bg-white hover:bg-[#E5FAFB] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]"}`}
        >
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <UploadCloud size={64} strokeWidth={1.5} className={`mx-auto mb-6 text-black`} />
          <div className="font-black text-2xl text-black uppercase tracking-wider mb-2">Drop Database Here</div>
          <div className="font-mono font-bold text-gray-700 uppercase">.CSV / .TSV / .XLSX</div>
        </div>

        {error && (
          <div className={`bg-[#FF5757] text-white px-4 py-3 font-mono font-bold flex items-center gap-3 mb-8 ${RETRO_BORDER} shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-2`}>
            <AlertCircle size={20} className="shrink-0"/><span>{error}</span>
          </div>
        )}

        <div className="flex justify-center mb-12">
          <button onClick={loadDemoData} className={`font-black uppercase tracking-wider text-black bg-[#FFDE59] px-6 py-3 transition-all ${RETRO_BORDER} ${RETRO_SHADOW_HOVER}`}>
            RUN DEMO MODE //
          </button>
        </div>

      </div>
    </div>
  );
}