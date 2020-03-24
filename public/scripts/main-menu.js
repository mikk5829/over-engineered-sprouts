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
