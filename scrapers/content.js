var when = require('when');
var request = require('request');
var _ = require('lodash');
var _s = require('underscore.string');
var cheerio = require('cheerio');
var fs = require('fs');

var Content = function () {
    var BASE_DOMAIN = 'http://www.cinemax.com';
    return when.promise(function (resolve) {
        request({uri: BASE_DOMAIN}, function (err, response, body) {
            var $ = cheerio.load(body), payload = {
                "maxAge": 300,
                "template": "commonTemplates:Homepage",
                "templateModifier": null,
                description: $($('.features-right')[1]).find('p').text(),
                title: 'Cinemax'
            };
            var primaryFeatures = $('.content-container').find('.features-primary');
            var secondaryFeatures = $('.content-container').find('.features-secondary');
            _.merge(payload, {
                content: {
                    parsed: {
                        "common:FullBleedImage": _.map($('#slider').find('img'), function (img) {
                            return {src: BASE_DOMAIN + img.attribs.src};
                        }),
                        "home:Features": {
                            items: _.map($('.carousel').find('.info').find('div').find('h2'), function (h2) {
                                return {title: $(h2).text(), button: {}};
                            }),
                            title: 'This Week on Max',
                            url: '/'
                        }
                    }
                }
            });

            _.merge(payload, {
                navigation: {
                    mediaTray: _.uniq(_.map(_.zip(payload.content.parsed['common:FullBleedImage'], payload.content.parsed['home:Features'].items), function (featureAr) {
                        return {img: featureAr[0].src, name: _s.titleize(featureAr[1].title)};
                    }).concat([{
                        name: primaryFeatures.find('h3').text(),
                        img: BASE_DOMAIN + primaryFeatures.find('img')[0].attribs.src
                    }]).concat(_.map(secondaryFeatures.find('li'), function (li) {
                            return {
                                name: $(li).find('h5').text(),
                                img: BASE_DOMAIN + $(li).find('img')[0].attribs.src
                            };
                        })), 'name')
                }
            });

            _.merge(payload, {
                bundled: {
                    mediaTray: _.map(payload.navigation.mediaTray, function (mediaItem) {
                        return _.merge(_.cloneDeep(mediaItem), {
                            "common:FullBleedImage": [{src: mediaItem.img}],
                            "home:Features": {
                                items: [{title: mediaItem.name, button: {}}]
                            },
                            title: mediaItem.name,
                            url: '/'
                        });
                    }),
                    "schedule": {
                        "US/Pacific": [
                            {
                                "pid": 415175,
                                "focusId": 631508,
                                "channelId": 5028,
                                "playDate": "2015-08-12T01:45:00Z",
                                "title": "Because I Said So"
                            },
                            {
                                "pid": 604824,
                                "focusId": 777384,
                                "channelId": 5028,
                                "playDate": "2015-08-12T03:30:00Z",
                                "title": "True Detective 16: Omega Station"
                            },
                            {
                                "pid": 610553,
                                "focusId": 783998,
                                "channelId": 5028,
                                "playDate": "2015-08-12T05:00:00Z",
                                "title": "Hard Knocks: Training Camp with the Houston Texans 01"
                            },
                            {
                                "pid": 602201,
                                "focusId": 774646,
                                "channelId": 5028,
                                "playDate": "2015-08-12T06:00:00Z",
                                "title": "Ballers 08: Gaslighting"
                            }
                        ],
                        "US/Central": [
                            {
                                "pid": 604824,
                                "focusId": 777384,
                                "channelId": 28,
                                "playDate": "2015-08-12T00:30:00Z",
                                "title": "True Detective 16: Omega Station"
                            },
                            {
                                "pid": 610553,
                                "focusId": 783998,
                                "channelId": 28,
                                "playDate": "2015-08-12T02:00:00Z",
                                "title": "Hard Knocks: Training Camp with the Houston Texans 01"
                            },
                            {
                                "pid": 602201,
                                "focusId": 774646,
                                "channelId": 28,
                                "playDate": "2015-08-12T03:00:00Z",
                                "title": "Ballers 08: Gaslighting"
                            },
                            {
                                "pid": 602191,
                                "focusId": 774636,
                                "channelId": 28,
                                "playDate": "2015-08-12T03:30:00Z",
                                "title": "The Brink 08: Who's Grover Cleveland?"
                            },
                            {
                                "pid": 591493,
                                "focusId": 761857,
                                "channelId": 28,
                                "playDate": "2015-08-12T04:00:00Z",
                                "title": "Birdman: Or (The Unexpected Virtue of Ignorance)"
                            }
                        ],
                        "US/Mountain": [
                            {
                                "pid": 415175,
                                "focusId": 631508,
                                "channelId": 5028,
                                "playDate": "2015-08-12T01:45:00Z",
                                "title": "Because I Said So"
                            },
                            {
                                "pid": 604824,
                                "focusId": 777384,
                                "channelId": 5028,
                                "playDate": "2015-08-12T03:30:00Z",
                                "title": "True Detective 16: Omega Station"
                            },
                            {
                                "pid": 610553,
                                "focusId": 783998,
                                "channelId": 5028,
                                "playDate": "2015-08-12T05:00:00Z",
                                "title": "Hard Knocks: Training Camp with the Houston Texans 01"
                            }
                        ],
                        "US/Eastern": [
                            {
                                "pid": 415175,
                                "focusId": 631508,
                                "channelId": 28,
                                "playDate": "2015-08-11T22:45:00Z",
                                "title": "Because I Said So"
                            },
                            {
                                "pid": 604824,
                                "focusId": 777384,
                                "channelId": 28,
                                "playDate": "2015-08-12T00:30:00Z",
                                "title": "True Detective 16: Omega Station"
                            },
                            {
                                "pid": 610553,
                                "focusId": 783998,
                                "channelId": 28,
                                "playDate": "2015-08-12T02:00:00Z",
                                "title": "Hard Knocks: Training Camp with the Houston Texans 01"
                            },
                            {
                                "pid": 602201,
                                "focusId": 774646,
                                "channelId": 28,
                                "playDate": "2015-08-12T03:00:00Z",
                                "title": "Ballers 08: Gaslighting"
                            }
                        ],
                        "US/Alaska": [
                            {
                                "pid": 604824,
                                "focusId": 777384,
                                "channelId": 5028,
                                "playDate": "2015-08-12T03:30:00Z",
                                "title": "True Detective 16: Omega Station"
                            },
                            {
                                "pid": 610553,
                                "focusId": 783998,
                                "channelId": 5028,
                                "playDate": "2015-08-12T05:00:00Z",
                                "title": "Hard Knocks: Training Camp with the Houston Texans 01"
                            },
                            {
                                "pid": 602201,
                                "focusId": 774646,
                                "channelId": 5028,
                                "playDate": "2015-08-12T06:00:00Z",
                                "title": "Ballers 08: Gaslighting"
                            },
                            {
                                "pid": 602191,
                                "focusId": 774636,
                                "channelId": 5028,
                                "playDate": "2015-08-12T06:30:00Z",
                                "title": "The Brink 08: Who's Grover Cleveland?"
                            },
                            {
                                "pid": 591493,
                                "focusId": 761857,
                                "channelId": 5028,
                                "playDate": "2015-08-12T07:00:00Z",
                                "title": "Birdman: Or (The Unexpected Virtue of Ignorance)"
                            }
                        ],
                        "US/Hawaii": [
                            {
                                "pid": 602201,
                                "focusId": 774646,
                                "channelId": 5028,
                                "playDate": "2015-08-12T06:00:00Z",
                                "title": "Ballers 08: Gaslighting"
                            },
                            {
                                "pid": 602191,
                                "focusId": 774636,
                                "channelId": 5028,
                                "playDate": "2015-08-12T06:30:00Z",
                                "title": "The Brink 08: Who's Grover Cleveland?"
                            },
                            {
                                "pid": 591493,
                                "focusId": 761857,
                                "channelId": 5028,
                                "playDate": "2015-08-12T07:00:00Z",
                                "title": "Birdman: Or (The Unexpected Virtue of Ignorance)"
                            },
                            {
                                "pid": 593754,
                                "focusId": 764438,
                                "channelId": 5028,
                                "playDate": "2015-08-12T09:00:00Z",
                                "title": "The Cell 2"
                            }
                        ]
                    }
                }
            });

            fs.writeFileSync('./out/content.json', JSON.stringify(payload));
            resolve();
        });
    });
};

module.exports = Content;

