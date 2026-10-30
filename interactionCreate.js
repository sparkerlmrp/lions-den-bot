const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../src/database');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // --- Slash commands ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        const payload = { content: 'Something went wrong running that command.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      }
      return;
    }

    // --- Ticket system buttons ---
    if (interaction.isButton()) {
      if (interaction.customId === 'open_ticket') {
        const { tickets } = client.config;
        const guild = interaction.guild;

        const existing = db.prepare('SELECT * FROM tickets WHERE guildId = ? AND userId = ? AND status = ?')
          .get(guild.id, interaction.user.id, 'open');
        if (existing) {
          return interaction.reply({ content: `You already have an open ticket: <#${existing.channelId}>`, ephemeral: true });
        }

        const settings = db.prepare('SELECT * FROM guild_settings WHERE guildId = ?').get(guild.id);
        let category = settings?.ticketCategoryId ? guild.channels.cache.get(settings.ticketCategoryId) : null;
        if (!category) category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === tickets.categoryName);

        const supportRole = settings?.supportRoleId
          ? guild.roles.cache.get(settings.supportRoleId)
          : guild.roles.cache.find(r => r.name === tickets.supportRoleName);

        const overwrites = [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
        ];
        if (supportRole) overwrites.push({ id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });

        const channel = await guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: category?.id,
          permissionOverwrites: overwrites
        });

        db.prepare('INSERT INTO tickets (channelId, guildId, userId, createdAt, status) VALUES (?, ?, ?, ?, ?)')
          .run(channel.id, guild.id, interaction.user.id, Date.now(), 'open');

        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('close_ticket').setLabel('Close Ticket').setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
          .setColor(client.config.colors.primary)
          .setTitle('🎫 Support Ticket')
          .setDescription(`Hi ${interaction.user}, a member of the support team will be with you shortly. Describe your issue below.`);

        await channel.send({ content: supportRole ? `${supportRole}` : undefined, embeds: [embed], components: [closeRow] });
        await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
      }

      if (interaction.customId === 'close_ticket') {
        const ticket = db.prepare('SELECT * FROM tickets WHERE channelId = ?').get(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: 'This is not a ticket channel.', ephemeral: true });

        await interaction.reply({ content: 'Closing this ticket in 5 seconds...' });
        db.prepare('UPDATE tickets SET status = ? WHERE channelId = ?').run('closed', interaction.channel.id);
        setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
      }
    }
  }
};
