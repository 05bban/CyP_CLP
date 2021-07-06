const { Client, MessageEmbed, Util } = require("discord.js");

const mongoose = require("mongoose");

const modelo = require("./modelos/puntos");

const config = require("./config");

const client = new Client({ intents: 32509 });

mongoose.connect(config.mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log(`MongoDB: Conectada!`);
}).catch((err) => {
    console.log(`MongoDB: ${err}`);
});

client.once("ready", async () => {
    console.log(`Conectado!`);
    client.user.setActivity(`Camel's Lab Proyekt!`, { type: "COMPETING" });
});

client.on("message", async (message) => {

    if (message.author.bot) return;

    const checkModel = await modelo.findOne({ id: message.author.id });

    if (!checkModel) {
        const newModel = new modelo({ id: message.author.id });
        await newModel.save();
    }

    const args = message.content.split(/ +/g);
    const command = args.shift().slice(config.prefix.length).toLowerCase();
    if (!message.content.toLowerCase().startsWith(config.prefix) || message.channel.type !== "dm") return;


    if (command === "darpuntos") {

        let roles = ["XXXXXXXXXXXXXXXXXX"];

        if (!message.member.permissions.has("ADMINISTRATOR") && !roles.some(id => message.member.roles.cache.has(id))) {
            return message.reply(`No tienes acceso!`).then(O_o => {
                setTimeout(() => { O_o.delete() }, 5000)
            });
        }

        let num = args.slice(1).join(" ")
        let member = message.mentions.members.first() || message.guild.members.resolve(args[0]);

        if (!member) {
            return message.reply(`Menciona a un usuario!`).then(O_o => {
                setTimeout(() => { O_o.delete() }, 5000)
            });
        }

        const checkPoints = await modelo.findOne({ id: member.id });

        if (!checkPoints) {
            const newModel = new modelo({ id: message.author.id });
            await newModel.save();
            return message.reply(`Ejecuta nuevamente el comando, se le creo un perfil al usuario **${member.displayName}**.`);
        }

        if (!num) num = 1;

        const InfoPuntos = {
            staff: message.author.id,
            fecha: Date.now(),
            puntos: parseInt(num)
        };

        checkPoints.logPuntos.push(InfoPuntos);
        checkPoints.puntosTotales = parseInt(checkPoints.puntosTotales) + parseInt(num);
        await checkPoints.save();

        message.reply(`Se le agregaron **${num}** puntos a **${member.displayName}**.`);

        const ch = message.guild.channels.resolve("857794220403195904");
        const embed = new MessageEmbed()
            .setColor(0x36393f)
            .addField(`⚙️ \`|\` STAFF`, `${message.author.toString()} - ${message.author.id}`)
            .addField(`📅 \`|\` Fecha`, new Date(InfoPuntos.date).toLocaleString("es"), true)
            .addField(`:military_helmet:  \`|\` Soldado`, `${member.toString()} - ${member.id}`)
            .addField(`💡 \`|\` Puntos`, `${num} (**Total**: ${checkPoints.puntosTotales})`)

        ch.send({ embeds: [embed] })


    };

    if (command === "top") {

        const checkPoints = await modelo.find();

        let filtro = checkPoints.sort((a, b) => b.puntosTotales - a.puntosTotales).map((user, i) => `\`[${i + 1}]\` <@${user.id}>: ${user.puntosTotales}`)
            .slice(0, 10);

        const embed = new MessageEmbed()
            .setAuthor(`Top de puntos!`, message.guild.iconURL({ dynamic: true }))
            .setDescription(filtro.join("\n"))
            .setColor(message.member.displayHexColor)

        message.reply({ embeds: [embed] });

    }

    if (command === "puntos") {

        let member = message.mentions.members.first() || message.guild.members.resolve(args[0]) || message.member;

        const checkPoints = await modelo.findOne({ id: member.id });
        const embed = new MessageEmbed()
            .setAuthor((member.id === message.member.id) ? `Tus puntos!` : `Puntos de ${member.displayName}!`,
                member.user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(message.guild.iconURL({ dynamic: true, size: 512 }))
            .setColor(member.displayHexColor);

        if (!checkPoints) {
            const newModel = new modelo({ id: message.author.id });
            await newModel.save();
            embed.addField(`🔎 \`|\` Puntos!`, `**Militar**: 0`);
            message.reply({ embeds: [embed] });
        }

        embed.addField(`🔎 \`|\` Puntos!`, `**Militar**: ${checkPoints.puntosTotales}`);
        message.reply({ embeds: [embed] });

    }



});

client.login(config.token);

process.on("unhandledRejection", (err) => {
    console.error(`unhandledRejection: ${err.stack}`);
});
