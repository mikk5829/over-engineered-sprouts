//const cookieParser = require("cookie-parser");

$(function () {
    let $msgField = $('#chatMsgField');

    $.joinRoom = function (roomId) {
        socket.emit('joinRoom', roomId, function (success, num) {
            if (success) {
                if (paper.project) paper.project.activeLayer.removeChildren();
                $.changeView("game");
                playerNum = num;
            } else alert("Failed to join room " + roomId);
        });
    };

    $.createRoom = function () {
        let roomName = prompt("Name of new room");

        // Check room name requirements
        while (roomName.length < 1 || roomName.length > 20) {
            alert("Room name illegal, try again");
            roomName = prompt("Name of new room");
        }

        socket.emit('addRoom', roomName, function (success, id) {
            if (success) {
                console.log("Added new room " + id);
                $.joinRoom(id);
            } else alert("Failed to add room");
        });
    };

    $('#quickplayBtn').click(function () {
        socket.emit('quickPlay', function (success, id) {
            if (success) {
                console.log("Joining room " + id);
                $.joinRoom(id);
            } else {
                $.createRoom();
            }
        });
    });

    $('#newGameBtn').click(function () {
        $.createRoom();
    });

    $("#chatMsgForm").submit(function (e) {
        e.preventDefault();
        socket.emit('sendChatMsg', $msgField.val());
        $msgField.val('');
    });

    $('div.back-btn').click(function () {
        $.changeView("main_menu");
    });

    $('#rooms').on("click", "tr[role=\"button\"]", function () {
        $.joinRoom($(this).data("href"));
    });

    $('#importBtn').click(function () {
        $('#fileInput')[0].click();
    });

    // Handles the import button (game world from file) - Vanilla not jQuery
    document.getElementById('fileInput').addEventListener('change', () => {
        const file = document.getElementById('fileInput').files[0];
        const reader = new FileReader();
        reader.onload = event => {
            const result = event.target.result;
            const split = result.split('\n');
            const totalDots = split.length - 1;
            let paths = [];
            for (let i = 1; i < split.length; i++) {
                const dots = split[i].split(' ');
                paths.push({dot1: dots[0], dot2: dots[1]});
            }
            // ToDo validate it is a valid world
            localStorage.setItem("FileResultDotTotal", String(totalDots));
            localStorage.setItem("FileResultPaths", JSON.stringify(paths));
        }
        reader.readAsText(file);
        document.getElementById('infoBoxP').innerText = "Loaded new map. Click generate!";
        document.getElementById('infoBox').style.display = "inline"
    });

    $('#generateBtn').click(function () {
        console.log("click");
    });

    $('#settingsBtn').click(function () {
        $.openSettingsMenu();
        $.changeView("settings");
    });

    $('#scoreboardBtn').click(function () {
        // $.openScoreBoardMenu();
        $.changeView("scoreboard");
        // $("#scoreboardPane").fadeIn(1000);
    });


    // Updates the list of rooms in the lobby
    socket.on('updateLobby', function (rooms) {
        $('#rooms>tbody').empty();
        for (let room of rooms) {
            let capacity = room.capacity;
            let name = room.name;
            $('#rooms > tbody:last-child').append(`<tr data-href=${room.id} role="button" class="w3-hover-pale-green w3-hover-text-green"> <th class="w3-left-align"> ${name} </th><th class="w3-right-align"> ${capacity} </th></tr>`);
        }
    });

});
