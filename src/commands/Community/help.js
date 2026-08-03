const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows the commands available for the bot'),
    
    async execute(interaction, client){
        const embed = new EmbedBuilder()
        .setTitle('Menhera-chan Help List')
        .setDescription('`/anilist` Access the Anilist database\n`/membercount` Total member count in the server\n`/ping` Shows the ping of the bot')
        .setThumbnail(client.user.displayAvatarURL());
        
        await wait(2000);
        await interaction.reply({embeds: [embed]});
    }
}