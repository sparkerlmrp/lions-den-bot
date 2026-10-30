const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription("View a member's avatar")
    .addUserOption(o => o.setName('member').setDescription('Member').setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('member') || interaction.user;
    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL({ size: 1024 }));
    await interaction.reply({ embeds: [embed] });
  }
};
