let socket = io();
let username;
const viewIDs = ['mainMenu', 'gamePane'];

socket.on('connect', function () {
    console.log('Connect');
    // TODO: get username from cookies
    socket.emit('addUser', function (response) {
        username = response;
        console.log("Joined as", username);
    });
});