/** Get the filter text */
const filterLevels = ["Level0.txt", "Level1.txt", "Level2.txt"]

for (let i = 0; i < filterLevels.length; i++) {
    fetch(`chrome-extension://${appID}/resources/filter/${filterLevels[i]}`)
        .then(response => response.text()).then(response => response.replaceAll("\r", ""))
        .then(response => response.split("\n")).then(data => filterLevels[i] = data);
}

let filterString = (message, level) => {
    if (level < 0) return message;

    for (let subList of filterLevels.slice(0, level + 1)) {
        for (let word of subList) {
            message = message.replaceAll(word, "*".repeat(word.length))
        }
    }

    return message

}


