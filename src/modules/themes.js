let darkModeEnabled;

$(document).on('ready', function () {

    chrome.storage.sync.get({darkModeEnabled: settings.defaultsNew.darkModeEnabled}, (result) => {

        setTimeout(() => runFetch(), 0);

        // Configure Light/Dark Mode Button
        if (!result.darkModeEnabled) {
            darkModeEnabled = false;
            return;
        }
        darkModeEnabled = true;

        // We like a darker loading screen
        $("html").css("background-color", "#212121")

        // Inject Dark-Mode Script
        let darkScript = document.createElement('script');
        darkScript.src = chrome.runtime.getURL('/src/injection/darkmode.js')
        darkScript.onload = () => {darkScript.remove(); document.dispatchEvent(new CustomEvent('DarkInject'))};
        (document.head || document.documentElement).appendChild(darkScript);

        // Add handling for spymode button >> IN DARK MODE <<
        $("#spymodebtn").on('click', () => {
            let trySpyModeText = document.getElementById("tryspymodetext");
            trySpyModeText.style.backgroundColor = "#212121";
            setTimeout(() => trySpyModeText.style.marginTop = "40px", 10)
        });

        $(".settingsCollapsableItem")
            .css("background", "#444444")

        $(".settingsModal")
            .css("background", "#323232")
            .css("border", "none")
            .css("box-shadow", "none")

    });

});

