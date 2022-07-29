"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServerCommunicationTypes_1 = require("../../Interfaces/ServerCommunicationTypes");
const weapon_of_logging = require("../../utilities/LoggerConfig").logger;
module.exports = {
    name: ServerCommunicationTypes_1.EmitTypes.UPDATE_RECORD_SPELL,
    async execute(io, socket, client, data) {
        const { updatecollectionRecord } = await Promise.resolve().then(() => __importStar(require("../../services/database-common")));
        weapon_of_logging.debug({
            message: "updating one value",
            function: ServerCommunicationTypes_1.EmitTypes.UPDATE_RECORD_SPELL,
            docId: data.payload.id,
        });
        try {
            const spellRecord = { ...data.payload };
            console.log(spellRecord);
            await updatecollectionRecord(spellRecord, ServerCommunicationTypes_1.secondLevelCollections.SPELLS, data.payload.id, data.sessionId);
            weapon_of_logging.debug({
                message: ServerCommunicationTypes_1.secondLevelCollections.SPELLS,
                function: ServerCommunicationTypes_1.EmitTypes.UPDATE_RECORD_SPELL,
                docId: data.payload.id,
            });
            console.log(data.sessionId);
            socket.broadcast
                .to(data.sessionId)
                .emit(ServerCommunicationTypes_1.EmitTypes.UPDATE_RECORD_SPELL, data.payload);
        }
        catch (error) {
            if (error instanceof Error) {
                weapon_of_logging.alert({
                    message: error.message,
                    function: ServerCommunicationTypes_1.EmitTypes.UPDATE_RECORD_SPELL,
                    docId: data.payload.id,
                });
            }
        }
    },
};
