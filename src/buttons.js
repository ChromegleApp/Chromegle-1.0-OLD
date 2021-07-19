/**
 *
 * Utility file containing all of the program's buttons
 *
 */

/**
 *
 * Custom Pause Button
 *
 * Actions:
 *      Pause the Omegle Client
 *      Resume the Omegle Client
 */
const pauseButton = $("<button></button>")
    .addClass('unpauseButton')
    .addClass('pauseButton')
    .toggleClass('unpauseButton')

    .bind('click', function () {
        paused = !paused;
        $(this).toggleClass('unpauseButton').toggleClass('pauseButton');

    });

/**
 *
 * Custom Greeting Button
 *
 * Actions:
 *      Set a custom auto-message
 *      Set a custom auto-message delay
 *      Set a typing speed words-per-minute
 */
const greetingButton = $("<button class='greetingButton'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        chrome.storage.sync.get(["text", "delay", "wpm"], function (val) {

            // New Greeting
            let newGreeting = prompt(
                settings.prompts.greetingMessage,
                (val["text"] || val["text"] === 0) || settings.defaults.greetingMessage
            );

            // New Delay
            let newDelay = prompt(
                settings.prompts.greetingDelay,
                (!(val["delay"]) && val["delay"] !== 0) ? settings.defaults.greetingDelay : val["delay"]
            );

            if (!isNumeric(newDelay)) newDelay = 0;

            // New WPM
            let newWPM = prompt(
                settings.prompts.wpmSpeed,
                (!(val["wpm"]) && val["wpm"] !== 0) ? settings.defaults.wpmSpeed : val["wpm"]
            );

            if (!isNumeric(newWPM)) newWPM = 0;

            // Null -> Ignore Input
            newGreeting = newGreeting === null ? val["text"] : newGreeting;
            newDelay = newDelay == null ? val["delay"] : newDelay;
            newWPM = newWPM == null ? val["wpm"] : newWPM;

            chrome.storage.sync.set(
                {"text": newGreeting, "delay": newDelay, "wpm": newWPM}
            );

        });
    });

/**
 *
 * Custom Auto-Skip Button
 *
 * Actions:
 *      Set how fast to skip after you connect
 *
 */
const autoSkipButton = $("<button class='autoSkipButton'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        chrome.storage.sync.get("skipTime", function (val) {

            if (!(val["skipTime"]) && val["skipTime"] !== 0) {
                val["skipTime"] = settings.defaults.skipTime;
            }


            // Get the greeting
            let newSkipTime = prompt(
                settings.prompts.skipTime, val["skipTime"]
            );

            // Parse edge-cases
            if (isNumeric(newSkipTime)) {
                if ((newSkipTime > 0 && newSkipTime < 1))
                    newSkipTime = settings.constants.skipTimeMinimumValue; // Min valid
                if (newSkipTime < 0) newSkipTime = settings.defaults.skipTimeNotFound // Disable It
            } else {
                // Covers empty entries, non-integer entries
                newSkipTime = settings.defaults.skipTimeNotFound;
            }
            chrome.storage.sync.set({"skipTime": newSkipTime});

        });
    });


/**
 * A button to promote the Discord
 *
 * Actions:
 *      Click to join the Discord
 *
 */
const discordButton = $("<button class='customDiscordBanner'></button>")

    // Bind the click action to a new function
    .on('click', function () {

        window.open(settings.constants.discordInviteURL);

    });

/**
 *
 * IP Toggle Button
 *
 */
const ipToggleButton = $("<button style='margin-bottom: 8px'></button>")
    // Bind the click action to a new function
    .on('click', () => chrome.storage.sync.get(["ipScrape"], (val) => {
        let enabled = val.ipScrape || settings.defaults.ipScrapeEnabledNotFound;

        ipGrabberDiv.style.display = enabled ? "none" : "" // Hide/Display IP Data
        ipToggleButton.html(enabled ? settings.prompts.disableIPs : settings.prompts.enableIPs);

        chrome.storage.sync.set({"ipScrape": !enabled});
    }));


/**
 *
 * Custom home button
 *
 */
const homeButton = $("<button class='homeButton'></button>")
    // Bind the click action to a new function
    .on('click', function () {
        document.location.href = "";
    });

