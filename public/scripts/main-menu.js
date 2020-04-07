var socket = io.connect('http://localhost:3000');

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function () {
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    //socket.emit('adduser', prompt("What's your name?"));
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

    // When you click on a row in the list of games
    $('#games tr').click(function() {
        var href = $(this).find("a").attr("href");
        if(href) {
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

function toggleHiding() {
    let div = document.getElementById("test");
    if (div.style.display === "none") {
        div.style.display = "inline-grid"
    } else {
        div.style.display = "none"
    }
}

//ToDo Test: file validation
//ToDo Fix: Not able to use back() redirect correctly
function handleFile(files) {
    const file = files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function(e) {
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

window.onload = function() {
    const import_button = document.getElementById('import-button');
    const import_hidden = document.getElementById('world-file-input');

    import_button.addEventListener('click', function(e) {
        import_hidden.click();
    }, false);
};
