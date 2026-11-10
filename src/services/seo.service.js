const config = require('../config/app.config');

function getSeoMetadata({ lang = 'ar', path = '', title, description, image, type = 'website' }) {
  const isArabic = lang === 'ar';
  const baseUrl = config.appUrl.replace(/\/$/, '');
  
  // Format canonical & alternates
  const cleanPath = path.replace(/^\//, '');
  const canonicalUrl = `${baseUrl}/${lang}${cleanPath ? '/' + cleanPath : ''}`;
  const alternateAr = `${baseUrl}/ar${cleanPath ? '/' + cleanPath : ''}`;
  const alternateEn = `${baseUrl}/en${cleanPath ? '/' + cleanPath : ''}`;

  const defaultTitle = isArabic
    ? 'Al Quran Academy | القرآن الكريم ومواقيت الصلاة والأذكار'
    : 'Al Quran Academy – Quran Reading, Audio & Prayer Times';

  const defaultDescription = isArabic
    ? 'اكتشف تطبيق Al Quran Academy لقراءة القرآن الكريم بالرسم العثماني والاستماع للتلاوات ومعرفة مواقيت الصلاة واتجاه القبلة والأذكار اليومية بدون إعلانات.'
    : 'Discover Al Quran Academy – a comprehensive, ad-free Islamic mobile application for Quran reading, audio recitations, exact prayer times, Qibla compass & daily Azkar.';

  const finalTitle = title ? `${title} | ${config.appName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const ogImage = image || `${baseUrl}/assets/images/logo_primary.png`;

  // JSON-LD Structured Data
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: config.appName,
      alternateName: config.appNameAr,
      operatingSystem: 'Android 7.0 and up',
      applicationCategory: 'LifestyleApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: finalDescription,
      image: ogImage,
      url: baseUrl,
      downloadUrl: config.googlePlayUrl || baseUrl,
      featureList: [
        'Complete 114 Surahs offline',
        'Synchronized ayah audio recitation highlighting',
        'Accurate astronomical prayer times',
        'Precise Qibla direction compass',
        'Daily morning and evening Azkar',
        'Smart Adhan reminders',
      ],
      author: {
        '@type': 'Organization',
        name: config.organizationName,
        url: baseUrl,
        logo: `${baseUrl}/assets/images/logo_icon.png`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.appName,
      url: baseUrl,
      inLanguage: isArabic ? 'ar' : 'en',
      publisher: {
        '@type': 'Organization',
        name: config.organizationName,
        logo: `${baseUrl}/assets/images/logo_icon.png`,
      },
    },
  ];

  return {
    lang,
    dir: isArabic ? 'rtl' : 'ltr',
    title: finalTitle,
    description: finalDescription,
    canonicalUrl,
    alternateAr,
    alternateEn,
    ogImage,
    type,
    jsonLd: JSON.stringify(jsonLd),
  };
}

module.exports = {
  getSeoMetadata,
};

