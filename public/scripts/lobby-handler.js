
$(function () {
    let $msgField = $('#msg');

    function changeView(newView) {
        for (let viewName of viewIDs) {
            $('#' + viewName).addClass('hidden').hide();
        }
        $('#' + newView).removeClass('hidden').show();
    }

    $.joinRoom = function(room) {
        socket.emit('joinRoom', room, function (success) {
            if (success) changeView("gamePane");
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

    // Submit the current chat message
    $('form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('sendChat', $msgField.val());
        $msgField.val('');
        return false;
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
        console.log("click");
    });

    $('#scoreboardBtn').click(function () {
        console.log("click");
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

//TODO Test: file validation
//FIXME: Not able to use back() redirect correctly
function handleFile(files) {
    console.log("hello");
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