const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(o => o.setName('member').setDescription('Member to kick').setRequired(true))
    .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  async execute(interaction, client) {
    const target = interaction.options.getUser('member');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: 'Could not find that member in this server.', ephemeral: true });
    if (!member.kickable) return interaction.reply({ content: "I can't kick that member (role hierarchy).", ephemeral: true });

    await member.send(`You were kicked from **${interaction.guild.name}** for: ${reason}`).catch(() => {});
    await member.kick(reason);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.error)
      .setTitle('👢 Member Kicked')
      .addFields(
        { name: 'Member', value: `${target.tag}`, inline: true },
        { name: 'Moderator', value: `${interaction.user}`, inline: true },
        { name: 'Reason', value: reason }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
