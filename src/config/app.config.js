require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'production',
  appUrl: process.env.APP_URL || 'https://alquran-academya.online',
  appName: 'Al Quran Academy',
  appNameAr: 'أكاديمية القرآن الكريم',
  packageName: process.env.APP_PACKAGE_NAME || 'com.alquranacademy.app',
  googlePlayUrl: process.env.GOOGLE_PLAY_URL || '',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@alquran-academya.online',
  organizationName: process.env.ORGANIZATION_NAME || 'Al Quran Academy',
  defaultLanguage: 'ar',
  supportedLanguages: ['ar', 'en'],
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 300,
  },
};

