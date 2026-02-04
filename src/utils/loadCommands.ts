import { readdirSync, statSync } from "fs";
import { CustomDiscordClient } from "../types";
import { join } from "path";
import logger from "../logger";


interface loadCommandsType {
    (dir: string, client: CustomDiscordClient): { globalCommands: any[], guildCommands: any[] };
}

const loadCommands: loadCommandsType = (dir, client) => {
    const globalCommands = [];
    const guildCommands = [];
    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            const { globalCommands: subGlobal, guildCommands: subGuild } = loadCommands(filePath, client);
            globalCommands.push(...subGlobal);
            guildCommands.push(...subGuild);
        } else if (file.endsWith('.ts')) {
            try {
                const commandModule = require(filePath);
                const command = commandModule[Object.keys(commandModule)[0]];
                if (command.command === false) continue;
                if (command.data && command.data.name) {
                    logger.info(`Loaded (/) ${command.data.name}`);
                    client.commands?.set(command.data.name, command);
                    if (command.global) {
                        globalCommands.push(command.data.toJSON());
                    } else {
                        guildCommands.push(command.data.toJSON());
                    }
                } else {
                    logger.error(`The command at ${filePath} is missing a required "data" or "execute" property.`.red);
                }
            } catch (error: Error | any) {
                logger.error(`Error loading command file ${file}: ${error.message}`.red);
            }
        }
    }

    return { globalCommands, guildCommands };
};

export default loadCommands;