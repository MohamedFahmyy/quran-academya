const seoService = require('../services/seo.service');
const config = require('../config/app.config');

exports.renderHome = (req, res) => {
  const lang = req.lang || config.defaultLanguage;
  const seo = seoService.getSeoMetadata({
    lang,
    path: '',
  });

  res.render('pages/home', {
    seo,
    page: 'home',
  });
};

