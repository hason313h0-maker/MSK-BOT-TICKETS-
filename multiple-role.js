const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("multiple-role")
        .setDescription("إعطاء أو إزالة رتبة لعدة أعضاء")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addStringOption(option =>
            option.setName("action")
                .setDescription("اختر العملية")
                .setRequired(true)
                .addChoices(
                    { name: "إعطاء", value: "give" },
                    { name: "إزالة", value: "remove" }
                ))
        .addRoleOption(option =>
            option.setName("role")
                .setDescription("اختر الرتبة")
                .setRequired(true))
        .addStringOption(option =>
            option.setName("target")
                .setDescription("من تريد تعديل رتبته")
                .setRequired(true)
                .addChoices(
                    { name: "كل الأعضاء", value: "all" },
                    { name: "البوتات فقط", value: "bots" }
                )),

    async execute(interaction) {
        const action = interaction.options.getString("action");
        const role = interaction.options.getRole("role");
        const target = interaction.options.getString("target");

        if (!role) return interaction.reply({ content: "❌ لم أتمكن من العثور على الرتبة", ephemeral: true });

        await interaction.deferReply({ ephemeral: false });

        let members;
        if (target === "all") {
            members = interaction.guild.members.cache.filter(m => !m.user.bot);
        } else if (target === "bots") {
            members = interaction.guild.members.cache.filter(m => m.user.bot);
        }

        let success = 0;
        for (const member of members.values()) {
            try {
                if (action === "give") {
                    await member.roles.add(role);
                } else if (action === "remove") {
                    await member.roles.remove(role);
                }
                success++;
            } catch (err) {
            }
        }

        return interaction.editReply({
            content: `✅ تم **${action === "give" ? "إعطاء" : "إزالة"}** الرتبة ${role} لـ ${success} عضو (${target === "all" ? "الأعضاء" : "البوتات"})`
        });
    }
};
