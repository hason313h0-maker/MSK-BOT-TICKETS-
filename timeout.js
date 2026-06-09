const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('أوامر إدارة الإيقاف المؤقت')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إيقاف عضو مؤقتاً لمدة محددة')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('العضو المراد إيقافه')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('المدة بالثواني')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('سبب الإيقاف')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة الإيقاف المؤقت من عضو')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('العضو المراد إزالة الإيقاف المؤقت منه')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض الأعضاء الموقفين مؤقتاً حالياً')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return interaction.reply({
                content: '**ليس لديك صلاحية إدارة الإيقاف المؤقت**',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add': {
                    const target = interaction.options.getMember('target');
                    const seconds = interaction.options.getInteger('seconds');
                    const reason = interaction.options.getString('reason') || 'لم يتم تحديد سبب';

                    if (!target.moderatable) {
                        return interaction.reply({
                            content: '**لا يمكن إيقاف هذا العضو مؤقتاً. قد تكون رتبه أعلى من رتبي**',
                            ephemeral: true
                        });
                    }

                    await target.timeout(seconds * 1000, reason);
                    
                   
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle(`تم إيقافك مؤقتاً في ${interaction.guild.name}`)
                        .addFields(
                            { name: 'المدة', value: `${seconds} ثانية`, inline: true },
                            { name: 'السبب', value: reason, inline: true },
                            { name: 'المشرف', value: interaction.user.tag }
                        )
                        .setTimestamp();

                    try {
                        await target.send({ embeds: [dmEmbed] });
                    } catch (error) {
                        console.error('Could not send DM to user:', error);
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('تم إيقاف العضو مؤقتاً')
                        .addFields(
                            { name: 'العضو', value: target.toString(), inline: true },
                            { name: 'المدة', value: `${seconds} ثانية`, inline: true },
                            { name: 'السبب', value: reason }
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }
                case 'remove': {
                    const target = interaction.options.getMember('target');

                    if (!target.communicationDisabledUntilTimestamp) {
                        return interaction.reply({
                            content: '**هذا العضو غير موقف مؤقتاً**',
                            ephemeral: true
                        });
                    }

                    await target.timeout(null);
                    await interaction.reply({
                        content: `**تم إزالة الإيقاف المؤقت من ${target.toString()}**`,
                        ephemeral: false
                    });
                    break;
                }
                case 'list': {
                    const timedOutUsers = interaction.guild.members.cache
                        .filter(member => member.communicationDisabledUntilTimestamp)
                        .map(member => ({
                            user: member,
                            remainingTime: Math.ceil((member.communicationDisabledUntilTimestamp - Date.now()) / 1000)
                        }));

                    if (timedOutUsers.length === 0) {
                        return interaction.reply({
                            content: '**لا يوجد أعضاء موقفين مؤقتاً حالياً**',
                            ephemeral: true
                        });
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('الأعضاء الموقفين مؤقتاً حالياً')
                        .setDescription('اختر عضواً من القائمة أدناه لإزالة الإيقاف المؤقت')
                        .setTimestamp();

                    timedOutUsers.forEach((data, index) => {
                        embed.addFields({
                            name: `${index + 1}. ${data.user.toString()}`,
                            value: `الوقت المتبقي: ${data.remainingTime} ثانية`
                        });
                    });

                    const selectMenu = new StringSelectMenuBuilder()
                        .setCustomId('timeout_remove_select')
                        .setPlaceholder('اختر عضواً لإزالة الإيقاف المؤقت')
                        .addOptions(
                            timedOutUsers.map(data => ({
                                label: data.user.user.tag,
                                value: data.user.id,
                                description: `${data.remainingTime}s remaining`
                            }))
                        );

                    const row = new ActionRowBuilder()
                        .addComponents(selectMenu);

                    await interaction.reply({
                        embeds: [embed],
                        components: [row]
                    });

                    const filter = i => i.customId === 'timeout_remove_select' && i.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                    collector.on('collect', async i => {
                        const targetId = i.values[0];
                        const target = await interaction.guild.members.fetch(targetId);

                        if (target) {
                            await target.timeout(null);
                            await i.reply({
                                content: `**تم إزالة الإيقاف المؤقت من ${target.toString()}**`,
                                ephemeral: true
                            });
                        }
                    });

                    collector.on('end', async () => {
                        await interaction.editReply({ components: [] });
                    });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '**حدث خطأ أثناء تنفيذ هذا الأمر**',
                ephemeral: true
            });
        }
    },
};
