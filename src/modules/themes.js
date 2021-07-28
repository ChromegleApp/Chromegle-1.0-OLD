let darkModeEnabled;

$(document).on('ChromegleInit', function () {

    chrome.storage.sync.get({darkModeEnabled: settings.defaultsNew.darkModeEnabled}, (result) => {

        setTimeout(() => fetchOnlineUsers(), 0);

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


/**
 * Update the chat-box to dark mode
 */
const darkModeChatBox = () => {

    if (darkModeEnabled) {

        // Set box colouring & change all text to our grey-white colour
        [
            'logwrapper',
            'chatmsgwrapper',
            'disconnectbtnwrapper',
            'disconnectbtn',
            'chatmsg',
            'sendbtn',
            "sendbtnwrapper",
            "lowergaybtnwrapper",
            "lowersexybtnwrapper",
            "lowergaybtn",
            "lowersexybtn"

        ].forEach((key) => {
            let element = document.getElementsByClassName(key)[0];
            if (element === undefined) return;
            element.style.border = 'none';
            element.style.color = '#d1d1d1';
            element.style.background = '#292a2d'
        })

        // Status log messages
        let logMessages = document.getElementsByClassName("statuslog");
        for (let i = 0; i < logMessages.length ; i++) {
            let item = logMessages.item(i);
            if (item == null) continue;
            item.style.color = '#d1d1d1'
        }

    }

    // Change question text to match theme
    ["questionText", "questionHeading"].forEach((item) => {
        let element = document.getElementsByClassName(item)[0];
        if (element === undefined) return;

        element.style.color = '#292a2d'

    })

}