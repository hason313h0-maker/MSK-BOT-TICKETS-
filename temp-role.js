const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('temp-role')
        .setDescription('إعطاء رتبة مؤقتة لعضو لفترة محددة')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('الرتبة المراد إعطاؤها')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('member')
                .setDescription('العضو المراد إعطاؤه الرتبة')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('المدة (مثال: 30s, 5m, 2h, 1d)')
                .setRequired(true)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const member = interaction.options.getMember('member');
        const duration = interaction.options.getString('duration');

        
        const timeRegex = /^(\d+)([smhd])$/;
        const matches = duration.match(timeRegex);

        if (!matches) {
            return interaction.reply({
                content: 'صيغة المدة غير صحيحة! استخدم: رقم + s/m/h/d (مثال: 30s, 5m, 2h, 1d)',
                ephemeral: true
            });
        }

        const timeValue = parseInt(matches[1]);
        const timeUnit = matches[2];

    
        let milliseconds;
        switch (timeUnit) {
            case 's': milliseconds = timeValue * 1000; break;
            case 'm': milliseconds = timeValue * 60000; break;
            case 'h': milliseconds = timeValue * 3600000; break;
            case 'd': milliseconds = timeValue * 86400000; break;
        }

        try {
            
            await member.roles.add(role);

            
            setTimeout(async () => {
                try {
                    if (member.roles.cache.has(role.id)) {
                        await member.roles.remove(role);
                       
                        await interaction.channel.send({
                            content: `تم إزالة رتبة ${role} من ${member} (انتهت المدة)`,
                            ephemeral: false
                        });
                    }
                } catch (error) {
                    console.error('خطأ في إزالة الرتبة المؤقتة:', error);
                }
            }, milliseconds);

            
            await interaction.reply({
                content: `تم إضافة رتبة ${role} إلى ${member} لمدة ${duration}`,
                ephemeral: false
            });

        } catch (error) {
            console.error('خطأ في إضافة الرتبة المؤقتة:', error);
            await interaction.reply({
                content: 'فشل في إضافة الرتبة المؤقتة. تأكد من أن لدي الصلاحيات المناسبة!',
                ephemeral: true
            });
        }
    },
};