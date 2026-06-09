console.clear();
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, Events, PermissionsBitField, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle, createCanvas, loadImage, InteractionType } = require("discord.js");
const mongoose = require('mongoose');
const { readdirSync } = require("fs");
const ascii = require('ascii-table');
const { token, prefix } = require('./config.json');
const { EventEmitter } = require('events');
const { Database } = require("st.db");
const discordTranscripts = require('discord-html-transcripts');
const db = new Database("/Database/Ticket");
const path = require("path");
const axios = require("axios");
const db2 = new Database("./Database/ChannelConfig"); 
let afkSchema = require("./Schemas/afkSchema.js");
const shortcutDB = new Database("./Database/ShortcutConfig"); 
const EmojiChannel = require('./Schemas/EmojiChannelSchema.js'); 


const emitter = new EventEmitter();
emitter.setMaxListeners(999);

const client = new Client({
  intents: Object.keys(GatewayIntentBits),
  shards: "auto",
  partials: Object.keys(Partials)
});

client.login(token);

client.slashcommands = new Collection();
client.commandaliases = new Collection();
const rest = new REST({ version: '10' }).setToken(token);


client.on("ready", async () => {
  try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: slashcommands });
      const table = new ascii();
      const totalCommands = slashcommands.length;
      table.addRow(`${totalCommands} </> Slash Commands`);
      console.log(table.toString());
  } catch (error) {
      console.error(error);
  }
});;

const fs = require("fs");

client.once("ready", () => {});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: "حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true });
  }
});





const slashcommands = [];
const slashTable = new ascii('SlashCommands').setJustify();

readdirSync('./SlashCommands/')
  .filter(folder => !folder.includes('.'))
  .forEach(folder => {
    readdirSync(`./SlashCommands/${folder}`)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
        const command = require(`./SlashCommands/${folder}/${file}`);
        if (command) {
          slashcommands.push(command.data.toJSON());
          client.slashcommands.set(command.data.name, command);
          slashTable.addRow(`/${command.data.name}`, '🟢 Working');
        }
      });
  });

console.log(slashTable.toString());


['Events', 'Rows'].forEach(category => {
  readdirSync(`./${category}/`)
      .filter(folder => !folder.includes('.'))
      .forEach(folder => {
          readdirSync(`./${category}/${folder}`)
              .filter(file => file.endsWith('.js'))
              .forEach(file => {
                  const event = require(`./${category}/${folder}/${file}`);
                  if (event.once) {
                      client.once(event.name, (...args) => event.execute(...args));
                  } else {
                      client.on(event.name, (...args) => event.execute(...args));
                  }
              });
      });

  readdirSync(`./${category}/`)
      .filter(file => file.endsWith('.js'))
      .forEach(file => {
          require(`./${category}/${file}`);
      });
});


client.commands = new Collection()
const commands = []; 

const table2 = new ascii('Prefix Commands').setJustify();
for (let folder of readdirSync('./Commands/').filter(folder => !folder.includes('.'))) {
  for (let file of readdirSync('./Commands/' + folder).filter(f => f.endsWith('.js'))) {
	  let command = require(`./Commands/${folder}/${file}`);
	  if(command) {
		commands.push(command);
  client.commands.set(command.name, command);
		  if(command.name) {
			  table2.addRow(`${command.name}` , '🟢 Working')
		  }
		  if(!command.name) {
			  table2.addRow(`${command.name}` , '🔴 Not Working')
		  }
	  }
  }
}
console.log(table2.toString())


mongoose.connect("mongodb+srv://mrfix:mrfixxx@cluster0.hlkve.mongodb.net/tjjjjyr?retryWrites=true&w=majority&appName=Cluster0/3mran", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('🚀 MongoDB Connection: SUCCESS');
}).catch(err => console.error('❌ MongoDB Connection: FAILED\n', err));


const AutoReply = require('./Schemas/AutoReply.js'); 

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

   
    const autoReplies = await AutoReply.find({ Guild: message.guild.id });

    for (const autoReply of autoReplies) {
        if (autoReply.Search && message.content.includes(autoReply.Message)) {
            
            if (autoReply.Type === 'reply') {
                return message.reply(autoReply.Reply);
            } else if (autoReply.Type === 'send') {
                return message.channel.send(autoReply.Reply);
            }
        } else if (!autoReply.Search && message.content === autoReply.Message) {
           
            if (autoReply.Type === 'reply') {
                return message.reply(autoReply.Reply);
            } else if (autoReply.Type === 'send') {
                return message.channel.send(autoReply.Reply);
            }
        }
    }
});


client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;

  {
    const cmd = shortcutDB.get(`clear_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}clear` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
      const amount = content[1] ? parseInt(content[1]) : 99;
      if (isNaN(amount) || amount <= 0 || amount > 100) return;
      try {
        const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
        const messagesToDelete = fetchedMessages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000);
        await message.channel.bulkDelete(messagesToDelete);
      } catch (error) {}
    }
  }

  {
    const cmd = await shortcutDB.get(`come_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}come` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return message.reply('يجب أن تملك صلاحية إدارة الرسائل (MANAGE_MESSAGES).');
      }

      const mentionOrID = content[1];
      const targetMember = message.mentions.members.first() || message.guild.members.cache.get(mentionOrID);

      if (!targetMember) {
        return message.reply('من فضلك قم بعمل منشن لشخص أو ضع الإيدي.');
      }

      const directMessageContent = `**تم استدعائك بواسطة : ${message.author}\nفي : ${message.channel}**`;

      try {
        await targetMember.send(directMessageContent);
        await message.reply('**تم الارسال للشخص بنجاح**');
      } catch (error) {
        await message.reply('**لم استطع الارسال للشخص**');
      }
    }
  }

  {
    const cmd = await shortcutDB.get(`lock_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}lock` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      try {
        await message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { SendMessages: false });
        return message.reply({ content: `**${message.channel} has been locked**` });
      } catch (error) {
        message.reply({ content: `لقد حدث خطأ، اتصل بالمطورين.` });
        console.log(error);
      }
    }
  }

  {
    const cmd = await shortcutDB.get(`unlock_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}unlock` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { SendMessages: true });
      return message.reply({ content: `**${message.channel} has been unlocked**` });
    }
  }

  {
    const cmd = await shortcutDB.get(`hide_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}hide` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { ViewChannel: false });
      return message.reply({ content: `**${message.channel} has been hidden**` });
    }
  }

  {
    const cmd = await shortcutDB.get(`unhide_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}unhide` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply({ content: `**لا تمتلك صلاحية لفعل ذلك**` });
      }
      await message.channel.permissionOverwrites.edit(message.channel.guild.roles.everyone, { ViewChannel: true });
      return message.reply({ content: `**${message.channel} has been unhidded**` });
    }
  }

  {
    const cmd = await shortcutDB.get(`server_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}server` || content[0] === cmd) {
      const { guild } = message;
      const verificationLevels = {
        0: "🟢 None",
        1: "🟡 Low",
        2: "🟠 Medium",
        3: "🔴 High",
        4: "🛡 Very High"
      };

      const embedser = new EmbedBuilder()
        .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true }) })
        .setColor('#A6D3CF')
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .setDescription(`📜 **Server Information for \`${guild.name}\`**`)
        .addFields(
          { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
          { name: '📆 Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👑 Owned By', value: `<@${guild.ownerId}>`, inline: true },
          { name: '👥 Members', value: `**${guild.memberCount.toLocaleString()}** members`, inline: true },
          { name: '✨ Boosts', value: `**${guild.premiumSubscriptionCount}** Boosts`, inline: true },
          {
            name: '💬 Channels',
            value: [
              `**${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size}** Text`,
              `**${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}** Voice`,
              `**${guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size}** Categories`
            ].join(" | "),
            inline: false
          },
          { name: '🌍 Verification Level', value: verificationLevels[guild.verificationLevel], inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.reply({ embeds: [embedser] });
    }
  }

  {
    const cmd = await shortcutDB.get(`user_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}user` || content[0] === cmd) {
      const target = message.mentions.users.first() || message.author;
      const member = await message.guild.members.fetch(target.id);

      const statusEmojis = {
        online: "🟢 Online",
        idle: "🟡 Idle",
        dnd: "🔴 Do Not Disturb",
        offline: "⚫ Offline/Invisible"
      };

      const embedUser = new EmbedBuilder()
        .setAuthor({ name: target.tag, iconURL: target.displayAvatarURL({ dynamic: true }) })
        .setColor('#A6D3CF')
        .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setDescription(`👤 **User Information for \`${target.tag}\`**`)
        .addFields(
          { name: "🆔 User ID", value: `\`${target.id}\``, inline: true },
          { name: "📆 Account Created", value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
          { name: "📥 Joined Server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: "💬 Status", value: statusEmojis[member.presence?.status || "offline"], inline: true },
          {
            name: "🎭 Roles",
            value: member.roles.cache.size > 1
              ? member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.toString()).join(", ")
              : "None",
            inline: false
          }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      return message.reply({ embeds: [embedUser] });
    }
  }

  {
    const cmd = await shortcutDB.get(`avatar_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}avatar` || content[0] === cmd) {
      const target = message.mentions.users.first() || message.author;
      const avatarURL = target.displayAvatarURL({ dynamic: true, size: 1024 });

      const embedAvatar = new EmbedBuilder()
        .setAuthor({ name: `${target.tag}'s Avatar`, iconURL: avatarURL })
        .setColor('#A6D3CF')
        .setImage(avatarURL)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`Download`)
          .setStyle(ButtonStyle.Link)
          .setURL(avatarURL)
      );

      return message.reply({ embeds: [embedAvatar], components: [row] });
    }
  }

  {
    const cmd = await shortcutDB.get(`banner_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}banner` || content[0] === cmd) {
      const target = message.mentions.users.first() || message.author;
      const user = await client.users.fetch(target.id, { force: true });
      const bannerURL = user.bannerURL({ dynamic: true, size: 1024 });

      if (!bannerURL) {
        return message.reply(`${target.tag} does not have a banner.`);
      }

      const embedBanner = new EmbedBuilder()
        .setAuthor({ name: `${user.tag}'s Banner`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setColor('#A6D3CF')
        .setImage(bannerURL)
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      const button = new ButtonBuilder()
        .setLabel(`Download`)
        .setStyle(ButtonStyle.Link)
        .setURL(bannerURL);

      const row = new ActionRowBuilder().addComponents(button);

      return message.reply({ embeds: [embedBanner], components: [row] });
    }
  }

  {
    const cmd = await shortcutDB.get(`ban_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}ban` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply('** لا تمتلك صلاحية باند**');
      }

      const targetUser = message.mentions.members.first() || (content[1] ? await message.guild.members.fetch(content[1]).catch(() => null) : null);

      if (!targetUser) {
        return message.reply('** يرجى تحديد العضو المراد حظره ( منشن او ايدي )**');
      }

      if (!targetUser.bannable) {
        return message.reply('** لا يمكنني حظر هذا العضو**');
      }

      const reason = content.slice(2).join(' ') || 'لا يوجد سبب';

      try {
        try {
          await targetUser.send(`**تم حظرك من سيرفر ${message.guild.name}\nالسبب: ${reason}**`);
        } catch (err) {
          console.log(`Couldn't DM user ${targetUser.user.tag}`);
        }

        await targetUser.ban({ reason: reason });

        await message.reply(`** تم حظر ${targetUser.user.tag}\nبواسطة: ${message.author.tag}\nالسبب: ${reason}**`);
      } catch (error) {
        console.error(error);
        message.reply('** حدث خطأ اثناء الحظر**');
      }
    }
  }

  {
    const cmd = await shortcutDB.get(`unban_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}unban` || content[0] === cmd) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
        return message.reply('** لا تمتلك صلاحية فك الباند**');
      }

      const userId = content[1];
      if (!userId) {
        return message.reply('** يرجى كتابة ايدي الشخص**');
      }

      try {
        const banList = await message.guild.bans.fetch();
        const bannedUser = banList.find(ban => ban.user.id === userId);

        if (!bannedUser) {
          return message.reply('** هذا الشخص غير محظور**');
        }

        await message.guild.members.unban(userId);

        await message.reply(`** تم فك الحظر عن ${bannedUser.user.tag}**`);
      } catch (error) {
        console.error(error);
        message.reply('** حدث خطأ أثناء فك الحظر**');
      }
    }
  }

  {
    const cmd = await shortcutDB.get(`tax_cmd_${message.guild.id}`) || null;
    const content = message.content.trim().split(/\s+/);
    if (content[0] === `${prefix}tax` || content[0] === cmd) {
      const argsStr = message.content.startsWith(`${prefix}tax`)
        ? message.content.slice(`${prefix}tax`.length).trim()
        : message.content.slice(cmd.length).trim();

      let number = argsStr;
      if (number.endsWith("k") || number.endsWith("K")) number = number.slice(0, -1) * 1000;
      else if (number.endsWith("m") || number.endsWith("M")) number = number.slice(0, -1) * 1000000;

      let number2 = parseFloat(number);

      if (isNaN(number2)) {
        return message.reply('يرجى إدخال رقم صحيح بعد الأمر');
      }

      let tax = Math.floor(number2 * (20) / (19) + 1);

      await message.reply(`${tax}`);
    }
  }
});



function parseEmoji(emoji) {
  const match = emoji.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/);
  if (!match) return null;

  return {
      animated: Boolean(match[1]),
      name: match[2],
      id: match[3],
  };
}

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  
  const emojiChannelConfig = await EmojiChannel.findOne({ Guild: message.guild.id });
  if (!emojiChannelConfig || message.channel.id !== emojiChannelConfig.Channel) return;

 
  const emojisRaw = message.content.split(' ').map(emoji => emoji.trim());
  const addedEmojis = [];
  const failedEmojis = [];

 
  const isImage = (url) => {
      const extension = url.split('.').pop().toLowerCase();
      return ['png', 'jpg', 'jpeg', 'gif'].includes(extension);
  };

  for (const emojiRaw of emojisRaw) {
      let link;

      if (!isImage(emojiRaw)) {
          const emoteMatch = emojiRaw.match(/<?(a)?:?(\w{2,32}):(\d{17,19})>?/gi);
          if (emoteMatch) {
              const emote = emoteMatch[0];
              const parsedEmoji = parseEmoji(emote);
              link = `https://cdn.discordapp.com/emojis/${parsedEmoji.id}.${parsedEmoji.animated ? 'gif' : 'png'}`;
          } else {
              link = emojiRaw; 
          }
      } else {
          link = emojiRaw; 
      }

      const emojiName = `emoji_${Date.now()}`; 

      try {
          const emoji = await message.guild.emojis.create({ attachment: link, name: emojiName });
          addedEmojis.push(emoji);
      } catch (error) {
          console.error(error); 
          failedEmojis.push(emojiRaw);
      }
  }

  const responseMessage = [];
  if (addedEmojis.length) {
      responseMessage.push(`${addedEmojis.length} emojis added: ${addedEmojis.join(', ')}`);
  }
  if (failedEmojis.length) {
      responseMessage.push(`فشل في إضافة الرموز التعبيرية التالية: ${failedEmojis.join(', ')}`);
  }

  if (responseMessage.length) {
      await message.reply({ content: responseMessage.join('\n') });
  }
});
const figlet = require('figlet');

figlet('MAYOR Development', {
  font: 'Standard', 
  horizontalLayout: 'default',
  verticalLayout: 'default'
}, function(err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }

  console.log(data);
  console.log('discord.gg/mayor'.padStart(25)); 
  console.log('Dev By 3mran'.padStart(22));     
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;



    const afkCheck = await afkSchema.findOne({
        Guild: message.guild.id,
        User: message.author.id
    });

    if (afkCheck) {
        await afkSchema.deleteMany({
            Guild: message.guild.id,
            User: message.author.id
        });

        const welcomeBack = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`Welcome back ${message.author}! I have removed your AFK status.`);

        return message.reply({ embeds: [welcomeBack] }).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }
  
    const mentionedUsers = message.mentions.users;
    if (mentionedUsers.size > 0) {
        for (const [, mentionedUser] of mentionedUsers) {
            const afkUser = await afkSchema.findOne({
                Guild: message.guild.id,
                User: mentionedUser.id
            });

            if (afkUser) {
                const afkEmbed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle(`${mentionedUser.tag} is AFK`)
                    .setDescription(afkUser.Message || "I'm AFK!");

                message.reply({ embeds: [afkEmbed] });
            }
        }
    }
});



// Handle errors
process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);
process.on("uncaughtExceptionMonitor", console.log);

module.exports = client;

// Load events
const eventsPath = path.join(__dirname, 'Events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


