/* ═══════════════════════════════════════
   BIRTHDAY BEY V4 — script.js
═══════════════════════════════════════ */

/* ── STATE ── */
let pcInput='', musicPlaying=false, musicStarted=false, audioCtx=null;
const PC_CODE='0202';
let gaSayangClicks=0, sayangDone=false;
let candlesBlown=0;
const TOTAL_CANDLES=5;
let quizIndex=0, quizScore=0, quizAttempts=0, quizDone=false, quizPassed=false, qAnswered=false;
const MAX_TRIES=2;

const PAGES=['p1','p1b','p2','p3','p3b','p4','p5','p6','p7','p9','p10'];
let curPage='p1';
let cakeSliced=false, wishMade=false;
let decorPlaced=[];

/* ── CAT MESSAGES ── */
const catMsgs=['Mmwmw happy birthday Bey! 🐱','Piww bahagia selalu ya bey! 💙','Meoooow! Boo sayang banget sama Bey! 🐾','Nyaa jangan lupa senyum ya! 😸','Semangattt selaluu ya sayangku'];
let catMsgIdx=0;
function showCatMsg(){
  const sp=document.getElementById('catSpeech');
  if(sp){ sp.textContent=catMsgs[catMsgIdx%catMsgs.length]; catMsgIdx++; }
}

/* ── MEMORIES DATA ── */
const memories=[
  {src:'image/photo1.jpeg',cap:'☕ Elkafe Pertemuan pertama. "Free poll" dua kata yang merubah segalanya ✨'},
  {src:'image/photo2.jpeg',cap:'🏔️ Gunung Prongos Lantai 2 Kediri • 22 Desember 2025 Pertemuan yang terasa berbeda 💙'},
  {src:'image/photo3.jpeg',cap:'🌊 Pantai • 05 Januari 2026 Pertama kalinya kakiku menyentuh pasir pantai 🌅'}
];

/* ── QUIZ DATA ── */
const quizData=[
  {q:'Di mana kita pertama kali ketemu? ☕',opts:['Mall','Elkafe','Sekolah','Online'],ans:1,
   ok:'Betul! Di Elkafe, waktu kamu bilang "free poll" itu lho ke ach 💙☕',
   bad:'SALAAAH! 😤 Masa lupa di mana kita pertama ketemu?! Aku sedih banget si!'},
  {q:'Tanggal berapa kita ketemu di Gunung Prongos? 🏔️',opts:['15 Nov 2025','22 Des 2025','05 Jan 2026','Lupa 😅'],ans:1,
   ok:'Yesss! 22 Desember 2025, di lantai 2 Kediri! 🌄💙',
   bad:'Salaaaah! 😭 Masa tanggal sepenting itu lupa? ctw aja sie'},
  {q:'Apa yang bikin perjalanan ke pantai itu spesial? 🌊',opts:['Main surfing','Pertama kali kakiku ke pantai!','Lihat lumba-lumba','Pesta pasir'],ans:1,
   ok:'Iya betul! Itu pertama kalinya kakiku menyentuh pasir pantai 🌊💙',
   bad:'Salah! 😤 Itu pertama kali seumur hidup kakiku ke pantai, Bey!, kamu uda ga sayang aku lagi'},
  {q:'Berapa passcode website rahasia ini? 🔐',opts:['1234','0101','0202','2002'],ans:2,
   ok:'Pinter! 0202 kode spesial kita! 💙🔐',
   bad:'SALAH! 😭 Masa kode kita sendiri lupa?! mls bgt seh ga mut'}
];



/* ══════════════════════
   AUDIO ENGINE
══════════════════════ */
function getCtx(){
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
function osc(freq,type='sine',start=0,dur=.3,vol=.18,rampTo=.001){
  try{const c=getCtx(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(vol,c.currentTime+start);g.gain.exponentialRampToValueAtTime(rampTo,c.currentTime+start+dur);o.start(c.currentTime+start);o.stop(c.currentTime+start+dur);}catch(e){}
}
function noise(dur=.3,vol=.25){
  try{const c=getCtx(),n=c.sampleRate*dur,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*vol;const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.connect(g);g.connect(c.destination);g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);s.start(c.currentTime);s.stop(c.currentTime+dur);}catch(e){}
}
const SFX={
  click(){ osc(900,'sine',0,.06,.1); },
  keyTap(){ osc(700,'sine',0,.05,.08); noise(.04,.05); },
  unlock(){ [440,523,659,784,880,1047].forEach((f,i)=>osc(f,'sine',i*.07,.22,.13)); },
  errCode(){ osc(200,'sawtooth',0,.15,.22); osc(150,'sawtooth',.12,.18,.18); },
  sayang(){ [659,784,880,1047,1175].forEach((f,i)=>osc(f,'sine',i*.08,.22,.12)); },
  boo(){ osc(120,'square',0,.1,.22); osc(90,'square',.1,.12,.18); },
  prank(){ osc(300,'square',0,.06,.18); osc(200,'square',.06,.08,.15); },
  celebrate(){ [523,659,784,880,1047,1175,1319].forEach((f,i)=>osc(f,'sine',i*.09,.3,.13)); },
  blow(){ noise(.45,.35); osc(450,'sine',0,.06,.12); },
  allCandles(){ [523,659,784,880,1047,1175].forEach((f,i)=>osc(f,'sine',i*.1,.36,.14)); },
  angry(){ osc(110,'square',0,.12,.25); osc(90,'square',.12,.14,.22); osc(75,'sawtooth',.26,.2,.2); },
  cry(){ osc(380,'sine',0,.2,.15); osc(310,'sine',.2,.28,.12); osc(250,'sine',.48,.35,.1); },
  gift(){ [523,659,784,880].forEach((f,i)=>osc(f,'sine',i*.08,.25,.12)); noise(.05,.08); },
  pageFlip(){ osc(800,'sine',0,.04,.1); osc(600,'sine',.03,.06,.08); },
  correct(){ osc(523,'sine',0,.1,.15); osc(659,'sine',.08,.15,.13); osc(784,'sine',.18,.2,.1); },
  wrong(){ osc(200,'sawtooth',0,.12,.2); osc(150,'sawtooth',.1,.15,.18); },
  tada(){ [523,523,523,784,523,659,784].forEach((f,i)=>osc(f,'sine',i*.12,.18,.14)); setTimeout(()=>{[1047,1319,1568].forEach((f,i)=>osc(f,'sine',i*.06,.12,.08));},700); },
  slice(){ osc(400,'sawtooth',0,.08,.2); osc(300,'sawtooth',.05,.1,.18); noise(.2,.15); },
  balloon(){ osc(800,'sine',0,.04,.18); osc(1000,'sine',.03,.05,.12); noise(.04,.1); },
  sticker(){ osc(1047,'sine',0,.06,.12); osc(1319,'sine',.04,.08,.1); },
  cat(){ osc(600,'sine',0,.15,.1); osc(500,'sine',.08,.12,.08); osc(700,'sine',.18,.1,.07); },
};

/* ══════════════════════
   CONFETTI
══════════════════════ */
function popConfetti(x=.5,y=.5,count=55){confetti({particleCount:count,spread:75,origin:{x,y},colors:['#87CEEB','#AED9F5','#FFB6C1','#FFD700','#ffffff','#B8E6FF']});}
function bigConfetti(){confetti({particleCount:160,spread:110,origin:{y:.5},colors:['#87CEEB','#AED9F5','#FFB6C1','#FFD700','#ffffff']});setTimeout(()=>confetti({particleCount:70,angle:55,spread:60,origin:{x:0,y:.65}}),280);setTimeout(()=>confetti({particleCount:70,angle:125,spread:60,origin:{x:1,y:.65}}),280);}
function heartPop(){const d={spread:55,ticks:65,gravity:1.1,decay:.94,startVelocity:18};confetti({...d,particleCount:45,origin:{x:.3,y:.55},colors:['#FFB6C1','#FF85A1']});confetti({...d,particleCount:45,origin:{x:.7,y:.55},colors:['#87CEEB','#AED9F5']});}

/* ══════════════════════
   CANVAS HEARTS
══════════════════════ */
function initCanvas(){
  const cv=document.getElementById('floatCanvas');if(!cv)return;
  const ctx2=cv.getContext('2d');
  const resize=()=>{cv.width=window.innerWidth;cv.height=window.innerHeight;};
  resize();window.addEventListener('resize',resize);
  const syms=['💙','💙','✨','💕','⭐','💫','🐾','🐱','💙'];
  const hearts=[];
  function spawn(){hearts.push({x:Math.random()*cv.width,y:cv.height+20,size:14+Math.random()*16,speed:.6+Math.random()*1.1,op:.35+Math.random()*.5,drift:(Math.random()-.5)*.55,sym:syms[Math.floor(Math.random()*syms.length)]});}
  function draw(){ctx2.clearRect(0,0,cv.width,cv.height);hearts.forEach(h=>{h.y-=h.speed;h.x+=h.drift;h.op-=.003;if(h.op<=0)return;ctx2.save();ctx2.globalAlpha=Math.max(0,h.op);ctx2.font=`${h.size}px serif`;ctx2.fillText(h.sym,h.x,h.y);ctx2.restore();});for(let i=hearts.length-1;i>=0;i--)if(hearts[i].op<=0||hearts[i].y<-20)hearts.splice(i,1);requestAnimationFrame(draw);}
  setInterval(spawn,2200);draw();
}

/* ══════════════════════
   PAGE NAVIGATION
══════════════════════ */
function toPage(id){
  if(id==='p10'&&!quizPassed){toPage('p7');return;}
  SFX.pageFlip();
  document.querySelectorAll('.pg').forEach(s=>s.classList.remove('pg-active'));
  const el=document.getElementById(id);
  if(el){el.classList.add('pg-active');el.scrollTop=0;curPage=id;}
  document.querySelectorAll('.sn-dot').forEach(d=>d.classList.toggle('active',d.dataset.page===id));
  if(id==='p2') startCountdown();
  if(id==='p9') updateGate();
  if(id==='p10') startDinnerCountdown();
  if(id==='p7'&&!quizDone) setTimeout(initQuiz,200);
  if(id==='p3b') initCutCake();
  if(id==='p1b') initDecorate();
}

/* ══════════════════════
   PASSCODE
══════════════════════ */
function pcAdd(n){if(pcInput.length>=4)return;pcInput+=n;SFX.keyTap();updatePcDots();if(pcInput.length===4)setTimeout(checkPc,380);}
function pcDel(){if(!pcInput.length)return;pcInput=pcInput.slice(0,-1);SFX.click();updatePcDots();document.getElementById('pcErr').textContent='';}
function updatePcDots(){for(let i=0;i<4;i++){const d=document.getElementById('pd'+i),f=d.querySelector('.pcdot-fill');if(i<pcInput.length){d.classList.add('filled');f.style.background='white';f.style.boxShadow='0 2px 8px rgba(0,0,0,.15)';}else{d.classList.remove('filled');f.style.background='';f.style.boxShadow='';}}}
function checkPc(){
  if(pcInput===PC_CODE){
    SFX.unlock();bigConfetti();
    setTimeout(()=>{
      document.getElementById('passcodePage').style.display='none';
      const mc=document.getElementById('mainContent');mc.style.display='block';
      initCanvas();startCountdown();startDinnerCountdown();
      setInterval(startCountdown,1000);setInterval(startDinnerCountdown,1000);
      SFX.tada();setTimeout(()=>popConfetti(.5,.4,80),500);
    },650);
  }else{
    SFX.errCode();
    const c=document.getElementById('pcCard');c.classList.add('shake');
    document.getElementById('pcErr').textContent='❌ Kode salah, coba lagi ya Bey 💙';
    setTimeout(()=>{c.classList.remove('shake');pcInput='';updatePcDots();document.getElementById('pcErr').textContent='';},1100);
  }
}
document.addEventListener('keydown',e=>{
  const pp=document.getElementById('passcodePage');
  if(pp&&pp.style.display!=='none'&&pp.classList.contains('active')){
    if(e.key>='0'&&e.key<='9')pcAdd(parseInt(e.key));
    else if(e.key==='Backspace')pcDel();
  }
});

/* ══════════════════════
   P1: SAYANG AKU GA
══════════════════════ */
function onSayang(){
  if(sayangDone)return;sayangDone=true;
  SFX.sayang();heartPop();
  document.getElementById('sayangBox').style.display='none';
  document.getElementById('sayangResult').style.display='block';
  setTimeout(bigConfetti,350);setTimeout(()=>SFX.tada(),600);
}
function onGaSayang(){
  gaSayangClicks++;SFX.prank();
  const btn=document.getElementById('btnGaSayang');
  runAway(btn);
  const msgs=['Beneran ga sayang? 🤔','Hmm yakin nih? 💭','Aku sedih deh 🥺','Jangan gitu dong Bey 💔','Masa iya ga sayang 😭','Aku tau kok! 😏💙'];
  document.getElementById('sayangMsg').textContent=msgs[Math.min(gaSayangClicks-1,msgs.length-1)];
  if(gaSayangClicks>=6){sayangDone=true;SFX.celebrate();heartPop();setTimeout(()=>{document.getElementById('sayangBox').style.display='none';document.getElementById('sayangResult').style.display='block';},350);}
}
function runAway(btn){
  const zone=document.querySelector('.sayang-btn-zone');if(!zone)return;
  const zW=zone.offsetWidth,zH=zone.offsetHeight,bW=btn.offsetWidth,bH=btn.offsetHeight;
  const nx=Math.floor(Math.random()*Math.max(zW-bW-10,10)),ny=Math.floor(Math.random()*Math.max(zH-bH-5,5))-10;
  btn.style.position='absolute';btn.style.left=nx+'px';btn.style.top=ny+'px';btn.style.transition='left .18s ease,top .18s ease';
}

/* ══════════════════════
   P1b: DECORATE PAGE
══════════════════════ */
function initDecorate(){
  document.querySelectorAll('.aes-frame-opt').forEach(f=>f.classList.remove('active'));
}
function placeBalloon(el){
  SFX.balloon();
  el.classList.add('popped');
  popConfetti(Math.random(),.4,18);
  // Float a balloon SVG over the photo
  const area=document.getElementById('balloonPopArea');
  if(area){
    const color=el.dataset.color||'#AED9F5';
    const b=document.createElement('div');
    b.className='aes-float-balloon';
    b.style.cssText=`left:${20+Math.random()*60}%;bottom:0;position:absolute`;
    b.innerHTML=`<svg viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg" width="32"><ellipse cx="22" cy="22" rx="16" ry="20" fill="${color}"/><ellipse cx="16" cy="14" rx="5" ry="4" fill="white" opacity=".3" transform="rotate(-20 16 14)"/><path d="M22 42 Q20 48 22 54" stroke="${color}" stroke-width="1.5" fill="none"/></svg>`;
    area.appendChild(b);
    setTimeout(()=>b.remove(),1900);
  }
  setTimeout(()=>{el.classList.remove('popped');},500);
}
function applyFrame(el,frameClass){
  document.querySelectorAll('.aes-frame-opt').forEach(f=>f.classList.remove('active'));
  el.classList.add('active');
  SFX.click();
  const overlay=document.getElementById('frameOverlay');
  if(overlay){overlay.className='aes-frame-overlay '+frameClass;}
  popConfetti(.5,.5,12);
}

/* ══════════════════════
   P3: CANDLES
══════════════════════ */
function blowCandle(i){
  const fl=document.getElementById('fl'+i);
  if(!fl||fl.dataset.blown)return;
  fl.dataset.blown='1';SFX.blow();
  fl.style.transition='opacity .3s,transform .3s';fl.style.opacity='0';fl.style.transform='scale(0)';
  setTimeout(()=>fl.style.display='none',300);
  addSmokePuff(i);candlesBlown++;
  document.getElementById('cCount').textContent=candlesBlown;
  popConfetti(.25+i*.12,.5,35);
  if(candlesBlown>=TOTAL_CANDLES){
    setTimeout(()=>{
      SFX.allCandles();bigConfetti();SFX.tada();
      const done=document.getElementById('cakeAllDone');
      if(done)done.style.display='block';
      // Auto go to cut cake after 2.5s
      setTimeout(()=>toPage('p3b'),2500);
    },700);
  }
}
function addSmokePuff(idx){
  const cx=[156,179,206,232,256],x=cx[idx]||200;
  const svg=document.querySelector('.cake-main-svg');if(!svg)return;
  const p=document.createElementNS('http://www.w3.org/2000/svg','circle');
  p.setAttribute('cx',x);p.setAttribute('cy','82');p.setAttribute('r','5');p.setAttribute('fill','rgba(200,225,240,.65)');
  svg.appendChild(p);
  setTimeout(()=>{p.style.transition='all 1.1s ease';p.setAttribute('r','16');p.setAttribute('cy','62');p.style.opacity='0';},40);
  setTimeout(()=>p.remove(),1200);
}

/* ══════════════════════
   P3b: CUT CAKE
══════════════════════ */
function initCutCake(){cakeSliced=false;wishMade=false;updateCutUI();}
function updateCutUI(){
  const cutBtn=document.getElementById('cutBtn');
  const wishSection=document.getElementById('wishSection');
  const cutInstruction=document.getElementById('cutInstruction');
  if(!cakeSliced){
    if(cutInstruction)cutInstruction.style.display='block';
    if(wishSection)wishSection.style.display='none';
  }else{
    if(cutInstruction)cutInstruction.style.display='none';
    if(wishSection)wishSection.style.display='block';
  }
}
function doCutCake(){
  if(cakeSliced)return;
  cakeSliced=true;SFX.slice();SFX.celebrate();
  popConfetti(.5,.4,60);

  const wholeCake=document.getElementById('wholeCakeWrap');
  const slicedWrap=document.getElementById('slicedCakeWrap');
  const grid=document.getElementById('slicesGrid');

  // Animate whole cake out
  if(wholeCake){wholeCake.style.transition='opacity .4s,transform .4s';wholeCake.style.opacity='0';wholeCake.style.transform='scale(.85)';}

  const family=[
    {name:'Bunda',emoji:'👩',color:'#FFB6C1'},
    {name:'Ayah',emoji:'👨',color:'#AED9F5'},
    {name:'Kakak',emoji:'🧑',color:'#FFD700'},
    {name:'Ardi',emoji:'👦',color:'#B5D8FF'},
    {name:'Salsa',emoji:'👧',color:'#D4A8FF'},
    {name:'Nenek',emoji:'👵',color:'#FFC8A0'},
    {name:'Kakek',emoji:'👴',color:'#A8EABC'},
  ];

  setTimeout(()=>{
    if(wholeCake)wholeCake.style.display='none';
    if(slicedWrap){slicedWrap.style.display='block';slicedWrap.style.opacity='0';}
    if(grid){
      grid.innerHTML='';
      family.forEach((f,i)=>{
        const div=document.createElement('div');
        div.style.cssText=`background:${f.color}33;border:2px solid ${f.color};border-radius:14px;padding:10px 6px;text-align:center;opacity:0;transform:translateY(18px) scale(.85);transition:opacity .35s ${i*90}ms,transform .35s ${i*90}ms`;
        div.innerHTML=`
          <svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg" style="width:52px;height:auto;display:block;margin:0 auto 4px">
            <polygon points="30,5 58,65 2,65" fill="${f.color}" stroke="white" stroke-width="2" stroke-linejoin="round"/>
            <ellipse cx="30" cy="62" rx="28" ry="7" fill="${f.color}" opacity=".6"/>
            <path d="M8 34 Q22 26 36 34 Q50 42 56 34" stroke="white" stroke-width="3" fill="none" opacity=".7"/>
            <text x="30" y="50" text-anchor="middle" font-size="18">${f.emoji}</text>
          </svg>
          <div style="font-size:.72rem;font-weight:800;color:#2C5364;margin-top:2px">${f.name}</div>`;
        grid.appendChild(div);
        setTimeout(()=>{div.style.opacity='1';div.style.transform='translateY(0) scale(1)';},80+i*90);
      });
    }
    setTimeout(()=>{
      if(slicedWrap){slicedWrap.style.transition='opacity .4s';slicedWrap.style.opacity='1';}
      bigConfetti();
      // Tunggu semua slice muncul (7 slice x 90ms delay + 350ms animasi) lalu tampilkan tombol lanjut
      const totalDelay = 7 * 90 + 500;
      setTimeout(()=>{
        const nextBtn=document.getElementById('sliceNextBtn');
        if(nextBtn){nextBtn.style.display='block';nextBtn.style.opacity='0';nextBtn.style.transition='opacity .5s';setTimeout(()=>{nextBtn.style.opacity='1';},50);}
      }, totalDelay);
    },100);
  },450);
}
function doMakeWish(){
  if(wishMade)return;wishMade=true;SFX.tada();bigConfetti();
  const btn=document.getElementById('wishBtn');
  if(btn){btn.disabled=true;btn.textContent='Wish Made! ✨';btn.style.opacity='.7';}
  setTimeout(()=>{
    const done=document.getElementById('wishDone');if(done)done.style.display='block';
  },500);
}

/* ══════════════════════
   P5: LIGHTBOX
══════════════════════ */
function openLb(idx){
  const m=memories[idx];if(!m)return;
  const lb=document.getElementById('lightbox');
  const img=document.getElementById('lbImg');
  const cap=document.getElementById('lbCap');
  img.style.display='none';cap.textContent=m.cap;
  lb.classList.add('lb-open');SFX.click();
  const tmp=new Image();
  tmp.onload=()=>{img.src=tmp.src;img.style.display='block';};
  tmp.onerror=()=>{img.src=m.src;img.style.display='block';};
  tmp.src=m.src;
  document.body.style.overflow='hidden';
}
function closeLb(){document.getElementById('lightbox').classList.remove('lb-open');document.body.style.overflow='';SFX.click();}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLb();});

/* ══════════════════════
   P7: QUIZ
══════════════════════ */
function initQuiz(){
  quizIndex=0;quizScore=0;qAnswered=false;
  document.getElementById('qScore').textContent='0';
  document.getElementById('qFill').style.width='0%';
  document.getElementById('qProg').textContent='0 / 4';
  document.getElementById('quizEnd').style.display='none';
  document.getElementById('quizBody').style.display='block';
  renderQ();
}
function renderQ(){
  const q=quizData[quizIndex];if(!q)return;
  qAnswered=false;
  document.getElementById('qBadge').textContent='Q'+(quizIndex+1);
  document.getElementById('qText').textContent=q.q;
  document.getElementById('qFb').textContent='';document.getElementById('qFb').className='q-fb';
  const opts=document.getElementById('qOpts');opts.innerHTML='';
  q.opts.forEach((o,i)=>{
    const col=document.createElement('div');col.className='col-6';
    const btn=document.createElement('button');btn.className='q-opt-btn';btn.textContent=o;btn.onclick=()=>answerQ(i,btn);
    col.appendChild(btn);opts.appendChild(col);
  });
  document.getElementById('qFill').style.width=(quizIndex/quizData.length*100)+'%';
  document.getElementById('qProg').textContent=quizIndex+' / 4';
}
function answerQ(chosen,btnEl){
  if(qAnswered)return;qAnswered=true;
  const q=quizData[quizIndex];
  document.querySelectorAll('.q-opt-btn').forEach(b=>b.disabled=true);
  const fb=document.getElementById('qFb');
  if(chosen===q.ans){
    btnEl.classList.add('correct');SFX.correct();quizScore++;
    document.getElementById('qScore').textContent=quizScore;
    fb.textContent='✅ '+q.ok;fb.className='q-fb fb-ok';popConfetti(.5,.5,40);
  }else{
    btnEl.classList.add('wrong');
    document.querySelectorAll('.q-opt-btn').forEach((b,bi)=>{if(bi===q.ans)b.classList.add('correct');});
    SFX.wrong();setTimeout(()=>SFX.angry(),250);setTimeout(()=>SFX.cry(),700);
    fb.textContent='❌ '+q.bad;fb.className='q-fb fb-bad';
  }
  setTimeout(()=>{quizIndex++;if(quizIndex<quizData.length)renderQ();else finishQuiz();},2100);
}
function finishQuiz(){
  quizDone=true;
  document.getElementById('quizBody').style.display='none';
  document.getElementById('qFill').style.width='100%';
  document.getElementById('qProg').textContent='4 / 4';
  document.getElementById('qScore').textContent=quizScore;
  const end=document.getElementById('quizEnd');end.style.display='block';
  if(quizScore>=3){
    quizPassed=true;end.className='quiz-end-msg pass';
    end.innerHTML=`<div style="font-size:50px;margin-bottom:12px">🎉💙</div><h3 style="color:var(--blue-main);margin-bottom:8px;font-family:var(--font-f)">WOW! Score: ${quizScore}/4</h3><p style="color:var(--text);line-height:1.75;margin-bottom:16px">Kamu kenal aku dengan baik banget! Makasih ya Bey 💙 Akses rencana malam ini sudah terbuka!</p><button class="btn-fancy" onclick="toPage('p10')">Secret Plan Tonight 🗝️ <i class="fas fa-arrow-right ms-2"></i></button>`;
    SFX.celebrate();bigConfetti();setTimeout(()=>SFX.tada(),600);
  }else{
    quizAttempts++;updateHearts();
    if(quizAttempts>=MAX_TRIES){
      end.className='quiz-end-msg fail';
      end.innerHTML=`<div style="font-size:50px;margin-bottom:12px">😤💔</div><h3 style="color:#c0392b;margin-bottom:8px">Habis Chancesnya! Score: ${quizScore}/4</h3><p style="line-height:1.75;margin-bottom:16px;color:#721c24">Kamu beneran ga sayang aku ya? Masa momen kita lupa gitu aja 😭 Rundown terkunci!</p><button class="btn-fancy btn-fancy-pink" onclick="toPage('p9')">Lanjut aja deh 😢 <i class="fas fa-arrow-right ms-2"></i></button>`;
      SFX.cry();setTimeout(()=>SFX.angry(),500);
      document.getElementById('quizFailMsg').style.display='block';
    }else{
      end.className='quiz-end-msg fail';
      end.innerHTML=`<div style="font-size:44px;margin-bottom:10px">😤</div><h3 style="color:#c0392b;margin-bottom:8px">Masih kurang! Score: ${quizScore}/4</h3><p style="line-height:1.75;margin-bottom:16px;color:#721c24">1 kesempatan lagi! Jangan salah lagi ya! 😤</p><button class="btn-fancy" onclick="retryQuiz()">Coba Lagi! 💪 <i class="fas fa-redo ms-2"></i></button>`;
      SFX.angry();
    }
  }
  updateGate();
}
function retryQuiz(){quizIndex=0;quizScore=0;qAnswered=false;document.getElementById('quizEnd').style.display='none';document.getElementById('quizBody').style.display='block';document.getElementById('qScore').textContent='0';renderQ();}
function updateHearts(){for(let i=0;i<MAX_TRIES;i++){const h=document.getElementById('hl'+i);if(h&&i<quizAttempts){h.className='heart-life dead';h.innerHTML='<i class="fas fa-heart-crack"></i>';}}document.getElementById('attLeft').textContent=Math.max(0,MAX_TRIES-quizAttempts);}



/* ══════════════════════
   GATE
══════════════════════ */
function updateGate(){
  const pd=document.getElementById('gPending'),ok=document.getElementById('gOk'),lk=document.getElementById('gLocked');if(!pd)return;
  if(!quizDone){pd.style.display='block';ok.style.display='none';lk.style.display='none';return;}
  pd.style.display='none';
  if(quizPassed){ok.style.display='block';lk.style.display='none';}else{ok.style.display='none';lk.style.display='block';}
}

/* ══════════════════════
   MUSIC
══════════════════════ */
function toggleMusic(){
  const audio=document.getElementById('bgMusic'),icon=document.getElementById('mpIcon'),eq=document.getElementById('mpEq');if(!audio)return;
  if(!musicStarted){audio.volume=.45;audio.play().then(()=>{musicPlaying=true;musicStarted=true;icon.className='fas fa-pause';eq.classList.remove('paused');}).catch(()=>{});return;}
  if(musicPlaying){audio.pause();musicPlaying=false;icon.className='fas fa-play';eq.classList.add('paused');}
  else{audio.play();musicPlaying=true;icon.className='fas fa-pause';eq.classList.remove('paused');}
}
document.addEventListener('click',function tryPlay(){
  if(musicStarted)return;
  const audio=document.getElementById('bgMusic'),mc=document.getElementById('mainContent');
  if(audio&&mc&&mc.style.display!=='none'){audio.volume=.4;audio.play().then(()=>{musicPlaying=true;musicStarted=true;const icon=document.getElementById('mpIcon'),eq=document.getElementById('mpEq');if(icon)icon.className='fas fa-pause';if(eq)eq.classList.remove('paused');}).catch(()=>{});}
});

/* ══════════════════════
   COUNTDOWNS
══════════════════════ */
const fmt=n=>String(n).padStart(2,'0');
const setEl=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=fmt(v);};
function startCountdown(){
  const now=new Date(),bday=new Date('2026-05-31T00:00:00+07:00'),diff=bday-now;
  if(diff<=0){const n=document.getElementById('bdayNow');if(n)n.style.display='block';const cw=document.querySelector('.cd-wrap');if(cw)cw.style.display='none';return;}
  setEl('cdD',Math.floor(diff/86400000));setEl('cdH',Math.floor((diff%86400000)/3600000));setEl('cdM',Math.floor((diff%3600000)/60000));setEl('cdS',Math.floor((diff%60000)/1000));
}
function startDinnerCountdown(){
  const now=new Date(),dinner=new Date('2026-05-31T20:00:00+07:00'),diff=dinner-now;
  if(diff<=0){const dw=document.querySelector('.dinner-cd-card');if(dw)dw.innerHTML='<p class="dcd-title" style="color:var(--blue-main);font-size:1rem;font-weight:900">🎉 It\'s time! Let the magic begin! 💙</p>';return;}
  setEl('dcD',Math.floor(diff/86400000));setEl('dcH',Math.floor((diff%86400000)/3600000));setEl('dcM',Math.floor((diff%3600000)/60000));setEl('dcS',Math.floor((diff%60000)/1000));
}

/* ══════════════════════
   INIT
══════════════════════ */
window.addEventListener('load',()=>{
  startCountdown();startDinnerCountdown();
  setInterval(startCountdown,1000);setInterval(startDinnerCountdown,1000);
  // Observer for quiz page
  const p7=document.getElementById('p7');
  if(p7)new MutationObserver(()=>{if(p7.classList.contains('pg-active')&&!quizDone&&quizIndex===0)setTimeout(initQuiz,250);}).observe(p7,{attributes:true,attributeFilter:['class']});
  // Cat sound on click
  const catEl=document.querySelector('.cat-float');
  if(catEl)catEl.addEventListener('click',()=>{SFX.cat();popConfetti(.85,.85,15);showCatMsg();});
  console.log('%c🐱💙 Happy 19th Birthday Bey!','color:#5AABDD;font-size:16px;font-weight:900');
});
