var Content = require('./scrapers/content');
var Footer = require('./scrapers/footer');

Content().then(Footer);