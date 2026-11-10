const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const { securityHeaders, compression, limiter } = require('./middleware/security.middleware');
const webRoutes = require('./routes/web.routes');
const config = require('./config/app.config');

const app = express();

// Trust reverse proxy (Nginx)
app.set('trust proxy', 1);

// Security & Performance
app.use(securityHeaders);
app.use(compression);
app.use(limiter);

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files
app.use(express.static(path.join(__dirname, '..', 'public'), {
  maxAge: config.env === 'production' ? '7d' : 0,
  etag: true,
}));

// Template Engine & Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mount Web Routes
app.use('/', webRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  const lang = req.cookies?.user_lang || config.defaultLanguage;
  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';
  
  res.status(404).render('pages/404', {
    page: '404',
    lang,
    dir,
    config,
    t: (key) => require('./services/i18n.service').t(key, lang),
    seo: {
      lang,
      dir,
      title: isArabic ? 'الصفحة غير موجودة | 404' : 'Page Not Found | 404',
      description: isArabic
        ? 'عذراً، الصفحة التي تبحث عنها غير موجودة في موقع أكاديمية القرآن الكريم.'
        : 'Sorry, the page you are looking for does not exist on Al Quran Academy.',
      canonicalUrl: `${config.appUrl}/404`,
      alternateAr: `${config.appUrl}/ar`,
      alternateEn: `${config.appUrl}/en`,
      ogImage: `${config.appUrl}/assets/images/logo_primary.png`,
      jsonLd: '{}',
    },
  });
});

// 500 Internal Server Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const lang = req.cookies?.user_lang || config.defaultLanguage;
  const isArabic = lang === 'ar';
  const dir = isArabic ? 'rtl' : 'ltr';

  res.status(500).render('errors/500', {
    page: '500',
    lang,
    dir,
    config,
    t: (key) => require('./services/i18n.service').t(key, lang),
    seo: {
      lang,
      dir,
      title: isArabic ? 'خطأ في الخادم | 500' : 'Server Error | 500',
      description: 'An unexpected internal error occurred.',
      canonicalUrl: `${config.appUrl}/500`,
      alternateAr: `${config.appUrl}/ar`,
      alternateEn: `${config.appUrl}/en`,
      ogImage: `${config.appUrl}/assets/images/logo_primary.png`,
      jsonLd: '{}',
    },
    error: config.env === 'development' ? err : null,
  });
});

module.exports = app;
