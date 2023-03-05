'use strict';
var express = require('express');
var router = express.Router();
var decisionMaker = require('./decisionMaker.js');
var configPara = require('../config/config.js');
var EventHubClient = require('azure-event-hubs');
var dbInsert = require('../db/dbInsert');
var protocolValidation = require('./protocolValidation.js');

var connectionString = configPara.IOTConnectionString;

var printError = function (err) {
    console.log(err);
};

/**
* @description - Insert the received message to Raw Data table and forward it for processing
*
* @param message  - Message received from Device
*
* @return Nil
*/
var printMessage = function (message) {
    dbInsert.insert_db({ RawData: new Buffer(message.body).toString('hex'), MessageFrom: "HS", DBTimestamp: new Date() }, configPara.rawData, function (err, val) {
        if (err) {
            console.error(err);
        } else {
            console.log("RAW Data " + val);
        }
    });
    decisionMaker.decsionMaker(new Buffer(message.body).toString('hex'), function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
        }
    });
};

/**
* @description - Receive the message from IOT
*
* @param connectionString  - Device Connection String to IOT
*
* @return a connection to the Azure IOT to continously receive messages
*/
// Receive the data from IoT
var client = EventHubClient.Client.fromConnectionString(connectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default',
                partitionId,
                { 'startAfterTime': Date.now() }
            ).then(function (receiver) {
                console.log('Created partition receiver: ' + partitionId);
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);

module.exports = router;
