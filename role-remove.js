const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("role-remove")
        .setDescription("إزالة رتبة من عضو")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option =>
            option.setName("user")
                .setDescription("العضو الذي تريد إزالة الرتبة منه")
                .setRequired(true))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("الرتبة التي تريد إزالتها")
                .setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getMember("user");
        const role = interaction.options.getRole("role");

        if (!user || !role)
            return interaction.reply({ content: "❌ لم أتمكن من العثور على العضو أو الرتبة", ephemeral: true });

        await user.roles.remove(role).catch(() => {
            return interaction.reply({ content: "❌ لا أستطيع إزالة هذه الرتبة. تأكد أن رتبة البوت أعلى.", ephemeral: true });
        });

        return interaction.reply({ content: `✅ تم إزالة الرتبة ${role} من العضو ${user}` });
    }
};
