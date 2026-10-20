const $=id=>document.getElementById(id),GX=30,GY=20,W=GX*200,H=GY*200,DAY=600;
const S=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
let cfg=Object.assign({vol:.5,speed:1,res:800,fx:1},S('lc_cfg')||{}),users=S('lc_users')||{},me=null,g=null,scr='auth',back='menu',looping=false,AC;
const sv=()=>S('lc_users',users),K={},J={x:0,y:0},touchUI=matchMedia('(pointer:coarse)').matches;
const T={comida:{n:'Comida',w:1,c:0,i:'🥫',d:'Restaura 40 de fome.'},agua:{n:'Água',w:1,c:0,i:'💧',d:'Restaura 40 de sede.'},medkit:{n:'Kit médico',w:1,c:0,i:'🩹',d:'Recupera 35 de vida. Espera de 10 s entre usos.'},ferramenta:{n:'Ferramenta',w:3,c:2,i:'🔧',d:'Aumenta a mochila em 5 kg.'},municao:{n:'Munição',w:1,c:2,i:'🔸',d:'Pente de 6 balas. Recarregue com R.'},bastao:{n:'Bastão',w:2,c:1,wp:1,dm:16,rg:38,cd:.45,d:'Corpo a corpo, sem munição.'},faca:{n:'Facão',w:1,c:1,wp:1,dm:24,rg:34,cd:.28,d:'Corpo a corpo rápido e leve.'},pistola:{n:'Pistola',w:2,c:1,wp:1,dm:26,rg:280,cd:.32,mg:8,rl:1,ac:.04,f:320,d:'Equilibrada e precisa.'},revolver:{n:'Revólver',w:2,c:1,wp:1,dm:50,rg:300,cd:.7,mg:6,rl:1.6,ac:.025,f:250,d:'Muito dano, cadência lenta.'},espingarda:{n:'Espingarda',w:3,c:1,wp:1,dm:22,rg:150,cd:.85,mg:4,sp:1,rl:1.4,ac:.1,f:170,d:'Dano em cone a curta distância.'},smg:{n:'Submetralhadora',w:3,c:1,wp:1,dm:11,rg:230,cd:.09,mg:20,rl:1.5,ac:.14,f:380,d:'Rajada rápida, menos precisa.'},rifle:{n:'Rifle',w:4,c:1,wp:1,dm:65,rg:520,cd:1.05,mg:5,rl:1.9,ac:.008,f:200,d:'Longo alcance e alta precisão.'}};
const CN=['Bolso frontal: consumíveis','Compartimento principal: armas','Bolso lateral: equipamento'];
const COL={comida:'#f2a93b',agua:'#4aa3ff',ferramenta:'#e5484d',medkit:'#ff5a5f',municao:'#d9c25a',bastao:'#a9743f',pistola:'#c8ced8',espingarda:'#b58a5a',faca:'#c8ced8',revolver:'#aab1bd',smg:'#8a929e',rifle:'#8a5a2b',vida:'#e5484d'};
const ICO={
medkit:'<rect x="6" y="14" width="36" height="27" rx="4" fill="#e8ecef"/><rect x="6" y="14" width="36" height="7" rx="3" fill="#c9d0d6"/><path d="M17 14v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" fill="none" stroke="#8a929e" stroke-width="3"/><rect x="21" y="23" width="6" height="14" fill="#d63a3f"/><rect x="17" y="27" width="14" height="6" fill="#d63a3f"/>',
comida:'<ellipse cx="24" cy="40" rx="12" ry="3" fill="#9aa1ac"/><rect x="12" y="14" width="24" height="26" fill="#c9ced6"/><rect x="12" y="21" width="24" height="12" fill="#d9482b"/><circle cx="24" cy="27" r="4" fill="#ffd58a"/><ellipse cx="24" cy="14" rx="12" ry="3" fill="#eef0f4"/>',
agua:'<path d="M20 10h8v5l5 6v19a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3V21l5-6z" fill="#4aa3ff"/><rect x="15" y="27" width="18" height="8" fill="#fff" opacity=".55"/><rect x="19" y="4" width="10" height="6" rx="1" fill="#f2f4f8"/><path d="M18 22v14" stroke="#fff" opacity=".5" stroke-width="2"/>',
ferramenta:'<rect x="5" y="20" width="38" height="22" rx="3" fill="#c23a2c"/><rect x="5" y="20" width="38" height="8" rx="3" fill="#9a2a20"/><path d="M16 20v-5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v5" fill="none" stroke="#2b2f36" stroke-width="3"/><rect x="20" y="25" width="8" height="7" rx="1" fill="#e6c25a" stroke="#7a5c14"/><rect x="5" y="34" width="38" height="2" fill="#00000030"/><g fill="#aab3c0"><rect x="6" y="21" width="4" height="4"/><rect x="38" y="21" width="4" height="4"/><rect x="6" y="37" width="4" height="4"/><rect x="38" y="37" width="4" height="4"/></g>',
municao:'<rect x="5" y="16" width="38" height="24" rx="2" fill="#5c6b3a"/><rect x="4" y="12" width="40" height="8" rx="2" fill="#48552f"/><rect x="5" y="27" width="38" height="4" fill="#e6c25a"/><path d="M17 12v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" fill="none" stroke="#23281a" stroke-width="3"/><rect x="20" y="20" width="8" height="5" rx="1" fill="#2b2f36"/><g fill="#b98a2a"><rect x="9" y="33" width="3" height="5"/><rect x="14" y="33" width="3" height="5"/><rect x="31" y="33" width="3" height="5"/><rect x="36" y="33" width="3" height="5"/></g>',
bastao:'<g transform="rotate(-45 24 24)"><rect x="1" y="21" width="16" height="6" rx="2" fill="#2a2013"/><path d="M4 21v6M8 21v6M12 21v6" stroke="#c9a85a" stroke-width="1.5"/><path d="M17 22l14-2v8l-14-2z" fill="#a9743f"/><rect x="30" y="17" width="15" height="14" rx="4" fill="#8a5a2b"/><rect x="33" y="17" width="3" height="14" fill="#8b95a2"/><rect x="40" y="17" width="2.5" height="14" fill="#8b95a2"/><g fill="#d6dbe2"><path d="M37 17l1.5-4 1.5 4z"/><path d="M37 31l1.5 4 1.5-4z"/><path d="M43 17l1.2-3 1.2 3z"/></g></g>',
faca:'<polygon points="12,36 36,8 42,13 22,42" fill="#c8ced8"/><polygon points="5,39 12,36 22,42 12,46" fill="#5a3b1e"/>',
pistola:'<rect x="6" y="12" width="36" height="10" rx="2" fill="#c8ced8"/><rect x="9" y="21" width="10" height="19" rx="2" fill="#3a3d44" transform="rotate(-10 14 30)"/><path d="M20 22h8v5h-8z" fill="#8a929e"/>',
revolver:'<rect x="18" y="12" width="26" height="6" fill="#c8ced8"/><circle cx="20" cy="20" r="8" fill="#aab1bd"/><rect x="6" y="14" width="14" height="8" fill="#aab1bd"/><rect x="6" y="24" width="9" height="17" rx="2" fill="#7a4a25" transform="rotate(-14 10 32)"/>',
espingarda:'<rect x="16" y="15" width="30" height="5" fill="#c8ced8"/><rect x="16" y="20" width="22" height="4" fill="#8a929e"/><path d="M3 22l13-7v10l-9 6z" fill="#8a5a2b"/><rect x="26" y="24" width="10" height="3" fill="#8a5a2b"/>',
smg:'<rect x="6" y="13" width="32" height="10" rx="2" fill="#aeb5c0"/><rect x="38" y="16" width="8" height="4" fill="#8a929e"/><rect x="20" y="23" width="6" height="18" fill="#3a3d44"/><rect x="9" y="23" width="7" height="11" rx="2" fill="#3a3d44" transform="rotate(-10 12 28)"/>',
rifle:'<rect x="14" y="21" width="32" height="4" fill="#c8ced8"/><rect x="20" y="14" width="14" height="5" rx="2" fill="#3a3d44"/><path d="M2 23l12-2v9L5 34z" fill="#8a5a2b"/><rect x="15" y="25" width="16" height="6" fill="#8a5a2b"/>',
vida:'<path d="M24 41C5 28 8 11 18 11c4 0 6 3 6 5 0-2 2-5 6-5 10 0 13 17-6 30z" fill="#e5484d"/>'};
const Wd=[26,45,30],Dk=[220,10,22],Mt=[215,10,55],WM={bastao:[[-11,7,3.4,0,3.4,[28,25,16]],[-9,1,3.8,0,3.6,[40,50,50]],[-6.5,1,3.8,0,3.6,[40,50,50]],[-4,13,4,0,4,Wd],[9,7,5.6,-.4,4.6,[26,40,24]],[9,1.6,6,-.6,4.8,[215,10,55]],[12,1,1.4,4.6,6.4,[215,10,80]],[14.5,1,1.4,4.6,6.4,[215,10,80]]],faca:[[-6,14,3,0,2,[210,8,72]],[-11,5,3.5,0,3,Dk]],pistola:[[-6,12,4,3,4,Mt],[-6,4,4,0,3,Dk]],revolver:[[-3,13,3,4,3,Mt],[-7,6,5,2,5,Mt],[-8,4,4,0,3,Wd]],espingarda:[[-2,14,3,3,3,Mt],[-13,14,4,1,4,Wd]],smg:[[-4,14,4,3,4,[215,8,38]],[-1,5,4,0,4,Dk],[-8,4,4,1,3,Dk]],rifle:[[-2,18,3,4,3,Mt],[-14,13,4,1,5,Wd],[-8,5,3,7,2,Dk]]},GR={bastao:8,faca:8.5,pistola:4,revolver:6,espingarda:5,smg:-1.5,rifle:6.5},TH={smg:1,espingarda:1,rifle:1},IT={
ferramenta:(x,y,z)=>{box(x-8,y-5,16,10,z+8,[4,68,40],z);box(x-8.4,y-5.4,16.8,10.8,z+11,[4,68,28],z+8);box(x-2,y+5.4,4,.8,z+10,[45,80,62],z+6);box(x-5,y-1,1.6,2,z+15,[0,0,25],z+11);box(x+3.4,y-1,1.6,2,z+15,[0,0,25],z+11);box(x-5,y-1,10,2,z+16,[0,0,32],z+14.4)},
municao:(x,y,z)=>{box(x-7,y-4.5,14,9,z+8,[75,32,28],z);box(x-7.5,y-5,15,10,z+11,[75,30,20],z+8);box(x-7.6,y-5.1,15.2,10.2,z+6,[48,90,55],z+4);box(x-3,y-1,6,2,z+14,[0,0,18],z+11);box(x-2,y+5,4,.8,z+9,[0,0,60],z+5)}};
const ic=t=>`<svg class="ic" viewBox="0 0 48 48">${ICO[t]}</svg>`,st=t=>{const w=T[t];return w.wp?(w.mg?`Dano ${w.dm} · Alcance ${w.rg} · ${(1/w.cd).toFixed(1)} tiros/s · Pente ${w.mg} · Recarga ${w.rl}s · Precisão ${Math.round((1-w.ac*4)*100)}%`:`Dano ${w.dm} · Alcance ${w.rg} · ${(1/w.cd).toFixed(1)} golpes/s`):''};
const ON=location.protocol!='file:'&&!!location.host;let TK=S('lc_tk')||'';
const API=(p,b)=>fetch('/api/'+p,{method:b?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TK},body:b?JSON.stringify(b):undefined}).then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||`Erro HTTP ${r.status}`);return j}).catch(e=>{if(e instanceof TypeError)throw new Error('Não foi possível conectar ao servidor. Execute "npm start" e abra http://localhost:3000.');throw e});
const hs=async s=>{try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch(e){return btoa(s)}};
function show(id){document.querySelectorAll('.scr').forEach(e=>e.classList.toggle('on',e.id===id));scr=id;if(id=='cfg'){$('cv1').value=cfg.vol;$('cv2').value=cfg.speed;$('cv3').value=cfg.res;$('cv4').value=cfg.fx}}
function beep(f,d=.1){if(!cfg.vol)return;try{AC=AC||new AudioContext();const o=AC.createOscillator(),v=AC.createGain();o.frequency.value=f;v.gain.value=cfg.vol*.15;o.connect(v);v.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const err=m=>{$('er').textContent=m};
async function doAuth(reg){const e=$('em').value.trim().toLowerCase(),p=$('pw').value,n=$('nk').value.trim();
 if(!e||!p)return err('Preencha e-mail e senha.');
 if(ON){try{const j=await API(reg?'register':'login',{email:e,password:p,nickname:n});TK=j.token;S('lc_tk',TK);me=j.user;if(j.cfg){cfg=Object.assign(cfg,j.cfg);S('lc_cfg',cfg)}err('');return toMenu()}catch(x){return err(x.message)}}
 const h=await hs(p);
 if(reg){if(!n||p.length<6)return err('Informe nickname e senha com 6+ caracteres.');if(users[e])return err('E-mail já cadastrado.');users[e]={n,h,st:{w:0,l:0,best:0}}}
 else if(!users[e]||users[e].h!==h)return err('Credenciais inválidas.');
 me=users[e];sv();err('');toMenu()}
function toMenu(){if(MP.on)mpLeave();g=null;const s=me.st;$('mn').innerHTML=`<b class="hi">Olá, ${me.n.replace(/[<>&]/g,'')}!</b><div class="stats"><div><b>${s.w}</b><small>Vitórias</small></div><div><b>${s.l}</b><small>Derrotas</small></div><div><b>${s.best}</b><small>Melhor dia</small></div></div><button onclick="start()">Jogar</button><button class="g" onclick="mpShow()">Multiplayer</button><button class="g" onclick="back='menu';show('cfg')">Configurações</button><button class="g" onclick="logout()">Sair</button>`;show('menu');RK();if(MP.inv){const c=MP.inv;MP.inv=null;history.replaceState(0,'',location.pathname);mpShow(c)}}
function saveCfg(){cfg={vol:+$('cv1').value,speed:+$('cv2').value,res:+$('cv3').value,fx:+$('cv4').value};S('lc_cfg',cfg);if(ON&&TK)API('cfg',cfg).catch(()=>{});sizeCv();show(back);if(back=='game')kick()}
function sizeCv(){const c=$('cv');c.width=cfg.res;c.height=Math.round(cfg.res*.625)}
const B=[],ZM=[],PO=[],BC={},ROADS=[],LAND=[],LOC=[],BASE={x:23*200+12,y:15*200+12,w:5*200-24,h:3*200-24};
const ZONE={ROAD:0,FOREST:1,CITY:2,INDUSTRIAL:3,MILITARY:4,RURAL:5};
const inBase=(i,j)=>i>=23&&i<=27&&j>=15&&j<=17;
function zoneAt(i,j){
  if(inBase(i,j))return ZONE.MILITARY;
  if(i>=17&&i<=23&&j>=7&&j<=13)return ZONE.INDUSTRIAL;
  if(i>=8&&i<=17&&j>=6&&j<=13)return ZONE.CITY;
  if((i<=6&&j<=8)||(i>=24&&j<=12)||(i<=7&&j>=14))return ZONE.FOREST;
  if((i>=7&&i<=11&&j>=14)||(i>=18&&j>=14))return ZONE.RURAL;
  return ZONE.ROAD;
}
for(let j=0;j<GY;j++)for(let i=0;i<GX;i++){
  const k=zoneAt(i,j),a=BC[i+','+j]=[];ZM[j*GX+i]=k;
  if(k===ZONE.CITY||k===ZONE.INDUSTRIAL||k===ZONE.MILITARY)PO.push([i,j]);
  const cellX=i*200,cellY=j*200;
  if(k===ZONE.FOREST){
    for(let n=0;n<12;n++){const t={x:cellX+18+(i*31+j*17+n*37)%160,y:cellY+18+(i*13+j*29+n*47)%160,w:10,h:10,tr:1,z:34+n%4*9,i,j,c:'#254b2b',kind:'tree'};B.push(t);a.push(t)}
    continue;
  }
  if(k===ZONE.MILITARY)continue;
  if(k===ZONE.ROAD){
    if((i+j*3)%4===0){const b={x:cellX+78,y:cellY+82,w:44,h:36,i,j,z:34,c:'#3b4652',kind:'shed'};B.push(b);a.push(b)}
    continue;
  }
  const patterns={
    [ZONE.CITY]:[['house',120,104,76],['apartment',108,142,112],['shop',124,82,68],['hospital',148,112,120],['school',150,100,92],['police',110,92,78],['church',100,120,105],['office',132,112,110]],
    [ZONE.INDUSTRIAL]:[['warehouse',158,92,72],['factory',142,128,88],['workshop',108,82,62],['depot',172,74,68],['garage',118,78,60]]
  }[k];
  const pick=patterns[(i*7+j*11)%patterns.length];
  const b={x:cellX+20,y:cellY+24,w:pick[1],h:pick[2],i,j,c:k===ZONE.INDUSTRIAL?'#57504a':'#454b55',z:pick[3],kind:pick[0],zone:k};
  if(k===ZONE.CITY&&(i+j)%5===0){b.w=150;b.h=92;b.kind='apartment'}
  B.push(b);a.push(b);
}
function addBaseBuilding(kind,x,y,w,h,z){const b={x,y,w,h,z,i:23,j:15,c:'#4b514e',kind,zone:ZONE.MILITARY,mil:true};B.push(b);for(let iy=Math.max(0,y/200|0);iy<=Math.min(GY-1,(y+h-1)/200|0);iy++)for(let ix=Math.max(0,x/200|0);ix<=Math.min(GX-1,(x+w-1)/200|0);ix++)BC[ix+','+iy].push(b);return b}
for(const b of [
  {x:BASE.x,y:BASE.y,w:BASE.w,h:12,kind:'mil-wall'},
  {x:BASE.x,y:BASE.y+BASE.h-12,w:BASE.w,h:12,kind:'mil-wall'},
  {x:BASE.x,y:BASE.y,w:12,h:BASE.h,kind:'mil-wall'},
  {x:BASE.x+BASE.w-12,y:BASE.y,w:12,h:BASE.h,kind:'mil-wall'}
])addBaseBuilding(b.kind,b.x,b.y,b.w,b.h,24);
addBaseBuilding('gate',BASE.x+BASE.w/2-55,BASE.y-3,110,18,28);
addBaseBuilding('barracks',BASE.x+55,BASE.y+58,220,76,82);
addBaseBuilding('barracks',BASE.x+55,BASE.y+170,220,76,82);
addBaseBuilding('admin',BASE.x+340,BASE.y+62,150,82,94);
addBaseBuilding('medic',BASE.x+340,BASE.y+180,150,72,78);
addBaseBuilding('hangar',BASE.x+560,BASE.y+55,360,128,76);
addBaseBuilding('warehouse',BASE.x+560,BASE.y+205,180,70,70);
addBaseBuilding('bunker',BASE.x+780,BASE.y+210,120,70,62);
for(const [x,y] of [[BASE.x+35,BASE.y+35],[BASE.x+BASE.w-45,BASE.y+35],[BASE.x+35,BASE.y+BASE.h-45],[BASE.x+BASE.w-45,BASE.y+BASE.h-45]])addBaseBuilding('watchtower',x,y,22,22,120);
for(let n=0;n<6;n++){const x=BASE.x+285+(n%3)*82,y=BASE.y+285+(n/3|0)*58;addBaseBuilding('container',x,y,60,28,30)}
const roadH=y=>ROADS.push({x:0,y:y-18,w:W,h:36,axis:'h',main:true});
const roadV=x=>ROADS.push({x:x-18,y:0,w:36,h:H,axis:'v',main:true});
roadH(5*200+100);roadH(10*200+100);roadH(15*200+100);roadH(18*200+100);roadV(6*200+100);roadV(12*200+100);roadV(18*200+100);roadV(23*200+100);
ROADS.push({x:7*200,y:3*200,w:15*200,h:32,axis:'h',main:false},{x:15*200,y:12*200,w:32,h:6*200,axis:'v',main:false});
LOC.push({name:'Cidade abandonada',x:12*200,y:10*200,zone:ZONE.CITY},{name:'Zona industrial',x:20*200,y:10*200,zone:ZONE.INDUSTRIAL},{name:'Base militar abandonada',x:BASE.x+BASE.w/2,y:BASE.y+BASE.h/2,zone:ZONE.MILITARY},{name:'Floresta norte',x:3*200,y:3*200,zone:ZONE.FOREST});
const hit=(x,y,r)=>x<r||y<r||x>W-r||y>H-r||(BC[(x/200|0)+','+(y/200|0)]||[]).some(b=>!b.tr&&x>b.x-r&&x<b.x+b.w+r&&y>b.y-r&&y<b.y+b.h+r);
const blk=(x,y)=>(BC[(x/200|0)+','+(y/200|0)]||[]).some(b=>!b.tr&&x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h),los=(x0,y0,x1,y1)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/16);for(let i=1;i<n;i++)if(blk(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false;return true};
const WP=['bastao','faca','pistola','revolver','espingarda','smg','rifle'],WW=[[3,3,3,2,2,1,1],[1,1,2,3,3,4,4],[2,2,2,2,3,3,4]],PK=[[.3,.6,.72,.86,.95],[.4,.75,.85,.93,.97],[.1,.2,.3,.5,.62],[.25,.5,.66,.8,.9],[.28,.52,.68,.82,.93],[.34,.68,.78,.9,.96]],zn=(x,y)=>ZM[Math.max(0,Math.min(GY-1,y/200|0))*GX+Math.max(0,Math.min(GX-1,x/200|0))]??0;
const pick=z=>{const zz=Math.max(0,Math.min(PK.length-1,z|0)),r=Math.random(),i=PK[zz].findIndex(v=>r<v);if(i>=0)return['comida','agua','ferramenta','municao','medkit'][i];const w=WW[zz>=ZONE.INDUSTRIAL?2:zz===ZONE.CITY?1:0];let q=Math.random()*w.reduce((a,b)=>a+b),k=0;while((q-=w[k])>0)k++;return WP[k]};
function spawn(t,nr){for(let k=0;k<40;k++){const c=!nr&&Math.random()<.55?PO[Math.random()*PO.length|0]:0,x=nr?g.p.x-260+Math.random()*520:c?c[0]*200+Math.random()*200:Math.random()*W,y=nr?g.p.y-260+Math.random()*520:c?c[1]*200+Math.random()*200:Math.random()*H;if(x<20||y<20||x>W-20||y>H-20||hit(x,y,14))continue;addItem({x,y,t:t||pick(zn(x,y))});return}}
function start(){try{AC=AC||new AudioContext();AC.resume()}catch(e){}sizeCv();g={p:{x:12*200+100,y:10*200+100},fx:1,fy:0,hp:100,f:100,s:100,t:0,inv:[],cap:10,items:[],sp:0,mon:[],ms:2,eq:null,mag:{},res:0,cd:0,rl:0,sw:0,kills:0,sel:null,tr:null,veh:[],iv:0,kx:0,ky:0,hurt:0,sh:0,es:0,cause:'',paused:false,over:false,msg:'',mt:0,last:performance.now()};
 MM=MM||mkMap();g.fog=mkFog();setMm(0);for(let i=0;i<180;i++)spawn();['bastao','comida','agua','medkit'].forEach(t=>spawn(t,1));for(let i=0;i<35;i++)spawn('municao');for(let i=0;i<24;i++){const x=BASE.x+35+Math.random()*(BASE.w-70),y=BASE.y+35+Math.random()*(BASE.h-70);if(!hit(x,y,12))addItem({x,y,t:Math.random()<.55?'municao':pick(ZONE.MILITARY)})}for(let i=0;i<VMAX;i++)spawnVeh();$('end').classList.remove('on');$('inv').classList.remove('on');renderInv();[['sh','vida','Vida'],['sf','comida','Fome'],['ss','agua','Sede']].forEach(([i,t,n])=>$(i).querySelector('span').innerHTML=ic(t)+n);show('game');kick()}
function kick(){if(!looping){looping=true;g.last=performance.now();requestAnimationFrame(loop)}}
const wt=()=>g.inv.reduce((a,t)=>a+T[t].w,0);
const playing=()=>scr=='game'&&g&&!g.over&&!g.paused;
function say(m){g.msg=m;g.mt=1.6}
function collect(){if(!playing())return;const it=near();if(!it)return;if(wt()+T[it.t].w>g.cap){beep(120);return say('Mochila cheia!')}
 if(MP.cl){mps({t:'tk',id:it.id});g.items.splice(g.items.indexOf(it),1);return}g.inv.push(it.t);rmItem(it);beep(520);fx(g.p.x,g.p.y,COL[it.t]);say('+ '+T[it.t].n);renderInv()}
function near(){return g.items.find(i=>Math.hypot(i.x-g.p.x,i.y-g.p.y)<28)}
function use(t){const i=g.inv.indexOf(t);if(i<0||g.over||g.paused)return;
 if(T[t].wp)return equip(t);if(t=='municao')return say('Use R para recarregar');
 if(t=='medkit'){if(g.hp>=100)return say('Vida cheia');if(g.mc>0)return say('Aguarde '+Math.ceil(g.mc)+'s')}
 g.inv.splice(i,1);if(t=='comida')g.f=Math.min(100,g.f+40);else if(t=='agua')g.s=Math.min(100,g.s+40);else if(t=='medkit'){g.hp=Math.min(100,g.hp+35);g.mc=10;say('+35 de vida')}else{g.cap+=5;say('Mochila +5 kg')}beep(700);fx(g.p.x,g.p.y,COL[t]);renderInv()}
function equip(t){g.eq=g.eq==t?null:t;if(g.eq&&g.mag[t]==null)g.mag[t]=0;beep(380);say(g.eq?T[t].n+' equipado':'Arma guardada');renderInv()}
function drop(t){const i=g.inv.indexOf(t);if(i<0)return;g.inv.splice(i,1);if(g.eq==t&&!g.inv.includes(t))g.eq=null;const x=g.p.x+g.fx*22,y=g.p.y+g.fy*22;addItem(hit(x,y,10)?{x:g.p.x,y:g.p.y,t}:{x,y,t});beep(300);renderInv()}
function sel(t){g.sel=g.sel==t?null:t;renderInv()}
function renderInv(){if(!g)return;const w=wt();let h=`<div class="bk"><div class="hd"><b>Mochila</b><span>${w}/${g.cap} kg</span><button class="g" onclick="toggleInv()" aria-label="Fechar">✕</button></div>`;
 for(let c=0,k;c<3;c++){k=0;h+=`<div class="cp"><small>${CN[c]}</small><div class="gr">`;for(const t in T){if(T[t].c!=c)continue;const n=g.inv.filter(i=>i===t).length;if(n){k++;h+=`<button class="sl${g.sel==t?' on':''}${g.eq==t?' eq':''}" onclick="sel('${t}')">${ic(t)}<b>×${n}</b><small>${T[t].n}</small></button>`}}h+='<div class="sl em"></div>'.repeat(Math.max(4,Math.ceil(k/4)*4)-k)+'</div></div>'}
 h+=`<div class="cp"><small>Ocupado ${w} kg · livre ${g.cap-w} kg</small><div class="oc">${g.inv.flatMap(t=>Array(T[t].w).fill(t)).map(t=>`<i style="background:${COL[t]}"></i>`).join('')}${'<i class="fr"></i>'.repeat(g.cap-w)}</div></div>`;
 const s=g.sel&&g.inv.includes(g.sel)?g.sel:null;
 h+=`<div class="ds">${s?`<b>${T[s].n}</b><small>${T[s].w} kg. ${T[s].d}</small><small>${st(s)}</small><div><button onclick="use('${s}')" ${s=='municao'?'disabled':''}>${T[s].wp?(g.eq==s?'Desequipar':'Equipar'):'Usar'}</button><button class="g" onclick="drop('${s}')">Largar</button></div>`:'<small>Toque em um item para selecioná-lo.</small>'}</div></div>`;$('inv').innerHTML=h}
function cycle(){if(!playing())return;const w=WP.filter(t=>g.inv.includes(t)),i=w.indexOf(g.eq);g.eq=i+1<w.length?w[i+1]:null;if(g.eq&&g.mag[g.eq]==null)g.mag[g.eq]=0;say(g.eq?T[g.eq].n:'Desarmado');renderInv()}
function reload(){if(!playing()||!g.eq||!T[g.eq].mg||g.rl>0||(g.mag[g.eq]|0)>=T[g.eq].mg)return;if(!g.res&&!g.inv.includes('municao'))return say('Sem munição');g.rl=T[g.eq].rl;beep(240,.15);say('Recarregando...')}
function doRl(){const t=g.eq;if(!t||!T[t].mg)return;while((g.mag[t]|0)<T[t].mg){if(!g.res){const i=g.inv.indexOf('municao');if(i<0)break;g.inv.splice(i,1);g.res=6}g.mag[t]=(g.mag[t]|0)+1;g.res--}beep(420,.1);renderInv()}
function attack(){if(!playing()||g.cd>0||g.rl>0)return;const t=g.eq,w=t?T[t]:{dm:6,rg:24,cd:.5};
 if(w.mg){if(!g.mag[t]){beep(150,.05);g.cd=.3;return g.res||g.inv.includes('municao')?reload():say('Sem munição')}g.mag[t]--}
 const p=g.p;let a=g.fx,b=g.fy;g.cd=w.cd;if(w.ac){const q=(Math.random()-.5)*w.ac*2,c=Math.cos(q),n=Math.sin(q);[a,b]=[a*c-b*n,a*n+b*c]}
 let hs=g.mon.map(m=>{const dx=m.x-p.x,dy=m.y-p.y,l=dx*a+dy*b,d=Math.abs(dx*b-dy*a);return[m,l>0&&l<w.rg+12&&m.lo!==false&&d<(w.sp?l*.4+12:w.mg?13:22)?l:0]}).filter(h=>h[1]).sort((u,v)=>u[1]-v[1]);
 if(!w.sp)hs=hs.slice(0,1);hs.forEach(h=>hurtM(h[0],w.dm));
 if(w.mg){const l=hs.length&&!w.sp?hs[0][1]:w.rg;g.tr={x:p.x+a*10,y:p.y+b*10,x2:p.x+a*l,y2:p.y+b*l,l:.08};fx(p.x+a*14,p.y+b*14,'#ffd58a',4);beep(w.f,.1);g.sh=Math.max(g.sh,t=='rifle'?.4:.15)}else{g.sw=.2;beep(210,.07)}if(MP.on)mpAt(w.mg?g.tr:0)}
function hurtM(m,d){if(MP.cl){mps({t:'mh',i:m.id,d});m.fl=.12;fx(m.x,m.y,'#8a1c1c',6);beep(260,.05);return}m.hp-=d;m.fl=.12;fx(m.x,m.y,'#8a1c1c',6);beep(260,.05);const l=Math.hypot(m.x-g.p.x,m.y-g.p.y)||1,nx=m.x+(m.x-g.p.x)/l*6,ny=m.y+(m.y-g.p.y)/l*6;if(!hit(nx,ny,9)){m.x=nx;m.y=ny}
 if(m.hp<=0){g.mon.splice(g.mon.indexOf(m),1);g.kills++;fx(m.x,m.y,'#4d6142',18);beep(140,.2);const r=Math.random(),t=r<.25?'comida':r<.5?'municao':r<.6?'agua':r<.65?'ferramenta':r<.69?'medkit':0;if(t)addItem({x:m.x,y:m.y,t});say('Zumbi derrotado')}}
const LV=()=>({x:g.p.x,y:g.p.y,fx:g.fx,fy:g.fy,eq:g.eq,mv:g.mv,cd:g.cd,hurt:g.hurt}),rp=()=>{const l=[g.p,...Object.values(MP.pl).filter(r=>!r.dead)];return l[Math.random()*l.length|0]},
tgt=m=>{let b=g.over?null:g.p,bd=b?Math.hypot(b.x-m.x,b.y-m.y):1e9;for(const id in MP.pl){const r=MP.pl[id];if(r.dead)continue;const d=Math.hypot(r.x-m.x,r.y-m.y);if(d<bd){b=r;bd=d}}return b||g.p},
nearP=v=>Math.abs(v.x-g.p.x)<900&&Math.abs(v.y-g.p.y)<900||MP.host&&Object.values(MP.pl).some(r=>Math.abs(v.x-r.x)<900&&Math.abs(v.y-r.y)<900),
vdr=(v,dt)=>{v.p+=v.d*v.sp*dt;v.l+=(lat(v)-v.l)*Math.min(1,dt*3);vpos(v)};
function addItem(o){if(MP.cl){if(MP.ready)mps({t:'iq',o:{x:Math.round(o.x),y:Math.round(o.y),t:o.t}});return}o.id=++MP.iid;g.items.push(o);if(MP.host)mps({t:'ia',o})}
function rmItem(it){g.items.splice(g.items.indexOf(it),1);if(MP.host)mps({t:'ir',id:it.id})}
function visM(dt){const r=270+(1-(g.nt||0))*250;for(const m of g.mon){m.lv=(m.lv||0)-dt;if(m.lv<=0){m.lv=.15+Math.random()*.1;m.lo=los(m.x,m.y,g.p.x,g.p.y)}m.vs=m.lo&&Math.hypot(m.x-g.p.x,m.y-g.p.y)<r}}
const MX=()=>(g.t%DAY/DAY>.5?5:3)+(zn(g.p.x,g.p.y)==ZONE.CITY?4:0)+(zn(g.p.x,g.p.y)==ZONE.MILITARY?7:0);
function spawnM(){for(let k=0;k<12;k++){const Q=rp(),a=Math.random()*6.28,r=320+Math.random()*300,x=Q.x+Math.cos(a)*r,y=Q.y+Math.sin(a)*r;if(hit(x,y,12))continue;const d=Math.floor(g.t/DAY),zone=zn(x,y),br=(zone===ZONE.CITY||zone===ZONE.MILITARY)&&Math.random()<.5,h=(40+d*2)*(br?2:1);g.mon.push({id:++MP.mid,x,y,s:br?1.35:0,hp:h,mh:h,v:(55+Math.min(d,20))*(br?.8:1),dm:Math.round((6+(d/6|0))*(br?1.5:1)),fl:0,ac:0,w:0,a:0,dx:0,dy:1,ph:Math.random()*6,ch:0});return}}
function updMon(dt){if(g.tr)g.tr.l-=dt;g.ms-=dt;if(g.ms<=0){g.ms=6;if(g.mon.length<MX()*(1+Object.keys(MP.pl).length*.7))spawnM()}
 for(let i=g.mon.length-1;i>=0;i--){const m=g.mon[i];m.fl-=dt;m.ac-=dt;const P=tgt(m),dx=P.x-m.x,dy=P.y-m.y,d=Math.hypot(dx,dy)||1;
  if(d>1000){g.mon.splice(i,1);continue}
  m.lt=(m.lt||0)-dt;if(m.lt<=0){m.lt=.15+Math.random()*.1;m.ls=los(m.x,m.y,P.x,P.y)}if(d<230&&m.ls)m.mem=3;m.mem=(m.mem||0)-dt;m.ch=m.mem>0;let vx,vy,s=m.v;if(m.ch){vx=dx/d;vy=dy/d}else{m.w-=dt;if(m.w<=0){m.w=1.5+Math.random()*2;m.a=Math.random()*6.28}vx=Math.cos(m.a);vy=Math.sin(m.a);s*=.35}
  m.dx=vx;m.dy=vy;if(d>16){const nx=m.x+vx*s*dt,ny=m.y+vy*s*dt;if(!hit(nx,m.y,9))m.x=nx;else m.a+=1.6;if(!hit(m.x,ny,9))m.y=ny;else m.a+=1.6}
  if(d<20&&m.ac<=0&&(P.id||g.iv<=0)){m.ac=1;if(P.id)mps({t:'dmg',to:P.id,d:m.dm});else{dmg(m.dm,'zumbi');g.iv=.5;fx(g.p.x,g.p.y,'#e5484d',10)}}}}
function mon(m){const s=m.s||1,dx=m.dx,dy=m.dy,px=-dy,py=dx,f=m.fl>0,c=m.ch,at=m.ac>.7,ph=g.t*(c?7:4.5)+m.ph,w=Math.sin(ph),z=Math.abs(w)*(c?1.6:1),sk=f?'#fff':m.s?'#8a7a5a':'#7f9a6a',sd=f?'#fff':m.s?'#5a2a2a':'#4d6142',sh=f?'#fff':m.s?'#4e2c2c':'#5c4a3a',pn=f?'#fff':'#343844',ln=at?5:c?3:1,sw=Math.sin(ph*.5)*1.5,
 P=(u,v,h,r,q)=>sph(m.x+(dx*u+px*v)*s,m.y+(dy*u+py*v)*s,z+h*s,r*s,q),
 body=()=>{P(-1+ln*.3,0,12,7,sh);P(ln*.5,0,18.5,6,sh);P(4+ln*.5,-2.5,19,1.9,f?'#fff':'#8a1c1c')},
 arms=()=>{for(const e of[-1,1]){if(c||at){P(6+ln,6.5*e,17,2.8,sk);P(12+ln+(at?5:0)+w*e*1.5,5.5*e,at?19:17,2.5,sd)}else{P(1,7.5*e,13,2.8,sk);P(2+w*e*2,8*e,8,2.5,sd)}}};
 for(const e of[-1,1]){P(w*e*4,3.4*e,7,3,pn);P(w*e*4+1,3.4*e,1.5,2.4,sd)}
 if(dy<0){arms();body()}else{body();arms()}
 P(2+ln,sw,26.5,5.6,sk);for(const e of[-1,1])P(6.6+ln,sw+2.2*e,27.5,1.1,f?'#fff':'#ffe066');
 if(m.hp<m.mh){const p=cam(m.x,m.y,46*s);if(p.z>N){const k=F/p.z,sx=cw/2+p.x*k,sy=cy0-p.y*k,bw=24*k;X.fillStyle='#000a';X.fillRect(sx-bw/2,sy,bw,3);X.fillStyle='#e5484d';X.fillRect(sx-bw/2,sy,bw*m.hp/m.mh,3)}}}
function wpart(x,y,z,a,b,u,l,wd,z0,z1,k,s){const px=-b,py=a,h=wd/2,c=[[u,-h],[u+l,-h],[u+l,h],[u,h]].map(([t,v])=>[x+(a*t+px*v)*s,y+(b*t+py*v)*s]),f=n=>`hsl(${k[0]},${k[1]}%,${Math.min(90,k[2]*n)}%)`,q=[];
 for(let i=0;i<4;i++){const e=c[i],n=c[(i+1)%4];q.push([e[1]+n[1],[[e[0],e[1],z+z0*s],[n[0],n[1],z+z0*s],[n[0],n[1],z+z1*s],[e[0],e[1],z+z1*s]],f(i%2?.7:.9)])}
 q.sort((m,n)=>m[0]-n[0]);for(const o of q)poly(o[1],o[2]);poly(c.map(p=>[p[0],p[1],z+z1*s]),f(1.5))}
function wpn(hx,hy,hz,o){const t=o.eq,G=GR[t];for(const q of WM[t])wpart(hx,hy,hz-2.5,o.fx,o.fy,q[0]+G,q[1],q[2],q[3],q[4],q[5],1.1);sph(hx,hy,hz,2.6,'#e0b48a')}
function drawTr(){const r=g.tr;if(!r||r.l<=0)return;const a=cam(r.x,r.y,22),b=cam(r.x2,r.y2,22);if(a.z>N&&b.z>N){X.strokeStyle='#fff1c0';X.lineWidth=2.5;X.shadowColor='#ffb347';X.shadowBlur=12;X.beginPath();X.moveTo(cw/2+a.x*F/a.z,cy0-a.y*F/a.z);X.lineTo(cw/2+b.x*F/b.z,cy0-b.y*F/b.z);X.stroke();X.shadowBlur=0;sph(r.x,r.y,22,7,'#ffd58a')}}
function hudW(){const t=g.eq,w=t&&T[t],s=w?ic(t)+' '+w.n+(w.mg?' '+(g.mag[t]|0)+'/'+(g.res+6*g.inv.filter(x=>x=='municao').length)+(g.rl>0?' ↻':''):''):'✊ Desarmado';if(hudW.l!==s)$('wp').innerHTML=hudW.l=s}
function mkTex(){PT={};const rnd=(()=>{let s=11;return()=>(s=s*16807%2147483647)/2147483647})(),SZ=128,
 mk=(n,f)=>{const c=document.createElement('canvas');c.width=c.height=SZ;f(c.getContext('2d'));PT[n]=X.createPattern(c,'repeat')},
 sp=(x,n,a,s)=>{for(let i=0;i<n;i++){x.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,255,255'},${rnd()*a})`;x.fillRect(rnd()*SZ,rnd()*SZ,s*(.5+rnd()),s*(.5+rnd()))}};
 mk('brick',x=>{for(let r=0;r<8;r++){const o=r%2?16:0;for(let c=0;c<5;c++){x.fillStyle=`rgba(0,0,0,${rnd()*.22})`;x.fillRect(c*32-o,r*16,32,16);x.fillStyle='rgba(230,225,215,.28)';x.fillRect(c*32-o,r*16,2,14)}x.fillRect(0,r*16+14,SZ,2)}sp(x,200,.1,2)});
 mk('concrete',x=>{sp(x,900,.13,2);x.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<4;i++){let px=rnd()*SZ,py=rnd()*SZ;x.beginPath();x.moveTo(px,py);for(let k=0;k<5;k++)x.lineTo(px+=rnd()*14-7,py+=rnd()*14);x.stroke()}});
 mk('wood',x=>{for(let i=0;i<8;i++){x.fillStyle=`rgba(0,0,0,${rnd()*.18})`;x.fillRect(i*16,0,16,SZ);x.fillStyle='rgba(0,0,0,.4)';x.fillRect(i*16,0,1.5,SZ)}for(let i=0;i<70;i++){x.fillStyle=`rgba(${rnd()<.5?'0,0,0':'255,220,160'},${rnd()*.14})`;x.fillRect(rnd()*SZ,rnd()*SZ,1,8+rnd()*40)}});
 mk('metal',x=>{for(let i=0;i<16;i++){x.fillStyle='rgba(255,255,255,.2)';x.fillRect(0,i*8,SZ,1);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,i*8+4,SZ,1.5)}for(let i=0;i<30;i++){x.fillStyle=`rgba(130,60,20,${rnd()*.22})`;x.fillRect(rnd()*SZ,rnd()*SZ,2+rnd()*8,2+rnd()*8)}sp(x,150,.08,1)});
 mk('asphalt',x=>sp(x,1200,.14,2));MAT=[PT.brick,PT.concrete,PT.wood,PT.metal]}
const MS=.2;let MM;
function mkMap(){const c=document.createElement('canvas');c.width=W*MS;c.height=H*MS;const x=c.getContext('2d'),ZC=['#2b3038','#18351f','#4a2c2c','#3d3c33','#26352e','#403a2d'],BC2=['','#365b39','#c0705a','#b3ae94','#58665f','#8a7757'];x.fillStyle='#4a515c';x.fillRect(0,0,c.width,c.height);
 for(let j=0;j<GY;j++)for(let i=0;i<GX;i++){x.fillStyle=ZC[ZM[j*GX+i]];x.fillRect((i*200+20)*MS,(j*200+20)*MS,160*MS,160*MS)}
 for(const r of ROADS){x.fillStyle='#262b31';x.fillRect(r.x*MS,r.y*MS,r.w*MS,r.h*MS)}for(const b of B){if(b.tr)continue;x.fillStyle=BC2[b.zone??ZM[b.j*GX+b.i]]||'#8f9aad';x.fillRect(b.x*MS,b.y*MS,b.w*MS,b.h*MS)}x.fillStyle='#b7a35a';x.fillRect(BASE.x*MS,BASE.y*MS,BASE.w*MS,BASE.h*MS);x.strokeStyle='#e2c96a';x.strokeRect(BASE.x*MS,BASE.y*MS,BASE.w*MS,BASE.h*MS);
 x.fillStyle='#ffd23f';x.strokeStyle='#000';x.lineWidth=1;for(const[i,j]of PO){const a=(i*200+100)*MS,b=(j*200+100)*MS;x.beginPath();x.moveTo(a,b-6);x.lineTo(a+5,b);x.lineTo(a,b+6);x.lineTo(a-5,b);x.closePath();x.fill();x.stroke()}return c}
function mkFog(){const f=document.createElement('canvas');f.width=W*MS;f.height=H*MS;const x=f.getContext('2d');x.fillStyle='rgba(8,10,14,.95)';x.fillRect(0,0,f.width,f.height);return f}
function reveal(){const p=g.p;if(g.rx!=null&&Math.hypot(p.x-g.rx,p.y-g.ry)<25)return;g.rx=p.x;g.ry=p.y;const C=g.fog.getContext('2d'),x=p.x*MS,y=p.y*MS,r=260*MS,q=C.createRadialGradient(x,y,r*.6,x,y,r);C.globalCompositeOperation='destination-out';q.addColorStop(0,'#000');q.addColorStop(1,'#0000');C.fillStyle=q;C.beginPath();C.arc(x,y,r,0,7);C.fill();C.globalCompositeOperation='source-over'}
function setMm(b){const c=$('mm');c.classList.toggle('big',b);c.width=b?560:210;c.height=b?400:150}
function toggleMap(){if(g&&scr=='game')setMm(!$('mm').classList.contains('big'))}
function drawMap(){const c=$('mm'),C=c.getContext('2d'),p=g.p,s=c.width/W,q=c.width/(c.clientWidth||c.width),big=c.width>300,dist=o=>Math.hypot(o.x-p.x,o.y-p.y);
 C.drawImage(MM,0,0,c.width,c.height);C.drawImage(g.fog,0,0,c.width,c.height);
 for(const i of g.items)if(dist(i)<300){C.fillStyle=COL[i.t];C.fillRect(i.x*s-1.5*q,i.y*s-1.5*q,3*q,3*q)}
 for(const v of g.veh){if(dist(v)>420)continue;const a=(v.ax?v.t.w:v.t.L)*s,b=(v.ax?v.t.L:v.t.w)*s;C.fillStyle='#ffd23f';C.strokeStyle='#000';C.lineWidth=q*.8;C.fillRect(v.x*s-Math.max(a,3*q)/2,v.y*s-Math.max(b,3*q)/2,Math.max(a,3*q),Math.max(b,3*q));C.strokeRect(v.x*s-Math.max(a,3*q)/2,v.y*s-Math.max(b,3*q)/2,Math.max(a,3*q),Math.max(b,3*q))}
 C.fillStyle='#e5484d';for(const m of g.mon)if(m.vs&&dist(m)<350){C.beginPath();C.arc(m.x*s,m.y*s,2.5*q,0,7);C.fill()}
 C.strokeStyle='#f2a93b';C.lineWidth=1.5*q;C.beginPath();C.arc(p.x*s,p.y*s,(7+Math.sin(g.t*5)*2)*q,0,7);C.stroke();
 C.save();C.translate(p.x*s,p.y*s);C.rotate(Math.atan2(g.fy,g.fx));C.scale(q,q);C.fillStyle='#fff';C.strokeStyle='#000';C.lineWidth=1.5;C.beginPath();C.moveTo(6,0);C.lineTo(-4,4.5);C.lineTo(-2,0);C.lineTo(-4,-4.5);C.closePath();C.fill();C.stroke();C.restore();
 if(big){C.fillStyle='#f2d778';C.font='bold 11px system-ui';C.fillText('BASE MILITAR',BASE.x*s+5*q,BASE.y*s+13*q);C.fillStyle='#000b';C.fillRect(0,c.height-20,c.width,20);C.font='11px system-ui';C.textBaseline='middle';[['#fff','▲ Você'],['#c0705a','■ Construção'],['#ffd23f','◆ Ponto de saque'],['#ffd23f','▬ Veículo'],['#e5484d','● Zumbi']].reduce((x,[k,t])=>{C.fillStyle=k;C.fillText(t,x,c.height-10);return x+C.measureText(t).width+14},8)}}
function toggleInv(){$('inv').classList.toggle('on');renderInv()}
function pause(){if(!g||g.over)return;if(MP.on)return say('Sem pausa no multiplayer');g.paused=!g.paused;const e=$('end');
 if(g.paused){e.innerHTML=`<h1>PAUSA</h1><button onclick="pause()">Continuar</button><button class="g" onclick="back='game';show('cfg')">Configurações</button><button class="g" onclick="toMenu()">Menu</button>`;e.classList.add('on')}else e.classList.remove('on')}
function finish(w){g.over=true;const d=Math.min(30,Math.floor(g.t/DAY)+1),s=me.st;w?s.w++:s.l++;s.best=Math.max(s.best,d);sv();if(ON&&TK)API('match',{mode:MP.began?'coop':'solo',win:w?1:0,days:d,kills:g.kills,cause:g.cause||'',dur:Math.round(g.t),room:MP.code||''}).then(j=>Object.assign(me.st,j.st)).catch(()=>{});
 $('end').innerHTML=`<h1>${w?'VITÓRIA':'GAME OVER'}</h1><p>${w?'Você sobreviveu aos 30 dias!':'Você morreu no dia '+d+(g.cause?' ('+g.cause+')':'')+'. A nova tentativa recomeça no dia 1.'}</p><button onclick="start()">Jogar novamente</button><button class="g" onclick="toMenu()">Menu</button>`;$('end').classList.add('on');if(MP.on){const b=$('end').querySelector('button');if(b&&/^Jogar/.test(b.textContent))b.remove()}beep(w?660:110,.5)}
addEventListener('keydown',e=>{
 if(scr=='auth'&&e.key=='Enter')return doAuth(0);
 if(scr!='game'||!g)return;const k=e.key.toLowerCase();K[k]=1;
 if(k.startsWith('arrow')||k==' ')e.preventDefault();
 if(k=='e')collect();if(k=='r')reload();if(k=='q')cycle();if(k=='m')toggleMap();if(k=='i'&&!g.over)toggleInv();
 if(k=='p'||k=='escape')pause();if(k=='1')use('comida');if(k=='2')use('agua');if(k=='3')use('ferramenta');if(k=='4')use('medkit')});
$('cv').addEventListener('mousedown',e=>{if(e.button==0){K.mouse=1;attack()}});$('cv').addEventListener('contextmenu',e=>e.preventDefault());addEventListener('mouseup',e=>{if(e.button==0)K.mouse=0});
addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
addEventListener('blur',()=>{for(const k in K)K[k]=0;J.x=J.y=0});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&scr=='game'&&g&&!g.paused)pause()});
$('bLogin').addEventListener('click',()=>doAuth(0));$('bReg').addEventListener('click',()=>doAuth(1));$('bSave').addEventListener('click',saveCfg);
$('pw').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth(0)});
$('em').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth(0)});
$('bBack').onclick=()=>{show(back);if(back=='game')kick()};
$('tE').onclick=collect;$('tA').onclick=attack;$('tR').onclick=reload;$('tI').onclick=()=>{if(g&&!g.over)toggleInv()};$('tP').onclick=pause;$('mm').onclick=toggleMap;
const jz=$('joy'),kn=$('knob');
const jm=e=>{const r=jz.getBoundingClientRect(),R=r.width/2;let x=(e.clientX-r.left-R)/R,y=(e.clientY-r.top-R)/R;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}J.x=x;J.y=y;kn.style.transform=`translate(${x*R*.5}px,${y*R*.5}px)`};
const jr=()=>{J.x=J.y=0;kn.style.transform=''};
jz.addEventListener('pointerdown',e=>{jz.setPointerCapture(e.pointerId);jm(e)});
jz.addEventListener('pointermove',e=>{if(e.buttons)jm(e)});
jz.addEventListener('pointerup',jr);jz.addEventListener('pointercancel',jr);
const VT={carro:{v:105,L:34,w:18,h:12,c:7,m:1,k:[[8,60,45],[210,50,42],[45,70,50]]},caminhao:{v:65,L:54,w:22,h:22,c:0,m:1.7,k:[[25,55,35],[0,0,55]]},moto:{v:150,L:22,w:9,h:9,c:5,m:.5,k:[[0,75,45]]}},VS=['carro','carro','carro','caminhao','moto'],VMAX=12,VLANE=15,EDGE=50;
const FD=[44,58,80],FN=[10,13,20],mc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t|0),STAR=Array.from({length:40},(_,i)=>[(i*97%100)/100,(i*53%100)/100*.22,i%3?1:2]);
const lat=v=>v.d*VLANE*(v.ax?1:-1);
function vpos(v){if(v.ax){v.x=v.r*200+v.l;v.y=v.p}else{v.x=v.p;v.y=v.r*200+v.l}}
function spawnVeh(){for(let k=0;k<10;k++){const t=VT[VS[Math.random()*VS.length|0]],ax=Math.random()<.5?0:1,d=Math.random()<.5?-1:1,v={t,ax,d,r:1+(Math.random()*(ax?GX-1:GY-1)|0),p:60+Math.random()*((ax?H:W)-120),l:0,cr:t.v*(.8+Math.random()*.4),k:t.k[Math.random()*t.k.length|0]};
 v.l=lat(v);v.sp=v.cr;vpos(v);if(Math.hypot(v.x-g.p.x,v.y-g.p.y)<160||g.veh.some(o=>Math.hypot(o.x-v.x,o.y-v.y)<70))continue;g.veh.push(v);return}}
function updVeh(v,dt){let tg=v.cr;
 for(const o of g.veh){if(o===v||o.ax!==v.ax||o.r!==v.r||o.d!==v.d)continue;const gap=(o.p-v.p)*v.d-(v.t.L+o.t.L)/2;if(gap>-5&&gap<45)tg=Math.min(tg,gap<14?0:o.sp)}
 v.sp+=(tg-v.sp)*Math.min(1,dt*(tg<v.sp?4:1.2));
 const q=v.p,lim=v.ax?H:W;v.p+=v.d*v.sp*dt;
 if(v.p<EDGE||v.p>lim-EDGE){v.p=Math.min(lim-EDGE,Math.max(EDGE,v.p));v.d=-v.d;v.sp*=.3}
 const a=Math.floor(q/200),b=Math.floor(v.p/200),c=Math.max(a,b);
 if(a!==b&&c>=1&&c<=(v.ax?GY-1:GX-1)&&Math.random()<.3){const np=v.r*200+v.l;v.l=v.p-c*200;v.ax=1-v.ax;v.r=c;v.p=np;v.d=Math.random()<.5?-1:1}
 v.l+=(lat(v)-v.l)*Math.min(1,dt*3);vpos(v)}
function vHit(v){const p=g.p,hw=(v.ax?v.t.w:v.t.L)/2,hd=(v.ax?v.t.L:v.t.w)/2;return Math.hypot(p.x-Math.max(v.x-hw,Math.min(p.x,v.x+hw)),p.y-Math.max(v.y-hd,Math.min(p.y,v.y+hd)))<10}
function dmg(n,c){g.hp-=n;g.cause=c;g.hurt=.6;g.sh=1;beep(90,.25)}
function crash(v){const p=g.p,dx=p.x-v.x,dy=p.y-v.y,l=Math.hypot(dx,dy)||1,f=v.sp>20?v.sp*2:60;g.kx=dx/l*f;g.ky=dy/l*f;
 if(g.iv>0||v.sp<20)return;dmg(Math.round(v.sp*v.t.m*.3),'atropelamento');g.iv=1.2;v.sp*=.4;fx(p.x,p.y,'#e5484d',22)}
let EN;
function engine(a){if(!AC)return;if(!EN){const o=AC.createOscillator(),f=AC.createBiquadFilter(),v=AC.createGain();o.type='sawtooth';f.type='lowpass';f.frequency.value=260;v.gain.value=0;o.connect(f);f.connect(v);v.connect(AC.destination);o.start();EN={o,v}}
 let m=1e9,s=0;if(a)for(const x of g.veh){const d=Math.hypot(x.x-g.p.x,x.y-g.p.y);if(d<m){m=d;s=x.sp}}
 EN.v.gain.setTargetAtTime(a?cfg.vol*.09*Math.max(0,1-m/450):0,AC.currentTime,.08);EN.o.frequency.setTargetAtTime(38+s*.5,AC.currentTime,.1)}
function loop(now){if(!g||scr!='game'){looping=false;engine(0);return}
 const dt=Math.min(.05,(now-g.last)/1000);g.last=now;if(MP.began)mpTick(dt);
 if(!g.paused&&!g.over){
  const dx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+J.x,dy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+J.y,l=Math.hypot(dx,dy);
  if(l>.08){const m=Math.min(1,l)/l,v=150*cfg.speed*dt,nx=g.p.x+dx*m*v,ny=g.p.y+dy*m*v;g.fx=dx/l;g.fy=dy/l;if(!hit(nx,g.p.y,10))g.p.x=nx;if(!hit(g.p.x,ny,10))g.p.y=ny}
  if(g.kx||g.ky){const nx=g.p.x+g.kx*dt,ny=g.p.y+g.ky*dt;if(!hit(nx,g.p.y,10))g.p.x=nx;if(!hit(g.p.x,ny,10))g.p.y=ny;const q=Math.max(0,1-dt*6);g.kx*=q;g.ky*=q;if(Math.hypot(g.kx,g.ky)<5)g.kx=g.ky=0}
  g.t+=dt;g.f=Math.max(0,g.f-dt*100/480);g.s=Math.max(0,g.s-dt*100/360);
  if(g.f<=0){g.hp-=dt*3;g.cause='fome'}if(g.s<=0){g.hp-=dt*4;g.cause='sede'}if(g.f>50&&g.s>50)g.hp=Math.min(100,g.hp+dt*1.5);
  g.sp+=dt;if(g.sp>4){g.sp=0;if(!MP.cl&&g.items.length<90)spawn()}g.mt-=dt;for(const v of g.veh)if(nearP(v)){MP.cl?vdr(v,dt):updVeh(v,dt);if(vHit(v))crash(v)}g.iv-=dt;g.mc=Math.max(0,(g.mc||0)-dt);visM(dt);if(!MP.cl)updMon(dt);g.cd-=dt;if(K.mouse)attack();g.sw-=dt;if(g.rl>0&&(g.rl-=dt)<=0)doRl();g.hurt=Math.max(0,g.hurt-dt);g.sh=Math.max(0,g.sh-dt*3);
  if(g.hp<=0){g.hp=0;finish(false)}else if(g.t>=30*DAY)finish(true)}else if(MP.on&&MP.began&&g.over&&!g.paused)mpDead(dt);
 if(++g.es%4==0)engine(!g.paused&&!g.over);
 draw();requestAnimationFrame(loop)}
let X,cw,ch,F,cy0,CX,CY;const vis=(x,y,r=1000)=>Math.hypot(x-CX,y-CY)<r;const D=520,CP=Math.cos(.95),SP=Math.sin(.95),N=30;
const cam=(x,y,z)=>{const dy=y-CY-D*CP,dz=z-D*SP;return{x:x-CX,y:-SP*dy+CP*dz,z:-CP*dy-SP*dz}};
let TP=null,PT,MAT;
function poly(a,fill,line){const q=a.map(p=>cam(...p)),o=[];for(let i=0;i<q.length;i++){const s=q[i],e=q[(i+1)%q.length],si=s.z>N;if(si)o.push(s);if(si!=e.z>N){const t=(N-s.z)/(e.z-s.z);o.push({x:s.x+(e.x-s.x)*t,y:s.y+(e.y-s.y)*t,z:N})}}
 if(o.length<3)return;X.beginPath();o.forEach((p,i)=>{const k=F/p.z;X[i?'lineTo':'moveTo'](cw/2+p.x*k,cy0-p.y*k)});X.closePath();if(fill){X.fillStyle=fill;X.fill();if(TP){X.fillStyle=TP;X.fill()}}if(line){X.strokeStyle=line;X.stroke()}}
const circ=(x,y,r,f,l)=>poly(Array.from({length:14},(_,i)=>[x+Math.cos(i*.4488)*r,y+Math.sin(i*.4488)*r,0]),f,l);
function sph(x,y,z,r,c){const p=cam(x,y,z);if(p.z<N)return;const k=F/p.z,sx=cw/2+p.x*k,sy=cy0-p.y*k,R=r*k,gr=X.createRadialGradient(sx-R*.35,sy-R*.35,R*.1,sx,sy,R);gr.addColorStop(0,'#fff');gr.addColorStop(.4,c);gr.addColorStop(1,'#0008');X.fillStyle=gr;X.beginPath();X.arc(sx,sy,R,0,7);X.fill()}
function box(x,y,w,d,h,k,z0=0){const f=l=>`hsl(${k[0]},${k[1]}%,${Math.min(90,k[2]*l)}%)`;
 poly([[x,y+d,z0],[x+w,y+d,z0],[x+w,y+d,h],[x,y+d,h]],f(1));
 if(CX<x)poly([[x,y,z0],[x,y+d,z0],[x,y+d,h],[x,y,h]],f(.65));else if(CX>x+w)poly([[x+w,y,z0],[x+w,y+d,z0],[x+w,y+d,h],[x+w,y,h]],f(.65));
 poly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],f(1.6),`hsla(${k[0]},${k[1]}%,${Math.min(96,k[2]*2.2)}%,.5)`)}
function fx(x,y,c,n=14){if(c=='#4d6142'&&n==18)splat(x,y);g.pa=g.pa||[];if(g.pa.length>120)return;for(let i=0;i<n;i++){const a=Math.random()*6.28,s=n>1?40+Math.random()*60:15;g.pa.push({x,y,z:8,vx:Math.cos(a)*s,vy:Math.sin(a)*s,vz:60+Math.random()*80,l:.6+Math.random()*.3,r:n>1?2.5:2,c})}}
let DK,DX;
function lit(C,x,y,r,c0){const p=cam(x,y,4);if(p.z<N)return;const k=F/p.z,sx=cw/2+p.x*k,sy=cy0-p.y*k,R=r*k;if(sx<-R||sx>cw+R||sy<-R||sy>ch+R)return;C.save();C.translate(sx,sy);C.scale(1,.8);const q=C.createRadialGradient(0,0,R*.08,0,0,R);q.addColorStop(0,c0);q.addColorStop(1,c0.replace(/[\d.]+\)$/,'0)'));C.fillStyle=q;C.beginPath();C.arc(0,0,R,0,7);C.fill();C.restore()}
function night(nt){const d=Math.min(1,nt*1.6),p=g.p,a=g.fx,b=g.fy,L=[];
 for(const[u,r,al]of[[0,75,1],[45,120,1],[105,110,.95],[165,85,.7]])L.push([p.x+a*u,p.y+b*u,r,al,u==105]);
 if(g.tr&&g.tr.l>0)L.push([g.tr.x,g.tr.y,150,1,1]);
 for(const v of g.veh){if(!vis(v.x,v.y,750))continue;const hw=(v.ax?v.t.w:v.t.L)/2,hd=(v.ax?v.t.L:v.t.w)/2;L.push([v.x,v.y,45,.8,0],[v.x+(v.ax?0:v.d*(hw+30)),v.y+(v.ax?v.d*(hd+30):0),105,.95,1])}
 for(const q of B)if(!q.tr&&(q.i*3+q.j)%3&&vis(q.x,q.y,650))L.push([q.x+q.w/2,q.y+q.h+12,80,.9,1]);
 if(!DK||DK.width!=cw||DK.height!=ch){DK=document.createElement('canvas');DK.width=cw;DK.height=ch;DX=DK.getContext('2d')}
 DX.globalCompositeOperation='source-over';DX.clearRect(0,0,cw,ch);DX.fillStyle=`rgba(3,6,20,${.8*d})`;DX.fillRect(0,0,cw,ch);DX.globalCompositeOperation='destination-out';
 for(const l of L)lit(DX,l[0],l[1],l[2],`rgba(0,0,0,${l[3]})`);X.drawImage(DK,0,0);
 X.globalCompositeOperation='lighter';for(const l of L)if(l[4])lit(X,l[0],l[1],l[2]*.8,`rgba(255,190,110,${.16*d})`);X.globalCompositeOperation='source-over'}
function draw(){const c=$('cv');X=c.getContext('2d');cw=c.width;ch=c.height;F=cw*.95;cy0=ch*.58;
 const now=performance.now(),dt=g.paused?0:Math.min(.05,(now-(g.lp||now))/1000);g.lp=now;
 if(g.cx==null){g.cx=g.p.x;g.cy=g.p.y}g.cx+=(g.p.x-g.cx)*Math.min(1,dt*9);g.cy+=(g.p.y-g.cy)*Math.min(1,dt*9);CX=g.cx;CY=g.cy;if(g.sh>0){CX+=(Math.random()-.5)*g.sh*14;CY+=(Math.random()-.5)*g.sh*14}
 g.mv=Math.hypot(g.p.x-(g.lx==null?g.p.x:g.lx),g.p.y-(g.ly==null?g.p.y:g.ly))>.05;g.lx=g.p.x;g.ly=g.p.y;
 if(g.mv&&!g.paused&&g.t-(g.dt2||0)>.14){g.dt2=g.t;fx(g.p.x,g.p.y,'#8a919c',1)}
 const ph=(g.t%DAY)/DAY,nt=Math.max(0,Math.sin((ph-.5)*Math.PI*2));g.nt=nt;
 const fc=mc(FD,FN,nt),f0=`rgb(${fc})`,f1=`rgba(${fc},0)`,bg=X.createLinearGradient(0,0,0,ch);bg.addColorStop(0,f0);bg.addColorStop(1,'#0e1116');X.fillStyle=bg;X.fillRect(0,0,cw,ch);
 if(!PT)mkTex();for(const n in PT)PT[n].setTransform(new DOMMatrix().translate(-CX*F/D,-CY*F/D*.8));TP=PT.asphalt;X.lineWidth=1.5;poly([[0,0,0],[W,0,0],[W,H,0],[0,H,0]],'#1c2026');TP=PT.concrete;
 {const c0=CX/200|0,r0=CY/200|0,ZC=['#2b3038','#1f3a24','#3a2626','#33322a','#30433b','#4a402f'];for(let i=Math.max(0,c0-5);i<=Math.min(GX-1,c0+5);i++)for(let j=Math.max(0,r0-5);j<=Math.min(GY-1,r0+5);j++)poly([[i*200+20,j*200+20,0],[i*200+180,j*200+20,0],[i*200+180,j*200+180,0],[i*200+20,j*200+180,0]],ZC[ZM[j*GX+i]],'rgba(255,255,255,.1)')}TP=null;ground();
 if(nt)circ(g.p.x,g.p.y,95,`rgba(255,200,120,${.14*nt})`);
 const sc=`rgba(0,0,0,${.4*(1-nt*.6)})`;
 for(const b of B){if(!vis(b.x,b.y))continue;b.k=b.k||b.c.match(/[\d.]+/g).map(Number);if(!b.m){b.z=b.z||70+((b.i*3+b.j*5)%4)*15;b.m=MAT[(b.i*3+b.j*2)%4]}const o=b.z*.5;poly([[b.x+o,b.y+o/2,0],[b.x+b.w+o,b.y+o/2,0],[b.x+b.w+o,b.y+b.h+o/2,0],[b.x+o,b.y+b.h+o/2,0]],sc)}
 for(const i of g.items)if(vis(i.x,i.y,900))circ(i.x+3,i.y+2,8,sc);
 circ(g.p.x+3,g.p.y+3,11,sc);for(const id in MP.pl)circ(MP.pl[id].x+3,MP.pl[id].y+3,11,sc);for(const m of g.mon)if(m.vs)circ(m.x+3,m.y+3,10,sc);for(const v of g.veh)if(vis(v.x,v.y,900))circ(v.x+3,v.y+3,v.t.L*.5,sc);
 const nr=near();if(nr)circ(nr.x,nr.y,17+Math.sin(g.t*8)*2,null,'#fff');
 const bld=b=>{const k=b.k||b.c.match(/[\d.]+/g).map(Number),kind=b.kind||'house';
  if(kind==='mil-wall'){box(b.x,b.y,b.w,b.h,b.z,[90,12,35]);return}
  if(kind==='watchtower'){box(b.x,b.y,b.w,b.h,b.z,[72,18,38]);box(b.x+3,b.y+3,b.w-6,b.h-6,b.z+35,[62,18,35]);sph(b.x+b.w/2,b.y+b.h/2,b.z+58,8,'#c2b36a');return}
  if(kind==='gate'){box(b.x,b.y,b.w,b.h,b.z,[80,14,38]);for(let q=0;q<4;q++)box(b.x+q*b.w/4,b.y,b.w/8,b.h,b.z+22,[70,10,34]);return}
  if(kind==='container'){box(b.x,b.y,b.w,b.h,b.z,[190,45,30]);for(let q=1;q<4;q++)poly([[b.x+q*b.w/4,b.y,b.z+2],[b.x+q*b.w/4,b.y+b.h,b.z+2],[b.x+q*b.w/4,b.y+b.h,b.z+27],[b.x+q*b.w/4,b.y,b.z+27]],'#2d3830');return}
  const military=!!b.mil;TP=b.m;box(b.x,b.y,b.w,b.h,b.z,military?[70,18,38]:k);TP=PT.metal;
  if(kind==='hangar')box(b.x+10,b.y+b.h-18,b.w-20,14,b.z+18,[150,16,45],b.z);
  if(kind==='bunker')box(b.x+12,b.y+12,b.w-24,b.h-24,b.z+8,[55,14,32],b.z);
  if(kind==='hospital')box(b.x+20,b.y+b.h-14,b.w-40,10,b.z+18,[358,65,55],b.z);
  if(kind==='police')box(b.x+16,b.y+b.h-14,b.w-32,10,b.z+18,[215,12,45],b.z);
  if(kind==='church')box(b.x+b.w*.38,b.y+b.h-20,b.w*.24,16,b.z+28,[35,22,32],b.z);
  if(kind==='factory')for(let q=0;q<2;q++)box(b.x+18+q*(b.w*.45),b.y+18,22,22,b.z+20,[210,15,45],b.z);
  const near2=Math.hypot(b.x+b.w/2-CX,b.y+b.h/2-CY)<650;
  if(near2){const dx=b.x+b.w/2,yy=b.y+b.h+.3;poly([[dx-10,yy,0],[dx+10,yy,0],[dx+10,yy,30],[dx-10,yy,30]],military?'#4d4430':'#4a2f18','#2a1a0d');if(nt>.2&&(b.i*3+b.j)%3)sph(dx,yy+3,34,2.4,military?'#c6b76d':'#fff3c4')}
  if(near2&&!military)for(let a=0;a<3;a++)for(let d=0;d<2;d++){const wx=b.x+16+a*34,wz=14+d*34,yy=b.y+b.h+.2;if(wz+18>b.z-6||a==1&&!d)continue;poly([[wx,yy,wz],[wx+20,yy,wz],[wx+20,yy,wz+18],[wx,yy,wz+18]],(b.x/40+b.y/40+a*d)%3?'rgba(8,10,14,.6)':'#f2a93bcc')}
 };
 const tree=b=>{box(b.x+2,b.y+2,6,6,b.z*.5,[28,40,25]);sph(b.x+5,b.y+5,b.z*.5+12,15,'#2f6b2f');sph(b.x+5,b.y+5,b.z*.5+24,10,'#3f8a3a')};
 const itm=i=>{const z=9+Math.sin(g.t*4+i.x)*2.5,x=i.x,y=i.y,t=i.t,k=1.4;X.shadowColor=COL[t];X.shadowBlur=vis(x,y,500)?12:0;
  if(t=='agua'){box(x-3.5,y-3.5,7,7,z+13,[208,75,55],z);box(x-2,y-2,4,4,z+18,[0,0,92],z+13)}
  else if(t=='medkit'){box(x-6,y-4.5,12,9,z+9,[200,12,90],z);box(x-4,y-1.4,8,2.8,z+9.6,[358,70,50],z+9);box(x-1.4,y-4,2.8,8,z+9.6,[358,70,50],z+9)}
  else if(t=='comida'){box(x-5,y-5,10,10,z+12,[210,12,72],z);box(x-5.4,y-5.4,10.8,10.8,z+9,[6,72,48],z+3)}
  else if(IT[t])IT[t](x,y,z);
  else for(const p of WM[t])box(x+p[0]*k,y-p[2]*k/2,p[1]*k,p[2]*k,z+(p[3]+p[4])*k,p[5],z+p[3]*k);
  X.shadowBlur=0};
 const plr=(o=LV())=>{const p=o,a=o.fx,b=o.fy,px=-b,py=a,w=o.mv?Math.sin(g.t*14):0,m=Math.abs(w)*2,e0=o.eq&&T[o.eq],at=o.cd>(e0?e0.cd-.15:.3),th=e0&&TH[o.eq],o1=(e0&&e0.mg?at?-3:0:-w*5+(at?10:0)),rx=p.x+px*9+a*o1,ry=p.y+py*9+b*o1;
 for(const e of[-1,1])sph(p.x+px*4*e+a*w*e*6,p.y+py*4*e+b*w*e*6,5+(w*e>.6?2:0),4.5,'#2b3a55');
 sph(p.x-a*7,p.y-b*7,17+m,6.5,'#5a4a30');sph(p.x,p.y,14+m,8.5,o.hurt>0?'#e5484d':'#d8862b');sph(p.x,p.y,21+m,7,'#c8742a');
 for(const e of[-1,1]){let hx,hy;if(e==1){hx=rx;hy=ry}else if(th){hx=rx+a*11-px*4;hy=ry+b*11-py*4}else{hx=p.x-px*9+a*w*5;hy=p.y-py*9+b*w*5}sph(hx,hy,17+m,3.2,'#d8862b')}
 sph(p.x,p.y,29+m,6.5,'#e0b48a');sph(p.x-a*1.5,p.y-b*1.5,33+m,6.4,'#3b2a1a');sph(p.x+a*5,p.y+b*5,30+m,2,'#1b1b1f');if(o.eq)wpn(rx,ry,17+m,o)};
 const car=v=>{const t=v.t,hw=(v.ax?t.w:t.L)/2,hd=(v.ax?t.L:t.w)/2;if(nt>.3)circ(v.x+(v.ax?0:v.d*(hw+22)),v.y+(v.ax?v.d*(hd+22):0),34,`rgba(255,230,160,${.16*nt})`);TP=PT.metal;box(v.x-hw,v.y-hd,hw*2,hd*2,t.h,v.k,3);TP=null;if(t.c)box(v.x-hw*.6,v.y-hd*.6,hw*1.2,hd*1.2,t.h+t.c,[200,35,30],t.h);if(t.L>25)for(const a of[-1,1])for(const e of[-1,1]){const ex=hw>hd,wx=ex?a*hw*.6:e*hw,wy=ex?e*hd:a*hd*.6;box(v.x+wx-2.5,v.y+wy-2.5,5,5,5,[0,0,10])}};
 const wk=[-1e9,()=>box(-20,-20,W+40,20,16,[215,10,30])],wl=[-1e9,()=>box(-20,0,20,H,16,[215,10,30])],wr=[-1e9,()=>box(W,0,20,H,16,[215,10,30])];
 const L=[wk,wl,wr];for(const b of B)if(vis(b.x,b.y))L.push([b.y+(b.tr?5:60),()=>b.tr?tree(b):bld(b)]);for(const i of g.items)if(vis(i.x,i.y,900))L.push([i.y,()=>itm(i)]);for(const v of g.veh)if(vis(v.x,v.y,900))L.push([v.y,()=>car(v)]);for(const m of g.mon)if(m.vs&&vis(m.x,m.y,900))L.push([m.y,()=>mon(m)]);for(const id in MP.pl){const r=MP.pl[id];if(!r.dead&&vis(r.x,r.y,900))L.push([r.y,()=>{plr(r);mpTag(r)}])}L.push([g.p.y,plr],[1e9,()=>box(-20,H,W+40,20,16,[215,10,30])]);
 L.sort((a,b)=>a[0]-b[0]);L.forEach(o=>o[1]());
 g.pa=(g.pa||[]).filter(p=>(p.l-=dt)>0);for(const p of g.pa){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vz-=200*dt;p.z=Math.max(1,p.z+p.vz*dt);X.globalAlpha=Math.min(1,p.l*2.5);sph(p.x,p.y,p.z,p.r,p.c)}X.globalAlpha=1;
 drawTr();const fg=X.createLinearGradient(0,0,0,ch*.5);fg.addColorStop(0,f0);fg.addColorStop(1,f1);X.fillStyle=fg;X.fillRect(0,0,cw,ch*.5);
 if(nt>.05){X.fillStyle='#fff';X.globalAlpha=.8*nt;for(const t of STAR)X.fillRect(t[0]*cw,t[1]*ch,t[2],t[2]);X.globalAlpha=1}
 if(nt>.03)night(nt);
 const vg=X.createRadialGradient(cw/2,ch/2,ch*.45,cw/2,ch/2,cw*.7);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000a');X.fillStyle=vg;X.fillRect(0,0,cw,ch);
 if(g.hurt>0){X.fillStyle=`rgba(229,72,77,${g.hurt*.5})`;X.fillRect(0,0,cw,ch)}
 post(nt,ph,dt);reveal();if(g.es%2==0){drawMap();if(MP.on)mpMap()}$('bh').style.width=g.hp+'%';hudW();$('bf').style.width=g.f+'%';$('bs').style.width=g.s+'%';
 $('sh').classList.toggle('low',g.hp<30);$('sf').classList.toggle('low',g.f<25);$('ss').classList.toggle('low',g.s<25);
 $('day').textContent=(nt>.3?'🌙 ':'☀️ ')+'Dia '+Math.min(30,Math.floor(g.t/DAY)+1)+'/30';
 const n=near(),h=$('hint');const m=g.mt>0?g.msg:n?(touchUI?'Toque em Coletar — ':'E — coletar ')+T[n.t].n:'';h.textContent=m;h.style.display=m?'block':'none'}

function splat(x,y){g.dc=g.dc||[];g.dc.push({x,y,r:6+Math.random()*7});if(g.dc.length>50)g.dc.shift()}
function drawRoads(){for(const r of ROADS){if(r.axis==='h'){if(r.y>CY+900||r.y<CY-900)continue;poly([[r.x,r.y,0],[r.x+r.w,r.y,0],[r.x+r.w,r.y+r.h,0],[r.x,r.y+r.h,0]],r.main?'#24282d':'#2d3136');for(let x=Math.max(0,Math.floor((CX-900)/42)*42);x<Math.min(W,CX+900);x+=42)poly([[x,r.y+17,.4],[Math.min(x+22,r.x+r.w),r.y+17,.4],[Math.min(x+22,r.x+r.w),r.y+19,.4],[x,r.y+19,.4]],'rgba(220,190,110,.5)')}else{if(r.x>CX+900||r.x<CX-900)continue;poly([[r.x,r.y,0],[r.x+r.w,r.y,0],[r.x+r.w,r.y+r.h,0],[r.x,r.y+r.h,0]],r.main?'#24282d':'#2d3136');for(let y=Math.max(0,Math.floor((CY-900)/42)*42);y<Math.min(H,CY+900);y+=42)poly([[r.x+17,y,.4],[r.x+19,y,.4],[r.x+19,Math.min(y+22,r.y+r.h),.4],[r.x+17,Math.min(y+22,r.y+r.h),.4]],'rgba(220,190,110,.5)')}}}function ground(){for(const s of g.dc||[])if(vis(s.x,s.y,800))circ(s.x,s.y,s.r,'rgba(90,12,14,.55)');drawRoads();
 if(!cfg.fx)return;const Y='rgba(217,179,74,.75)',a0=Math.max(0,Math.floor((CX-560)/60)*60),b0=Math.max(0,Math.floor((CY-560)/60)*60);
 for(let i=Math.max(1,Math.round(CX/200)-3);i<=Math.min(GX-1,Math.round(CX/200)+3);i++)for(let y=b0;y<Math.min(H,CY+560);y+=60){const m=y%200;if(m<30||m>170)continue;poly([[i*200-1.5,y,0],[i*200+1.5,y,0],[i*200+1.5,y+30,0],[i*200-1.5,y+30,0]],Y)}
 for(let j=Math.max(1,Math.round(CY/200)-3);j<=Math.min(GY-1,Math.round(CY/200)+3);j++)for(let x=a0;x<Math.min(W,CX+560);x+=60){const m=x%200;if(m<30||m>170)continue;poly([[x,j*200-1.5,0],[x+30,j*200-1.5,0],[x+30,j*200+1.5,0],[x,j*200+1.5,0]],Y)}}
const RN=[];
function post(nt,ph,dt){const wm=Math.max(0,1-Math.min(Math.abs(ph-.5),ph,1-ph)*8);
 if(wm>.02){X.globalCompositeOperation='soft-light';X.fillStyle=`rgba(255,140,60,${.5*wm})`;X.fillRect(0,0,cw,ch);X.globalCompositeOperation='source-over'}
 if(g.hp<30&&!g.over){const a=(30-g.hp)/30*(.25+.15*Math.sin(g.t*6)),v=X.createRadialGradient(cw/2,ch/2,ch*.3,cw/2,ch/2,cw*.65);v.addColorStop(0,'#0000');v.addColorStop(1,`rgba(160,10,20,${a})`);X.fillStyle=v;X.fillRect(0,0,cw,ch)}
 if(!cfg.fx)return;
 if(g.tr&&g.tr.l>0){X.globalCompositeOperation='lighter';X.fillStyle='rgba(255,200,120,.06)';X.fillRect(0,0,cw,ch);X.globalCompositeOperation='source-over'}
 g.rn=(g.rn||0)+((Math.floor(g.t/DAY)%4==2?1:0)-(g.rn||0))*Math.min(1,dt*.4);
 if(g.rn>.03){X.fillStyle=`rgba(20,30,50,${.22*g.rn})`;X.fillRect(0,0,cw,ch);X.strokeStyle=`rgba(190,210,235,${.35*g.rn})`;X.lineWidth=1;X.beginPath();
  for(let i=0,n=Math.round(140*g.rn);i<n;i++){const r=RN[i]||(RN[i]=[Math.random(),Math.random(),.6+Math.random()*.6]);r[1]=(r[1]+dt*r[2]*1.6)%1;r[0]=(r[0]-dt*.15*r[2]+1)%1;const x=r[0]*cw,y=r[1]*ch;X.moveTo(x,y);X.lineTo(x-4,y+14)}X.stroke()}}
const esc=s=>String(s).replace(/[<>&"']/g,'');
function logout(){if(ON&&TK)API('logout',{}).catch(()=>{});TK='';S('lc_tk','');me=null;show('auth')}
function RK(){if(!ON||!TK)return;API('rank').then(r=>{if(scr!='menu'||!r.rank.length)return;const d=document.createElement('div');d.className='rk';d.innerHTML='<small>Ranking</small>'+r.rank.map((u,i)=>`<div><span>${i+1}. ${esc(u.n)}</span><b>Dia ${u.best}</b></div>`).join('');$('mn').appendChild(d)}).catch(()=>{})}

/* Multiplayer compatibility layer. The original UI referenced MP/functions that were missing. */
const MP={on:false,began:false,cl:false,host:false,ready:false,code:'',iid:0,mid:0,pl:{},inv:null,roomTimer:null};
const mpErr=m=>{$('mpe').textContent=m||''};
function mpRender(room){
  if(!room)return;
  MP.code=room.code;MP.host=room.host_user_id===me.id;MP.on=true;
  $('mpa').style.display='none';$('mpl').style.display='block';$('mpk').textContent=room.code;
  $('mpu').innerHTML=room.players.map(p=>`<div>${String(p.n).replace(/[<>&]/g,'')}</div>`).join('');
  $('mpG').style.display=MP.host?'':'none';$('mpw').textContent=room.started_at?'Partida iniciada.':'Aguardando o host iniciar…';
  if(room.started_at&&!MP.began){MP.began=true;show('game');start()}
}
async function mpRefresh(){if(!MP.code||!ON||!TK)return;try{const j=await API('room/'+encodeURIComponent(MP.code));mpRender(j.room)}catch(e){mpLeave(false)}}
function mpShow(code){show('mp');mpErr('');if(code){$('mpc').value=code}MP.on=false;MP.began=false;MP.pl={};if(MP.roomTimer)clearInterval(MP.roomTimer)}
async function mpCreate(){try{const j=await API('room/create',{});mpRender(j.room);MP.roomTimer=setInterval(mpRefresh,1000)}catch(e){mpErr(e.message)}}
async function mpJoin(){const code=$('mpc').value.trim().toUpperCase();if(!/^[A-Z0-9]{5}$/.test(code))return mpErr('Digite um código de 5 caracteres.');try{const j=await API('room/join',{code});mpRender(j.room);MP.roomTimer=setInterval(mpRefresh,1000)}catch(e){mpErr(e.message)}}
async function mpStart(){try{const j=await API('room/start',{code:MP.code});mpRender(j.room)}catch(e){mpErr(e.message)}}
async function mpLeave(backToMenu=true){if(MP.roomTimer){clearInterval(MP.roomTimer);MP.roomTimer=null}if(MP.code&&ON&&TK)API('room/leave',{code:MP.code}).catch(()=>{});MP.on=false;MP.began=false;MP.cl=false;MP.host=false;MP.ready=false;MP.code='';MP.pl={};if(backToMenu)show('menu')}
function mps(){/* Network state sync is intentionally disabled until a WebSocket transport exists. */}
function mpTick(){if(MP.code&&!MP.began)mpRefresh();}
function mpAt(){}
function mpDead(){if(MP.began&&g&&g.over)MP.began=false}
function mpMap(){}
function mpTag(){}
$('mpC').onclick=mpCreate;$('mpJ').onclick=mpJoin;$('mpG').onclick=mpStart;$('mpX').onclick=()=>mpLeave();$('mpB').onclick=()=>mpLeave();
$('mpI').onclick=()=>{if(MP.code)navigator.clipboard?.writeText(location.href.split('#')[0]+'?room='+MP.code).then(()=>say('Convite copiado')).catch(()=>mpErr('Não foi possível copiar o convite.'))};
const mpCode=new URLSearchParams(location.search).get('room');if(mpCode)MP.inv=mpCode.toUpperCase();

if(ON&&TK)API('me').then(j=>{me=j.user;if(j.cfg){cfg=Object.assign(cfg,j.cfg);S('lc_cfg',cfg)}toMenu()}).catch(()=>{TK='';S('lc_tk','')});
