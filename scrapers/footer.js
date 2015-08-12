var when = require('when');
var request = require('request');
var _ = require('lodash');
var _s = require('underscore.string');
var cheerio = require('cheerio');
var fs = require('fs');

var Footer = function () {
    var BASE_DOMAIN = 'http://www.cinemax.com/explore-cinemax.html';
    return when.promise(function (resolve) {
        request({uri: BASE_DOMAIN}, function (err, response, body) {
            var $ = cheerio.load(body), payload = {
                title: 'ways to watch Cinemax',
                description: $($('.features-right').find('p')[0]).text(),
                ways_to_watch: _.map($('.content-container').find('.features-explore'), function (explore) {
                    explore = $(explore);
                    return {
                        image_url: 'http://www.cinemax.com/img/global/logo.png',
                        description: $(explore.find('p')[0]).text(),
                        link: {
                            url: '/',
                            label: $(explore.find('h3')[0]).text()
                        }
                    };
                }),
                follow_us: {
                    title: 'follow us',
                    social_media: [
                        {
                            "image_url": "/custom-assets/vshort/footer/social-twitter.svg",
                            "label": "Twitter",
                            "url": "https://twitter.com/cinemax"
                        },
                        {
                            "image_url": "/custom-assets/vshort/footer/social-facebook.svg",
                            "label": "Facebook",
                            "url": "https://www.facebook.com/cinemax"
                        },
                        {
                            "image_url": "/custom-assets/vshort/footer/social-youtube.svg",
                            "label": "Youtube",
                            "url": "https://www.youtube.com/user/cinemax?sub_confirmation=1"
                        },
                        {
                            "image_url": "/custom-assets/vshort/footer/social-instagram.svg",
                            "label": "Instagram",
                            "url": "https://instagram.com/cinemax/"
                        }
                    ]
                }
            };

            fs.writeFileSync('./out/footer.json', JSON.stringify(payload));
            resolve();
        });
    });
};

module.exports = Footer;