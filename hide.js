const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hide')
        .setDescription('إخفاء القناة الحالية عن الجميع')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const channel = interaction.channel;

        if (!channel.permissionsFor(interaction.guild.roles.everyone).has('ViewChannel')) {
            return interaction.reply({ content: '❌ القناة مخفية بالفعل.', ephemeral: true });
        }

        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { ViewChannel: false });
        await interaction.reply({ content: `✅ تم إخفاء القناة: **${channel.name}** عن الجميع.` });
    },
};
