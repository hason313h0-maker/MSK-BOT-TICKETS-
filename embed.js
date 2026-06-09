const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('إنشاء Embed مخصص')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('عنوان الـ Embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('وصف الـ Embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('image')
                .setDescription('رابط الصورة (اختياري)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const image = interaction.options.getString('image');

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#A6D3CF')
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) });

        if (image) embed.setImage(image);

        await interaction.reply({ embeds: [embed] });
    },
};
