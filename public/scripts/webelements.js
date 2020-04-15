$(function () {
    $.changeView = function (newView) {
        for (let viewName of viewIDs) {
            $('#' + viewName).addClass('hidden').hide();
        }
        $('#' + newView).removeClass('hidden').show();
    };

    $("form").submit(function (e) {
        setCookie("playerName", $("#textInput").val());
        setCookie("dotColor", $("#colorInput").val());
        return true;
    })
});

/**
 * Enables a more dynamic web experience, e.g. saves customization and adds animations to
 * web elements
 * @namespace WebElements
 * @author Mikkel Anderson
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
    console.log("sup")
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

/**
 * Saves entire form as cookies
 * @param {string} form The form we are storing from.
 * @memberOf WebElements
 * */
function storeValuesFromForm(form) {
    setCookie("dotColor", form.dotColor.value);
    setCookie("playerName", form.playerName.value);
    return true;
}

/**
 * Saves entire cookies when "enter" is pressed inside form
 * @memberOf WebElements
 * */
/*document.customization.onkeydown = function(event) {
    if (event.keyCode === 13) {
        storeValuesFromForm(document.customization)
    }
};*/

/**
 * Loads entire cookies when window is loaded
 * @memberOf WebElements
 * */

/*
window.onload = function loadValuesToForm() {
    console.log(getCookie("playerName"));

};
*/

window.onload = function () {
    console.log("loaded")
    let dotColor = getCookie("dotColor");
    let playerName = getCookie("playerName");

    if (playerName)  $('form[name="playerName"]').val(playerName);
    if (dotColor)  $('form[name="dotColor"]').val(dotColor);

};

