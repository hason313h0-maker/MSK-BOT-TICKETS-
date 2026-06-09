const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the help menu with categories'),

  async execute(interaction) {
    const prefix = interaction.client.prefix || '!';

    const helpEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Help Menu')
      .setDescription('Select a category from the dropdown menu below to see commands.')
      .setTimestamp()
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Requested by: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
      });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_select')
      .setPlaceholder('Select a help category')
      .addOptions([
        { label: 'Owner', description: 'Owner commands', value: 'owner_help' },
        { label: 'Admin', description: 'Admin commands', value: 'admin_help' },
        { label: 'Public', description: 'Public commands', value: 'public_help' },
        { label: 'Roles', description: 'Role management commands', value: 'roles_help' },
        { label: 'Ticket', description: 'Ticket system commands', value: 'ticket_help' },
        { label: 'AutoReply', description: 'Auto-reply commands', value: 'autoreply_help' },
        { label: 'AutoLine', description: 'Auto-line commands', value: 'autoline_help' },
        { label: 'Feedback', description: 'Feedback commands', value: 'feedback_help' },
        { label: 'Suggestions', description: 'Suggestions commands', value: 'suggestions_help' }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const message = await interaction.reply({
      embeds: [helpEmbed],
      components: [row],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60 * 1000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
      let embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTimestamp()
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `Requested by: ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        });

      switch (i.values[0]) {
        case 'owner_help':
          embed.setTitle('Owner Commands').setDescription('Commands for the bot owner:')
            .addFields(
              { name: '/join-voice', value: 'اجعل البوت ينضم إلى غرفة صوتية' },
              { name: '/cmd', value: 'تعيين اختصار لأمر معين' },
              { name: '/blacklist setup', value: 'إعداد رتبة وقناة القائمة السوداء' },
              { name: '/blacklist add', value: 'إضافة عضو إلى القائمة السوداء' },
              { name: '/blacklist remove', value: 'إزالة عضو من القائمة السوداء' },
              { name: '/create-room', value: 'إنشاء غرفة جديدة في السيرفر' },
              { name: '/webhook create', value: 'إنشاء ويب هوك في قناة محددة' },
              { name: '/webhook list', value: 'عرض قائمة الويب هوك النشطة في السيرفر' },
              { name: '/webhook create', value: 'إنشاء غرفة جديدة في السيرفر' },
              { name: '/create-room', value: 'إنشاء غرفة جديدة في السيرفر' },
              { name: '/emoji-channel set', value: 'تعيين قناة لإضافة الإيموجي تلقائياً' },
              { name: '/emoji-channel remove', value: 'إزالة قناة الإيموجي' },
              { name: '/unbanall', value: 'إلغاء حظر جميع الأعضاء المحظورين من السيرفر' },



            );
          break;

        case 'admin_help':
          embed.setTitle('Admin Commands').setDescription('Commands for admins:')
            .addFields(
              { name: `/ban & ${prefix}ban`, value: 'حظر عضو من السيرفر' },
              { name: `/kick & ${prefix}kick`, value: 'طرد عضو من السيرفر' },
              { name: `/clear & ${prefix}clear`, value: 'مسح عدد محدد من الرسائل' },
              { name: `/lock & ${prefix}lock`, value: 'قفل الروم' },
              { name: `/unlock & ${prefix}unlock`, value: 'فتح الروم' },
              { name: `/come & ${prefix}come`, value: 'لاستدعاء شخص' },
              { name: `/hide & ${prefix}hide`, value: 'إخفاء القناة' },
              { name: `/unhide & ${prefix}unhide`, value: 'إظهار القناة الحالية للجميع' },
              { name: `/embed`, value: 'إنشاء Embed مخصص' },
              { name: `/say`, value: 'جعل البوت يقول شيئاً' },
              { name: `/slowmode set`, value: 'تعيين وضع التباطؤ للقناة' },
              { name: `/slowmode list`, value: 'عرض قائمة القنوات التي تحتوي على وضع التباطؤ' },
              { name: `/timeout add`, value: 'إيقاف عضو مؤقتاً لمدة محددة' },
              { name: `/timeout remove`, value: 'إزالة الإيقاف المؤقت من عضو' },
              { name: `/timeout list`, value: 'عرض الأعضاء الموقفين مؤقتاً حالياً' },
              { name: `/warn add`, value: 'تحذير عضو' },
              { name: `/warn remove`, value: 'إزالة تحذير من عضو' },
              { name: `/warn list`, value: 'عرض تحذيرات عضو' },




            );
          break;

        case 'public_help':
          embed.setTitle('Public Commands').setDescription('Commands for everyone:')
            .addFields(
              { name: `/avatar & ${prefix}avatar`, value: 'عرض صورة حساب مستخدم' },
              { name: `/banner & ${prefix}banner`, value: 'عرض البانر الخاص بمستخدم' },
              { name: `/server & ${prefix}server`, value: 'عرض معلومات عن السيرفر' },
              { name: `/user & ${prefix}user`, value: 'عرض معلومات عن مستخدم' },
              { name: `/afk`, value: 'تعيين حالتك كـ AFK' },
              { name: `/help`, value: 'إظهار أوامر البوت' }
            );
          break;

        case 'roles_help':
          embed.setTitle('Roles Commands').setDescription('Role management commands:')
            .addFields(
              { name: '/role-add', value: 'إعطاء رتبة لعضو' },
              { name: '/role-remove', value: 'إزالة رتبة من عضو' },
              { name: '/multiple-role', value: 'إعطاء أو إزالة رتبة لعدة أعضاء' },
              { name: '/role create', value: 'إنشاء رتبة جديدة' },
              { name: '/role rename', value: 'تغيير اسم رتبة موجودة' },
              { name: '/temp-role', value: 'إعطاء رتبة مؤقتة لعضو لفترة محددة' },

            );
          break;

        case 'ticket_help':
          embed.setTitle('Ticket Commands').setDescription('Ticket system commands:')
            .addFields(
              { name: '/add-user', value: 'إضافة مستخدم إلى التذكرة' },
              { name: '/remove-user', value: 'إزالة مستخدم من التذكرة' },
              { name: '/rename', value: 'إعادة تسمية قناة التذكرة' },
              { name: '/ticket-setup', value: 'إنشاء لوحة تذاكر جديدة' },
              { name: '/ticket-manage', value: 'إدارة لوحة التذاكر' },

            );
          break;

        case 'autoreply_help':
          embed.setTitle('AutoReply Commands').setDescription('Commands for auto reply:')
            .addFields(
              { name: '/autoreply-add', value: 'إضافة رد تلقائي' },
              { name: '/autoreply-remove', value: 'إزالة رد تلقائي' },
              { name: '/autoreply-list', value: 'عرض قائمة الردود التلقائية' }
            );
          break;

        case 'autoline_help':
          embed.setTitle('AutoLine Commands').setDescription('Commands for auto line:')
            .addFields(
              { name: '/autoline-channel', value: 'إضافة قناة جديدة إلى الأوتولاين.' },
              { name: '/autoline-mode', value: 'تغيير وضع الأوتولاين.'},
              { name: '/remove-autoline', value: 'إزالة قناة من الأوتولاين'},
              { name: '/set-line', value: 'حدد صورة الخط (Line Image)'},
            );
          break;

        case 'feedback_help':
          embed.setTitle('Feedback Commands').setDescription('Feedback system commands:')
            .addFields(
              { name: '/feedback-room', value: 'اختيار روم الفيدباك.' },
              { name: '/remove-feedback-room', value: 'لازالة الفيدباك من روم معين.'},
              { name: '/feedback-line', value: 'لتحديد خط الفيدباك.'},
            );
          break;

        case 'suggestions_help':
          embed.setTitle('Suggestions Commands').setDescription('Suggestions system commands:')
            .addFields(
              { name: '/suggestions-room', value: 'لاضافة الاقتراحات الى روم' },
              { name: '/remove-suggestions-room', value: 'لازالة الاقتراح من روم' },
              { name: '/suggestions-line', value: 'تحديد خط الاقتراحات' },

            );
          break;
      }

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        selectMenu.setDisabled(true)
      );
      interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  }
};
