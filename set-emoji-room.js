const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const EmojiChannel = require('../../Schemas/EmojiChannelSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji-channel')
        .setDescription('إدارة قناة الإيموجي')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تعيين قناة لإضافة الإيموجي تلقائياً')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة المراد مراقبتها للإيموجي')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة قناة الإيموجي')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: '❌ تحتاج إلى صلاحية "إدارة السيرفر" لاستخدام هذا الأمر', ephemeral: true });
        }

        if (subcommand === 'set') {
            const channel = interaction.options.getChannel('channel');

            await EmojiChannel.findOneAndUpdate(
                { Guild: interaction.guild.id },
                { Guild: interaction.guild.id, Channel: channel.id },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setDescription(`**🔴 إلغاء : لإلغاء الروم من إضافة الإيموجيات تلقائياً,
🟢 حذف : لحذف رسالة الإزرار هذه بدون إلغاء الروم,
⚠️ ملاحظة : يمكنك تجاهل الأزرار اذا كنت لا حاجه لها,
🗒️ الشرح : فقط أرسل أي أيموجي من السيرفرات الأخرى,
سيتم إضافته تلقائياً حتى لو أرسلت اكثر من أيموجي برسالة واحدة**`)
                .setColor('#2f3136')
                .setTimestamp();

            const deleteButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('delete-emoji-channel')
                        .setLabel('إلغاء')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('delete-embed')
                        .setLabel('حذف الرسالة')
                        .setStyle(ButtonStyle.Success)
                );

            await channel.send({ embeds: [embed], components: [deleteButton] });
            return interaction.reply(`✅ تم تعيين قناة الإيموجي إلى ${channel}`);
        } else if (subcommand === 'remove') {
            
            const result = await EmojiChannel.findOneAndDelete({ Guild: interaction.guild.id });

            if (!result) {
                return interaction.reply({ content: '❌ لم يتم تعيين قناة إيموجي حالياً', ephemeral: true });
            }

            return interaction.reply('✅ تم إزالة قناة الإيموجي');
        }
    },
};