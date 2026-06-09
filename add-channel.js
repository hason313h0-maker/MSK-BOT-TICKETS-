const { SlashCommandBuilder, ChatInputCommandInteraction, Client, ChannelType, PermissionFlagsBits } = require("discord.js");
const { Database } = require('st.db');

const db = new Database('/Database/Autoline');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoline-channel')
        .setDescription('إضافة قناة جديدة إلى الأوتولاين.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('اختر القناة التي تريد إضافتها.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const channel = interaction.options.getChannel('channel');
            const channels = db.get(`Autoline_${interaction.guild.id}`) || [];

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: `❌ ليس لديك صلاحية لاستخدام هذا الأمر.`,
                    ephemeral: true
                });
            }

            if (channels.includes(channel.id)) {
                return interaction.reply({ content: '⚠️ هذه القناة مضافة بالفعل إلى الأوتولاين.', ephemeral: true });
            }

            db.push(`Autoline_${interaction.guild.id}`, channel.id).then(() => {
                return interaction.reply({ content: `✅ تم إضافة القناة <#${channel.id}> بنجاح إلى الأوتولاين.`, ephemeral: false });
            });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ حدث خطأ أثناء إضافة القناة إلى الأوتولاين.', ephemeral: true });
        }
    }
};
