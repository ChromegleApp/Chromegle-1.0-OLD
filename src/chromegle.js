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
 */

/** Whether or not the client is paused */
let paused = false;

/** The div to contain the IP grabber info for video chats (referenced globally to allow toggling) */
let ipGrabberDiv;

/**
 *
 * Set cached cookies every time.
 *
 * Actions:
 *      Check the page. If the cached topics don't match the sync ones, set them and reload the page.
 *
 */
chrome.storage.sync.get(["topicList"],
    (val) => {
        let cachedTopicString = JSON.stringify(val.topicList);
        let cookieTopicString = Cookies.get("topiclist", {domain: ".omegle.com"});
        console.log(`[DEBUG] Sync Topics: ${cachedTopicString} Cookie Topics: ${cookieTopicString}`);

        // Ensure cookies are always there!
        if (cachedTopicString !== cookieTopicString) {
            Cookies.set("topiclist", cachedTopicString, {domain: ".omegle.com"});
            window.location.reload(false);
        }

    }
);

/**
 *
 * Update the sync cookies before page exit
 *
 */
window.addEventListener("beforeunload", function() {
    let cookieTopicString = Cookies.get("topiclist", {domain: ".omegle.com"});
    chrome.storage.sync.set({"topicList": JSON.parse(cookieTopicString)});
}, false);

/** Chromegle Manipulates the Omegle window via jQuery to run actions */
$(document).on('ready', function () {

    // Show the page
    document.getElementsByTagName("html")[0].style.visibility = "visible";

    /** Generate the initial session ID for chat usage */
    let sessionID = calculateUUID();

    /**
     *
     * IP Grabber Script
     *
     * Actions:
     *      Create and inject the IP grabbing script into the document
     *
     */
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL('/src/rtcscrape.js')
    script.onload = () => {
        script.remove();
        document.dispatchEvent(new CustomEvent('IPScrape'));
    };
    (document.head || document.documentElement).appendChild(script);

    /**
     *
     * Button Container
     *
     * Actions:
     *      Add the buttons to their own immovable DIV container, and add that to the screen dynamically.
     *      Set the position of the button container
     *
     */
    let buttonContainer = document.createElement("div");
    let o1 = $("img[src$='static/logomasked@2x.png']");
    let o2 = $("img[src$='static/logomasked.png']").addClass("betterBanner");


    buttonContainer.classList.add("itemBar"); // Add class
    buttonContainer.style.marginLeft = o1.width() || o2.width() + settings.constants.baseButtonContainerMargin + "px"; // Set position

    // Add buttons to container
    buttonContainer.appendChild(pauseButton.get(0));
    buttonContainer.appendChild(greetingButton.get(0));
    buttonContainer.appendChild(autoSkipButton.get(0));

    // Add the container to the page
    $("#tagline").html('').append(buttonContainer);

    /**
     * Add Discord Server Advert
     *
     * Actions:
     *      Advertise the discord server with a discord button
     *
     */
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton);

    /**
     * Add a donation advert
     *
     * Actions:
     *      Replace the mobile side-note with a donation advert
     *
     */
    $("#mobilesitenote").html(
        "<p>Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source</a>? Consider donating to my college fund!</p>"
    );

    const betterLogo = () => {
        $("canvas").replaceWith(homeButton);
    }

    const darkTest = () => {
        betterLogo();

        const mappings = {
            a: {
                color: '#00aff4',
                textDecoration: 'none'
            },
            body: {
                background: '#212121'
            },
            "#intro": {
                background: '#292a2d',
                border: "25px solid #292a2d",
                "-webkit-box-shadow": 'none',
                marginTop: "60px",
                color: '#bcbcbc'
            },
            "#mobilesitenote": {
                color: '#bcbcbc'
            },
            ".topictageditor": {
                color: 'white',
                background: '#212121',
                "border-radius": "12px",
                paddingTop: "10px",
                border: "3px solid #bcbcbc",
                "margin-bottom": "29px",
            },
            "#intoheader": {
                color: "#bcbcbc",
            },
            "#intoheadercell": {
                "appendHTML": "<br>",
                "prependHTML": "<br>"
            },
            "#startachatcell": {
                "appendHTML": "<br>",
                "prependHTML": "<br>"
            },
            "input.newtopicinput": {
                color: "white"
            },
            "#monitoringnotice": {
                "box-shadow": "none",
                border: "none",
                "display": "none"
            },
            "#startachat": {
                color: "#bcbcbc",
                textContent: "Start Chatting:",
            },
            "button": {
                "border-radius": "5px"
            },
            "#textbtn": {
                "border-radius": "5px",
                "margin-top": "5px"
            },
            "#videobtn": {
                "border-radius": "5px",
                "margin-top": "5px"
            },
            ".chattypeorcell": {
                color: "#bcbcbc"
            },
            "#footer": {
                display: 'none'
            },
            "#header": {
                background: "#212121",
                "-webkit-box-shadow": "none"
            },
            "div.itemBar": {
                "margin-top": "15px"
            },
            "button.homeButton": {
                "margin-top": "15px",
                "margin-left": "10px"
            },
            "a[href='javascript:']": {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "22px",
                "text-align": "center",
                textContent: "College Student Chat",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "border": 'none',

            },
            "#videobtnunmoderated": {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "20px",
                "text-align": "center",
                textContent: "Unmoderated",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "margin-top": "34px"

            },
            "#spymodebtn": {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "20px",
                "text-align": "center",
                textContent: "Spy Mode",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "margin-top": "34px"
            },
            "#sharebuttons": {
                "display": "none"
            },
            ".logwrapper": {
                "background": 'red'
            }
        }

        // Iterate through element types
        Object.keys(mappings).forEach(key => {
            let matches = document.querySelectorAll(key); // Get them

            // For each element
            [].slice.call(matches).forEach((elem) => {

                // For each change defined
                Object.keys(mappings[key]).forEach((changeMap) => {
                    let val = mappings[key][changeMap]

                    if (changeMap === 'textContent') {
                        elem.textContent = val;
                    } else if (changeMap === 'appendHTML') {
                        elem.innerHTML = elem.innerHTML + val;
                    } else if (changeMap === 'prependHTML') {
                        elem.innerHTML = val + elem.innerHTML;
                    } else {
                        elem.style[changeMap] = val;
                    }

                })

            });


        });

    }

    darkTest();

    /**
     *
     * Initialize Omegle Chat
     *
     * Actions:
     *      Bypass the captcha
     *      Start the first chat
     *
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

        let cookies = Cookies.get("topiclist");
        chrome.storage.sync.set({"topicList": JSON.parse(cookies)});
        console.log('[DEBUG] Updated cookies ' + cookies)

    }

    // Bind the start function to the text & video buttons
    $("#textbtn").on('click', startFunction);
    $("#videobtn").on('click', startFunction);
    $("#videobtnunmoderated").on('click', startFunction);
    $("#tryspymodetext.button").on('click', startFunction);

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

        if (skipSeconds == null || skipSeconds < 1) {
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

    /**
     *
     * Create Status Item
     *
     * Actions:
     *      Create & return a status item (used for custom logs)
     *
     * @param label Label for the item
     * @param value Value for the item
     *
     */
    function createStatusItem(label, value) {

        // Create a new container for the entry
        let youMsgClass = document.createElement("p");
        youMsgClass.classList.add("youmsg");

        // Set the field (bolded part)
        let field = document.createElement("strong");
        field.classList.add("statusItem");
        field.innerText = label + "";

        // Set the result (answer part)
        let entry = document.createElement("span")
        entry.innerHTML = value;

        // Add the status field & entry to the main entry
        youMsgClass.appendChild(field);
        youMsgClass.appendChild(entry);

        return youMsgClass;

    }

    /**
     *
     * Video Chat IP-Grabbing Function
     *
     * Actions:
     *      Receive an IP from the background and display it, get info, etc.
     *
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
            ipGrabberDiv.appendChild(createStatusItem("IP Address: ", ip)); // Add the IP first

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
     *
     * Asynchronously access the geolocation service and get data *as available*
     *
     * Actions:
     *      Make a call to the service for geo-location
     *      If the request fails:
     *          Add the reasoning
     *          Return
     *      If the request succeeds
     *          Iterate through received entries:
     *              If the item isn't empty
     *                  Reference the mapped name for the item and add a status item for it
     *
     * @param ip The IP to geo-locate
     * @param container The container to add the data to
     *
     */
    function asyncGeolocationData(ip, container) {
        const mappingKeys = Object.keys(settings.constants.geolocationJSONMappings); // Key the mappings
        let request = new XMLHttpRequest(); // Make a request

        // When the state changes
        request.onreadystatechange = () => {
            if (!(request.readyState === 4)) return;

            // The request failed
            if (request.status === 403) {
                container.appendChild(createStatusItem("(Geolocation unavailable, hourly limit reached)", ""));
            }

            // The request succeeded
            if (request.status === 200) {
                const geoData = JSON.parse(request.responseText);
                const geoDataKeys = Object.keys(geoData);

                // Iterate through the JSON data received from the API, map the strings
                geoDataKeys.forEach(function(key) {
                    const entry = geoData[key];
                    if (mappingKeys.includes(key) && !((entry == null) || entry === ''))
                        container.appendChild(createStatusItem(settings.constants.geolocationJSONMappings[key] + ": ", entry));
                });

                // Hardcoded -> If there is longitude and latitude included, add that too
                if (geoDataKeys.includes("longitude") && geoDataKeys.includes("latitude")) {
                    container.appendChild(createStatusItem("Longitude/Latitude: ", geoData["longitude"] + " / " + geoData["latitude"]))
                }

            }

        };

        // Open & send the request
        request.open("GET", settings.constants.geolocationEndpoint + ip, true);
        request.send();

    }

});
