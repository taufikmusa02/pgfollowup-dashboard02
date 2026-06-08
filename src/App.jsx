import React, { useState, useMemo, useRef, useEffect } from "react";
import { Users, AlertTriangle, CheckCircle2, RefreshCw, Search, ArrowLeft, UploadCloud, AlertCircle, X, FileSpreadsheet, Terminal, MessageSquare, Image as ImageIcon, Radio } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

const TODAY = new Date();
const ITEMS_PER_PAGE = 50;
const RB = "border-2 border-black";
const RS = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
const RSH = "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all";
const WA_SVG = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;

const PRIORITY = [
  { key:"no_txn",   label:"No Transaction", short:"No Txn",  color:"#FF5757" },
  { key:"over_1yr", label:"Over 1 Year",    short:">1 Year", color:"#FF914D" },
  { key:"6_12mo",   label:"6–12 Months",    short:"6–12 Mo", color:"#FFDE59" },
  { key:"3_6mo",    label:"3–6 Months",     short:"3–6 Mo",  color:"#7ED957" },
  { key:"1_3mo",    label:"1–3 Months",     short:"1–3 Mo",  color:"#5CE1E6" },
  { key:"lt_1mo",   label:"Within 1 Month", short:"<1 Mo",   color:"#CB6CE6" },
];
const FOLLOWUP = [
  { key:"pending",   label:"Pending",    color:"#E5E7EB", text:"#6B7280" },
  { key:"contacted", label:"Contacted",  color:"#5CE1E6", text:"#000" },
  { key:"responded", label:"Responded",  color:"#FFDE59", text:"#000" },
  { key:"converted", label:"Converted!", color:"#7ED957", text:"#000" },
];

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
  { title:"Update Password", content:`[GREET] [NAME] boleh update password ikut step dekat sini\nhttps://pg2u.my/taufikmusa/update-password\nBoleh update di website Public Gold\nhttps://publicgold.com.my/index.php?route=account/login\n*Klik Forgot Password di website untuk reset kalau terlupa password asal` },
  { title:"Download Apps", content:`[GREET] [NAME] boleh download Apps Public Gold dekat sini\nAndroid 📱\nhttps://play.google.com/store/apps/details?id=com.pgmapp.publicgold\niOS 🍎\nhttps://apps.apple.com/my/app/public-gold/id1591580964` },
  { title:"Kenapa Simpan Emas", content:`Salam [GREET] [NAME],\nSekadar berkongsi artikel dari mentor saya, Tuan Mohd Zulkifli Shafie\ntentang sebab utama kenapa simpan emas\nMoga bermanfaat\nhttps://www.mohdzulkifli.com/2023/08/inilah-sebab-utama-kenapa-saya-simpan-emas.html` },
  { title:"Buku Wang Emas", content:`Salam [GREET] [NAME],\nJust nak berkongsi Buku Wang Emas & Misi Bebas Hutang.\nBoleh dapatkan di PGMall, login guna PG Code = [PGCode]\nhttps://pgmall.my/p/N108/0071?referralPgCode=taufikbinmusa14@gmail.com\nMoga bermanfaat!` },
];

function getCategory(lpd) {
  if (!lpd||lpd.toLowerCase().includes("no sales")) return {...PRIORITY[0],daysSince:null};
  const d=new Date(lpd); if(isNaN(d)) return {...PRIORITY[0],daysSince:null};
  const days=Math.floor((TODAY-d)/86400000);
  if(days>365) return {...PRIORITY[1],daysSince:days};
  if(days>180) return {...PRIORITY[2],daysSince:days};
  if(days>90)  return {...PRIORITY[3],daysSince:days};
  if(days>30)  return {...PRIORITY[4],daysSince:days};
  return {...PRIORITY[5],daysSince:days};
}
function calcAge(dob){if(!dob||dob==="-")return null;const d=new Date(dob);if(isNaN(d))return null;return Math.floor((TODAY-d)/(365.25*86400000));}
function getAgeGroup(a){if(a===null)return"Unknown";if(a<18)return"< 18 tahun";if(a<=29)return"18 - 29";if(a<=39)return"30 - 39";if(a<=49)return"40 - 49";if(a<=55)return"50 - 55";return"56+";}
function getGreeting(n){if(!n)return"Cik";const u=n.toUpperCase();if(u.includes(" BIN ")||u.includes(" B. ")||/^(MOHD|MOHAMMAD|MUHAMMAD|MD)\s+/.test(u))return"En.";return"Cik";}
function getShortName(n){if(!n)return"";let u=n.toUpperCase().trim();const mr=/^(MOHD\.?|MOHAMMAD|MUHAMMAD|MD\.?)\s+/;const hm=mr.test(u);if(hm)u=u.replace(mr,"");const m=u.match(/^(.*?)\s+(BIN|BINTI|B\.|BT\.|BTE|BT)\s+/);let raw=m?(hm?m[1].split(" ")[0]:m[1]):u.split(" ")[0];return raw.split(" ").map(w=>w[0].toUpperCase()+w.slice(1).toLowerCase()).join(" ");}
function getCustomerKey(c){return c.pgcode||`${c.name}_${c.telephone}`;}
function buildMsg(c,tpl){return tpl.replace(/\[NAME\]/gi,getShortName(c.name)).replace(/\[GREET\]/gi,getGreeting(c.name)).replace(/\[YEAR\]/gi,c.regYear!=="Unknown"?c.regYear:"2021").replace(/\[PGCode\]/gi,c.pgcode||"");}
function initials(n){const w=(n||"").trim().split(" ");return(w[0]?.[0]||"")+(w[1]?.[0]||"");}
function avatarColor(n){const cols=["#FF5757","#FF914D","#FFDE59","#7ED957","#5CE1E6","#CB6CE6","#FF66C4"];let h=0;for(const c of(n||""))h=(h*31+c.charCodeAt(0))%cols.length;return cols[h];}

function parseCSV(text){
  const lines=text.trim().split(/\r?\n/);if(lines.length<2)return[];
  const sep=lines[0].includes("\t")?"\t":",";
  const hdrs=lines[0].split(sep).map(h=>h.trim().toLowerCase().replace(/[^a-z0-9]/g,"_"));
  const find=(...ks)=>{for(const k of ks){const i=hdrs.findIndex(h=>h.includes(k));if(i!==-1)return i;}return -1;};
  const iN=find("name"),iPG=find("pgcode","pg_code","code","id"),iEm=find("email"),iV=find("verified","profile_verified");
  const iD=find("dob","d_o_b_","birth","date_of_birth"),iRk=find("rank","tier","level"),iBr=find("branch","region","area","location");
  const iT=find("telephone","phone","tel","mobile","contact"),iFr=find("frontline","total_frontline");
  const iEmp=find("empire","empire_size","team_size"),iRg=find("date_register","register","joined","reg_date");
  const iLP=find("last_purchase","last_purchase_date","last_buy"),iAu=find("autodebit","auto_debit","auto"),iAm=find("amount","amt","price");
  return lines.slice(1).map(line=>{
    const c=line.split(sep);const g=i=>i>=0?(c[i]||"").trim():"—";
    const pg=g(iPG);const age=calcAge(g(iD));const lpd=g(iLP);const cat=getCategory(lpd);
    let tel=g(iT).replace(/\D/g,"");if(tel.startsWith("01"))tel="6"+tel;
    let regYear="Unknown";const rr=g(iRg);
    if(rr&&rr!=="—"){const dr=new Date(rr);regYear=!isNaN(dr)?dr.getFullYear().toString():(rr.match(/\d{4}/)?.[0]||"Unknown");}
    return{pgcode:pg==="-"?"":pg,name:g(iN).replace(/\s+/g," ")||"Unknown",email:g(iEm),verified:g(iV),dob:g(iD),rank:g(iRk),branch:g(iBr),telephone:tel,frontline:g(iFr),empire:g(iEmp),dateReg:rr,lastPurchase:lpd,regYear,autodebit:g(iAu),amount:g(iAm),age,ageGroup:getAgeGroup(age),cat};
  }).filter(r=>(r.name&&r.name!=="Unknown")||r.pgcode);
}

function CopyButton({text}){const[cp,sc]=useState(false);return<button onClick={()=>{navigator.clipboard.writeText(text);sc(true);setTimeout(()=>sc(false),2000)}} className={`bg-white text-black font-bold py-1 px-3 text-xs uppercase ${RB} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] transition-all`}>{cp?"COPIED!":"COPY"}</button>;}

function WaBtn({customer,big,messageTemplate}){
  const tel=customer?.telephone;
  if(!tel||tel.length<7)return<span className="text-gray-500 text-xs italic font-mono">No number</span>;
  const msg=buildMsg(customer,messageTemplate);
  return<a href={`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} className={`inline-flex items-center justify-center font-bold whitespace-nowrap ${RB} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none bg-[#25D366] text-black hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all ${big?'gap-2 px-6 py-3 text-base w-full':'gap-1.5 px-3 py-1.5 text-xs'}`}>{WA_SVG}{big?"SEND WHATSAPP":"CHAT"}</a>;
}

function SortTh({label,field,sf,sd,onSort,cls=""}){
  const active=sf===field;
  return<th onClick={()=>onSort(field)} className={`px-5 py-4 border-r-2 border-black cursor-pointer select-none hover:bg-gray-300 transition-colors ${cls}`}><div className="flex items-center gap-1 whitespace-nowrap font-black uppercase tracking-wider text-xs">{label}<span className="text-gray-400 font-normal">{active?(sd==="asc"?"↑":"↓"):"↕"}</span></div></th>;
}

function PaginationBar({page,total,onPage,count}){
  if(total<=1)return null;
  const from=(page-1)*ITEMS_PER_PAGE+1,to=Math.min(page*ITEMS_PER_PAGE,count);
  return<div className="flex items-center justify-between px-5 py-3 bg-gray-100 border-t-2 border-black font-mono text-xs font-bold"><span className="text-gray-600 uppercase">Showing {from}–{to} of {count}</span><div className="flex items-center gap-1">{[["«",1],["PREV",page-1]].map(([l,p])=><button key={l} onClick={()=>onPage(p)} disabled={page===1} className={`px-2 py-1 ${RB} bg-white disabled:opacity-30 hover:bg-gray-200 transition-all`}>{l}</button>)}<span className={`px-3 py-1 ${RB} bg-black text-white`}>{page}/{total}</span>{[["NEXT",page+1],["»",total]].map(([l,p])=><button key={l} onClick={()=>onPage(p)} disabled={page===total} className={`px-2 py-1 ${RB} bg-white disabled:opacity-30 hover:bg-gray-200 transition-all`}>{l}</button>)}</div></div>;
}

function BroadcastPanel({list,idx,onSend,onSkip,onClose,msgTpl,attachedImage,followUpStatus,onSetFollowUp}){
  const done=idx>=list.length;
  const c=done?null:list[idx];
  const cKey=c?getCustomerKey(c):null;
  const fuKey=cKey?(followUpStatus[cKey]||"pending"):"pending";
  const fuS=FOLLOWUP.find(s=>s.key===fuKey)||FOLLOWUP[0];
  const pct=list.length>0?Math.min(idx/list.length*100,100):0;
  const hasNum=c?.telephone&&c.telephone.length>=7;
  const previewMsg=c?buildMsg(c,msgTpl):"";

  return(
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3">
      <div className={`bg-[#F4F0E6] w-full max-w-md flex flex-col max-h-[95vh] overflow-hidden ${RB} shadow-[10px_10px_0px_rgba(0,0,0,1)]`}>

        {/* Header */}
        <div className="bg-black text-white px-4 py-2.5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 font-black uppercase"><Radio size={13} className="text-[#7ED957]"/> Broadcast</div>
            <span className="bg-[#CB6CE6] text-black font-black px-2 py-0.5 border-2 border-black text-[10px]">{Math.min(idx+1,list.length)} / {list.length}</span>
          </div>
          <button onClick={onClose} className="bg-red-500 text-black border-2 border-black w-7 h-7 flex items-center justify-center font-black hover:bg-red-400 transition-colors">✕</button>
        </div>

        {/* Progress */}
        <div className="h-3 bg-gray-200 border-b-2 border-black shrink-0">
          <div className="h-full bg-[#7ED957] transition-all duration-500 border-r-2 border-black" style={{width:`${pct}%`}}/>
        </div>

        {done?(
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="font-black text-2xl uppercase mb-2">Siap!</h2>
            <p className="font-mono text-sm text-gray-600 mb-1">{list.length} customers telah diproses.</p>
            <p className="font-mono text-xs text-gray-400 mb-6">Status "Contacted" dah auto-set untuk semua yang kena send.</p>
            <button onClick={onClose} className={`bg-[#7ED957] text-black font-black px-8 py-3 uppercase ${RB} ${RS} ${RSH}`}>TUTUP</button>
          </div>
        ):(
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 p-4">

            {/* Customer card */}
            <div className={`${RB} ${RS} overflow-hidden bg-white`}>
              <div className="p-4" style={{backgroundColor:avatarColor(c.name)}}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-white flex items-center justify-center font-black text-xl shrink-0 ${RB} shadow-[2px_2px_0px_rgba(0,0,0,1)]`}>{initials(c.name)}</div>
                  <div className="overflow-hidden">
                    <div className="font-black text-black uppercase leading-tight truncate">{c.name}</div>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      <span className="bg-black text-white text-[10px] font-mono px-1.5 py-0.5 shrink-0">{c.pgcode||"NO CODE"}</span>
                      {c.branch!=="—"&&<span className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 border border-black truncate">{c.branch}</span>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 flex gap-2 flex-wrap border-t-2 border-black bg-white">
                <span className={`text-[10px] font-black px-2 py-1 ${RB}`} style={{backgroundColor:c.cat.color}}>{c.cat.label}</span>
                <span className={`text-[10px] font-black px-2 py-1 ${RB}`} style={{backgroundColor:fuS.color,color:fuS.text}}>▸ {fuS.label}</span>
                <span className="text-[10px] font-mono text-gray-500 self-center">{hasNum?`📱 ${c.telephone}`:"⚠️ No number"}</span>
              </div>
              {/* Inline status changer */}
              <div className="px-4 pb-3 pt-1 flex gap-1 border-t border-gray-200">
                <span className="text-[9px] font-black uppercase text-gray-400 self-center mr-1 shrink-0">Set:</span>
                {FOLLOWUP.map(s=>(
                  <button key={s.key} onClick={()=>onSetFollowUp(cKey,s.key)}
                    className={`flex-1 py-1 text-[9px] font-black uppercase border-2 border-black transition-all ${(followUpStatus[cKey]||"pending")===s.key?"shadow-[2px_2px_0px_rgba(0,0,0,1)]":"opacity-25 hover:opacity-70"}`}
                    style={{backgroundColor:s.color,color:s.text}}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message preview */}
            <div className={`${RB} overflow-hidden`}>
              <div className="bg-black text-white px-3 py-1.5 font-mono text-[10px] font-black uppercase flex justify-between items-center">
                <span>📝 Mesej Preview</span>
                <CopyButton text={previewMsg}/>
              </div>
              <div className="bg-[#E5FAFB] p-3 text-[11px] font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">{previewMsg}</div>
            </div>

            {/* Image */}
            {attachedImage&&(
              <div className={`bg-[#FFFBE5] p-3 flex items-center gap-3 ${RB}`}>
                <img src={attachedImage.url} alt="" className="w-10 h-10 object-cover border-2 border-black shrink-0"/>
                <div>
                  <div className="font-black text-xs uppercase">Gambar Attached ✓</div>
                  <div className="text-[10px] font-mono text-gray-500">Auto-copy → tekan PASTE dalam WhatsApp</div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pb-1">
              <button onClick={onSkip} className={`py-4 font-black uppercase text-sm bg-white ${RB} shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-0`}>
                SKIP →
              </button>
              {!hasNum?(
                <div className={`py-4 font-black uppercase text-sm bg-gray-100 text-gray-400 ${RB} flex items-center justify-center`}>NO NUMBER</div>
              ):(
                <button onClick={onSend} className={`py-4 font-black uppercase text-sm bg-[#25D366] text-black ${RB} shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-y-0 flex items-center justify-center gap-2`}>
                  {WA_SVG} SEND + NEXT
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function Modal({c,onClose,messageTemplate,followUpStatus,onSetFollowUp}){
  if(!c)return null;
  const av=avatarColor(c.name),cKey=getCustomerKey(c),curStatus=followUpStatus[cKey]||"pending";
  return(
    <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
      <div onClick={e=>e.stopPropagation()} className={`bg-[#F4F0E6] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] ${RB} ${RS}`}>
        <div className="bg-black text-white px-3 py-2 flex justify-between items-center border-b-2 border-black">
          <div className="flex items-center gap-2 font-mono text-sm"><Terminal size={14}/> C:\PROFILE.EXE</div>
          <button onClick={onClose} className="bg-red-500 text-black border-2 border-black w-6 h-6 flex items-center justify-center font-black"><X size={14}/></button>
        </div>
        <div className="p-5 border-b-2 border-black shrink-0" style={{backgroundColor:av}}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-white flex items-center justify-center text-2xl font-black ${RB} ${RS}`}>{initials(c.name)}</div>
            <div>
              <h2 className="font-black text-xl uppercase leading-tight mb-1">{c.name}</h2>
              <div className="flex gap-2">
                <span className="bg-black text-white text-xs font-mono px-2 py-0.5 border-2 border-black">{c.pgcode||"NO CODE"}</span>
                {c.rank&&c.rank!=="—"&&<span className="bg-white text-black text-xs font-bold px-2 py-0.5 border-2 border-black">{c.rank.toUpperCase()}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 overflow-y-auto flex-1 bg-[#F4F0E6]">
          <div className="mb-4"><div className={`inline-flex items-center gap-2 px-4 py-2 font-bold border-2 border-black ${RS}`} style={{backgroundColor:c.cat.color}}><AlertCircle size={15}/><span className="text-xs uppercase">{c.cat.label} {c.cat.daysSince!==null?`· ${c.cat.daysSince} DAYS AGO`:""}</span></div></div>
          <div className={`bg-white p-4 border-2 border-black ${RS} mb-4`}>
            <div className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"><CheckCircle2 size={12}/> Follow-Up Status</div>
            <div className="grid grid-cols-4 gap-2">
              {FOLLOWUP.map((s,i)=>{const active=curStatus===s.key;return<button key={s.key} onClick={()=>onSetFollowUp(cKey,s.key)} className={`py-2 px-1 text-[9px] font-black uppercase border-2 border-black transition-all text-center leading-tight ${active?"shadow-[3px_3px_0px_rgba(0,0,0,1)]":"opacity-40 hover:opacity-80"}`} style={{backgroundColor:s.color,color:s.text}}>{i+1}.<br/>{s.label}</button>;})}
            </div>
          </div>
          <div className="grid grid-cols-2 border-2 border-black mb-4 bg-white">
            {[["BRANCH",c.branch],["AGE",c.age?`${c.age} yrs`:"—"],["REGISTERED",c.dateReg?.split(" ")[0]||"—"],["LAST BUY",c.lastPurchase?.toLowerCase().includes("no sales")?"None":c.lastPurchase?.split(" ")[0]||"—"],["VERIFIED",c.verified],["AUTODEBIT",c.autodebit+(c.amount&&c.amount!=="—"?` (RM${c.amount})`:"")] ,["FRONTLINE",c.frontline],["EMPIRE",c.empire]].map(([k,v])=>(
              <div key={k} className="p-3 border-b-2 border-r-2 border-black last:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 even:border-r-0">
                <div className="text-[10px] font-black uppercase tracking-widest mb-1">{k}</div>
                <div className="font-mono text-sm truncate">{v}</div>
              </div>
            ))}
          </div>
          {c.email&&c.email!=="—"&&<div className={`bg-white p-3 border-2 border-black ${RS} mb-4 break-all`}><span className="block text-[10px] font-black uppercase mb-1">EMAIL</span><span className="font-mono text-sm">{c.email}</span></div>}
          <WaBtn customer={c} big messageTemplate={messageTemplate}/>
        </div>
      </div>
    </div>
  );
}

function Dashboard({data,onReset}){
  const [search,setSearch]=useState(""), [pFilter,setPFilter]=useState("all");
  const [branchFilter,setBranchFilter]=useState("All"), [ageFilter,setAgeFilter]=useState("All");
  const [yearFilter,setYearFilter]=useState("All"), [fuFilter,setFuFilter]=useState("all");
  const [selected,setSelected]=useState(null), [msgTpl,setMsgTpl]=useState(DEFAULT_TEMPLATE);
  const [toast,setToast]=useState("");
  const [followUpStatus,setFollowUpStatus]=useState(()=>{try{const s=localStorage.getItem("pg_followup_status");return s?JSON.parse(s):{}}catch{return{}}});
  const [sortField,setSortField]=useState(null), [sortDir,setSortDir]=useState("asc");
  const [page,setPage]=useState(1);
  const [attachedImage,setAttachedImage]=useState(null);
  const [broadcastMode,setBroadcastMode]=useState(false);
  const [broadcastIdx,setBroadcastIdx]=useState(0);
  const imgRef=useRef();

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000)};
  const handleSort=f=>{if(sortField===f)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortField(f);setSortDir("asc");}};
  const setFollowUp=(key,status)=>setFollowUpStatus(p=>({...p,[key]:status}));
  const cycleFollowUp=key=>{const cur=followUpStatus[key]||"pending",idx=FOLLOWUP.findIndex(s=>s.key===cur);setFollowUpStatus(p=>({...p,[key]:FOLLOWUP[(idx+1)%FOLLOWUP.length].key}));};

  const handleImageUpload=e=>{
    const file=e.target.files[0];
    if(!file||!file.type.startsWith("image/"))return;
    const img=new window.Image(),objUrl=URL.createObjectURL(file);
    img.onload=()=>{const cv=document.createElement("canvas");cv.width=img.width;cv.height=img.height;cv.getContext("2d").drawImage(img,0,0);cv.toBlob(blob=>setAttachedImage({url:objUrl,blob}),"image/png");};
    img.src=objUrl;
  };

  const handleBroadcastSend=async()=>{
    const c=sorted[broadcastIdx];if(!c)return;
    const cKey=getCustomerKey(c);
    if(attachedImage?.blob){try{await navigator.clipboard.write([new ClipboardItem({"image/png":attachedImage.blob})]);}catch{}}
    const tab=window.open("","_blank");
    if(tab)tab.location.href=`https://wa.me/${c.telephone}?text=${encodeURIComponent(buildMsg(c,msgTpl))}`;
    if((followUpStatus[cKey]||"pending")==="pending")setFollowUp(cKey,"contacted");
    setBroadcastIdx(i=>i+1);
  };

  const branches=useMemo(()=>[...new Set(data.map(c=>c.branch).filter(b=>b&&b!=="—"))].sort(),[data]);
  const AGE_GR=["< 18 tahun","18 - 29","30 - 39","40 - 49","50 - 55","56+"];
  const years=useMemo(()=>[...new Set(data.map(c=>c.regYear).filter(y=>y!=="Unknown"))].sort((a,b)=>b-a),[data]);
  const pCounts=useMemo(()=>{const c={all:data.length};PRIORITY.forEach(p=>{c[p.key]=data.filter(x=>x.cat.key===p.key).length;});return c;},[data]);
  const fuCounts=useMemo(()=>{const c={};FOLLOWUP.forEach(s=>{c[s.key]=0;});data.forEach(d=>{const k=followUpStatus[getCustomerKey(d)]||"pending";c[k]=(c[k]||0)+1;});return c;},[data,followUpStatus]);

  const filtered=useMemo(()=>data.filter(c=>{
    if(pFilter!=="all"&&c.cat.key!==pFilter)return false;
    if(branchFilter!=="All"&&c.branch!==branchFilter)return false;
    if(ageFilter!=="All"&&c.ageGroup!==ageFilter)return false;
    if(yearFilter!=="All"&&c.regYear!==yearFilter)return false;
    if(fuFilter!=="all"&&(followUpStatus[getCustomerKey(c)]||"pending")!==fuFilter)return false;
    if(search){const s=search.toLowerCase();return c.name.toLowerCase().includes(s)||c.pgcode.toLowerCase().includes(s)||c.branch.toLowerCase().includes(s)||c.telephone.includes(s);}
    return true;
  }),[data,pFilter,branchFilter,ageFilter,yearFilter,fuFilter,search,followUpStatus]);

  const sorted=useMemo(()=>{
    if(!sortField)return filtered;
    const PO=PRIORITY.reduce((a,p,i)=>{a[p.key]=i;return a;},{});
    const FO=FOLLOWUP.reduce((a,s,i)=>{a[s.key]=i;return a;},{});
    return [...filtered].sort((a,b)=>{
      let va,vb;
      if(sortField==="name"){va=a.name;vb=b.name;}
      else if(sortField==="age"){va=a.age??999;vb=b.age??999;}
      else if(sortField==="priority"){va=PO[a.cat.key]??99;vb=PO[b.cat.key]??99;}
      else if(sortField==="followup"){va=FO[followUpStatus[getCustomerKey(a)]||"pending"]??0;vb=FO[followUpStatus[getCustomerKey(b)]||"pending"]??0;}
      if(typeof va==="string")return sortDir==="asc"?va.localeCompare(vb):vb.localeCompare(va);
      return sortDir==="asc"?va-vb:vb-va;
    });
  },[filtered,sortField,sortDir,followUpStatus]);

  const totalPages=Math.ceil(sorted.length/ITEMS_PER_PAGE);
  const paginated=sorted.slice((page-1)*ITEMS_PER_PAGE,page*ITEMS_PER_PAGE);
  useEffect(()=>setPage(1),[pFilter,branchFilter,ageFilter,yearFilter,fuFilter,search,sortField,sortDir]);
  useEffect(()=>{try{localStorage.setItem("pg_followup_status",JSON.stringify(followUpStatus));}catch{}},[followUpStatus]);

  const urgent=(pCounts.no_txn||0)+(pCounts.over_1yr||0),active=pCounts.lt_1mo||0,converted=fuCounts.converted||0;
  const contactedTotal=(fuCounts.contacted||0)+(fuCounts.responded||0)+(fuCounts.converted||0);
  const priorityChart=PRIORITY.map(p=>({name:p.short,value:pCounts[p.key]||0,fill:p.color})).filter(d=>d.value>0);
  const yearChart=useMemo(()=>{const y={};data.forEach(c=>{if(c.regYear!=="Unknown")y[c.regYear]=(y[c.regYear]||0)+1;});return Object.entries(y).map(([name,count])=>({name,count})).sort((a,b)=>a.name.localeCompare(b.name));},[data]);
  const previewMsg=useMemo(()=>sorted.length>0?buildMsg(sorted[0],msgTpl):"No data.",[sorted,msgTpl]);

  return(
    <div className="w-full max-w-7xl mx-auto">
      {broadcastMode&&<BroadcastPanel list={sorted} idx={broadcastIdx} onSend={handleBroadcastSend} onSkip={()=>setBroadcastIdx(i=>i+1)} onClose={()=>{setBroadcastMode(false);setBroadcastIdx(0);}} msgTpl={msgTpl} attachedImage={attachedImage} followUpStatus={followUpStatus} onSetFollowUp={setFollowUp}/>}
      {selected&&<Modal c={selected} onClose={()=>setSelected(null)} messageTemplate={msgTpl} followUpStatus={followUpStatus} onSetFollowUp={setFollowUp}/>}
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-6 py-3 font-mono font-bold text-sm uppercase border-2 border-black shadow-[6px_6px_0px_rgba(203,108,230,1)] flex items-center gap-3"><CheckCircle2 size={18} className="text-[#7ED957]"/>{toast}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-block bg-black text-white px-3 py-1 font-mono text-xs mb-2 border-2 border-black">SYSTEM.READY_ v3</div>
          <h1 className="text-4xl md:text-5xl font-black text-black uppercase">Follow-Up Center</h1>
          <p className="text-sm text-gray-700 font-mono mt-1 font-bold uppercase">{data.length} RECORDS · {TODAY.toLocaleDateString("en-US",{day:"2-digit",month:"short",year:"numeric"})}</p>
        </div>
        <button onClick={onReset} className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-black text-black bg-[#CB6CE6] uppercase ${RB} ${RSH} w-fit`}><ArrowLeft size={16} strokeWidth={3}/> NEW UPLOAD</button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[{label:"TOTAL RECORDS",val:data.length,icon:Users,bg:"bg-[#5CE1E6]"},{label:"URGENT ACTION",val:urgent,icon:AlertTriangle,bg:"bg-[#FF5757]"},{label:"ACTIVE <1 MO",val:active,icon:CheckCircle2,bg:"bg-[#7ED957]"},{label:"CONVERTED",val:converted,icon:RefreshCw,bg:"bg-[#FFDE59]"}].map((m,i)=>(
          <div key={i} className={`p-5 ${m.bg} ${RB} ${RS} flex flex-col relative overflow-hidden`}>
            <div className="absolute -right-4 -bottom-4 opacity-20"><m.icon size={100} strokeWidth={1.5}/></div>
            <div className="flex items-center gap-2 text-xs font-black mb-3 z-10 uppercase tracking-widest"><span className="p-1.5 bg-black text-white border-2 border-black"><m.icon size={14} strokeWidth={2.5}/></span>{m.label}</div>
            <div className="text-4xl md:text-5xl font-black z-10">{m.val}</div>
          </div>
        ))}
      </div>

      {/* Follow-Up Progress */}
      <div className={`bg-white p-4 mb-8 ${RB} ${RS}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={12}/>Follow-Up Progress</span>
          <span className="text-xs font-mono font-bold text-gray-500">{contactedTotal}/{data.length} contacted ({data.length>0?Math.round(contactedTotal/data.length*100):0}%)</span>
        </div>
        <div className="flex h-5 border-2 border-black overflow-hidden mb-3 bg-gray-100">
          {FOLLOWUP.map(s=>{const pct=data.length>0?((fuCounts[s.key]||0)/data.length*100):0;return pct>0?<div key={s.key} style={{width:`${pct}%`,backgroundColor:s.color}} title={`${s.label}: ${fuCounts[s.key]||0}`} className="transition-all duration-500"/>:null;})}
        </div>
        <div className="flex flex-wrap gap-4">
          {FOLLOWUP.map(s=><div key={s.key} className="flex items-center gap-1.5"><span className="w-3 h-3 border border-black" style={{backgroundColor:s.color}}/><span className="text-[10px] font-black uppercase text-gray-600">{s.label}: <span className="text-black">{fuCounts[s.key]||0}</span></span></div>)}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`bg-white p-5 ${RB} ${RS}`}><h3 className="font-black uppercase text-xs mb-4 border-b-2 border-black pb-2 tracking-widest">Priority Breakdown</h3><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={priorityChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} stroke="#000" strokeWidth={2}>{priorityChart.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Pie><RTooltip/><Legend/></PieChart></ResponsiveContainer></div>
        <div className={`bg-white p-5 ${RB} ${RS}`}><h3 className="font-black uppercase text-xs mb-4 border-b-2 border-black pb-2 tracking-widest">Registration by Year</h3><ResponsiveContainer width="100%" height={180}><BarChart data={yearChart} margin={{top:0,right:10,left:-20,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke="#eee"/><XAxis dataKey="name" tick={{fontSize:11,fontWeight:"bold"}}/><YAxis tick={{fontSize:11}}/><RTooltip/><Bar dataKey="count" fill="#5CE1E6" stroke="#000" strokeWidth={2}/></BarChart></ResponsiveContainer></div>
      </div>

      {/* Broadcast Engine */}
      <div className={`bg-white p-5 mb-6 flex flex-col md:flex-row gap-6 ${RB} ${RS}`}>
        <div className="w-full md:w-1/3 flex flex-col">
          <h3 className="text-base font-black uppercase flex items-center gap-2 mb-2"><MessageSquare size={18}/> Broadcast Engine</h3>
          <div className="bg-[#FFFBE5] border-2 border-black p-3 text-[10px] font-mono mb-3">
            <span className="font-black block mb-1">TAGS:</span>
            {["[NAME]","[GREET]","[YEAR]","[PGCode]"].map(t=><span key={t} className="bg-black text-white px-1 mr-1">{t}</span>)}
          </div>
          <div className="hidden md:flex flex-col flex-1 border-2 border-dashed border-gray-300 p-3 bg-gray-50 overflow-hidden">
            <span className="text-[10px] font-black uppercase text-gray-500 mb-1">Live Preview</span>
            <div className="text-[10px] font-mono text-gray-800 whitespace-pre-wrap overflow-y-auto flex-1 break-words">{previewMsg}</div>
          </div>
        </div>
        <div className="w-full md:w-2/3 relative">
          <textarea value={msgTpl} onChange={e=>setMsgTpl(e.target.value)} className={`w-full h-48 bg-white text-black font-mono text-sm p-4 pb-12 focus:outline-none focus:bg-[#E5FAFB] transition-colors resize-y ${RB}`}/>
          <div className="absolute bottom-3 right-3"><CopyButton text={msgTpl}/></div>
        </div>
      </div>

      {/* Lampiran Gambar */}
      <div className={`bg-[#FFF0E5] p-5 mb-6 ${RB} ${RS}`}>
        <h3 className="text-base font-black uppercase flex items-center gap-2 mb-4"><ImageIcon size={18}/> Lampiran Gambar <span className="text-xs text-gray-500 font-normal tracking-normal">(Optional)</span></h3>
        {!attachedImage?(
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} ref={imgRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
            <div className="border-2 border-dashed border-black bg-white p-6 flex flex-col items-center text-center hover:bg-orange-50 transition-colors cursor-pointer">
              <UploadCloud size={32} className="mb-2"/>
              <span className="font-black text-sm uppercase">Klik atau drop gambar di sini</span>
              <span className="text-[10px] font-mono text-gray-500 mt-1">Gambar akan auto-copy bila SEND dalam Broadcast Mode. Tekan PASTE dalam WhatsApp.</span>
            </div>
          </div>
        ):(
          <div className="flex items-center gap-4 bg-white p-4 border-2 border-black">
            <img src={attachedImage.url} alt="" className="w-16 h-16 object-cover border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] shrink-0"/>
            <div className="flex-1">
              <div className="font-black text-sm uppercase mb-1">Gambar Sedia Digunakan ✓</div>
              <div className="text-[10px] font-mono text-gray-600 mb-3">Akan auto-copy ke clipboard setiap kali kau tekan SEND + NEXT</div>
              <button onClick={()=>setAttachedImage(null)} className={`bg-[#FF5757] text-white font-black text-[10px] uppercase px-4 py-1.5 ${RB} shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all`}>BUANG GAMBAR</button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div className={`bg-[#E5FAFB] p-5 mb-8 ${RB} ${RS}`}>
        <h3 className="text-base font-black uppercase flex items-center gap-2 mb-4"><FileSpreadsheet size={18}/> Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_TEMPLATES.map((t,i)=>(
            <div key={i} className={`flex flex-col bg-white border-2 border-black ${RS}`}>
              <div className="bg-black text-white px-3 py-2 font-black text-xs uppercase truncate">{t.title}</div>
              <div className="p-3 flex-1 flex flex-col">
                <textarea readOnly value={t.content} className="w-full h-20 text-[10px] font-mono text-gray-700 bg-gray-50 p-2 border border-dashed border-gray-300 mb-3 resize-none focus:outline-none"/>
                <div className="flex gap-2"><button onClick={()=>setMsgTpl(t.content)} className={`flex-1 bg-[#CB6CE6] text-black font-black py-1.5 text-[10px] uppercase ${RB} hover:-translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}>USE</button><CopyButton text={t.content}/></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white p-5 mb-6 ${RB} ${RS}`}>
        <h3 className="text-xs font-black mb-4 uppercase tracking-widest border-b-2 border-black pb-2 inline-block">Filter & Sort</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={()=>setPFilter("all")} className={`px-3 py-1.5 text-xs font-black uppercase ${RB} transition-all ${pFilter==="all"?`${RS} bg-black text-white`:'shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-white hover:-translate-y-0.5'}`}>ALL <span className="ml-1 opacity-60">{data.length}</span></button>
          {PRIORITY.map(p=>{const a=pFilter===p.key;return<button key={p.key} onClick={()=>setPFilter(a?"all":p.key)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase ${RB} transition-all ${a?RS:'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'}`} style={{backgroundColor:a?p.color:"#fff"}}>{!a&&<span className="w-2 h-2 border border-black rounded-full" style={{backgroundColor:p.color}}/>}{p.short}<span className={`ml-1 px-1.5 border-l-2 border-black ${a?"bg-black text-white":"bg-gray-100"}`}>{pCounts[p.key]||0}</span></button>;})}
        </div>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Follow-Up:</span>
          <button onClick={()=>setFuFilter("all")} className={`px-3 py-1.5 text-xs font-black uppercase ${RB} transition-all ${fuFilter==="all"?"bg-black text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]":"bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"}`}>All</button>
          {FOLLOWUP.map(s=><button key={s.key} onClick={()=>setFuFilter(fuFilter===s.key?"all":s.key)} className={`px-3 py-1.5 text-xs font-black uppercase ${RB} transition-all ${fuFilter===s.key?"shadow-[3px_3px_0px_rgba(0,0,0,1)]":"shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5"}`} style={{backgroundColor:s.color,color:s.text,opacity:fuFilter!=="all"&&fuFilter!==s.key?0.5:1}}>{s.label}<span className="ml-1 opacity-60">{fuCounts[s.key]||0}</span></button>)}
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1"><Search size={15} strokeWidth={3} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"/><input type="text" placeholder="Search name, PG code, branch..." value={search} onChange={e=>setSearch(e.target.value)} className={`w-full font-mono font-bold text-sm pl-9 pr-4 py-2.5 focus:outline-none focus:bg-[#FFFBE5] placeholder:text-gray-400 ${RB}`}/></div>
          {[{v:branchFilter,s:setBranchFilter,o:branches,l:"ALL BRANCHES"},{v:ageFilter,s:setAgeFilter,o:AGE_GR,l:"ALL AGES"},{v:yearFilter,s:setYearFilter,o:years,l:"ALL YEARS"}].map(({v,s,o,l},i)=><select key={i} value={v} onChange={e=>s(e.target.value)} className={`bg-white text-black font-black uppercase text-xs px-3 py-2.5 focus:outline-none cursor-pointer ${RB} ${RSH}`}><option value="All">{l}</option>{o.map(x=><option key={x}>{x}</option>)}</select>)}
        </div>
      </div>

      {/* Table header with Broadcast button */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono font-bold text-xs text-gray-600 uppercase">{sorted.length} results dalam senarai</div>
        <button onClick={()=>{setBroadcastIdx(0);setBroadcastMode(true);}} disabled={sorted.length===0}
          className={`inline-flex items-center gap-2 px-5 py-2.5 font-black uppercase text-sm bg-[#FF914D] text-black ${RB} shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none`}>
          <Radio size={16}/> START BROADCAST ({sorted.length})
        </button>
      </div>

      {/* Table */}
      <div className={`bg-white overflow-hidden mb-8 ${RB} ${RS}`}>
        <div className="bg-black text-white px-4 py-2 font-mono text-xs flex justify-between border-b-2 border-black">
          <span>DATA_TABLE.EXE</span>
          <span>{sorted.length>0?`${Math.min((page-1)*ITEMS_PER_PAGE+1,sorted.length)}–${Math.min(page*ITEMS_PER_PAGE,sorted.length)} OF ${sorted.length}`:"0 RECORDS"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b-4 border-black">
                <SortTh label="Customer" field="name" sf={sortField} sd={sortDir} onSort={handleSort}/>
                <th className="px-5 py-4 border-r-2 border-black font-black uppercase tracking-wider text-xs">Location</th>
                <SortTh label="Age" field="age" sf={sortField} sd={sortDir} onSort={handleSort} cls="text-center"/>
                <SortTh label="Priority" field="priority" sf={sortField} sd={sortDir} onSort={handleSort} cls="text-center"/>
                <SortTh label="Follow-Up" field="followup" sf={sortField} sd={sortDir} onSort={handleSort} cls="text-center"/>
                <th className="px-5 py-4 text-center font-black uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {paginated.length===0?(
                <tr><td colSpan={6} className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-3"><Terminal size={40} className="opacity-20"/><p className="font-mono text-gray-500 font-bold uppercase text-sm">Query returned 0 results.</p></div></td></tr>
              ):paginated.map((c,i)=>{
                const av=avatarColor(c.name),cKey=getCustomerKey(c);
                const fuKey=followUpStatus[cKey]||"pending",fuS=FOLLOWUP.find(s=>s.key===fuKey)||FOLLOWUP[0];
                return(
                  <tr key={cKey+i} onClick={()=>setSelected(c)} className="hover:bg-[#FFFBE5] transition-colors cursor-pointer even:bg-gray-50">
                    <td className="px-5 py-3 border-r-2 border-black"><div className="flex items-center gap-3"><div className={`w-9 h-9 flex items-center justify-center text-xs font-black shrink-0 ${RB}`} style={{backgroundColor:av}}>{initials(c.name)}</div><div><div className="font-black text-sm uppercase">{c.name}</div><div className="text-xs text-gray-500 font-mono">{c.pgcode||"—"}</div></div></div></td>
                    <td className="px-5 py-3 border-r-2 border-black font-mono text-xs font-bold uppercase truncate max-w-[130px]">{c.branch}</td>
                    <td className="px-5 py-3 border-r-2 border-black text-center font-black font-mono text-sm">{c.age??"-"}</td>
                    <td className="px-5 py-3 border-r-2 border-black text-center"><span className={`inline-flex px-2 py-1 font-bold text-black text-[10px] uppercase ${RB} shadow-[2px_2px_0px_rgba(0,0,0,1)]`} style={{backgroundColor:c.cat.color}}>{c.cat.short}</span></td>
                    <td className="px-5 py-3 border-r-2 border-black text-center" onClick={e=>e.stopPropagation()}><button onClick={()=>cycleFollowUp(cKey)} className={`inline-flex px-2 py-1 font-bold text-[10px] uppercase ${RB} shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:shadow-none active:translate-y-0 transition-all`} style={{backgroundColor:fuS.color,color:fuS.text}}>{fuS.label}</button></td>
                    <td className="px-5 py-3 text-center" onClick={e=>e.stopPropagation()}><WaBtn customer={c} messageTemplate={msgTpl}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <PaginationBar page={page} total={totalPages} onPage={setPage} count={sorted.length}/>
      </div>
    </div>
  );
}

function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}

export default function App(){
  const[data,setData]=useState(null),[error,setError]=useState(""),[dragging,setDragging]=useState(false);
  const fileRef=useRef();
  function processCSVText(text){try{const p=parseCSV(text);if(!p.length){setError("PARSE_ERROR: No valid data detected.");return;}setError("");setData(p);}catch{setError("SYSTEM_FAULT: File structure invalid.");}}
  function handleFile(f){
    if(!f)return;const ext=f.name.split(".").pop().toLowerCase();
    if(["csv","txt","tsv"].includes(ext)){const r=new FileReader();r.onload=e=>processCSVText(e.target.result);r.readAsText(f);}
    else if(["xlsx","xls"].includes(ext)){setError("");loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js").then(()=>{const r=new FileReader();r.onload=e=>{try{const wb=window.XLSX.read(new Uint8Array(e.target.result),{type:"array"});processCSVText(window.XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]));}catch{setError("EXCEL_ERROR: Failed to read worksheet.");}};r.readAsArrayBuffer(f);}).catch(()=>setError("NETWORK_ERROR: Could not load Excel module."));}
    else setError("FILE_ERROR: Requires .CSV / .TSV / .TXT / .XLSX / .XLS");
  }
  function loadDemoData(){const csv=`PGCode,Name,Email,Telephone,Branch,Last Purchase Date,D.O.B.,Autodebit,Amount,Profile Verified,Rank,Date Register\nPG001,IZUL IZAN BINTI HAZMI,a@x.com,60123456789,Kuching Sarawak,No Sales,1985-05-20,Yes,150,Yes,Gold,2021-01-10\nPG002,MOHD NAZERI BIN ABD SAMAD,b@x.com,60198765432,Ampang KL,No Sales,1990-12-01,No,-,Yes,Silver,2021-03-15\nPG003,HAFIZ SUIMI,c@x.com,60112233445,Kuching Sarawak,No Sales,1975-08-14,Yes,200,No,Bronze,2021-06-01\nPG004,JANE SMITH,d@x.com,60155566677,Johor,2022-11-05,1995-02-28,No,-,Yes,Platinum,2021-11-20\nPG005,SITI AISYAH BINTI ALI,e@x.com,60177788899,Kuala Lumpur,2025-03-10,1988-07-07,Yes,300,Yes,Gold,2023-01-05\nPG006,AHMAD FARIS BIN ISMAIL,f@x.com,60199887766,Johor Bahru,2024-06-15,1992-03-22,No,-,No,Silver,2022-06-10\nPG007,NUR IZZATI BINTI RAZAK,g@x.com,60133344556,Shah Alam,2023-01-20,2000-11-05,Yes,100,Yes,Bronze,2020-08-15\nPG008,RAHMAN BIN OTHMAN,h@x.com,60144455667,Penang,2021-05-10,1978-09-15,Yes,500,Yes,Platinum,2019-03-20\nPG009,FARIDAH BINTI HASSAN,i@x.com,60122233344,Melaka,No Sales,1983-11-25,No,-,No,Bronze,2020-12-01\nPG010,ZULKIFLI BIN IBRAHIM,j@x.com,60166677788,Selangor,2025-12-30,1969-04-08,Yes,250,Yes,Gold,2018-07-14`;setData(parseCSV(csv));}
  if(data)return<div className="min-h-screen bg-[#F4F0E6] p-4 md:p-8"><Dashboard data={data} onReset={()=>setData(null)}/></div>;
  return(
    <div className="min-h-screen bg-[#F4F0E6] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{backgroundImage:'radial-gradient(#000 1.5px, transparent 1.5px)',backgroundSize:'24px 24px'}}/>
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-[#5CE1E6] text-black mb-6 ${RB} shadow-[6px_6px_0px_rgba(0,0,0,1)]`}><Terminal size={40} strokeWidth={2}/></div>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase">Follow-Up Center</h1>
          <p className="font-mono font-bold bg-white px-4 py-2 inline-block border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">v3 · BROADCAST · IMAGE · STATUS · SORT</p>
        </div>
        <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}} onClick={()=>fileRef.current.click()} className={`border-4 border-dashed p-12 text-center cursor-pointer transition-all mb-8 ${dragging?"border-black bg-[#CB6CE6]":"border-black bg-white hover:bg-[#E5FAFB] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]"}`}>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
          <UploadCloud size={64} strokeWidth={1.5} className="mx-auto mb-4"/>
          <div className="font-black text-2xl uppercase mb-1">Drop Database Here</div>
          <div className="font-mono font-bold text-gray-600 uppercase text-sm">.CSV / .TSV / .TXT / .XLSX / .XLS</div>
        </div>
        {error&&<div className={`bg-[#FF5757] text-white px-4 py-3 font-mono font-bold flex items-center gap-3 mb-6 ${RB}`}><AlertCircle size={18}/>{error}</div>}
        <div className="flex justify-center"><button onClick={loadDemoData} className={`font-black uppercase text-black bg-[#FFDE59] px-6 py-3 ${RB} ${RSH}`}>RUN DEMO MODE //</button></div>
      </div>
    </div>
  );
}
