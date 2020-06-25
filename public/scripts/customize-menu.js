$(function () {
    $.openSettingsMenu = function() {
        console.log("entering settings");
        let pointColor = getCookie("pointColor") ? getCookie("pointColor") : 'Indigo';
        let playerName = getCookie("playerName");

        if (playerName) {
            $('form[name="playerName"]').val(playerName);
            username = playerName;
        }
        if (pointColor)  $('form[name="pointColor"]').val(pointColor);
    };


    $.fillForm = function () {
        console.log(getCookie("playerName"));
    };

    $("#customization").submit(function (e) {
        console.log("submit");
        e.preventDefault();
        setCookie("pointColor", $("input[name=pointColor]").val());
        $.changeView('main_menu');
        // let playerName = getCookie("playerName");
        let playerName =  $("input[name=playerName]").val();
        if (playerName) {
            socket.emit('changeUsername', playerName, function(response) {
                console.log(playerName,username,response);
                username = response ? playerName : username;
                setCookie("playerName", username);
                $('#welcomeUser').text("Welcome " + getCookie("playerName"));
            });
        }
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
