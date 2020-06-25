let socket = io(window.location.href);
let username;
let playerNum = null;
const viewIDs = ['main_menu', 'game', 'settings', 'scoreboard'];

socket.on('error', (error, abort = true) => {
    console.log('ERROR:', error);
    if (abort) location.reload();
});

/**
 * Client socket handler
 * @namespace Socket
 * @author Laura Hansen & Benjamin Starostka
 */

socket.on('connect', function () {
    let savedUsername = getCookie("playerName");
    console.log("Name from cookie:", savedUsername);

    socket.emit('join', savedUsername, function (response) {
        username = response;
        setCookie("playerName", username);
        $('#welcomeUser').text("Welcome " + username);
        console.log("Joined as", username);
    });

});

$(function () {
    $.changeView = function (newView) {
        for (let viewName of viewIDs) {
            $('#' + viewName).addClass('hidden').hide();
        }
        $('#' + newView).removeClass('hidden').show();
    };
});
