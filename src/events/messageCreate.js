const config = require('../config');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // Check for standard prefix
        const startsWithPrefix = message.content.startsWith(config.prefix);

        if (!startsWithPrefix) return;

        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandInput = args.shift();

        if (!commandInput) return; // "s!" only

        const commandName = commandInput.toLowerCase();

        let command = client.commands.get(commandName);

        // Special handling for "s! @user" -> treat as "s! profile @user"
        // Check if commandName matches a user mention format: <@123> or <@!123>
        if (!command && commandName.match(/^<@!?\d+>$/)) {
            command = client.commands.get('profile');
            // We need to inject the mention back into args so the profile command can read it
            // Current args would be empty or following text.
            // commandInput is the mention.
            args.unshift(commandInput);
        }

        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(error);
            await message.reply('There was an error executing that command!');
        }
    },
};
