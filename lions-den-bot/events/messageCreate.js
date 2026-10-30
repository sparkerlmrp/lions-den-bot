const { addXp, getUser } = require('../src/levels');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const { leveling, moderation } = client.config;

    // --- Basic automod: banned words ---
    const content = message.content.toLowerCase();
    const hit = moderation.autoModBannedWords.find(w => w && content.includes(w.toLowerCase()));
    if (hit) {
      await message.delete().catch(() => {});
      const warn = await message.channel.send(`${message.author}, that message was removed for breaking server rules.`);
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }

    // --- Basic automod: mass mentions ---
    if (message.mentions.users.size + message.mentions.roles.size > moderation.autoModMaxMentions) {
      await message.delete().catch(() => {});
      const warn = await message.channel.send(`${message.author}, please don't mass-mention members.`);
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }

    // --- Leveling ---
    const before = getUser(message.guild.id, message.author.id);
    const result = addXp(message.guild.id, message.author.id, leveling.xpPerMessage, leveling.xpCooldownSeconds);

    if (result?.leveledUp && leveling.levelUpMessage) {
      message.channel.send(`🎉 ${message.author}, you leveled up to **Level ${result.newLevel}**!`).catch(() => {});
    }
  }
};
