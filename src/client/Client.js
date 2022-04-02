const { Client, Intents, Collection } = require('discord.js');
const fs = require('node:fs');

class client extends Client {
    constructor({
        token
    } = {}) {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS
            ]
        });

        this.commands = new Collection();
        this.cache = new Collection();

        this.token = token;

        this.once('ready', () => console.log('Bot is ready!'));

        this.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            const command = this.commands.get(interaction.commandName);
        
            if (command) {
                try {
                    await command.execute(interaction, this);
                } catch (error) {
                    console.error(error);
                    await interaction.reply(
                        {  content: 'There was an error while executing this command!', ephemeral: true }
                    );
                }
            }
        });

        this.register();
    }

    register() {
        const files = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

        for (const path of files) {
            const cmd = require(`../commands/${path}`);
            this.commands.set(cmd.data.name, cmd);
        }
    }
}

module.exports = client;