var express = require('express');
var router = express.Router();
var configPara = require('./../config/config.js');
var Queue = require('bull');
var dbInsert = require('../db/dbInsert');
var decisionMaker = require('./decisionMaker.js');

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


OtherEventQueue.process(20, async (job, done) => {
    try {
        let progress = 0;
        progress += 10;
        job.progress(progress);
      
        console.log("**** Inside The other Event Process ******")


         dbInsert.insert_db({ RawData: new Buffer(job.data.event.body).toString('hex'), MessageFrom: "HS", DBTimestamp: new Date() }, configPara.rawData, function (err, val) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("RAW Data " + val);
                }
            });
            decisionMaker.decsionMaker(new Buffer(job.data.event.body).toString('utf-8'), function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("other_result -----------> ",result);

                }
            });

        
    } catch (exception) {
        console.log(job.id + '---exception occured---->' + exception)
        throw new Error('some unexpected error----->' + job.id);
    }
});


OtherEventQueue.on('progress', function (job, progress) {
    //console.log("OtherEventQueue:-event progress--->" + job.id)
    //  console.log(`Job ${job.id} is ${progress * 100}% ready!`);
});
OtherEventQueue.on("global:completed", (j, job) => {
   // OtherEventQueue.getJobCounts().then(res => console.log('Total Job Count in the transaction dataQueue :\n', res));
    // console.log("OtherEventQueue:-event completed  triggered-for ----" + j)
    // console.log('This is the completed --->' + j + " The completed time is " + new Date().toISOString());
    // console.log(`Job ${job.id} completed! Result: ${result}`);
});
OtherEventQueue.on('error', function (error) {
    //  console.log("OtherEventQueue:-event error  triggered-for ----" + error)
    // An error occured.
});
OtherEventQueue.on('waiting', function (jobid) {
    //  console.log("TransaactionQueue :-event waiting  triggered-for ----" + jobid)
    // A Job is waiting to be processed as soon as a worker is idling.
});
OtherEventQueue.on('paused', function (job, result) {
    // The queue has been paused.
    //  console.log("OtherEventQueue:-event paused  triggered-for ----" + job.id)
})
OtherEventQueue.on('removed', function (job) {
    // console.log('This is removed-->' + job.id + " The end time is " + new Date().toISOString());
    //  console.log("OtherEventQueue:- event removed triggered-for ----" + job.id)
    // A job successfully removed.
});


module.exports = router;