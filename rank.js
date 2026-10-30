const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser, xpForLevel, getRank } = require('../../src/levels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your (or someone else\'s) level and XP')
    .addUserOption(o => o.setName('member').setDescription('Member to check').setRequired(false)),
  async execute(interaction, client) {
    const target = interaction.options.getUser('member') || interaction.user;
    const data = getUser(interaction.guild.id, target.id);
    const rank = getRank(interaction.guild.id, target.id);
    const needed = xpForLevel(data.level);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle(`${target.username}'s Rank`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'Level', value: `${data.level}`, inline: true },
        { name: 'XP', value: `${data.xp} / ${needed}`, inline: true },
        { name: 'Server Rank', value: rank ? `#${rank}` : 'Unranked', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
