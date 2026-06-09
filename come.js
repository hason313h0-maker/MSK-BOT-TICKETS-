const { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('come')
        .setDescription('لاستدعاء شخص')
        .addUserOption(user => user
            .setName("user")
            .setDescription("يرجى منشن الشخص.")
            .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            const user = interaction.options.getUser("user");
            const member = interaction.guild.members.cache.get(user.id);

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: `عذرا ليست لديك الصلاحيات لاستخدام هذا الامر.`,
                    ephemeral: true
                });
            }

            if (!member) {
                return interaction.reply({
                    content: 'لم يتم العثور على اليوزر.',
                    ephemeral: true
                });
            }

            if (member.id === interaction.member.id) {
                return interaction.reply({
                    content: `You cannot request yourself to come to the channel.`,
                    ephemeral: true,
                });
            }

            const button = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("Requested channel")
                    .setURL(interaction.channel.url)
            );

            const embed = new EmbedBuilder()
                .setDescription(`Hey ${member}, ${interaction.user} has requested you to join the channel ${interaction.channel}.`);

            await member.send({ embeds: [embed], components: [button] })
                .then(() => {
                    interaction.reply(`Request sent to ${member.user.username}.`);
                }).catch(() => {
                    interaction.reply(`Could not send a request to ${member.user.username}.`);
                });
        } catch (error) {
            console.log(error);
            return interaction.reply({
                content: 'An error occurred while sending the request.',
                ephemeral: true
            });
        }
    },
};
