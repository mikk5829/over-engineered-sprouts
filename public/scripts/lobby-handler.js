//const cookieParser = require("cookie-parser");

import {worldInLocalStorage} from "./modules/Utility.js";

$(function () {
    let $msgField = $('#chatMsgField');

    $.joinRoom = function(roomId) {
        socket.emit('joinRoom', roomId, function (err, result) {
            if (err) console.log(err);
            console.log(result);
        });
    };

    // Listening for events telling if the player is allowed to join the game or not!
    socket.on('lobby join', function(msg, join_bool){
        if (join_bool) {
            $.changeView("game");
        }
    });

    function createRoom(join = false) {
        let game_config = worldInLocalStorage();
        socket.emit('addRoom', prompt("Name of new room"), game_config, function (success, id) {
            if (success) {
                console.log("Added new room" + id);
                if (join) $.joinRoom(id);
            } else alert("Failed to add room");
        });
    }

    $("#chatMsgForm").submit(function(e) {
        e.preventDefault();
        socket.emit('sendChatMsg', $msgField.val());
        $msgField.val('');
    });

    $('div.back-btn').click(function() {
        console.log("click")
        $.changeView("main_menu");
    });

    $('#rooms').on("click", "tr[role=\"button\"]", function () {
        $.joinRoom($(this).data("href"));
    });

    $('#importBtn').click(function () {
        $('#fileInput')[0].click();
    });

    let d_hideGameConfigStatus = function (bool) {
        document.getElementById('loadedGameConfiguration').hidden = bool;
        document.getElementById('unloadGameConfiguration').hidden = bool;
    }

    // Do dom manipulation on storage events
    if (worldInLocalStorage() !== null) {
        document.getElementById('loadedGameConfiguration').textContent = "Map configuration loaded";
        d_hideGameConfigStatus(false);
    }

    // Handles the import button (game world from file) - Vanilla not jQuery
    document.getElementById('fileInput').addEventListener('change', () => {
        const file = document.getElementById('fileInput').files[0];
        const reader = new FileReader();
        reader.onload = event => {
            const result = event.target.result;
            const split = result.split('\n');
            const totalDots = split.length-1;
            let paths = [];
            for (let i = 1; i<split.length; i++) {
                const dots = split[i].split(' ');
                paths.push( {dot1: dots[0], dot2: dots[1]} );
            }
            // ToDo validate it is a valid world
            localStorage.setItem("FileResultDotTotal", String(totalDots));
            localStorage.setItem("FileResultPaths", JSON.stringify(paths));
        }
        reader.readAsText(file);
        document.getElementById('loadedGameConfiguration').textContent = "Map configuration loaded";
        d_hideGameConfigStatus(false);
    });

    $('#unloadGameConfiguration').click(function () {
        localStorage.removeItem('FileResultDotTotal');
        localStorage.removeItem('FileResultPaths');
        d_hideGameConfigStatus(true);
    });


    $('#generateBtn').click(function () {
        console.log("click");
    });

    $('#settingsBtn').click(function () {
        $.openSettingsMenu();
        $.changeView("settings");
    });

    $('#scoreboardBtn').click(function () {
        $.changeView("scoreboard");
        // $("#scoreboardPane").fadeIn(1000);
    });


    $('#quickplayBtn').click(function () {
        socket.emit('quickplay', function (success, id) {
            if (success) {
                console.log("Joining room " + id);
                $.joinRoom(id);
            } else {
                createRoom(true);
            }
        });
    });

    $('#newGameBtn').click(function () {
        createRoom();
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
    //Adds a new chat message to the chatlog
    socket.on('updateChat', function (timestamp, sender, msg) {
        let time = new Date(timestamp).toTimeString().slice(0, 5);
        let sent = `(${time}) ${sender}:`;
        $('#messages > tbody:last-child').append('<tr> <th class="w3-left-align">' + sent + '</th><th class="w3-right-align">' + msg + ' </th></tr>');
    });
});