import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Validate environment variables
if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  try {
    const filePath = path.join(commandsPath, file);
    const { default: command } = await import(filePath);
    if (command.data && command.data.toJSON) {
      commands.push(command.data.toJSON());
    }
  } catch (error) {
    console.error(`❌ Error loading command ${file}:`, error);
  }
}

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

try {
  console.log(`🔄 Refreshing ${commands.length} application commands...`);
  
  const data = await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  
  console.log(`✅ Successfully reloaded ${data.length} commands!`);
} catch (error) {
  console.error('❌ Deployment failed:', error);
  
  process.exit(1);
}