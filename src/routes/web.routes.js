const express = require('express');
const router = express.Router();
const config = require('../config/app.config');
const homeController = require('../controllers/home.controller');
const privacyController = require('../controllers/privacy.controller');
const healthController = require('../controllers/health.controller');
const languageMiddleware = require('../middleware/language.middleware');

// Health Check Endpoint
router.get('/health', healthController.getHealth);

// Robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: ${config.appUrl}/sitemap.xml
`);
});

// Sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const now = new Date().toISOString().split('T')[0];
  const baseUrl = config.appUrl.replace(/\/$/, '');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/ar</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/ar" />
  </url>
  <url>
    <loc>${baseUrl}/en</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/ar" />
  </url>
  <url>
    <loc>${baseUrl}/ar/privacy-policy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar/privacy-policy" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/privacy-policy" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/ar/privacy-policy" />
  </url>
  <url>
    <loc>${baseUrl}/en/privacy-policy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar" href="${baseUrl}/ar/privacy-policy" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en/privacy-policy" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/ar/privacy-policy" />
  </url>
</urlset>`;
  res.send(xml);
});

// Root route redirect to default language
router.get('/', (req, res) => {
  const preferredLang = req.cookies?.user_lang || config.defaultLanguage;
  res.redirect(301, `/${preferredLang}`);
});

// Privacy policy redirect to default language
router.get('/privacy-policy', (req, res) => {
  const preferredLang = req.cookies?.user_lang || config.defaultLanguage;
  res.redirect(301, `/${preferredLang}/privacy-policy`);
});

// Language switcher route
router.get('/change-lang/:lang', (req, res) => {
  const targetLang = req.params.lang;
  if (config.supportedLanguages.includes(targetLang)) {
    res.cookie('user_lang', targetLang, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    });
    
    // Determine referring path or redirect to home
    const ref = req.get('Referrer');
    if (ref && ref.includes('/privacy-policy')) {
      return res.redirect(`/${targetLang}/privacy-policy`);
    }
    return res.redirect(`/${targetLang}`);
  }
  res.redirect(`/${config.defaultLanguage}`);
});

// Language-scoped routes
router.get('/:lang(ar|en)', languageMiddleware, homeController.renderHome);
router.get('/:lang(ar|en)/privacy-policy', languageMiddleware, privacyController.renderPrivacyPolicy);

module.exports = router;

