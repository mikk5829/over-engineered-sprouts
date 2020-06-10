//const cookieParser = require("cookie-parser");

$(function () {
    let $msgField = $('#chatMsgField');

    $.joinRoom = function(room) {
        socket.emit('joinRoom', room, function (success) {
            if (success) $.changeView("game");
            else alert("Failed to join room " + room);
        });
    };

    function createRoom(join = false) {
        socket.emit('addRoom', prompt("Name of new room"), function (success, room = "") {
            if (success) {
                console.log("Added new room" + room);
                if (join) $.joinRoom(room);
            } else alert("Failed to add room");
        });
    }

    $("#chatMsgForm").submit(function(e) {
        e.preventDefault();
        socket.emit('sendChat', $msgField.val());
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
        document.getElementById('infoBoxP').innerText = "Loaded new map. Click generate!";
        document.getElementById('infoBox').style.display = "inline"
    });

    $('#generateBtn').click(function () {
        console.log("click");
    });

    $('#settingsBtn').click(function () {
        $.changeView("settings");
    });

    $('#scoreboardBtn').click(function () {
        $.changeView("scoreboard");
        // $("#scoreboardPane").fadeIn(1000);
    });


    $('#quickplayBtn').click(function () {
        socket.emit('quickplay', function (success, room) {
            if (success) {
                console.log("Joining room " + room);
                $.joinRoom(room);
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
            let capacity = `${room.currentPlayers}/${room.maxCapacity}`;
            let name = room.id;
            $('#rooms > tbody:last-child').append(`<tr data-href=${name} role="button" class="w3-hover-pale-green w3-hover-text-green"> <th class="w3-left-align"> ${name} </th><th class="w3-right-align"> ${capacity} </th></tr>`);
        }
    });


    //Adds a new chat message to the chatlog
    socket.on('updateChat', function (timestamp, sender, msg) {
        let time = new Date(timestamp).toTimeString().slice(0, 5);
        let sent = `(${time}) ${sender}:`;
        $('#messages > tbody:last-child').append('<tr> <th class="w3-left-align">' + sent + '</th><th class="w3-right-align">' + msg + ' </th></tr>');
    });
});