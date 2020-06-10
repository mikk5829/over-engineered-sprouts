
$(function () {
    let $msgField = $('#chatMsgField');

    $.joinRoom = function(room) {
        socket.emit('joinRoom', room, function (success) {
            if (success) {
                $.changeView("game");
            }
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
        console.log("click");
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
            let capacity = `${room.playerCount}/${room.maxCapacity}`;
            let name = room.id;
            $('#rooms > tbody:last-child').append(`<tr data-href=${name} role="button" class="w3-hover-pale-green w3-hover-text-green"> <th class="w3-left-align"> ${name} </th><th class="w3-right-align"> ${capacity} </th></tr>`);
        }
    });
});

//TODO Test: file validation
//FIXME: Not able to use back() redirect correctly
function handleFile(files) {
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function (e) {
        console.log(e);
        let split = e.target.result.split("\n");
        let init_points = split[0];
        let action_list = [];
        for (let i = 1; i < split.length; i++) {
            action_list.push(split[i]);
        }
        const sproutUpload = {
            init_points: init_points,
            action_list: action_list
        };
        console.log(sproutUpload);
        localStorage.setItem("loaded-game", JSON.stringify(sproutUpload));

        // TODO: Create new room and join it
        // $.joinRoom('fhg');
    };
}