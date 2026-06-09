const { SlashCommandBuilder, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { Database } = require("st.db");

const db = new Database("/Database/Ticket");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('إنشاء لوحة تذاكر جديدة')
        .addChannelOption(option => 
            option.setName("channel")
                .setDescription("اختر القناة الخاصة باللوحة")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
        .addChannelOption(option => 
            option.setName("ticket_category")
                .setDescription("اختر التصنيف الخاص بزر اللوحة الأول")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true))
        .addStringOption(option => 
            option.setName("button_name")
                .setDescription("اكتب اسم الزر")
                .setRequired(true)
                .setMaxLength(40))
        .addRoleOption(option => 
            option.setName("support_role")
                .setDescription("اختر دور فريق الدعم")
                .setRequired(true))
        .addStringOption(option => 
            option.setName("button_color")
                .setDescription("اختر لون الزر")
                .addChoices(
                    { name: "أزرق", value: "1" },
                    { name: "رمادي", value: "2" },
                    { name: "أخضر", value: "3" },
                    { name: "أحمر", value: "4" }))
        .addStringOption(option => 
            option.setName("button_emoji")
                .setDescription("اكتب الإيموجي للزر")),

    async execute(interaction) {
        try {
            const panal_channel = interaction.options.getChannel("channel");
            const panal_category = interaction.options.getChannel("ticket_category");
            const button_name = interaction.options.getString("button_name");
            const button_color = interaction.options.getString("button_color") || "1";
            const button_emoji = interaction.options.getString("button_emoji") || null;
            const support_role = interaction.options.getRole("support_role");

            let msg = await interaction.channel.send({ content: "جارٍ إعداد لوحة التذاكر..." });

            const modal = new ModalBuilder()
                .setCustomId(msg.id + "_ticketsetup")
                .setTitle("إعداد لوحة التذاكر");

            const input1 = new TextInputBuilder()
                .setCustomId('panal_message')
                .setRequired(true)
                .setLabel("اكتب رسالة اللوحة")
                .setMaxLength(2000)
                .setStyle(TextInputStyle.Paragraph);

            const input2 = new TextInputBuilder()
                .setCustomId('panal_message_type')
                .setRequired(true)
                .setLabel("نوع الرسالة (embed / message)")
                .setPlaceholder("embed")
                .setStyle(TextInputStyle.Short);

            const input3 = new TextInputBuilder()
                .setCustomId('panal_welcome')
                .setRequired(true)
                .setLabel("اكتب رسالة الترحيب")
                .setMaxLength(2000)
                .setStyle(TextInputStyle.Paragraph);

            const input4 = new TextInputBuilder()
                .setCustomId('panal_welcome_type')
                .setRequired(true)
                .setLabel("نوع رسالة الترحيب (embed / message)")
                .setPlaceholder("embed")
                .setStyle(TextInputStyle.Short);

            const input5 = new TextInputBuilder()
                .setCustomId('panel_image_url')
                .setRequired(false)
                .setLabel("رابط صورة اللوحة (اختياري)")
                .setPlaceholder("ضع رابط الصورة هنا")
                .setStyle(TextInputStyle.Short);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input1),
                new ActionRowBuilder().addComponents(input2),
                new ActionRowBuilder().addComponents(input3),
                new ActionRowBuilder().addComponents(input4),
                new ActionRowBuilder().addComponents(input5)
            );

            db.set("ticketSetupData_" + msg.id, {
                panal_channelID: panal_channel.id,
                panal_categoryID: panal_category.id,
                button_name: button_name,
                button_color: button_color,
                button_emoji: button_emoji,
                support_role: support_role.id
            }).then(() => {
                interaction.showModal(modal);
            }).catch((error) => {
                console.error(error);
                return interaction.reply({ content: "❌ حدث خطأ، يرجى المحاولة مرة أخرى.", ephemeral: true });
            });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ حدث خطأ، يرجى المحاولة مرة أخرى.", ephemeral: true });
        }
    }
};
