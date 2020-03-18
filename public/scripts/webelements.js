/**
 * Enables a more dynamic web experience, e.g. saves customization and adds animations to
 * web elements
 * @namespace WebElements
 * @author Mikkel Anderson
 * */
let today = new Date();
let expiry = new Date(today.getTime() + 100 * 24 * 3600 * 1000); // Cookie expires after 100 days

/**
 * Toggles hiding of different game-methods
 * @memberOf WebElements
 * */
function toggleHiding() {
    let div = document.getElementById("test");
    if (div.style.display === "none") {
        div.style.display = "inline-grid"
    } else {
        div.style.display = "none"
    }
}

/**
 * Saves cookie as name and value
 * @param {string} name Cookies's name.
 * @param {string} value Cookies's value.
 * @memberOf WebElements
 * */
function setCookie(name, value)
{
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}

/**
 * Get cookie value from name
 * @param {string} name Cookies's name.
 * @memberOf WebElements
 * */
function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

/**
 * Saves entire form as cookies
 * @param {string} form The form we are storing from.
 * @memberOf WebElements
 * */
function storeValuesFromForm(form)
{
    setCookie("dotColor", form.dotColor.value);
    setCookie("playerName", form.playerName.value);
    return true;
}

/**
 * Saves entire cookies when "enter" is pressed inside form
 * @memberOf WebElements
 * */
document.customization.onkeydown = function(event) {
    if (event.keyCode == 13) {
        storeValuesFromForm(document.customization)
    }
};

/**
 * Loads entire cookies when window is loaded
 * @memberOf WebElements
 * */
window.onload = function loadValuesToForm() {
    if(field1 = getCookie("dotColor")) document.customization.dotColor.value = field1;
    if(field2 = getCookie("playerName")) document.customization.playerName.value = field2;
};