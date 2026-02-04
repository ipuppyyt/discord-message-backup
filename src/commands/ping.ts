import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommandType } from "../types";
import formatUptime from "../utils/formatUptime";
import logger from "../logger";

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot stats'),
    global: true,
    async execute(interaction, client) {
        const ping = client.ws.ping;
        const uptime = formatUptime(client.uptime as number);
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        const numServers = client.guilds.cache.size;
        const numUsers = client.users.cache.size;
        const apiLatency = client.ws.ping;
        const discordJSVersion = require('discord.js').version;
        const nodeVersion = process.version;
        const version = require('../../package.json').version;
        const embedcolor = parseInt('D2042D', 16);

        const devbtn1 = new ButtonBuilder()
            .setLabel('Developer')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/ipuppyyt');

        const btnrow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
            .addComponents(devbtn1);

        const pingembed = new EmbedBuilder()
            .setColor(embedcolor)
            .setAuthor({ name: `${client.user?.username ?? 'Unknown'} Stats`, iconURL: client.user?.avatarURL() ?? undefined })
            .addFields(
                { name: ':ping_pong: Ping', value: `┕ ${ping} ms`, inline: true },
                { name: ':clock1: Uptime', value: '┕ ' + uptime, inline: true },
                { name: ':file_cabinet: Memory', value: `┕ ${Math.round(memoryUsage * 100) / 100} MB`, inline: true },
                { name: ':desktop: Servers', value: `┕ ${numServers}`, inline: true },
                { name: ':busts_in_silhouette: Users', value: `┕ ${numUsers}`, inline: true },
                { name: ':satellite: API Latency', value: `┕ ${apiLatency} ms`, inline: true },
                { name: ':robot: Version', value: `┕ v${version}`, inline: true },
                { name: ':blue_book: Discord.js', value: `┕ v${discordJSVersion}`, inline: true },
                { name: ':green_book: Node.js', value: `┕ ${nodeVersion}`, inline: true },
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.avatarURL() ?? undefined });

        interaction.reply({ embeds: [pingembed], components: [btnrow] }).catch(e => logger.error(e.message));
    },
} as SlashCommandType;