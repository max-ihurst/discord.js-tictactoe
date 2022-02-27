const Client = require('./client/Client.js');
require('dotenv').config();

const client = new Client({
    token: process.env.BOT_TOKEN,
    client_id: process.env.CLIENT_ID,
    guild_id: process.env.GUILD_ID
});

client.init();