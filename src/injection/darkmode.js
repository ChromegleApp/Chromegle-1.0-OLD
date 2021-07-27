/**
 *
 * Dark Mode Injection
 *
 * Actions:
 *      Set mappings for injection
 *      Iterate through jquery locators and...
 *      Change the elements one at a time with the requested changes.
 *
 * Initiates:
 *      An iterative for-loop to inject CSS into the file as it is loading
 *
 */
document.addEventListener("DarkInject", () => {

    /*

    These represent mappings for injecting new data to create the dark mode effect.
    Is it nasty and hardcoded? Yes. I"ll let you know if I regret it down the line.

     */

    // Static banned should ignore this
    if (window.location.href === "http://omegle.com/static/ban.html" || window.location.href === "https://omegle.com/static/ban.html")
        return;

    const injectionMappings = {

        "a":
            {
                "textDecoration": "none"
            },

        "html":
            {
                "color": "#bcbcbc"
            },

        "body":
            {
                "background": "#212121"
            },

        "#intro":
            {
                "background": "#292a2d",
                "border": "25px solid #292a2d",
                "-webkit-box-shadow": "none",
                "marginTop": "60px",
                "font-size": "15px"
            },

        "#mobilesitenote":
            {
                "color": "#bcbcbc",
                "marginTop": "-5px",
                "marginBottom": "10px",
            },

        ".topictageditor":
            {
                "color": "white",
                "background": "#212121",
                "border-radius": "12px",
                "paddingTop": "10px",
                "border": "3px solid #bcbcbc",
                "margin-bottom": "29px"
            },

        "#intoheader":
            {
                "color": "#bcbcbc",
            },

        "#introtext":
            {
                "color": "#bcbcbc"
            },

        "label":
            {
                "color": "#bcbcbc"
            },

        "#intoheadercell":
            {
                "appendHTML": "<br>",
                "prependHTML": "<br>"
            },

        "#startachatcell":
            {
                "appendHTML": "<br>",
                "prependHTML": "<br>"
            },

        "input.newtopicinput":
            {
                "color": "white"
            },

        "#startachat":
            {
                "color": "#bcbcbc",
                "textContent": "Start Chatting:"
            },

        "button":
            {
                "border-radius": "5px"
            },

        "#textbtn":
            {
                "border-radius": "5px",
                "margin-top": "5px"
            },

        "#videobtn":
            {
                "border-radius": "5px",
                "margin-top": "5px"
            },

        ".chattypeorcell":
            {
                "color": "#bcbcbc"
            },

        "#header":
            {
                "background": "#212121",
                "-webkit-box-shadow": "none"
            },

        "div.itemBar":
            {
                "margin-top": "15px",
            },

        "button.homeButton":
            {
                "margin-top": "15px",
                "margin-left": "10px"
            },

        'a[href="javascript:"]':
            {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "22px",
                "text-align": "center",
                "textContent": "College Student Chat",
                "font-size": "15px",
                "color": "white",
                "line-height": "18px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "border": "none"
            },

        "#videobtnunmoderated":
            {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "20px",
                "text-align": "center",
                "textContent": "Unmoderated",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "margin-top": "34px"
            },

        "#spymodebtn":
            {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "20px",
                "text-align": "center",
                "textContent": "Spy Mode",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "margin-top": "34px"
            },

        ".logwrapper":
            {
                "background": "red"
            },

        "#onlinecount":
            {
                "margin-right": "30px"
            },

        "#monitoringnotice":
            {
                "box-shadow": "none",
                "border": "none",
                "color": "black"
            },
        "#monitoringnotice > p":
            {
                "box-shadow": "none",
                "border": "none",
                "color": "black"
            },

        "#topicsettingscontainer":

            {
                "color": "#bcbcbc"
            },

        ".customDiscordBanner":

            {
                "marginTop": "10px",
                "marginBottom": "20px"
            }

    }

    // Iterate through jquery locators
    Object.keys(injectionMappings).forEach(key => {

        // Iterate through requested modifications for hte located elements
        [].slice.call(document.querySelectorAll(key)).forEach((elem) => {

            // Update the element with each tag & its value
            Object.keys(injectionMappings[key]).forEach((changeMap) => {
                let fieldValue = injectionMappings[key][changeMap]

                // Make the edits
                if (changeMap === "textContent") elem.textContent = fieldValue;
                else if (changeMap === "appendHTML") elem.innerHTML = elem.innerHTML + fieldValue;
                else if (changeMap === "prependHTML") elem.innerHTML = fieldValue + elem.innerHTML;
                else elem.style[changeMap] = fieldValue;

            })

        });

    });

    // Non-static check (stuff that requires an API request)
    runMultiple(20);

});


/**
 * Run the ban checker and also remove the monitoring notice for videos
 */
const runMultiple = function (times, didWidget) {
    setTimeout(() => {
        times -= 1;

        if (times === 0)
            return;

        // Recolor all the chat type or cell items :)
        let chatTypeOrcell = document.getElementsByClassName("chattypeorcell");
        for (let i = 0; i < chatTypeOrcell.length; i++) {
            chatTypeOrcell.item(i).style.color = "#bcbcbc"
        }

        runMultiple(times, didWidget);

    }, 300);
}