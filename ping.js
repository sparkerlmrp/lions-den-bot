const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription("Check the bot's latency"),
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Websocket Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: 'Roundtrip', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
      );
    await interaction.reply({ embeds: [embed] });
  }
};
