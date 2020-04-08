var socket = io.connect('http://localhost:3000');
let username;

// Connect to server and receive a random guest username
socket.on('connect', function () {
    // TODO: get username from cookies
    socket.emit('adduser', function (response) {
        username = response;
        console.log("Joined as",username);
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

function joinRoom(room) {
    // window.location = $(this).data("href");
    socket.emit('joinroom',room, function(url) {
        window.location = url;
    });

}

// on load of page
$(function () {
    ($('#rooms')).on("click", "tr[role=\"button\"]", function (e) {
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
            // e.preventDefault();
        });
    });

    // When you click on a row in the list of games
    $('#rooms tr').click(function () {
        var href = $(this).find("a").attr("href");
        if (href) {
            window.location = href;
        }
    });

    // when the client clicks SEND
    $('#datasend').click(function () {
        var message = $('#data').val();
        $('#data').val('');
        // tell server to execute 'sendchat' and send along one parameter
        socket.emit('sendchat', message);
    });

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function (e) {
        if (e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
        }
    });
});

//ToDo Test: file validation
//ToDo Fix: Not able to use back() redirect correctly
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
        window.location.replace("/game");
    };
}

// window.onload = function () {
//     // const importBtn = document.getElementById('importBtn');
//     // const importHidden = document.getElementById('world-file-input');
//
//     /*importBtn.addEventListener('click', function (e) {
//         importHidden.click();
//     }, false);
// */
//
//     for (let i = 1; i < 15; i++) {
//         let name = "room" + i;
//         $('#games > tbody:last-child').append('<tr role="button" data-href="google.com" class="w3-hover-pale-green w3-hover-text-green">' +
//             '<th class="w3-left-align">' + name + '</th><th class="w3-right-align"> 1/2 </th></tr>');
//     }
//
//     console.log($("#games").id);
// };
