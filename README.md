# 🚀 Portfolio — Tsiaro Lantofanambinana

## Structure des fichiers

```
portfolio/
├── index.html          ← Page principale (HTML)
├── css/
│   └── style.css       ← Tous les styles (thèmes, composants, animations)
├── js/
│   └── main.js         ← Tout le JavaScript (Three.js, filtres, formulaire…)
└── README.md           ← Ce fichier
```

---

## ⚡ Lancer le portfolio

Ouvrez simplement `index.html` dans votre navigateur.

> **Note** : Pour que Three.js et les icônes DevIcons chargent correctement,
> lancez de préférence via un serveur local :
>
> ```bash
> # Python
> python -m http.server 8080
>
> # Node.js (npm i -g live-server)
> live-server
>
> # VS Code
> Extension "Live Server" → clic droit sur index.html → "Open with Live Server"
> ```
> Puis ouvrez http://localhost:8080

---

## 📧 Activer l'envoi d'emails (EmailJS)

1. Créez un compte gratuit sur **https://www.emailjs.com**

2. **Service ID** : Dashboard → Email Services → Créez un service (Gmail recommandé) → copiez l'ID

3. **Template ID** : Dashboard → Email Templates → Créez un template avec ces variables :
   - `{{from_name}}` — nom de l'expéditeur
   - `{{reply_to}}` — email de l'expéditeur
   - `{{subject}}` — objet du message
   - `{{message}}` — corps du message

4. **Public Key** : Dashboard → Account → Public Key

5. Ouvrez `js/main.js` et remplacez les 3 lignes :
   ```js
   const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← ici
   const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← ici
   const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← ici
   ```

---

## ✏️ Personnaliser le contenu

### Parcours académique
Dans `index.html`, section `#parcours` → modifiez les `.tl-item` :
```html
<span class="tl-period">2021 — 2024</span>
<h3>Votre diplôme</h3>
<p class="school">Votre établissement</p>
<p>Description courte</p>
```

### Projets
Dans `index.html`, section `#projects` → modifiez les `.project-card` :
- Changez `data-category="backend"` ou `data-category="frontend"`
- Mettez à jour le titre, la description, les badges de technologies

### Ajouter votre LinkedIn
Dans `index.html`, recherchez `À ajouter prochainement` et remplacez le `href="#"` par votre URL LinkedIn.

---

## 🛠️ Technologies utilisées

| Technologie     | Rôle                            |
|-----------------|---------------------------------|
| HTML5 / CSS3    | Structure et styles             |
| JavaScript ES6+ | Interactivité                   |
| Three.js        | Particules 3D + tore animé      |
| VanillaTilt.js  | Effet tilt 3D sur les cards     |
| EmailJS         | Envoi d'emails sans backend     |
| DevIcons CDN    | Icônes officielles des techs    |
| Google Fonts    | Typographie "Inter"             |

---

## 📱 Responsive

- ✅ Desktop (1200px+)
- ✅ Tablette (768px – 1199px)
- ✅ Mobile (< 768px)

---

*© 2025 Tsiaro Lantofanambinana*