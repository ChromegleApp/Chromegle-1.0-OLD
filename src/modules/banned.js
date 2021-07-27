const isBanned = () => {

    /** Porn-redirect screen */
    if (window.location.href.includes("banredir.html")) {
        window.location.href = "https://omegle.com/static/ban.html";
        return true;
    }

    /**  Static HTML ban screen */
    if (window.location.href.includes("ban.html")) {
        $("html").load(`chrome-extension://${appID}/src/injection/banned.html`)
        let item = document.getElementsByTagName("html")[0]
        item.style.visibility = "visible"
        item.style.backgroundColor = '#20242c';
        return true;
    }

    return false;
}

// Change Monitoring message & banned to custom styling
const fixMonitoringMessages = (attempts) => {
    setTimeout(() => {
        attempts -= 1;

        if (attempts === 0) return;
        let elem = document.getElementById("monitoringnotice")
        if (elem == null) return fixMonitoringMessages(attempts);

        if (!elem.classList.contains("banned")) {
            if (elem.childNodes[1].childNodes[1].textContent.includes("Video is monitored")) elem.style.display = "none";
            return fixMonitoringMessages(attempts);
        }

        elem.style.boxShadow = "none";
        elem.style.webkitBoxShadow = "none";
        elem.style.border = "none";
        elem.style.cursor = "pointer";
        elem.innerHTML = "<strong>You are banned from Omegle... Click for Why</strong> ‏‏‎ ";
        elem.style.color = "black";
        elem.style.padding = "10px";
        elem.style.marginBottom = "30px";

        // Bind click to redirect
        $(elem).on('click', () => window.location.href = 'https://omegle.com/static/ban.html');

        let elem2 = document.getElementById("startachatcell") // Hide "start chatting" message
        if (darkModeEnabled) {
            elem2.style.display = "none";
        } else {
            elem2.innerHTML = "<span>Unmonitored Chats:</span><br>‏‏‎"
            elem2.style.marginBottom = "10px";
        }

        let elem3 = document.getElementById("girlsbtn"); // Fix ends of "Porn" button
        elem3.style.borderRadius = "5px";

        let elem4 = document.getElementById("gaybtn"); // Fix ends of "Gay" button
        elem4.style.borderRadius = "5px";

        // Recolor all the chat type or cell items :)
        let chatTypeOrcell = document.getElementsByClassName("chattypeorcell");
        for (let i = 0; i < chatTypeOrcell.length; i++) {
            chatTypeOrcell.item(i).style.color = "#bcbcbc"
        }

    }, 300);
}
