const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),
    name: 'help',
    category: 'Utils',
    async execute(interactionOrMessage, args, client) {
        const isInteraction = !interactionOrMessage.content;
        const targetClient = isInteraction ? interactionOrMessage.client : client;
        const authorId = isInteraction ? interactionOrMessage.user.id : interactionOrMessage.author.id;

        const emojis = {
            Utils: '🛠️',
            General: '📜',
        };

        const directories = [
            ...new Set(targetClient.commands.map(cmd => cmd.category)),
            ...new Set(targetClient.slashCommands.map(cmd => cmd.category))
        ].filter(Boolean);

        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands = (collection) => collection
                .filter((cmd) => cmd.category === dir)
                .map((cmd) => {
                    return {
                        name: cmd.data?.name || cmd.name,
                        description: cmd.data?.description || 'No description',
                    };
                });

            const commands = [
                ...getCommands(targetClient.commands),
                ...getCommands(targetClient.slashCommands)
            ];

            // Deduplicate based on name
            const uniqueCommands = Array.from(new Map(commands.map(item => [item.name, item])).values());

            return {
                directory: formatString(dir),
                commands: uniqueCommands,
            };
        });

        const initialEmbed = new EmbedBuilder()
            .setTitle('STRIKEPOINT Help')
            .setDescription('Please select a category from the dropdown menu to see the commands.')
            .setColor('#5865F2');

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help-menu')
                    .setPlaceholder('Select a category')
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => ({
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `Commands from ${cmd.directory} category`,
                            emoji: emojis[cmd.directory] || '📂',
                        }))
                    )
            ),
        ];

        const initialMessage = await (isInteraction
            ? interactionOrMessage.reply({ embeds: [initialEmbed], components: components(false), fetchReply: true })
            : interactionOrMessage.reply({ embeds: [initialEmbed], components: components(false) }));

        const collector = initialMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== authorId) {
                return interaction.reply({ content: 'This menu is not for you! Run /help to get your own.', ephemeral: true });
            }

            const [directory] = interaction.values;
            const category = categories.find(x => x.directory.toLowerCase() === directory);

            const categoryEmbed = new EmbedBuilder()
                .setTitle(`${emojis[category.directory] || '📂'} ${category.directory} Commands`)
                .setDescription(category.commands.map(cmd => `**${cmd.name}**: ${cmd.description}`).join('\n'))
                .setColor('#5865F2');

            await interaction.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            // We can't edit ephemeral messages if the token expired but usually help is public.
            // If original was ephemeral, we might check. But here we assume public for now or normal reply.
            // Best effort to disable.
            if (initialMessage.editable) {
                initialMessage.edit({ components: components(true) }).catch(() => { });
            }
        });
    },
};
