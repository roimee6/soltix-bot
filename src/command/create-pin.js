const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = new SlashCommandBuilder()
    .setName("create-pin")
    .setDescription("Permet d'avoir un pin à donner à un utilisateur pour le verif");

module.exports.run = async function(interaction) {
    await interaction.deferReply();
    const pin = await util.request(null);

    console.log(pin);
    await interaction.editReply("<@" + interaction.user.id + ">, voici un pin qui vous permettra de scanner un joueur: ``" + pin + "``, ensuite executez la commande ``/scan " + pin + "`` et vous aurez accès à son scan !");
}