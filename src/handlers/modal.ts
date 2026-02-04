import { Events, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { CustomDiscordClient } from "../types";
import { loadModals } from "../utils";
import logger from "../logger";

const modals = loadModals('../actions/modals');

export default {
    name: Events.InteractionCreate,
    async execute(interaction: ModalSubmitInteraction, client: CustomDiscordClient) {
        if (!interaction.isModalSubmit()) return;
        try {
            if (modals[interaction.customId]) {
                await modals[interaction.customId].execute(interaction, client);
            } else {
                logger.error(`Modal ${interaction.customId} not found.`);
                await interaction.reply({ content: 'Modal not found!', flags: MessageFlags.Ephemeral });
            }
        } catch (error: Error | any) {
            logger.error(`Error executing modal ${interaction.customId}: ${error.message}`);
            await interaction.reply({ content: 'There was an error while executing this modal!', flags: MessageFlags.Ephemeral });
        }
    },
};