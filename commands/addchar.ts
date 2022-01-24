const { SlashCommandBuilder } = require("@discordjs/builders");
const { v4: uuidv4 } = require("uuid");
import { addSingle } from "../services/database-common";
import { collectionTypes } from "../Interfaces/ServerCommunicationTypes";
const weapon_of_logging = require("../utilities/LoggerConfig").logger

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addchar")
    .setDescription("Enter your initiative.")
    .addStringOption((option: any) =>
      option
        .setName("charactername")
        .setDescription("Enter Character Name")
        .setRequired(true)
    )
    .addIntegerOption((option: any) =>
      option
        .setName("initiativeroll")
        .setDescription("Enter Initiative Dice Roll (NO MODIFIER ADDED)")
        .setRequired(true)
    )
    .addIntegerOption((option: any) =>
      option
        .setName("initiativemodifier")
        .setDescription("Enter Initiative Modifier")
        .setRequired(true)
    )
    .addBooleanOption((option: any) =>
      option
        .setName("isnpc")
        .setDescription("NPC? True or False")
        .setRequired(true)
    )
    .addBooleanOption((option: any) =>
      option
        .setName("isnat20")
        .setDescription("Rolled a Nat 20?")
        .setRequired(true)
    ),
  async execute(interaction: any) {
    let sessionId = interaction.channel.id;
    let name = interaction.options.getString("charactername");
    let initiativeRoll = interaction.options.getInteger("initiativeroll");
    let initiativeModifier =
      interaction.options.getInteger("initiativemodifier");
    let isNpc = interaction.options.getBoolean("isnpc");
    let isNat20 = interaction.options.getBoolean("isnat20");
    
    if (isNat20) {
      initiativeRoll += 100;
    }

    try {
      let options = {
        id: uuidv4(),
        characterName: name as string,
        initiative: initiativeRoll + initiativeModifier,
        initiativeModifier: initiativeModifier as number,
        roundOrder: 0,
        isCurrent: false,
        statusEffects: [],
        isNpc: isNpc,
      };
      weapon_of_logging.debug({message: "Grabbing initial values for character", function:"addchar"});

      let errorMsg = await addSingle(
        options,
        sessionId,
        collectionTypes.INITIATIVE
      );

      if (errorMsg instanceof Error){
        weapon_of_logging.alert(
          errorMsg.name,
          errorMsg.message,
          errorMsg.stack,
          options
        );
      }
      else {
        weapon_of_logging.debug({message: "Grabbing initial values for character", function:"addchar"})
      }
     
      let replyString = `Your character, ${name}, has been added with an initiative of ${initiativeRoll} + ${initiativeModifier} = ${
        initiativeRoll + initiativeModifier
      }. You can edit this on the website component using the /link command. \n Any rolled nat 20's have 100 added on for sorting purposes.`;
      weapon_of_logging.info({message: `Replying to interaction: ${replyString}`, function:"addchar"});
      
      await interaction.reply(replyString);
    } catch (error) {
      if (error instanceof Error) {
          weapon_of_logging.alert({message:error.message,function:"addchar"});
      }
    }
  },
};

export {};
