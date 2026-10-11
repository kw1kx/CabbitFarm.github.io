const N=20,$=id=>document.getElementById(id),R=n=>Math.random()*n|0;
const C={carrot:{n:'Морковь',cost:5,t:8,v:12,col:'#f28a1e',lv:1},wheat:{n:'Пшеница',cost:10,t:15,v:28,col:'#f0c03c',lv:1},straw:{n:'Клубника',cost:25,t:30,v:70,col:'#e63950',lv:2},pump:{n:'Тыква',cost:60,t:60,v:180,col:'#e8801a',lv:4},melon:{n:'Арбуз',cost:120,t:90,v:380,col:'#3fa34d',lv:6},corn:{n:'Кукуруза',cost:200,t:120,v:640,col:'#f2d03a',lv:8},sun:{n:'Подсолнух',cost:350,t:180,v:1100,col:'#f5b800',lv:10}};
const PROD={flour:{n:'Мука',need:{wheat:2},t:10,v:70},bread:{n:'Хлеб',need:{flour:2},t:25,v:190},jam:{n:'Варенье',need:{straw:3},t:30,v:300},pie:{n:'Пирог',need:{pump:2,flour:1},t:45,v:620}};
Object.assign(PROD,{cheese:{n:'Сыр',need:{milk:2},t:25,v:260},cake:{n:'Торт',need:{flour:1,egg:2,milk:1},t:40,v:520}});
const OUT={egg:{n:'Яйцо',v:35},milk:{n:'Молоко',v:90}};
const ITEM=Object.assign({},C,PROD,OUT);
const ANI={hen:{n:'Курица',cost:150,out:'egg',feed:'wheat',t:40},cow:{n:'Корова',cost:600,out:'milk',feed:'pump',t:80}};
const DEC={fence:{n:'Забор',cost:80,d:'продажа +5%'},tree:{n:'Дерево',cost:200,d:'рост +5%'},well:{n:'Колодец',cost:400,d:'рост +10%'},scare:{n:'Пугало',cost:300,d:'защита от ворон'}};
const QUEST=[
[{t:'Хочу испечь пирог. Принеси моркови для начинки.',need:{carrot:6},rew:40},{t:'Теперь нужна мука для теста.',need:{flour:3},rew:120},{t:'Испеки мне настоящий пирог!',need:{pie:1},rew:400,perk:'g',pn:'золотая лейка, рост +20%'}],
[{t:'Мои куры голодные. Нужна пшеница.',need:{wheat:8},rew:60},{t:'Хочу варенье, но клубники нет.',need:{straw:4},rew:150},{t:'Свари мне два горшка варенья.',need:{jam:2},rew:450,perk:'s',pn:'знакомства, продажа +10%'}],
[{t:'В кузнице жарко, нужен хлеб. Начнём с пшеницы.',need:{wheat:10},rew:70},{t:'Испеки два хлеба для кузнецов.',need:{bread:2},rew:200},{t:'Для большого заказа: тыквы и мука.',need:{pump:3,flour:2},rew:500,perk:'p',pn:'бесплатная грядка'}],
[{t:'Устраиваю праздник! Принеси клубники.',need:{straw:3},rew:80},{t:'Нужно варенье к чаю.',need:{jam:1},rew:200},{t:'Главное блюдо: пирог и варенье.',need:{pie:1,jam:1},rew:550,perk:'x',pn:'+500 монет и опыт'}]];
// Картинки: assets/images/carrot.png, wheat.png, strawberry.png, pumpkin.png и villager1..4.png
const IMG={carrot:'carrot',wheat:'wheat',straw:'strawberry',pump:'pumpkin',melon:'watermelon',corn:'corn',sun:'sunflower',flour:'flour',bread:'bread',jam:'jam',pie:'pie',cheese:'cheese',cake:'cake',egg:'egg',milk:'milk',hen:'hen',cow:'cow',fence:'fence',tree:'tree',well:'well',scare:'scarecrow'},HAS={},HV={};
Object.entries(IMG).forEach(([k,f])=>{const im=new Image();im.onload=()=>HAS[k]=1;im.src='assets/images/'+f+'.png'});
for(let i=0;i<4;i++){const im=new Image();im.onload=()=>HV[i]=1;im.src=`assets/images/villager${i+1}.png`}
const ico=n=>HAS[n]?`<img class="i" src="assets/images/${IMG[n]}.png" alt="">`:`<svg class="i" viewBox="0 0 32 32"><use href="#${n}"/></svg>`;
const VIL=[{n:'Бабушка Нина',c:'#d98aa8'},{n:'Фермер Гена',c:'#6aa0d8'},{n:'Кузнец Макс',c:'#c78a4a'},{n:'Маша',c:'#8bc96a'}];
const avatar=i=>HV[i]?`<img class="av" src="assets/images/villager${i+1}.png" alt="">`:`<svg class="av" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${VIL[i].c}"/><circle cx="16" cy="13" r="6" fill="#ffe0bd"/><path d="M5 30c1-8 6-10 11-10s10 2 11 10z" fill="#fff8e6"/></svg>`;
/* ---------- сохранение ---------- */
const def=()=>({coins:20,seed:'carrot',up:{fert:0,water:0,pick:0},plots:Array.from({length:N},(_,i)=>({s:i<4?1:0,c:'',p:0})),inv:Object.fromEntries(Object.keys(ITEM).map(k=>[k,0])),xp:0,work:[],mk:{},fairEnd:0,an:{hen:0,cow:0},pen:{hen:{end:0,k:0},cow:{end:0,k:0}},dec:{},qp:[0,0,0,0],perk:{},day:'',orders:[],next:0,st:{h:0,earned:0,ord:0,c:{}},ach:{},mute:false,t:Date.now()});
let S;try{S=JSON.parse(localStorage.getItem('farm1'))}catch(e){}
S=Object.assign(def(),S&&S.plots?S:{});
S.st=Object.assign({h:0,earned:0,ord:0,c:{}},S.st);S.inv=Object.assign(def().inv,S.inv);S.ach=S.ach||{};S.mk=S.mk||{};Object.keys(ITEM).forEach(k=>S.mk[k]=S.mk[k]||1);S.work=S.work||[];S.xp=S.xp||0;S.st.crafted=S.st.crafted||0;S.ev=null;S.up=Object.assign({fert:0,water:0,pick:0,green:0,tract:0},S.up);
function save(){S.t=Date.now();try{localStorage.setItem('farm1',JSON.stringify(S))}catch(e){}}
/* ---------- звуки ---------- */
let AC;const ac=()=>{if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}return AC};
function tone(f,d,t,v,at,f2){if(S.mute)return;const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain(),n=a.currentTime+(at||0);o.type=t||'sine';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v||.15,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(a.destination);o.start(n);o.stop(n+d)}
function noise(d,v){if(S.mute)return;const a=ac();if(!a)return;const b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*(1-i/x.length);const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();f.type='bandpass';f.frequency.value=1800;g.gain.value=v;s.buffer=b;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
const arp=(fs,t,v)=>fs.forEach((f,i)=>tone(f,.16,t,v,i*.08));
const SND={plant:()=>tone(300,.14,'triangle',.2,0,520),water:()=>noise(.35,.14),harvest:()=>arp([523,659,784],'square',.06),coin:()=>{tone(988,.08,'square',.06);tone(1319,.18,'square',.06,.07)},buy:()=>tone(440,.12,'triangle',.2,0,880),err:()=>tone(160,.18,'sawtooth',.08),ach:()=>arp([523,659,784,1047],'triangle',.18),order:()=>arp([659,784,988,1319],'triangle',.16)};
/* ---------- мелочи ---------- */
const g=$('grid');
function float(i,t){const f=document.createElement('span');f.className='fl';f.textContent=t;g.children[i].appendChild(f);setTimeout(()=>f.remove(),900)}
function burst(i,col){const el=g.children[i];for(let k=0;k<9;k++){const p=document.createElement('i'),a=k/9*6.28+Math.random();p.className='pt';p.style.cssText=`--x:${Math.cos(a)*36}px;--y:${Math.sin(a)*36}px;background:${col}`;el.appendChild(p);setTimeout(()=>p.remove(),600)}}
function bump(){const c=document.querySelector('.coins');c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}
let tt;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2800)}
const msg=t=>$('msg').innerHTML=t;
msg('Нажми на пустую грядку, чтобы <b>посадить</b>, потом ещё раз, чтобы <b>полить</b>. Спелое растение (жёлтая рамка) нажми, чтобы собрать: урожай попадёт на <b>склад</b>. Продай его или отдай жителям за заказ.');
/* ---------- грядки ---------- */
const unlocked=()=>S.plots.filter(p=>p.s>0).length;
const xpAt=l=>25*(l-1)*(l-1),lvl=()=>1+Math.floor(Math.sqrt(S.xp/25));
function addXp(n){const a=lvl();S.xp+=n;const b=lvl();if(b>a){toast(`Новый уровень: ${b}!`+(Object.values(C).some(c=>c.lv===b)?' Открыта новая культура':''));SND.ach();bump()}}
const price=c=>Math.round(ITEM[c].v*S.mk[c]*(Date.now()<S.fairEnd?2:1)*(S.dec.fence?1.05:1)*(S.perk.s?1.1:1));
const SEAS=[{n:'Весна',m:1.15,k:'spring'},{n:'Лето',m:1,k:'summer'},{n:'Осень',m:1,k:'autumn'},{n:'Зима',m:.7,k:'winter'}];
const season=()=>SEAS[Math.floor(Date.now()/600000)%4];
function weather(){const b=Math.floor(Date.now()/180000),r=(Math.imul(b,2654435761)>>>0)%1000/1000;return r<.15?{n:'Дождь',m:1.25,rain:1}:r<.27?{n:'Засуха',m:.7}:{n:'Ясно',m:1}}
const speed=()=>{let m=season().m*weather().m;if(S.up.green)m=Math.max(1,m);return(1+.25*S.up.fert)*m*(S.perk.g?1.2:1)*(S.dec.tree?1.05:1)*(S.dec.well?1.1:1)};
function chest(w){const r=R(3),l=lvl();let t;if(r===0){const c=40*l+R(100);S.coins+=c;S.st.earned+=c;t=c+' монет'}else if(r===1){const ks=Object.keys(C).filter(k=>C[k].lv<=l),k=ks[R(ks.length)],n=3+R(4);S.inv[k]+=n;t=C[k].n+' x'+n}else{addXp(30+l*5);t='опыт'}toast(w+': '+t);SND.ach();bump()}
const PR=[24,58,116];
function priceAt(n){while(PR.length<=n)PR.push(Math.round(PR[PR.length-1]*1.6/2)*2);return PR[n]}
const nextLock=()=>S.plots.findIndex(p=>p.s===0);
const priceFor=i=>{let k=0;for(let j=0;j<i;j++)if(S.plots[j].s===0)k++;return priceAt(unlocked()-4+k)};
const unlockCost=()=>priceAt(unlocked()-4);
S.plots.forEach((p,i)=>{const d=document.createElement('div');d.className='plot';d.dataset.i=i;d.innerHTML='<span class="tag"></span><span class="em"></span><div class="bar"><i></i></div>';g.appendChild(d)});
function take(p){S.inv[p.c]++;addXp(Math.round(C[p.c].v/4)+1);S.st.h++;S.st.c[p.c]=(S.st.c[p.c]||0)+1;const c=p.c;p.s=1;p.c='';p.p=0;return c}
function harvest(i,quiet){const c=take(S.plots[i]);float(i,'+1');burst(i,C[c].col);if(!quiet)SND.harvest()}
g.onclick=e=>{
 const el=e.target.closest('.plot');if(!el)return;const i=+el.dataset.i,p=S.plots[i];
 if(p.s===0){const c=unlockCost();if(i!==nextLock()){SND.err();msg('Эта грядка закрыта. Сначала купи предыдущую.');return}
  if(S.coins>=c){S.coins-=c;p.s=1;SND.buy();msg('Новая грядка открыта!')}else{SND.err();msg(`Не хватает монет: грядка стоит ${c} монет`)}}
 else if(p.s===1){const c=C[S.seed];if(S.coins>=c.cost){S.coins-=c.cost;p.s=2;p.c=S.seed;p.p=0;SND.plant();el.animate([{transform:'scale(.8)'},{transform:'scale(1)'}],{duration:180});msg(`Посадил: ${c.n}. Нажми на грядку ещё раз, чтобы <b>полить</b>.`)}else{SND.err();msg(`Не хватает монет на семена (${c.cost} монет). Выбери подешевле.`)}}
 else if(p.s===2){p.s=3;SND.water();msg('Полито! Растёт, подожди немного.')}
 else if(p.s===3)msg('Ещё растёт... Следи за зелёной полоской.');
 else if(p.s===4){harvest(i);msg('Урожай на складе. Продай его или отдай жителю.')}
 render();save()};
/* ---------- магазин, склад, улучшения ---------- */
const upDefs=[{k:'fert',i:'flask',n:'Удобрение',d:'растёт быстрее на 25%',max:5,cost:l=>50*(l+1)},{k:'water',i:'drop',n:'Поливалка',d:'сама поливает посаженное',max:1,cost:()=>80},{k:'pick',i:'basket',n:'Помощник',d:'сам собирает урожай',max:1,cost:()=>150},{k:'green',i:'sun',n:'Теплица',d:'погода и зима не мешают росту',max:1,cost:()=>500},{k:'tract',i:'leafy',n:'Трактор',d:'сам сажает выбранные семена',max:1,cost:()=>400}];
$('seeds').onclick=e=>{const b=e.target.closest('button');if(!b)return;S.seed=b.dataset.k;SND.buy();msg(`Теперь сажаешь: ${C[S.seed].n}`);key='';ui()};
$('ups').onclick=e=>{const b=e.target.closest('button');if(!b)return;const u=upDefs.find(x=>x.k===b.dataset.k),l=S.up[u.k];
 if(l<u.max&&S.coins>=u.cost(l)){S.coins-=u.cost(l);S.up[u.k]++;SND.buy();msg(`Куплено: ${u.n}`)}else SND.err();ui();render();save()};
$('inv').onclick=e=>{const b=e.target.closest('button');if(!b)return;const c=b.dataset.sell,n=S.inv[c];if(!n)return;const sum=n*price(c);S.inv[c]=0;S.coins+=sum;S.st.earned+=sum;SND.coin();bump();msg(`Продано: ${C[c].n} x${n} за ${sum} монет`);ui();render();save()};
/* ---------- жители и заказы ---------- */
function newOrder(){const ks=Object.keys(C).filter(k=>C[k].lv<=lvl()).concat(lvl()>=3?Object.keys(PROD).filter(k=>k==='cheese'?S.an.cow:k==='cake'?S.an.cow&&S.an.hen:1):[]).concat(S.an.hen?['egg']:[]).concat(S.an.cow?['milk']:[]),items={},m=1+(Math.random()<.4);for(let i=0;i<m;i++){const c=ks[R(ks.length)];items[c]=(items[c]||0)+1+(PROD[c]?R(2):R(3))}
 const val=Object.entries(items).reduce((a,[c,q])=>a+ITEM[c].v*q,0);return{v:R(4),items,rew:Math.round(val*1.5/5)*5}}
const canDo=o=>Object.entries(o.items).every(([c,q])=>S.inv[c]>=q);
$('orders').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.o,o=S.orders[i];if(!o||!canDo(o)){SND.err();return}
 Object.entries(o.items).forEach(([c,q])=>S.inv[c]-=q);S.coins+=o.rew;S.st.earned+=o.rew;S.st.ord++;addXp(20);if(S.st.ord%5===0)chest('Сундук за заказы');S.orders.splice(i,1);SND.order();bump();toast(`${VIL[o.v].n} благодарит: +${o.rew} монет`);ui();render();save()};
/* ---------- достижения ---------- */
const ACH=[
 {id:'h1',n:'Первый урожай',d:'собери 1 урожай',g:1,r:10,get:()=>S.st.h},
 {id:'h50',n:'Фермер',d:'собери 50 урожаев',g:50,r:40,get:()=>S.st.h},
 {id:'h250',n:'Мастер грядок',d:'собери 250 урожаев',g:250,r:200,get:()=>S.st.h},
 {id:'e500',n:'Копилка',d:'заработай 500 монет',g:500,r:50,get:()=>S.st.earned},
 {id:'e5000',n:'Богач',d:'заработай 5000 монет',g:5000,r:300,get:()=>S.st.earned},
 {id:'o1',n:'Первый заказ',d:'выполни 1 заказ',g:1,r:20,get:()=>S.st.ord},
 {id:'o10',n:'Любимец деревни',d:'выполни 10 заказов',g:10,r:150,get:()=>S.st.ord},
 {id:'o30',n:'Староста',d:'выполни 30 заказов',g:30,r:500,get:()=>S.st.ord},
 {id:'pl8',n:'Огородник',d:'открой 8 грядок',g:8,r:60,get:unlocked},
 {id:'pl20',n:'Вся земля',d:'открой все 20 грядок',g:20,r:400,get:unlocked},
 {id:'up',n:'Технарь',d:'купи все улучшения',g:7,r:200,get:()=>S.up.fert+S.up.water+S.up.pick},
 {id:'pump',n:'Тыквенный король',d:'собери 20 тыкв',g:20,r:150,get:()=>S.st.c.pump||0},{id:'lv5',n:'Опытный',d:'достигни 5 уровня',g:5,r:100,get:lvl},{id:'lv10',n:'Легенда фермы',d:'достигни 10 уровня',g:10,r:500,get:lvl},{id:'cr',n:'Повар',d:'приготовь 10 блюд',g:10,r:120,get:()=>S.st.crafted}];
function chk(){ACH.forEach(a=>{if(!S.ach[a.id]&&a.get()>=a.g){S.ach[a.id]=1;S.coins+=a.r;addXp(25);toast(`Достижение: ${a.n} (+${a.r})`);SND.ach();bump()}})}
/* ---------- интерфейс ---------- */
let key='';
function ui(){
 const k=JSON.stringify([S.coins,S.seed,S.up,S.inv,S.orders,S.ach,S.st.h,S.st.ord,S.st.earned,unlocked(),S.mk,lvl(),Date.now()<S.fairEnd,S.work,S.an,S.pen,S.dec,S.qp,S.perk]);if(k===key)return;key=k;
 $('seeds').innerHTML=Object.entries(C).map(([id,c])=>{const lk=c.lv>lvl();return `<button data-k="${id}" class="${S.seed===id?'sel':''}" ${lk?'disabled':''}>${ico(id)}<div>${c.n}<small>${lk?'с уровня '+c.lv:'купить '+c.cost+' · растёт '+c.t+'с · продать '+price(id)}</small></div></button>`}).join('');
 $('ups').innerHTML=upDefs.map(u=>{const l=S.up[u.k],done=l>=u.max;return `<button data-k="${u.k}" ${done||S.coins<u.cost(l)?'disabled':''}>${ico(u.i)}<div>${u.n}${u.max>1?' ур.'+l+'/'+u.max:''}<small>${u.d} · ${done?'куплено':u.cost(l)+' монет'}</small></div></button>`}).join('');
 $('quests').innerHTML=VIL.map((v,i)=>{const st=QUEST[i][S.qp[i]];if(!st)return `<div class="ord"><div class="who">${avatar(i)}<div><b>${v.n}</b><small>история завершена</small></div></div></div>`;const ok=Object.entries(st.need).every(([c,q])=>S.inv[c]>=q);return `<div class="ord"><div class="who">${avatar(i)}<div><b>${v.n} · ${S.qp[i]+1}/3</b><small>${st.t}</small></div></div><div class="need">${Object.entries(st.need).map(([c,q])=>`<span class="${S.inv[c]>=q?'ok':''}">${ico(c)} ${S.inv[c]}/${q}</span>`).join('')}</div><button data-q="${i}" ${ok?'':'disabled'}>${st.perk?'Финал: ':''}+${st.rew}</button></div>`}).join('');
 $('yard').innerHTML=Object.entries(ANI).map(([id,a])=>{const n=S.an[id],pn=S.pen[id],busy=pn.end>Date.now(),ok=n>0&&!busy&&S.inv[a.feed]>=n,bc=Math.round(a.cost*(1+n*.5));return `<div class="ord"><div class="who">${ico(id)}<div><b>${a.n} ${n}/6</b><small>${n?(busy?'дают '+ITEM[a.out].n+': <span class="jt" data-end="'+pn.end+'"></span>':'корм: '+ico(a.feed)+' x'+n):'купи первую'}</small></div></div><button data-an="buy:${id}" ${n<6&&S.coins>=bc?'':'disabled'}>Купить ${bc}</button><button data-an="feed:${id}" ${ok?'':'disabled'}>Покормить</button></div>`}).join('')+'<h2>Декор</h2><div class="row">'+Object.entries(DEC).map(([id,d])=>`<button data-dec="${id}" ${S.dec[id]||S.coins<d.cost?'disabled':''}>${ico(id)}<div>${d.n}<small>${d.d} · ${S.dec[id]?'куплено':d.cost}</small></div></button>`).join('')+'</div>';
 $('inv').innerHTML=Object.entries(ITEM).filter(([id])=>S.inv[id]>0||(C[id]&&C[id].lv<=lvl())).map(([id,c])=>{const n=S.inv[id],m=S.mk[id];return `<button data-sell="${id}" ${n?'':'disabled'}>${ico(id)}<div>${c.n}: <b>${n}</b><small>цена ${price(id)}${m>1.05?' (выше)':m<.95?' (ниже)':''}${n?' · продать всё '+n*price(id):''}</small></div></button>`}).join('');
 $('work').innerHTML=`<div class="empty">В работе: ${S.work.length}/2</div>`+Object.entries(PROD).map(([id,p])=>{const ok=Object.entries(p.need).every(([c,q])=>S.inv[c]>=q)&&S.work.length<2;return `<div class="ord"><div class="who">${ico(id)}<div><b>${p.n}</b><small>${p.t} с · цена ${price(id)}</small></div></div><div class="need">${Object.entries(p.need).map(([c,q])=>`<span class="${S.inv[c]>=q?'ok':''}">${ico(c)} ${S.inv[c]}/${q}</span>`).join('')}</div><button data-p="${id}" ${ok?'':'disabled'}>Готовить</button></div>`}).join('')+S.work.map(j=>`<div class="ach done"><div><b>Готовится: ${PROD[j.k].n}</b></div><span class="jt" data-end="${j.end}"></span></div>`).join('');
 $('orders').innerHTML=S.orders.length?S.orders.map((o,i)=>`<div class="ord"><div class="who">${avatar(o.v)}<b>${VIL[o.v].n}</b></div><div class="need">${Object.entries(o.items).map(([c,q])=>`<span class="${S.inv[c]>=q?'ok':''}">${ico(c)} ${S.inv[c]}/${q}</span>`).join('')}</div><button data-o="${i}" ${canDo(o)?'':'disabled'}>Отдать, +${o.rew} ${ico('coin')}</button></div>`).join(''):'<div class="empty">Жители пока думают, что им нужно. Загляни чуть позже.</div>';
 $('achs').innerHTML=ACH.map(a=>{const v=Math.min(a.g,a.get()),d=S.ach[a.id];return `<div class="ach ${d?'done':''}"><div><b>${a.n}</b><small>${a.d} · награда ${a.r}</small><div class="bar2"><i style="width:${v/a.g*100}%"></i></div></div><span>${d?'Готово':v+'/'+a.g}</span></div>`}).join('');
 const rd=S.orders.filter(canDo).length;$('ob').textContent=rd?rd:'';
}
function render(){
 $('coins').textContent=S.coins;
 S.plots.forEach((p,i)=>{const d=g.children[i],em=d.querySelector('.em'),bar=d.querySelector('i'),tag=d.querySelector('.tag');
  d.className='plot'+(p.s===0?' lock':'')+(p.s===3?' wet':'')+(p.s===4?' ready':'');
  tag.innerHTML=p.s===2?ico('drop'):'';
  if(p.s===0){const nx=i===nextLock(),pf=priceFor(i);em.innerHTML=(nx?ico('coin'):ico('lock'))+pf;if(nx&&S.coins>=pf)d.className+=' can';if(!nx)d.className+=' far'}
  else if(p.s===1)em.innerHTML='';
  else if(p.s===2)em.innerHTML=ico('sprout');
  else if(p.s===3)em.innerHTML=ico(p.p<.5?'sprout':'leafy');
  else em.innerHTML=ico(p.c);
  bar.style.width=(p.s===3?p.p*100:p.s===4?100:0)+'%';
 });chk();ui()}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('sel',x===b));['farm','orders','work','yard','ach'].forEach(t=>$('t-'+t).hidden=t!==b.dataset.t)});
$('snd').textContent=S.mute?'Звук: выкл':'Звук: вкл';
$('snd').onclick=()=>{S.mute=!S.mute;$('snd').textContent=S.mute?'Звук: выкл':'Звук: вкл';save()};
document.addEventListener('pointerdown',()=>{const a=ac();if(a&&a.state==='suspended')a.resume()});
/* ---------- рост пока тебя нет ---------- */
function sim(dt){let n=0,h=0;S.plots.forEach(p=>{if(p.s===2&&S.up.water)p.s=3;if(p.s===3){p.p+=dt/C[p.c].t*speed();if(p.p>=1){p.p=1;p.s=4;n++}}if(p.s===4&&S.up.pick){take(p);h++}});return[n,h]}
const away=(Date.now()-(S.t||Date.now()))/1000;
if(away>20){const[n,h]=sim(Math.min(away,28800));const k=Math.min(3-S.orders.length,Math.floor(away*1000/25000));for(let i=0;i<k;i++)S.orders.push(newOrder());
 const m=Math.floor(away/60),tm=m>=60?Math.floor(m/60)+' ч '+m%60+' мин':m+' мин';
 msg(`С возвращением! Тебя не было ${tm}. Выросло: <b>${n}</b>${h?', помощник собрал: <b>'+h+'</b>':''}${k?', новых заказов: <b>'+k+'</b>':''}.`)}
/* ---------- рынок, мастерская, события, погода ---------- */
$('work').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=PROD[b.dataset.p];if(S.work.length>=2||!Object.entries(p.need).every(([c,q])=>S.inv[c]>=q)){SND.err();return}Object.entries(p.need).forEach(([c,q])=>S.inv[c]-=q);S.work.push({k:b.dataset.p,end:Date.now()+p.t*1000});SND.buy();key='';ui();save()};
$('ev').onclick=e=>{const b=e.target.closest('button');if(!b||!S.ev)return;if(S.ev.k==='crows'){SND.coin();toast('Вороны улетели')}else if(S.ev.k==='gold'){const r=Math.max(50,Math.round(S.coins*.1));S.coins+=r;S.st.earned+=r;SND.coin();bump();toast('+'+r+' монет')}S.ev=null;banner(Date.now())};
$('quests').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=+b.dataset.q,st=QUEST[i][S.qp[i]];if(!st||!Object.entries(st.need).every(([c,q])=>S.inv[c]>=q)){SND.err();return}
 Object.entries(st.need).forEach(([c,q])=>S.inv[c]-=q);S.coins+=st.rew;S.st.earned+=st.rew;addXp(40);S.qp[i]++;
 if(st.perk){S.perk[st.perk]=1;if(st.perk==='p'){const j=nextLock();if(j>=0)S.plots[j].s=1}if(st.perk==='x'){S.coins+=500;addXp(300)}toast('Награда: '+st.pn)}else toast(VIL[i].n+': +'+st.rew);
 SND.order();bump();key='';ui();render();save()};
$('yard').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.an){const[a,id]=b.dataset.an.split(':'),A=ANI[id],n=S.an[id];
  if(a==='buy'){const c=Math.round(A.cost*(1+n*.5));if(n<6&&S.coins>=c){S.coins-=c;S.an[id]++;SND.buy()}else SND.err()}
  else if(n&&S.inv[A.feed]>=n&&S.pen[id].end<=Date.now()){S.inv[A.feed]-=n;S.pen[id]={end:Date.now()+A.t*1000,k:n};SND.plant()}else SND.err()}
 else if(b.dataset.dec){const d=DEC[b.dataset.dec];if(!S.dec[b.dataset.dec]&&S.coins>=d.cost){S.coins-=d.cost;S.dec[b.dataset.dec]=1;SND.buy();toast(d.n+' куплено')}else SND.err()}
 key='';ui();render();save()};
let mkAt=0,trAt=0,evKey='';
function tickExtra(now,dt){
 S.work=S.work.filter(j=>{if(now>=j.end){S.inv[j.k]++;S.st.crafted++;addXp(8);toast(`Готово: ${PROD[j.k].n}`);SND.order();return false}return true});
 Object.entries(S.pen).forEach(([id,p])=>{if(p.k&&now>=p.end){S.inv[ANI[id].out]+=p.k;toast(ITEM[ANI[id].out].n+' x'+p.k);addXp(5*p.k);p.k=0;SND.coin()}});
 if(S.up.tract&&now-trAt>3000){trAt=now;const c=C[S.seed],i=S.plots.findIndex(p=>p.s===1);if(i>=0&&S.coins>=c.cost&&c.lv<=lvl()){const p=S.plots[i];S.coins-=c.cost;p.s=2;p.c=S.seed;p.p=0}}
 if(now-mkAt>45000){mkAt=now;Object.keys(ITEM).forEach(k=>{const m=S.mk[k]+(Math.random()-.5)*.3+(1-S.mk[k])*.1;S.mk[k]=Math.round(Math.max(.6,Math.min(1.6,m))*100)/100})}
 if(S.ev&&now>=S.ev.end){if(S.ev.k==='crows'){const rd=S.plots.map((p,i)=>p.s===4?i:-1).filter(i=>i>=0);if(rd.length){const p=S.plots[rd[R(rd.length)]];p.s=1;p.c='';p.p=0;toast('Вороны унесли урожай!');SND.err()}}S.ev=null}
 if(!S.ev&&Math.random()<dt/100){let k=['crows','gold','fair'][R(3)];if(k==='crows'&&S.dec.scare)k='gold';S.ev={k,end:now+(k==='fair'?60000:12000)};if(k==='fair')S.fairEnd=now+60000}
 banner(now)}
function banner(now){
 const e=S.ev,l=lvl(),se=season(),w=weather();
 $('lv').innerHTML=`Ур. ${l}<div class="bar2"><i style="width:${Math.min(100,(S.xp-xpAt(l))/(xpAt(l+1)-xpAt(l))*100)}%"></i></div>`;
 $('wx').textContent=`${se.n} · ${w.n} · рост x${(se.m*w.m).toFixed(2)}`;
 document.documentElement.dataset.s=se.k;
 const k=e?e.k:'';if(k!==evKey){evKey=k;$('ev').hidden=!e;$('ev').innerHTML=e?{crows:'Вороны на грядках! <button data-e="x">Прогнать</button>',gold:'Нашёл золотую монету! <button data-e="x">Подобрать</button>',fair:'Ярмарка: цены x2 <b id="ft"></b>'}[k]:''}
 if(e&&k==='fair'&&$('ft'))$('ft').textContent=Math.ceil((e.end-now)/1000)+' с';
 document.querySelectorAll('.jt').forEach(x=>x.textContent=Math.max(0,Math.ceil((x.dataset.end-now)/1000))+' с')}
{const day=new Date().toDateString();if(S.day!==day){S.day=day;chest('Подарок дня')}}
/* ---------- главный цикл ---------- */
let last=Date.now(),acc=0;
setInterval(()=>{
 const now=Date.now(),dt=(now-last)/1000;last=now;acc+=dt;
 S.plots.forEach((p,i)=>{
  if(p.s===3){p.p+=dt/C[p.c].t*speed();if(p.p>=1){p.p=1;p.s=4;SND.plant&&tone(880,.08,'sine',.06)}}
  if(p.s===2&&(S.up.water||weather().rain)&&acc>1)p.s=3;
  if(p.s===4&&S.up.pick&&Math.random()<dt/2.5)harvest(i,true);
 });
 tickExtra(now,dt);
 if(S.orders.length<3&&now>=S.next){S.orders.push(newOrder());S.next=now+25000;if(S.orders.length>0)toast('Новый заказ от жителей')}
 if(acc>1){acc=0;save()}
 render()},200);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
window.addEventListener('pagehide',save);
render();
