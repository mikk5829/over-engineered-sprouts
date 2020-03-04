function toggleHiding() {
    let div = document.getElementById("test");
    if (div.style.display === "none") {
        div.style.display = "inline-grid"
    } else {
        div.style.display = "none"
    }
}