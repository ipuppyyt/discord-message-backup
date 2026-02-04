import { ActivityType, Events, REST, Routes } from "discord.js";
import { CustomDiscordClient } from "../types";
import { loadCommands } from "../utils";
import { config } from "../config";
import logger from "../logger";
import { join } from "path";

export const ready = {
    name: Events.ClientReady,
    once: true,
    async execute(client: CustomDiscordClient) {
        logger.info(`Logged in as ${client.user?.tag}`);
        logger.info(`Refreshing commands...`);
        const rest = new REST({ version: '10' }).setToken(config.token);

        const commandsPath = join(__dirname, '../commands');
        const { globalCommands, guildCommands } = loadCommands(commandsPath, client);

        try {
            await rest.put(Routes.applicationCommands(config.client.id), { body: globalCommands });
            logger.success('GLOBAL', 'Registered');
            const guilds = await client.guilds.fetch();
            for (const guild of guilds.values()) {
                await rest.put(Routes.applicationGuildCommands(config.client.id, guild.id), { body: guildCommands });
                logger.success(`GUILD`, `Registered ${guild.name}`);
            }
        } catch (error: Error | any) {
            logger.error(`Error registering commands: ${error.message}`);
        }

        client.user?.setPresence({
            status: config.activity.type,
            activities: [{ name: config.activity.message, type: ActivityType.Custom }]
        });
    },
};