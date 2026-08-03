//Import required classes and utilities from discord.js
const {
    Client,
    GatewayIntentBits, 
    ActivityType,
    EmbedBuilder,
    PermissionsBitField,
    Permissions,
    MessageManager,
    Embed,
    Collection
} = require('discord.js');

//Import Node.js file system module
const fs = require('node:fs');

//Create a new Discord client and specify which gateway intents the bot will use
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,               //Access server information
        GatewayIntentBits.GuildMembers,         //Access member join/leave/update events
        GatewayIntentBits.GuildMessages,        //Receive messages sent in servers
        GatewayIntentBits.GuildPresences,       //Receive member presence updates (Online/Idle/DND/Offline)
        GatewayIntentBits.MessageContent,       //Read the content of messages
        GatewayIntentBits.GuildVoiceStates,     //Track voice channel activity
    ]
});

//Create a collection to store slash commands
client.commands = new Collection();

//Load environment variables from the .env file
require('dotenv').config();

//Get all function files that contain "handleCommands" or "handleEvents"
const functions = fs.readdirSync("./src/functions").filter(file => file.includes("handleCommands") || file.includes("handleEvents"));
//Get all event files inside the events folder
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
//Get all command category folders
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    //Load all handler functions
    for (file of functions) {
        require(`./src/functions/${file}`)(client);
    }

    //Register all event handlers
    client.handleEvents(eventFiles, "./src/events");

    //Register all slash commands
    client.handleCommands(commandFolders, "./src/commands");

    //Log the bot into Discord using the token from the .env file
    client.login(process.env.DISCORD_TOKEN)
})();

/*=========================================
Required Packages
=========================================*/
//npm install discord.js - Module for Discord
//npm install bufferutil - For much faster WebSocket Connection
//npm install @discordjs/voice - For interacting with the Discord Voice API