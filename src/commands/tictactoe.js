const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tic-tac-toe')
        .setDescription('Starts a game of tic tac toe.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The target to challenge.')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const user = interaction.options.getUser('target');
        const { channel } = interaction;
        const { rows, board } = this.build();

        if (client.cache.get(channel.id)) {
            await interaction.reply(
                {
                    content: 'A tic-tac-toe game is currently being played in this channel.',
                    ephemeral: true
                }
            );

            return;
        }

        const game = {
            players: {
                one: {
                    user: interaction.user,
                    identificator: 'O',
                    style: 'SUCCESS'
                },
                two: {
                    user: user,
                    identificator: 'X',
                    style: 'DANGER'
                }
            },
            current: {
                player: null
            },
            remaining: board[0].length * 3,
            playing: true,
            board,
            interaction
        };

        game.current.player = game.players.one;
        client.cache.set(channel.id, game);
        
        await interaction.reply(
            { 
                ephemeral: false, 
                components: rows
            }
        );

        this.collector(game, client);
    },

    collector(game, client) {
        const { 
            interaction: { channel }, 
            current: { player },
        } = game;
        
        const filter = i => i.user.id == player.user.id;

        const collector = channel.createMessageComponentCollector(
            { 
                filter, time: 60000 * 5 
            }
        );

        collector.on('collect', async (inter) => {
            const { player } = game.current;

            const { x, y } = this.decode(inter.customId);
            const { board } = game;
            const comp = board[x][y];
            
            comp.setStyle(player.style)
                .setLabel(player.identificator)
                .setDisabled();

            board[x][y] = comp;
            game.remaining = game.remaining - 1;

            const msg = this.checkWin(game);
            if (msg) {
                game.playing = false;
                collector.stop();
            }

            const rows = this.row(board);

            await inter.update(
                {
                    content: msg,
                    components: rows
                }
            );
        });

        collector.on('end', async () => {
            if (game.playing) {
                await channel.send(
                    {
                        content: '**The game has ended due to expiry.**'
                    }
                );
            }

            client.cache.delete(channel.id);
        });
    },

    checkWin(game) {
        const { current, board, players } = game;
        
        const map = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['1', '4', '7'],
            ['2', '5', '8'],
            ['3', '6', '9'],
            ['1', '5', '9'],
            ['3', '5', '7']
        ];
        
        let won;
        let reply = null;
        let all = [];
        for (let i = 0; i < board.length; i++) {
            const colms = board[i];
            
            for (let j = 0; j < colms.length; j++) {
                const grid = board[i][j];
                
                if (grid.label == current.player.identificator) {
                    const pos = grid.customId;
                    if (!all.includes(pos)) {
                        all.push(pos);
                    }

                    if (game.remaining === 0) {
                        reply = 'The game is over! **Tie**';
                    }

                    for (let k = 0; k < map.length; k++) {
                        won = map[k].every(element => all.includes(element));

                        if (won) {
                            reply = `**${current.player.user.username}** has won the game!`;
                            break;
                        }
                    }
                }
            }
        }

        game.current.player = current.player == players.one ? players.two : players.one;

        return reply;
    },

    row(board) {
        const rows = [];
        
        for (let i = 0; i < board.length; i++) {
            const colms = board[i];
            let action = new MessageActionRow();
            
            for (let j = 0; j < colms.length; j++) {
                action.addComponents(board[i][j]);
            }

            rows.push(action);
        }

        return rows;
    },

    decode(pos) {
        const index = {
            '1': [0, 0],
            '2': [0, 1],
            '3': [0, 2],
            '4': [1, 0],
            '5': [1, 1],
            '6': [1, 2],
            '7': [2, 0],
            '8': [2, 1],
            '9': [2, 2],
        };

        return {
            x: index[pos][0],
            y: index[pos][1]
        };
    },

    build() {
        const board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];

        let num = 0;
        let rows = [];
        let action;
        for (let i = 0; i < board.length; i++) {
            const colms = board[i];
            action = new MessageActionRow();
            
            for (let j = 0; j < colms.length; j++) {
                num = num + 1;

                const button = new MessageButton()
                    .setCustomId(num.toString())
                    .setStyle('SECONDARY')
                    .setLabel('-');

                action.addComponents(button);
                board[i][j] = button;
            }

            rows.push(action);
        }

        return {
            rows,
            board
        };
    }
};