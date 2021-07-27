let runFetch = () => {
    let omegleOnlineDiv = document.getElementById("onlinecount");
    let omegleOC = omegleOnlineDiv.childNodes.item(0)
    if (omegleOC == null) {
        return setTimeout(() => runFetch(), 500)
    }

    let omegleOCText = omegleOC.innerHTML;

    /** Set up the custom widget */
    fetch(`https://discord.com/api/guilds/${settings.constants.discordGuildID}/widget.json`)
        .then(response => response.json())
        .then(response => {
            let rawDiscordOC = response["presence_count"];
            let discordOCText = numberWithCommas((Math.floor(rawDiscordOC / 100) * 100));

            newOmegleOnlineDiv.classList.add('discordWidget');

            if (darkModeEnabled) {
                newOmegleOnlineDiv.style.marginTop = '29px';
            }

            newOmegleOnlineDiv.innerHTML = (
                `<div style="font-size: 23px; font-weight: 400">
                    <span onclick="window.open('${settings.constants.discordInviteURL}')" style="cursor: pointer">
                        <strong style="font-size: 25px; color: #6cb5ff">${discordOCText}+</strong> on Discord
                    </span><br>
                    <strong style="font-size: 25px; color: #6cb5ff">${omegleOCText}</strong> on Omegle
                </div>`
            );

            omegleOnlineDiv.replaceWith(newOmegleOnlineDiv);



        });
}