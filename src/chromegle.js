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
 */

/** Whether or not the client is paused */
let paused = false;

/** The div to contain the IP grabber info for video chats (referenced globally to allow toggling) */
let ipGrabberDiv;

/** Get the app ID for loading file resources dynamically in javascript */
let appID = chrome.runtime.id;

/** Current check index for filter (current log # in order)*/
let checkIndex = 0

/** Chromegle Manipulates the Omegle window via jQuery to run actions */
$(document).on('ready', function () {
    setTimeout(() => document.getElementsByTagName("html")[0].style.visibility = "visible", 700);

    if (isBanned()) return; // Cancel if banned
    let sessionID = uuid4(); // Generate initial session
    fixMonitoringMessages(20); // Override monitoring message

    // Create IP-Grabber
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL('/src/injection/rtcscrape.js')
    script.onload = () => {script.remove(); document.dispatchEvent(new CustomEvent('IPScrape'))};
    (document.head || document.documentElement).appendChild(script);

    /**
     * Custom handling for spy mode images to bypass captchas & fix link colouring etc.
     */
    $("#spymodebtn").on('click', () => {

        // Remove the useless question heading
        let questionHeading = document.getElementsByClassName("questionHeading")[0];
        if (questionHeading !== undefined && questionHeading) questionHeading.remove();

        // Add some buffer & styling to the box since it's ugly as all hell
        let trySpyModeText = document.getElementById("tryspymodetext");
        if (trySpyModeText !== undefined) {
            trySpyModeText.style.marginTop = "15px";
            trySpyModeText.style.borderRadius = "15px";
        }

        // Change the "second" box. The reason we have it in a function is sometimes omegle goes directly to displaying this
        // and ignore the first set of boxes... Cause they're weird.
        let changeInconsistent = () => {
            // Fix link colour for discussing questions
            let discussingQuestions = $("a").filter(function() {return this.innerHTML === "discussing questions"})[0];
            discussingQuestions.style.color = settings.constants.linkColourCode;

            // Bind the click to the auto-agreement for TOS  to start the program
            $(discussingQuestions).on('click', () => startFunction());

            // Bind the click to auto-agreement for TOS  to start the program
            let askStrangers = $("button").filter(function() {return this.innerHTML === "Ask strangers"})[0];
            $(askStrangers).on('click', () => startFunction());
        }

        // Fix the link colour for asking a question
        let askingAQuestion = $("a").filter(function() {return this.innerHTML === "asking a question"})[0];
        if (askingAQuestion !== undefined) {
            askingAQuestion.style.color = settings.constants.linkColourCode;

            // Handle asking a question clicks
            $(askingAQuestion).on('click', () => {
                changeInconsistent();

            })
        } else {
            changeInconsistent();
        }

        // Bind click for auto-agreement for TOS to start the program
        let checkItOut = $("button").filter(function() {return this.innerHTML === "Check it out!"})[0];
        if (checkItOut !== undefined) $(checkItOut).on('click', () => startFunction());

    })

    // Add the images
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("itemBar"); // Add class
    buttonContainer.style.marginLeft = 240 + settings.constants.baseButtonContainerMargin + "px"; // Set position
    [greetingButton, settingsButton].forEach((element) => buttonContainer.appendChild(element.get(0)));

    // Static item replacement
    $("#tagline").html('').append(buttonContainer);  // Add the button container
    $("canvas").replaceWith(homeButton); // Replace the home button
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton); // Replace HK banner with Discord
    $("#mobilesitenote").html(
        "Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> Consider donating to my college fund!"
    ).css("overflow", "hidden").css("width", "100%")
    $("#footer").css("display", "none")
    $("#sharebuttons").css("display", "none");
    $("a").css("color", settings.constants.linkColourCode);

    /**
     * Get the current iteration of the logbox and start observing
     *
     * We also threw some stuff that needed to be persistently changed
     * in here since this class is caused on both start & reconnect.
     *
     */
    const startObserving = () => {

        console.log('STARTOB')

        // Initialize the chat box since we won't have done that yet
        darkModeChatBox();

        // Start observing for updates
        observer.observe(document.getElementsByClassName("logbox")[0], {attributes: true, subtree: true, childList: true});
        $("a").css("color", settings.constants.linkColourCode);

        // Replace "what happens if I click" item in unmoderated chat (and remove old instances)
        let whatHappensIfIClick = document.getElementById("abovevideosexybtn");
        if (whatHappensIfIClick !== undefined && whatHappensIfIClick !== null) {
            document.querySelectorAll("#betterWhatHappensIfIClick").forEach((item) => item.remove());
            let clone = whatHappensIfIClick.cloneNode();
            clone.innerHTML = `<a href="${settings.constants.discordInviteURL}" target="_blank" 
                               style="text-decoration: none; color:${settings.constants.linkColourCode}">
                               <strong>Chromegle Discord (NO NSFW)</strong></a>`
            clone.style.backgroundColor = darkModeEnabled ? '#292a2d' : "white";
            clone.style.fontSize = '20px'
            clone.style.cursor = 'default';
            clone.id = 'betterWhatHappensIfIClick';
            if (!darkModeEnabled) clone.style.border = "1px solid #b3b3b3"

            whatHappensIfIClick.replaceWith(clone);


        }

        // Replace the video logo omegle watermark
        let videologo = document.getElementById("videologo");
        if (videologo !== null) videologo.remove();

    }

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

    /**
     * Observe changes in the log box for dark mode & auto-reconnecting
     */
    const observer = new MutationObserver(function () {
        // Auto-reconnect
        if ($(".newchatbtnwrapper").is(":visible")) reconnect();

        // Update chatbox
        darkModeChatBox();

        // Custom chat advertisement
        let statusLogs = document.getElementsByClassName("statuslog");
        if (statusLogs.length > 0 && statusLogs.length < 5) {
            for (let i = 0; i < statusLogs.length; i++) {
                let logItem = statusLogs.item(i);

                if (logItem.innerHTML.includes("You're now chatting with a random stranger.")) {
                    logItem.innerHTML = "Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> " +
                        "Consider donating to my college fund!"
                    $("a").css("color", settings.constants.linkColourCode);

                }
            }
        }

        // Remove cam advertisement images on inappropriate chats
        [
            "lowergaybtnwrapper",
            "lowersexybtnwrapper",
            "abovevideosexybtn"

        ].forEach((key) => {
            let element = document.getElementsByClassName(key)[0];
            if (element === undefined) return;
            element.remove();

        })

        // Automatically ignore the chat-stopping advertisements
        let camButton = $('span').filter(function() {return this.innerHTML === "No"});
        if (camButton.get(0) !== undefined) camButton.get(0).parentNode.click();

        // Filter
        let logBox = document.getElementsByClassName("logbox")[0];
        let logElements = logBox.getElementsByTagName("span");

        chrome.storage.sync.get({filterLevel: settings.defaultsNew.filterLevel}, (result) => {
            for (let i = JSON.parse(JSON.stringify(checkIndex)); i < logElements.length; i++) {
                logElements[i].textContent = filterString(logElements[i].textContent, result.filterLevel);
                checkIndex ++;
            }
        })
    });


    const chatStartFunctions = () => {

        // Send if enabled
        chrome.storage.sync.get(
            {
                text: settings.defaultsNew.text,
                autoSkip: settings.defaultsNew.autoSkip,
                sendingDelay: settings.defaultsNew.sendingDelay,
                typingSpeed: settings.defaultsNew.typingSpeed,
                greetingEnabled: settings.defaultsNew.greetingEnabled,
                autoSkipEnabled: settings.defaultsNew.autoSkipEnabled
            },
            (val) => {

                if (val.greetingEnabled) write(val.text, val.sendingDelay, val.typingSpeed);
                if (val.autoSkipEnabled) skipFunction(val.autoSkip);

            }
        );

    }

    /**
     * Initialize Omegle Chat, Log topic cookies & Bypass Confirmation
     */
    const startFunction = () => {

        // Click the checkboxes
        $("input[type=checkbox]:not(:checked)").trigger("click");

        // Confirm join
        $("input[type=button][value='Confirm & continue']").trigger("click");

        chatStartFunctions();

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

    // Bind the start images to the start function
    ["#textbtn", "#videobtn", "#videobtnunmoderated"].forEach((button) => {
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
            totalTime + 50 + ((delay || settings.defaultsNew.sendingDelay) * 1000)
        );

    }

    /**
     * Reconnect Function
     */
    let reconnect = () => {
        $(".disconnectbtn", document).trigger("click");
        sessionID = uuid4();
        checkIndex = 0;
        chatStartFunctions()
        console.log('rECONNECT')
        startObserving();
    }

    /**
     * Upon receiving their IP (when connecting to video), get the data and input it to the screen, plus
     * add an advertisement as a bonus for videos for the personal donation link.
     */
    window.addEventListener("getAddress", function (response) {

        chrome.storage.sync.get({ipGrabEnabled: settings.defaultsNew.ipGrabEnabled}, (result) => {

            if (!result["ipGrabEnabled"]) return;

            let ip = response["detail"];

            // Get the log list
            let logBoxDiv = document.getElementsByClassName("logitem")[0].parentNode;

            // Create a new log item container
            let logItemDiv = document.createElement("div");
            logItemDiv.classList.add("logitem");

            // Create a new div to hold the IP grabber stuff & geolocate
            ipGrabberDiv = document.createElement("div");
            ipGrabberDiv.classList.add("logitem");

            // Get enabled status
            chrome.storage.sync.get(["ipScrape"], (response) => {

                chrome.storage.sync.get({geoLocateEnabled: settings.defaultsNew.geoLocateEnabled}, (response) => {
                    if (response.geoLocateEnabled) asyncGeolocationData(ip, ipGrabberDiv)
                })

                // Get the IP
                ipGrabberDiv.appendChild(createLogBoxMessage("IP Address: ", ip)); // Add the IP first

                // Conditionally display the data
                if (response.ipScrape) {
                    ipToggleButton.html(settings.prompts.enableIPs);
                }
                else {
                    ipToggleButton.html(settings.prompts.disableIPs);
                    ipGrabberDiv.style.display = "none";
                }

            });

            logBoxDiv.append(ipToggleButton.get(0));
            logBoxDiv.appendChild(ipGrabberDiv);

        });






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

