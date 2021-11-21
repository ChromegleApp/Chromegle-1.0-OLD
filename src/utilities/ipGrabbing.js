/**
 * Upon receiving their IP (when connecting to video), get the data and input it to the screen, plus
 * add an advertisement as a bonus for videos for the personal donation link.
 */
window.addEventListener("getAddress", function (response) {

    chrome.storage.sync.get({ipGrabEnabled: settings.defaultsNew.ipGrabEnabled}, (result) => {


        if (!result["ipGrabEnabled"]) return;
        let unhashedIP = response["detail"]

        // Get the log list
        let logBoxDiv = document.getElementsByClassName("logitem")[0].parentNode;

        // Create a new log item container
        let logItemDiv = document.createElement("div");
        logItemDiv.classList.add("logitem");

        // Create a NEW new log item container
        let seenBeforeDiv = document.createElement("div");
        seenBeforeDiv.classList.add("logitem");

        // Create a new div to hold the IP grabber stuff & geolocate
        ipGrabberDiv = document.createElement("div");
        ipGrabberDiv.classList.add("logitem");

        // Get enabled status
        chrome.storage.sync.get(["ipScrape"], (response) => {

            let promise = sha256(unhashedIP)
            promise.then((hashedIP) => {

                // Primary "IP" Thing
                chrome.storage.sync.get({ipSeenMetrics: settings.defaultsNew.ipSeenMetrics}, (response) => {

                    let metrics = response["ipSeenMetrics"];
                    let count = (metrics[hashedIP] === undefined || metrics[hashedIP] == null) ? 0 : metrics[hashedIP];

                    console.log(hashedIP + "            " + unhashedIP  + "            " + count)

                    // Seen Before # of times
                    seenBeforeDiv.appendChild($(`<span class='statuslog'>You've seen this person ${count} times before.</span>`).get(0))

                    // IP address
                    ipGrabberDiv.appendChild(createLogBoxMessage("IP Address: ", unhashedIP)); // Add the IP first

                    metrics[hashedIP] = count + 1;
                    chrome.storage.sync.set({ipSeenMetrics: metrics});

                });

                // Geolocation
                chrome.storage.sync.get({geoLocateEnabled: settings.defaultsNew.geoLocateEnabled}, (response) => {
                    if (response.geoLocateEnabled) asyncGeolocationData(unhashedIP, ipGrabberDiv)
                });

                // Conditionally display the data
                if (response.ipScrape) {
                    ipToggleButton.html(settings.prompts.enableIPs);
                }
                else {
                    ipToggleButton.html(settings.prompts.disableIPs);
                    ipGrabberDiv.style.display = "none";
                }


            })



        });

        logBoxDiv.append(ipToggleButton.get(0));
        logBoxDiv.appendChild(ipGrabberDiv);
        logBoxDiv.append(seenBeforeDiv);



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