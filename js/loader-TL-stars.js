(function () {
  const loader = document.getElementById('tl-loader');
  const canvas  = document.getElementById('loaderCanvas');
  const bar     = document.getElementById('loaderProgressBar');
  const skip    = document.getElementById('loaderSkip');

  if (!canvas) return;

  let W, H, ctx, rafId;
  let finished = false;
  let particles = [];
  let frame = 0;
  let voiceDone = false;
  let animReady = false;
  let startTime = null;
  let voiceStarted = false;

  /* ── Voix féminine style aéroport ── */
  function speakAirport(onEnd) {
    const synth = window.speechSynthesis;
    if (!synth) { onEnd(); return; }

    const utter = new SpeechSynthesisUtterance(
      'Ladies and gentlemen, welcome to my portfolio.'
    );

    function trySpeak(voices) {
      const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'samantha', 'victoria',
        'karen', 'moira', 'fiona', 'veena', 'tessa', 'susan', 'julie',
        'hazel', 'kate', 'serena', 'anna', 'amelie', 'alice', 'allison'];

      let chosen = null;
      for (const kw of femaleKeywords) {
        chosen = voices.find(v =>
          v.lang.startsWith('en') && v.name.toLowerCase().includes(kw)
        );
        if (chosen) break;
      }
      if (!chosen) chosen = voices.find(v => v.lang.startsWith('en'));
      if (chosen) utter.voice = chosen;

      utter.lang   = 'en-US';
      utter.rate   = 0.65;
      utter.pitch  = 1.18;
      utter.volume = 1;

      utter.onend   = () => onEnd();
      utter.onerror = () => onEnd();

      synth.cancel();
      synth.speak(utter);
    }

    function loadAndSpeak() {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        trySpeak(voices);
      } else {
        synth.addEventListener('voiceschanged', function once() {
          synth.removeEventListener('voiceschanged', once);
          trySpeak(synth.getVoices());
        });
        setTimeout(() => {
          if (synth.getVoices().length > 0) trySpeak(synth.getVoices());
        }, 500);
      }
    }

    /* ── FIX CHROME : besoin d'un geste utilisateur ── */
    /* Chrome exige que speechSynthesis soit appelé dans un événement utilisateur.
       On écoute le premier clic/toucher/appui clavier sur toute la page. */
    function unlockAndSpeak() {
      if (voiceStarted) return;
      voiceStarted = true;

      /* Petit silence pour "débloquer" le contexte audio de Chrome */
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      synth.speak(unlock);

      /* Puis on parle vraiment */
      setTimeout(() => loadAndSpeak(), 100);
    }

    /* Essai immédiat (marche sur Firefox, Safari, et Chrome si déjà débloqué) */
    setTimeout(() => {
      if (!voiceStarted) {
        voiceStarted = true;
        loadAndSpeak();
      }
    }, 300);

    /* Fallback : au premier geste sur Chrome */
    ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(evt => {
      document.addEventListener(evt, function handler() {
        document.removeEventListener(evt, handler);
        unlockAndSpeak();
      }, { once: true });
    });
  }

  /* ── Init ── */
  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    frame = 0;
    particles = [];

    for (let i = 0; i < 1200; i++) {
      spawnParticle(true);
    }
  }

  function spawnParticle(initial) {
    const zoneW = Math.min(W * 0.56, 640);
    const zoneH = Math.min(H * 0.28, 160);
    const zoneX = W / 2 - zoneW / 2;
    const zoneY = H / 2;

    const x = zoneX + Math.random() * zoneW;
    const y = initial
      ? zoneY + Math.random() * zoneH
      : zoneY + Math.random() * zoneH * 0.3;

    const vx = (Math.random() - 0.5) * 0.25;
    const vy = -(0.05 + Math.random() * 0.35);

    particles.push({
      x, y, vx, vy,
      size:  0.3 + Math.random() * 1.2,
      alpha: 0.15 + Math.random() * 0.85,
      color: '#ffffff',
      life:  0.5 + Math.random() * 0.5,
      decay: 0.0008 + Math.random() * 0.002,
      twOff: Math.random() * Math.PI * 2,
      twSpd: 0.02 + Math.random() * 0.04,
    });
  }

  function drawTitle(alpha) {
    if (alpha <= 0) return;
    ctx.save();

    const lineY  = H / 2 + 4;
    const lineW  = Math.min(W * 0.56, 640);
    const lg = ctx.createLinearGradient(W/2 - lineW/2, 0, W/2 + lineW/2, 0);
    lg.addColorStop(0,    'transparent');
    lg.addColorStop(0.18, `rgba(99,102,241,${alpha})`);
    lg.addColorStop(0.45, `rgba(14,165,233,${alpha})`);
    lg.addColorStop(0.55, `rgba(14,165,233,${alpha})`);
    lg.addColorStop(0.82, `rgba(99,102,241,${alpha})`);
    lg.addColorStop(1,    'transparent');

    ctx.strokeStyle = lg;
    ctx.lineWidth   = 4;
    ctx.filter      = 'blur(3px)';
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.moveTo(W/2 - lineW/2, lineY);
    ctx.lineTo(W/2 + lineW/2, lineY);
    ctx.stroke();

    ctx.filter      = 'none';
    ctx.lineWidth   = 1;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(W/2 - lineW/2, lineY);
    ctx.lineTo(W/2 + lineW/2, lineY);
    ctx.stroke();

    const maxTextW = W * 0.92;
    let fontSize = Math.min(H * 0.14, 110);
    ctx.font = `800 ${fontSize}px 'Inter','Segoe UI',sans-serif`;
    while (ctx.measureText('Tsiaro Lantofanambinana').width > maxTextW && fontSize > 28) {
      fontSize -= 2;
      ctx.font = `800 ${fontSize}px 'Inter','Segoe UI',sans-serif`;
    }

    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha  = alpha;
    ctx.fillStyle    = '#ffffff';
    ctx.shadowColor  = 'rgba(255,255,255,0.06)';
    ctx.shadowBlur   = 6;
    ctx.fillText('Tsiaro Lantofanambinana', W / 2, H / 2);

    ctx.restore();
  }

  const TOTAL_MS = 9000;

  function render(ts) {
    rafId = requestAnimationFrame(render);
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const prog = Math.min(elapsed / TOTAL_MS, 1);
    if (bar) bar.style.width = (prog * 100) + '%';
    frame++;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    if (frame === 1) {
      window._bgStars = [];
      for (let i = 0; i < 80; i++) {
        window._bgStars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.2 + Math.random() * 0.7,
          a: 0.04 + Math.random() * 0.18,
        });
      }
    }
    if (window._bgStars) {
      window._bgStars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle   = '#ffffff';
        ctx.globalAlpha = s.a;
        ctx.fill();
      });
    }
    ctx.globalAlpha = 1;

    const titleAlpha = Math.min(elapsed / 900, 1);
    const zoneW = Math.min(W * 0.56, 640);
    const zoneH = Math.min(H * 0.32, 200);
    const zoneY = H / 2 + 4;

    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx + Math.sin(frame * 0.008 + p.twOff) * 0.15;
      p.y  += p.vy;
      p.life -= p.decay;

      if (p.life <= 0 || p.y < zoneY - zoneH * 0.5) {
        particles.splice(i, 1);
        spawnParticle(false);
        continue;
      }

      const relX = (p.x - (W/2)) / (zoneW / 2);
      const relY = (p.y - zoneY) / zoneH;
      const edgeFade = Math.max(0, 1 - Math.pow(relX, 2) * 1.4) *
                       Math.max(0, 1 - Math.pow(relY * 1.2 - 0.5, 2) * 3);

      if (edgeFade <= 0) continue;

      const tw = 0.6 + 0.4 * Math.sin(frame * p.twSpd + p.twOff);
      const sz = p.size * tw;
      const al = p.alpha * Math.min(p.life * 3, 1) * tw * edgeFade * titleAlpha;

      ctx.beginPath();
      ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = al;
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    drawTitle(titleAlpha);

    if (voiceDone && elapsed > 3500 && !animReady) {
      animReady = true;
      setTimeout(finish, 700);
    }
  }

  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    if (bar) bar.style.width = '100%';
    if (loader) {
      loader.style.transition = 'opacity 0.75s ease';
      loader.style.opacity    = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 800);
    }
  }

  if (skip) skip.addEventListener('click', finish);

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width;
    H = canvas.height;
    window._bgStars = null;
  });

  init();
  requestAnimationFrame(render);

  speakAirport(function () {
    voiceDone = true;
  });

})();