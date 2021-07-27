
// Change the text greeting
const greetingButton = $("<button class='greetingButton'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        chrome.storage.sync.get(["text", "delay", "wpm"], function (val) {

            let newGreeting = prompt(
                settings.prompts.greetingMessage,
                (val.text === undefined || val.text == null) ? settings.defaults.greetingMessageNotFound : val.text
            );

            if (newGreeting !== null) {
                chrome.storage.sync.set({text: newGreeting});
            }

        });
    });


// Open the settings modal
const settingsButton = $("<button class='settingsButton'></button>")
    .on('click', () => {
        toggleSettingsModal();
    });


// Join the discord (home page ad)
const discordButton = $("<button class='customDiscordBanner'></button>")
    .on('click', function () {window.open(settings.constants.discordInviteURL);});



/*
Prevent element showing after certian point

$(window).on('resize', function() {
    if ($(this).width() < 1024) {

        $(discordWidget).hide();

    } else {

        $(discordWidget).show();

    }

});
 */




// Show the IP (video chat button)
const ipToggleButton = $("<button style='margin-bottom: 8px'></button>")
    // Bind the click action to a new function
    .on('click', () => chrome.storage.sync.get(["ipScrape"], (val) => {
        let enabled = val.ipScrape || settings.defaults.ipScrapeEnabledNotFound;
        ipGrabberDiv.style.display = enabled ? "none" : ""
        ipToggleButton.html(enabled ? settings.prompts.disableIPs : settings.prompts.enableIPs);
        chrome.storage.sync.set({"ipScrape": !enabled});
    }));


// Home button (all pages, header banner logo)
const homeButton = $("<button class='homeButton'></button>")
    .on('click', function () {
        // Only reload in the chat window (don't allow reloading on the main page)
        if (document.getElementById("intro") === null) window.location.reload(true);

    });

