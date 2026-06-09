const { SlashCommandBuilder, ChatInputCommandInteraction, Client, ChannelType, PermissionFlagsBits } = require("discord.js");
const { Database } = require('st.db');

const db = new Database('/Database/Autoline');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-autoline')
        .setDescription('إزالة قناة من الأوتولاين.')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('اختر القناة المراد إزالتها.')
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

            if (!channels.includes(channel.id)) {
                return interaction.reply({ content: '⚠️ هذه القناة ليست موجودة في قائمة الأوتولاين.', ephemeral: true });
            }

            const updatedChannels = channels.filter(ch => ch !== channel.id);
            db.set(`Autoline_${interaction.guild.id}`, updatedChannels);

            return interaction.reply({ content: `✅ تم إزالة القناة <#${channel.id}> من الأوتولاين بنجاح.`, ephemeral: false });

        } catch (error) {
            console.error(error);
            interaction.reply({ content: '❌ حدث خطأ أثناء إزالة القناة من الأوتولاين.', ephemeral: true });
        }
    }
};
