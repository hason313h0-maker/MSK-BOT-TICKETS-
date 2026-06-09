const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role-add")
        .setDescription("إعطاء رتبة لعضو")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("العضو الذي تريد إعطائه الرتبة")
                .setRequired(true))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("الرتبة التي تريد إعطائها")
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getMember("user");
        const role = interaction.options.getRole("role");

        if (!user || !role)
            return interaction.reply({ content: "❌ لم أتمكن من العثور على العضو أو الرتبة", ephemeral: true });

        await user.roles.add(role).catch(() => {
            return interaction.reply({ content: "❌ لا أستطيع إعطاء هذه الرتبة. تأكد أن رتبة البوت أعلى.", ephemeral: true });
        });

        return interaction.reply({ content: `✅ تم إعطاء الرتبة ${role} للعضو ${user}` });
    }
};
