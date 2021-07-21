/**
 *
 * Custom Pause Button
 *
 */
const pauseButton = $("<button></button>")
    .addClass('unpauseButton')
    .addClass('pauseButton')
    .toggleClass('unpauseButton')

    .on('click', function () {
        paused = !paused;
        $(this).toggleClass('unpauseButton').toggleClass('pauseButton');

    });

/**
 *
 * Greeting / Delay / WPM Editor
 *
 */
const greetingButton = $("<button class='greetingButton'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        chrome.storage.sync.get(["text", "delay", "wpm"], function (val) {

            /*
            Get the response
             */

            let newGreeting = prompt(settings.prompts.greetingMessage,
                (val.text === undefined || val.text == null) ? settings.defaults.greetingMessageNotFound : val.text);
            let newWPM = prompt(settings.prompts.wpmSpeed,
                (val.wpm === undefined || val.wpm == null) ? settings.defaults.wpmNotFound : val.wpm);
            let newDelay = prompt(settings.prompts.greetingDelay,
                (val.delay === undefined || val.delay == null) ? settings.defaults.greetingDelayNotFound : val.delay);

            let changes = {}

            /*
            Validate the response
             */

            if (newGreeting !== null) {
                changes["text"] = newGreeting;
            }

            if (newWPM !== null && isNumeric(newWPM)) {
                if (newWPM < 0) newWPM = 0;
                if (newWPM > 1000) newWPM = 1000;
                changes["wpm"] = newWPM;
            }

            if (newDelay !== null && isNumeric(newDelay)) {
                if (newDelay < 0) newDelay = 0;
                if (newDelay > 1000) newDelay = 1000;
                changes["delay"] = newDelay;

            }

            // Update whichever choices got filled
            console.log(changes);
            chrome.storage.sync.set(changes);

        });
    });

/**
 *
 * AutoSkip delay editor
 *
 */
const autoSkipButton = $("<button class='autoSkipButton'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        chrome.storage.sync.get("skipTime", function (val) {

            // Get the new skip time
            let newSkipTime = prompt(settings.prompts.skipTime,
                (val.skipTime === undefined || val.skipTime == null) ? settings.defaults.skipTime : val.skipTime);

            // If there's a valid input
            if (newSkipTime !== null && isNumeric(newSkipTime)) {

                // Clamp values to 0, or greater than 3
                if (newSkipTime < 0) newSkipTime = 0;
                else if (newSkipTime > 0 && newSkipTime < 3) newSkipTime = 3;

                chrome.storage.sync.set({"skipTime": newSkipTime});

            }

        });
    });

/**
 *
 * Dark-Mode Toggle Button
 *
 */
const darkModeButton = $("<button></button>")

    .on('click', function () {

        chrome.storage.sync.get(["darkMode"], (result) => {
            let darkEnabled;

            // Do the opposite of the default since they're clicking (therefore SWITCHING FROM the default)
            if (result.darkMode == null) darkEnabled = !settings.defaults.darkModeNotFound;
            else darkEnabled = !result.darkMode;

            console.log('[DEBUG] Dark mode enabled: ' + darkEnabled);
            chrome.storage.sync.set({darkMode: darkEnabled})

            window.location.reload(true);
            console.log('l')

        });

    });

/**
 *
 * A button to promote the Discord
 *
 */
const discordButton = $("<button class='customDiscordBanner'></button>")
    .on('click', function () {window.open(settings.constants.discordInviteURL);});

/**
 *
 * Button to toggle showing IP details in video chats
 *
 */
const ipToggleButton = $("<button style='margin-bottom: 8px'></button>")
    // Bind the click action to a new function
    .on('click', () => chrome.storage.sync.get(["ipScrape"], (val) => {
        let enabled = val.ipScrape || settings.defaults.ipScrapeEnabledNotFound;
        ipGrabberDiv.style.display = enabled ? "none" : ""
        ipToggleButton.html(enabled ? settings.prompts.disableIPs : settings.prompts.enableIPs);
        chrome.storage.sync.set({"ipScrape": !enabled});
    }));


/**
 *
 * Custom Home button
 *
 */
const homeButton = $("<button class='homeButton'></button>")
    .on('click', function () {
        // Only reload in the chat window (don't allow reloading on the main page)
        if (document.getElementById("intro") === null) window.location.reload(true);

    });

