const { Client, Intents, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const glob = require('glob');
const { resolve } = require('path');

class client extends Client {
    constructor({
        token,
        client_id,
        guild_id
    } = {}) {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
            ]
        });

        this.commands = new Collection();

        this.token = token;
        this.client_id = client_id;
        this.guild_id = guild_id;

        this.once('ready', () => {
            this.load();
            console.log('Bot is ready!');
        });

        this.on('interactionCreate', async interaction => {
            if (!interaction.isCommand()) return;
        
            const command = this.commands.get(interaction.commandName);
        
            if (command) {
                try {
                    await command.execute(interaction);
                } catch (error) {
                    console.error(error);
                    await interaction.reply(
                        {  content: 'There was an error while executing this command!', ephemeral: true }
                    );
                }
            }
        });
    }

    load() {
        const files = glob.sync('./src/commands/**/*.js');

        for (const path of files) {
            const cmd = require(resolve(path));
            this.commands.set(cmd.data.name, cmd);
        }

        this.deploy();
    }

    deploy() {
        const rest = new REST({ version: '9' }).setToken(this.token);

        const commands = [...this.commands.values()]
            .map((cmd) => cmd.data.toJSON());

        try {
            rest.put(Routes.applicationGuildCommands(
                this.client_id, 
                this.guild_id
            ), 
            { 
                body: commands
            });

            console.log('Successfully registered application commands.');
        } catch (err) {
            console.log(err);
        }
    }

    init() {
        super.login(this.token);
    }
}

module.exports = client;