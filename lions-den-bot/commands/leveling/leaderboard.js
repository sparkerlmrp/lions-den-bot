const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../../src/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top members by level'),
  async execute(interaction, client) {
    const rows = getLeaderboard(interaction.guild.id, 10);
    if (rows.length === 0) {
      return interaction.reply({ content: 'No one has earned XP yet. Get chatting!', ephemeral: true });
    }

    const medals = ['🥇', '🥈', '🥉'];
    const lines = rows.map((r, i) =>
      `${medals[i] || `**${i + 1}.**`} <@${r.userId}> — Level ${r.level} (${r.xp} XP)`
    );

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle("🦁 Lion's Den Leaderboard")
      .setDescription(lines.join('\n'));

    await interaction.reply({ embeds: [embed] });
  }
};
