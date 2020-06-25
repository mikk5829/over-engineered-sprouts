$(function () {

    $.changeView = function (newView) {
        $('#' + newView).removeClass('hidden').show();
        for (let viewName of viewIDs) {
            if (viewName !== newView) $('#' + viewName).addClass('hidden').hide();
        }
    };

    $.enableOverlay = function (msg = "Paused", enable_button) {
        $('#overlay').show();
        $('#overlay-text').text(msg);
        if (enable_button) {
            $('#overlay-btn').show();
        }
    };

    $.disableOverlay = function () {
        $('#overlay').hide();
        $('#overlay-text').text('');
        $('#overlay-btn').hide();
    };
});

/**
 * Enables a more dynamic web experience, e.g. saves customization and adds animations to
 * web elements
 * @namespace WebElements
 * @author Mikkel Anderson & Laura Hansen
 * */
let today = new Date();
let expiry = new Date(today.getTime() + 100 * 24 * 3600 * 1000); // Cookie expires after 100 days

/**
 * Saves cookie as name and value
 * @param {string} name Cookies's name.
 * @param {string} value Cookies's value.
 * @memberOf WebElements
 * */
function setCookie(name, value) {
    document.cookie = name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}

/**
 * Get cookie value from name
 * @param {string} name Cookies's name.
 * @memberOf WebElements
 * */
function getCookie(name) {
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}