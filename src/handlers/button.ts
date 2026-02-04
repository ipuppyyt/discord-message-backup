import { ButtonInteraction, Events, MessageFlags } from "discord.js";
import { CustomDiscordClient } from "../types";
import { loadButtons } from "../utils";

const buttons = loadButtons('../actions/buttons');

export default {
    name: Events.InteractionCreate,
    async execute(interaction: ButtonInteraction, client: CustomDiscordClient) {
        if (!interaction.isButton()) return;
        try {
            if (buttons[interaction.customId]) {
                await buttons[interaction.customId].execute(interaction, client);
            } else {
                await interaction.reply({ content: 'Button not found!', flags: MessageFlags.Ephemeral });
            }
        } catch (error: Error | any) {
            await interaction.reply({ content: 'There was an error while executing this button!', flags: MessageFlags.Ephemeral });
        }
    },
};