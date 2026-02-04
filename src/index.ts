import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { CustomDiscordClient } from './types';
import { config } from './config';
import logger from './logger';
import path from 'path';
import fs from 'fs';

const client: CustomDiscordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
const commandFiles = fs.readdirSync(commandsPath).filter((file)=> {
	if(file.endsWith('.ts') || file.endsWith('.js'))
		return file
});
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = require(filePath);
    const command = commandModule[Object.keys(commandModule)[0]];
    if (command.command === false) continue;
    if (command.data && command.execute) { client.commands.set(command.data.name, command) }
    else { logger.error(`The command at ${filePath} is missing a required "data" or "execute" property.`) }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath);
const eventFiles = fs.readdirSync(eventsPath).filter((file)=> {
	if(file.endsWith('.ts') || file.endsWith('.js'))
		return file
});
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventModule = require(filePath);
    const event = eventModule[Object.keys(eventModule)[0]];
    if (event.once) { client.once(event.name, (...args) => event.execute(...args, client)) }
    else { client.on(event.name, (...args) => event.execute(...args, client)) }
}

// Load handlers
const handlersPath = path.join(__dirname, 'handlers');
if (!fs.existsSync(handlersPath)) fs.mkdirSync(handlersPath);
const handlerFiles = fs.readdirSync(handlersPath).filter((file)=> {
	if(file.endsWith('.ts') || file.endsWith('.js'))
		return file;
});
for (const file of handlerFiles) {
    const filePath = path.join(handlersPath, file);
    const handlerModule = require(filePath);
    const handler = handlerModule[Object.keys(handlerModule)[0]];
    if (handler.name && handler.execute) { client.on(handler.name, (...args) => handler.execute(...args, client)) }
    else { logger.error(`The handler at ${filePath} is missing a required "name" or "execute" property.`) }
}

// Add error handling
client.on('error', error => logger.error(error.message));
client.on('unhandledRejection', error => logger.fail('UNHANDLED', error.message));
client.on('warn', warning => logger.warning('WARN', warning));

if (config.token) client.login(config.token);
else { logger.error('No token provided'); process.exit(0); }