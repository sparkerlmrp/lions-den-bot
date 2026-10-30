const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a quick reaction poll')
    .addStringOption(o => o.setName('question').setDescription('The poll question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3').setRequired(false))
    .addStringOption(o => o.setName('option4').setDescription('Option 4').setRequired(false))
    .addStringOption(o => o.setName('option5').setDescription('Option 5').setRequired(false)),
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const options = [1, 2, 3, 4, 5]
      .map(n => interaction.options.getString(`option${n}`))
      .filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle(`📊 ${question}`)
      .setDescription(options.map((opt, i) => `${NUMBER_EMOJIS[i]} ${opt}`).join('\n'))
      .setFooter({ text: `Poll started by ${interaction.user.username}` });

    await interaction.reply({ embeds: [embed] });
    const message = await interaction.fetchReply();
    for (let i = 0; i < options.length; i++) {
      await message.react(NUMBER_EMOJIS[i]);
    }
  }
};
