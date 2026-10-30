const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../src/database');

function upsert(guildId, column, value) {
  db.prepare(`INSERT INTO guild_settings (guildId, ${column}) VALUES (?, ?)
    ON CONFLICT(guildId) DO UPDATE SET ${column} = excluded.${column}`).run(guildId, value);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription("Configure the bot for this server")
    .addSubcommand(sub => sub.setName('welcome-channel').setDescription('Set the welcome message channel')
      .addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(sub => sub.setName('auto-role').setDescription('Set the role given to new members')
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .addSubcommand(sub => sub.setName('ticket-category').setDescription('Set the category tickets are created under')
      .addChannelOption(o => o.setName('category').setDescription('Category').setRequired(true)))
    .addSubcommand(sub => sub.setName('support-role').setDescription('Set the role that can see tickets')
      .addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'welcome-channel') {
      const channel = interaction.options.getChannel('channel');
      upsert(guildId, 'welcomeChannelId', channel.id);
      return interaction.reply(`Welcome messages will now be sent in ${channel}.`);
    }
    if (sub === 'auto-role') {
      const role = interaction.options.getRole('role');
      upsert(guildId, 'autoRoleId', role.id);
      return interaction.reply(`New members will now receive the ${role} role.`);
    }
    if (sub === 'ticket-category') {
      const category = interaction.options.getChannel('category');
      upsert(guildId, 'ticketCategoryId', category.id);
      return interaction.reply(`Tickets will now be created under **${category.name}**.`);
    }
    if (sub === 'support-role') {
      const role = interaction.options.getRole('role');
      upsert(guildId, 'supportRoleId', role.id);
      return interaction.reply(`${role} will now be able to see new tickets.`);
    }
  }
};
