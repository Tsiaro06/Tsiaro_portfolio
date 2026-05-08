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