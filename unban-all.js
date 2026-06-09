const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unbanall')
        .setDescription('إلغاء حظر جميع الأعضاء المحظورين من السيرفر'),
    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية لاستخدام هذا الأمر**',
                ephemeral: true
            });
        }

        try {
            const bans = await interaction.guild.bans.fetch();
            if (bans.size === 0) {
                return interaction.reply({
                    content: '**لا يوجد أعضاء محظورين في هذا السيرفر**',
                    ephemeral: true
                });
            }

            for (const ban of bans.values()) {
                await interaction.guild.members.unban(ban.user.id);
            }

            await interaction.reply({
                content: `**تم إلغاء حظر جميع الأعضاء بنجاح: ${bans.size} عضو**`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '**حدث خطأ أثناء محاولة إلغاء حظر جميع الأعضاء**',
                ephemeral: true
            });
        }
    },
};