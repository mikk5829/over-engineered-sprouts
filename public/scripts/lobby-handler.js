//const cookieParser = require("cookie-parser");
// import {worldInLocalStorage} from "./modules/Utility.js";


$(function () {
    $.disableOverlay();
    let $msgField = $('#chatMsgField');

    $.joinRoom = function (roomId) {
        socket.emit('joinRoom', roomId, function (success, num) {
            if (success) {
                if (paper.project) paper.project.activeLayer.removeChildren();
                $.changeView("game");
                playerNum = num;
                $.enableOverlay("Waiting for game to start");
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
        let tDots = localStorage.getItem("FileResultDotTotal");
        let tPaths = localStorage.getItem("FileResultPaths");
        if (tDots !== null && tPaths !== null) {
            return {dots: JSON.parse(tDots), paths: JSON.parse(tPaths)};
        } else {
            return null;
        }
    });

    // Handles the import button (game world from file) - Vanilla not jQuery
    document.getElementById('fileInput').addEventListener('change', () => {
        console.log("changed")

        const file = document.getElementById('fileInput').files[0];
        const reader = new FileReader();
        reader.onload = event => {
            const result = event.target.result;
            const split = result.split('\n');
            const totalDots = Number(split[0]);
            let paths = [];
            for (let i = 1; i < split.length-1; i++) {
                const dots = split[i].split(' ');
                paths.push({dot1: Number(dots[0]), dot2: Number(dots[1])});
            }
            // ToDo validate it is a valid world
            localStorage.setItem("FileResultDotTotal", String(totalDots));
            localStorage.setItem("FileResultPaths", JSON.stringify(paths));
            console.log("POINTS", localStorage.getItem("FileResultDotTotal"));
            console.log("PATHS", localStorage.getItem("FileResultPaths"))
            // if (points,paths).isvalid:
            // socket.emit("joinSimulation", numPoints, fn...)
            // then the server makes a gameroom and says fn(true)

            // for move in PATHS:
            // if gameroom.possiblemove(move.dot1, move.dot2):
            // socket.emit("drawpath",move.dot1,move.dot2) (user has to draw it with A*)
            // else: socket.emit("pathfailed"

            socket.emit("joinSimulation", totalDots, function(success, initialPoints) {
                if (success) {
                    $.changeView("game");
                    $.startSimulation(initialPoints);
                    // changeview to game
                    // draw the points
                    // then submit one move at a time from the paths list above
                    // and if server says (y) then draw it automatically using A*
                    // If server says nope then show an alert saying it wasn't possible
                    // Or alert that the file is invalid or something
                }
            })
        };
        reader.readAsText(file);
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

        /*$('#scores>tbody').empty();
        let results = [{name: 'Laura', wins: '3', losses: '1'},
            {name: 'Laura1', wins: '3', losses: '1'},
            {name: 'Laura2', wins: '3', losses: '1'},
            {name: 'Laura3', wins: '3', losses: '1'},
            {name: 'Laura4', wins: '3', losses: '1'},
            {name: 'Laura5', wins: '3', losses: '1'},
            {name: 'Laura6', wins: '3', losses: '1'},
            {name: 'Laura7', wins: '3', losses: '1'},
            {name: 'Laura8', wins: '3', losses: '1'},
            {name: 'Laura9', wins: '3', losses: '1'},
            {name: 'Laura10', wins: '3', losses: '1'},
            {name: 'Laura11', wins: '3', losses: '1'},
            {name: 'Laura12', wins: '3', losses: '1'},
            {name: 'Laura13', wins: '3', losses: '1'},
            {name: 'Laura14', wins: '3', losses: '1'},
            {name: 'Laura15', wins: '3', losses: '1'},
            {name: 'Laura16', wins: '3', losses: '1'},
            {name: 'Laura17', wins: '3', losses: '1'},
            {name: 'Laura18', wins: '3', losses: '1'},
            {name: 'Laura19', wins: '3', losses: '1'}];

        for (let result of results) {
            let name = result.name;
            let wins = result.wins;
            let losses = result.losses;
            $('#scores > tbody:last-child').append(`<tr class="w3-hover-pale-green w3-hover-text-green"> <th class="w3-left-align"> ${name} </th> <th class="w3-center-align"> ${wins} </th> <th class="w3-center-align"> ${losses} </th></tr>`);
        }*/

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
