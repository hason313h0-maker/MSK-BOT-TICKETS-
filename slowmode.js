const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('تعيين وضع التباطؤ للقناة')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تعيين وضع التباطؤ للقناة')
                .addIntegerOption(option =>
                    option.setName('seconds')
                        .setDescription('مدة التباطؤ بالثواني (0 لإيقاف التباطؤ)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(21600)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض قائمة القنوات التي تحتوي على وضع التباطؤ')),

    async execute(interaction) {
        try {
            if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return await interaction.reply({
                    content: '❌ **ليس لديك صلاحية استخدام هذا الأمر**',
                    ephemeral: true
                });
            }

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'set') {
                const seconds = interaction.options.getInteger('seconds');

                await interaction.channel.setRateLimitPerUser(seconds);

                await interaction.reply({
                    content: seconds === 0 
                        ? '✅ **تم إيقاف وضع التباطؤ في هذه القناة**'
                        : `⏰ **تم تعيين وضع التباطؤ إلى \`${seconds}\` ثانية**`
                });
            } 
            else if (subcommand === 'list') {
                const channels = interaction.guild.channels.cache
                    .filter(channel => 
                        channel.isTextBased() && 
                        channel.rateLimitPerUser > 0
                    );

                if (channels.size === 0) {
                    return await interaction.reply({
                        content: '✨ **لا توجد قنوات تحتوي على وضع التباطؤ**',
                        ephemeral: true
                    });
                }

                const channelList = channels.map(channel => 
                    `📝 ${channel} - ⏰ \`${channel.rateLimitPerUser}\` ثانية`
                ).join('\n');

                await interaction.reply({
                    content: '**جاري إرسال القائمة في الخاص...**',
                    ephemeral: true
                });

                try {
                    await interaction.user.send({
                        content: `**قائمة القنوات التي تحتوي على وضع التباطؤ في ${interaction.guild.name}:**\n\n${channelList}`
                    });
                } catch (error) {
                    await interaction.followUp({
                        content: '❌ **لم أتمكن من إرسال رسالة خاصة لك. يرجى فتح الرسائل الخاصة**',
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Error in slowmode command:', error);
            await interaction.reply({
                content: '❌ **حدث خطأ أثناء تنفيذ الأمر**',
                ephemeral: true
            });
        }
    },
};
