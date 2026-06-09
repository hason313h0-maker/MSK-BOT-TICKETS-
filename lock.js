const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('قفل الروم')
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('قفل روم محدد')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('الروم المراد قفله')
                        .setRequired(false))),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية لإدارة الرومات**',
                ephemeral: true
            });
        }

        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();
        
        try {
            switch (subcommand) {
                case 'channel': {
                    const channel = interaction.options.getChannel('channel') || interaction.channel;
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: false
                    });
                    
                    await interaction.followUp(`🔒 تم قفل الروم ${channel}`);
                    break;
                }
            }
        } catch (error) {
            console.error('Error managing channel locks:', error);
            if (interaction.deferred) {
                await interaction.followUp({
                    content: '**حدث خطأ أثناء قفل الروم**',
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '**حدث خطأ أثناء قفل الروم**',
                    ephemeral: true
                });
            }
        }
    },
};
