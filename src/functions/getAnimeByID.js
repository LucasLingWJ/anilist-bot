const {EmbedBuilder} = require('discord.js');
const anilist = require('anilist-node');
const Anilist = new anilist();
const pagination = require('../functions/pagination');

module.exports = async (interaction, animeID) => {
    var start_Day, end_Day, start_Month, end_Month, start_Year, end_Year;
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var romajiTitle, nativeTitle, englishTitle, description, color, format, countryOfOrigin, currentEpisode, totalEpisodes, nextAiringEpisode, timeTillAiring, status, startDate, endDate, season, genres, url, image, anilistID, malID, statusCurrentAmount, statusPlanningAmount, statusCompletedAmount, statusDroppedAmount, statusPausedAmount;
    var tag = ['\n', '<br>', '<BR>', '<b>', '</b>', '<i>', '</i>'];
    var tagReplace = ['', '\n', '\n', `**`, `**`, `_`, `_`];
    const embeds = [];

    Anilist.media.anime(animeID).then(data => {
        romajiTitle = data.title.romaji;
        nativeTitle = (data.title.native) ? data.title.native : '-';
        englishTitle = (data.title.english != null) ? data.title.english : '-';
        color = (data.coverImage.color) ? data.coverImage.color : '#000000';
        countryOfOrigin = data.countryOfOrigin;
        totalEpisodes = (data.episodes != null) ? data.episodes : '-';
        season = (data.season != null) ? data.season.charAt(0).toUpperCase() + data.season.slice(1).toLowerCase() + ' ' + data.seasonYear : '-';
        url = data.siteUrl;
        image = data.coverImage.large;
        anilistID = data.id;
        malID = (data.idMal != null) ? data.idMal : '-';

        description = (data.description) ? data.description : ' ';
        for(let i = 0; i <= tag.length - 1; i++){
            if(description.includes(tag[i]) == true){
                description = description.replaceAll(tag[i], tagReplace[i]);
            }
        }

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
        
        switch(data.status){
            case 'NOT_YET_RELEASED':
                currentEpisode = '-';
                if(data.nextAiringEpisode != null){
                    nextAiringEpisode = 'Episode ' + data.nextAiringEpisode.episode + ': <t:' + data.nextAiringEpisode.airingAt + '>';
                    timeTillAiring = '<t:' + data.nextAiringEpisode.airingAt + ':R>';
                }
                else{
                    nextAiringEpisode = '-';
                    timeTillAiring = '-';
                }
                
                status = 'Not Yet Released';
                break;
            case 'RELEASING':
                if(data.nextAiringEpisode.episode){
                    currentEpisode = data.nextAiringEpisode.episode - 1;
                    nextAiringEpisode = 'Episode ' + data.nextAiringEpisode.episode + ': <t:' + data.nextAiringEpisode.airingAt + '>';
                    timeTillAiring = '<t:' + data.nextAiringEpisode.airingAt + ':R>';
                }
                else{
                    currentEpisode = '-';
                    nextAiringEpisode = '-';
                    timeTillAiring = '-';
                }

                status = 'Releasing';
                break;
            case 'FINISHED':
                if(data.nextAiringEpisode == null){
                    currentEpisode = '-';
                    nextAiringEpisode = '-';
                    timeTillAiring = '-';
                }

                status = 'Finished';
                break;
            case 'CANCELLED':
                if(data.nextAiringEpisode == null){
                    currentEpisode = '-';
                    nextAiringEpisode = '-';
                    timeTillAiring = '-';
                }

                status = 'Cancelled';
                break;
        }

        if(data.startDate.day == null || data.startDate.month == null || data.startDate.year == null){ //Get Start Date
            startDate = '-';
        }
        else{
            start_Day = data.startDate.day;
            start_Month = month[data.startDate.month - 1];
            start_Year = data.startDate.year;
            startDate = start_Month + ' ' + start_Day + ' ' + start_Year;
        }

        if(data.endDate.day == null || data.endDate.month == null || data.endDate.year == null){ //Get End Date
            endDate = '-';
        }
        else{
            end_Day = data.endDate.day;
            end_Month = month[data.endDate.month - 1];
            end_Year = data.endDate.year;
            endDate = end_Month + ' ' + end_Day + ' ' + end_Year;
        }

        if(data.genres != null){
            for(var i = 0; i <= data.genres.length - 1; i++){
                if(i == 0){
                    genres = data.genres[i];
                }
                else{
                    genres = genres + ', ' + data.genres[i];
                }
            }
        }
        else{
            genres = '-';
        }

        for(var i = 0; i <= data.stats.statusDistribution.length - 1; i++){
            switch(i){
                case 0:
                    statusCurrentAmount = data.stats.statusDistribution[i].amount;
                    break;
                case 1:
                    statusPlanningAmount = data.stats.statusDistribution[i].amount;
                    break;
                case 2:
                    statusCompletedAmount = data.stats.statusDistribution[i].amount;
                    break;
                case 3:
                    statusDroppedAmount = data.stats.statusDistribution[i].amount;
                    break;
                case 4:
                    statusPausedAmount = data.stats.statusDistribution[i].amount;
                    break;
            }
        }

        //List of data extracted from the ID
        const animeData = {
            romajiTitle: romajiTitle,
            nativeTitle: nativeTitle,
            englishTitle: englishTitle,
            description: description,
            color: color,
            format: format,
            countryOfOrigin: countryOfOrigin,
            currentEpisode: currentEpisode,
            totalEpisodes: totalEpisodes,
            nextAiringEpisode: nextAiringEpisode,
            timeTillAiring: timeTillAiring,
            status: status,
            startDate: startDate,
            endDate: endDate,
            season: season,
            genres: genres,
            url: url,
            image: image,
            anilistID: anilistID,
            malID: malID,
            statusCurrentAmount: statusCurrentAmount,
            statusPlanningAmount: statusPlanningAmount,
            statusCompletedAmount: statusCompletedAmount,
            statusDroppedAmount: statusDroppedAmount,
            statusPausedAmount: statusPausedAmount,
        }

        //Choosing Embed based on conditions
        if(currentEpisode == '-' && nextAiringEpisode == '-' && timeTillAiring == '-'){
            var embedsPage1 = new EmbedBuilder()
            .setTitle(`**${animeData.romajiTitle}**`)
            .setDescription(
                `${animeData.description}\n\n` +
                `**Native Title:** ${animeData.nativeTitle}\n` +
                `**English Title:** ${animeData.englishTitle}\n` +
                `**Format:** ${animeData.format}\n` +
                `**Origin:** ${animeData.countryOfOrigin}\n` +
                `**Total Episodes:** ${animeData.totalEpisodes}\n` +
                `**Status:** ${animeData.status}\n` +
                `**Start Date:** ${animeData.startDate}\n` +
                `**End Date:** ${animeData.endDate}\n` +
                `**Season:** ${animeData.season}\n` +
                `**Genres: ** ${animeData.genres}\n`
            )
            .setColor(animeData.color)
            .setURL(animeData.url)
            .setImage(animeData.image)
            .setFooter({text: `Anilist: ${animeData.anilistID}\nMAL: ${animeData.malID}`})
        }
        else{
            var embedsPage1 = new EmbedBuilder()
            .setTitle(`**${animeData.romajiTitle}**`)
            .setDescription(animeData.description)
            .setColor(animeData.color)
            .addFields({name: 'Native Title', value: `${animeData.nativeTitle}`})
            .addFields({name: 'English Title', value: `${animeData.englishTitle}`})
            .addFields({name: 'Format', value: `${animeData.format}`, inline: true})
            .addFields({name: 'Origin', value: `${animeData.countryOfOrigin}`, inline: true})
            .addFields({name: '\u200B', value: '\u200B', inline: true})
            .addFields({name: 'Current Episode', value: `${animeData.currentEpisode}`, inline: true})
            .addFields({name: 'Total Episodes', value: `${animeData.totalEpisodes}`, inline: true})
            .addFields({name: '\u200B', value: '\u200B', inline: true})
            .addFields({name: 'Next Airing Episode', value: `${animeData.nextAiringEpisode}`, inline: true})
            .addFields({name: 'Time Till Airing', value: `${animeData.timeTillAiring}`, inline: true})
            .addFields({name: '\u200B', value: '\u200B', inline: true})
            .addFields({name: 'Status', value: `${animeData.status}`})
            .addFields({name: 'Start Date', value: `${animeData.startDate}`, inline: true})
            .addFields({name: 'End Date', value: `${animeData.endDate}`, inline: true})
            .addFields({name: '\u200B', value: '\u200B', inline: true})
            .addFields({name: 'Season', value: `${animeData.season}`})
            .addFields({name: 'Genres', value: `${animeData.genres}`})
            .setURL(animeData.url)
            .setImage(animeData.image)
            .setFooter({text: `Anilist: ${animeData.anilistID}\nMAL: ${animeData.malID}`})
        }

        const embedsPage2 = new EmbedBuilder()
        .setTitle(`**${animeData.romajiTitle}**`)
        .setDescription(
            `${animeData.description}\n\n` +
            `**Status Distribution**\n` +
            `**Current:** ${animeData.statusCurrentAmount}\n` +
            `**Planning:** ${animeData.statusPlanningAmount}\n` +
            `**Completed:** ${animeData.statusCompletedAmount}\n` +
            `**Dropped:** ${animeData.statusDroppedAmount}\n` +
            `**Paused:** ${animeData.statusPausedAmount}\n`
        )
        .setColor(animeData.color)
        .setURL(animeData.url)
        .setImage(animeData.image)
        .setFooter({text: `Anilist: ${animeData.anilistID}\nMAL: ${animeData.malID}`})

        //Push Embeds into Array for Pagination
        for(var i = 0; i < 2; i++){
            switch(i + 1){
                case 1:
                    embeds.push(embedsPage1);
                    break;
                case 2:
                    embeds.push(embedsPage2);
                    break;
            }
        }

        pagination(interaction, embeds);
    })
    .catch(error => {
        interaction.editReply('[ERROR] Invalid Anime ID');
    })
}