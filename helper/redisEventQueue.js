var express = require('express');
var router = express.Router();
var configPara = require('../config/config.js');
var Queue = require('bull');
// var tls = require('tls');

var OtherEventQueue = new Queue('OtherEventQueue',
    {
        redis: {
            port: 6380,
            host: configPara.redisHost,
            password: configPara.redisPassword,
            tls: {
                servername: configPara.redisHost
            },
            connectTimeout: 30000

        }, AdvancedSettings: {
            lockDuration: number = 30000,
            lockRenewTime: number = 15000
        }
    }
);

// var OtherEventQueue = new Queue('OtherEventQueue','redis://127.0.0.1:6379');
module.exports = {
    OtherEventQueue: OtherEventQueue
}