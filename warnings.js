const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../src/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription("View a member's warnings")
    .addUserOption(o => o.setName('member').setDescription('Member to check').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const member = interaction.options.getUser('member');
    const rows = db.prepare('SELECT * FROM warnings WHERE guildId = ? AND userId = ? ORDER BY createdAt DESC')
      .all(interaction.guild.id, member.id);

    if (rows.length === 0) {
      return interaction.reply({ content: `${member} has no warnings.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle(`Warnings for ${member.tag}`)
      .setDescription(
        rows.slice(0, 10).map((w, i) =>
          `**${i + 1}.** ${w.reason} — <t:${Math.floor(w.createdAt / 1000)}:R> (by <@${w.moderatorId}>)`
        ).join('\n')
      )
      .setFooter({ text: `Total: ${rows.length} warning(s)` });

    await interaction.reply({ embeds: [embed] });
  }
};
