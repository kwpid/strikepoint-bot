const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trello')
        .setDescription('Shows recent Trello updates'),
    name: 'trello',
    category: 'General',
    async execute(interactionOrMessage, args, client) {
        const isInteraction = !interactionOrMessage.content;

        // Helper to reply
        const reply = async (content) => {
            if (isInteraction) {
                if (interactionOrMessage.deferred) {
                    await interactionOrMessage.editReply(content);
                } else {
                    await interactionOrMessage.reply(content);
                }
            } else {
                await interactionOrMessage.reply(content);
            }
        };

        const { TRELLO_API_KEY, TRELLO_TOKEN, TRELLO_BOARD_ID } = process.env;

        if (!TRELLO_API_KEY || !TRELLO_TOKEN || !TRELLO_BOARD_ID) {
            return reply({ content: '❌ Trello configuration is missing. Please set TRELLO_API_KEY, TRELLO_TOKEN, and TRELLO_BOARD_ID.', ephemeral: true });
        }

        try {
            if (isInteraction) await interactionOrMessage.deferReply();

            // 1. Get Lists from Board
            const listsResponse = await fetch(`https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`);
            if (!listsResponse.ok) throw new Error('Failed to fetch Trello lists');
            const lists = await listsResponse.json();

            // Find a list that might contain updates (e.g., "Done", "Completed", "Updates", "Changelog")
            // Priority: "Completed" > "Done" > "Updates" > "Changelog" > First List
            const updateList = lists.find(l => l.name.match(/Completed/i))
                || lists.find(l => l.name.match(/Done/i))
                || lists.find(l => l.name.match(/Updates/i))
                || lists.find(l => l.name.match(/Changelog/i))
                || lists[0];

            if (!updateList) {
                return reply({ content: '❌ Could not find a suitable list on the Trello board.' });
            }

            // 2. Get Cards from that List (Limit 5)
            const cardsResponse = await fetch(`https://api.trello.com/1/lists/${updateList.id}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&limit=5`);
            if (!cardsResponse.ok) throw new Error('Failed to fetch Trello cards');
            const cards = await cardsResponse.json();

            const embed = new EmbedBuilder()
                .setTitle(`Trello: ${updateList.name}`)
                .setDescription(`Latest updates from [Trello Board](https://trello.com/b/${TRELLO_BOARD_ID})`)
                .setColor('#0099FF')
                .setFooter({ text: 'Powered by Trello' })
                .setTimestamp();

            if (cards.length === 0) {
                embed.addFields({ name: 'No updates', value: 'No cards found in this list.' });
            } else {
                cards.forEach(card => {
                    embed.addFields({
                        name: card.name,
                        value: card.desc ? (card.desc.length > 100 ? card.desc.substring(0, 97) + '...' : card.desc) : 'No description',
                        inline: false
                    });
                });
            }

            await reply({ embeds: [embed] });

        } catch (error) {
            console.error('Trello Command Error:', error);
            await reply({ content: '❌ An error occurred while fetching Trello updates.' });
        }
    },
};
