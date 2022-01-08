const { SlashCommandBuilder } = require("@discordjs/builders");
import { webComponent, devWeb } from "../services/constants"
const { hyperlink } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("link")
		.setDescription("Get the link for the web component."),
	async execute(interaction:any) {

		let url = `${devWeb}/session/${interaction.channel.id}`
		await interaction.reply(`Here is the URL for your session: ${url} \nThis URL is specific to this channel. If you need to change the session to a different text channel then please use the /changechannel slash command.`);
	},
};

export {}