var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    _ = require('lodash'),
    when = require('when'),
    sequence = require('when/sequence'),
    fs = require('fs'),
    async = require('async');

var payload;

var programShowings = {
    LinearSchedule: [],
    focusId: '',
    goEndDate: '',
    goStartDate: '',
    productId: '',
    title: ''
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
        payload = {
            detail: {},
            schedule: {
                linearSchedule: [],
                miniSummary: [],
                series: {}
            }
        };
        _getAllPrograms(BASE_DOMAIN).then(function(rows) {
            async.eachSeries(rows, function(row, next) {
                _getProgramDetails(row).then(function() {
                    next();
                });
            }, function(error) {
                if(!_.isEmpty(error)) {
                    console.log(error);
                }
                fs.writeFileSync('./out/schedule.json', JSON.stringify(payload));
                resolve();
            });
        });
    });
};

var _getPrevPage = function(driver) {
    return when.promise(function(resolve) {
        setTimeout(function () {
            driver.findElement(By.css('.schedule-wrapper'))
                    .findElements(By.tagName('div'))
                    .then(function(divs) {
                        divs[0].findElements(By.tagName('a'))
                                .then(function(a) {
                                    a[0].click();
                                    resolve(driver);
                                });
                    });
        }, 2000);
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
            var programs = _.cloneDeep(programShowings);

            driver.findElement(By.css('.schedule-wrapper'))
                    .findElement(By.tagName('div'))
                    .findElements(By.tagName('div'))
                    .then(function(divs) {
                        _getText(divs).then(function(textArr) {
                            var content = _parseContent(textArr[1]);
                            var genre = textArr[3].split(':');
                            var channelInfo = _parseChannelInfo(textArr[10]);

                            _.assign(_.get(details, 'response.body.ProductResponse.productSummary'), {
                                CMSSubCategories: 'movies',
                                blurbId: '',
                                castCrew: _getCastCrew(textArr[8], textArr[9]),
                                title: textArr[0],
                                content: content,
                                defaultCategory: {category: 'Movies'},
                                detailImg: "http://i.lv3.hbo.com/assets/images/documentaries/seduced-and-abandoned/seduced-and-abandoned-380.jpg",
                                focusId: focusId,
                                genre: genre,
                                isHD: "Y",
                                landingLink: "",
                                mpaa: "R",
                                pid: 0,
                                runTimeMins: textArr[2].split(': ')[1],
                                runTimeSecs: 0,
                                summary: _.trim(textArr[7], '"'),
                                vid: 0
                            });

                            _.assign(programs, {
                                title: textArr[0],
                                focusId: focusId,
                                productId: 'p' + focusId
                            });

                            channelInfo.map(function(channel) {
                                _.get(programs, 'LinearSchedule').push({
                                    AirDate: _parseToISODate(channel[0], channel[1]),
                                    channel: channel[2].replace(' -', '')
                                });
                            });

                            _.get(payload, 'schedule.miniSummary').push({
                                '@focusId': focusId,
                                PID: 0,
                                content: content,
                                defaultCategory: {category: 'Movies'},
                                genre: genre,
                                mpaa: "R",
                                seasonYear: 0,
                                summary: _.trim(textArr[7], '"'),
                                title: textArr[0]
                            });

                            _.get(payload, 'schedule.linearSchedule').push({
                                channelId: 28, //This is not correct, but think it doesn't matter.
                                channelName: channelInfo[0][2].replace(' -', ''),
                                duration: textArr[2].split(': ')[1],
                                focusId: focusId,
                                isHD: "Y",
                                isHboGOPlay: "Y",
                                isOnDemandPlay: "Y",
                                nextPlayDate: '',
                                pid: 0, //irrelevant for cinemax
                                playDate: _parseToISODate(channelInfo[0][0], channelInfo[0][1]),
                                vid: 0
                            });

                            setTimeout(function () {
                                driver.quit();
                            }, 2000);
                            fs.writeFileSync('./out/'+focusId+'.json', JSON.stringify(details));
                            fs.writeFileSync('./out/p'+focusId+'.json', JSON.stringify(programs));
                            resolve();
                        });
                    });
        }, 2000);
    });
};

//Get list of all scheduled programs on the page
var _getAllPrograms = function(url) {
    return when.promise(function(resolve) {
        var driver = _createDriver(driver);
        driver.get(url);

        var allPrograms = [];

        //For first page
        allPrograms.push(_getAllProgramsOnPage(driver));
        //For previous 10 links
        resolve(_getAllPrevLinks(allPrograms, driver, 0));
    });
};

//For previous 10 links
var _getAllPrevLinks = function(allPrograms, driver, count) {
    return when.promise(function(resolve) {
        if(count >= 9) {
            when.all(allPrograms).then(function(links) {
                setTimeout(function () {
                    driver.quit();
                }, 2000);
                console.log('Unique', _.uniq(_.flatten(links)).length);
                resolve(_.uniq(_.flatten(links)));
            });
        } else {
            _getPrevPage(driver).then(function (driver) {
                allPrograms.push(_getAllProgramsOnPage(driver));
                _getAllPrevLinks(allPrograms, driver, count + 1).then(function(programs) {
                    return when.promise(function(res) {
                        setTimeout(function() {
                            resolve(programs);
                        }, 2000);
                    });
                });
            });
        }
    });
};

var _getAllProgramsOnPage = function(driver) {
    return when.promise(function(resolve) {
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
    } catch(err) {
        console.log(err);
        return;
    }
};

var _parseChannelInfo = function(channelInfo) {
    return _.chain(channelInfo.split('\n'))
            .slice(1, channelInfo.length)
            .filter(function(val) {
                return val !== '';
            }).chunk(3)
            .uniq(function(val) {
                return _.deburr(val);
            })
            .value();
};

var _parseToISODate = function(date, time) {
    var d = '2015/' + date.split(' ')[1];
    var t = time.split(' ')[0] + ':00';
    return new Date(d + ' ' + t).toISOString().replace('.000Z', 'Z');
};

var _getAttribute = function(element, attrib) {
    element.getAttribute(attrib).then(function(value) {
        return value;
    });
};