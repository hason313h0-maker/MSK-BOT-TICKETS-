const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const Warning = require('../../Schemas/WarningSchema');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('نظام التحذيرات')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('تحذير عضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد تحذيره')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('سبب التحذير')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة تحذير من عضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد إزالة التحذير منه')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('warning_id')
                        .setDescription('معرف التحذير')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض تحذيرات عضو')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو المراد عرض تحذيراته')
                        .setRequired(true))),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                return await interaction.reply({ 
                    content: '❌ **ليس لديك صلاحية استخدام هذا الأمر**', 
                    ephemeral: true 
                });
            }

            const subcommand = interaction.options.getSubcommand();
            const user = interaction.options.getUser('user');

            
            await interaction.deferReply();

            switch (subcommand) {
                case 'add': {
                    const reason = interaction.options.getString('reason');
                    const warningId = uuidv4().slice(0, 8);

                    await Warning.findOneAndUpdate(
                        { guildId: interaction.guildId, userId: user.id },
                        {
                            $push: {
                                warnings: {
                                    moderator: interaction.user.id,
                                    reason: reason,
                                    timestamp: new Date(),
                                    warningId: warningId
                                }
                            }
                        },
                        { upsert: true, new: true }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('⚠️ تحذير جديد')
                        .setDescription(`**تم تحذير ${user}**`)
                        .addFields(
                            { name: 'السبب', value: reason },
                            { name: 'معرف التحذير', value: warningId },
                            { name: 'بواسطة', value: `${interaction.user}` }
                        )
                        .setTimestamp();

                    const showButton = new ButtonBuilder()
                        .setCustomId(`show_warns_${user.id}`)
                        .setLabel('عرض التحذيرات')
                        .setStyle(ButtonStyle.Primary);

                    const removeButton = new ButtonBuilder()
                        .setCustomId(`remove_warn_${warningId}_${user.id}`)
                        .setLabel('إزالة التحذير')
                        .setStyle(ButtonStyle.Danger);

                    const row = new ActionRowBuilder()
                        .addComponents(showButton, removeButton);

                    const reply = await interaction.editReply({ 
                        embeds: [embed],
                        components: [row]
                    });

                    const collector = reply.createMessageComponentCollector({ time: 60000 });

                    collector.on('collect', async i => {
                        if (!i.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                            return await i.reply({ content: '❌ ليس لديك صلاحية استخدام هذا الزر', ephemeral: true });
                        }

                        if (i.customId === `show_warns_${user.id}`) {
                            const warning = await Warning.findOne({ guildId: interaction.guildId, userId: user.id });
                            
                            if (!warning || warning.warnings.length === 0) {
                                return await i.reply({ content: '✨ هذا العضو ليس لديه تحذيرات', ephemeral: true });
                            }

                            const warnsEmbed = new EmbedBuilder()
                                .setColor('Blue')
                                .setTitle(`تحذيرات ${user.tag}`)
                                .setDescription(warning.warnings.map(warn => 
                                    `**معرف التحذير:** \`${warn.warningId}\`\n` +
                                    `**السبب:** ${warn.reason}\n` +
                                    `**المشرف:** <@${warn.moderator}>\n` +
                                    `**التاريخ:** <t:${Math.floor(new Date(warn.timestamp).getTime() / 1000)}:R>\n`
                                ).join('\n'))
                                .setFooter({ text: `إجمالي التحذيرات: ${warning.warnings.length}` });

                            await i.reply({ embeds: [warnsEmbed], ephemeral: true });
                        }

                        if (i.customId === `remove_warn_${warningId}_${user.id}`) {
                            await Warning.updateOne(
                                { guildId: interaction.guildId, userId: user.id },
                                { $pull: { warnings: { warningId: warningId } } }
                            );

                            await i.reply({ content: `✅ تم إزالة التحذير \`${warningId}\` من ${user}`, ephemeral: true });
                            await reply.edit({ components: [] });
                        }
                    });

                    collector.on('end', () => {
                        reply.edit({ components: [] }).catch(() => {});
                    });

                    return;
                }

                case 'remove': {
                    const warningId = interaction.options.getString('warning_id');
                    const warning = await Warning.findOne({ 
                        guildId: interaction.guildId, 
                        userId: user.id,
                        'warnings.warningId': warningId 
                    });

                    if (!warning) {
                        return await interaction.editReply({ 
                            content: '❌ **لم يتم العثور على التحذير المحدد**'
                        });
                    }

                    await Warning.updateOne(
                        { guildId: interaction.guildId, userId: user.id },
                        { $pull: { warnings: { warningId: warningId } } }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setDescription(`✅ **تم إزالة التحذير \`${warningId}\` من ${user}**`)
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed] });
                }

                case 'list': {
                    const warning = await Warning.findOne({ 
                        guildId: interaction.guildId, 
                        userId: user.id 
                    });

                    if (!warning || warning.warnings.length === 0) {
                        return await interaction.editReply({ 
                            content: '✨ **هذا العضو ليس لديه تحذيرات**'
                        });
                    }

                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle(`تحذيرات ${user.tag}`)
                        .setDescription(warning.warnings.map(warn => 
                            `**معرف التحذير:** \`${warn.warningId}\`\n` +
                            `**السبب:** ${warn.reason}\n` +
                            `**المشرف:** <@${warn.moderator}>\n` +
                            `**التاريخ:** <t:${Math.floor(new Date(warn.timestamp).getTime() / 1000)}:R>\n`
                        ).join('\n'))
                        .setFooter({ text: `إجمالي التحذيرات: ${warning.warnings.length}` })
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error in warn command:', error);
            
           
            if (interaction.deferred) {
                return await interaction.editReply({ 
                    content: '❌ **حدث خطأ أثناء تنفيذ الأمر**'
                });
            } else if (!interaction.replied) {
                return await interaction.reply({ 
                    content: '❌ **حدث خطأ أثناء تنفيذ الأمر**',
                    ephemeral: true 
                });
            }
        }
    },
};
