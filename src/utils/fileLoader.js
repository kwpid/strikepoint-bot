const { glob } = require('glob');
const path = require('path');

async function loadFiles(dirName) {
    const files = await glob(path.join(process.cwd(), dirName, '**/*.js').replace(/\\/g, '/'));
    const jsFiles = files.filter(file => path.extname(file) === '.js');
    return jsFiles;
}

module.exports = { loadFiles };
