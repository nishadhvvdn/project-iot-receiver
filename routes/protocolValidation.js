var express = require('express');
var crc16 = require('crc-16');
var fs = require('fs');
var configPara = require('../config/config.js');

/**
* @description - Validate the crc of the packet received
*
* @param rawData  - Message received from Device
*
* @return Success/Incorrect Message as per the check
*/

function crcCheck(rawData, callback) {

    var strCrc = rawData.slice(0, rawData.length - 4);
    var crc = rawData.slice(rawData.length - 4);

    // Calculate the CRC
    var buf = new Buffer(strCrc, 'hex');
    var crcResult = crc16(buf);
    crcResult = new Buffer(crcResult).toString('hex');
    if (crcResult === crc) {
        return callback(null, "Success");
    } else {
        return callback(new Error("Incorrect CRC"), null);
    }
}

/**
* @description - Check the revision and equivalent file in the File path.
*
* @param rawData  - Message received from Device
*
* @return File Found/Not Found message as per the check
*/
function revCheck(rawData, callback) {
    var fileName = parseInt(rawData.slice(0, 4));
    fileName = configPara.filePath + fileName + '.json';

    fs.readFile(fileName, "utf8", function (err, jsonData) {
        if (err) {
            return callback(new Error("File Not Found: " + fileName), null);
        } else {
            var obj = JSON.parse(jsonData);
            return callback(null, obj);
        }
    });

}


module.exports = {
    crcCheck: crcCheck,
    revCheck: revCheck
}