const { SlashCommandBuilder } = require('discord.js');

const CHOICES = ['rock', 'paper', 'scissors'];
const BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock-paper-scissors against the bot')
    .addStringOption(o => o.setName('choice').setDescription('Your choice').setRequired(true)
      .addChoices({ name: 'Rock', value: 'rock' }, { name: 'Paper', value: 'paper' }, { name: 'Scissors', value: 'scissors' })),
  async execute(interaction) {
    const player = interaction.options.getString('choice');
    const bot = CHOICES[Math.floor(Math.random() * CHOICES.length)];

    let result;
    if (player === bot) result = "It's a tie!";
    else if (BEATS[player] === bot) result = 'You win! 🎉';
    else result = 'I win! 🦁';

    await interaction.reply(`You chose **${player}**, I chose **${bot}**. ${result}`);
  }
};
