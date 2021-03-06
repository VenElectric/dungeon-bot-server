"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const weapon_of_logging = require("../utilities/LoggerConfig").logger;
const { SlashCommandBuilder } = require("discord.js");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("changechannel")
        .setDescription("Change the channel of your game session."),
    description: `Select a guild channel (this guild only) from the drop-down list to change your session to.`,
    async execute(interaction) {
        let menuChannels = [];
        try {
            let guildChannels = await interaction.guild.channels.fetch();
            guildChannels.forEach((item) => {
                if (item.type !== "GUILD_CATEGORY" && item.type !== "GUILD_VOICE") {
                    weapon_of_logging.debug({ message: "add in new channel to menu", function: "changechannel" });
                    menuChannels.push({
                        label: item.name,
                        value: item.id,
                    });
                }
            });
        }
        catch (error) {
            if (error instanceof Error) {
                weapon_of_logging.alert({ message: error.message, function: "changechannel" });
            }
        }
        const row = new MessageActionRow().addComponents(new MessageSelectMenu()
            .setCustomId("changechannel")
            .setPlaceholder("Nothing selected")
            .addOptions(menuChannels));
        weapon_of_logging.info({ message: "replying to interaction with menu", function: "changechannel" });
        await interaction.reply({
            content: "Select a new channel for your session.",
            components: [row],
        });
    },
};
