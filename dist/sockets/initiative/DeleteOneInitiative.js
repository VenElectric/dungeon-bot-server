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
const ServerCommunicationTypes_1 = require("../../Interfaces/ServerCommunicationTypes");
const weapon_of_logging = require("../../utilities/LoggerConfig").logger;
module.exports = {
    name: ServerCommunicationTypes_1.EmitTypes.DELETE_ONE_INITIATIVE,
    execute(io, socket, client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { deleteSingle, getSession, updateSession, } = require("../../services/database-common");
                if (data.docId !== undefined) {
                    let finalMessage = yield deleteSingle(data.docId, data.sessionId, ServerCommunicationTypes_1.secondLevelCollections.INITIATIVE);
                    if (finalMessage instanceof Error) {
                        weapon_of_logging.alert({
                            message: finalMessage.message,
                            function: ServerCommunicationTypes_1.EmitTypes.DELETE_ONE_INITIATIVE,
                            docId: data.docId,
                        });
                    }
                    let [isSorted, onDeck, sessionSize] = yield getSession(data.sessionId);
                    sessionSize -= 1;
                    isSorted = false;
                    onDeck = 0;
                    let errorMsg = yield updateSession(data.sessionId, onDeck, isSorted, sessionSize);
                    weapon_of_logging.debug({ message: "emitting update and deletion", function: ServerCommunicationTypes_1.EmitTypes.DELETE_ONE_INITIATIVE });
                    socket.broadcast.to(data.sessionId).emit(ServerCommunicationTypes_1.EmitTypes.UPDATE_SESSION, false);
                    socket.broadcast
                        .to(data.sessionId)
                        .emit(ServerCommunicationTypes_1.EmitTypes.DELETE_ONE_INITIATIVE, data.docId);
                    if (errorMsg instanceof Error) {
                        weapon_of_logging.alert({
                            message: errorMsg.message,
                            function: "DELETE_ONE SocketReceiver",
                        });
                    }
                }
            }
            catch (error) {
                console.log(error);
                if (error instanceof Error) {
                    weapon_of_logging.alert({
                        message: error.message,
                        function: "DELETE_ONE SocketReceiver",
                    });
                }
            }
        });
    },
};
