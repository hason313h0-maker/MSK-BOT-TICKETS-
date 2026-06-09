const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join-voice")
        .setDescription("اجعل البوت ينضم إلى غرفة صوتية")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("اختر غرفة صوتية للانضمام إليها")
                .addChannelTypes(ChannelType.GuildVoice)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Connect),

    async execute(interaction, client) {
        try {
            const channel = interaction.options.getChannel("channel");

            if (!channel || channel.type !== ChannelType.GuildVoice) {
                return interaction.reply({ content: "❌ الرجاء اختيار غرفة صوتية صحيحة.", ephemeral: true });
            }

            joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });

            return interaction.reply({ content: `✅ تم انضمام البوت إلى غرفة **${channel.name}**.`, ephemeral: true });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "❌ حدث خطأ أثناء محاولة الانضمام إلى الغرفة.", ephemeral: true });
        }
    }
};
