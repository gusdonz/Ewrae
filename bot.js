const Discord = require("discord.js");
const settings = require("./ewrae.json")
const ytdl = require("ytdl-core");

var respostas = ["Sim","Não","Talvez"];

var canais = ["welcome", "bem-vindo", "bemvindo"];

function generateHex() {
  return "#" + Math.floor(Math.random * 16777215).toString(16);
}

function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(connection, message);
    else connection.disconnect();
  });
}

var servers = {};

var bot = new Discord.Client();

bot.on('ready', ready => {
  console.log(`Logado como ${bot.user.username} e pronto para uso.`);
});

bot.on("guildMemberAdd", member => {
  member.guild.channels.find("name", canais).sendMessage(member.toString() + " Bem-vindo ao servidor " + member.guild.name);

  member.addRole(member.guild.roles.find("name", "Membro"));

  member.guild.createRole({
    name: member.user.username,
    color: generateHex(),
    permissions: []
  }).then(function(role) {
    member.addRole(role); 
  });
});

bot.on("message", message => {
  if(message.author.bot) return;
    if(!message.content.startsWith(settings.prefix)) return;
    var args = message.content.substring(settings.prefix.length).split(" ");

      switch(args[0].toLowerCase()) {
        case "ping":
        var embed = new Discord.RichEmbed()
          .setTitle("Meu ping é de " + bot.ping + "ms.")
          .setFooter("© " + bot.user.username, bot.user.avatarURL)
          .setColor(0xCC6699);
          message.channel.sendEmbed(embed);
          break;
        case "8ball":
          if(args[1]) message.reply(respostas[Math.floor(Math.random() * respostas.length)]);
          else message.reply("Não entendi.");
          break;
        case "serverinfo":
          var embed = new Discord.RichEmbed()
          .setColor(0x9999FF)
          .setAuthor("" + message.guild.name, message.guild.iconURL)
          .setFooter("© " + message.guild.name, message.guild.iconURL)
          .setThumbnail(message.guild.iconURL)
          .addField(":blue_book: Nome:", message.guild.name, true)
          .addField(":man_in_tuxedo::skin-tone-2: Dono:", message.guild.owner.user.username, true)
          .addField(":key: ID do Dono:", message.guild.ownerID, true)
          .addField(":earth_americas: Pais do servidor:", message.guild.region, true)
          //.addField(":bust_in_silhouette: Membros:", message.guild.memberCount, true)
          .addField("Onlines agora:", message.guild.memberCount, true)
          .addField("Foi criado em:", message.guild.createdAt.getDate() + "/" + (message.guild.createdAt.getMonth() + 1) + "/" + message.guild.createdAt.getFullYear(), true);
          message.channel.sendEmbed(embed);
          break;
          case "me-nota":
            message.reply("Te notei XD");
          break;
          case "play":
            if(!args[1]) {
              message.channel.sendMessage("Por favor use um link válido!");
              return;
            }

            if(!message.member.voiceChannel) {
              message.channel.sendMessage("Você deve estar em um canal de voz!");
              return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id] = {
              queue: []
            };

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if(!message.guild.voiceConnection) message.member.voiceChannel.joinable.join().then(function(connection) {
              play(connection, message);
            });
          break;
          case "skip":

            var server = servers[message.guild.id];

            if(server.dispatcher) server.dispatcher.end();           
          break;
          case "stop":

            var server = servers[message.guild.id];
            if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
          break;
        default:
          message.reply("Este comando é invalido.");
  }
});

bot.login(settings.token);