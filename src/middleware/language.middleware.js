const config = require('../config/app.config');
const i18n = require('../services/i18n.service');

function languageMiddleware(req, res, next) {
  let lang = req.params.lang || req.cookies?.user_lang || config.defaultLanguage;
  if (!config.supportedLanguages.includes(lang)) {
    lang = config.defaultLanguage;
  }

  req.lang = lang;
  req.dir = lang === 'ar' ? 'rtl' : 'ltr';

  // Make accessible in all EJS templates
  res.locals.lang = lang;
  res.locals.dir = req.dir;
  res.locals.t = (key) => i18n.t(key, lang);
  res.locals.config = config;
  res.locals.currentPath = req.path;

  next();
}

module.exports = languageMiddleware;

