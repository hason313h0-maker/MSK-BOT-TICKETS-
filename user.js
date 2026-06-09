const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('عرض معلومات عن مستخدم')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to view their info')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ size: 512 }))
            .addFields(
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '🤖 Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '📆 Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                ...(member ? [
                    { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: '📛 Nickname', value: member.nickname ?? 'None', inline: true },
                    { name: '⭐ Highest Role', value: member.roles.highest?.toString() ?? 'None', inline: true }
                ] : [])
            )
            .setColor('Random')
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
