(function () {
  const loader = document.getElementById('tl-loader');
  const canvas  = document.getElementById('loaderCanvas');
  const bar     = document.getElementById('loaderProgressBar');
  const skip    = document.getElementById('loaderSkip');

  if (!canvas) return;

  let W, H, ctx, stars, bgStars, drops;
  let frame = 0, phase = 'intro', startTime = null, rafId;
  let finished = false;

  const MATRIX_CHARS = 'TSIAROLANTOFANAMBINANA01<>{}[]#@%&$ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const COL_SIZE = 18;

  /* ── Init ── */
  function init() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width  = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');

    frame = 0; phase = 'intro'; startTime = null; finished = false;

    const S   = Math.min(W, H) * 0.028;
    const GAP = S * 1.9;
    const OX  = W / 2 - 3.6 * GAP;
    const OY  = H / 2 - 2.5 * GAP;

    function buildTargets() {
      const pts = [];
      for (let x = -3; x <= 3; x++) pts.push([OX + x * GAP, OY, 0]);
      for (let y = 1; y <= 5; y++) pts.push([OX, OY + y * GAP, 0]);
      for (let y = 0; y <= 5; y++) pts.push([OX + 8 * GAP, OY + y * GAP, 1]);
      for (let x = 0; x <= 3; x++) pts.push([OX + (8 + x) * GAP, OY + 5 * GAP, 1]);
      return pts;
    }

    const targets = buildTargets();
    const N = targets.length;

    stars = [];
    for (let i = 0; i < N; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.min(W, H) * 0.42 + Math.random() * Math.min(W, H) * 0.12;
      const g     = targets[i][2];
      stars.push({
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
        tx: targets[i][0], ty: targets[i][1], group: g,
        vx: (Math.random() - 0.5) * 1.8,
        vy: (Math.random() - 0.5) * 1.8,
        size: 1.6 + Math.random() * 2.4,
        alpha: 0.5 + Math.random() * 0.5,
        twOff: Math.random() * Math.PI * 2,
        twSpd: 0.04 + Math.random() * 0.06,
        tailX: [], tailY: [],
        color:    g === 0 ? '#a78bfa' : '#38bdf8',
        colorDim: g === 0 ? '#6d28d9' : '#0369a1',
      });
    }

    bgStars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.2 + Math.random() * 1.2,
      a: 0.08 + Math.random() * 0.45,
      off: Math.random() * Math.PI * 2,
      sp: 0.006 + Math.random() * 0.018,
    }));

    const cols = Math.floor(W / COL_SIZE);
    drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 40));
  }

  /* ── Durées en frames (~60fps) ── */
  const TOTAL_MS = 9200;
  const F_INTRO  = 40;
  const F_WANDER = 90;
  const F_FORM   = 170;
  const F_HOLD   = 65;
  const F_MATRIX = 190;
  const F_REVEAL = 100;

  const eio = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  /* ── Glow radial ── */
  function drawGlow(cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color); g.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }

  /* ── Glow lettres (HOLD) ── */
  function drawLetterGlow() {
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07);
    const r = Math.min(W, H) * 0.028 * 1.9 * 3;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    stars.forEach(s => {
      const c = s.group === 0
        ? `rgba(129,140,248,${0.13 * pulse})`
        : `rgba(56,189,248,${0.13 * pulse})`;
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
      grd.addColorStop(0, c); grd.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();
    });
    ctx.restore();
  }

  /* ── Pluie Matrix ── */
  function drawMatrix(intensity) {
    ctx.fillStyle = `rgba(8,11,20,${0.1 + intensity * 0.05})`;
    ctx.fillRect(0, 0, W, H);

    ctx.font = `bold ${COL_SIZE - 2}px 'Courier New', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const y = drops[i];
      if (y < 0) { drops[i]++; continue; }

      const px = i * COL_SIZE;
      const py = y * COL_SIZE;

      /* tête blanche */
      ctx.fillStyle   = '#ffffff';
      ctx.globalAlpha = intensity * 0.92;
      ctx.fillText(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)], px, py);

      /* corps — colonnes paires = vert, impaires = violet */
      const bodyColor = (i % 3 === 0) ? '#818cf8' : '#22c55e';

      for (let t = 1; t < 14; t++) {
        const ty = py - t * COL_SIZE;
        if (ty < 0) break;
        ctx.fillStyle   = bodyColor;
        ctx.globalAlpha = intensity * Math.max(0, 0.4 - t * 0.03);
        ctx.fillText(
          MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)],
          px, ty
        );
      }
      ctx.globalAlpha = 1;

      if (py > H && Math.random() > 0.975) {
        drops[i] = -Math.floor(Math.random() * 20);
      } else {
        drops[i]++;
      }
    }
    ctx.globalAlpha = 1;
  }

  /* ── Écran final : TL grand + nom complet ── */
  function drawReveal(p) {
    /* assombrir le fond */
    ctx.fillStyle = `rgba(8,11,20,${Math.min(p * 2, 1)})`;
    ctx.fillRect(0, 0, W, H);

    if (p < 0.2) return;
    const tp = eio(Math.min((p - 0.2) / 0.8, 1));

    const tlSize = Math.min(W * 0.18, H * 0.28);
    const centerY = H * 0.44;

    /* halo violet + cyan */
    drawGlow(W / 2, centerY, tlSize * 1.4, '#818cf8', tp * 0.28);
    drawGlow(W / 2, centerY, tlSize * 0.9, '#38bdf8', tp * 0.18);

    /* ── TL ── */
    ctx.save();
    ctx.font         = `900 ${tlSize}px 'Inter', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#a5b4fc';
    ctx.globalAlpha  = tp * 0.92;
    ctx.shadowColor  = '#818cf8';
    ctx.shadowBlur   = 28 * tp;
    ctx.fillText('TL', W / 2, centerY);
    ctx.restore();

    if (tp < 0.4) return;
    const np = eio(Math.min((tp - 0.4) / 0.6, 1));

    /* ligne séparatrice */
    const lineW = Math.min(W * 0.38, 340) * np;
    ctx.save();
    ctx.strokeStyle  = '#38bdf8';
    ctx.lineWidth    = 0.8;
    ctx.globalAlpha  = np * 0.55;
    ctx.beginPath();
    ctx.moveTo(W / 2 - lineW / 2, centerY + tlSize * 0.6);
    ctx.lineTo(W / 2 + lineW / 2, centerY + tlSize * 0.6);
    ctx.stroke();
    ctx.restore();

    /* prénom */
    const fnSize = Math.min(W * 0.042, 26);
    ctx.save();
    ctx.font         = `300 ${fnSize}px 'Inter', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = 'rgba(224,231,255,0.62)';
    ctx.globalAlpha  = np * 0.88;
    ctx.fillText('TSIARO', W / 2, centerY + tlSize * 0.68);
    ctx.restore();

    /* nom de famille */
    const lnSize = Math.min(W * 0.036, 20);
    ctx.save();
    ctx.font         = `700 ${lnSize}px 'Inter', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = '#818cf8';
    ctx.globalAlpha  = np * 0.92;
    ctx.shadowColor  = '#818cf8';
    ctx.shadowBlur   = 12 * np;
    ctx.fillText('LANTOFANAMBINANA', W / 2, centerY + tlSize * 0.68 + fnSize * 1.6);
    ctx.restore();

    if (np < 0.6) return;
    const subP = Math.min((np - 0.6) / 0.4, 1);
    const subSize = Math.min(W * 0.022, 12);
    ctx.save();
    ctx.font         = `400 ${subSize}px 'Inter', sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = 'rgba(140,160,210,0.48)';
    ctx.globalAlpha  = subP * 0.8;
    ctx.fillText('DÉVELOPPEUR FULL STACK', W / 2, centerY + tlSize * 0.68 + fnSize * 1.6 + lnSize * 2.2);
    ctx.restore();
  }

  /* ── Render loop ── */
  function render(ts) {
    rafId = requestAnimationFrame(render);
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const prog = Math.min(elapsed / TOTAL_MS, 1);
    if (bar) bar.style.width = (prog * 100) + '%';
    frame++;

    const inStarPhase = phase === 'intro' || phase === 'wander' || phase === 'form' || phase === 'hold';

    /* fond commun phases étoiles */
    if (inStarPhase) {
      ctx.fillStyle = 'rgba(8,11,20,0.21)';
      ctx.fillRect(0, 0, W, H);
      bgStars.forEach(s => {
        const tw = 0.5 + 0.5 * Math.sin(frame * s.sp + s.off);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.globalAlpha = s.a * tw; ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    /* ── INTRO ── */
    if (phase === 'intro') {
      const t = frame / F_INTRO;
      stars.forEach(s => {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.globalAlpha = t * 0.5; ctx.fill(); ctx.globalAlpha = 1;
      });
      if (frame >= F_INTRO) phase = 'wander';
    }

    /* ── WANDER ── */
    else if (phase === 'wander') {
      stars.forEach(s => {
        s.x += s.vx + Math.sin(frame * 0.014 + s.twOff) * 0.4;
        s.y += s.vy + Math.cos(frame * 0.018 + s.twOff) * 0.4;
        s.vx *= 0.991; s.vy *= 0.991;
        if (s.x < 20 || s.x > W - 20) s.vx *= -1;
        if (s.y < 20 || s.y > H - 20) s.vy *= -1;
        s.tailX.push(s.x); s.tailY.push(s.y);
        if (s.tailX.length > 10) { s.tailX.shift(); s.tailY.shift(); }
        for (let j = 0; j < s.tailX.length - 1; j++) {
          ctx.beginPath();
          ctx.moveTo(s.tailX[j], s.tailY[j]); ctx.lineTo(s.tailX[j+1], s.tailY[j+1]);
          ctx.strokeStyle = s.colorDim; ctx.lineWidth = 0.8*(j/s.tailX.length);
          ctx.globalAlpha = 0.22*(j/s.tailX.length); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const tw = 0.65 + 0.35*Math.sin(frame*s.twSpd+s.twOff);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size*tw, 0, Math.PI*2);
        ctx.fillStyle = s.color; ctx.globalAlpha = s.alpha*tw; ctx.fill(); ctx.globalAlpha = 1;
      });
      if (frame >= F_INTRO + F_WANDER) phase = 'form';
    }

    /* ── FORM ── */
    else if (phase === 'form') {
      const raw = (frame - F_INTRO - F_WANDER) / F_FORM;
      const tG  = Math.min(raw, 1);
      const N   = stars.length;
      stars.forEach((s, i) => {
        const delay = (i / N) * 0.4;
        const local = Math.min(Math.max((tG - delay) / (1 - delay), 0), 1);
        const dt = eio(local);
        s.x += (s.tx - s.x) * dt * 0.14;
        s.y += (s.ty - s.y) * dt * 0.14;
        s.tailX.push(s.x); s.tailY.push(s.y);
        if (s.tailX.length > 8) { s.tailX.shift(); s.tailY.shift(); }
        for (let j = 0; j < s.tailX.length - 1; j++) {
          ctx.beginPath();
          ctx.moveTo(s.tailX[j], s.tailY[j]); ctx.lineTo(s.tailX[j+1], s.tailY[j+1]);
          ctx.strokeStyle = s.color; ctx.lineWidth = 1.3*(j/s.tailX.length);
          ctx.globalAlpha = dt*0.3*(j/s.tailX.length); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const tw = 0.78 + 0.22*Math.sin(frame*s.twSpd+s.twOff);
        drawGlow(s.x, s.y, s.size*7, s.color, dt*0.4);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size*tw, 0, Math.PI*2);
        ctx.fillStyle = s.group === 0 ? '#c4b5fd' : '#7dd3fc';
        ctx.globalAlpha = 0.6+dt*0.4; ctx.fill(); ctx.globalAlpha = 1;
      });
      if (tG >= 1) phase = 'hold';
    }

    /* ── HOLD ── */
    else if (phase === 'hold') {
      drawLetterGlow();
      stars.forEach(s => {
        const tw = 0.85 + 0.15*Math.sin(frame*s.twSpd+s.twOff);
        drawGlow(s.x, s.y, s.size*9, s.color, 0.6);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size*tw, 0, Math.PI*2);
        ctx.fillStyle = s.group === 0 ? '#ede9fe' : '#e0f2fe';
        ctx.globalAlpha = 1; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size*tw*0.42, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
      });
      /* scanline */
      const scanY = ((frame*3.5) % (H+40)) - 20;
      const sg = ctx.createLinearGradient(0, scanY-18, 0, scanY+18);
      sg.addColorStop(0, 'transparent'); sg.addColorStop(0.5, 'rgba(165,180,252,0.07)'); sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg; ctx.fillRect(0, scanY-18, W, 36);

      if (frame > F_INTRO + F_WANDER + F_FORM + F_HOLD) {
        phase = 'matrix';
        const cols = Math.floor(W / COL_SIZE);
        drops = Array.from({ length: cols }, () => -Math.floor(Math.random() * 35));
      }
    }

    /* ── MATRIX ── */
    else if (phase === 'matrix') {
      const mt = frame - (F_INTRO + F_WANDER + F_FORM + F_HOLD);

      let intensity;
      if (mt < 25)                  intensity = mt / 25;
      else if (mt < F_MATRIX - 35) intensity = 1;
      else                          intensity = Math.max(0, 1 - (mt - (F_MATRIX - 35)) / 35);

      drawMatrix(intensity);

      /* étoiles TL s'effacent pendant les 50 premières frames matrix */
      const sf = Math.max(0, 1 - mt / 50);
      if (sf > 0) {
        stars.forEach(s => {
          const tw = 0.85 + 0.15*Math.sin(frame*s.twSpd+s.twOff);
          drawGlow(s.x, s.y, s.size*7, s.color, sf*0.4);
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size*tw, 0, Math.PI*2);
          ctx.fillStyle = s.group === 0 ? '#ede9fe' : '#e0f2fe';
          ctx.globalAlpha = sf; ctx.fill(); ctx.globalAlpha = 1;
        });
      }

      if (mt >= F_MATRIX) phase = 'reveal';
    }

    /* ── REVEAL ── */
    else if (phase === 'reveal') {
      const rt = frame - (F_INTRO + F_WANDER + F_FORM + F_HOLD + F_MATRIX);
      const p  = Math.min(rt / F_REVEAL, 1);

      /* on laisse tourner la matrix en arrière-plan, très atténuée */
      drawMatrix(0.12);
      drawReveal(p);

      if (p >= 1) {
        phase = 'done';
        setTimeout(finish, 950);
      }
    }

    /* DONE — rien à dessiner, on attend finish() */
  }

  /* ── Fin ── */
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(rafId);
    if (bar) bar.style.width = '100%';
    if (loader) {
      loader.style.transition = 'opacity 0.65s ease';
      loader.style.opacity    = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 700);
    }
  }

  if (skip) skip.addEventListener('click', finish);
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  init();
  requestAnimationFrame(render);
})();