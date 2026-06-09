const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { Database } = require('st.db');
const isImageUrl = require('is-image-url');

const db = new Database('/Database/Autoline');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-line')
        .setDescription('حدد صورة الخط (Line Image).')
        .addStringOption(option => 
            option.setName('line')
                .setDescription('ضع رابط صورة الخط (Line Image URL).')
                .setRequired(true)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const line = interaction.options.getString('line');

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: `❌ ليس لديك صلاحية لاستخدام هذا الأمر.`,
                    ephemeral: true
                });
            }

            if (!isImageUrl(line)) {
                return interaction.reply({ content: '⚠️ الرابط المدخل ليس صورة صالحة.', ephemeral: true });
            }

            db.set(`Line_${interaction.guild.id}`, line);

            const embed = new EmbedBuilder()
                .setColor('#2f3136') 
                .setDescription('✅ تم تحديد صورة الخط بنجاح.')
                .setImage(line);

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ حدث خطأ أثناء حفظ صورة الخط.', ephemeral: true });
        }
    }
};
