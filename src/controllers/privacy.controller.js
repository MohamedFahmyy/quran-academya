const seoService = require('../services/seo.service');
const config = require('../config/app.config');

exports.renderPrivacyPolicy = (req, res) => {
  const lang = req.lang || config.defaultLanguage;
  const isArabic = lang === 'ar';
  
  const seo = seoService.getSeoMetadata({
    lang,
    path: 'privacy-policy',
    title: isArabic ? 'سياسة الخصوصية' : 'Privacy Policy',
    description: isArabic
      ? 'سياسة الخصوصية الرسمية لتطبيق وموقع Al Quran Academy. نلتزم بحماية بياناتك وخصوصيتك بأعلى معايير الأمان والشفافية.'
      : 'Official Privacy Policy for Al Quran Academy application and website. We are committed to protecting your privacy with the highest standards of transparency.',
  });

  res.render('pages/privacy-policy', {
    seo,
    page: 'privacy',
  });
};

