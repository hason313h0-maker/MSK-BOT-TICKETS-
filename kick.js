const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('طرد عضو من السيرفر')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('العضو المراد طرده')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('سبب الطرد')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية طرد الأعضاء**',
                ephemeral: true
            });
        }

        const target = interaction.options.getMember('target');
        const reason = interaction.options.getString('reason') || 'لم يتم تحديد سبب';

        try {
            if (!target) {
                return interaction.reply({
                    content: '**هذا المستخدم غير موجود في السيرفر**',
                    ephemeral: true
                });
            }

            if (!target.kickable) {
                return interaction.reply({
                    content: '**لا يمكنني طرد هذا المستخدم. قد يكون لديه رتب أعلى مني**',
                    ephemeral: true
                });
            }

            await target.kick(reason);
            await interaction.reply({
                content: `**تم طرد ${target.user.tag} بنجاح**\nالسبب: ${reason}`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '**حدث خطأ أثناء محاولة طرد هذا المستخدم**',
                ephemeral: true
            });
        }
    },
};
