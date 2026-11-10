# Al Quran Academy – Official Website & Privacy Policy

Official website and legal Privacy Policy web application for **Al Quran Academy** (`com.alquranacademy.app`), a premier free Islamic mobile application built with Flutter.

---

## 🌟 Overview

- **Official Domain:** [https://alquran-academya.online](https://alquran-academya.online)
- **Target Application:** Al Quran Academy (Flutter Android App)
- **Package ID:** `com.alquranacademy.app`
- **Backend Stack:** Node.js, Express.js, EJS Templates, `express-ejs-layouts`
- **Languages:** Arabic (Default, RTL) and English (LTR)
- **Security:** Helmet, Content Security Policy, Rate Limiting, Compression
- **SEO & Compliance:** Schema.org JSON-LD (MobileApplication & WebSite), Open Graph, Twitter Cards, Canonical URLs, Multilingual `hreflang`, Google Play Developer Policy compliant

---

## 📂 Project Structure

```text
MuslimProApp_website/
├── docs/
│   ├── DEPLOYMENT_GUIDE.md               # Production deployment with PM2 & Nginx SSL
│   └── PRIVACY_POLICY_TECHNICAL_AUDIT.md # Technical verification of permissions & data safety
├── locales/
│   ├── ar.json                           # Arabic translations (Default)
│   └── en.json                           # English translations
├── public/
│   ├── assets/
│   │   ├── icons/                        # App category icons
│   │   └── images/                       # Genuine brand logos, badges, and flags
│   ├── css/
│   │   ├── style.css                     # Primary brand styling & typography
│   │   ├── rtl.css                       # RTL adjustments for Arabic layout
│   │   └── print.css                     # Print stylesheet for Privacy Policy
│   ├── js/
│   │   └── main.js                       # Smooth scroll, TOC observer, interactive mockups
│   ├── favicon.ico
│   ├── robots.txt                        # Search engine crawler directives
│   └── sitemap.xml                       # XML Sitemap for indexing
├── src/
│   ├── config/
│   │   └── app.config.js                 # Environment configuration & constants
│   ├── controllers/
│   │   ├── health.controller.js          # Health check endpoint controller
│   │   ├── home.controller.js            # Landing page controller
│   │   └── privacy.controller.js         # Privacy policy page controller
│   ├── middleware/
│   │   ├── language.middleware.js        # Language resolution & direction middleware
│   │   └── security.middleware.js        # Helmet headers, rate limiting & compression
│   ├── routes/
│   │   └── web.routes.js                 # Web routing & language switching
│   ├── services/
│   │   ├── i18n.service.js               # Multi-language string interpolation service
│   │   └── seo.service.js                # Schema.org JSON-LD & meta tags generator
│   ├── views/
│   │   ├── errors/
│   │   │   └── 500.ejs                   # Internal server error template
│   │   ├── layouts/
│   │   │   └── main.ejs                  # Base layout with meta & typography
│   │   ├── pages/
│   │   │   ├── 404.ejs                   # Not found error template
│   │   │   ├── home.ejs                  # Premium landing page
│   │   │   └── privacy-policy.ejs        # 18-section audit-verified privacy policy
│   │   └── partials/
│   │       ├── footer.ejs                # Global footer with legal links
│   │       ├── language-switcher.ejs     # Dynamic language toggle button
│   │       └── navbar.ejs                # Sticky responsive navigation bar
│   ├── app.js                            # Express application setup
│   └── server.js                         # Server entrypoint
├── .env.example
├── ecosystem.config.js                   # PM2 cluster configuration
├── package.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Production Server
```bash
npm start
```

Access the application in your browser:
- Home (Arabic): `http://localhost:3000/ar`
- Home (English): `http://localhost:3000/en`
- Privacy Policy (Arabic): `http://localhost:3000/ar/privacy-policy`
- Privacy Policy (English): `http://localhost:3000/en/privacy-policy`
- Health check: `http://localhost:3000/health`
- Robots: `http://localhost:3000/robots.txt`
- Sitemap: `http://localhost:3000/sitemap.xml`

---

## 🔒 Privacy Policy Highlights (18 Sections)

The Privacy Policy at `/privacy-policy` is directly derived from our technical audit of the Flutter Android codebase:

1. **Introduction & Overview:** Clear mission and package identification (`com.alquranacademy.app`).
2. **About the Application:** Quran reading, audio synchronization, prayer calculation, Qibla compass, Azkar.
3. **Device Permissions & Transparency:** Fine/coarse location, notifications, wake lock, foreground service.
4. **Location Data Usage:** Ephemeral coordinates sent over HTTPS for prayer calculation; zero tracking; manual city fallback.
5. **Notification Permissions:** 100% locally scheduled prayer alarms and Azkar reminders; no marketing push servers.
6. **Device Sensors:** Compass and magnetometer readings processed strictly in local RAM for Qibla calculation; zero logging.
7. **Local Data Storage:** SQLite and SharedPreferences strictly on device; reading bookmarks and preferences.
8. **Third-Party Services:** Transparent listing of AlAdhan API and Quran audio CDNs (`everyayah.com`, `download.quranicaudio.com`).
9. **Ad-Free Commitment:** 100% Ad-Free (no AdMob, no advertising SDKs, no behavioral tracking).
10. **Data Security & Encryption:** Mandatory TLS/HTTPS for all network traffic, Android sandboxing.
11. **Data Sharing & Disclosure:** Zero data selling, renting, or monetization.
12. **Data Retention & Deletion:** Complete removal upon clearing app storage or uninstalling.
13. **Children's Privacy:** Full COPPA & GDPR-K compliance; suitable for all family members.
14. **User Choices & Controls:** Freedom to revoke permissions and choose manual location.
15. **External Links:** Clear disclaimer for external references.
16. **Changes to this Policy:** Transparent revision process.
17. **Contact Information:** Dedicated support email (`support@alquran-academya.online`).
18. **User Consent:** Formal acknowledgment and alignment with Google Play standards.

---

## 📄 License & Intellectual Property

&copy; 2026 Al Quran Academy. All rights reserved.
Developed for **Al Quran Academy** (`com.alquranacademy.app`).

