const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const { Database } = require("st.db");
const db = new Database("/Database/Ticket");
const db2 = new Database("/Database/TempTicket");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('إعادة تسمية قناة التذكرة')
        .addStringOption(option => 
            option.setName("name")
            .setDescription("اكتب الاسم الجديد للقناة")
            .setRequired(true)
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            let name = interaction.options.getString("name");

            let ticketData = db2.get("ticketData_" + interaction.guild.id + "_" + interaction.channel.id) || null;
            if (!ticketData) return interaction.reply({ content: "❌ لم يتم العثور على بيانات التذكرة", ephemeral: true });

            if (!interaction.channel.name.startsWith(`ticket-`) && !ticketData) return;

            const author = await interaction.guild.members.fetch(interaction.user.id);
            const hasRole = author.roles.cache.some(role => role.id === ticketData.support_role);

            if (!hasRole) {
                return interaction.reply({ content: "❌ ليس لديك الدور المطلوب لتغيير اسم القناة.", ephemeral: true });
            }

            if (!name && interaction.channel.name === interaction.user.username) {
                await interaction.channel.setName("ticket-" + ticketData.ID).catch(console.error);
            } else if (!name && interaction.channel.name !== interaction.user.username) {
                await interaction.channel.setName(interaction.user.username).catch(console.error);
            } else if (name) {
                await interaction.channel.setName(name).catch(console.error);
            }

            return interaction.reply({ content: `✅ تم إعادة تسمية القناة إلى: ${name}`, ephemeral: true });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "❌ حدث خطأ أثناء إعادة تسمية القناة.", ephemeral: true });
        }
    },
};
