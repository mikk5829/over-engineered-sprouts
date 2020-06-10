const RESOLUTIONS = [
    {res_x : 1024, res_y:576},
    {res_x : 1152, res_y:648},
    {res_x : 1280, res_y:720},
    {res_x : 1366, res_y:768},
    {res_x : 1600, res_y:900},
    {res_x : 1920, res_y:1080},
    {res_x : 2560, res_y:1440},
    {res_x : 3840, res_y:2160 },
];

$(function () {
    $.openSettingsMenu = function() {
        console.log("entering settings");
        let dotColor = getCookie("dotColor");
        let playerName = getCookie("playerName");
        // let gameResolution = getCookie("gameResolution");

        if (playerName) {
            $('form[name="playerName"]').val(playerName);
            username = playerName;
        }
        if (dotColor) {
            $('form[name="dotColor"]').val(dotColor);
        }
        // if (gameResolution) $('form[name="dotColor"]').val(dotColor);
    };


    $.fillForm = function () {
        console.log(getCookie("playerName"));
    };

    $("#customization").submit(function (e) {
        console.log("submit");
        e.preventDefault();
        setCookie("dotColor", $("input[name=dotColor]").val());
        setCookie("playerName", $("input[name=playerName]").val());
        setCookie("gameResolution", $("input[name=gameResolution]").val());
        $.changeView('main_menu');

        // LAURA TODO: Fortæl serveren at brugeren vil ændre navn, ændr navnet som hører til brugerens socket

        let playerName = getCookie("playerName");
        if (playerName) {
            username = playerName;
            console.log(playerName, username)
        }
        // todo send til server
    })
});

/*
window.onload = function () {
    // Webstorm does not recognize but it does call webelements.js functions correctly
    loadValuesToForm();

    let resolution_select = document.getElementById("resolution-dropdown-select");
    for(let elem of RESOLUTIONS) {
        let option = document.createElement("OPTION");
        option.innerText = elem.res_x + "x" + elem.res_y;
        option.setAttribute("value",elem.res_x + "x" + elem.res_y);
        resolution_select.appendChild(option);
    }
};
*/
