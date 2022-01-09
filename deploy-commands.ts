const fs = require("fs");
const { token } = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

require("dotenv").config();

const clientId = process.env.CLIENT_ID

async function register_commands() {
  const commands = [];
  const commandFiles = fs
    .readdirSync("./commands")
    .filter((file: any) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "9" }).setToken(token);
  

  await rest
    .put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch(console.error);
}

module.exports = { register_commands };
