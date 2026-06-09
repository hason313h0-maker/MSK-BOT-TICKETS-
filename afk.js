const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const afkSchema = require('../../Schemas/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
   .setName('afk')
   .setDescription('تعيين حالتك كـ AFK')
   .addSubcommand(command => 
        command
        .setName('تفعيل')
        .setDescription('ضع نفسك كـ AFK')
        .addStringOption(option => 
            option
            .setName('الرسالة')
            .setDescription('سبب كونك AFK (اختياري)')
            .setRequired(false))
    ),
    async execute(interaction) {

        const { options } = interaction;
        const sub = options.getSubcommand();

        const Data = await afkSchema.findOne({ Guild: interaction.guild.id, User: interaction.user.id });

        switch(sub) {
            case 'تفعيل':
                if(Data) 
                    return await interaction.reply({ content: '❌ أنت بالفعل في وضع AFK في هذا السيرفر!', ephemeral: true});
                else {
                    const message = options.getString('الرسالة') || "أنا في وضع AFK حالياً.";
                    
                    await afkSchema.create({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                        Message: message
                    });	

                    const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(`✅ تم تعيينك في وضع AFK داخل هذا السيرفر.\nالسبب: **${message}**`);

                    await interaction.reply({ embeds: [embed], ephemeral: true});
                }    
        }

    }
}
