const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('عرض معلومات عن السيرفر'),

    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setTitle(`🌍 معلومات السيرفر: ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 512, dynamic: true }))
            .setColor('#A6D3CF') // لون ثابت وجميل
            .addFields(
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '🚀 Boost Level', value: `${guild.premiumTier}`, inline: true },
                { name: '💎 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: '✅ Verification', value: `${guild.verificationLevel}`, inline: true },
                { name: '📆 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '🖼️ Icon', value: guild.icon ? `[Open Icon](${guild.iconURL({ size: 1024 })})` : 'None', inline: true },
                { name: '🌆 Banner', value: guild.banner ? `[Open Banner](${guild.bannerURL({ size: 1024 })})` : 'None', inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
