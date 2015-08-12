var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    _ = require('lodash'),
    when = require('when');

module.exports = function () {
    var BASE_DOMAIN = 'http://www.cinemax.com/apps/schedule/ScheduleServlet';
    return when.promise(function (resolve) {
        var driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();

        driver.get(BASE_DOMAIN);

        setTimeout(function () {
            driver.findElements(By.tagName('a')).then(function (links) {
                console.log(links.length);
                setTimeout(function () {
                    driver.quit();
                    resolve();
                }, 3000);
            });
        }, 5000);
    });
};