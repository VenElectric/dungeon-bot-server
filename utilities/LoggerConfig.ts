const Transport = require("winston-transport");
const winston = require("winston");
const { db } = require("../services/firebase-setup");
const { firestore } = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const Logger = require("le_node");
import { client } from "../index";
require("dotenv").config();

const logger = new Logger({
  token: process.env.LOG_ENTRIES,
});

class LogEntriesTransport extends Transport {
  constructor(options: any) {
    super(options);
    this.params = options.params || ["level", "message", "function", "itemId"];
  }

  log(info: any, callback: Function) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    let result = Object.values(info).some((item: any) => item == null);

    if (result) {
      throw new Error(`Parameters in a log can not be null.`);
    }

    if (info.level === "alert") {
      client.channels
        .fetch(process.env.MY_DISCORD)
        .then((channel: any) => {
          channel.send(`${info.function}: ${info.message}`);
        })
        .catch((error: any) => {
          logger.info(error.message);
        });
    }
    if (info.level) {
      logger.log(String(info.level), {
        message: info.message,
        function: info.function,
        itemId: info.itemId,
        ...info
      });
    }
    else{
      console.log(info);
    }

    callback();
  }
}

class FirestoreTransport extends Transport {
  constructor(options: any) {
    super(options);
    if (!options.hasOwnProperty("collection")) {
      throw new Error(`A collection is required`);
    } else {
      this.collectionRef = db.collection(options.collection);
    }

    this.params = options.params || ["level", "message"];
  }

  log(info: any, callback: Function) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    let result = Object.values(info).some((item: any) => item == null);

    if (result) {
      throw new Error(`Parameters in a log can not be null.`);
    }

    let docId = uuidv4();
    console.info(info.level);
    if (info.level === "alert") {
      client.channels.fetch(process.env.MY_DISCORD).then((channel: any) => {
        channel.send(`Critical Error Occurred. Please check logs`);
      });
    }

    this.collectionRef
      .doc(docId)
      .set({ ...info, timestamp: firestore.Timestamp.now() });

    callback();
  }
}

// const customLevels = {
//   levels :{
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     debug: 5,
//   },
//   colors :{
//     info: 'cyan',
//     debug: 'blue',
//     http: 'cyan',
//     warn: 'yellow',
//     error: 'red'
//   }
// }

const weapon_of_logging = winston.createLogger({
  levels: {
    alert: 0,
    warning: 1,
    info: 2,
    debug: 3,
  },
  format: winston.format.json(),
  defaultMeta: { service: "dungeon-bot" },
  transports: [
    new LogEntriesTransport({
      params: ["level", "message", "function", "itemId"],
      level: "debug",
    }),
  ],
});

// const weapon_of_logging = winston.createLogger({
//   levels :{
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     debug: 5,
//   },
//   format: winston.format.json(),
//   defaultMeta: { service: 'dungeon-bot' },
//   transports: [
//     new FirestoreTransport({
//       collection: "logging",
//       params: ["level", "message","function"],
//       level: "debug"
//     }),
//   ],
// });

exports.logger = weapon_of_logging;
