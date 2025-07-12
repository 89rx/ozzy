import 'dotenv/config';
import { promises as fs } from 'fs';
import { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType, Collection } from 'discord.js';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
    ],
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  try {
    const { default: event } = await import(path.join(eventsPath, file));
    client[event.once ? 'once' : 'on'](event.name, (...args) => event.execute(...args));
  } catch (error) {
    console.error(`Error loading event ${file}:`, error);
  }
}

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const { default: command } = await import(path.join(commandsPath, file));
    if (!command.data || !command.execute) throw new Error('Missing properties');
    client.commands.set(command.data.name, command);
  } catch (error) {
    console.error(`Error loading command ${file}:`, error);
  }
}

try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to the database');

} catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
}


client.once('ready', async() => {
    try{
        console.log(`Logged in as ${client.user.tag}`);
        await client.user.setPresence({
            activities: [{ name: 'Working', type: ActivityType.Custom }],
            status: PresenceUpdateStatus.Online,
        });
    } catch (error) {
        console.error('Error setting presence:', error);
    }
});    

await client.login(process.env.DISCORD_TOKEN);
export default client;