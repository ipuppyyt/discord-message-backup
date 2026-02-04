import { Collection, Client as DiscordClient, ClientUser } from "discord.js";

export interface CustomDiscordClient extends DiscordClient {
    commands?: Collection<string, any>;
    user: ClientUser | null
    emit(event: string | symbol, ...args: any[]): boolean;
}