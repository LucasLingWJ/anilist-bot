const {
    Interaction,
    ActionRowBuilder,
    ButtonBuilder
} = require("discord.js");

const getAnimeByID = require('../functions/getAnimeByID');
const getMangaByID = require('../functions/getMangaByID');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        //Slash Commands
        if(!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if(!command) return;
        
        try{
            await command.execute(interaction, client);
        }
        catch(error){
            console.log(`[ERROR] ${error}`);
            await interaction.reply({
                content: 'There was an error while executing this command!', 
                ephemeral: true
            });
        }

        //Buttons
        if(!interaction.isButton()) return;

        if(!interaction.customId.startsWith('anime_') && !interaction.customId.startsWith('manga_')) return;

    },
    


};