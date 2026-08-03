const {ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType} = require('discord.js');

module.exports = async (interaction, pages, time = 120 * 1000) => {
    try{
        if(!interaction || !pages || !pages > 0) throw new Error('[Error] Pagination Invalid Arguments');

        if(pages.length === 1){
            return await interaction.editReply({embeds: pages, components: [], fetchReply: true})
        }

        //Embed Buttons
        var index = 0;

        const previousPage = new ButtonBuilder()
        .setCustomId('pageprevious')
        .setEmoji('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

        const nextPage = new ButtonBuilder()
        .setCustomId('pagenext')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Primary);

        const pageCount = new ButtonBuilder()
        .setCustomId('pagecount')
        .setLabel(`${index + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

        const buttons = new ActionRowBuilder().addComponents([previousPage, pageCount, nextPage]);

        const message = await interaction.followUp({embeds: [pages[index]], components: [buttons], fetchReply: true});
        
        const collector = await message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            if(i.user.id !== interaction.user.id) return i.reply({content: `Only **${interaction.user.username} can use these buttons!`, ephemeral: true});

            await i.deferUpdate();

            if(i.customId === 'pageprevious'){
                if(index > 0) index--;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }
            else if(i.customId === 'pagenext'){
                if(index < pages.length - 1) index++;
                pageCount.setLabel(`${index + 1}/${pages.length}`);
            }

            if(index === 0){
                previousPage.setDisabled(true)
            }
            else{
                previousPage.setDisabled(false)
            }

            if(index === pages.length - 1){
                nextPage.setDisabled(true)
            }
            else{
                nextPage.setDisabled(false)
            }

            await message.edit({embeds: [pages[index]], components: [buttons]}).catch(err => {});

            collector.resetTimer();
        });

        collector.on("end", async () => {
            await message.edit({embeds: [pages[index]], components: [buttons]}).catch(err => {});
        })

        return message;
    }
    catch (error) {
        console.error(`[ERROR] ${error}`)
    }
}
    