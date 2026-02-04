import { CommandInteraction, Events, MessageFlags, PermissionsBitField, userMention } from "discord.js";
import { CustomDiscordClient } from "../types";
import { config } from "../config";
import logger from "../logger";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: CommandInteraction, client: CustomDiscordClient) {
        if (!interaction.isCommand()) return;
        const command = client.commands?.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ content: 'This command does not exist.', flags: MessageFlags.Ephemeral, });
        }
        try {
            if (command.dev && (!config.developers.includes(interaction.user.id))) {
                return await interaction.reply({ content: `This command is restricted to developers only.`, flags: MessageFlags.Ephemeral });
            }

            if (command.admin && !(interaction.member?.permissions instanceof PermissionsBitField && interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
                return await interaction.reply({ content: `This command is restricted to administrators only.`, flags: MessageFlags.Ephemeral });
            }

            if (command.owner && interaction.user.id !== config.owner) {
                return await interaction.reply({ content: `This command is restricted to the ${userMention(config.owner)} only.`, flags: MessageFlags.Ephemeral, });
            }

            await command.execute(interaction, client);
        } catch (error: Error | any) {
            logger.error(error.message);
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    },
};