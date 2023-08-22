function changeDisplayMode() {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
        document.documentElement.setAttribute("data-theme", "light");
        document.getElementById("displaySwitch").innerHTML = "🌞"
    }
    else if (document.documentElement.getAttribute("data-theme") === "light") {
        document.documentElement.setAttribute("data-theme", "dark");
        document.getElementById("displaySwitch").innerHTML = "🌙"
    }
}