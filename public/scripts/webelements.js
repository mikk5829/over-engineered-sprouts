/**
 * Enables a more dynamic web experience, e.g. saves customization and adds animations to
 * web elements
 * @namespace WebElements
 * @author Mikkel Anderson
 * */
let today = new Date();
let expiry = new Date(today.getTime() + 30 * 24 * 3600 * 1000); // plus 30 days

function toggleHiding() {
    let div = document.getElementById("test");
    if (div.style.display === "none") {
        div.style.display = "inline-grid"
    } else {
        div.style.display = "none"
    }
}

function setCookie(name, value)
{
    document.cookie=name + "=" + escape(value) + "; path=/; expires=" + expiry.toGMTString();
}


function getCookie(name)
{
    var re = new RegExp(name + "=([^;]+)");
    var value = re.exec(document.cookie);
    return (value != null) ? unescape(value[1]) : null;
}

function storeValuesFromForm(form)
{
    setCookie("dotColor", form.dotColor.value);
    setCookie("playerName", form.playerName.value);
    return true;
}


document.customization.onkeydown = function(event) {
    if (event.keyCode == 13) {
        storeValuesFromForm(document.customization)
    }
}

window.onload = function loadValuesToForm() {
    if(field1 = getCookie("dotColor")) document.customization.dotColor.value = field1;
    if(field2 = getCookie("playerName")) document.customization.playerName.value = field2;
}