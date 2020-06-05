const RESOLUTIONS = [
    {res_x : 1024, res_y:576},
    {res_x : 1152, res_y:648},
    {res_x : 1280, res_y:720},
    {res_x : 1366, res_y:768},
    {res_x : 1600, res_y:900},
    {res_x : 1920, res_y:1080},
    {res_x : 2560, res_y:1440},
    {res_x : 3840, res_y:2160 },
];

/*
window.onload = function () {
    // Webstorm does not recognize but it does call webelements.js functions correctly
    loadValuesToForm();

    let resolution_select = document.getElementById("resolution-dropdown-select");
    for(let elem of RESOLUTIONS) {
        let option = document.createElement("OPTION");
        option.innerText = elem.res_x + "x" + elem.res_y;
        option.setAttribute("value",elem.res_x + "x" + elem.res_y);
        resolution_select.appendChild(option);
    }
};
*/
