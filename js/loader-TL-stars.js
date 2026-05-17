(function () {
  const loader = document.getElementById('tl-loader');
  const canvas  = document.getElementById('loaderCanvas');
  const bar     = document.getElementById('loaderProgressBar');
  const skip    = document.getElementById('loaderSkip');

  if (!canvas) return;

  let W, H, ctx, rafId;
  let finished = false;
  let particles = [];
  let bgStars = [];
  let frame = 0;
  let voiceDone = false;
  let animReady = false;
  let startTime = null;

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

      /* 1. cherche une voix anglaise féminine */
      for (const kw of femaleKeywords) {
        chosen = voices.find(v =>
          v.lang.startsWith('en') && v.name.toLowerCase().includes(kw)
        );
        if (chosen) break;
      }

      /* 2. voix anglaise par défaut */
      if (!chosen) chosen = voices.find(v => v.lang.startsWith('en'));

      if (chosen) utter.voice = chosen;

      utter.lang  = 'en-US';
      utter.rate  = 0.82;
      utter.pitch = 1.18;
      utter.volume = 1;

      utter.onend = () => onEnd();
      utter.onerror = () => onEnd();

      synth.cancel();
      synth.speak(utter);
    }

    const voices = synth.getVoices();
    if (voices.length > 0) {
      trySpeak(voices);
    } else {
      synth.addEventListener('voiceschanged', function once() {
        synth.removeEventListener('voiceschanged', once);
        trySpeak(synth.getVoices());
      });
      setTimeout(() => trySpeak(synth.getVoices()), 500);
    }
  }

  /* ── Init canvas ── */
  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    frame = 0;
    particles = [];
    bgStars   = [];

    /* Étoiles de fond */
    for (let i = 0; i < 220; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1.4,
        a: 0.06 + Math.random() * 0.5,
        off: Math.random() * Math.PI * 2,
        sp: 0.005 + Math.random() * 0.02,
      });
    }

    /* Particules sparkles */
    const N = 260;
    for (let i = 0; i < N; i++) {
      spawnParticle();
    }
  }

  function spawnParticle(fromCenter) {
    const cx = W / 2, cy = H / 2;
    const angle  = Math.random() * Math.PI * 2;
    const dist   = fromCenter ? 0 : Math.min(W, H) * (0.1 + Math.random() * 0.45);
    const colors = ['#a78bfa', '#818cf8', '#38bdf8', '#c4b5fd', '#7dd3fc', '#ffffff'];
    const c      = colors[Math.floor(Math.random() * colors.length)];
    particles.push({
      x:     cx + Math.cos(angle) * dist,
      y:     cy + Math.sin(angle) * dist,
      vx:    (Math.random() - 0.5) * 1.2,
      vy:    (Math.random() - 0.5) * 1.2,
      size:  0.6 + Math.random() * 2.8,
      alpha: 0.3 + Math.random() * 0.7,
      color: c,
      life:  0.4 + Math.random() * 0.6,
      decay: 0.003 + Math.random() * 0.006,
      twOff: Math.random() * Math.PI * 2,
      twSpd: 0.03 + Math.random() * 0.07,
    });
  }

  /* ── Texte central ── */
  function drawTitle(progress) {
    const alpha = Math.min(progress * 2, 1);
    if (alpha <= 0) return;

    ctx.save();

    /* Halo */
    const hr = Math.min(W, H) * 0.22;
    const gr = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, hr);
    gr.addColorStop(0, `rgba(129,140,248,${0.18 * alpha})`);
    gr.addColorStop(0.5, `rgba(56,189,248,${0.10 * alpha})`);
    gr.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(W/2, H/2, hr, 0, Math.PI * 2);
    ctx.fillStyle = gr;
    ctx.fill();

    const pulse = 0.92 + 0.08 * Math.sin(frame * 0.055);

    /* Nom principal */
    const mainSize = Math.min(W * 0.072, 62) * pulse;
    ctx.font         = `900 ${mainSize}px 'Inter', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha  = alpha * 0.95;
    ctx.shadowColor  = '#818cf8';
    ctx.shadowBlur   = 22;
    ctx.fillStyle    = '#a5b4fc';
    ctx.fillText('Tsiaro Lantofanambinana', W / 2, H / 2 - mainSize * 0.08);

    /* Ligne séparatrice */
    const lineW = Math.min(W * 0.36, 320);
    ctx.globalAlpha  = alpha * 0.45;
    ctx.shadowBlur   = 0;
    ctx.strokeStyle  = '#38bdf8';
    ctx.lineWidth    = 0.8;
    ctx.beginPath();
    ctx.moveTo(W/2 - lineW/2, H/2 + mainSize * 0.68);
    ctx.lineTo(W/2 + lineW/2, H/2 + mainSize * 0.68);
    ctx.stroke();

    /* Sous-titre */
    const subSize = Math.min(W * 0.022, 15);
    ctx.font         = `400 ${subSize}px 'Inter', sans-serif`;
    ctx.globalAlpha  = alpha * 0.65;
    ctx.fillStyle    = 'rgba(140,160,210,0.85)';
    ctx.shadowBlur   = 0;
    // ctx.fillText('DÉVELOPPEUR FULL STACK', W/2, H/2 + mainSize * 0.68 + subSize * 1.9);

    ctx.restore();
  }

  /* ── Boucle de rendu ── */
  const TOTAL_MS = 8500;

  function render(ts) {
    rafId = requestAnimationFrame(render);
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const prog = Math.min(elapsed / TOTAL_MS, 1);
    if (bar) bar.style.width = (prog * 100) + '%';
    frame++;

    /* Fond */
    ctx.fillStyle = 'rgba(8,11,20,0.22)';
    ctx.fillRect(0, 0, W, H);

    /* Étoiles fond */
    bgStars.forEach(s => {
      const tw = 0.5 + 0.5 * Math.sin(frame * s.sp + s.off);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2);
      ctx.fillStyle   = '#ffffff';
      ctx.globalAlpha = s.a * tw;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    /* Particules sparkles */
    const titleProgress = Math.min(elapsed / 1200, 1);

    particles.forEach((p, i) => {
      p.x += p.vx + Math.sin(frame * 0.012 + p.twOff) * 0.35;
      p.y += p.vy + Math.cos(frame * 0.016 + p.twOff) * 0.35;
      p.vx *= 0.994;
      p.vy *= 0.994;
      p.life -= p.decay;

      if (p.life <= 0) {
        spawnParticle(true);
        particles.splice(i, 1);
        return;
      }

      const tw = 0.6 + 0.4 * Math.sin(frame * p.twSpd + p.twOff);
      const sz = p.size * tw;
      const al = p.alpha * Math.min(p.life * 2, 1) * tw;

      /* Glow */
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 5);
      gl.addColorStop(0, p.color);
      gl.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz * 5, 0, Math.PI * 2);
      ctx.fillStyle   = gl;
      ctx.globalAlpha = al * 0.28;
      ctx.fill();
      ctx.restore();

      /* Point */
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.globalAlpha = al;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    /* Titre */
    drawTitle(titleProgress);

    /* Fin naturelle si voix terminée + animation > 3.5s */
    if (voiceDone && elapsed > 3500) {
      animReady = true;
    }

    if (animReady && elapsed > 3500) {
      animReady = false;
      setTimeout(finish, 600);
    }
  }

  /* ── Fin ── */
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

  /* ── Skip ── */
  if (skip) skip.addEventListener('click', finish);

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    W = canvas.width;
    H = canvas.height;
  });

  /* ── Démarrage ── */
  init();
  requestAnimationFrame(render);

  /* Lance la voix, puis déclenche la fin */
  speakAirport(function () {
    voiceDone = true;
  });

})();