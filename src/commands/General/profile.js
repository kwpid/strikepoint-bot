const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Shows a user\'s Roblox profile and stats')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to lookup')
                .setRequired(false)),
    name: 'profile',
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

        const { BLOXLINK_API_KEY, BLOXLINK_GUILD_ID } = process.env;

        // Determine target user
        let targetUser;

        if (isInteraction) {
            targetUser = interactionOrMessage.options.getUser('user') || interactionOrMessage.user;
            await interactionOrMessage.deferReply();
        } else {
            // Check if first arg is a mention
            const mentionMatch = args[0] ? args[0].match(/^<@!?(\d+)>$/) : null;
            if (mentionMatch) {
                try {
                    targetUser = await client.users.fetch(mentionMatch[1]);
                } catch {
                    targetUser = interactionOrMessage.author;
                }
            } else {
                targetUser = interactionOrMessage.author;
            }
        }

        // Use configured GUILD_ID or the one requested by user (1461521777191813152) as default
        const lookupGuildId = BLOXLINK_GUILD_ID || '1461521777191813152';

        if (!BLOXLINK_API_KEY) {
            return reply({ content: '❌ Bloxlink configuration is missing. Please set BLOXLINK_API_KEY.', ephemeral: true });
        }

        try {
            // 1. Resolve Discord ID to Roblox ID using Bloxlink
            // Documentation implies: https://api.blox.link/v4/public/guilds/{guildId}/discord-to-roblox/{discordId}

            let robloxId = null;

            const bloxlinkRes = await fetch(`https://api.blox.link/v4/public/guilds/${lookupGuildId}/discord-to-roblox/${targetUser.id}`, {
                headers: {
                    'Authorization': BLOXLINK_API_KEY
                }
            });

            if (bloxlinkRes.ok) {
                const data = await bloxlinkRes.json();
                robloxId = data.robloxID;
            } else {
                if (bloxlinkRes.status === 404) {
                    return reply({ content: `❌ **${targetUser.username}** is not linked with Bloxlink in server ID ${lookupGuildId}.` });
                }
                const errorText = await bloxlinkRes.text();
                console.error('Bloxlink Error:', errorText);
                return reply({ content: `❌ Failed to fetch Bloxlink data. (API Status: ${bloxlinkRes.status})` });
            }

            if (!robloxId) {
                return reply({ content: `❌ Could not find a Roblox account linked to **${targetUser.username}**.` });
            }

            // 2. Fetch Roblox User Info
            const userRes = await fetch(`https://users.roblox.com/v1/users/${robloxId}`);
            if (!userRes.ok) throw new Error('Failed to fetch Roblox user data');
            const userData = await userRes.json();

            // 3. Fetch Thumbnail
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=420x420&format=Png&isCircular=false`);
            let thumbUrl = 'https://tr.rbxcdn.com/53eb9b17fe1432a809c73a13889b5006/420/420/Image/Png'; // Fallback
            if (thumbRes.ok) {
                const thumbData = await thumbRes.json();
                if (thumbData.data && thumbData.data.length > 0) {
                    thumbUrl = thumbData.data[0].imageUrl;
                }
            }

            // 4. Build Embed with Placeholders for In-Game Stats
            const embed = new EmbedBuilder()
                .setTitle(`${userData.name || userData.displayName}'s Profile`)
                .setURL(`https://www.roblox.com/users/${robloxId}/profile`)
                .setDescription(`**Discord:** <@${targetUser.id}>`)
                .setThumbnail(thumbUrl)
                .setColor('#2B2D31')
                .addFields(
                    { name: 'Roblox ID', value: `${robloxId}`, inline: true },
                    { name: 'Created', value: `<t:${Math.floor(new Date(userData.created).getTime() / 1000)}:d>`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }, // Spacer

                    // Placeholder Stats
                    { name: 'Wins', value: '0', inline: true },
                    { name: 'Losses', value: '0', inline: true },
                    { name: 'Rank', value: 'Bronze I', inline: true }
                )
                .setFooter({ text: 'Stats are placeholders', iconURL: client.user.displayAvatarURL() })
                .setTimestamp();

            await reply({ embeds: [embed] });

        } catch (error) {
            console.error('Profile Command Error:', error);
            await reply({ content: '❌ An error occurred while fetching profile data.' });
        }
    },
};
