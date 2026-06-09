const { 
  Events, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder, 
  ChannelType
} = require('discord.js');
const { Database } = require("st.db");
const db = new Database("/Database/Ticket");
const db2 = new Database("/Database/TempTicket");

module.exports = {
  name: Events.InteractionCreate,
  
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket_notify_support") {
      const channel = interaction.channel;
      const guild = interaction.guild;
      const supportRole = channel.permissionOverwrites.cache.find(p => p.type === 0 && p.id !== guild.roles.everyone.id)?.id;

      if (!interaction.member.roles.cache.has(supportRole)) {
        return interaction.reply({ content: "You are not allowed to use this button.", ephemeral: true });
      }

      const role = guild.roles.cache.get(supportRole);
      if (role) {
        role.members.forEach(member => {
          member.send(`🔔 You have a ticket to check: ${channel.url}`).catch(() => {});
        });
      }
      return interaction.reply({ content: "Support team has been notified via DM.", ephemeral: true });
    }

    if (interaction.customId === "ticket_close" || interaction.customId.endsWith("_claim")) {
      const channel = interaction.channel;
      const supportRole = channel.permissionOverwrites.cache.find(p => p.id !== interaction.guild.roles.everyone.id)?.id;

      if (!supportRole || !interaction.member.roles.cache.has(supportRole)) {
        return interaction.reply({ content: "You are not allowed to use this button.", ephemeral: true });
      }

      if (interaction.customId.endsWith("_claim")) {
        const claimedUser = db2.get(`claimed_${channel.id}`);
        if (!claimedUser) {
          db2.set(`claimed_${channel.id}`, interaction.user.id);
          return interaction.reply({ content: `✅ You have claimed this ticket.`, ephemeral: true });
        } else if (claimedUser === interaction.user.id) {
          db2.delete(`claimed_${channel.id}`);
          return interaction.reply({ content: `✅ You have unclaimed this ticket.`, ephemeral: true });
        } else {
          return interaction.reply({ content: `❌ This ticket is already claimed by someone else.`, ephemeral: true });
        }
      }

      if (interaction.customId === "ticket_close") {
        await interaction.reply({ content: "🔒 Closing ticket..." });
        setTimeout(() => {
          interaction.channel.delete().catch(() => {});
        }, 3000);
      }
      return;
    }

    if (!interaction.customId.endsWith('ticket')) return;

    const [roleid, , buttonID] = interaction.customId.split("_");
    const data = db.get("ticketData_" + interaction.message.id) || null;
    if (!data) return interaction.deferUpdate();
    const ticketData = data.buttonsData["button" + buttonID];
    if (!ticketData) return interaction.deferUpdate();

    const ticketLimits = db.get(`ticketsLimit_${interaction.guild.id}`) || 50;
    let userTickets = 0;
    interaction.guild.channels.cache.forEach(ch => {
      try {
        if (!ch.topic) return;
        if (ch.type !== ChannelType.GuildText) return;
        if (!ch.viewable) return;
        const ticketCheck = db2.get(interaction.guild.id + "_" + ch.id) || null;
        if (!ticketCheck) return;
        if (ch.topic == interaction.user.id) ++userTickets;
      } catch (error) {
        console.log(error);
      }
    });

    if (ticketLimits <= userTickets) {
      return interaction.reply({ content: "You have reached the ticket limit!", ephemeral: true });
    }

    const { panal_categoryID, welcome } = ticketData;
    const welcome_type = welcome.type || "embed";
    const welcome_message = welcome.message || "...";

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: "Your ticket is being created..." });

    const embed = new EmbedBuilder()
      .setColor(interaction.guild.members.me.displayHexColor)
      .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setDescription(welcome_message)
      .setTimestamp()
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true }) });

    const Ticketbuttons = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Close"),
      new ButtonBuilder()
        .setCustomId(roleid + "_claim")
        .setStyle(ButtonStyle.Success)
        .setLabel("Claim"),
      new ButtonBuilder()
        .setCustomId("ticket_notify_support")
        .setStyle(ButtonStyle.Primary)
        .setLabel("Notify Support"),
    ]);

    const ticketNumber = db.get("ticketID_" + interaction.message.id + "_" + buttonID) || 1;
    const ticketnumber = String(ticketNumber).padStart(4, '0');
    db.set("ticketID_" + interaction.message.id + "_" + buttonID, ticketNumber + 1);

    const channel = await interaction.guild.channels.create({
      name: `ticket-${ticketnumber}`,
      type: ChannelType.GuildText,
      parent: panal_categoryID,
      topic: interaction.user.id,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: ["ViewChannel"] },
        { id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: roleid, allow: ["ViewChannel", "SendMessages"] },
      ]
    });

    db2.set("ticketData_" + interaction.guild.id + "_" + channel.id, ticketData);

    if (welcome_type === "embed") {
      channel.send({ 
        content: `<@!${interaction.member.id}>, <@&${roleid}>`, 
        embeds: [embed], 
        components: [Ticketbuttons] 
      });
    } else {
      channel.send({ 
        content: `<@!${interaction.member.id}>, <@&${roleid}>\n${welcome_message}`, 
        components: [Ticketbuttons] 
      });
    }

    await interaction.editReply({ content: `Your ticket has been created: ${channel}` });
  }
};
