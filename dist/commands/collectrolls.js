"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { SlashCommandBuilder } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const parse_1 = require("../services/parse");
const weapon_of_logging = require("../utilities/LoggerConfig").logger;
require("dotenv").config();
// Forseen issues/requests:
// 1. Edit a collected response since player did not total something correctly or rolled the wrong dice.
// 2. Entered in the wrong amount of players to rollamount, and people have already entered their dice rolls
// Possibly combine this command with a second and third command (Add and Edit (need to differentiate from /addchar)) that allow the players to edit their responses
// Maybe also allow a manual command to stop the collector (I.E. like the reset collector I created) instead of using "rollamount". Or a conjunction of both. 
// Messaging on whether or not rollamount was entered. 
// I.E. Since you didn't enter a roll amount, the DM will need to use the stop command (no slash "/") to stop collection and show results
// And then with roll amount: The collection will stop after X results have been collected or after the idle time of XXX
module.exports = {
    data: new SlashCommandBuilder()
        .setName("collectrolls")
        .setDescription("Collect a series of player or NPC rolls.")
        .addStringOption((option) => option
        .setName("tag")
        .setDescription("Enter a tag so the bot can collect rolls!")
        .setRequired(true))
        .addIntegerOption((option) => option
        .setName("rollamount")
        .setDescription("Number of PC/NPC dice rolls to be collected.")
        .setRequired(true)),
    description: `__**Run Command**__ \nWhen you run this command, both a tag and the number of rolls to be collected is required.\n \n For instance, if you have three NPCs and two Player Characters that need to roll for initiative, you could type the following: 
    \n ***\u005C[collectrolls tag: init rollamount 5]*** \n This collects roll from 5 characters. \n 
    To enter the command and parameters, type in \u0005collectrolls and press enter. Then enter in the tag name and press the tab key. Then enter in the roll ammount (**numbers only!**) and hit tab again. Then press the enter key to submit.
    \n __**Collecting Rolls**__ \n Comment character names if you are rolling for multiple characters. \n \n Example: Tom has two characters: Gandalf the Wizard and his sidekick bard, Bilbo. \n
    Tom would roll twice using: \n \`\`\`ini\n[d20 init Bilbo]\`\`\` \n and then \n \`\`\`ini\n[d20 init Gandalf]\`\`\`
    The tag lets the bot know what rolls to collect. It is case sensitive!`,
    execute(commands, interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const tag = interaction.options.getString("tag");
            const rollAmount = interaction.options.getInteger("rollamount");
            const resetFilter = (m) => m.content.includes("reset");
            const filter = (m) => m.content.includes(`${tag}`) &&
                m.author.username === process.env.BOT_NAME;
            const embed = new MessageEmbed()
                .setTitle(`Embed for the tag: ${tag}`)
                .setColor("#0099ff");
            let isReset = false;
            weapon_of_logging.log({
                level: "debug",
                message: `Tag: ${tag} RollAmount: ${rollAmount}`,
                function: "collectRolls",
            });
            if (tag === null || rollAmount === null) {
                yield interaction.reply("Please enter a tag and number of dice rolls when you run this command. If you need help with this command, please use the /help slash command.");
                weapon_of_logging.warning({
                    message: "tag or roll amount is null",
                    function: "collectrolls",
                });
                return;
            }
            try {
                weapon_of_logging.log({
                    level: "debug",
                    message: "testing logger",
                    function: "collectRolls",
                });
                // retest collector so that it does not collect the initial interaction
                const collector = interaction.channel.createMessageCollector({
                    filter: filter,
                    idle: 60000,
                });
                const resetCollector = interaction.channel.createMessageCollector({
                    filter: resetFilter,
                    idle: 60000,
                });
                weapon_of_logging.debug({
                    message: "initiating collector",
                    function: "collectrolls",
                });
                yield interaction.reply(`Enter your rolls with the tag: \n\`\`\`css\n${tag}\n\`\`\` Leave a comment after the tag if you need to separate different rolls for different characters.\n I.E. \`\`\`\nd20+3 ${tag} Meridia\n\`\`\``);
                resetCollector.on("collect", (m) => {
                    isReset = true;
                    collector.stop();
                    resetCollector.stop();
                    weapon_of_logging.info({
                        message: "Collector has been reset",
                        function: "collectrolls",
                    });
                });
                collector.on("collect", (m) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (collector.collected.size > rollAmount) {
                        weapon_of_logging.debug({
                            message: "stopping collector",
                            function: "collectrolls",
                        });
                        collector.stop();
                    }
                    // regex to get character name out of comment
                    let commentArray = m.content.split("\n");
                    let characterName = commentArray[1]
                        .replace("[", "")
                        .replace("]``````bash", "")
                        .replace(tag, "")
                        .trim();
                    let roll = (0, parse_1.addBash)(commentArray[2].replace("```", "").replace('"', ""), "green");
                    weapon_of_logging.debug({
                        message: `collected roll ${commentArray[2]}`,
                        function: "collectrolls",
                    });
                    if (characterName.length > 0) {
                        embed.addField("\u200b", `${(0, parse_1.addBash)(characterName, "blue")} ${roll}`, false);
                    }
                    else {
                        interaction.guild.members
                            .fetch((_a = m.mentions.repliedUser) === null || _a === void 0 ? void 0 : _a.id)
                            .then((username) => {
                            let nickname = (0, parse_1.addBash)(username.nickname, "blue");
                            weapon_of_logging.debug({
                                message: "nickname successfully fetched",
                                function: "collectrolls",
                            });
                            embed.addField("\u200b", `${nickname} ${roll}`, false);
                        })
                            .catch((error) => {
                            weapon_of_logging.alert({
                                message: "could not find guild member or uncaught error",
                                function: "collectrolls",
                            });
                            console.log(error);
                        });
                    }
                }));
                collector.on("end", (collected) => __awaiter(this, void 0, void 0, function* () {
                    if (!isReset) {
                        weapon_of_logging.info({
                            message: "collector successuflly ended !isReset",
                            function: "collectrolls",
                        });
                        yield interaction.editReply("Collection ended");
                        yield interaction.channel.send({ embeds: [embed] });
                    }
                    else {
                        weapon_of_logging.info({
                            message: "collector successuflly ended else statement",
                            function: "collectrolls",
                        });
                        yield interaction.editReply("Please use the /collectrolls command again to start the collector.");
                    }
                }));
            }
            catch (error) {
                if (error instanceof Error) {
                    weapon_of_logging.alert({
                        message: error.message,
                        function: "collectrolls",
                    });
                }
            }
        });
    },
};
