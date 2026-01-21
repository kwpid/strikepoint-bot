const { loadFiles } = require('../utils/fileLoader');
const ascii = require('ascii-table');

async function loadEvents(client) {
    const table = new ascii().setHeading('Event', 'Status');

    const files = await loadFiles('src/events');
    for (const file of files) {
        try {
            const event = require(file);
            const execute = (...args) => event.execute(...args, client);
            const target = event.rest ? client.rest : client;

            if (event.once) {
                target.once(event.name, execute);
            } else {
                target.on(event.name, execute);
            }

            table.addRow(event.name, '🟩');
        } catch (error) {
            table.addRow(file, `🟥 ${error.message}`);
        }
    }
    console.log(table.toString(), '\nLoaded Events.');
}

module.exports = { loadEvents };
