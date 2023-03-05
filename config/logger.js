//logging configuration
var winston = require('winston');
var azureBlobTransport = require("winston3-azureblob-transport");
var filename='iot-receiver';
var logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new (azureBlobTransport)({
            account: {
                name:process.env.BlobStorageAccount,
                key: process.env.BlobKey
            },
            containerName:process.env.LogContainer,
            blobName:filename,
            level: "info",
            bufferLogSize: 1,
            syncTimeout: 0,
            rotatePeriod: "YYYY-MM-DD-HH",
            eol: "\n"
        })
    ]
});
winston.addColors({
    info: 'green',
    warn: 'cyan',
    error: 'red',
    verbose: 'blue',
    i: 'gray',
    db: 'magenta'
});
module.exports = logger;