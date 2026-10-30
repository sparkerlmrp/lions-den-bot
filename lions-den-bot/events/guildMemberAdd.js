const { EmbedBuilder } = require('discord.js');
const db = require('../src/database');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const { welcome } = client.config;
    if (!welcome.enabled) return;

    const settings = db.prepare('SELECT * FROM guild_settings WHERE guildId = ?').get(member.guild.id);

    // Auto-role, if one was configured via /setup (preferred) or config.json fallback
    const roleId = settings?.autoRoleId;
    const roleName = welcome.autoRoleName;
    const role = roleId
      ? member.guild.roles.cache.get(roleId)
      : (roleName ? member.guild.roles.cache.find(r => r.name === roleName) : null);
    if (role) await member.roles.add(role).catch(() => {});

    const channel = settings?.welcomeChannelId
      ? member.guild.channels.cache.get(settings.welcomeChannelId)
      : member.guild.channels.cache.find(c => c.name === welcome.channelName);

    if (!channel) return;

    const text = welcome.message
      .replace('{user}', `<@${member.id}>`)
      .replace('{memberCount}', member.guild.memberCount);

    const embed = new EmbedBuilder()
      .setColor(client.config.colors.primary)
      .setDescription(text)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: "Lion's Den" })
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  }
};
