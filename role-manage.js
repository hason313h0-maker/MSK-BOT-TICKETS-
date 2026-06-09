const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('إدارة رتب السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('إنشاء رتبة جديدة')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('اسم الرتبة')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('لون الرتبة (رمز هيكس)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rename')
                .setDescription('تغيير اسم رتبة موجودة')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('الرتبة المراد تغيير اسمها')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('newname')
                        .setDescription('الاسم الجديد للرتبة')
                        .setRequired(true))),

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'create': {
                    const name = interaction.options.getString('name');
                    const color = interaction.options.getString('color');

                    
                    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                    if (!colorRegex.test(color)) {
                        return interaction.reply({
                            content: 'الرجاء إدخال رمز لون هيكس صالح (مثال: #FF0000)',
                            ephemeral: true
                        });
                    }

                    const role = await interaction.guild.roles.create({
                        name: name,
                        color: color,
                        reason: `تم الإنشاء بواسطة ${interaction.user.tag}`
                    });

                    await interaction.reply({
                        content: ` تم إنشاء الرتبة ${role} باللون ${color} بنجاح`,
                        ephemeral: true
                    });
                    break;
                }

                case 'rename': {
                    const role = interaction.options.getRole('role');
                    const newName = interaction.options.getString('newname');

                    
                    if (role.position >= interaction.guild.members.me.roles.highest.position) {
                        return interaction.reply({
                            content: ' لا يمكنني إدارة هذه الرتبة لأنها أعلى من أو تساوي أعلى رتبة لدي',
                            ephemeral: true
                        });
                    }

                    const oldName = role.name;
                    await role.setName(newName, `تم التغيير بواسطة ${interaction.user.tag}`);

                    await interaction.reply({
                        content: ` تم تغيير اسم الرتبة من "${oldName}" إلى "${newName}" بنجاح`,
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('خطأ في إدارة الرتبة:', error);
            await interaction.reply({
                content: ' حدث خطأ أثناء إدارة الرتبة',
                ephemeral: true
            });
        }
    },
};