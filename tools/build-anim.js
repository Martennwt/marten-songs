/* ============================================================================
   build-anim.js — build a song's karaoke animation + the site hub.

   Per song it reads:
     songs/<id>/song.json   (title, subtitle, theme, mp3, es[] per segment)
     songs/<id>/timing.json (Whisper verbose_json: segments[] + words[])
   and writes:
     songs/<id>/index.html  (the animation: English lights up word-by-word,
                             Spanish translation below)
   Then it rebuilds the root index.html hub from every songs/<id>/song.json.

   Usage:
     node tools/build-anim.js <song-id>     build one song + rebuild hub
     node tools/build-anim.js --all         rebuild every song + hub
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SONGS = path.join(ROOT, 'songs');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildSong(id) {
  const dir = path.join(SONGS, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'song.json'), 'utf8'));
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8'));
  const words = data.words || [];
  const segs = data.segments || [];
  const ES = meta.es || [];

  const lines = segs.map((s, i) => {
    const win = words.filter(w => w.start >= s.start - 0.06 && w.start < s.end + 0.25);
    const tokens = s.text.trim().split(/\s+/).filter(Boolean);
    let wobj;
    if (win.length === tokens.length) {
      wobj = tokens.map((t, k) => ({ t, s: +win[k].start.toFixed(2) }));
    } else {
      const dur = Math.max(0.4, s.end - s.start) / tokens.length;
      wobj = tokens.map((t, k) => ({ t, s: +(s.start + k * dur).toFixed(2) }));
    }
    return { start: +s.start.toFixed(2), end: +s.end.toFixed(2), es: ES[i] || '', w: wobj };
  });

  const linesHtml = lines.map((ln, i) => {
    const spans = ln.w.map(w => '<span class="w" data-s="' + w.s + '">' + esc(w.t) + '</span>').join(' ');
    const es = ln.es ? '<div class="es">' + esc(ln.es) + '</div>' : '';
    return '<div class="line" id="L' + i + '" data-s="' + ln.start + '" onclick="seekTo(' + ln.start + ')"><div class="en">' + spans + '</div>' + es + '</div>';
  }).join('\n');

  const head = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(meta.title) + ' &middot; Marten\'s Songs</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;600&display=swap" rel="stylesheet">' +
    '<style>' + songCSS() + '</style></head><body>';

  const body =
    '<canvas id="bg"></canvas>' +
    '<a id="home" href="../../index.html">&#8592; Marten\'s Songs</a>' +
    '<div id="title"><div class="t-eyebrow">' + esc(meta.subtitle || '') + '</div><h1>' + esc(meta.title) + '</h1>' +
    '<button id="startBtn" onclick="startPlay()">&#9654;&nbsp; Play</button>' +
    '<div class="t-hint">English lights up as it is sung &middot; Spanish below</div></div>' +
    '<div id="lyrics"><div id="scroll">' + linesHtml + '<div class="line end-pad"></div></div></div>' +
    '<div id="bar"><button id="pp" onclick="togglePlay()">&#9654;</button>' +
    '<span id="cur" class="t">0:00</span><div id="track" onclick="scrub(event)"><div id="fill"></div></div>' +
    '<span id="dur" class="t">0:00</span></div>' +
    '<audio id="au" src="' + esc(meta.mp3) + '" preload="auto"></audio>';

  const dataScript = '<script>var LINES=' + JSON.stringify(lines) + ';</script>';
  const app = '<script>' + songJS() + '</script>';
  fs.writeFileSync(path.join(dir, 'index.html'), head + body + dataScript + app + '</body></html>');
  return { id, meta, lineCount: lines.length };
}

function buildHub() {
  const ids = fs.readdirSync(SONGS).filter(d => fs.existsSync(path.join(SONGS, d, 'song.json')));
  const metas = ids.map(id => Object.assign({ id }, JSON.parse(fs.readFileSync(path.join(SONGS, id, 'song.json'), 'utf8'))));
  const cards = metas.map(m =>
    '<a class="card" href="songs/' + m.id + '/index.html">' +
    '<div class="c-theme">' + esc(m.theme || 'song') + '</div>' +
    '<div class="c-title">' + esc(m.title) + '</div>' +
    '<div class="c-sub">' + esc(m.subtitle || '') + '</div>' +
    '<div class="c-play">&#9654; Play</div></a>'
  ).join('\n');

  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Marten\'s Songs</title>' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;600&display=swap" rel="stylesheet">' +
    '<style>' + hubCSS() + '</style></head><body><canvas id="bg"></canvas>' +
    '<header><div class="eyebrow">AI songs about faith, love, life and God</div>' +
    '<h1>Marten\'s Songs</h1></header>' +
    '<main class="grid">' + cards + '</main>' +
    '<footer>Press a song, then Play. Lyrics light up word by word, with Spanish below.</footer>' +
    '<script>' + dotsJS() + '</script></body></html>';
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return metas.length;
}

/* ---------- shared visuals ---------- */
function dotsJS() {
  return 'var c=document.getElementById("bg"),x=c.getContext("2d"),P=[];' +
    'function rs(){c.width=innerWidth;c.height=innerHeight;}rs();addEventListener("resize",rs);' +
    'for(var i=0;i<46;i++){P.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.8+0.4,v:Math.random()*0.25+0.05,a:Math.random()*0.5+0.2});}' +
    'function dots(){x.clearRect(0,0,c.width,c.height);for(var i=0;i<P.length;i++){var p=P[i];p.y-=p.v;if(p.y<-5){p.y=c.height+5;p.x=Math.random()*c.width;}x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle="rgba(243,205,130,"+p.a+")";x.fill();}requestAnimationFrame(dots);}dots();';
}

function songCSS() {
  return [
    '*{box-sizing:border-box}', 'html,body{margin:0;height:100%;overflow:hidden}',
    "body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(120% 90% at 50% -10%,#16243a 0%,#0c1626 45%,#070d18 100%);color:#eaf0f7}",
    '#bg{position:fixed;inset:0;z-index:0;pointer-events:none}',
    '#home{position:fixed;top:14px;left:16px;z-index:40;color:#9fb0c6;text-decoration:none;font-size:.82rem;letter-spacing:.02em;opacity:.8}',
    '#home:hover{color:#ffe39a}',
    '#title{position:fixed;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.5rem;background:radial-gradient(80% 60% at 50% 40%,rgba(12,22,38,.55),rgba(7,13,24,.92));backdrop-filter:blur(2px);transition:opacity .8s ease,visibility .8s}',
    '#title.hide{opacity:0;visibility:hidden}',
    '.t-eyebrow{font-size:.78rem;letter-spacing:.22em;text-transform:uppercase;color:#caa45a}',
    "#title h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(3rem,11vw,7rem);margin:.2rem 0;line-height:1;background:linear-gradient(180deg,#fff,#f3d79a);-webkit-background-clip:text;background-clip:text;color:transparent}",
    '#startBtn{margin-top:1.3rem;font-size:1.05rem;font-weight:600;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border:0;border-radius:999px;padding:.85rem 2.2rem;cursor:pointer;box-shadow:0 10px 30px rgba(233,184,92,.35);transition:transform .15s}',
    '#startBtn:hover{transform:translateY(-2px)}', '.t-hint{margin-top:1rem;color:#7e90a8;font-size:.78rem}',
    '#lyrics{position:fixed;inset:0 0 84px 0;z-index:10;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);mask-image:linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent)}',
    '#scroll{position:absolute;left:0;right:0;top:50%;padding:0 6vw;transition:transform .55s cubic-bezier(.22,.61,.36,1)}',
    '.line{text-align:center;margin:0 auto;max-width:900px;padding:1.5rem 0;opacity:.28;filter:blur(.4px);transition:opacity .45s,filter .45s;cursor:pointer}',
    '.line.active{opacity:1;filter:none}', '.line.done{opacity:.4}',
    ".en{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(1.5rem,4.2vw,3rem);line-height:1.25}",
    '.w{color:rgba(234,240,247,.55);transition:color .18s}', '.line.active .w{color:rgba(234,240,247,.82)}',
    '.w.sung{color:#fbe2a0}',
    '.w.cur{color:#1a1205;background:linear-gradient(180deg,#ffe39a,#f0b94f);border-radius:.35em;box-shadow:0 0 22px rgba(243,196,108,.55);padding:0 .12em;margin:0 -.04em}',
    '.es{margin-top:.55rem;font-style:italic;font-size:clamp(.82rem,1.7vw,1.02rem);color:#86b6a0}', '.line.active .es{color:#a8d8c2}',
    '.end-pad{height:38vh;padding:0;opacity:0}',
    '#bar{position:fixed;left:0;right:0;bottom:0;z-index:20;height:84px;display:flex;align-items:center;gap:.9rem;padding:0 max(1rem,4vw);background:linear-gradient(0deg,rgba(7,13,24,.92),rgba(7,13,24,0))}',
    '#pp{flex:0 0 auto;width:46px;height:46px;border-radius:50%;border:0;cursor:pointer;font-size:1rem;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);box-shadow:0 6px 20px rgba(233,184,92,.35)}',
    '.t{font-variant-numeric:tabular-nums;font-size:.8rem;color:#9fb0c6;flex:0 0 auto}',
    '#track{position:relative;flex:1 1 auto;height:6px;border-radius:6px;background:rgba(255,255,255,.12);cursor:pointer}',
    '#fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:linear-gradient(90deg,#caa45a,#ffe39a)}',
    '@media(max-width:640px){#bar{height:74px}.line{padding:1.1rem 0}}'
  ].join('');
}

function songJS() {
  return [
    'var au=document.getElementById("au"),scroll=document.getElementById("scroll");',
    'var lineEls=[].slice.call(document.querySelectorAll(".line[data-s]"));',
    'var curLine=-1, started=false;',
    'function fmt(t){t=Math.max(0,t|0);return (t/60|0)+":"+("0"+(t%60)).slice(-2);}',
    'function startPlay(){document.getElementById("title").classList.add("hide");started=true;au.play();}',
    'function togglePlay(){ if(au.paused){au.play();} else {au.pause();} }',
    'function seekTo(t){ au.currentTime=t+0.01; if(au.paused&&started)au.play(); }',
    'function scrub(e){ var r=document.getElementById("track").getBoundingClientRect(); au.currentTime=(e.clientX-r.left)/r.width*(au.duration||1); }',
    'au.addEventListener("play",function(){document.getElementById("pp").innerHTML="&#10073;&#10073;";document.getElementById("title").classList.add("hide");});',
    'au.addEventListener("pause",function(){document.getElementById("pp").innerHTML="&#9654;";});',
    'au.addEventListener("loadedmetadata",function(){document.getElementById("dur").textContent=fmt(au.duration);});',
    'function setActive(i){ if(i===curLine)return;',
    '  if(curLine>=0){lineEls[curLine].classList.remove("active");lineEls[curLine].classList.add("done");}',
    '  curLine=i; if(i>=0){var el=lineEls[i];el.classList.add("active");el.classList.remove("done");',
    '    scroll.style.transform="translateY("+(-(el.offsetTop+el.offsetHeight/2))+"px)";} }',
    'function frame(){ var t=au.currentTime;',
    '  document.getElementById("cur").textContent=fmt(t);',
    '  document.getElementById("fill").style.width=((au.duration?t/au.duration:0)*100)+"%";',
    '  var idx=-1; for(var i=0;i<LINES.length;i++){ if(t>=LINES[i].start-0.15){idx=i;} else break; }',
    '  setActive(idx);',
    '  if(idx>=0){ var el=lineEls[idx], ws=el.querySelectorAll(".w"), L=LINES[idx].w;',
    '    for(var k=0;k<ws.length;k++){ var st=L[k]?L[k].s:0; var nx=(L[k+1]?L[k+1].s:LINES[idx].end||1e9);',
    '      ws[k].classList.toggle("sung", t>=st); ws[k].classList.toggle("cur", t>=st && t<nx); } }',
    '  requestAnimationFrame(frame); }',
    'requestAnimationFrame(frame);',
    dotsJS()
  ].join('\n');
}

function hubCSS() {
  return [
    '*{box-sizing:border-box}', 'html,body{margin:0;min-height:100%}',
    "body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(120% 90% at 50% -10%,#16243a 0%,#0c1626 45%,#070d18 100%);color:#eaf0f7;min-height:100vh}",
    '#bg{position:fixed;inset:0;z-index:0;pointer-events:none}',
    'header{position:relative;z-index:1;text-align:center;padding:14vh 1rem 2rem}',
    '.eyebrow{font-size:.8rem;letter-spacing:.22em;text-transform:uppercase;color:#caa45a}',
    "header h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(2.6rem,9vw,5.5rem);margin:.3rem 0 0;background:linear-gradient(180deg,#fff,#f3d79a);-webkit-background-clip:text;background-clip:text;color:transparent}",
    '.grid{position:relative;z-index:1;max-width:880px;margin:0 auto;padding:1rem 1.2rem 4rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.1rem}',
    '.card{display:block;text-decoration:none;color:inherit;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:1.4rem 1.4rem 1.2rem;transition:transform .18s,border-color .18s,background .18s}',
    '.card:hover{transform:translateY(-4px);border-color:rgba(243,196,108,.5);background:rgba(255,255,255,.07)}',
    '.c-theme{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#caa45a}',
    ".c-title{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.9rem;margin:.25rem 0}",
    '.c-sub{color:#9fb0c6;font-size:.82rem;min-height:1.2em}',
    '.c-play{margin-top:1rem;display:inline-block;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border-radius:999px;padding:.4rem 1.1rem;font-weight:600;font-size:.85rem}',
    'footer{position:relative;z-index:1;text-align:center;color:#7e90a8;font-size:.8rem;padding:0 1rem 3rem}'
  ].join('');
}

/* ---------- run ---------- */
const arg = process.argv[2];
if (!arg) { console.error('usage: node tools/build-anim.js <song-id> | --all'); process.exit(1); }
const ids = arg === '--all'
  ? fs.readdirSync(SONGS).filter(d => fs.existsSync(path.join(SONGS, d, 'song.json')))
  : [arg];
ids.forEach(id => { const r = buildSong(id); console.log('built song ' + r.id + ' (' + r.lineCount + ' lines)'); });
const n = buildHub();
console.log('rebuilt hub index.html (' + n + ' song' + (n === 1 ? '' : 's') + ')');
