const currentTheme = localStorage.getItem("theme");
if (currentTheme == "dark") {
    toggleDarkMode();
}

function toggleDarkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");

    var theme = "light";
    if (element.classList.contains("dark-mode")) {
        theme = "dark";
    }
    localStorage.setItem("theme", theme);
}
