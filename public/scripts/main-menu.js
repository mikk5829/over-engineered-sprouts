var socket = io.connect('http://localhost:3000');

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function () {
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    // socket.emit('adduser', prompt("What's your name?"));
    socket.emit('joinserver');
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    //$('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('updaterooms', function (rooms, current_room) {
    $('#rooms').empty();
    $.each(rooms, function (key, value) {
        if (value === current_room) {
            $('#rooms').append('<div>' + value + '</div>');
        } else {
            $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
        }
    });
});

function switchRoom(room) {
    socket.emit('switchRoom', room);
}

// on load of page
$(function () {
    ($('#games')).on("click", "tr[role=\"button\"]", function (e) {
        // window.location = $(this).data("href");
        console.log($(this).data("href"));
    });

    for (let i = 1; i < 15; i++) {
        let name = "room" + i;
        $('#games > tbody:last-child').append('<tr role="button" data-href="google.com" class="w3-hover-pale-green w3-hover-text-green">' +
            '<th class="w3-left-align">' + name + '</th><th class="w3-right-align"> 1/2 </th></tr>');
    }


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

    $('#quickplayBtn').click(function () {
        console.log("click");
    });

    // When you click on a row in the list of games
    $('#games tr').click(function () {
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
