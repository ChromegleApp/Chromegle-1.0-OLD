
// Change the text greeting
const greetingButton = $("<button class='greetingButton'></button>");


// Open the settings modal
const settingsButton = $("<button class='settingsButton'></button>")
    .on('click', () => {
        toggleSettingsModal();
    });


// Join the discord (home page ad)
const discordButton = $("<button class='customDiscordBanner'></button>")
    .on('click', function () {window.open(settings.constants.discordInviteURL);});


// Show the IP (video chat button)
const ipToggleButton = $("<button class='ipLookupButton' style='margin-bottom: 8px; margin-top: 6px;'></button>")
    // Bind the click action to a new function
    .on('click', () => chrome.storage.sync.get(["ipScrape"], (val) => {
        let enabled = val.ipScrape || settings.defaults.ipScrapeEnabledNotFound;
        ipGrabberDiv.style.display = enabled ? "none" : ""

        if (enabled) {
            ipToggleButton.get(0).classList.add("lookupActive");
            ipToggleButton.html(settings.prompts.disableIPs);
        } else {
            ipToggleButton.html(settings.prompts.enableIPs);
            ipToggleButton.get(0).classList.remove("lookupActive");
        }

        chrome.storage.sync.set({"ipScrape": !enabled});
    }));


// Home button (all pages, header banner logo)
const homeButton = $("<button class='homeButton'></button>")
    .on('click', function () {
        // Only reload in the chat window (don't allow reloading on the main page)
        if (document.getElementById("intro") === null) window.location.reload(true);

    });

