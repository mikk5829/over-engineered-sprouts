let socket = io();
let username;
const viewIDs = ['main_menu', 'game', 'settings','scoreboard'];

$(function () {
    socket.on('connect', function () {
        console.log('Connect');
        // TODO: get username from cookies
        socket.emit('addUser', function (response) {
            username = response;
            console.log("Joined as", username);
        });
    });

    $.changeView = function (newView) {
        for (let viewName of viewIDs) {
            $('#' + viewName).addClass('hidden').hide();
        }
        $('#' + newView).removeClass('hidden').show();
    };
});