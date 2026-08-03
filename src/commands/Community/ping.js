const {SlashCommandBuilder} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Shows the ping of the bot'),
    
    async execute(interaction, client){
        await interaction.reply({content: 'Ping is being measured...'})

        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        
        await wait(2000);
        await interaction.editReply({content: `Bot Latency: ${ping} ms | API Latency: ${client.ws.ping} ms`});
    }
}