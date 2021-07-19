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
        greetingDelayNotFound: 0,
        wpmNotFound: 40,
        skipTimeNotFound: 0,
        ipScrapeEnabledNotFound: false,

        greetingMessage: "",
        greetingDelay: 0,
        skipTime: 1,
        wpmSpeed: 48

    },

    // Constant values that do not change
    constants: {

        skipTimeMinimumValue: 1,
        wpmMinimumValue: 0.1,
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

/**
 *
 * Utility function to calculate the typing delay for a message
 *
 * Actions:
 *      Run a mathematical equation with WPM & text to determine the wait time
 *
 */
const calculateTypingDelay = (text, wpm) => {

    // Run a check on the WPM & set a minimum (can't be dividing by zero!)
    wpm = wpm === null ? settings.constants.wpmMinimumValue : wpm;

    // Run the calculation and return
    return (60 / wpm) * (text.length / settings.constants.lettersPerWord) * 1000;

}

/**
 *
 * Utility function to generate a UUID in Javascript
 *
 * Actions:
 *      Randomly generate a valid UUID-4 identifier
 *
 */
const calculateUUID = () => {

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {

        let r = Math.random() * 16 | 0, uuid = c === 'x' ? r : (r & 0x3 | 0x8);
        return uuid.toString(16);

    });

}

/**
 *
 * Check if an umber is numeric
 *
 */
const isNumeric = (str) => {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
