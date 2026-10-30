const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const RESPONSES = [
  'It is certain.', 'Without a doubt.', 'Yes, definitely.', 'You may rely on it.',
  'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Signs point to yes.',
  'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.',
  "Don't count on it.", 'My reply is no.', 'My sources say no.', 'Outlook not so good.', 'Very doubtful.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)),
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle('🎱 Magic 8-Ball')
      .addFields({ name: 'Question', value: question }, { name: 'Answer', value: answer });

    await interaction.reply({ embeds: [embed] });
  }
};
