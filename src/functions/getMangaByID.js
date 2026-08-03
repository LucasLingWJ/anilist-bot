const {EmbedBuilder} = require('discord.js');
const anilist = require('anilist-node');
const Anilist = new anilist();
const pagination = require('../functions/pagination');

module.exports = async (interaction, mangaID) => {
    var start_Day, end_Day, start_Month, end_Month, start_Year, end_Year;
    var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var romajiTitle, nativeTitle, englishTitle, description, color, format, countryOfOrigin, chapters, volumes, status, startDate, endDate, genres, url, image, anilistID, malID, statusCurrentAmount, statusPlanningAmount, statusCompletedAmount, statusDroppedAmount, statusPausedAmount;
    var tag = ['\n', '<br>', '<BR>', '<b>', '</b>', '<i>', '</i>'];
    var tagReplace = ['', '\n', '\n', `**`, `**`, `_`, `_`];
    const embeds = [];

    Anilist.media.manga(mangaID).then(data => {
        romajiTitle = data.title.romaji;
        nativeTitle = (data.title.native) ? data.title.native : '-';
        englishTitle = (data.title.english != null) ? data.title.english : '-';
        color = (data.coverImage.color) ? data.coverImage.color : '#ffffff';
        countryOfOrigin = data.countryOfOrigin;
        chapters = (data.chapters != null) ? data.chapters : '-';
        volumes = (data.volumes != null) ? data.volumes : '-';
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

        switch(data.status){
            case 'NOT_YET_RELEASED':
                status = 'Not Yet Released';
                break;
            case 'RELEASING':
                status = 'Releasing';
                break;
            case 'FINISHED':
                status = 'Finished';
                break;
            case 'CANCELLED':
                status = 'Cancelled';
                break;
        }
        
        if(data.startDate.day == null || data.startDate.month == null || data.startDate.year == null){
            startDate = '-';
        }
        else{
            start_Day = data.startDate.day;
            start_Month = month[data.startDate.month - 1];
            start_Year = data.startDate.year;
            startDate = start_Month + ' ' + start_Day + ' ' + start_Year;
        }

        if(data.endDate.day == null || data.endDate.month == null || data.endDate.year == null){
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
        const mangaData = {
            romajiTitle: romajiTitle,
            nativeTitle: nativeTitle,
            englishTitle: englishTitle,
            description: description,
            color: color,
            format: format,
            countryOfOrigin: countryOfOrigin,
            chapters: chapters,
            volumes: volumes,
            status: status,
            startDate: startDate,
            endDate: endDate,
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

        const embedsPage1 = new EmbedBuilder()
        .setTitle(`**${mangaData.romajiTitle}**`)
        .setDescription(mangaData.description)
        .setColor(mangaData.color)
        .addFields({name: 'Native Title', value: `${mangaData.nativeTitle}`})
        .addFields({name: 'English Title', value: `${mangaData.englishTitle}`})
        .addFields({name: 'Format', value: `${mangaData.format}`, inline: true})
        .addFields({name: 'Origin', value: `${mangaData.countryOfOrigin}`, inline: true})
        .addFields({name: '\u200B', value: '\u200B', inline: true})
        .addFields({name: 'Chapters', value: `${mangaData.chapters}`, inline: true})
        .addFields({name: 'Volumes', value: `${mangaData.volumes}`, inline: true})
        .addFields({name: '\u200B', value: '\u200B', inline: true})
        .addFields({name: 'Status', value: `${mangaData.status}`})
        .addFields({name: 'Start Date', value: `${mangaData.startDate}`, inline: true})
        .addFields({name: 'End Date', value: `${mangaData.endDate}`, inline: true})
        .addFields({name: '\u200B', value: '\u200B', inline: true})
        .addFields({name: 'Genres', value: `${mangaData.genres}`})
        .setURL(mangaData.url)
        .setImage(mangaData.image)
        .setFooter({text: `Anilist: ${mangaData.anilistID}\nMAL: ${mangaData.malID}`})
        
        const embedsPage2 = new EmbedBuilder()
        .setTitle(`**${mangaData.romajiTitle}**`)
        .setDescription(
            `${mangaData.description}\n\n` +
            `**Status Distribution**\n` +
            `**Current:** ${mangaData.statusCurrentAmount}\n` +
            `**Planning:** ${mangaData.statusPlanningAmount}\n` +
            `**Completed:** ${mangaData.statusCompletedAmount}\n` +
            `**Dropped:** ${mangaData.statusDroppedAmount}\n` +
            `**Paused:** ${mangaData.statusPausedAmount}\n`
        )
        .setColor(mangaData.color)
        .setURL(mangaData.url)
        .setImage(mangaData.image)
        .setFooter({text: `Anilist: ${mangaData.anilistID}\nMAL: ${mangaData.malID}`})

        //Push Embeds into Array for Pagination
        for(var i = 0; i < 2; i++){
            if(i + 1 == 1) embeds.push(embedsPage1);
            else if(i + 1 == 2) embeds.push(embedsPage2);
        }

        pagination(interaction, embeds);
    })
    .catch(error => {
        interaction.editReply('[ERROR] Invalid Manga ID');
    })
}