/**
 *
 * @author Isaac Kogan
 * @github https://github.com/isaackogan
 * @website https://www.isaackogan.com/
 *
 * @credits Key Simulation: https://stackoverflow.com/questions/10455626/keydown-simulation-in-chrome-fires-normally-but-not-the-correct-key
 * @credits UUID Generation: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
 * @credits Numerical Check: https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
 *
 * Description:
 *
 * Ever wanted to automate your Omegle? This library overwrites the Omegle client to add additional functionality such as:
 *      Automated messaging
 *      Human-Simulated Typing to prevent bans
 *      Automated messaging delay configuration
 *      Automated messaging typing speed configuration
 *      Bypass the TOS confirmation
 *      Scrape IP-Addresses from WebRTC
 *      Ip-Lookup from IP-Addresses
 *      Enable/Disable IP-Lookup (In-case you don't want to see it, or need to for streaming or something...)
 *      Auto-Skip Connections
 *      Custom button & alert system interface UI
 *      Automatically connect to the next chat (for text chat- video already can)
 *      Save topics in extension data, set on page-leave and chat-start and synced on page load, EVEN if your cookies are reset!
 *      Custom Dark-Theme with less Omegle stuff and a cleaner look
 */

/** Whether or not the client is paused */
let paused = false;

/** The div to contain the IP grabber info for video chats (referenced globally to allow toggling) */
let ipGrabberDiv;

/**
 * Update page cookies with cache on start
 */
chrome.storage.sync.get(["topicList"],
    (val) => {
        let cachedTopicString = JSON.stringify(val.topicList);
        let cookieTopicString = Cookies.get("topiclist", {domain: ".omegle.com"});

        console.log(`[DEBUG] Cached Topics: ${cachedTopicString} Cookie Topics: ${cookieTopicString}`);

        // If there's a de-sync, fix & re-sync cookies... but ONLY if *our* cache isn't null, a.k.a they stored cookies with us
        if (cachedTopicString !== cookieTopicString && val.topicList !== null && val.topicList !== undefined) {
            Cookies.set("topiclist", cachedTopicString, {domain: ".omegle.com"});
            window.location.reload(true);
        }
    }
);


/** Store their topics when they try to leave the page (for syncing) */
window.addEventListener("beforeunload", function() {
    let cookieTopicString = Cookies.get("topiclist", {domain: ".omegle.com"});
    chrome.storage.sync.set({"topicList": JSON.parse(cookieTopicString)});
}, false);


/** Chromegle Manipulates the Omegle window via jQuery to run actions */
$(document).on('ready', function () {

    // Startup
    let sessionID = uuid4();
    setTimeout(() => document.getElementsByTagName("html")[0].style.visibility = "visible", 400);

    // Create IP-Grabber
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL('/src/injection/rtcscrape.js')
    script.onload = () => {script.remove(); document.dispatchEvent(new CustomEvent('IPScrape'))};
    (document.head || document.documentElement).appendChild(script);

    // Dark-Mode Initializer
    let darkModeEnabled;
    chrome.storage.sync.get({darkMode: settings.defaults.darkModeNotFound}, (result) => {

        // Configure Light/Dark Mode Button
        if (!result.darkMode) {darkModeEnabled = false; darkModeButton.addClass("darkModeButton"); return;}
        darkModeButton.addClass("lightModeButton"); darkModeEnabled = true;

        // We like a darker loading screen
        $("html").css("background-color", "#212121")

        // Inject Dark-Mode Script
        let darkScript = document.createElement('script');
        darkScript.src = chrome.runtime.getURL('/src/injection/darkmode.js')
        darkScript.onload = () => {darkScript.remove(); document.dispatchEvent(new CustomEvent('DarkInject'))};
        (document.head || document.documentElement).appendChild(darkScript);
    });

    // Add the buttons
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("itemBar"); // Add class
    buttonContainer.style.marginLeft = 240 + settings.constants.baseButtonContainerMargin + "px"; // Set position
    [pauseButton, greetingButton, autoSkipButton, darkModeButton].forEach((element) => buttonContainer.appendChild(element.get(0)));

    // Static item replacement
    $("#tagline").html('').append(buttonContainer);  // Add the button container
    $("canvas").replaceWith(homeButton); // Replace the home button
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton); // Replace HK banner with Discord
    $("#mobilesitenote").html(
        "<p>Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> Consider donating to my college fund!</p>"
    );
    $("#sharebuttons").css("display", "none");

    /**
     * Get the current iteration of the logbox and start observing
     */
    const startObserving = () => {

        // Initialize the chat box since we won't have done that yet
        darkModeChatBox();

        // Begin observing
        setTimeout(() => observer.observe(
            document.getElementsByClassName("logbox")[0], {attributes: true, subtree: true, childList: true}), 0
        );
    }

    /**
     * Update the chat-box to dark mode
     */
    const darkModeChatBox = () => {

        if (darkModeEnabled) {

            // Set box colouring & change all text to our grey-white colour
            ['logwrapper', 'chatmsgwrapper', 'disconnectbtnwrapper', 'disconnectbtn','chatmsg', 'sendbtn', "sendbtnwrapper"].forEach((key) => {
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
    }

    /**
     * Observe changes in the log box for dark mode & auto-reconnecting
     */
    const observer = new MutationObserver(function () {
        // Auto-reconnect
        if ($(".newchatbtnwrapper").is(":visible") && !paused) reconnect();
        darkModeChatBox();
    })


    /**
     * Initialize Omegle Chat, Log topic cookies & Bypass Confirmation
     */
    const startFunction = () => {

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

        // Update the stored cookies
        let cookies = Cookies.get("topiclist");
        chrome.storage.sync.set({"topicList": JSON.parse(cookies)});
        console.log('[DEBUG] Updated cached cookies ' + cookies);

        // Replace their logo with a new logo (invalidates their JS so we can run out own functions off the logo button)
        setTimeout(() => {
            let newLogo = document.createElement("h2");
            newLogo.id = "betterLogo";
            let oldLogo = document.getElementById('logo');
            while (oldLogo.childNodes.length > 0) newLogo.appendChild(oldLogo.childNodes[0]);
            oldLogo.replaceWith(newLogo);

        }, 150);

        // Observe logbox changes for auto-skip, etc. etc.
        startObserving();


    }

    // Bind the start buttons to the start function
    ["#textbtn", "#videobtn", "#videobtnunmoderated", "#tryspymodetext.button"].forEach((button) => {
        $(button).on('click', () => startFunction());
    })

    /**
     * Skip to the next chat after X seconds
     */
    const skipFunction = function (skipSeconds) {

        const cachedId = (' ' + sessionID).slice(1); // Make a deep clone of the ID
        if (skipSeconds == null || skipSeconds < 1) return;

        setTimeout(function () {
            if (cachedId !== sessionID || paused) return;
            $(".disconnectbtn", document).trigger("click").trigger("click");
            console.log('[DEBUG] Skipped to the next user');
        }, skipSeconds * 1000);
    }

    /**
     * Write a message by emulating human input
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

        const totalTime = typingDelay(message, wpm);
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
     * Reconnect Function
     */
    function reconnect() {

        $(".disconnectbtn", document).trigger("click");
        sessionID = uuid4();
        chrome.storage.sync.get(
            {
                text: settings.defaults.greetingMessageNotFound,
                delay: settings.defaults.greetingDelayNotFound,
                wpm: settings.defaults.wpmNotFound
            },
            (val) => write(val.text, val.delay, val.wpm)
        );

        // Send if enabled
        chrome.storage.sync.get(
            {skipTime: settings.defaults.skipTimeNotFound},
            (val) => skipFunction(val.skipTime)
        );

        startObserving();

    }

    /**
     * Upon receiving their IP (when connecting to video), get the data and input it to the screen, plus
     * add an advertisement as a bonus for videos for the personal donation link.
     */
    window.addEventListener("getAddress", function (response) {

        // Don't run if paused
        if (paused) return;
        let ip = response["detail"];

        // Get the log list
        let logBoxDiv = document.getElementsByClassName("logitem")[0].parentNode;

        // Create a new log item container
        let logItemDiv = document.createElement("div");
        logItemDiv.classList.add("logitem");

        // Override the "You are now chatting with a stranger" message
        let initialLog = logBoxDiv.children[0];
        initialLog.children[0].innerHTML = "Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source</a>? Consider donating to my college fund!"

        // Create a new div to hold the IP grabber stuff & geolocate
        ipGrabberDiv = document.createElement("div");
        ipGrabberDiv.classList.add("logitem");

        // Get enabled status
        chrome.storage.sync.get(["ipScrape"], (response) => {

            // Get the IP
            asyncGeolocationData(ip, ipGrabberDiv); // Async
            ipGrabberDiv.appendChild(createLogBoxMessage("IP Address: ", ip)); // Add the IP first

            // Conditionally display the data
            if (response.ipScrape) ipToggleButton.html(settings.prompts.enableIPs);
            else {
                ipToggleButton.html(settings.prompts.disableIPs);
                ipGrabberDiv.style.display = "none";
            }

        });

        logBoxDiv.append(ipToggleButton.get(0));
        logBoxDiv.appendChild(ipGrabberDiv);

    });

    /**
     * Asynchronously access geolocation services and append elements to the custom log entry as they come in.
     */
    function asyncGeolocationData(ip, container) {
        const mappingKeys = Object.keys(settings.constants.geolocationJSONMappings); // Key the mappings
        let request = new XMLHttpRequest(); // Make a request

        // When the state changes
        request.onreadystatechange = () => {
            if (!(request.readyState === 4)) return;

            // The request failed
            if (request.status === 403) {
                container.appendChild(createLogBoxMessage("(Geolocation unavailable, hourly limit reached)", ""));
            }

            // The request succeeded
            if (request.status === 200) {
                const geoData = JSON.parse(request.responseText);
                const geoDataKeys = Object.keys(geoData);

                // Iterate through the JSON data received from the API, map the strings
                geoDataKeys.forEach(function(key) {
                    const entry = geoData[key];
                    if (mappingKeys.includes(key) && !((entry == null) || entry === ''))
                        container.appendChild(createLogBoxMessage(settings.constants.geolocationJSONMappings[key] + ": ", entry));
                });

                // Hardcoded -> If there is longitude and latitude included, add that too
                if (geoDataKeys.includes("longitude") && geoDataKeys.includes("latitude")) {
                    container.appendChild(createLogBoxMessage("Longitude/Latitude: ", geoData["longitude"] + " / " + geoData["latitude"]))
                }

            }

        };

        // Open & send the request
        request.open("GET", settings.constants.geolocationEndpoint + ip, true);
        request.send();

    }

});