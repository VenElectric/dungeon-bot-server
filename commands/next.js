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
const { SlashCommandBuilder } = require("@discordjs/builders");
const { turnOrder, initiativeFunctionTypes } = require("../services/initiative");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("next")
        .setDescription("Move turn order forward"),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            let [errorMsg, currentTurn] = yield turnOrder(interaction.channel.id, initiativeFunctionTypes.NEXT);
            console.log(errorMsg); // better error logging and handling
            yield interaction.reply(`Current Turn: ${currentTurn}`);
        });
    },
};