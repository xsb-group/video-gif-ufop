/**
 * global env
 */

const fs = require('fs');
console.log(__dirname)
const userEnvFile = `${__dirname}/.ufop.conf`;
const globalEnvFile = `${__dirname}/.ufop.conf.example`;


const envFilePath = fs.existsSync(userEnvFile) ? userEnvFile : globalEnvFile;

// global env
require('dotenv-safe').load({
    allowEmptyValues: true,
    sample: globalEnvFile,
    path: envFilePath
});
