const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('فتح الروم')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('الروم المراد فتحه')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية لإدارة الرومات**',
                ephemeral: true
            });
        }

        await interaction.deferReply();
        
        try {
            const channel = interaction.options.getChannel('channel') || interaction.channel;
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: true
            });
            
            await interaction.followUp(`🔓 تم فتح الروم ${channel}`);
        } catch (error) {
            console.error('Error managing channel unlock:', error);
            if (interaction.deferred) {
                await interaction.followUp({
                    content: '**حدث خطأ أثناء فتح الروم**',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '**حدث خطأ أثناء فتح الروم**',
                    ephemeral: true
                });
            }
        }
    },
};
