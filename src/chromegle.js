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
let paused = false; // Is the client paused
let ipGrabberDiv; // Contains IP Info in video chats
let appID = chrome.runtime.id; // App ID for run-time access to extension resources
let checkIndex = 0 // Current index being checked by the filter in array of logbox items
let newOmegleOnlineDiv = document.createElement("div"); // Div to hold updated counts

$(document).on('ready', function () {
    setTimeout(() => document.getElementsByTagName("html")[0].style.visibility = "visible", 700);

    if (isBanned()) return; // Cancel if banned
    document.dispatchEvent(new CustomEvent('ChromegleInit'));

    let sessionID = uuid4(); // Generate initial session
    fixMonitoringMessages(20); // Override monitoring message

    // Create IP-Grabber
    let script = document.createElement('script');
    script.src = chrome.runtime.getURL('/src/injection/rtcscrape.js')
    script.onload = () => {script.remove(); document.dispatchEvent(new CustomEvent('IPScrape'))};
    (document.head || document.documentElement).appendChild(script);

    /**
     * Observe changes in the log box for dark mode & auto-reconnecting
     */
    const observer = new MutationObserver(function () {
        // Auto-reconnectFunction
        if ($(".newchatbtnwrapper").is(":visible")) reconnectFunction();

        // Update chatbox
        darkModeChatBox();

        $("a").css("color", settings.constants.linkColourCode);

        // Custom chat advertisement
        let statusLogs = document.getElementsByClassName("statuslog");
        if (statusLogs.length > 0 && statusLogs.length < 5) {
            for (let i = 0; i < statusLogs.length; i++) {
                let logItem = statusLogs.item(i);

                if (logItem.innerHTML.includes("You're now chatting with a random stranger.")) {
                    logItem.innerHTML = "Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> " +
                        "Consider donating to my college fund!"

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

    /**
     * Get the current iteration of the logbox and start observing
     *
     * We also threw some stuff that needed to be persistently changed
     * in here since this class is caused on both start & reconnectFunction.
     *
     */
    const startObserving = () => {

        // Initialize the chat box since we won't have done that yet
        darkModeChatBox();

        // Start observing for updates
        observer.observe(document.getElementsByClassName("logbox")[0], {attributes: true, subtree: true, childList: true});

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

                if (val.greetingEnabled) writeFunction(val.text, val.sendingDelay, val.typingSpeed);
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
    function writeFunction(message, delay, wpm) {

        let sendButton = $(".sendbtn", document);

        // Recursively call self until it isn't disabled
        if (sendButton.is(":disabled")) {
            return setTimeout(() =>  writeFunction(message, delay, wpm), 250);
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
    let reconnectFunction = () => {
        $(".disconnectbtn", document).trigger("click");
        sessionID = uuid4();
        checkIndex = 0;
        chatStartFunctions()
        startObserving();
    }

});

