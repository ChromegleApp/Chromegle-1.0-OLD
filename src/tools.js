const settings = {

    prompts: {

        greetingMessage: "Enter a new message to send on connect:",
        greetingDelay: "Enter an (optional) delay in seconds after typing to wait before sending the message:",
        skipTime: "Enter a new (optional) skip time in seconds to skip AFTER sending a message (OR connecting, if there is no message set):",
        wpmSpeed: "Enter a new speed (words per minute) for typing to take place"

    },

    defaults: {

        greetingMessageNotFound: "Hello there!",
        greetingDelayNotFound: 0,
        wpmNotFound: 40,
        skipTimeNotFound: 0,

        greetingMessage: "",
        greetingDelay: 0,
        skipTime: 0.5,
        wpmSpeed: 48

    },

    constants: {

        wpmMinimumValue: 0.1,
        lettersPerWord: 8,
        discordInviteURL: "https://discord.gg/kaX9H65VhG"

    }


}

const calculateTypingDelay = (text, wpm) => {

    // Run a check on the WPM & set a minimum (can't be dividing by zero!)
    wpm = wpm === null ? settings.constants.wpmMinimumValue : wpm;

    // Run the calculation and return
    return (60 / wpm) * (text.length / settings.constants.lettersPerWord) * 1000;

}

const calculateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
