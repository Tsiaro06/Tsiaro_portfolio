/* =========================================================
   1. THEME TOGGLE (LIGHT / DARK)
   ========================================================= */
   const root = document.documentElement;
   const themeToggle = document.getElementById('themeToggle');
   
   const savedTheme = localStorage.getItem('theme') ||
     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
   root.setAttribute('data-theme', savedTheme);
   
   themeToggle.addEventListener('click', () => {
     const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
     root.setAttribute('data-theme', next);
     localStorage.setItem('theme', next);
   });
   
   /* =========================================================
      2. MENU HAMBURGER MOBILE
      ========================================================= */
   const hamburger = document.getElementById('hamburger');
   const navLinks  = document.getElementById('navLinks');
   
   hamburger.addEventListener('click', () => {
     hamburger.classList.toggle('open');
     navLinks.classList.toggle('open');
   });
   document.querySelectorAll('.nav-links a').forEach(a => {
     a.addEventListener('click', () => {
       hamburger.classList.remove('open');
       navLinks.classList.remove('open');
     });
   });
   
   /* =========================================================
      3. LIEN ACTIF AU SCROLL
      ========================================================= */
   const sections = document.querySelectorAll('section[id]');
   const navItems  = document.querySelectorAll('.nav-links a');
   
   window.addEventListener('scroll', () => {
     let cur = '';
     sections.forEach(s => {
       if (window.scrollY >= s.offsetTop - 120) cur = s.getAttribute('id');
     });
     navItems.forEach(a => {
       a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
     });
   }, { passive: true });
   
   /* =========================================================
      4. TYPEWRITER HERO
      ========================================================= */
   (function initTypewriter() {
     const phrases = ['Développeur Informatique', 'Full Stack Developer', 'Passionné de code'];
     const tw = document.getElementById('typewriter');
     if (!tw) return;
     let pIdx = 0, cIdx = 0, deleting = false;
   
     function tick() {
       const phrase = phrases[pIdx];
       if (!deleting) {
         tw.textContent = phrase.substring(0, ++cIdx);
         if (cIdx === phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
       } else {
         tw.textContent = phrase.substring(0, --cIdx);
         if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
       }
       setTimeout(tick, deleting ? 38 : 80);
     }
     tick();
   })();
   
   /* =========================================================
      5. THREE.JS — PARTICULES 3D HERO
      ========================================================= */
   (function initThree() {
     if (typeof THREE === 'undefined') return;
     const canvas = document.getElementById('heroCanvas');
     const scene   = new THREE.Scene();
     const camera  = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     camera.position.z = 5;
   
     const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
     renderer.setSize(window.innerWidth, window.innerHeight);
   
     // Particules
     const count = 1400;
     const geo   = new THREE.BufferGeometry();
     const pos   = new Float32Array(count * 3);
     for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 14;
     geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
   
     const mat = new THREE.PointsMaterial({ color: 0x2563EB, size: 0.025, transparent: true, opacity: 0.85, sizeAttenuation: true });
     const points = new THREE.Points(geo, mat);
     scene.add(points);
   
     // Tore géométrique décoratif
     const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 16);
     const torusMat = new THREE.MeshBasicMaterial({ color: 0x2563EB, wireframe: true, transparent: true, opacity: 0.06 });
     const torus = new THREE.Mesh(torusGeo, torusMat);
     scene.add(torus);
   
     // Mouse parallax
     let mx = 0, my = 0;
     document.addEventListener('mousemove', e => {
       mx = (e.clientX / window.innerWidth  - 0.5) * 0.6;
       my = (e.clientY / window.innerHeight - 0.5) * 0.6;
     }, { passive: true });
   
     function animate() {
       requestAnimationFrame(animate);
       points.rotation.y += 0.0012;
       points.rotation.x += 0.0006;
       torus.rotation.x += 0.003;
       torus.rotation.y += 0.002;
       camera.position.x += (mx - camera.position.x) * 0.04;
       camera.position.y += (-my - camera.position.y) * 0.04;
       camera.lookAt(scene.position);
       renderer.render(scene, camera);
     }
     animate();
   
     // Couleur selon thème
     const updateColor = () => {
       const dark = root.getAttribute('data-theme') === 'dark';
       mat.color.set(dark ? 0x60a5fa : 0x2563EB);
       torusMat.color.set(dark ? 0x60a5fa : 0x2563EB);
       mat.opacity = dark ? 0.55 : 0.85;
     };
     updateColor();
     new MutationObserver(updateColor).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
   
     window.addEventListener('resize', () => {
       camera.aspect = window.innerWidth / window.innerHeight;
       camera.updateProjectionMatrix();
       renderer.setSize(window.innerWidth, window.innerHeight);
     }, { passive: true });
   })();
   
   /* =========================================================
      6. VANILLA TILT — CARDS PROJETS
      ========================================================= */
   (function initTilt() {
     if (typeof VanillaTilt === 'undefined') return;
     VanillaTilt.init(document.querySelectorAll('.tilt'), {
       max: 10, speed: 600, glare: true, 'max-glare': 0.12, perspective: 1000
     });
   })();
   
   /* =========================================================
      7. REVEAL AU SCROLL (IntersectionObserver)
      ========================================================= */
   const revealObserver = new IntersectionObserver(entries => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         entry.target.classList.add('visible');
         revealObserver.unobserve(entry.target);
       }
     });
   }, { threshold: 0.1 });
   
   document.querySelectorAll('.reveal, .tl-item').forEach(el => revealObserver.observe(el));
   
   /* =========================================================
      8. PARALLAX AU SCROLL
      ========================================================= */
   window.addEventListener('scroll', () => {
     const y = window.scrollY;
     document.querySelectorAll('.parallax-bg').forEach(el => {
       el.style.transform = `translateY(${y * (parseFloat(el.dataset.speed) || 0.1)}px)`;
     });
   }, { passive: true });
   
   /* =========================================================
      9. CURSEUR PERSONNALISÉ
      ========================================================= */
   (function initCursor() {
     const dot  = document.querySelector('.cursor-dot');
     const ring = document.querySelector('.cursor-ring');
     if (!dot || !ring) return;
   
     let mx = 0, my = 0, rx = 0, ry = 0;
   
     document.addEventListener('mousemove', e => {
       mx = e.clientX; my = e.clientY;
       dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
     }, { passive: true });
   
     (function animRing() {
       rx += (mx - rx) * 0.16;
       ry += (my - ry) * 0.16;
       ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
       requestAnimationFrame(animRing);
     })();
   
     document.querySelectorAll('a, button, .skill, .project-card, input, textarea').forEach(el => {
       el.addEventListener('mouseenter', () => ring.classList.add('active'));
       el.addEventListener('mouseleave', () => ring.classList.remove('active'));
     });
   })();
   
   /* =========================================================
      10. FILTRES PROJETS (Tous / Backend / Frontend)
      ========================================================= */
   (function initFilters() {
     const btns  = document.querySelectorAll('.filter-btn');
     const cards = document.querySelectorAll('.project-card');
     const grid  = document.getElementById('projectsGrid');
   
     btns.forEach(btn => {
       btn.addEventListener('click', () => {
         btns.forEach(b => b.classList.remove('active'));
         btn.classList.add('active');
         const filter = btn.dataset.filter;
   
         cards.forEach(card => {
           const match = filter === 'all' || card.dataset.category === filter;
           if (match) {
             card.style.display = '';
             requestAnimationFrame(() => card.classList.remove('hidden'));
           } else {
             card.classList.add('hidden');
             setTimeout(() => { if (card.classList.contains('hidden')) card.style.display = 'none'; }, 420);
           }
         });
       });
     });
   })();




   (function () {
    const loader       = document.getElementById('tl-loader');
    const loaderCanvas = document.getElementById('loaderCanvas');
    const loaderSkip   = document.getElementById('loaderSkip');
    const progressBar  = document.getElementById('loaderProgressBar');
  
    /* ── Resize canvas ── */
    const W = window.innerWidth, H = window.innerHeight;
    loaderCanvas.width  = W;
    loaderCanvas.height = H;
    const ctx = loaderCanvas.getContext('2d');
  
    /* ── TL letter targets ──
       Grille de points formant les lettres T et L centrées à l'écran */
    const S   = Math.min(W, H) * 0.022;   /* taille d'une cellule */
    const GAP = S * 2;
    /* centre légèrement à gauche pour équilibrer T + L */
    const OX = W / 2 - 3.8 * GAP;
    const OY = H / 2 - 2.5 * GAP;
  
    function buildTargets() {
      const pts = [];
      /* T — barre horizontale */
      for (let x = -3; x <= 3; x++) pts.push([OX + x * GAP, OY, 0]);
      /* T — tige verticale */
      for (let y = 1; y <= 5; y++) pts.push([OX, OY + y * GAP, 0]);
      /* L — barre verticale (décalée droite) */
      for (let y = 0; y <= 5; y++) pts.push([OX + 8 * GAP, OY + y * GAP, 1]);
      /* L — barre horizontale bas */
      for (let x = 0; x <= 3; x++) pts.push([OX + (8 + x) * GAP, OY + 5 * GAP, 1]);
      return pts;
    }
  
    const targets = buildTargets();
    const N = targets.length;
  
    /* ── Étoiles ── */
    const stars = [];
    for (let i = 0; i < N; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.min(W, H) * 0.35 + Math.random() * Math.min(W, H) * 0.15;
      stars.push({
        x:  W / 2 + Math.cos(angle) * dist,
        y:  H / 2 + Math.sin(angle) * dist,
        tx: targets[i][0],
        ty: targets[i][1],
        group:        targets[i][2],
        vx:           (Math.random() - 0.5) * 1.4,
        vy:           (Math.random() - 0.5) * 1.4,
        size:         1.4 + Math.random() * 2.2,
        alpha:        0.4 + Math.random() * 0.6,
        twinkleOff:   Math.random() * Math.PI * 2,
        twinkleSpeed: 0.04 + Math.random() * 0.06,
        color:        Math.random() < 0.5 ? '#a78bfa' : (Math.random() < 0.5 ? '#60a5fa' : '#e0e7ff'),
      });
    }
  
    /* ── Étoiles de fond (décoratives) ── */
    const bgStars = Array.from({ length: 120 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.3 + Math.random() * 0.9,
      a: 0.15 + Math.random() * 0.5,
      off: Math.random() * Math.PI * 2,
      sp: 0.012 + Math.random() * 0.025,
    }));
  
    /* ── Particules feu d'artifice ── */
    const particles = [];
    function addFireworks(cx, cy) {
      const colors = ['#f472b6','#fb923c','#facc15','#34d399','#60a5fa','#a78bfa','#f87171','#e0e7ff'];
      /* 8 gerbes */
      for (let b = 0; b < 8; b++) {
        const bAngle = (b / 8) * Math.PI * 2;
        const bColor = colors[b];
        for (let p = 0; p < 14; p++) {
          const a = bAngle + (p / 14) * Math.PI * 2;
          const sp = 2.2 + Math.random() * 4;
          particles.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
            color: bColor, size: 1.6 + Math.random()*2.8, life: 1,
            decay: 0.011 + Math.random()*0.013, gravity: 0.055, trail: [] });
        }
      }
      /* poussière */
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.6 + Math.random() * 5.5;
        particles.push({ x: cx+(Math.random()-0.5)*40, y: cy+(Math.random()-0.5)*40,
          vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
          color: colors[Math.floor(Math.random()*colors.length)],
          size: 0.7+Math.random()*1.8, life:1,
          decay:0.007+Math.random()*0.022, gravity:0.04, trail:[] });
      }
    }
  
    /* ── Phases ── */
    const WANDER = 100;   /* frames d'errance */
    const FORM   = 160;   /* frames de regroupement */
    const HOLD   = 55;    /* frames de maintien */
    const BURST  = 35;    /* frames d'explosion des étoiles */
    const TOTAL_MS = 7000;
  
    let frame = 0, phase = 'wander', exploded = false, fadeOut = 0;
    let startTime = null, rafId, finished = false;
  
    const eio = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  
    /* ── Rendu ── */
    function render(ts) {
      rafId = requestAnimationFrame(render);
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const prog = Math.min(elapsed / TOTAL_MS, 1);
      progressBar.style.width = (prog * 100) + '%';
  
      frame++;
  
      /* fond semi-transparent (trainée motion blur) */
      ctx.fillStyle = 'rgba(13,14,18,0.20)';
      ctx.fillRect(0, 0, W, H);
  
      /* étoiles de fond */
      bgStars.forEach(s => {
        const tw = 0.6 + 0.4 * Math.sin(frame * s.sp + s.off);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = s.a * tw;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
  
      /* ── PHASE WANDER ── */
      if (phase === 'wander') {
        stars.forEach(s => {
          s.x += s.vx + Math.sin(frame * 0.013 + s.twinkleOff) * 0.35;
          s.y += s.vy + Math.cos(frame * 0.017 + s.twinkleOff) * 0.35;
          s.vx *= 0.992; s.vy *= 0.992;
          if (s.x < 30 || s.x > W - 30) s.vx *= -1;
          if (s.y < 30 || s.y > H - 30) s.vy *= -1;
          const tw = 0.65 + 0.35 * Math.sin(frame * s.twinkleSpeed + s.twinkleOff);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * tw, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = s.alpha * tw;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (frame > WANDER) phase = 'form';
      }
  
      /* ── PHASE FORM ── */
      else if (phase === 'form') {
        const raw = (frame - WANDER) / FORM;
        const tGlobal = Math.min(raw, 1);
        stars.forEach((s, i) => {
          const delayFrac = (i / N) * 0.45;
          const local = Math.min(Math.max((tGlobal - delayFrac) / (1 - delayFrac), 0), 1);
          const dt = eio(local);
          s.x += (s.tx - s.x) * dt * 0.13;
          s.y += (s.ty - s.y) * dt * 0.13;
          const tw = 0.75 + 0.25 * Math.sin(frame * s.twinkleSpeed + s.twinkleOff);
          /* halo lumineux */
          const gColor = s.group === 0 ? '#818cf8' : '#38bdf8';
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 5);
          grad.addColorStop(0, gColor + '99');
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = dt * 0.55;
          ctx.fill();
          ctx.globalAlpha = 1;
          /* cœur */
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * tw, 0, Math.PI * 2);
          ctx.fillStyle = s.group === 0 ? '#c4b5fd' : '#7dd3fc';
          ctx.globalAlpha = 0.55 + dt * 0.45;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (tGlobal >= 1) phase = 'hold';
      }
  
      /* ── PHASE HOLD ── */
      else if (phase === 'hold') {
        stars.forEach(s => {
          const tw = 0.82 + 0.18 * Math.sin(frame * s.twinkleSpeed + s.twinkleOff);
          const gColor = s.group === 0 ? '#818cf8' : '#38bdf8';
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 6);
          grad.addColorStop(0, gColor + 'bb');
          grad.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.6;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * tw, 0, Math.PI * 2);
          ctx.fillStyle = s.group === 0 ? '#ede9fe' : '#bae6fd';
          ctx.globalAlpha = 1;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (frame > WANDER + FORM + HOLD && !exploded) {
          exploded = true;
          /* centre de gravité des lettres */
          let cx = 0, cy = 0;
          targets.forEach(t => { cx += t[0]; cy += t[1]; });
          cx /= N; cy /= N;
          addFireworks(cx, cy);
          /* propulsion des étoiles */
          stars.forEach(s => {
            const dx = s.x - cx, dy = s.y - cy;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            s.vx = (dx / d) * (3.5 + Math.random() * 5);
            s.vy = (dy / d) * (3.5 + Math.random() * 5) - Math.random() * 2;
          });
          phase = 'explode';
        }
      }
  
      /* ── PHASE EXPLODE ── */
      else if (phase === 'explode') {
        const et = frame - WANDER - FORM - HOLD;
        stars.forEach(s => {
          s.x += s.vx; s.y += s.vy;
          s.vy += 0.09; s.vx *= 0.97; s.vy *= 0.97;
          const life = Math.max(0, 1 - et / BURST);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.group === 0 ? '#c4b5fd' : '#7dd3fc';
          ctx.globalAlpha = life;
          ctx.fill();
          ctx.globalAlpha = 1;
        });
        if (et > BURST) phase = 'fireworks';
      }
  
      /* ── PARTICULES (actives pendant explode + fireworks) ── */
      if (phase === 'explode' || phase === 'fireworks') {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 7) p.trail.shift();
          p.x += p.vx; p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.983; p.vy *= 0.983;
          p.life -= p.decay;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          /* trainée */
          for (let j = 0; j < p.trail.length - 1; j++) {
            const t1 = p.trail[j], t2 = p.trail[j + 1];
            ctx.beginPath();
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size * 0.55 * (j / p.trail.length);
            ctx.globalAlpha = p.life * 0.28 * (j / p.trail.length);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          /* cœur brillant */
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life * 0.9;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
  
      /* ── PHASE FIREWORKS → fondu vers la page ── */
      if (phase === 'fireworks') {
        if (particles.length < 50) fadeOut += 0.006;
        if (particles.length < 20) fadeOut += 0.01;
        if (particles.length === 0) fadeOut += 0.025;
        fadeOut = Math.min(fadeOut, 1);
        if (fadeOut > 0) {
          ctx.fillStyle = `rgba(13,14,18,${fadeOut})`;
          ctx.fillRect(0, 0, W, H);
        }
        if (fadeOut >= 1 || prog >= 1) finish();
      }
    }
  
    /* ── Fin du loader ── */
    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(rafId);
      loader.style.transition = 'opacity 0.5s ease';
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 520);
    }
  
    loaderSkip.addEventListener('click', finish);
  
    window.addEventListener('resize', () => {
      loaderCanvas.width  = window.innerWidth;
      loaderCanvas.height = window.innerHeight;
    });
  
    requestAnimationFrame(render);
  })();
   

   const EMAILJS_PUBLIC_KEY  = 'saLPScKRPPI0OD9IU'; 
   const EMAILJS_SERVICE_ID  = 'service_y42dlbc';  
   const EMAILJS_TEMPLATE_ID = 'template_zdqa4oe'; 
   
   (function initEmailJS() {
     if (typeof emailjs === 'undefined') return;
     if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
       emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
     }
   })();
   
   const contactForm = document.getElementById('contactForm');
   const feedback    = document.getElementById('formFeedback');
   const submitBtn   = document.getElementById('submitBtn');
   
   contactForm.addEventListener('submit', e => {
     e.preventDefault();
     feedback.className = 'form-feedback';
     feedback.textContent = '';
   
     const data = {
       from_name : contactForm.from_name.value.trim(),
       reply_to  : contactForm.reply_to.value.trim(),
       subject   : contactForm.subject.value.trim(),
       message   : contactForm.message.value.trim(),
       to_email  : 'lantofanambinanatsiaro@gmail.com'
     };
   
     if (!data.from_name || !data.reply_to || !data.subject || !data.message) {
       feedback.classList.add('error');
       feedback.textContent = '⚠️ Merci de remplir tous les champs.';
       return;
     }
   
     // Validation email basique
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reply_to)) {
       feedback.classList.add('error');
       feedback.textContent = '⚠️ Adresse email invalide.';
       return;
     }
   
     submitBtn.disabled = true;
     submitBtn.textContent = 'Envoi en cours…';
   
     // Mode démo si EmailJS non configuré
     if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
       setTimeout(() => {
         feedback.classList.add('success');
         feedback.textContent = '✅ Prêt à envoyer ! Configurez EmailJS avec vos vraies clés pour activer l\'envoi réel.';
         contactForm.reset();
         submitBtn.disabled = false;
         submitBtn.innerHTML = 'Envoyer le message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
       }, 900);
       return;
     }
   
     emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data)
       .then(() => {
         feedback.classList.add('success');
         feedback.textContent = '✅ Message envoyé avec succès ! Je vous répondrai bientôt.';
         contactForm.reset();
       })
       .catch(err => {
         console.error('EmailJS error:', err);
         feedback.classList.add('error');
         feedback.textContent = '❌ Erreur lors de l\'envoi. Écrivez directement à lantofanambinanatsiaro@gmail.com';
       })
       .finally(() => {
         submitBtn.disabled = false;
         submitBtn.innerHTML = 'Envoyer le message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
       });
   });