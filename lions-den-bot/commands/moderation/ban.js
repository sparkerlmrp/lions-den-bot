const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(o => o.setName('member').setDescription('Member to ban').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .addIntegerOption(o => o.setName('delete_days').setDescription('Days of messages to delete (0-7)').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction, client) {
    const target = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (member && !member.bannable) return interaction.reply({ content: "I can't ban that member (role hierarchy).", ephemeral: true });

    await target.send(`You were banned from **${interaction.guild.name}** for: ${reason}`).catch(() => {});
    await interaction.guild.members.ban(target.id, { reason, deleteMessageSeconds: deleteDays * 86400 });

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.error)
      .setTitle('🔨 Member Banned')
      .addFields(
        { name: 'Member', value: `${target.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Reason', value: reason }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
