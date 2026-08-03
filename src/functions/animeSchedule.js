const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

module.exports = async (interaction) => {
    let page = 1;

    const buildQuery = (page) => `
    {
        Page(page: ${page}, perPage: 5) {
            pageInfo {
                hasNextPage
            }
            airingSchedules(
                airingAt_greater: ${Math.floor(Date.now() / 1000)}
                sort: TIME
            ) {
                episode
                airingAt
                media {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                }
            }
        }
    }`;

    const fetchData = async (page) => {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ query: buildQuery(page) })
        });

        const json = await res.json();
        return json.data.Page;
    };

    const generateEmbed = (list, page) => {
        let description = "";
        const perPage = 5;

        list.forEach((item, i) => {
            const title = item.media.title.romaji;
            const english = item.media.title.english || '-';
            const native = item.media.title.native || '-';

            const index = (page - 1) * perPage + i + 1;

            description += `**${index}. ${title}**\n`;
            description += `> Native: ${native}\n`;
            description += `> English: ${english}\n`;
            description += `> ID: ${item.media.id}\n`;
            description += `> Episode: ${item.episode}\n`;
            description += `> Airs: <t:${item.airingAt}:F>\n`;
            description += `> In: <t:${item.airingAt}:R>\n\n`;
        });

        return new EmbedBuilder()
            .setTitle(`Upcoming Anime Episodes (Page ${page})`)
            .setDescription(description || "No data found")
    };

    const generateButtons = (hasNextPage, page) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 1),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!hasNextPage)
        );
    };

    //First load
    let data = await fetchData(page);

    const msg = await interaction.editReply({
        embeds: [generateEmbed(data.airingSchedules, page)],
        components: [generateButtons(data.pageInfo.hasNextPage, page)]
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (btn) => {
        if (btn.user.id !== interaction.user.id) {
            return btn.reply({ content: "Not your buttons.", ephemeral: true });
        }

        if (btn.customId === 'prev' && page > 1) page--;
        if (btn.customId === 'next') page++;

        const newData = await fetchData(page);

        await btn.update({
            embeds: [generateEmbed(newData.airingSchedules, page)],
            components: [generateButtons(newData.pageInfo.hasNextPage, page)]
        });
    });

    collector.on('end', async () => {
        await interaction.editReply({ components: [] });
    });
};