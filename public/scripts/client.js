let socket = io(window.location.href);
let username;
let playerNum = null;
const viewIDs = ['main_menu', 'game', 'settings', 'scoreboard'];

socket.on('connect', function () {
    let savedUsername = getCookie("playerName");
    console.log("Name from cookie:", savedUsername);

    socket.emit('join', savedUsername, function (response) {
        username = response;
        setCookie("playerName", username);
        console.log("Joined as", username);
    });

    if (!$('#main_menu').is(':hidden')) {
        if(getCookie("playername") !== undefined) $('#welcomeUser').text("Welcome " + getCookie("playerName"));
    }

});

$(function () {
    $.changeView = function (newView) {
        for (let viewName of viewIDs) {
            $('#' + viewName).addClass('hidden').hide();
        }
        $('#' + newView).removeClass('hidden').show();

    };
});