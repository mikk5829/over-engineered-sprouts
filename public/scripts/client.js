let socket = io(window.location.href);
let username;
let playerNum = null;
const viewIDs = ['main_menu', 'game', 'settings','scoreboard'];

socket.on('connect', function () {
    let savedUsername = getCookie("playerName");
    console.log("Name from cookie:",savedUsername);

    socket.emit('join', savedUsername, function (response) {
        username = response;
        setCookie("playerName", username);
        console.log("Joined as", username);
        $('#overlay').hide();// Hide overlay when player is connected correctly
        $('#overlay-text').text('');
    });

    // Stuff to do when main menu is visible and socket is connected:
    // - display the player's name in lobby if he is connected correctly
    // - Let the player know if he/she has a game configuration loaded in localstorage
    if (!$('#main_menu').is(':hidden')){
        if(getCookie("playerName") !== undefined) $('#welcomeUser').text("Welcome " + getCookie("playerName")); // display username
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