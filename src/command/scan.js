const { SlashCommandBuilder } = require("@discordjs/builders");
const { existsSync } = require("fs");

module.exports = new SlashCommandBuilder()
    .setName("scan")
    .setDescription("Permet de voir le scan via le pin que vous avez créé juste avant")
    .addStringOption((option) => option.setName("pin").setDescription("Pin créé au préalable").setRequired(true));

module.exports.run = async function(interaction) {
    const pin = await interaction.options.getString("pin");

    console.log(pin);

    const path = "./src/data/screenshots/" + pin + ".jpg";

    if (existsSync(path)) {
        await interaction.reply({
            content: "<@" + interaction.user.id + ">, voici le résultat du scan, pour y voir un peu mieux, zoomez !",
            files: [ path ]
        });
        
        return;
    }

    await interaction.deferReply();
    const scan = await util.request(pin);
    
    if (scan === null) {
        await interaction.editReply("<@" + interaction.user.id + ">, Le pin " + pin + " n'a jamais été scan");
        return;
    }

    await interaction.editReply({
        content: "<@" + interaction.user.id + ">, voici le résultat du scan, pour y voir un peu mieux, zoomez !",
        files: [ path ]
    });
}