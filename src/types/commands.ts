import { CommandInteraction } from "discord.js";
import { CustomDiscordClient } from "./client";

export interface SlashCommandType {
    data: any;
    global?: boolean;
    execute(interaction: CommandInteraction, client: CustomDiscordClient, ...args: any): Promise<void>;
}
