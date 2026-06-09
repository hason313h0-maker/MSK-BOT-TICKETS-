const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unhide')
        .setDescription('إظهار القناة الحالية للجميع')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        if (channel.permissionsFor(interaction.guild.roles.everyone).has('ViewChannel')) {
            return interaction.reply({ content: '❌ القناة ظاهرة بالفعل.', ephemeral: true });
        }

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: true });
        await interaction.reply({ content: `✅ تم إظهار القناة: **${channel.name}** للجميع.` });
    },
};
