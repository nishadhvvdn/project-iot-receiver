'use strict';
require("dotenv").config();
var express = require('express');
var router = express.Router();
var dbInsert = require('../db/dbInsert');
const { EventHubConsumerClient } = require('@azure/event-hubs');
var parser = require('../CEparser/parser');
const transactionProcess = require("../helper/transactionProcess.js");
const transactionFunction = require("../helper/transactionResult");
var fs = require('fs');
var csv = require("csv-stringify");
const redisEventQueue = require('./../helper/redisEventQueue');


/**
* @description - Insert the received message to Raw Data table and forward it for processing
*
* @param message  - Message received from Device
*
* @return Nil
*/
var printMessage = async function (message) {

    var meterDir = './csv/meter';
    var transformerDir = './csv/transformer';
    if (!fs.existsSync('./csv')) {
        fs.mkdirSync('./csv');
    }
    if (!fs.existsSync(meterDir)) {
        fs.mkdirSync(meterDir, { recursive: true });
    }
    if (!fs.existsSync(transformerDir)) {
        fs.mkdirSync(transformerDir, { recursive: true });
    }

    let otherEvents = [];
    const random = Math.floor(Math.random() * 100000000)
    const meterFilename = `./csv/meter/${random}.csv`
    const transformerFilename = `./csv/transformer/${random}.csv`
    if (message.length > 0) {
        let meterCsvData = [];
        let transformerCsvData = [];

        console.log('Start Time:',Date.now());

        for (const [i, event] of message.entries()) {

            var transactionData = await transactionProcess.getTransacriondata(new Buffer(event.body).toString('utf-8'))
            if (transactionData.Attribute === 'COMBINED_TRANSACTIONAL_DATA') {

                let [transformerResult, meterResult] = await Promise.all([transactionFunction.transformerObject(transactionData), transactionFunction.meterObject(transactionData)]);
                if (transformerResult.length > 0) {
                    try {
                        transformerCsvData = transformerCsvData.concat(transformerResult);

                    } catch (error) {
                        console.log(error)
                    }
                }
                if (meterResult.length > 0) {
                    try {
                        meterCsvData = meterCsvData.concat(meterResult);
                    } catch (error) {
                        console.log(error)
                    }
                }
                // commented for testing the flag updatiion
                // dbInsert.getDb(function (err, dbConn) {
                //     if (err) {
                //         logger.info("error updateScheduler : " + err);
                //         return err;
                //     }
                //     else {
                //         var SchedulerLogscollection = dbConn.db.collection('DELTA_SchedulerLogs');
                //         var SchedulerFlagscollection = dbConn.db.collection('DELTA_SchedulerFlags');

                //         schedularLogUpdate(transactionData, SchedulerLogscollection)
                //         schedularflagUpdate(transactionData, SchedulerFlagscollection)

                //     }
                // })
            } else {
                console.log("Other events added in Queue ")
                // REPLACE WITH QUEUE
                const job = await redisEventQueue.OtherEventQueue.add({
                    event: event,
                    TimeStampResponse: parser.getUTC()
                }, {
                    removeOnComplete: true,
                });
                otherEvents.push(event)
            }
            if (i == message.length - 1) {

                if (meterCsvData.length > 0 || transformerCsvData.length > 0) {
                    // console.log("meterCsvData = ", meterCsvData.length, "\n");
                    // console.log("transformerCsvData = ", transformerCsvData.length, "\n");
                    const p1 = new Promise((resolve, reject) => {
                        csv.stringify(meterCsvData, {
                            header: false
                        }, (err, output) => {
                            fs.writeFileSync(meterFilename, output);
                            // console.log("OK");
                            resolve(1)
                        });
                    });
                    const p2 = new Promise((resolve, reject) => {
                        csv.stringify(transformerCsvData, {
                            header: false
                        }, (err, output) => {
                            fs.writeFileSync(transformerFilename, output);
                            // console.log("OK");
                            resolve(1)
                        });
                    });
                    Promise.all([p1, p2])
                        .then((values) => {
                            // console.log("final call");
                            transactionProcess.saveToDB(meterFilename, transformerFilename);

                        })
                        .catch((error) => {
                            console.error(error.message);
                        });
                }
            }
        }

    }
};

/**
* @description - Receive the message from IOT
*
* @param connectionString  - Device Connection String to IOT
*
* @return a connection to the Azure IOT to continously receive messages
*/

const connectionString = process.env.CONNECTION_STRING
// created event hub for receving events in every 5 mins
const consumerClient = new EventHubConsumerClient(undefined, connectionString, undefined,
    undefined);
let processed = 0;

const subscription = consumerClient.subscribe(
    {
        processEvents: async (events, context) => {
            if (events.length > 0) {
                processed += events.length
                console.log('Recieved ' + events.length + ' Total ' + processed)
                await printMessage(events)

            }
        },
        processError: async (err, context) => {
            console.log(`Error on partition "${context.partitionId}": ${err}`);
        },
    },
    //Options param
    { maxBatchSize: 10000, maxWaitTimeInSeconds: 5 }
);

// Function Added for traansaction Flag update future it will remove  after discussion

function schedularLogUpdate(input, SchedulerLogscollection) {
    var lastConnectedMeterCount = 0;
    if (input.Transformer.NoOfConnectedMeter) {
        lastConnectedMeterCount = input.Transformer.NoOfConnectedMeter;
    }
    SchedulerLogscollection.findOneAndUpdate({ CellID: input.CellID, MessageID: input.MessageID }, { $set: { TimeStampResponse: new Date(input.TimeStampResponse), NoOfMeters: lastConnectedMeterCount } }, { upsert: true, sort: { 'TimeStampRequest': -1 } }, function (err, result) {
        if (err) {
            console.log("<<-- Error in update schedularLogUpdate Error : -->> " + err);
            return err;
        } else {
            console.log("log updated ")
            return true;
        }
    });
}
function schedularflagUpdate(input, SchedulerFlagscollection) {
    SchedulerFlagscollection.updateOne({ CellID: input.CellID }, { $set: { Flag: 0 } }, function (err, output) {
        if (err) {
            console.log('<<-- Unable to update SchedulerFlagscollection for DeviceId :' + res.value.DeviceID + " -->> Error : " + err);
            return err
        } else {
            console.log("flag updated");
            return true;
        }
    })
}

module.exports = router;
