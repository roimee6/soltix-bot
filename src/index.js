const { Client, GatewayIntentBits } = require("discord.js");

global.config = require("./data/config.json");
global.util = require("./util/util.js");

global.commands = [];

global.client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

util.loadCommands();
util.loadEvents();

client.login(config.TOKEN);