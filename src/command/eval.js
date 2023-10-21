const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = new SlashCommandBuilder()
    .setName("eval")
    .setDescription("Execute un bout de code depuis le programme du bot")
    .addStringOption((option) => option.setName("code").setDescription("📝 Code JavaScript qui sera executé").setRequired(true));

module.exports.run = async function(interaction) {
    const code = await interaction.options.getString("code");

    if (!config.OWNERS.includes(interaction.user.id)) {
        return;
    }

    try {
        const evaled = eval(code);
        interaction.reply(`\`\`\`js\n${evaled}\n\`\`\``);
    } catch (err) {
        interaction.reply(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
    }
}