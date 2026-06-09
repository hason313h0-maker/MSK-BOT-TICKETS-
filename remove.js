const { SlashCommandBuilder, ChatInputCommandInteraction, Client } = require("discord.js");
const { Database } = require('st.db');

const db2 = new Database('/Database/TempTicket');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-user')
        .setDescription('إزالة مستخدم من التذكرة')
        .addUserOption(user => user
            .setName("user")
            .setDescription("اختر المستخدم الذي تريد إزالته")
            .setRequired(true)),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        try {
            let user = interaction.options.getUser("user");
            let ticketData = db2.get("ticketData_" + interaction.guild.id + "_" + interaction.channel.id) || null;

            if (!ticketData) {
                return interaction.reply({ content: '❌ لم يتم العثور على بيانات التذكرة!', ephemeral: true });
            }
            if (!interaction.channel.name.startsWith('ticket-') && !ticketData) return;

            const author = await interaction.guild.members.fetch(interaction.user.id);
            const hasRole = author.roles.cache.some(role => role.id === ticketData.support_role);

            if (!hasRole) {
                return interaction.reply({ content: '❌ ليس لديك الصلاحية المطلوبة!', ephemeral: true });
            }

            let member = interaction.guild.members.cache.get(user.id);
            if (!member) {
                return interaction.reply({ content: '❌ لم يتم العثور على المستخدم في السيرفر!', ephemeral: true });
            }

            if (member.id === interaction.channel.topic || member.id === ticketData.owner) {
                return interaction.reply({ content: '❌ لا يمكن إزالة صاحب التذكرة أو العضو الموجود في موضوع القناة.', ephemeral: true });
            }

            await interaction.channel.permissionOverwrites.edit(member.id, {
                ViewChannel: false,
                SendMessages: false,
            });

            await interaction.reply({ content: `✅ تم إزالة ${member} من التذكرة ${interaction.channel}` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ حدث خطأ أثناء تنفيذ الأمر!', ephemeral: true });
        }
    },
};
