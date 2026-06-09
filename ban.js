const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('حظر عضو من السيرفر')
        .addStringOption(option =>
            option.setName('userid')
                .setDescription('ايدي العضو المراد حظره')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('سبب الحظر')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية حظر الأعضاء**',
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'لم يتم تحديد سبب';

        try {
            const user = await interaction.client.users.fetch(userId).catch(() => null);
            
            if (!user) {
                return interaction.reply({
                    content: '**معرف المستخدم غير صالح**',
                    ephemeral: true
                });
            }

            const banList = await interaction.guild.bans.fetch();
            if (banList.has(userId)) {
                return interaction.reply({
                    content: '**هذا المستخدم محظور بالفعل**',
                    ephemeral: true
                });
            }

            await interaction.guild.members.ban(userId, { reason });
            await interaction.reply({
                content: `**تم حظر ${user.tag || userId} بنجاح**\nالسبب: ${reason}`,
                ephemeral: false
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '**حدث خطأ أثناء محاولة حظر هذا المستخدم**',
                ephemeral: true
            });
        }
    },
};
