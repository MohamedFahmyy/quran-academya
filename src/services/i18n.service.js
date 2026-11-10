const fs = require('fs');
const path = require('path');

const locales = {};
const supportedLanguages = ['ar', 'en'];

supportedLanguages.forEach((lang) => {
  const filePath = path.join(__dirname, '..', '..', 'locales', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      locales[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Failed to load locale: ${lang}`, e);
      locales[lang] = {};
    }
  }
});

function getTranslation(keyPath, lang = 'ar') {
  const localeData = locales[lang] || locales['ar'] || {};
  const keys = keyPath.split('.');
  let result = localeData;
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      // Fallback to Arabic if missing in English
      let fallback = locales['ar'];
      for (const fbKey of keys) {
        if (fallback && typeof fallback === 'object' && fbKey in fallback) {
          fallback = fallback[fbKey];
        } else {
          return keyPath;
        }
      }
      return fallback;
    }
  }
  return result;
}

module.exports = {
  supportedLanguages,
  locales,
  t: getTranslation,
};

