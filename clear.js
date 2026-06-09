const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح عدد محدد من الرسائل في القناة')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('عدد الرسائل المراد مسحها (1-100)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const number = interaction.options.getInteger('number');

        if (number < 1 || number > 100) {
            return interaction.reply({ content: '❌ الرجاء إدخال عدد بين 1 و 100', ephemeral: true });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(number, true);
            await interaction.reply({ content: `✅ تم مسح **${deleted.size}** رسالة.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ حدث خطأ أثناء محاولة مسح الرسائل.', ephemeral: true });
        }
    },
};
