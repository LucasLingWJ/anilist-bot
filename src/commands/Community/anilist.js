const {
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const anilist = require('anilist-node');
const Anilist = new anilist();
const getAnimeByID = require('../../functions/getAnimeByID.js');
const getMangaByID = require('../../functions/getMangaByID.js');
const animeSchedule = require('../../functions/animeSchedule.js');

module.exports = {
    data: new SlashCommandBuilder()
    //Search Anime
    .setName('anilist')
    .setDescription('Access the Anilist database')
    .addSubcommandGroup(group => group
        .setName('anime')
        .setDescription('Search an Anime')
        .addSubcommand(subcommand => subcommand
            .setName('search-by-id')
            .setDescription('Search an Anime by ID')
            .addIntegerOption(option =>
                option.setName('anime-id')
                .setDescription('ID of the Anime')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('search-by-name')
            .setDescription('Search an Anime by Name')
            .addStringOption(option =>
                option.setName('anime-name')
                .setDescription('Name of the Anime')
                .setMaxLength(500)
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('schedule')
            .setDescription('Get upcoming airing anime episodes')
        )
    )
    //Search Manga
    .addSubcommandGroup(group => group
        .setName('manga')
        .setDescription('Search a Manga')
        .addSubcommand(subcommand =>
            subcommand
            .setName('search-by-id')
            .setDescription('Search a Manga by ID')
            .addIntegerOption(option =>
                option.setName('manga-id')
                .setDescription('ID of the Manga')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand => subcommand
            .setName('search-by-name')
            .setDescription('Search a Manga by Name')
            .addStringOption(option =>
                option.setName('manga-name')
                .setDescription('Name of the Manga')
                .setMaxLength(500)
                .setRequired(true)
            )
        )
    ),

    async execute(interaction, client){
        async function getAnimeType(animeID){
            const data = await Anilist.media.anime(animeID);

            let format;
            switch(data.format){
                case 'TV':
                    format = data.format;
                    break;
                case 'MOVIE':
                    format = data.format.charAt(0).toUpperCase() + data.format.substring(1,5).toLowerCase();
                    break;
                case 'TV_SHORT':
                    format = data.format.substring(0,2) + ' ' + data.format.charAt(3).toUpperCase() + data.format.substring(4,8).toLowerCase();
                    break;
                case 'SPECIAL':
                    format = data.format.charAt(0).toUpperCase() + data.format.substring(1,7).toLowerCase();
                    break;
                case 'OVA':
                    format = data.format;
                    break;
                case 'ONA':
                    format = data.format;
                    break;
                case 'MUSIC':
                    format = data.format.charAt(0).toUpperCase() + data.format.substring(1,5).toLowerCase();
                    break;
                default:
                    format = '-';
                    break;
            }

            return format;
        }

        async function getMangaType(mangaID){
            const data = await Anilist.media.manga(mangaID);

            let format;
            switch(data.format){
                case 'MANGA':
                    format = data.format.charAt(0).toUpperCase() + data.format.substring(1,5).toLowerCase();
                    break;
                case 'NOVEL':
                    format = 'Light ' + data.format.charAt(0).toUpperCase() + data.format.substring(1,5).toLowerCase();
                    break;
                case 'ONE_SHOT':
                    format = data.format.charAt(0).toUpperCase() + data.format.substring(1,3).toLowerCase() + ' ' + data.format.charAt(4).toUpperCase() + data.format.substring(5,8).toLowerCase();
                    break;
                default:
                    format = '-';
                    break;
            }

            return format;
        }

        //Slash Commands
        //Search Anime By ID
        if(interaction.options.getSubcommandGroup('anime') && interaction.options.getSubcommand('search-by-id') && interaction.options.getInteger('anime-id')){
            await interaction.deferReply();
            const id = interaction.options.getInteger('anime-id');

            try {
                await getAnimeByID(interaction, id);
            } 
            catch (error) {
                await interaction.editReply('[ERROR] Invalid Anime ID');
            }
        }
        //Search Manga By ID
        else if(interaction.options.getSubcommandGroup('manga') && interaction.options.getSubcommand('search-by-id') && interaction.options.getInteger('manga-id')){
            await interaction.deferReply();
            const id = interaction.options.getInteger('manga-id');

            try {
                await getMangaByID(interaction, id);
            } 
            catch (error) {
                await interaction.editReply('[ERROR] Invalid Manga ID');
            }
        }
        //Search Anime By Name
        else if(interaction.options.getSubcommandGroup('anime') && interaction.options.getSubcommand('search-by-name') && interaction.options.getString('anime-name')){
            await interaction.deferReply();
            const name = interaction.options.getString('anime-name');   //Get the anime name entered by the user
            const mediaList = [];   //Array to store formatted search results

            //Search AniList for up to 5 anime matching the name
            Anilist.searchEntry.anime(name, null, 1, 5).then(async data => {
                //Check that at least one result exists
                if(data.media[0].id){
                    for(let i = 0; i < data.media.length; ++i){
                        const mediaID = data.media[i].id;
                        const romajiTitle = " - " + data.media[i].title.romaji;
                        const englishTitle = (data.media[i].title.english && data.media[i].title.romaji != data.media[i].title.english) ? " / " + data.media[i].title.english : "";
                        if(romajiTitle == englishTitle){englishTitle = "";}
                        const animeType = await getAnimeType(data.media[i].id);
                        mediaList[i] = mediaID + romajiTitle + englishTitle + " (" + animeType + ")";
                    }
                }

                //Combine all search results into one string
                var mediaListConcat = "";
                for(let i = 0; i < data.media.length; ++i){
                    mediaListConcat = mediaListConcat.concat(`\n[${i + 1}] ` + mediaList[i]);
                }

                //Create an embed displaying the search results
                const embedsSearch = new EmbedBuilder()
                .setTitle("Search Anime by Name")
                .setDescription("Type a number to choose:\n" + mediaListConcat)

                //Send the embed
                await interaction.editReply({
                    embeds: [embedsSearch]
                });

                //Only accept messages from the user who ran the command
                const filter = m => {
                    return m.author.id === interaction.user.id && !m.author.bot;
                };

                //Wait up to 15 seconds for one reply
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                //When the user sends a message
                collector.on('collect', async (message) => {
                    const index = parseInt(message.content);    //Convert the user's message into a number

                    //Check if the number is valid
                    if (!isNaN(index) && index >= 1 && index <= data.media.length) {
                        await getAnimeByID(interaction, data.media[index - 1].id);
                    }
                    else {
                        await interaction.followUp({
                            content: '[ERROR] Please enter a number between 1 and ' + data.media.length,
                            ephemeral: true
                        });
                    }
                });

                //Runs when the collector stops
                collector.on('end', async (collected) => {
                    if (collected.size === 0) {
                        await interaction.followUp({
                            content: '[ERROR] Search timed out.',
                            ephemeral: true
                        });
                    }
                });
            })
            .catch(error => {
                interaction.followUp('[ERROR] Invalid Anime Name');
            })
        }
        //Search Manga By Name
        else if(interaction.options.getSubcommandGroup('manga') && interaction.options.getSubcommand('search-by-name') && interaction.options.getString('manga-name')){
            await interaction.deferReply();
            const name = interaction.options.getString('manga-name');   //Get the manga name entered by the user
            const mediaList = [];   //Array to store formatted search results

            //Search AniList for up to 5 manga matching the name
            Anilist.searchEntry.manga(name, null, 1, 5).then(async data => {
                //Check that at least one result exists
                if(data.media[0].id){
                    for(let i = 0; i < data.media.length; ++i){
                        const mediaID = data.media[i].id;
                        const romajiTitle = " - " + data.media[i].title.romaji;
                        const englishTitle = (data.media[i].title.english && data.media[i].title.romaji != data.media[i].title.english) ? " / " + data.media[i].title.english : "";
                        const mangaType = await getMangaType(data.media[i].id);
                        mediaList[i] = mediaID + romajiTitle + englishTitle + " (" + mangaType + ")";
                    }
                }

                //Combine all search results into one string
                var mediaListConcat = "";
                for(let i = 0; i < data.media.length; ++i){
                    mediaListConcat = mediaListConcat.concat(`\n[${i + 1}] ` + mediaList[i]);
                }

                //Create an embed displaying the search results
                const embedsSearch = new EmbedBuilder()
                .setTitle("Search Manga by Name")
                .setDescription("Search an entry by typing the number\n" + mediaListConcat)

                //Send the embed
                await interaction.editReply({
                    embeds: [embedsSearch]
                });

                //Only accept messages from the user who ran the command
                const filter = m => {
                    return m.author.id === interaction.user.id && !m.author.bot;
                };

                //Wait up to 15 seconds for one reply
                const collector = interaction.channel.createMessageCollector({
                    filter,
                    time: 15000,
                    max: 1
                });

                //When the user sends a message
                collector.on('collect', async (message) => {
                    const index = parseInt(message.content);    //Convert the user's message into a number

                    //Check if the number is valid
                    if (!isNaN(index) && index >= 1 && index <= data.media.length) {
                        await getMangaByID(interaction, data.media[index - 1].id);
                    }
                    else {
                        await interaction.followUp({
                            content: '[ERROR] Please enter a number between 1 and ' + data.media.length,
                            ephemeral: true
                        });
                    }
                });

                //Runs when the collector stops
                collector.on('end', async (collected) => {
                    if (collected.size === 0) {
                        await interaction.followUp({
                            content: '[ERROR] Search timed out.',
                            ephemeral: true
                        });
                    }
                });
            })
            .catch(error => {
                interaction.followUp('[ERROR] Invalid Manga Name');
            })
        }
        else if (interaction.options.getSubcommandGroup('anime') && interaction.options.getSubcommand('schedule')){
            try{
                await interaction.deferReply();

                await animeSchedule(interaction);
            }
            catch(error){
                console.error(error);
                if (interaction.deferred || interaction.replied) {
                    return interaction.editReply('[ERROR] Failed to fetch anime schedule');
                } else {
                    return interaction.reply('[ERROR] Failed to fetch anime schedule');
                }
            }
        }
    }
}