// noinspection SpellCheckingInspection

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
document.addEventListener('DarkInject', () => {

    /*

    These represent mappings for injecting new data to create the dark mode effect.
    Is it nasty and hardcoded? Yes. I'll let you know if I regret it down the line.

     */

    if (window.location.href === 'http://omegle.com/static/ban.html')
        return;

    let loadingText = document.createElement('p')
    loadingText.innerHTML = 'Loading Resources...';
    loadingText.classList.add('loading');
    document.body.append(loadingText);

    // Disable everything for the first second to give it a chance to load
    let intro = document.getElementById('intro');

    intro.style.display = 'none';
    let header = document.getElementById('header');
    header.style.display = 'none';
    setTimeout(() => {
        loadingText.style.display = 'none'
        intro.style.display = ''
        header.style.display = ''
    }, 1000);

    const injectionMappings = {

        "a":
            {
                "color": '#00aff4',
                "textDecoration": 'none'
            },

        "body":
            {
                "background": '#212121'
            },

        "#intro":
            {
                "background": '#292a2d',
                "border": "25px solid #292a2d",
                "-webkit-box-shadow": 'none',
                "marginTop": "60px",
            },

        "#mobilesitenote":
            {
                "color": '#bcbcbc'
            },

        ".topictageditor":
            {
                "color": 'white',
                "background": '#212121',
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

        "#footer":
            {
                "display": 'none'
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

        "a[href='javascript:']":
            {
                "background": "linear-gradient(180deg, rgba(2,0,36,1) 0%, rgba(106,181,255,1) 0%, rgba(9,131,254,1) 90%)",
                "height": "22px",
                "text-align": "center",
                "textContent": "College Student Chat",
                "font-size": "15px",
                "color": "white",
                "line-height": "17px",
                "font-weight": 450,
                "vertical-align": "center",
                "border-radius": "5px",
                "border": 'none'
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

        "#sharebuttons":
            {
                "display": "none"
            },

        ".logwrapper":
            {
                "background": 'red'
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
                'color': "#bcbcbc"
            }

    }

    // Iterate through jquery locators
    Object.keys(injectionMappings).forEach(key => {

        // Iterate through requested modifications for hte located elements
        [].slice.call(document.querySelectorAll(key)).forEach((elem) => {

            // Update the element with each tag & its value
            Object.keys(injectionMappings[key]).forEach((changeMap) => {
                let fieldValue =  injectionMappings[key][changeMap]

                // Make the edits
                if (changeMap === 'textContent') elem.textContent = fieldValue;
                else if (changeMap === 'appendHTML') elem.innerHTML = elem.innerHTML + fieldValue;
                else if (changeMap === 'prependHTML') elem.innerHTML = fieldValue + elem.innerHTML;
                else elem.style[changeMap] = fieldValue;

            })

        });

    });

    // Get rid of "video monitored" when not banned
    setTimeout(() => {
        let elem = document.getElementById('monitoringnotice')
        if (elem.childNodes[1].childNodes[1].textContent.includes("Video is monitored")) elem.style.display = 'none';
    }, 0);

    const runMultiple = function (times) {
        // Ban Case (Usually delayed)
        setTimeout(() => {
            times -= 1;
            console.log('ran');

            if (times === 0)
                return;

            let elem = document.getElementById('monitoringnotice')
            if (!elem.classList.contains('banned')) {
                runMultiple(times)
                return;
            }

            elem.style.boxShadow = 'none';
            elem.style.webkitBoxShadow = 'none';
            elem.style.border = 'none';
            elem.innerHTML = '<strong>You are banned from Omegle.</strong> ‏‏‎ ';
            elem.style.padding = '10px';
            elem.style.marginBottom = '30px';

            let elem2 = document.getElementById('startachatcell')
            elem2.style.display = 'none';

            let elem3 = document.getElementById('girlsbtn');
            elem3.style.borderRadius = '5px';

            let elem4 = document.getElementById('gaybtn');
            elem4.style.borderRadius = '5px';

            let elem5 = document.getElementById('chattypeorcell');
            elem5.style.color = "#bcbcbc";

        }, 300);
    }

    runMultiple(5);



});