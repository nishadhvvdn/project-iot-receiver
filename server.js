/* ************ REQUIRED FILES AND PACKAGES ******** */
var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");

/* ************* PORT INITIALIZATION **************** */ 
var argport = null;
try {
	argport = process.argv.slice(2);
	argport = argport[0];
} catch(err) {
	console.log(err);
}

var port = process.env.PORT || 9242;
port = argport ? argport : port;

/* ******** APP COMMUNICATION CONFIGURATION. ********** */
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

/* ******** ROUTE REQUIRES ************** */

// IoT Receiver
var Receiver = require('./routes/Receiver.js');
app.use('/Receiver', Receiver);

app.listen(port, function () {
    console.log('DataVine Collection Engine Receiver are up and running on port %d', this.address().port);
});

process.on('uncaughtException', function (err) {
    console.log("Error: " + err);
});
