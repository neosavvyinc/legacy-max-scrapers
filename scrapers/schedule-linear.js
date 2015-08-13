var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    _ = require('lodash'),
    when = require('when'),
    sequence = require('when/sequence'),
    fs = require('fs'),
    async = require('async');

var payload = {
    detail: {},
    schedule: {
        linearSchedule: {},
        miniSummary: {

        },
        series: {}
    }
};

var detailsPayload = {
    response: {
        '@responseType': 'OK',
        body: {
            ProductResponse: {
                goSchedule: {},
                linearSchedule: {},
                productSummary: {}
            },
            errorCode: 0,
            responseTypeJS: 'OK'
        }
    }
};

var _createDriver = function() {
    return new webdriver.Builder()
            .forBrowser('chrome')
            .build();
};

module.exports = function () {
    var BASE_DOMAIN = 'http://www.cinemax.com/apps/schedule/ScheduleServlet?ACTION_TODAY=TODAY';
    var NEXT_GRID = 'http://www.cinemax.com/apps/schedule/ScheduleServlet?ACTION_NEXT_GRID=NEXT';
    var PREV_GRID = 'http://www.cinemax.com/apps/schedule/ScheduleServlet?ACTION_PREV_GRID=PREV';


    return when.promise(function (resolve) {
        _getAllPrograms(BASE_DOMAIN).then(function(rows) {
            async.eachSeries(rows, function(row, next) {
                _getProgramDetails(row).then(function() {
                    next();
                });
            }, function(error) {
                resolve();
            });
        });
    });
};

//Get details for each program(by focusId)
var _getProgramDetails = function(detailUrl) {
    var focusId = detailUrl.split('FOCUS_ID=')[1];
    return when.promise(function(resolve) {
        var driver = _createDriver();
        driver.get(detailUrl);
        console.log(focusId);
        setTimeout(function() {
            var details = _.cloneDeep(detailsPayload);
            driver.findElement(By.css('.schedule-wrapper'))
                    .findElement(By.tagName('div'))
                    .findElements(By.tagName('div'))
                    .then(function(divs) {
                        _getText(divs).then(function(textArr) {
                            _.assign(details.response.body.ProductResponse.productSummary, {
                                CMSSubCategories: 'movies',
                                blurbId: '',
                                castCrew: _getCastCrew(textArr[8], textArr[9]),
                                title: textArr[0],
                                content: _parseContent(textArr[1]),
                                defaultCategory: {category: 'Movies'},
                                detailImg: "http://i.lv3.hbo.com/assets/images/documentaries/seduced-and-abandoned/seduced-and-abandoned-380.jpg",
                                focusId: focusId,
                                genre: textArr[3].split(':'),
                                isHD: "Y",
                                landingLink: "",
                                mpaa: "TVMA",
                                pid: 0,
                                runTimeMins: textArr[2].split(': '),
                                runTimeSecs: 0,
                                summary: _.trim(textArr[7], '"'),
                                vid: 0
                            });
                            setTimeout(function () {
                                driver.quit();
                            }, 2000);
                            fs.writeFileSync('./out/'+focusId+'.json', JSON.stringify(details));
                            resolve();
                        });
                    });
        }, 2000);
    });
};

//Get list of all scheduled programs on the page
var _getAllPrograms = function(url) {
    return when.promise(function(resolve) {
        var driver = _createDriver();
        driver.get(url);

        setTimeout(function () {
            var links = [];
            driver.findElement(By.css('.schedule-wrapper'))
                    .findElement(By.tagName('tbody'))
                    .findElements(By.tagName('a'))
                    .then(function (a) {
                        links = _.map(a, function(_a) {
                            return _a.getAttribute('href');
                        });
                        when.all(links).then(function(values) {
                            setTimeout(function () {
                                driver.quit();
                            }, 2000);
                            resolve(values);
                        });
                    });
        }, 3000);
    });
};

var _parseContent = function(content) {
    var ratings = content.split(':')[1].split(',');
    return _.flatten(_.map(ratings, function(rating) {
        if(rating.indexOf('PG13') > -1) {
            return 'PG13';
        } else if(rating.indexOf('R for ADULT CONTENT') > -1) {
            return ['R', 'AC'];
        } else if(rating.indexOf('ADULT CONTENT') > -1) {
            return 'AC';
        } else if(rating.indexOf('ADULT LANGUAGE') > -1) {
            return 'AL';
        }
    }));
};

var _getText = function(elements) {
    return when.promise(function(resolve) {
        var textArr = _.map(elements, function(el) {
            return el.getText()
        });

        when.all(textArr).then(function(values) {
            resolve(values);
        });
    });
};

var _getCastCrew = function(actors, directors) {
    try {
        actors = actors.split(': ')[1];
        if(!_.isEmpty(actors)) {
            actors = actors.split(',');
        }
        directors = directors.split(': ')[1].split(',');
        var castCrew = _.map(actors, function (actor) {
            return {
                name: actor,
                order: 1,
                role: 'ACTOR'
            };
        });

        _.merge(castCrew, _.map(directors, function (director) {
            return {
                name: director,
                order: 1,
                role: 'DIRECTOR'
            };
        }));
        return castCrew;
    } catch(errr) {
        console.log(errr)
        return;
    }
};

var _getAttribute = function(element, attrib) {
    element.getAttribute(attrib).then(function(value) {
        return value;
    });
};