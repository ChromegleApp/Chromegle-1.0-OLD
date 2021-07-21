const settings = {

    // Prompts for alerts
    prompts: {

        greetingMessage: "Enter a new message to send on connect. To disable this feature, set the field to empty:",
        greetingDelay: "Enter an (optional) delay after typing to wait before sending the message. To disable, set the field to empty or less than/equal to zero:",
        skipTime: "Enter a new (optional) skip time after connecting. To disable this, set the field to empty or less than/equal to zero:",
        wpmSpeed: "Enter a new speed (words per minute) for typing to take place. To disable this, set the field to empty or less than/equal to zero:",

        disableIPs: "View IP-Address",
        enableIPs: "Hide IP-Address"

    },

    // Default values for configuration
    defaults: {

        greetingMessageNotFound: "Hello there!",
        darkModeNotFound: false,
        greetingDelayNotFound: 0,
        wpmNotFound: 40,
        skipTimeNotFound: 0,
        ipScrapeEnabledNotFound: false,
        skipTime: 0,

    },

    // Constant values that do not change
    constants: {

        lettersPerWord: 8,
        discordInviteURL: "https://discord.gg/kaX9H65VhG",
        baseButtonContainerMargin: 80,
        geolocationEndpoint: "https://freegeoip.app/json/",

        geolocationJSONMappings: {
            country_name: "Country",
            region_name: "Region",
            city: "City",
            zip_code: "Zip Code"
        }

    }

}


const typingDelay = (text, wpm) => {
    return (60 / (wpm === null ? 0.1 : wpm)) * (text.length / settings.constants.lettersPerWord) * 1000;
}


const uuid4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, uuid = c === 'x' ? r : (r & 0x3 | 0x8);
        return uuid.toString(16);
    });
}


const isNumeric = (str) => {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const createLogBoxMessage = (label, value) => {

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


