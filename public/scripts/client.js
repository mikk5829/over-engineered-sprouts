$(function () {
    // const mainMenu = $("#mainMenu");
    // const gamePane = $("#gamePane");

    // TODO ??
    /* var $window = $(window);
     var $messages = $('.messages');
     var $inputMessage = $('.inputMessage');
     var $currentInput = $usernameInput.focus();
 */
    /*var $lobbyPage = $('.lobby.page');
    var $gamePage = $('.game.page');*/
    var username;

    var socket = io();

    function joinRoom(room) {
        // window.location = $(this).data("href");
        socket.emit('joinroom', room, function (url) {
            console.log("yep i'm here");
            /* const mainMenu = $("#mainMenu");
             const gamePane = $("#gamePane");*/
            const mainMenu = document.getElementById("mainMenu");
            const gamePane = document.getElementById("gamePane");

            mainMenu.classList.add('hidden');
            gamePane.classList.remove('hidden');
        });
    }

    $('form').submit(function (e) {
        console.log("submitting...");
        e.preventDefault(); // prevents page reloading
        socket.emit('sendchat', $('#msg').val());
        $('#msg').val('');
        return false;
    });

    $('#rooms').on("click", "tr[role=\"button\"]", function (e) {
        // window.location = $(this).data("href");
        console.log($(this).data("href"));
    });

    $('#importBtn').click(function () {
        console.log("click");
    });

    $('#generateBtn').click(function () {
        console.log("click");
    });

    $('#settingsBtn').click(function () {
        console.log("click");
    });

    $('#scoreboardBtn').click(function () {
        console.log("click");
    });

    $('#quickplayBtn').click(function (e) {

        console.log($('gamePage').innerText);

        socket.emit('quickplay', function (success, room) {
            if (success) {
                console.log("Joining room " + room);
                joinRoom(room);
            } else {
                socket.emit('addroom', prompt("Name of new room"), function (success, room = "") {
                    if (success) {
                        console.log("Added new room" + room);
                        joinRoom(room);
                    } else alert("Failed to add room");
                });
            }
        });
    });

    // When you click on a row in the list of games
    $('#rooms tr').click(function () {
        var href = $(this).find("a").attr("href");
        if (href) {
            window.location = href;
        }
    });

// Connect to server and receive a random guest username
    socket.on('connect', function () {
        // TODO: get username from cookies
        socket.emit('adduser', function (response) {
            username = response;
            console.log("Joined as", username);
        });
    });

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
    socket.on('updaterooms', function (rooms) {
        $('#rooms>tbody').empty();
        for (let room of rooms) {
            let capacity = 1 + "/" + 2;
            let name = room;
            $('#rooms > tbody:last-child').append('<tr data-href="hej" role="button" class="w3-hover-pale-green w3-hover-text-green"> <th class="w3-left-align">' + name + '</th><th class="w3-right-align">' + capacity + ' </th></tr>');
        }

        /*$.each(rooms, function (key, value) {
            if (value === current_room) {
                $('#rooms').append('<div>' + value + '</div>');
            } else {
                $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
            }
        });*/
    });

    socket.on('updatechat', function (sender, msg) {
        console.log("received updatechat", sender, msg);
        $('#messages').append($('<li>').text(msg));
    });
});