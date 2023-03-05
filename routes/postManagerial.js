var express = require('express');
//var https = require('http');
var configPara = require('../config/config.js');

var https = (process.env.protocol === 'http') ? require('http') : require('https');

/**
* @description - Post the data to the web services.
*
* @param post_data  - Data Received from Device processed
*                     into JSON format.
*
* @param webpage  - Web Service to hit based on the Action and Attributes
*                   for the packet received from Device.
*
* @return Success/Failure message as per the response from web services.
*/
function postManagerialData(post_data, webpage, callback) {
    // An object of options to indicate where to post to
    console.log("Webpage ==>" +webpage);
    var post_options = {
        host: configPara.Hostname,
        path: webpage,
        // port: configPara.port,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(post_data))
        }
    };
    try {
        // Set up the request
        var post_req = https.request(post_options, function (res) {
            res.setEncoding('utf8');

            var responseString = '';
            res.on('data', function (post_data) {
                responseString += post_data;
            });

            res.on('end', function () {
                try {
                    console.log("responseString ==>" +responseString);
                    var responseObject = JSON.parse(responseString);
                    if (responseObject.Type) {
                        return callback(null, 'Success');
                    } else {
                        return callback(null, 'Failure');
                    }
                } catch (err) {
                    console.log("err: ", err);
                    callback(err, null);
                }
            });
        });
        // post the data
        post_req.write(JSON.stringify(post_data));
        post_req.end();
        return callback(null, 'Data Posted to Webservice');
    } catch (error) {
        return callback(error);
        // return callback(new Error(error), null);
    }
}

module.exports = {
    postManagerialData: postManagerialData
}