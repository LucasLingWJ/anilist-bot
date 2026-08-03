const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Total member count in the server'),

    async execute(interaction, client){
        await interaction.guild.members.fetch();

        const members = interaction.guild.members.cache;

        const totalMembers = interaction.guild.memberCount;
        const totalUsers = members.filter(m => !m.user.bot).size;
        const totalBots = members.filter(m => m.user.bot).size;

        const getStatusCount = (isBot, status) => members.filter(m => m.user.bot === isBot && m.id !== client.user.id && m.presence?.status === status).size;
        let online = getStatusCount(false, 'online') + getStatusCount(true, 'online');
        let idle = getStatusCount(false, 'idle') + getStatusCount(true, 'idle');
        let dnd = getStatusCount(false, 'dnd') + getStatusCount(true, 'dnd');

        switch(client.user.presence?.status){
            case 'online':
                online += 1;
                break;
            case 'idle':
                idle += 1;
                break;
            case 'dnd':
                dnd += 1;
                break;
        }

        const countStatus = online + idle + dnd;
        const invisible = totalMembers - countStatus;

        const embed = new EmbedBuilder()
        .setTitle('Member Count')
        .setDescription(`Displaying the total number of members in **${interaction.guild}**`)
        .addFields({name: 'Total Member Count', value: `${totalMembers}`})
        .addFields({name: 'Total Users', value: `${totalUsers}`})
        .addFields({name: 'Total Bots', value: `${totalBots}`})
        .addFields({name: 'Online', value: `${online}`})
        .addFields({name: 'Idle', value: `${idle}`})
        .addFields({name: 'Do Not Disturb', value: `${dnd}`})
        .addFields({name: 'Offline', value: `${invisible}`})
        .setThumbnail(client.user.displayAvatarURL());
        
        await wait(2000);
        await interaction.reply({embeds: [embed]});
    }
}