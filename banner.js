const { SlashCommandBuilder, EmbedBuilder, Routes } = require('discord.js');

async function fetchUserBannerURL(client, userId, size = 1024) {
    const data = await client.rest.get(Routes.user(userId));
    if (!data?.banner) return null;
    const isGif = data.banner.startsWith('a_');
    const ext = isGif ? 'gif' : 'png';
    return `https://cdn.discordapp.com/banners/${userId}/${data.banner}.${ext}?size=${size}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('عرض البانر الخاص بمستخدم')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Select a user to view their banner')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const user = interaction.options.getUser('user') || interaction.user;
        await interaction.deferReply();

        const bannerUrl = await fetchUserBannerURL(client, user.id, 1024);
        if (!bannerUrl) return interaction.editReply({ content: `❌ المستخدم **${user.tag}** لا يملك بانر.`, ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle(`Banner of ${user.tag}`)
            .setImage(bannerUrl)
            .setColor('Random')
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
