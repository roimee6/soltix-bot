module.exports = async function(interaction) {
    try {
        if (interaction.isCommand()) {
            runAsCommand(interaction);
        }
    } catch (e) {
        console.log(e);
    }
}

async function runAsCommand(interaction) {
    if (Object.keys(commands).includes(interaction.commandName)) {
        const module = require("../command/" + interaction.commandName + ".js");
        module.run(interaction);
    }
}