const { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits } = require("discord.js");
const { Database } = require('st.db');

const db = new Database('/Database/Autoline');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoline-mode')
        .setDescription('تغيير وضع الأوتولاين.')
        .addStringOption(option => option
            .setName('mode')
            .setDescription('اختر الوضع.')
            .addChoices(
                { name: '📂 ملف', value: 'file' },
                { name: '💬 رسالة', value: 'message' },
                { name: '📌 إمبد', value: 'embed' },
            )
            .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const mode = interaction.options.getString("mode");

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: `❌ ليس لديك صلاحية لاستخدام هذا الأمر.`,
                    ephemeral: true
                });
            }

            db.set(`autolineMode_${interaction.guild.id}`, mode).then(() => {
                interaction.reply({
                    content: `✅ تم تغيير وضع الأوتولاين إلى **${mode}**.`,
                    ephemeral: true
                });
            });

        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '❌ حدث خطأ أثناء تغيير وضع الأوتولاين.',
                ephemeral: true
            });
        }
    }
};
