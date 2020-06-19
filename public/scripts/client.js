let socket = io(window.location.href);
let username;
const viewIDs = ['main_menu', 'game', 'settings','scoreboard'];

socket.on('connect', function () {
    let savedUsername = getCookie("playerName");
    console.log("name from cookie:",savedUsername);

    socket.emit('join', savedUsername, function (response) {
        username = response;
        setCookie("playerName", username);
        console.log("Joined as", username);
    });

    // display the users name in lobby if he is connected correctly
    if (!$('#main_menu').is(':hidden')){
        $('#welcomeUser').text("Welcome " + getCookie("playerName"));
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