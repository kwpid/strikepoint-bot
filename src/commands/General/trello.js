const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trello')
        .setDescription('Shows recent Trello updates'),
    name: 'trello',
    category: 'General',
    async execute(interactionOrMessage, args, client) {
        const isInteraction = !interactionOrMessage.content;

        const embed = new EmbedBuilder()
            .setTitle('Trello Updates')
            .setDescription('Here are the recent updates from Trello:')
            .setColor('#0099FF')
            .addFields(
                { name: 'Update 1', value: 'Added new feature X', inline: false },
                { name: 'Update 2', value: 'Fixed bug Y', inline: false },
                { name: 'Link', value: '[Click here to view Board](https://trello.com)', inline: false }
            )
            .setFooter({ text: 'This is a placeholder for Trello API integration' });

        if (isInteraction) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await interactionOrMessage.reply({ embeds: [embed] });
        }
    },
};
