const { loadFiles } = require('../utils/fileLoader');
const ascii = require('ascii-table');

async function loadCommands(client) {
    const table = new ascii().setHeading('Command', 'Status');

    await client.commands.clear();
    await client.slashCommands.clear();

    const files = await loadFiles('src/commands');

    let slashCommandsArray = [];

    for (const file of files) {
        const command = require(file);

        // Handle slash commands
        if (command.data) {
            client.slashCommands.set(command.data.name, command);
            slashCommandsArray.push(command.data.toJSON());
            table.addRow(command.data.name, '🟩 Slash');
        }

        // Handle prefix commands (can exist alongside slash)
        if (command.name) {
            client.commands.set(command.name, command);
            table.addRow(command.name, '🟩 Prefix');
        }

        if (!command.data && !command.name) {
            table.addRow(file.split('/').pop(), '🟥 No name/data');
        }
    }

    client.application.commands.set(slashCommandsArray);

    console.log(table.toString(), '\nLoaded Commands.');
}

module.exports = { loadCommands };
