
/*
Key Simulation
Via https://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key
 */

/** Whether or not the client is paused */
let paused = false;

/**
 * Chromegle Manipulates the Omegle window via jQuery to run actions
 */
$(document).on('ready', function () {

    let sessionID = calculateUUID();

    /**
     *
     * Timer Skip Function
     *
     * Actions:
     *      Skip to the next chat after a time
     *
     */
    const skipFunction = function (skipSeconds) {

        const cachedId = (' ' + sessionID).slice(1);

        if (skipSeconds == null || skipSeconds <= 0) {
            return;
        }

        let skipMillis = skipSeconds * 1000;
        setTimeout(function () {

            // Must match
            if (cachedId !== sessionID || paused)
                return;

            $(".disconnectbtn", document).trigger("click").trigger("click");

            console.log('[DEBUG] Skipped to the next user');

        }, skipMillis);

    }

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
            $(this).toggleClass('unpauseButton').toggleClass('pauseButton')

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
                    val["text"] || settings.defaults.greetingMessage
                );

                // New Delay
                let newDelay = prompt(
                    settings.prompts.greetingDelay,
                    val["delay"] || settings.defaults.greetingDelay  // TODO only accept number values
                );

                // New WPM
                let newWPM = prompt(
                    settings.prompts.wpmSpeed,
                    val["wpm"] || settings.defaults.wpmSpeed
                );

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

                // Get the greeting
                let newSkipTime = prompt(
                    settings.prompts.skipTime, val["skipTime"] || settings.defaults.skipTime
                );

                // Set the skip time if valid
                if (newSkipTime != null) {
                    chrome.storage.sync.set({"skipTime": newSkipTime});
                }

            });
        });

    // Add the buttons to the screen
    $("#tagline").html('').prepend(pauseButton).append(greetingButton).append(autoSkipButton);

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

    // Replace the HK banner with ours (lol)
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton);

    $("#mobilesitenote").html(
        "<p>Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source</a>? Consider donating to my college fund!</p>"
    ); //https://www.buymeacoffee.com/isaackogan

    /*
    Skip the confirmation menu & send the initial message
     */
    const startFunction = function start() {

        // Click the checkboxes
        $("input[type=checkbox]:not(:checked)").trigger("click");

        // Confirm join
        $("input[type=button][value='Confirm & continue']").trigger("click");

        // Send if enabled
        chrome.storage.sync.get(
            {
                text: settings.defaults.greetingMessageNotFound,
                delay: settings.defaults.greetingDelayNotFound,
                wpm: settings.defaults.wpmNotFound,
                skipTime: settings.defaults.skipTimeNotFound,
            },
            (val) => {

                write(val.text, val.delay, val.wpm);
                skipFunction(val.skipTime);

            }
        );

    }

    // Bind the start function to the text & video buttons
    $("#textbtn").on('click', startFunction);
    $("#videobtn").on('click', startFunction);

    /**
     *
     * Write GIVEN message function
     *
     * Actions:
     *      Check if the chat-box is enabled and if it isn't, call itself
     *      Write a message to the screen when the chat-box is enabled
     *
     */
    function write(message, delay, wpm) {

        let sendButton = $(".sendbtn", document);

        // Recursively call self until it isn't disabled
        if (sendButton.is(":disabled")) {
            return setTimeout(() =>  write(message, delay, wpm), 250);
        }

        let chatMessage = $(".chatmsg", document);
        let DOMChatMessage = chatMessage.get(0);

        // If the message is null OR undefined, OR not long enough, return.
        if (message == null || message.length <= 0) return;

        const totalTime = calculateTypingDelay(message, wpm);
        const timePerMessage = totalTime / message.length;
        let count = 0;
        const cachedId = (' ' + sessionID).slice(1);

        console.log(`[DEBUG] Message: ${message} | Delay: ${delay} | WPM: ${wpm} | Time-Until-Send: ${totalTime / 1000}s | Chat-UUID: ${cachedId}`)

        // Write each key letter
        for (let letter of message) {

            count++;
            let timeForMessage = timePerMessage * count;

            setTimeout(function () {

                // Must match the cache
                if (cachedId !== sessionID)
                    return;

                chatMessage.val(chatMessage.val() + letter);

                // Create keydown event
                let keydown = document.createEvent('KeyboardEvent');
                keydown.initKeyboardEvent(
                    "keydown", true, true, DOMChatMessage.defaultView, false, false, false, false, letter, letter
                );

                // Create key up event
                let keyup = document.createEvent('KeyboardEvent');
                keyup.initKeyboardEvent(
                    "keyup", true, true, DOMChatMessage.defaultView, false, false, false, false, letter, letter
                );

                // Fire the events
                DOMChatMessage.dispatchEvent(keydown);
                DOMChatMessage.dispatchEvent(keyup);

            }, timeForMessage);

        }

        // Send the message
        setTimeout(
            () =>  {

                // Cached ID must match
                if (cachedId !== sessionID)
                    return;

                sendButton.trigger('click')

            },
            totalTime + 50 + ((delay || settings.defaults.greetingDelayNotFound) * 1000)
        );

    }

    /**
     *
     * Write SAVED message function
     *
     * Actions:
     *      Get the current saved message or go to the default value(s)
     *      Run the GIVEN write message function to write the message
     *
     */
    const writeText = function () {
        chrome.storage.sync.get(
            {
                text: settings.defaults.greetingMessageNotFound,
                delay: settings.defaults.greetingDelayNotFound,
                wpm: settings.defaults.wpmNotFound
            },
            (val) => write(val.text, val.delay, val.wpm)
        );
    }

    /**
     * Auto-Reconnect Trigger Function
     *
     * Actions:
     *      When the chat ends, automatically run the reconnect script
     *
     */
    const observer = new MutationObserver(function () {
        if ($(".newchatbtnwrapper").is(":visible") && !paused) {
            reconnect();
        }
    })

    // Enable observation of page mutation for auto-reconnect
    observer.observe(document, {attributes: true, subtree: true})

    /**
     * Reconnect Function
     *
     * Actions:
     *      Click the disconnect button to automatically re-connect
     *      Send the initial message again
     *
     */
    function reconnect() {

        $(".disconnectbtn", document).trigger("click");
        sessionID = calculateUUID();
        writeText();

        // Send if enabled
        chrome.storage.sync.get(
            {skipTime: settings.defaults.skipTimeNotFound},
            (val) => skipFunction(val.skipTime)
        );

    }

});