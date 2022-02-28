const Client = require('./client/Client.js');
require('dotenv').config();

const client = new Client({
    token: process.env.BOT_TOKEN
});

client.init();