var when = require('when');
var request = require('request');
var _ = require('lodash');
var _s = require('underscore.string');
var cheerio = require('cheerio');
var fs = require('fs');

var Schedule = function () {
	var BASE_DOMAIN = 'http://www.cinemax.com/apps/schedule/ScheduleServlet';
	return when.promise(function (resolve) {
		request({uri: BASE_DOMAIN}, function (err, response, body) {
			console.log(err)
			var $ = cheerio.load(body), payload = {};
			var gridTable = $('.schedule-wrapper');
			console.log(body);
			//var gridPrev = $('.content-container').find('.features-secondary');
			/*_.merge(payload, {
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

			fs.writeFileSync('./out/content.json', JSON.stringify(payload));*/
			resolve();
		});
	});
};

var _getNextTen = function() {

};

module.exports = Schedule;
