const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('View information about a member')
    .addUserOption(o => o.setName('member').setDescription('Member to look up').setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('member') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setTitle(`${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'User ID', value: user.id, inline: true },
        { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'Unknown', inline: true },
        { name: 'Roles', value: member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).join(', ') || 'None' : 'Unknown' }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
