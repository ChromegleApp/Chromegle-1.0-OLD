// Create the settings modal
let settingsModal = document.createElement("settingsModal");
settingsModal.style.display = 'none';
$(settingsModal).load(`chrome-extension://${appID}/src/injection/settings.html`)
$("html").append(settingsModal);

/**
 * Settings Modal
 */
$(document).on('ChromegleInit', () => {setTimeout(() => {

    // Add functionality to the close button in the modal
    $("#closeModal").on('click', () => toggleSettingsModal())

    /**
     * Close modal when clicking off modal
     */
    window.addEventListener('click', (target) => {
        let path = target.path;

        if (settingsModal.style.display === 'none') return;
        for (let i = 0; i < path.length ; i ++) path[i] = path[i].className;

        // If they click anything but the close button and settings modal AND IT'S TRUSTED INPUT
        // (not our keyboard simulating send hack) then toggle the modal
        if (!(path.includes("settingsButton") || path.includes("settingsModal")) && target.isTrusted) toggleSettingsModal();

    })

    /**
     * Code for the collapsibles
     */
    {

        let collapsibles = document.getElementsByClassName("settingsCollapsible")
        const collapsibleRadius = "5px"

        // Add collapsability to collapsibles
        for (let collapsible of collapsibles) {

            collapsible.addEventListener("click", function() {
                collapsible.classList.toggle("active");

                // If enabled, disable
                if (this.nextElementSibling.style.display === "block") {

                    this.nextElementSibling.style.display = "none";
                    this.style.borderBottomLeftRadius = collapsibleRadius;
                    this.style.borderBottomRightRadius = collapsibleRadius;
                }

                // If disabled, enable
                else {

                    // Disable other collapsibles
                    for (let _collapsible of collapsibles) {
                        if (_collapsible.nextElementSibling.style.display === "block") {

                            _collapsible.nextElementSibling.style.display = "none";
                            _collapsible.style.borderBottomLeftRadius = collapsibleRadius;
                            _collapsible.style.borderBottomRightRadius = collapsibleRadius;
                        }
                    }

                    // Enable this one
                    this.nextElementSibling.style.display = "block";
                    this.style.borderBottomLeftRadius = "0px";
                    this.style.borderBottomRightRadius = "0px";

                }

            });
        }
    }

    $("#modalLogo").on('click', () => window.open(settings.constants.discordInviteURL))

    /**
     * Greeting Toggle Switch
     */
    {
        // Get status of & change based on
        let greetingToggle = document.getElementById("greetingToggle");
        toggleInitial(greetingToggle, "greetingEnabled", settings.defaultsNew.greetingEnabled)
        $(greetingToggle).on('click', () => toggleSwitch(greetingToggle, "greetingEnabled"));
    }

    /**
     * Typing Speed Field
     */
    {
        let typingSpeedField = document.getElementById("typingSpeedField")

        $(typingSpeedField).on('click', () => {
            chrome.storage.sync.get({typingSpeed: settings.defaultsNew.typingSpeed}, (result) => {

                // Get new speed
                let newSpeed = prompt(settings.promptsNew.typingSpeed, result.typingSpeed);

                if (newSpeed !== null && isNumeric(newSpeed)) {
                    if (newSpeed < 0) newSpeed = 0;
                    if (newSpeed > 0 && newSpeed < 5) newSpeed = 5;
                    if (newSpeed > 1000) newSpeed = 1000;
                    chrome.storage.sync.set({typingSpeed: newSpeed});
                }

            });

        });
    }

    /**
     * Typing Delay Field
     */
    {
        let sendingDelayField = document.getElementById("sendingDelayField")

        $(sendingDelayField).on('click', () => {
            chrome.storage.sync.get({sendingDelay: settings.defaultsNew.sendingDelay}, (result) => {

                // Get new speed
                let newDelay = prompt(settings.promptsNew.sendingDelay, result.sendingDelay);

                if (newDelay !== null && isNumeric(newDelay)) {
                    if (newDelay < 0) newDelay = 0;
                    if (newDelay > 1000) newDelay = 1000;
                    chrome.storage.sync.set({sendingDelay: newDelay});
                }

            });

        });
    }

    /**
     * Auto-Skip Field
     */
    {
        let typingDelayField = document.getElementById("autoSkipField")

        $(typingDelayField).on('click', () => {
            chrome.storage.sync.get({autoSkip: settings.defaultsNew.autoSkip}, (result) => {

                // Get new speed
                let newSkipTime = prompt(settings.promptsNew.autoSkip, result.autoSkip);

                if (newSkipTime !== null && isNumeric(newSkipTime)) {
                    if (newSkipTime < 0) newSkipTime = 0;
                    if (newSkipTime > 1000) newSkipTime = 1000;
                    chrome.storage.sync.set({autoSkip: newSkipTime});
                }

            });

        });
    }

    /**
     * Auto-Skip Toggle
     */
    {
        // Get status of & change based on
        let autoSkipToggle = document.getElementById("autoSkipToggle");
        toggleInitial(autoSkipToggle, "autoSkipEnabled", settings.defaultsNew.autoSkipEnabled)
        $(autoSkipToggle).on('click', () => toggleSwitch(autoSkipToggle, "autoSkipEnabled"));
    }

    /**
     * Auto-Reconnect Toggle
     */
    {
        // Get status of & change based on
        let autoReconnectToggle = document.getElementById("autoReconnectToggle");
        toggleInitial(autoReconnectToggle, "autoReconnectEnabled", settings.defaultsNew.autoReconnectEnabled)
        $(autoReconnectToggle).on('click', () => toggleSwitch(autoReconnectToggle, "autoReconnectEnabled"));
    }

    /**
     * IP Grab Toggle
     */
    {
        // Get status of & change based on
        let ipGrabToggle = document.getElementById("ipGrabToggle");
        toggleInitial(ipGrabToggle, "ipGrabEnabled", settings.defaultsNew.ipGrabEnabled)
        $(ipGrabToggle).on('click', () => toggleSwitch(ipGrabToggle, "ipGrabEnabled"));
    }

    /**
     * Geolocation Toggle
     */
    {
        let geoLocateToggle = document.getElementById("geoLocateToggle");
        toggleInitial(geoLocateToggle, "geoLocateEnabled", settings.defaultsNew.geoLocateEnabled)
        $(geoLocateToggle).on('click', () => toggleSwitch(geoLocateToggle, "geoLocateEnabled"))
    }

    /**
     * Dark Mode Toggle
     */
    {
        // Get status of & change based on
        let darkModeToggle = document.getElementById("darkModeToggle");
        toggleInitial(darkModeToggle, "darkModeEnabled", settings.defaultsNew.darkModeEnabled)
        $(darkModeToggle).on('click', () => {
            toggleSwitch(darkModeToggle, "darkModeEnabled")
            window.location.reload(true);
        });

    }

    /**
     * Stream List Toggle
     */
    {
        let streamListToggle = document.getElementById("streamListToggle");
        toggleInitial(streamListToggle, "streamListEnabled", settings.defaultsNew.streamListEnabled)
        $(streamListToggle).on('click', () => {

            // Toggle it
            toggleSwitch(streamListToggle, "streamListEnabled")

            // Update the box on screen
            chrome.storage.sync.get({"streamListEnabled": settings.defaultsNew.streamListEnabled}, (response) => {
                let streamBox = document.getElementById("innerStreamingDiv");

                // Move it off the screen (toggle this)
                if (response.streamListEnabled) streamBox.style.display = "block";
                else streamBox.style.display = "none";

            })

        });
    }

    /**
     * Filter Multi-Level Toggle System
     */
    {

        let filterTypes = [
            {item: document.getElementById("weakFilterToggle"), key: 0},
            {item: document.getElementById("mediumFilterToggle"), key: 1},
            {item: document.getElementById("strongFilterToggle"), key: 2}
        ]

        let disableButton = (element, className) => {
            if (element.classList.contains(className)) {
                element.classList.toggle(className);
                element.innerHTML = "Enable";
            }

        }

        // Get the current level
        chrome.storage.sync.get({filterLevel: settings.defaultsNew.filterLevel}, (result) => {

            filterTypes.forEach((object) => {
                let filterType = object.item;
                let filterKey = object.key; // The key for setting

                // Edit the initial button
                if (result.filterLevel === filterKey) {
                    filterType.classList.toggle('editToggleEnabled');
                    filterType.innerHTML = "Disable"
                }


                $(filterType).on('click', () => {

                    // Toggle THIS button
                    filterType.classList.toggle('editToggleEnabled');
                    filterType.innerHTML = (filterType.innerHTML === "Enable") ? "Disable" : "Enable";

                    // Disable the OTHER images 100% of the time
                    let filterTypesCopy = filterTypes.filter(object => object.item !== filterType);
                    let index = filterTypesCopy.indexOf(filterType);
                    if (index > -1) filterTypesCopy.splice(index, 1);
                    filterTypesCopy.forEach((element) => disableButton(element.item, 'editToggleEnabled'));

                    // Update storage based on the status of this button
                    chrome.storage.sync.set({filterLevel: (filterType.innerHTML === "Enable") ? -1 : filterKey});

                });

            });

        });


    }

}, 500)});


const toggleSettingsModal = () => {
    if (settingsModal.style.display === "none") settingsModal.style.display = "block";
    else settingsModal.style.display = "none";

    // Toggle intro box if there
    let introBox = document.getElementById("intro");
    if (introBox !== null) {

        if (introBox.style.display === 'none') introBox.style.display = 'block';
        else introBox.style.display = 'none';

    }

    // Toggle streaming box
    let streamingDiv = document.getElementById("streamingDiv");
    if (streamingDiv !== null) {
        if (streamingDiv.style.display === 'none') streamingDiv.style.display = 'block';
        else streamingDiv.style.display = 'none';
    }

}

const toggleSwitch = (element, storageField) => {
    element.classList.toggle('editToggleEnabled');
    let toggleChange = {}

    // Enable it
    if (element.innerHTML === "Enable")
    {
        element.innerHTML = "Disable"
        toggleChange[storageField] = true;
    }

    // Disable it
    else
    {
        element.innerHTML = "Enable"
        toggleChange[storageField] = false;
    }

    chrome.storage.sync.set(toggleChange);


}

const toggleInitial = (element, storageField, storageFieldDefault) => {
    let toggleCheck = {}
    toggleCheck[storageField] = storageFieldDefault

    chrome.storage.sync.get(toggleCheck, (result) => {

        if (result[storageField]) {
            element.classList.toggle('editToggleEnabled');
            element.innerHTML = "Disable"
        }

    })
}