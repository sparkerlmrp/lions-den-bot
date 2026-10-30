const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout (mute) a member for a set number of minutes')
    .addUserOption(o => o.setName('member').setDescription('Member to timeout').setRequired(true))
    .addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes (max 40320 / 28 days)').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction, client) {
    const target = interaction.options.getUser('member');
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Could not find that member in this server.', ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: "I can't timeout that member (role hierarchy).", ephemeral: true });

    await member.timeout(minutes * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.warning)
      .setTitle('🔇 Member Timed Out')
      .addFields(
        { name: 'Member', value: `${member}`, inline: true },
        { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
        { name: 'Reason', value: reason }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
