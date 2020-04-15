let socket = io('http://localhost:3000/');
let username;
const viewIDs = ['main_menu', 'game', 'settings','scoreboard'];

socket.on('connect', function () {
    // TODO: get username from cookies
    socket.emit('addUser', function (response) {
        username = response;
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