const { Client, Collection, Discord, createInvite, ChannelType, WebhookClient, PermissionFlagsBits, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType, Events, Message, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ContextMenuCommandBuilder, SlashCommandBuilder, REST, Routes, GatewayCloseCodes, ButtonStyle, PermissionOverwriteManager, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChatInputCommandInteraction } = require("discord.js");
const isImageUrl = require('is-image-url');
const { Database } = require("st.db");

const db = new Database("/Database/Ticket");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-manage')
        .setDescription('إدارة لوحة التذاكر')
        .addStringOption(ID => ID
            .setName("message_id")
            .setDescription("ضع معرف رسالة لوحة التذاكر هنا.")
            .setRequired(true))
        .addStringOption(manage => manage
            .setName("type")
            .setDescription("اختر نوع إدارة اللوحة.")
            .setRequired(true)
            .addChoices(
                { name: "إضافة زر", value: "add_button" },
                { name: "إدارة الصورة المصغرة", value: "thumbnail" },
                { name: "إدارة الصورة", value: "image" },
                { name: "رسالة اللوحة", value: "message" },
                { name: "إدارة النماذج", value: "modals" },
            ))

        // Add button
        .addChannelOption(channel => channel
            .setName("ticket_category")
            .setDescription("اختر الفئة للزر الجديد في اللوحة.")
            .addChannelTypes(ChannelType.GuildCategory))
        .addStringOption(name => name
            .setName("button_name")
            .setDescription("اكتب اسم الزر.")
            .setMaxLength(40))
        .addRoleOption(role => role
            .setName("support_role")
            .setDescription("اختر دور فريق الدعم."))
        .addStringOption(color => color
            .setName("button_color")
            .setDescription("اختر لون الزر.")
            .addChoices(
                { name: "أزرق", value: "1" },
                { name: "رمادي", value: "2" },
                { name: "أخضر", value: "3" },
                { name: "أحمر", value: "4" },
            ))
        .addStringOption(emoji => emoji
            .setName("button_emoji")
            .setDescription("اكتب الرموز التعبيرية للزر."))

        // Add image
        .addStringOption(img => img
            .setName("image_url")
            .setDescription("ضع رابط الصورة."))

        // Manage modals
        .addStringOption(modal => modal
            .setName("modal_action")
            .setDescription("اختر الإجراء لإدارة النموذج.")
            .addChoices(
                { name: "إضافة إدخال", value: "add" },
                { name: "حذف كل الإدخالات", value: "remove" },
            ))
        .addStringOption(modal => modal
            .setName("modal_button_id")
            .setDescription("اختر معرف الزر لإضافة النموذج إليه.")
            .addChoices(
                { name: "1", value: "1" },
                { name: "2", value: "2" },
                { name: "3", value: "3" },
                { name: "4", value: "4" },
                { name: "5", value: "5" },
            )),
    /**
    * @param {ChatInputCommandInteraction} interaction
    */
    async execute(interaction, client) {
        try {
            let ID = interaction.options.getString("message_id");
            let manage_type = interaction.options.getString("type");

            if (isNaN(ID)) return interaction.reply({ content: "❌ معرف الرسالة غير صالح.", ephemeral: true });

            let msg = [];
            let messages = await interaction.channel.messages.fetch();
            messages.filter((m) => {
                if (m.author.id == interaction.client.user.id && m.id == ID && m.components[0]) {
                    msg.push(m);
                }
            });

            if (!msg.length)
                return interaction.reply({ content: "❌ لم يتم العثور على رسالة لوحة بهذه المعرف.", ephemeral: true });

            let panal = interaction.channel.messages.cache.get(msg[0].id);

            let useEmbed = new EmbedBuilder()
                .setColor("DarkButNotBlack")
                .setTitle("إدارة لوحة التذاكر")
                .setDescription(`</${interaction.commandName}:${interaction.commandId}>`);

            if (manage_type == "add_button") {
                let panal_category = interaction.options.getChannel("ticket_category");
                let button_name = interaction.options.getString("button_name");
                let support_role = interaction.options.getRole("support_role");
                let button_color = interaction.options.getString("button_color") || 1;
                let button_emoji = interaction.options.getString("button_emoji") || null;
                if (!panal_category || !button_name || !support_role)
                    return interaction.reply({
                        embeds: [
                            useEmbed
                                .addFields(
                                    { name: "ticket_category", value: "الفئة مطلوبة.", inline: true },
                                    { name: "button_name", value: "اسم الزر مطلوب.", inline: true },
                                    { name: "support_role", value: "دور الدعم مطلوب.", inline: true },
                                    { name: "button_color", value: "لون الزر اختياري.", inline: true },
                                    { name: "button_emoji", value: "رموز الزر اختيارية.", inline: true },
                                )
                        ], ephemeral: true
                    });
                let msg = await interaction.channel.send({ content: "⏳ جاري المعالجة، يرجى الانتظار..." });

                const modal = new ModalBuilder()
                    .setCustomId(msg.id + "_" + ID + "_addbutton" + "_ticketmanage")
                    .setTitle("إدارة إعدادات الزر");

                const input1 = new TextInputBuilder()
                    .setCustomId('panal_welcome')
                    .setRequired(true)
                    .setLabel("رسالة الترحيب للوحة")
                    .setMaxLength(2000)
                    .setStyle(TextInputStyle.Paragraph);
                const input2 = new TextInputBuilder()
                    .setCustomId('panal_welcome_type')
                    .setRequired(true)
                    .setLabel("نوع الرسالة (نص / Embed)")
                    .setPlaceholder("message / embed")
                    .setStyle(TextInputStyle.Short);

                const the_input1 = new ActionRowBuilder().addComponents(input1);
                const the_input2 = new ActionRowBuilder().addComponents(input2);

                modal.addComponents(the_input1, the_input2);

                db.set("ticketManageData_" + msg.id, {
                    categoryID: panal_category.id,
                    button_name: button_name,
                    button_color: button_color,
                    button_emoji: button_emoji,
                    support_role: support_role.id,
                }).then(() => {
                    interaction.showModal(modal);
                }).catch((error) => {
                    console.log(error);
                    return interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر.', ephemeral: true });
                });
            } 
            else if (manage_type == "thumbnail") {
                if (!panal.embeds[0])
                    return interaction.reply({ content: "❌ لا يوجد Embed في رسالة اللوحة.", ephemeral: true });
                let img = interaction.options.getString("image_url");
                if (img && !isImageUrl(img)) {
                    return interaction.reply({ content: "❌ رابط الصورة غير صالح.", ephemeral: true });
                }
                if (!img && !panal.embeds[0].thumbnail)
                    return interaction.reply({
                        embeds: [
                            useEmbed
                                .addFields(
                                    { name: "image_url", value: "الصورة المصغرة مطلوبة.", inline: true },
                                )
                        ], ephemeral: true
                    });
                if (img) {
                    let embed = new EmbedBuilder()
                        .setColor(panal.embeds[0].color)
                        .setDescription(panal.embeds[0].description)
                        .setFooter(panal.embeds[0].footer)
                        .setAuthor(panal.embeds[0].author)
                        .setTimestamp(new Date(panal.embeds[0].timestamp))
                        .setThumbnail(img);
                    if (panal.embeds[0].image) embed.setImage(panal.embeds[0].image.proxyURL);
                    panal.edit({ embeds: [embed] }).then(() => {
                        return interaction.reply({ content: "✅ تم تحديث الصورة المصغرة بنجاح.", ephemeral: true });
                    });
                } else {
                    let embed = new EmbedBuilder()
                        .setColor(panal.embeds[0].color)
                        .setDescription(panal.embeds[0].description)
                        .setFooter(panal.embeds[0].footer)
                        .setAuthor(panal.embeds[0].author)
                        .setTimestamp(new Date(panal.embeds[0].timestamp));
                    panal.edit({ embeds: [embed] }).then(() => {
                        return interaction.reply({ content: "✅ تم إزالة الصورة المصغرة.", ephemeral: true });
                    });
                }
            } 
            else if (manage_type == "image") {
                let img = interaction.options.getString("image_url");
                if (!img || !isImageUrl(img))
                    return interaction.reply({ content: "❌ رابط الصورة غير صالح أو مفقود.", ephemeral: true });

                let embed = new EmbedBuilder()
                    .setColor(panal.embeds[0].color)
                    .setDescription(panal.embeds[0].description)
                    .setFooter(panal.embeds[0].footer)
                    .setAuthor(panal.embeds[0].author)
                    .setTimestamp(new Date(panal.embeds[0].timestamp))
                    .setImage(img);
                panal.edit({ embeds: [embed] }).then(() => {
                    return interaction.reply({ content: "✅ تم تحديث الصورة بنجاح.", ephemeral: true });
                });
            } 
            else if (manage_type == "message") {
                const modal = new ModalBuilder()
                    .setCustomId(msg.id + "_" + ID + "_changemessage" + "_ticketmanage")
                    .setTitle("إعداد رسالة لوحة التذاكر");

                const input1 = new TextInputBuilder()
                    .setCustomId('panal_message')
                    .setRequired(true)
                    .setLabel('اكتب الرسالة للوحة.')
                    .setMaxLength(2000)
                    .setStyle(TextInputStyle.Paragraph);
                const input2 = new TextInputBuilder()
                    .setCustomId('panal_message_type')
                    .setRequired(true)
                    .setLabel('اختر نوع الرسالة (message / Embed)')
                    .setPlaceholder("message / embed")
                    .setStyle(TextInputStyle.Short);

                const the_input1 = new ActionRowBuilder().addComponents(input1);
                const the_input2 = new ActionRowBuilder().addComponents(input2);

                modal.addComponents(the_input1, the_input2);
                await interaction.showModal(modal);
            } 
            else if (manage_type == "modals") {
                let action = interaction.options.getString("modal_action");
                let buttonId = interaction.options.getString("modal_button_id");

                if (!action || !buttonId)
                    return interaction.reply({
                        embeds: [
                            useEmbed
                                .addFields(
                                    { name: "modal_action", value: "الإجراء مطلوب للمتابعة.", inline: true },
                                    { name: "modal_button_id", value: "معرف الزر مطلوب للمتابعة.", inline: true }
                                )
                        ],
                        ephemeral: true
                    });

                if (action == "add") {
                    let ticketData = db.get("ticketData_" + ID);
                    let buttonData = ticketData.buttonsData[`button${buttonId}`] || null;

                    if (!buttonData)
                        return interaction.reply({ 
                            content: `❌ لم يتم العثور على بيانات الزر بالمعرف ${buttonId}. تأكد من وجود الزر.`,
                            ephemeral: true
                        });

                    const modal = new ModalBuilder()
                        .setCustomId(msg.id + "_" + ID + "_addmodal" + "_" + buttonId + "_ticketmanage")
                        .setTitle("إدارة إعدادات النموذج");

                    const input1 = new TextInputBuilder()
                        .setCustomId('text')
                        .setRequired(true)
                        .setLabel("اكتب النص للنموذج")
                        .setMaxLength(45)
                        .setStyle(TextInputStyle.Short);

                    const input2 = new TextInputBuilder()
                        .setCustomId('type')
                        .setRequired(true)
                        .setLabel("اختر نوع الإدخال (نص، رقم، إلخ)")
                        .setPlaceholder("اختر نوع الإدخال")
                        .setStyle(TextInputStyle.Short);

                    const the_input1 = new ActionRowBuilder().addComponents(input1);
                    const the_input2 = new ActionRowBuilder().addComponents(input2);

                    modal.addComponents(the_input1, the_input2);

                    interaction.showModal(modal);
                } else if (action == "remove") {
                    let ticketData = db.get("ticketData_" + ID);
                    let buttonData = ticketData.buttonsData[`button${buttonId}`] || null;

                    if (!buttonData)
                        return interaction.reply({
                            content: `❌ لم يتم العثور على بيانات الزر بالمعرف: ${buttonId}.`,
                            ephemeral: true
                        });

                    ticketData.buttonsData[`button${buttonId}`].modals = [];
                    db.set("ticketData_" + ID, ticketData);

                    interaction.reply({
                        content: `✅ تم مسح بيانات الزر بنجاح!`,
                        ephemeral: true
                    });
                }
            }

        } catch (error) {
            console.log(error);
            return interaction.reply({ content: '❌ حدث خطأ، يرجى المحاولة لاحقاً.', ephemeral: true });
        }
    }
};
