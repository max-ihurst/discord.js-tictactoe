const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Lists you my commands.'),
    async execute(interaction, client) {
        const embed = new MessageEmbed();
        const commands = [...client.commands.values()];

        for (const cmd of commands) {
            const data = cmd.data.toJSON();

            embed.addFields(
                {
                    name: data.name,
                    value: data.description
                }
            );
        }

        embed
            .setColor('#33ADFF')
            .setDescription('Helping...');

        await interaction.reply(
            {
                embeds: [ embed ],
                ephemeral: true
            }
        );
    },
};