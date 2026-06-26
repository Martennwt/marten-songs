/* ============================================================================
   build-anim.js — build a song's karaoke animation + the site hub.

   Per song reads:  songs/<id>/song.json  (title, subtitle, theme, mp3,
                       es[]/de[] translations per segment, about{de,es})
                    songs/<id>/timing.json (Whisper verbose_json: segments+words)
   Writes:          songs/<id>/index.html  (animation + player)
   Then rebuilds:   index.html             (hub, from every songs/<id>/song.json)

   Usage:  node tools/build-anim.js <song-id> | --all
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const SONGS = path.join(ROOT, 'songs');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildSong(id, opts) {
  opts = opts || {};
  const dir = path.join(SONGS, id);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'song.json'), 'utf8'));
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8'));
  const words = data.words || [];
  const segs = data.segments || [];
  const ES = meta.es || [], DE = meta.de || [], imageMap = meta.imageMap || [];
  const useImages = !!(opts.images && meta.images && meta.images.length);
  const variant = opts.variant || 'v1';

  let lines = segs.map((s, i) => {
    const tokens = s.text.trim().split(/\s+/).filter(Boolean);
    let wobj;
    if (data.precise && Array.isArray(s.w) && s.w.length === tokens.length) {
      // retime.js gave us exact per-word times — trust them verbatim
      wobj = s.w.map(o => ({ t: o.t, s: +(+o.s).toFixed(2) }));
    } else {
      const win = words.filter(w => w.start >= s.start - 0.06 && w.start < s.end + 0.25);
      if (win.length === tokens.length) wobj = tokens.map((t, k) => ({ t, s: +win[k].start.toFixed(2) }));
      else { const dur = Math.max(0.4, s.end - s.start) / tokens.length; wobj = tokens.map((t, k) => ({ t, s: +(s.start + k * dur).toFixed(2) })); }
    }
    return { start: +s.start.toFixed(2), end: +s.end.toFixed(2), es: ES[i] || '', de: DE[i] || '', w: wobj, seg: i, img: (imageMap[i] != null ? imageMap[i] : 0) };
  });

  if (opts.fine) {
    const fine = [];
    lines.forEach((ln, i) => {
      const enS = segs[i].text.trim().split(/(?<=[.!?])\s+/).filter(Boolean);
      if (enS.length <= 1) { fine.push(ln); return; }
      const esS = (ln.es || '').split(/(?<=[.!?])\s+/);
      const deS = (ln.de || '').split(/(?<=[.!?])\s+/);
      let wi = 0;
      enS.forEach((sent, k) => {
        const cnt = sent.trim().split(/\s+/).filter(Boolean).length;
        const ws = ln.w.slice(wi, wi + cnt); wi += cnt;
        if (!ws.length) return;
        const endT = (wi < ln.w.length) ? ln.w[wi].s : ln.end;
        fine.push({ start: +ws[0].s.toFixed(2), end: +endT.toFixed(2), es: (esS[k] || '').trim(), de: (deS[k] || '').trim(), w: ws, seg: i, img: ln.img });
      });
    });
    lines = fine;
  }

  const linesHtml = lines.map((ln, i) => {
    const spans = ln.w.map(w => '<span class="w" data-s="' + w.s + '">' + esc(w.t) + '</span>').join(' ');
    let tr = '';
    if (ln.es) tr += '<div class="tline es-t">' + esc(ln.es) + '</div>';
    if (ln.de) tr += '<div class="tline de-t">' + esc(ln.de) + '</div>';
    return '<div class="line" data-s="' + ln.start + '" onclick="seekTo(' + ln.start + ')"><div class="en">' + spans + '</div>' + tr + '</div>';
  }).join('\n');

  const flES = '<svg class="fl" viewBox="0 0 24 16"><rect width="24" height="16" rx="2" fill="#c60b1e"/><rect y="4" width="24" height="8" fill="#ffc400"/></svg>';
  const flDE = '<svg class="fl" viewBox="0 0 24 16"><rect width="24" height="16" rx="2" fill="#111"/><rect y="5.33" width="24" height="5.33" fill="#dd0000"/><rect y="10.66" width="24" height="5.34" fill="#ffce00"/></svg>';
  const volOn = '<svg class="vi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h3l4 3V7L6 10H3z"/><path d="M14.5 9.2a3.4 3.4 0 010 5.6"/><path d="M17 7a6.2 6.2 0 010 10"/></svg>';
  const volLow = '<svg class="vi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h3l4 3V7L6 10H3z"/><path d="M14.5 9.2a3.4 3.4 0 010 5.6"/></svg>';
  const volMute = '<svg class="vi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h3l4 3V7L6 10H3z"/><path d="M15.5 10l5 5M20.5 10l-5 5"/></svg>';
  const infoSvg = '<svg class="vi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="0.7" fill="currentColor" stroke="none"/></svg>';
  const listSvg = '<svg class="vi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';
  const playSvg = '<svg class="vi" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  const pauseSvg = '<svg class="vi" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';

  const head = '<!doctype html><html lang="en" data-tlang="de" data-variant="' + variant + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' +
    '<title>' + esc(meta.title) + " &middot; Marten's Songs</title>" +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">' +
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>' +
    '<style>' + songCSS() + '</style></head><body>';

  const body =
    '<canvas id="bg"></canvas>' +
    (useImages ? ('<div id="imgbg">' + meta.images.map((f, i) => '<div class="iml" data-i="' + i + '" style="background-image:url(\'' + esc(f) + '\')"></div>').join('') + '</div><div id="imgveil"></div>') : '') +
    '<a id="home" href="../../index.html">&#8592; Songs</a>' +
    '<button id="aboutBtn" class="about-btn" onclick="openAbout()"><span class="spark">&#10022;</span> <span id="aboutBtnLabel"></span></button>' +
    '<div id="countdown" hidden><svg viewBox="0 0 60 60"><circle class="cd-bg" cx="30" cy="30" r="26"></circle><circle class="cd-fg" cx="30" cy="30" r="26"></circle></svg><span id="cdNum"></span></div>' +
    '<div id="title" onclick="gateClick(event)"' + (meta.cover ? (' style="--hero:url(\'' + esc(meta.cover) + '\')"') : '') + '>' +
    '<a class="gate-x" href="../../index.html" aria-label="Back to songs">&times;</a>' +
    '<div class="gsheen"></div>' +
    '<div class="t-eyebrow">' + esc(meta.subtitle || '') + '</div><h1>' + esc(meta.title) + '</h1><div class="t-name" id="gateName"></div>' +
    '<div class="t-cta"><span class="t-play">&#9654;</span> <span id="startHint">Tippen, um zu starten</span></div></div>' +
    '<div id="lyrics"><div id="scroll">' + linesHtml + '<div class="line end-pad"></div></div></div>' +
    '<div id="about" hidden onclick="if(event.target===this)closeAbout()"><div class="about-card">' +
    '<button class="about-x" onclick="closeAbout()" aria-label="Close">&times;</button>' +
    '<div class="ab-head">' + (meta.narration === false ? '' : '<button id="narrBtn" class="ab-listen" onclick="toggleNarr()"><span class="ni">' + playSvg + '</span> <span id="narrLbl">Anhören</span></button>') +
    '<div class="ab-langs"><button class="ab-lng" data-l="es" onclick="setTLang(\'es\')">' + flES + ' ES</button><button class="ab-lng" data-l="de" onclick="setTLang(\'de\')">' + flDE + ' DE</button></div></div>' +
    '<div class="ab-eyebrow" id="aboutEyebrow"></div><h2 id="aboutTitle"></h2>' +
    '<div class="ab-refs" id="aboutRefs"></div><div id="aboutBody"></div></div></div>' +
    '<div id="lyricsModal" hidden onclick="if(event.target===this)closeLyrics()"><div class="about-card lyrics-card">' +
    '<button class="about-x" onclick="closeLyrics()" aria-label="Close">&times;</button>' +
    '<div class="ab-head"><button class="dlpdf" onclick="downloadPdf()">&#8595;&nbsp; PDF</button></div>' +
    '<div class="ab-eyebrow" id="lyricsEyebrow"></div><h2 id="lyricsTitle"></h2><div id="lyricsBody"></div></div></div>' +
    '<div id="player">' +
    '<button id="collapse" onclick="toggleCollapse()" aria-label="Hide or show the player">&#9662;</button>' +
    '<div class="pl-inner">' +
    '<div class="pl-row"><span id="cur" class="t">0:00</span><div id="track" onclick="scrub(event)"><div id="fill"></div></div><span id="dur" class="t">0:00</span></div>' +
    '<div class="pl-row pl-ctrl">' +
    '<div class="pl-left"><button id="pp" class="rnd" onclick="togglePlay()">&#9654;</button>' +
    '<div class="popwrap"><button id="volBtn" class="ico" onclick="toggleVolPop(event)" aria-label="Volume">' + volOn + '</button>' +
    '<div id="volPop" class="pop volpop" hidden><input id="vol" type="range" min="0" max="1" step="0.01" value="1" oninput="setVol(this.value)" aria-label="Volume"></div></div></div>' +
    '<div class="pl-right">' +
    '<button id="lyricsBtn" class="chip" onclick="openLyrics()">' + listSvg + ' <span id="lyricsLbl">Letra</span></button>' +
    '<div class="popwrap"><button id="langTog" class="chip" onclick="toggleLangMenu(event)"><span id="flag">' + flDE + '</span> <span id="langName">DE</span> <span class="caret">&#9662;</span></button>' +
    '<div id="langMenu" class="pop menu" hidden><button type="button" onclick="setTLang(\'es\')">' + flES + ' Español</button><button type="button" onclick="setTLang(\'de\')">' + flDE + ' Deutsch</button></div></div>' +
    '</div></div></div></div>' +
    '<audio id="au" src="' + esc(meta.mp3) + '" preload="auto"></audio><audio id="narr" preload="none"></audio>';

  const dataScript = '<script>var LINES=' + JSON.stringify(lines) +
    ';var ABOUT=' + JSON.stringify(meta.about || { es: [], de: [] }) +
    ';var FLAGS=' + JSON.stringify({ es: flES, de: flDE }) +
    ';var VOL=' + JSON.stringify({ on: volOn, low: volLow, mute: volMute }) +
    ';var SONG=' + JSON.stringify({ id: id, title: meta.title, refs: meta.subtitle || '' }) +
    ';var NARRICON=' + JSON.stringify({ play: playSvg, pause: pauseSvg }) +
    ';var SONG_OFFSET=' + JSON.stringify(+meta.offset || 0) +
    ';var INTRO_START=' + JSON.stringify(+meta.introStart || 0) +
    ';var NAMES=' + JSON.stringify(meta.names || {}) + ';</script>';
  const app = '<script>' + songJS() + '</script>';
  fs.writeFileSync(path.join(dir, opts.out || 'index.html'), head + body + dataScript + app + '</body></html>');
  return { id, lineCount: lines.length };
}

/* ---------------- per-song styles ---------------- */
function songCSS() {
  return [
    '*{box-sizing:border-box}', 'html,body{margin:0;height:100%;overflow:hidden}',
    "body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(120% 90% at 50% -10%,#16243a 0%,#0c1626 45%,#070d18 100%);color:#eaf0f7}",
    '#bg{position:fixed;inset:0;z-index:0;pointer-events:none}',
    '#home{position:fixed;top:14px;left:16px;z-index:40;color:#9fb0c6;text-decoration:none;font-size:.85rem;opacity:.85}', '#home:hover{color:#ffe39a}',
    '.about-btn{position:fixed;top:13px;right:14px;z-index:45;display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(180deg,rgba(255,231,173,.16),rgba(233,184,92,.12));border:1px solid rgba(243,196,108,.5);color:#ffe7ad;border-radius:999px;padding:.55rem 1.1rem;font-size:.9rem;font-weight:600;cursor:pointer;backdrop-filter:blur(4px);box-shadow:0 6px 20px rgba(0,0,0,.25);transition:transform .15s,background .2s,border-color .2s}',
    '.about-btn:hover{transform:translateY(-1px);background:linear-gradient(180deg,rgba(255,231,173,.28),rgba(233,184,92,.2));border-color:rgba(243,196,108,.85)}',
    '.about-btn .spark{color:#ffd87a}',
    /* countdown ring before the singing starts */
    '#countdown{position:fixed;top:66px;left:50%;transform:translateX(-50%);z-index:40;width:64px;height:64px;display:grid;place-items:center}',
    '#countdown[hidden]{display:none}',
    '#countdown svg{position:absolute;inset:0;width:64px;height:64px;transform:rotate(-90deg)}',
    '.cd-bg{fill:none;stroke:rgba(255,255,255,.13);stroke-width:3}',
    '.cd-fg{fill:none;stroke:#e9b85c;stroke-width:3;stroke-linecap:round;stroke-dasharray:163.4;stroke-dashoffset:163.4;filter:drop-shadow(0 0 6px rgba(243,205,130,.5))}',
    '#cdNum{position:relative;font-variant-numeric:tabular-nums;font-weight:600;color:#ffe7ad;font-size:1.15rem}',
    /* title / play gate */
    '#title{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.5rem;padding:1rem;overflow:hidden;background:#070d18;backdrop-filter:blur(2px);transition:opacity .8s,visibility .8s}',
    '#title::before{content:"";position:absolute;inset:0;background:var(--hero,none) center/cover no-repeat;opacity:.32;transform:scale(1.06);z-index:0}',
    '#title::after{content:"";position:absolute;inset:0;background:radial-gradient(85% 70% at 50% 42%,rgba(7,13,24,.5),rgba(7,13,24,.9));z-index:1}',
    '#title>*{position:relative;z-index:2}',
    '#title .gate-x{position:absolute;top:12px;left:18px;z-index:3;color:#cdd8e8;text-decoration:none;font-size:1.7rem;line-height:1;opacity:.85}', '#title .gate-x:hover{color:#ffe39a}',
    '#title.hide{opacity:0;visibility:hidden}',
    '#title .gsheen{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(115deg,transparent 40%,rgba(255,221,150,.16) 50%,transparent 60%);transform:translateX(-100%);opacity:0}',
    '#title.starting .gsheen{opacity:1;animation:gsweep 1.3s ease}',
    '@keyframes gsweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}',
    '#title{cursor:pointer}',
    '.t-cta{margin-top:1.3rem;display:inline-flex;align-items:center;gap:.6rem;color:#ffe7ad;font-size:1rem;font-weight:600;animation:cta 2.4s ease-in-out infinite}',
    '.t-play{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:linear-gradient(180deg,#ffe7ad,#e9b85c);color:#0c1626;box-shadow:0 8px 24px rgba(233,184,92,.4)}',
    '@keyframes cta{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
    '.t-eyebrow{font-size:.78rem;letter-spacing:.18em;text-transform:uppercase;color:#caa45a}',
    "#title h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(3rem,12vw,7rem);margin:.2rem 0;line-height:1;background:linear-gradient(180deg,#fff,#f3d79a);-webkit-background-clip:text;background-clip:text;color:transparent}",
    '#startBtn{margin-top:1.2rem;font-size:1.05rem;font-weight:600;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border:0;border-radius:999px;padding:.85rem 2.2rem;cursor:pointer;box-shadow:0 10px 30px rgba(233,184,92,.35)}',
    ".t-name{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.1rem,3vw,1.7rem);color:#e7c984;margin-top:.1rem;text-shadow:0 1px 12px rgba(0,0,0,.6)}",
    '.t-hint{margin-top:1rem;color:#7e90a8;font-size:.78rem}',
    /* lyrics */
    '#lyrics{position:fixed;left:0;right:0;top:0;bottom:120px;z-index:10;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent);mask-image:linear-gradient(180deg,transparent,#000 20%,#000 80%,transparent);transition:bottom .35s}',
    'body.pl-collapsed #lyrics{bottom:46px}',
    '#scroll{position:absolute;left:0;right:0;top:50%;padding:0 6vw;transition:transform .55s cubic-bezier(.22,.61,.36,1)}',
    '.line{text-align:center;margin:0 auto;max-width:920px;padding:1.4rem 0;opacity:.26;filter:blur(.4px);transition:opacity .45s,filter .45s;cursor:pointer}',
    '.line.active{opacity:1;filter:none}', '.line.done{opacity:.4}',
    ".en{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(1.7rem,4.4vw,3rem);line-height:1.28}",
    /* soft shimmer / wave highlight (no hard box) */
    '.w{color:rgba(234,240,247,.42)}',
    '.line.active .w{color:rgba(234,240,247,.6);transition:filter .3s ease}',
    '.line.active .w.sung,.line.active .w.cur{color:transparent;-webkit-background-clip:text;background-clip:text}',
    '.line.active .w.sung{background-image:linear-gradient(#f1d489,#f1d489)}',
    '.line.active .w.cur{background-image:linear-gradient(90deg,#ffe6a6 var(--p,0%),rgba(234,240,247,.55) var(--p,0%));filter:drop-shadow(0 0 8px rgba(243,205,130,.45))}',
    /* translation under each line */
    '.tline{margin-top:.6rem;font-style:italic;font-size:clamp(.92rem,1.8vw,1.06rem);color:rgba(158,201,182,.5);letter-spacing:.01em}',
    '.line.active .tline{color:rgba(186,226,207,.72)}',
    '.de-t{display:none}', 'html[data-tlang="de"] .es-t{display:none}', 'html[data-tlang="de"] .de-t{display:block}',
    '.end-pad{height:40vh;padding:0;opacity:0}',
    /* player */
    '#player{position:fixed;left:0;right:0;bottom:0;z-index:50;padding:0 max(.8rem,3vw) calc(.7rem + env(safe-area-inset-bottom));background:linear-gradient(0deg,rgba(7,13,24,.96) 60%,rgba(7,13,24,0));transition:transform .35s}',
    '#collapse{position:absolute;left:50%;top:-16px;transform:translateX(-50%);width:54px;height:22px;border:0;border-radius:11px 11px 0 0;background:rgba(20,32,52,.95);color:#9fb0c6;cursor:pointer;font-size:.8rem;box-shadow:0 -2px 10px rgba(0,0,0,.25)}',
    'body.pl-collapsed #player .pl-inner{display:none}', 'body.pl-collapsed #collapse{transform:translateX(-50%) rotate(180deg)}',
    '.pl-inner{max-width:920px;margin:0 auto;display:flex;flex-direction:column;gap:.5rem;padding-top:.55rem}',
    '.pl-row{display:flex;align-items:center;gap:.7rem}',
    '.t{font-variant-numeric:tabular-nums;font-size:.78rem;color:#9fb0c6;flex:0 0 auto}',
    '#track{position:relative;flex:1 1 auto;height:6px;border-radius:6px;background:rgba(255,255,255,.13);cursor:pointer}',
    '#fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:6px;background:linear-gradient(90deg,#caa45a,#ffe39a)}',
    '.pl-ctrl{justify-content:space-between}', '.pl-left,.pl-right{display:flex;align-items:center;gap:.6rem}',
    '.rnd{width:44px;height:44px;border-radius:50%;border:0;cursor:pointer;font-size:1rem;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);box-shadow:0 6px 18px rgba(233,184,92,.35)}',
    '.ico{display:inline-flex;align-items:center;justify-content:center;background:transparent;border:0;color:#aebccf;cursor:pointer;padding:.25rem}', '.ico:hover{color:#ffe39a}',
    '.vi{width:19px;height:19px;display:block}',
    '.fl{width:22px;height:15px;border-radius:2px;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.18)}',
    '#vol{width:92px;max-width:28vw;accent-color:#e9b85c;cursor:pointer}',
    '.chip{display:flex;align-items:center;gap:.4rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#eaf0f7;border-radius:999px;padding:.35rem .7rem;font-size:.82rem;font-weight:600;cursor:pointer}',
    '.chip:hover{border-color:rgba(243,196,108,.5)}', '#flag{display:flex;line-height:0}',
    /* about overlay */
    '#about{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:rgba(5,10,20,.72);backdrop-filter:blur(4px)}',
    '#about[hidden]{display:none}',
    '.about-card{position:relative;max-width:660px;max-height:84vh;overflow:auto;background:linear-gradient(180deg,#101d31,#0b1424);border:1px solid rgba(255,255,255,.1);border-top:2px solid rgba(243,196,108,.55);border-radius:20px;padding:1.7rem 1.6rem 2rem;box-shadow:0 30px 80px rgba(0,0,0,.5)}',
    '.about-x{position:absolute;top:.55rem;right:.85rem;background:transparent;border:0;color:#9fb0c6;font-size:1.6rem;cursor:pointer;line-height:1}', '.about-x:hover{color:#ffe39a}',
    '.ab-eyebrow{font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#caa45a}',
    "#aboutTitle{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:2.1rem;margin:.1rem 0 .15rem;color:#f3d79a;line-height:1.05}",
    '.ab-head{display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin:0 0 .8rem;flex-wrap:wrap}',
    '.ab-langs{display:inline-flex;gap:.2rem;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:.2rem}',
    '.ab-lng{display:flex;align-items:center;gap:.35rem;background:transparent;border:0;color:#cdd8e8;border-radius:999px;padding:.32rem .7rem;font-size:.8rem;font-weight:600;cursor:pointer}',
    '.ab-lng.on{background:linear-gradient(180deg,#ffe7ad,#e9b85c);color:#0c1626}', '.ab-lng .fl{width:18px;height:12px}',
    '.ab-listen{display:inline-flex;align-items:center;gap:.4rem;background:rgba(255,231,173,.12);border:1px solid rgba(243,196,108,.45);color:#ffe7ad;border-radius:999px;padding:.4rem .9rem;font-size:.84rem;font-weight:600;cursor:pointer}',
    '.ab-listen:hover{background:rgba(255,231,173,.22)}', '.ab-listen .ni{display:flex}', '.ab-listen .vi{width:16px;height:16px}',
    '.ab-refs{color:#9fb0c6;font-size:.82rem;margin-bottom:1rem}',
    '.ab-intro{color:#d8e2f0;font-size:1rem;line-height:1.62;margin:0 0 1.15rem;padding-bottom:1.05rem;border-bottom:1px solid rgba(255,255,255,.1)}',
    '.ab-sec{margin-bottom:1.15rem}', '.ab-h{font-weight:600;color:#ffe39a;font-size:.98rem;margin-bottom:.3rem;letter-spacing:.01em}',
    '.ab-p{color:#c6d2e2;font-size:.93rem;line-height:1.62;margin:.35rem 0}',
    '.popwrap{position:relative;display:inline-flex}',
    '.pop{position:absolute;bottom:calc(100% + 10px);background:#16243a;border:1px solid rgba(255,255,255,.14);border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.45);padding:.6rem;z-index:55}',
    '.pop[hidden]{display:none}',
    '.volpop{left:50%;transform:translateX(-50%);display:flex;align-items:center;justify-content:center}',
    '.volpop input{appearance:slider-vertical;-webkit-appearance:slider-vertical;writing-mode:vertical-lr;direction:rtl;width:10px;height:96px;accent-color:#e9b85c;cursor:pointer}',
    '.menu{right:0;min-width:148px;display:flex;flex-direction:column;gap:.15rem;padding:.35rem}',
    '.menu button{display:flex;align-items:center;gap:.5rem;background:transparent;border:0;color:#eaf0f7;font:inherit;font-size:.88rem;text-align:left;padding:.45rem .55rem;border-radius:8px;cursor:pointer}',
    '.menu button:hover{background:rgba(255,255,255,.08)}', '.menu .fl{width:20px;height:14px}',
    '.caret{font-size:.7rem;color:#9fb0c6}',
    '.dlpdf{background:rgba(255,231,173,.14);border:1px solid rgba(243,196,108,.5);color:#ffe7ad;border-radius:999px;padding:.4rem .9rem;font-size:.8rem;font-weight:600;cursor:pointer}', '.dlpdf:hover{background:rgba(255,231,173,.26)}',
    '#lyricsModal{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:1.2rem;background:rgba(5,10,20,.72);backdrop-filter:blur(4px)}', '#lyricsModal[hidden]{display:none}',
    '.lyrics-card .ll{padding:.55rem 0;border-bottom:1px solid rgba(255,255,255,.06)}',
    ".lyrics-card .ll-en{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:#eef2f8;line-height:1.3}",
    '.lyrics-card .ll-tr{font-style:italic;font-size:.86rem;color:rgba(158,201,182,.85);margin-top:.18rem}',
    /* background images (v2) */
    '#imgbg{position:fixed;inset:0;z-index:1;pointer-events:none}',
    '.iml{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.8s ease;animation:imgdrift 22s ease-in-out infinite alternate}',
    '.iml.on{opacity:.34}',
    '@keyframes imgdrift{from{transform:scale(1.12) translate(-2.8%,-1%)}to{transform:scale(1.12) translate(2.8%,1%)}}',
    '@keyframes imgpan{from{background-position:0% center}to{background-position:100% center}}',
    '#imgveil{position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(100% 85% at 50% 45%,rgba(7,13,24,.3),rgba(7,13,24,.76))}',
    'html[data-variant="v2"] .tline{color:rgba(178,186,198,.55)}', 'html[data-variant="v2"] .line.active .tline{color:rgba(204,212,224,.8)}',
    /* mobile: bigger lyrics, comfy player */
    '@media(max-width:640px){',
    '  #lyrics{bottom:132px}', 'body.pl-collapsed #lyrics{bottom:46px}',
    '  .en{font-size:clamp(1.85rem,6.4vw,2.5rem);line-height:1.3}',
    '  .tline{font-size:clamp(.98rem,3.7vw,1.15rem)}',
    '  .line{padding:1.15rem 0}', '#vol{width:74px}', '.t{font-size:.72rem}',
    '  .about-btn{font-size:.76rem;padding:.42rem .8rem;top:10px;right:10px}', '  #home{top:11px;font-size:.78rem}',
    '  #lyricsLbl{display:none}',
    '  .iml{animation:imgpan 14s ease-in-out infinite alternate;transform:none}',
    '}'
  ].join('');
}

/* ---------------- per-song behaviour ---------------- */
function songJS() {
  return [
    'var au=document.getElementById("au"),scroll=document.getElementById("scroll");',
    'var lineEls=[].slice.call(document.querySelectorAll(".line[data-s]"));',
    'var imls=[].slice.call(document.querySelectorAll(".iml"));var curImg=-1;',
    'function setImg(n){if(!imls.length||n===curImg)return;curImg=n;for(var z=0;z<imls.length;z++)imls[z].classList.toggle("on",z===n);}',
    'var cd=document.getElementById("countdown"),cdfg=document.querySelector(".cd-fg"),cdNum=document.getElementById("cdNum"),CDC=163.4,FS0=LINES.length?LINES[0].start:0;',
    'var curLine=-1,started=false,aboutOpen=false,lyricsOpen=false,lastVol=1,narr=document.getElementById("narr"),narrPlaying=false,LEAD=0.18,OFFSET=(typeof SONG_OFFSET!=="undefined"?+SONG_OFFSET:0),INTRO=(typeof INTRO_START!=="undefined"?+INTRO_START:0);',
    // remember original word times, then re-space only the words sung BEFORE the
    // real vocal start (INTRO): Whisper often anchors a soft intro a few seconds
    // early. Everything at/after the first real word is left exactly as it was.
    'LINES.forEach(function(L){L.w.forEach(function(o){o.s0=o.s;});});',
    'function applyIntro(){var flat=[];LINES.forEach(function(L){L.w.forEach(function(o){flat.push(o);});});var k=0;while(k<flat.length&&flat[k].s0<INTRO)k++;if(k<=0){for(var i=0;i<flat.length;i++)flat[i].s=flat[i].s0;}else{var A=(k<flat.length)?flat[k].s0:(INTRO+k*0.45);for(var i=0;i<k;i++)flat[i].s=+(INTRO+(A-INTRO)*(i/k)).toFixed(2);for(var i=k;i<flat.length;i++)flat[i].s=flat[i].s0;}LINES.forEach(function(L){L.start=L.w[0].s;});FS0=LINES.length?LINES[0].start:0;}',
    'function fmt(t){t=Math.max(0,t|0);return (t/60|0)+":"+("0"+(t%60)).slice(-2);}',
    'function startPlay(){if(started)return;started=true;au.play();var tt=document.getElementById("title");tt.classList.add("starting");setTimeout(function(){tt.classList.add("hide");},1500);}',
    'function gateClick(e){if(e.target&&e.target.closest&&e.target.closest(".gate-x"))return;startPlay();}',
    'function togglePlay(){if(au.paused){au.play();}else{au.pause();}}',
    'function seekTo(t){au.currentTime=t+0.01;if(au.paused&&started)au.play();}',
    'function scrub(e){var r=document.getElementById("track").getBoundingClientRect();au.currentTime=(e.clientX-r.left)/r.width*(au.duration||1);}',
    'function setVol(v){au.volume=+v;au.muted=false;volIcon();}',
    'function toggleMute(){if(au.muted||au.volume===0){au.muted=false;au.volume=lastVol||1;document.getElementById("vol").value=au.volume;}else{lastVol=au.volume;au.muted=true;}volIcon();}',
    'function volIcon(){var b=document.getElementById("volBtn");if(au.muted||au.volume===0){b.innerHTML=VOL.mute;}else if(au.volume<0.5){b.innerHTML=VOL.low;}else{b.innerHTML=VOL.on;}}',
    'function toggleCollapse(){document.body.classList.toggle("pl-collapsed");}',
    'var UI={es:{about:"La idea detrás",lyrics:"Letra",listen:"Escuchar"},de:{about:"Die Idee hinter dem Lied",lyrics:"Text",listen:"Anhören"}};',
    'function updateLangUI(){var L=curLang(),f=FLAGS[L],n=L.toUpperCase();document.getElementById("flag").innerHTML=f;document.getElementById("langName").textContent=n;var bl=document.getElementById("aboutBtnLabel");if(bl)bl.textContent=UI[L].about;var ll=document.getElementById("lyricsLbl");if(ll)ll.textContent=UI[L].lyrics;var nl=document.getElementById("narrLbl");if(nl)nl.textContent=UI[L].listen;var gn=document.getElementById("gateName");if(gn)gn.textContent=(NAMES&&NAMES[L])?NAMES[L]:"";var seg=document.querySelectorAll(".ab-lng");for(var i=0;i<seg.length;i++)seg[i].classList.toggle("on",seg[i].getAttribute("data-l")===L);}',
    'function setTLang(l){document.documentElement.setAttribute("data-tlang",l);updateLangUI();closeMenus();if(narr&&!narr.paused)narr.pause();if(narr)narr.removeAttribute("data-src");if(aboutOpen)renderAbout();if(lyricsOpen)renderLyrics();}',
    'function toggleLang(){setTLang(curLang()==="de"?"es":"de");}',
    'function closeMenus(){var v=document.getElementById("volPop");if(v)v.hidden=true;var m=document.getElementById("langMenu");if(m)m.hidden=true;}',
    'function toggleVolPop(e){e.stopPropagation();var m=document.getElementById("langMenu");if(m)m.hidden=true;var v=document.getElementById("volPop");v.hidden=!v.hidden;}',
    'function toggleLangMenu(e){e.stopPropagation();var v=document.getElementById("volPop");if(v)v.hidden=true;var m=document.getElementById("langMenu");m.hidden=!m.hidden;}',
    'document.addEventListener("click",function(e){if(!(e.target.closest&&e.target.closest(".popwrap")))closeMenus();});',
    'function renderLyrics(){var L=curLang();document.getElementById("lyricsEyebrow").textContent=L==="de"?"Ganzer Text":"Letra completa";document.getElementById("lyricsTitle").textContent=SONG.title;var h="";for(var i=0;i<LINES.length;i++){var en=LINES[i].w.map(function(o){return o.t;}).join(" ");if(!en)continue;var tr=LINES[i][L]||"";h+=\'<div class="ll"><div class="ll-en">\'+en+"</div>"+(tr?(\'<div class="ll-tr">\'+tr+"</div>"):"")+"</div>";}document.getElementById("lyricsBody").innerHTML=h;}',
    'function openLyrics(){lyricsOpen=true;renderLyrics();document.getElementById("lyricsModal").hidden=false;}',
    'function closeLyrics(){lyricsOpen=false;document.getElementById("lyricsModal").hidden=true;}',
    'function downloadPdf(){if(!(window.jspdf&&window.jspdf.jsPDF)){alert("PDF konnte nicht geladen werden (Internet noetig).");return;}var L=curLang();var doc=new window.jspdf.jsPDF({unit:"pt",format:"a4"});var W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),mx=56,y=74,mw=W-mx*2;doc.setFont("times","bold");doc.setFontSize(22);doc.setTextColor(20,20,20);doc.text(doc.splitTextToSize(SONG.title,mw),mx,y);y+=24;doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(120,120,120);doc.text(doc.splitTextToSize(SONG.refs||"",mw),mx,y);y+=28;for(var i=0;i<LINES.length;i++){var en=LINES[i].w.map(function(o){return o.t;}).join(" ");if(!en)continue;var tr=LINES[i][L]||"";doc.setFont("times","normal");doc.setFontSize(13);var el=doc.splitTextToSize(en,mw);doc.setFont("times","italic");doc.setFontSize(10.5);var trl=tr?doc.splitTextToSize(tr,mw):[];var need=el.length*17+(trl.length?trl.length*14+8:0)+12;if(y+need>H-46){doc.addPage();y=62;}doc.setFont("times","normal");doc.setFontSize(13);doc.setTextColor(25,25,25);doc.text(el,mx,y);y+=el.length*17+3;if(trl.length){doc.setFont("times","italic");doc.setFontSize(10.5);doc.setTextColor(95,118,103);doc.text(trl,mx,y);y+=trl.length*14+12;}else{y+=8;}}doc.save(SONG.id+"-"+L+".pdf");}',
    'function curLang(){return document.documentElement.getAttribute("data-tlang")==="de"?"de":"es";}',
    'function renderAbout(){var L=curLang();document.getElementById("aboutEyebrow").textContent=L==="de"?"Über den Song":"Sobre la canción";document.getElementById("aboutTitle").textContent=SONG.title;document.getElementById("aboutRefs").textContent=SONG.refs||"";var h=(ABOUT.intro&&ABOUT.intro[L])?(\'<p class="ab-intro">\'+ABOUT.intro[L]+"</p>"):"";var secs=(ABOUT&&ABOUT[L])||[];for(var i=0;i<secs.length;i++){h+=\'<div class="ab-sec"><div class="ab-h">\'+secs[i].h+"</div>";var ps=secs[i].p||[];for(var j=0;j<ps.length;j++)h+=\'<div class="ab-p">\'+ps[j]+"</div>";h+="</div>";}document.getElementById("aboutBody").innerHTML=h;}',
    'function openAbout(){aboutOpen=true;renderAbout();document.getElementById("about").hidden=false;}',
    'function closeAbout(){aboutOpen=false;document.getElementById("about").hidden=true;if(narr&&!narr.paused)narr.pause();}',
    'function setNarrIcon(){var b=document.getElementById("narrBtn");if(b)b.querySelector(".ni").innerHTML=narrPlaying?NARRICON.pause:NARRICON.play;}',
    'function toggleNarr(){var want="about-"+curLang()+".mp3";if(narr.getAttribute("data-src")!==want){narr.src=want;narr.setAttribute("data-src",want);}if(narr.paused){au.pause();var pr=narr.play();if(pr&&pr.catch)pr.catch(function(){});}else{narr.pause();}}',
    'if(narr){narr.addEventListener("play",function(){narrPlaying=true;setNarrIcon();});narr.addEventListener("pause",function(){narrPlaying=false;setNarrIcon();});narr.addEventListener("ended",function(){narrPlaying=false;setNarrIcon();});}',
    'document.addEventListener("keydown",function(e){if(e.key==="Escape"){closeAbout();closeLyrics();closeMenus();}});',
    'au.addEventListener("play",function(){document.getElementById("pp").innerHTML="&#10073;&#10073;";});',
    'au.addEventListener("pause",function(){document.getElementById("pp").innerHTML="&#9654;";});',
    'au.addEventListener("loadedmetadata",function(){document.getElementById("dur").textContent=fmt(au.duration);});',
    'function setActive(i){if(i===curLine)return;',
    '  if(curLine>=0){var pe=lineEls[curLine];pe.classList.remove("active");pe.classList.add("done");var pw=pe.querySelectorAll(".w");for(var q=0;q<pw.length;q++){pw[q].className="w sung";pw[q].style.removeProperty("--p");}}',
    '  curLine=i;if(i>=0){var el=lineEls[i];el.classList.add("active");el.classList.remove("done");scroll.style.transform="translateY("+(-(el.offsetTop+el.offsetHeight/2))+"px)";}}',
    'function frame(){var t=au.currentTime,tt=t+LEAD-OFFSET,fs0=FS0+OFFSET;',
    '  document.getElementById("cur").textContent=fmt(t);',
    '  document.getElementById("fill").style.width=((au.duration?t/au.duration:0)*100)+"%";',
    '  if(started&&fs0>0.6&&t<fs0-0.05){if(cd.hidden)cd.hidden=false;var cpr=Math.max(0,Math.min(1,t/fs0));cdfg.style.strokeDashoffset=(CDC*(1-cpr)).toFixed(1);cdNum.textContent=Math.max(1,Math.ceil(fs0-t));}else if(cd&&!cd.hidden){cd.hidden=true;}',
    '  var idx=-1;for(var i=0;i<LINES.length;i++){if(tt>=LINES[i].start-0.15){idx=i;}else break;}',
    '  setActive(idx);if(imls.length)setImg(idx>=0?(LINES[idx].img||0):0);',
    '  if(idx>=0){var el=lineEls[idx],ws=el.querySelectorAll(".w"),L=LINES[idx].w,endT=LINES[idx].end;',
    '    for(var k=0;k<ws.length;k++){var st=L[k]?L[k].s:0;var nx=(L[k+1]?L[k+1].s:endT);',
    '      if(tt>=nx){if(ws[k].className!=="w sung"){ws[k].className="w sung";ws[k].style.removeProperty("--p");}}',
    '      else if(tt>=st){if(ws[k].className!=="w cur")ws[k].className="w cur";var p=nx>st?((tt-st)/(nx-st)):1;ws[k].style.setProperty("--p",(Math.max(0,Math.min(1,p))*100).toFixed(1)+"%");}',
    '      else{if(ws[k].className!=="w"){ws[k].className="w";ws[k].style.removeProperty("--p");}}}}',
    '  requestAnimationFrame(frame);}',
    'applyIntro();updateLangUI();requestAnimationFrame(frame);',
    // calibration overlay (?cal=1): two buttons to set the vocal start (INTRO),
    // i.e. when the gold should first appear; the rest of the timing is untouched.
    '(function(){if(!/[?&]cal=1/.test(location.search))return;var bar=document.createElement("div");bar.id="calbar";bar.style.cssText="position:fixed;left:12px;bottom:132px;z-index:80;background:rgba(7,13,24,.92);border:1px solid rgba(243,196,108,.55);border-radius:10px;padding:.5rem .65rem;color:#ffe7ad;font:600 .82rem Inter,system-ui,sans-serif;display:flex;gap:.5rem;align-items:center;box-shadow:0 8px 24px rgba(0,0,0,.4)";var bs="cursor:pointer;border:0;border-radius:6px;background:rgba(255,231,173,.18);color:#ffe7ad;font:inherit;padding:.25rem .6rem;font-size:1rem";bar.innerHTML=\'<button data-d="-0.5" style="\'+bs+\'">&minus;</button><span id="calv" style="min-width:118px;text-align:center"></span><button data-d="0.5" style="\'+bs+\'">+</button><span style="opacity:.55;font-weight:400">Gesang-Start &middot; [ ]=&plusmn;0.1</span>\';document.body.appendChild(bar);function upd(){document.getElementById("calv").textContent="Gesang ab "+INTRO.toFixed(1)+"s";}function step(d){INTRO=Math.max(0,Math.min(90,+(INTRO+d).toFixed(2)));applyIntro();upd();}bar.addEventListener("click",function(e){var d=e.target&&e.target.getAttribute("data-d");if(d)step(+d);});document.addEventListener("keydown",function(e){if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;if(e.key==="[")step(-0.1);else if(e.key==="]")step(0.1);else if(e.key===",")step(-0.5);else if(e.key===".")step(0.5);});upd();})();',
    '(function(){try{var u=new URLSearchParams(location.search);if(u.get("play")==="1"){var p=au.play();if(p&&p.then){p.then(function(){started=true;var tt=document.getElementById("title");tt.classList.add("starting");setTimeout(function(){tt.classList.add("hide");},1400);}).catch(function(){});}}if(location.hash==="#about"){openAbout();}}catch(e){}})();',
    dotsJS()
  ].join('\n');
}

/* ---------------- hub ---------------- */
function buildHub() {
  const ids = fs.readdirSync(SONGS).filter(d => fs.existsSync(path.join(SONGS, d, 'song.json')));
  const metas = ids.map(id => Object.assign({ id }, JSON.parse(fs.readFileSync(path.join(SONGS, id, 'song.json'), 'utf8'))));
  const slug = g => String(g).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const genres = [...new Set(metas.map(m => m.genre).filter(Boolean))];
  const COMING = ['Blues', 'Hip Hop', 'R&B'].filter(g => !genres.includes(g));
  const filterBar = '<div class="filters"><button class="filt on" data-g="all" onclick="filt(this)">Alle</button>' +
    genres.map(g => '<button class="filt" data-g="' + slug(g) + '" onclick="filt(this)">' + esc(g) + '</button>').join('') +
    COMING.map(g => '<button class="filt soon" disabled>' + esc(g) + ' <span class="soon-b">bald</span></button>').join('') + '</div>';
  const cards = metas.map(m =>
    '<div class="card" data-genre="' + slug(m.genre || '') + '">' +
    (m.cover ? '<a class="c-imglink" href="songs/' + m.id + '/index.html?play=1"><div class="c-img" style="background-image:url(\'songs/' + m.id + '/' + esc(m.cover) + '\')"></div></a>' : '') +
    (m.genre ? '<div class="c-genre">' + esc(m.genre) + '</div>' : '') +
    '<div class="c-body"><div class="c-theme">' + esc(m.theme || 'song') + '</div>' +
    '<div class="c-title">' + esc(m.title) + '</div><div class="c-sub">' + esc(m.subtitle || '') + '</div>' +
    '<div class="c-btns"><a class="c-play" href="songs/' + m.id + '/index.html?play=1">&#9654; Play</a>' +
    '<a class="c-play alt" href="songs/' + m.id + '/index.html#about">Songinterpretation</a></div>' +
    '</div></div>'
  ).join('\n');
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>Marten's Songs</title>" +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;600&display=swap" rel="stylesheet">' +
    '<style>' + hubCSS() + '</style></head><body><canvas id="bg"></canvas>' +
    '<div class="promo" id="promo"><div class="promo-in">' +
      '<span class="promo-eye">New</span>' +
      '<span>Learn to build your own faith-driven AI music channel and this dashboard, with <b>The Sower System</b>.</span>' +
      '<a class="promo-cta" href="course/index.html">Join the waitlist &rarr;</a>' +
      '<button class="bar-x" onclick="closeBar(\'promo\')" aria-label="Dismiss">&times;</button>' +
    '</div></div>' +
    '<header><div class="eyebrow">AI songs about faith, love, life and God</div><h1>Marten\'s Songs</h1></header>' +
    filterBar +
    '<main class="grid">' + cards + '</main>' +
    '<footer>Press a song, then Play. The words light up as they are sung, with a translation below.</footer>' +
    '<div class="ctabar" id="ctabar"><div class="ctabar-in">' +
      '<div class="ctabar-txt"><b>The Sower System.</b> One skill file plus a short setup course. Your niche, YouTube 2026 compliance and the animations, handled for you.</div>' +
      '<a class="ctabar-btn" href="course/index.html">See the course &rarr;</a>' +
      '<button class="bar-x" onclick="closeBar(\'ctabar\')" aria-label="Dismiss">&times;</button>' +
    '</div></div>' +
    '<script>function filt(b){document.querySelectorAll(".filt").forEach(function(x){x.classList.toggle("on",x===b);});var g=b.getAttribute("data-g");document.querySelectorAll(".card").forEach(function(c){c.style.display=(g==="all"||c.getAttribute("data-genre")===g)?"":"none";});}' +
      'function closeBar(id){var e=document.getElementById(id);if(e)e.style.display="none";try{sessionStorage.setItem("hide_"+id,"1")}catch(_){}}' +
      '["promo","ctabar"].forEach(function(id){try{if(sessionStorage.getItem("hide_"+id)){var e=document.getElementById(id);if(e)e.style.display="none";}}catch(_){}});' +
      dotsJS() + '</script></body></html>';
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return metas.length;
}
function hubCSS() {
  return [
    '*{box-sizing:border-box}', 'html,body{margin:0;min-height:100%}',
    "body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(120% 90% at 50% -10%,#16243a 0%,#0c1626 45%,#070d18 100%);color:#eaf0f7;min-height:100vh}",
    '#bg{position:fixed;inset:0;z-index:0;pointer-events:none}',
    'header{position:relative;z-index:1;text-align:center;padding:14vh 1rem 2rem}',
    '.eyebrow{font-size:.8rem;letter-spacing:.2em;text-transform:uppercase;color:#caa45a}',
    "header h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(2.6rem,9vw,5.5rem);margin:.3rem 0 0;background:linear-gradient(180deg,#fff,#f3d79a);-webkit-background-clip:text;background-clip:text;color:transparent}",
    '.grid{position:relative;z-index:1;max-width:920px;margin:0 auto;padding:1rem 1.2rem 4rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.3rem}',
    '.card{position:relative;display:block;overflow:hidden;text-decoration:none;color:inherit;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.09);border-radius:18px;transition:transform .2s,border-color .2s,box-shadow .2s}',
    '.card:hover{transform:translateY(-5px);border-color:rgba(243,196,108,.7);box-shadow:0 18px 44px rgba(0,0,0,.45)}',
    '.card::after{content:"";position:absolute;inset:0;border-radius:18px;background:radial-gradient(130% 80% at 50% 0%,rgba(243,196,108,.18),transparent 55%);opacity:0;transition:opacity .25s;pointer-events:none}',
    '.card:hover::after{opacity:1}',
    '.c-imglink{display:block}',
    '.c-img{height:152px;background-size:cover;background-position:center;position:relative;transition:transform .35s}',
    '.card:hover .c-img{transform:scale(1.04)}',
    '.c-img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,20,36,0) 35%,rgba(11,20,36,.92) 100%)}',
    '.c-body{position:relative;padding:1.1rem 1.3rem 1.3rem}',
    '.c-theme{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#caa45a}',
    ".c-title{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.9rem;margin:.25rem 0}",
    '.c-sub{color:#9fb0c6;font-size:.82rem;min-height:1.2em}',
    '.c-btns{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}',
    '.c-play{display:inline-block;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border-radius:999px;padding:.4rem 1rem;font-weight:600;font-size:.82rem}',
    '.c-play.alt{color:#9fb0c6;background:transparent;border:0;font-weight:500;padding:.45rem .35rem;font-size:.82rem}', '.c-play.alt:hover{color:#ffe39a}',
    '.filters{position:relative;z-index:1;max-width:920px;margin:.5rem auto 0;padding:0 1.2rem;display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center}',
    '.filt{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#cdd8e8;border-radius:999px;padding:.4rem .9rem;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}',
    '.filt:hover{border-color:rgba(243,196,108,.5)}',
    '.filt.on{background:linear-gradient(180deg,#ffe7ad,#e9b85c);color:#0c1626;border-color:transparent}',
    '.filt.soon{opacity:.45;cursor:not-allowed}',
    '.soon-b{font-size:.62rem;background:rgba(255,255,255,.16);border-radius:6px;padding:.05rem .35rem;margin-left:.25rem;text-transform:uppercase;letter-spacing:.04em}',
    '.c-genre{position:absolute;top:10px;right:10px;z-index:2;background:rgba(7,13,24,.7);border:1px solid rgba(255,255,255,.16);color:#ffe7ad;border-radius:999px;padding:.25rem .6rem;font-size:.7rem;font-weight:600}',
    'footer{position:relative;z-index:1;text-align:center;color:#7e90a8;font-size:.8rem;padding:0 1rem 3rem}',
    /* sticky course promo (top) + cta bar (bottom) */
    'body{padding-bottom:74px}',
    '.promo{position:sticky;top:0;z-index:50;background:linear-gradient(90deg,rgba(233,184,92,.16),rgba(7,13,24,.86) 65%);backdrop-filter:blur(10px);border-bottom:1px solid rgba(243,196,108,.28)}',
    '.promo-in{max-width:920px;margin:0 auto;padding:.5rem 1.2rem;display:flex;align-items:center;justify-content:center;gap:.65rem;flex-wrap:wrap;font-size:.83rem;color:#dbe6f2;text-align:center}',
    '.promo-in b{color:#ffe39a;font-weight:600}',
    '.promo-eye{font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border-radius:6px;padding:.12rem .45rem}',
    '.promo-cta{color:#ffe39a;font-weight:600;border-bottom:1px solid rgba(243,196,108,.5);white-space:nowrap;text-decoration:none}',
    '.promo-cta:hover{color:#fff}',
    '.ctabar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:rgba(9,16,28,.88);backdrop-filter:blur(12px);border-top:1px solid rgba(243,196,108,.3);box-shadow:0 -10px 30px rgba(0,0,0,.4)}',
    '.ctabar-in{max-width:920px;margin:0 auto;padding:.6rem 1.2rem;display:flex;align-items:center;gap:1rem}',
    '.ctabar-txt{font-size:.84rem;color:#cdd8e8;flex:1;min-width:0}',
    ".ctabar-txt b{color:#ffe39a;font-weight:600;font-family:'Cormorant Garamond',serif;font-size:1.08rem}",
    '.ctabar-btn{flex:none;color:#0c1626;background:linear-gradient(180deg,#ffe7ad,#e9b85c);border-radius:999px;padding:.5rem 1.1rem;font-weight:600;font-size:.82rem;white-space:nowrap;text-decoration:none;transition:transform .18s,box-shadow .25s}',
    '.ctabar-btn:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(233,184,92,.4)}',
    '.bar-x{flex:none;background:transparent;border:0;color:#7e90a8;font-size:1.15rem;cursor:pointer;padding:.1rem .3rem;line-height:1}',
    '.bar-x:hover{color:#eaf0f7}',
    '@media(max-width:560px){.promo-in{font-size:.75rem;gap:.45rem}.ctabar-txt{font-size:.76rem}.ctabar-btn{padding:.45rem .8rem;font-size:.76rem}}'
  ].join('');
}
function dotsJS() {
  return 'var c=document.getElementById("bg"),x=c.getContext("2d"),P=[];' +
    'function rs(){c.width=innerWidth;c.height=innerHeight;}rs();addEventListener("resize",rs);' +
    'for(var i=0;i<46;i++){P.push({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*1.8+0.4,v:Math.random()*0.25+0.05,a:Math.random()*0.5+0.2});}' +
    'function dots(){x.clearRect(0,0,c.width,c.height);for(var i=0;i<P.length;i++){var p=P[i];p.y-=p.v;if(p.y<-5){p.y=c.height+5;p.x=Math.random()*c.width;}x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fillStyle="rgba(243,205,130,"+p.a+")";x.fill();}requestAnimationFrame(dots);}dots();';
}

/* ---------------- run ---------------- */
const arg = process.argv[2];
if (!arg) { console.error('usage: node tools/build-anim.js <song-id> | --all'); process.exit(1); }
const ids = arg === '--all'
  ? fs.readdirSync(SONGS).filter(d => fs.existsSync(path.join(SONGS, d, 'song.json')))
  : [arg];
ids.forEach(id => {
  const main = buildSong(id, { fine: true, images: true, variant: 'v2', out: 'index.html' });
  buildSong(id, { variant: 'v1', out: 'v1.html' });
  console.log('built song ' + main.id + ' (main: images + per-sentence; + v1.html clean)');
});
console.log('rebuilt hub index.html (' + buildHub() + ' song(s))');
