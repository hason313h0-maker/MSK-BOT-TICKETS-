const { Events } = require('discord.js');
const { Database } = require('st.db');

const db = new Database('/Database/Autoreply');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return; // Ignore bot messages

        // استرجاع الردود التلقائية من قاعدة البيانات
        const autoReply = await db.get(message.guild.id);

        // تحقق مما إذا كانت هناك ردود تلقائية
        if (autoReply) {
            const { message: messageToSearch, reply, search, type } = autoReply;

            // تحقق من حالة البحث
            const messageContent = message.content.toLowerCase();
            const searchTerm = messageToSearch.toLowerCase();

            let matches = false;

            if (search) {
                // تحقق مما إذا كانت الرسالة تحتوي على النص
                matches = messageContent.includes(searchTerm);
            } else {
                // تحقق مما إذا كانت الرسالة تبدأ بالنص
                matches = messageContent.content(searchTerm);
            }

            // إذا تطابقت الرسالة
            if (matches) {
                // تحقق من نوع الرد
                if (type === 'reply') {
                    await message.reply(reply);
                } else if (type === 'send') {
                    await message.channel.send(reply);
                }
            }
        }
    },
};
