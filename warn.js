const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../src/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .addUserOption(o => o.setName('member').setDescription('Member to warn').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason for the warning').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client) {
    const member = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason');

    db.prepare('INSERT INTO warnings (guildId, userId, moderatorId, reason, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run(interaction.guild.id, member.id, interaction.user.id, reason, Date.now());

    const count = db.prepare('SELECT COUNT(*) as c FROM warnings WHERE guildId = ? AND userId = ?')
      .get(interaction.guild.id, member.id).c;

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.warning)
      .setTitle('⚠️ Member Warned')
      .addFields(
        { name: 'Member', value: `${member}`, inline: true },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Total Warnings', value: `${count}`, inline: true },
        { name: 'Reason', value: reason }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    await member.send(`You were warned in **${interaction.guild.name}** for: ${reason}`).catch(() => {});

    if (count >= client.config.moderation.maxWarningsBeforeAction) {
      await interaction.followUp({ content: `⚠️ ${member} has reached ${count} warnings and may need further action.` });
    }
  }
};
