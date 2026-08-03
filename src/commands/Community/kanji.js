const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kanji')
    .setDescription('Search for a Kanji')
    .addStringOption(option =>
        option.setName('kanji')
        .setDescription('Kanji Character')
        .setMaxLength(1)
        .setRequired(true)
    ),
    
    async execute(interaction, client){
        var kanjichar;
        switch(interaction.options.getString('kanji')){
            case '日':
                kanjichar = {
                    kunyomi: "ひ, -び, -か",
                    onyomi: "ニチ, ジツ",
                    strokecount: "4",
                    meaning: "day, sun, Japan, counter for days"
                };
                break;
            case '一':
                kanjichar = {
                    kunyomi: "ひと-, ひと.つ",
                    onyomi: "イチ, イツ",
                    strokecount: "1",
                    meaning: "one, one radical (no.1)"
                };
                break;
        }

        console.log(kanjichar.kunyomi);
    }
}