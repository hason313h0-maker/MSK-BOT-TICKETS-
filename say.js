const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('جعل البوت يقول شيئاً')
        .addStringOption(option =>
            option.setName('sentence')
                .setDescription('ما الذي يجب أن يقوله البوت')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('معرف الرسالة للرد عليها')
                .setRequired(false)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ تحتاج إلى صلاحية إدارة الرسائل لاستخدام هذا الأمر!', ephemeral: true });
        }

        const sentence = interaction.options.getString('sentence');
        const messageId = interaction.options.getString('message_id');

        try {
            if (messageId) {
                const messageToReply = await interaction.channel.messages.fetch(messageId);
                await messageToReply.reply(sentence);
            } else {
                await interaction.channel.send(sentence);
            }
            
            await interaction.reply({ content: '✅ تم إرسال الرسالة!', ephemeral: true });
        } catch (error) {
            await interaction.reply({ 
                content: '❌ خطأ في إرسال الرسالة. تأكد من صحة معرف الرسالة.', 
                ephemeral: true 
            });
        }
    }
};
