const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../src/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearwarnings')
    .setDescription("Clear a member's warnings")
    .addUserOption(o => o.setName('member').setDescription('Member to clear').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const member = interaction.options.getUser('member');
    const result = db.prepare('DELETE FROM warnings WHERE guildId = ? AND userId = ?').run(interaction.guild.id, member.id);
    await interaction.reply({ content: `Cleared ${result.changes} warning(s) for ${member}.` });
  }
};
