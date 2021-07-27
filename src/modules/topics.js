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