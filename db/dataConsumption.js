var mongodb = require('mongodb');
var async = require('async');
var configPara = require('../config/config.js');
var deviceTableModel = require('./mySqlTables/deviceDataconsumption.js');
var transformerTableModel = require('./mySqlTables/transformerDataconsumption.js');
var deltalinkTableModel = require('./mySqlTables/deltalinkDataConsumption.js');
var meterTableModel = require('./mySqlTables/meterDataconsumption.js');
var deltalinkClientsHourlyModel = require('./mySqlTables/deltalinkClientsDataHourlyConsumption.js');
var deltalinkClientsTrendingModel = require('./mySqlTables/deltalinkClientsDataTrendingConsumption.js');
var mongoDbCon = require('./dbInsert.js');

var cnnString = configPara.DBconnectionString;
global.dbase = {};
var moment = require("moment");
const { QueryTypes } = require('sequelize');
const { query } = require('winston');

// var theDb = null;
// function getDb(callback) {
//     var response = {}
//     if (!theDb || (theDb && !theDb.db.serverConfig.isConnected())) {
//         mongodb.MongoClient.connect(cnnString, { poolSize: 6, socketTimeoutMS: 60000, useUnifiedTopology: true }, function (err, databaseClient) {
//             if (err) {
//                 response.Type = false;
//                 response.Message = "Database connection refused";
//                 callback(response);
//             } else {
//                 dbase = databaseClient;
//                 let db = databaseClient.db("DELTA");
//                 theDb = {
//                     db: db
//                 };
//                 callback(null, theDb);
//             }
//         });
//     } else {
//         callback(null, theDb);
//     }
// }

function UpsertInToMySQL(objToInsert, table, tableModel, tableProp, callback) {
    configPara.getConnection(function (err, connection) {
        if (err) {
            callback(err, null);
        } else {
            var objModel = connection.define(table, tableModel, tableProp);
            objModel.upsert(objToInsert, {
                // A function (or false) for logging your queries
                // Will get called for every SQL query that gets sent
                // to the server.
                logging: console.log,
                // If plain is true, then sequelize will only return the first
                // record of the result set. In case of false it will return all records.
                plain: false,
                // Set this to true if you don't have a model definition for your query.
                raw: true,
            }).then(function (det) {
                callback(null, det);
            }, function (err) {
                callback(err, null);
            });

        }
    });
}

function insertMultipleRecords(objctToInsert, table, tableModel, tableProp, callback) {
    try {
        configPara.getConnection(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                var objModel = connection.define(table, tableModel, tableProp);
                objModel.bulkCreate(objctToInsert, {
                    logging: console.log,
                    // If plain is true, then sequelize will only return the first
                    // record of the result set. In case of false it will return all records.
                    plain: false,
                    // Set this to true if you don't have a model definition for your query.
                    raw: true,
                }).then(function (det) {
                    callback(null, det);
                }, function (err) {
                    callback(err, null);
                });

            }
        });
    } catch (exp) {
        callback(err, null);
    }
}

function insertDataConsumptionValue(data, callback) {
    try {
        if (data.NoOfDevice) {
            fetchTransformerDetails(data, function (err, consumptionData) {
                if (err) {
                    callback(err, null);
                } else {
                    fetchDevicesData(consumptionData, function (err, hsDataConsumption, meterDataConsumption, deltalinkDataConsumption, deltalinkClients, consumptionData) {
                        if (err)
                            callback(err, null);
                        else {
                            insertLatestDataInSql(hsDataConsumption, meterDataConsumption, deltalinkDataConsumption, deltalinkClients, function (err, result) {
                                if (err)
                                    callback(err, null);
                                else {
                                    calculateHourlyData(consumptionData, function (err, result) {
                                        if (err)
                                            callback(err, null);
                                        else {
                                            callback(null, "done");
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            callback("No data consumption device", null);
        }
    } catch (exception) {
        callback(exception, null);
    }
}

function insertLatestDataInSql(hsDataConsumption, meterDataConsumption, deltalinkDataConsumption, deltalinkClients, callback) {
    try {
        async.parallel({
            insertHsDetails: function (innercallback) {
                if (hsDataConsumption.length) {
                    var table1 = 'transformer_dataconsumption';
                    insertMultipleRecords(hsDataConsumption, table1, transformerTableModel.objDeviceConsumption, transformerTableModel.objTableProps, function (err, response) {
                        if (err)
                            innercallback(err, null);
                        else
                            innercallback();
                    });
                } else {
                    innercallback(null, null);
                }
            },
            insertMeterDetails: function (innercallback) {
                if (meterDataConsumption.length) {
                    var table2 = 'meter_dataconsumption';
                    insertMultipleRecords(meterDataConsumption, table2, meterTableModel.objDeviceConsumption, meterTableModel.objTableProps, function (err, response) {
                        if (err)
                            innercallback(err, null);
                        else
                            innercallback();
                    });
                } else {
                    innercallback(null, null);
                }
            },
            insertDeltalinkDetails: function (innercallback) {
                if (deltalinkDataConsumption.length) {
                    var table3 = 'deltalink_dataconsumption';
                    insertMultipleRecords(deltalinkDataConsumption, table3, deltalinkTableModel.objDeviceConsumption, deltalinkTableModel.objTableProps, function (err, response) {
                        if (err)
                            innercallback(err, null)
                        else
                            innercallback();
                    });
                } else {
                    innercallback(null, null);
                }
            },
            insertDeltalinkClients: function (innercallback) {
                if (deltalinkClients.length) {
                    var table4 = 'deltalink_clients_trending';
                    insertMultipleRecords(deltalinkClients, table4, deltalinkClientsTrendingModel.objDeviceConsumption, deltalinkClientsTrendingModel.objTableProps, function (err, response) {
                        if (err)
                            innercallback(err, null)
                        else
                            innercallback();
                    });
                } else {
                    innercallback(null, null);
                }
            },
        }, function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, "Device data insertion done");
            }
        });
    } catch (e) {
        console.log(e)
    }
}

function fetchTransformerDetails(data, callback) {
    try {

        mongoDbCon.getDb(function (err, dbConn) {
            if (err) {
                callback(err, null);
            } else {

                var transformerCollection = dbConn.db.collection('DELTA_Transformer');
                var hsCollection = dbConn.db.collection('DELTA_Hypersprouts');

                hsCollection.find({ 'HypersproutID': data.CellID }).project({ 'HypersproutSerialNumber': 1, 'TransformerID': 1, 'HypersproutID': 1, 'Hypersprout_Communications.MAC_ID_WiFi': 1, 'IsHyperHub': 1 }).toArray(function (err, hs) {
                    if (err)
                        innercallback(err, null);
                    else {
                        if (hs.length) {

                            data.Hypersprout_ID = hs[0].HypersproutID;
                            data.Hypersprout_SerialNumber = hs[0].HypersproutSerialNumber;
                            data.IsHyperHub = hs[0].IsHyperHub;
                            data.MACID = hs[0].Hypersprout_Communications.MAC_ID_WiFi;

                            transformerCollection.find({ 'TransformerID': hs[0].TransformerID }).project({ 'TransformerSerialNumber': 1, 'CircuitID': 1, 'TransformerID': 1 }).toArray(function (err, transformer) {
                                if (err)
                                    innercallback(err, null);
                                else {
                                    if (transformer) {
                                        data.Transformer_ID = transformer[0].TransformerID;
                                        data.Transformer_SerialNumber = transformer[0].TransformerSerialNumber;
                                        data.Circuit_ID = transformer[0].CircuitID;
                                        callback(null, data);
                                    } else {
                                        callback("wrong cell id", null);
                                    }
                                }
                            });
                        } else {
                            callback("wrong cell id", null);
                        }
                    }
                });
            }
        });
    } catch (exc) {
        console.log(exc)
    }
}

function fetchDevicesData(consumptionData, callback) {

    try {
        mongoDbCon.getDb(function (err, dbConn) {
            if (err) {
                callback(err, null);
            } else {

                var deltalinkCollection = dbConn.db.collection('DELTA_DeltaLink');
                var meterCollection = dbConn.db.collection('DELTA_Meters');

                //get sql connection
                configPara.getConnection(function (err2, connection) {
                    if (err2) {
                        callback(err2, null);
                    } else {

                        //check Data Route 
                        if (consumptionData.DataRoute == 0) {
                            consumptionData.DataRoute = 'RJ45';
                        } else if (consumptionData.DataRoute == 1) {
                            consumptionData.DataRoute = 'Fiber';
                        } else {
                            consumptionData.DataRoute = 'Cellular';
                        }

                        consumptionData.DataType = consumptionData.DataType ? 'System' : 'User';

                        var devices = consumptionData.DeviceArr;
                        var hsDataConsumption = [];
                        var meterDataConsumption = [];
                        var deltalinkDataConsumption = [];
                        var deltalinkClients = [];
                        var clientsData;

                        //loop data recieved from device
                        async.each(devices,
                            function (device, innercallback) {
                                var deviceData = {};
                                //HYPERSPROUT = 0 HYPERHUB = 1 MESH_CARD = 2 DELTALINK = 3 USER = 0 DEVICE = 1 
                                // 0 - RJ45 1 - FIBER 2 - Cellular
                                deviceData.Actual_ReadTimestamp = consumptionData.TimeStamp;
                                deviceData.Number_of_device = consumptionData.NoOfDevice;

                                if (device.DeviceType == 0) {

                                    //Add data for transformer table
                                    deviceData.DeviceType = "Hypersprout";
                                    deviceData.Transformer_SerialNumber = consumptionData.Transformer_SerialNumber;
                                    deviceData.Transformer_ID = consumptionData.Transformer_ID;
                                    deviceData.Hypersprout_ID = consumptionData.Hypersprout_ID;
                                    deviceData.Hypersprout_SerialNumber = consumptionData.Hypersprout_SerialNumber;
                                    deviceData.IsHyperHub = consumptionData.IsHyperHub;
                                    deviceData.Circuit_ID = consumptionData.Circuit_ID;
                                    deviceData.DataType = consumptionData.DataType;
                                    deviceData.DataRoute = consumptionData.DataRoute;
                                    deviceData.DataUpload = device.DataUpload;
                                    deviceData.DataDownload = device.DataDownload;
                                    deviceData.Total = device.Total;
                                    deviceData.NetworkLatency = device.NetworkLatency;
                                    deviceData.device_mac_id = device.MACID ? device.MACID : consumptionData.MACID;

                                    calculateHsDataPerPacket(deviceData, connection, function (err, latestDataUpload, latestDataDownload, latestDataTotal) {

                                        if (err) {
                                            innercallback(err, null);
                                        } else {
                                            deviceData.DataUploadDiff = latestDataUpload;
                                            deviceData.DataDownloadDiff = latestDataDownload;
                                            deviceData.TotalDiff = latestDataTotal;

                                            //Add data for common table
                                            consumptionData.Transformer_NetworkLatency = device.NetworkLatency;

                                            hsDataConsumption.push(deviceData);
                                            innercallback();
                                        }
                                    });
                                } else if (device.DeviceType == 1) {

                                    //Add data for transformer table
                                    deviceData.DeviceType = "Hyperhub";
                                    deviceData.Transformer_SerialNumber = consumptionData.Transformer_SerialNumber;
                                    deviceData.Transformer_ID = consumptionData.Transformer_ID;
                                    deviceData.Hypersprout_ID = consumptionData.Hypersprout_ID;
                                    deviceData.IsHyperHub = consumptionData.IsHyperHub;
                                    deviceData.Hypersprout_SerialNumber = consumptionData.Hypersprout_SerialNumber;
                                    deviceData.Circuit_ID = consumptionData.Circuit_ID;
                                    deviceData.DataRoute = consumptionData.DataRoute;
                                    deviceData.DataType = consumptionData.DataType;
                                    deviceData.DataUpload = device.DataUpload;
                                    deviceData.DataDownload = device.DataDownload;
                                    deviceData.Total = device.Total;
                                    deviceData.NetworkLatency = device.NetworkLatency;
                                    deviceData.device_mac_id = device.MACID ? device.MACID : consumptionData.MACID;

                                    calculateHsDataPerPacket(deviceData, connection, function (err, latestDataUpload, latestDataDownload, latestDataTotal) {

                                        if (err) {
                                            innercallback(err, null);
                                        } else {
                                            deviceData.DataUploadDiff = latestDataUpload;
                                            deviceData.DataDownloadDiff = latestDataDownload;
                                            deviceData.DataDownloadTotal = latestDataTotal;

                                            //Add data for common table
                                            consumptionData.Transformer_NetworkLatency = device.NetworkLatency;

                                            hsDataConsumption.push(deviceData);
                                            innercallback();
                                        }
                                    });

                                } else if (device.DeviceType == 2) {

                                    let where;

                                    if (consumptionData.DataType == 'System') {
                                        where = { 'MeterID': device.DeviceId };
                                    }
                                    else {
                                        where = { 'Meters_Communications.MAC_ID_WiFi': device.MACID };
                                    }
                                    meterCollection.find(where).project({ 'MeterID': 1, 'Meters_Communications.MAC_ID_WiFi': 1, 'MeterSerialNumber': 1 }).toArray(function (err, meters) {
                                        if (err)
                                            innercallback(err, null);
                                        else {
                                            deviceData.DeviceType = "Meter";
                                            deviceData.Transformer_SerialNumber = consumptionData.Transformer_SerialNumber;
                                            deviceData.Transformer_ID = consumptionData.Transformer_ID;
                                            deviceData.Hypersprout_ID = consumptionData.Hypersprout_ID;
                                            deviceData.Hypersprout_SerialNumber = consumptionData.Hypersprout_SerialNumber;
                                            deviceData.Circuit_ID = consumptionData.Circuit_ID;
                                            deviceData.DataRoute = "Mesh Interface";
                                            deviceData.DataType = consumptionData.DataType;
                                            deviceData.DataUpload = device.DataUpload;
                                            deviceData.DataDownload = device.DataDownload;
                                            deviceData.Total = device.Total;
                                            deviceData.NetworkLatency = device.NetworkLatency;
                                            deviceData.device_mac_id = device.MACID ? device.MACID : meters[0].Meters_Communications.MAC_ID_WiFi;
                                            deviceData.Meter_SerialNumber = meters[0].MeterSerialNumber ? meters[0].MeterSerialNumber : null;
                                            deviceData.Meter_ID = meters[0].MeterID ? meters[0].MeterID : null;

                                            if (meters.length) {
                                                deviceData.device_mac_id = meters[0].Meters_Communications.MAC_ID_WiFi;
                                                device.Meter_SerialNumber = meters[0].MeterSerialNumber;
                                                device.Meter_ID = meters[0].MeterID;
                                            }

                                            calculateMeterDataPerPacket(deviceData, connection, function (err, latestMeterDataUpload, latestMeterDataDownload, latestMeterTotal) {
                                                if (err) {
                                                    innercallback(err, null);
                                                } else {

                                                    deviceData.DataUploadDiff = latestMeterDataUpload;
                                                    deviceData.DataDownloadDiff = latestMeterDataDownload;
                                                    deviceData.TotalDiff = latestMeterTotal;

                                                    meterDataConsumption.push(deviceData);
                                                    innercallback();
                                                }
                                            });
                                        }
                                    });

                                } else if (device.DeviceType == 3) {
                                    let where;

                                    if (consumptionData.DataType == 'System') { //if System
                                        where = { 'DeltalinkID': device.DeviceId };
                                    }
                                    else {   // if USer
                                        where = { 'DeltaLinks_Communications.MAC_ID_WiFi': device.MACID };
                                    }

                                    deltalinkCollection.find(where).project({ 'MeterID': 1, 'DeltaLinks_Communications.MAC_ID_WiFi': 1, 'DeltalinkSerialNumber': 1, 'DeltalinkID': 1 }).toArray(function (err, deltalinks) {
                                        if (err)
                                            innercallback(err, null);
                                        else {
                                            deviceData.DeviceType = "Deltalink";
                                            deviceData.Transformer_SerialNumber = consumptionData.Transformer_SerialNumber;
                                            deviceData.Transformer_ID = consumptionData.Transformer_ID;
                                            deviceData.Hypersprout_ID = consumptionData.Hypersprout_ID;
                                            deviceData.Hypersprout_SerialNumber = consumptionData.Hypersprout_SerialNumber;
                                            deviceData.Circuit_ID = consumptionData.Circuit_ID;
                                            deviceData.DataRoute = "Mesh Interface";
                                            deviceData.DataType = consumptionData.DataType;
                                            deviceData.DataUpload = device.DataUpload;
                                            deviceData.DataDownload = device.DataDownload;
                                            deviceData.Total = device.Total;
                                            deviceData.NetworkLatency = device.NetworkLatency;
                                            deviceData.device_mac_id = device.MACID ? device.MACID : deltalinks[0].DeltaLinks_Communications.MAC_ID_WiFi;
                                            deviceData.Deltalink_SerialNumber = deltalinks[0].DeltalinkSerialNumber ? deltalinks[0].DeltalinkSerialNumber : null;
                                            deviceData.Deltalink_ID = deltalinks[0].DeltalinkID ? deltalinks[0].DeltalinkID : null;

                                            calculateDlDataPerPacket(deviceData, connection, function (err, latestDlDataUpload, latestDlDataDownload, latestDlTotal) {

                                                if (err) {
                                                    innercallback(err, null);
                                                } else {

                                                    deviceData.DataUploadDiff = latestDlDataUpload;
                                                    deviceData.DataDownloadDiff = latestDlDataDownload;
                                                    deviceData.TotalDiff = latestDlTotal;

                                                    deltalinkDataConsumption.push(deviceData);

                                                    if (deltalinks.length) {
                                                        device.Deltalink_SerialNumber = deltalinks[0].DeltalinkSerialNumber;
                                                        device.Deltalink_ID = deltalinks[0].DeltalinkID;
                                                    }
                                                    if (device.NoOfClients) {
                                                        for (var client = 0; client < device.ClientsArr.length; client++) {
                                                            let clientsData = {};
                                                            var ClientCount = 0
                                                            if (deltalinks.length) {
                                                                clientsData.Deltalink_ID = deltalinks[0].DeltalinkID;
                                                                clientsData.Deltalink_SerialNumber = deltalinks[0].DeltalinkSerialNumber;
                                                            }
                                                            clientsData.DataType = consumptionData.DataType;
                                                            clientsData.DeviceType = "Deltalink Client";
                                                            clientsData.Deltalink_Mac_Id = device.MACID;
                                                            clientsData.Actual_ReadTimestamp = consumptionData.TimeStamp;
                                                            clientsData.User_Mac_Id = device.ClientsArr[client].UserMacId;
                                                            clientsData.User_Hostname = device.ClientsArr[client].HostName.replace(/\0/g, '');
                                                            clientsData.User_DataUpload = device.ClientsArr[client].UserDataUpload;
                                                            clientsData.User_DataDownload = device.ClientsArr[client].UserDataDownload;
                                                            clientsData.User_Total = device.ClientsArr[client].UserTotal;
                                                            calculateDlClientDataPerPacket(clientsData, connection, function (err, latestDlDataUpload, latestDlDataDownload, latestDlTotal) {

                                                                if (err) {
                                                                    innercallback(err, null);
                                                                } else {
                                                                    clientsData.User_DataUploadDiff = latestDlDataUpload;
                                                                    clientsData.User_DataDownloadDiff = latestDlDataDownload;
                                                                    clientsData.User_TotalDiff = latestDlTotal;
                                                                    deltalinkClients.push(clientsData);
                                                                    if (ClientCount == device.ClientsArr.length - 1) {
                                                                        innercallback();
                                                                    }
                                                                    ClientCount++;
                                                                }
                                                            });
                                                        }
                                                    } else {
                                                        innercallback();
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }

                            }, function (err) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    console.log("hsDataConsumption", JSON.stringify(hsDataConsumption));
                                    console.log("meterDataConsumption", JSON.stringify(meterDataConsumption));
                                    console.log("deltalinkDataConsumption", JSON.stringify(deltalinkDataConsumption));
                                    console.log("deltalinkClientsConsumption", JSON.stringify(deltalinkClients));
                                    console.log("managerialData", JSON.stringify(consumptionData));
                                    callback(null, hsDataConsumption, meterDataConsumption, deltalinkDataConsumption, deltalinkClients, consumptionData);
                                }
                            });
                    }
                });
            }
        });
    } catch (exc) {
        console.log(exc)
    }
}

function getPreviousHourEndTime(currentTime1, callback) {

    //get PreviousEndTime

    let objEndDate = currentTime1;
    objEndDate.setUTCHours(objEndDate.getUTCHours() - 1);
    objEndDate.setUTCMinutes(59);
    objEndDate.setUTCSeconds(59);
    objEndDate.setUTCMilliseconds(59);
    objEndDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let datehourPreviousLast = moment.utc(objEndDate, 'DD-MM-YYYY HH:mm:ss');
    let PreviousEndTime = datehourPreviousLast.format('YYYY-MM-DD HH:mm:ss');
    callback(PreviousEndTime);

}

function getPreviousHourStartTime(currentTime2, callback) {

    //get PreviousStartTime
    let objStartDate = currentTime2;
    objStartDate.setUTCHours(objStartDate.getUTCHours() - 1);
    objStartDate.setUTCMinutes(0);
    objStartDate.setUTCSeconds(0);
    objStartDate.setUTCMilliseconds(0);
    objStartDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let datehourPrevious = moment.utc(objStartDate, 'DD-MM-YYYY HH:mm:ss');
    let PreviousStartTime = datehourPrevious.format('YYYY-MM-DD HH:mm:ss');
    callback(PreviousStartTime);
}

function getCurrentHourEndTime(currentTime3, callback) {

    //get current hour last time value
    let currentHourEnd = currentTime3;
    currentHourEnd.setUTCMinutes(59);
    currentHourEnd.setUTCSeconds(59);
    currentHourEnd.setUTCMilliseconds(59);
    currentHourEnd.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let dateCurrentlast = moment.utc(currentHourEnd, 'DD-MM-YYYY HH:mm:ss');
    let currentLastvalue = dateCurrentlast.format('YYYY-MM-DD HH:mm:ss');

    callback(currentLastvalue);
}

function getCurrentHourStartTime(currentTime4, callback) {

    let currenthourStart = currentTime4;
    currenthourStart.setUTCMinutes(0);
    currenthourStart.setUTCSeconds(0);
    currenthourStart.setUTCMilliseconds(0);
    currenthourStart.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    let dateCurrentStart = moment.utc(currenthourStart, 'DD-MM-YYYY HH:mm:ss');
    let currentStartvalue = dateCurrentStart.format('YYYY-MM-DD HH:mm:ss');
    callback(currentStartvalue);
}

function calculateHsDataPerPacket(deviceData, connection, callback) {

    var hypersproutId = deviceData.Hypersprout_ID;
    var query = "SELECT DataUpload,DataDownload,Total,Actual_ReadTimestamp FROM `transformer_dataconsumption` WHERE `Hypersprout_ID`=" + hypersproutId + " and `DataType` = '" + deviceData.DataType + "' order by `Actual_ReadTimestamp` desc limit 1;"
    calculateDataConsumedPerPacket(query, deviceData.DataUpload, deviceData.DataDownload, deviceData.Total, connection, function (err, latestDataUpload, latestDataDownload, latestDataTotal) {
        if (err)
            callback(err, null);
        else {
            callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
        }
    });
}
function calculateDLClientDataConsumedPerPacket(query, latestDataUpload, latestDataDownload, latestDataTotal, connection, callback) {
    try {
        connection.query(query, {
            // A function (or false) for logging your queries
            // Will get called for every SQL query that gets sent
            // to the server.
            logging: console.log,
            // If plain is true, then sequelize will only return the first
            // record of the result set. In case of false it will return all records.
            plain: false,
            // Set this to true if you don't have a model definition for your query.
            raw: true,
            // The type of query you are executing. The query type affects how results are formatted before they are passed back.
            type: QueryTypes.SELECT
        }).then(function (lastDeviceDetails) {
            if (Object.keys(lastDeviceDetails).length > 0) {
                console.log(lastDeviceDetails);
                latestDataUpload = ((latestDataUpload - lastDeviceDetails[0].User_DataUpload) >= 0) ? latestDataUpload - lastDeviceDetails[0].User_DataUpload : latestDataUpload;
                latestDataDownload = ((latestDataDownload - lastDeviceDetails[0].User_DataDownload) >= 0) ? latestDataDownload - lastDeviceDetails[0].User_DataDownload : latestDataDownload;
                latestDataTotal = ((latestDataTotal - lastDeviceDetails[0].User_Total) >= 0) ? latestDataTotal - lastDeviceDetails[0].User_Total : latestDataTotal;

                callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
            } else {
                callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
            }
        });
    } catch (exc) {
        callback(exc, null);
    }
}

function calculateDataConsumedPerPacket(query, latestDataUpload, latestDataDownload, latestDataTotal, connection, callback) {
    try {
        connection.query(query, {
            // A function (or false) for logging your queries
            // Will get called for every SQL query that gets sent
            // to the server.
            logging: console.log,
            // If plain is true, then sequelize will only return the first
            // record of the result set. In case of false it will return all records.
            plain: false,
            // Set this to true if you don't have a model definition for your query.
            raw: true,
            // The type of query you are executing. The query type affects how results are formatted before they are passed back.
            type: QueryTypes.SELECT
        }).then(function (lastDeviceDetails) {
            if (Object.keys(lastDeviceDetails).length > 0) {
                console.log(lastDeviceDetails);
                latestDataUpload = ((latestDataUpload - lastDeviceDetails[0].DataUpload) >= 0) ? latestDataUpload - lastDeviceDetails[0].DataUpload : latestDataUpload;
                latestDataDownload = ((latestDataDownload - lastDeviceDetails[0].DataDownload) >= 0) ? latestDataDownload - lastDeviceDetails[0].DataDownload : latestDataDownload;
                latestDataTotal = ((latestDataTotal - lastDeviceDetails[0].Total) >= 0) ? latestDataTotal - lastDeviceDetails[0].Total : latestDataTotal;

                callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
            } else {
                callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
            }
        });
    } catch (exc) {
        callback(exc, null);
    }
}

function calculateMeterDataPerPacket(device, connection, callback) {
    try {
        var latestMeterDataUpload = device.DataUpload;
        var latestMeterDataDownload = device.DataDownload;
        var latestMeterTotal = device.Total;
        var meterId = device.Meter_ID;

        var query = "SELECT DataUpload,DataDownload,Total,Actual_ReadTimestamp FROM `meter_dataconsumption` WHERE `Meter_ID`=" + meterId + " and `DataType` = '" + device.DataType + "' order by `Actual_ReadTimestamp` desc limit 1;"

        calculateDataConsumedPerPacket(query, latestMeterDataUpload, latestMeterDataDownload, latestMeterTotal, connection, function (err, latestMeterDataUpload, latestMeterDataDownload, latestMeterTotal) {
            if (err)
                callback(err, null);
            else {
                callback(null, latestMeterDataUpload, latestMeterDataDownload, latestMeterTotal);
            }
        });

    } catch (exp) {
        callback(exp, null);
    }
}

function calculateDlDataPerPacket(device, connection, callback) {
    try {
        var latestDlDataUpload = device.DataUpload;
        var latestDlDataDownload = device.DataDownload;
        var latestDlTotal = device.Total;
        var deltalinkId = device.Deltalink_ID;

        var query = "SELECT DataUpload,DataDownload,Total,Actual_ReadTimestamp FROM `deltalink_dataconsumption` WHERE `Deltalink_ID`= " + deltalinkId + " and `DataType` = '" + device.DataType + "' order by `Actual_ReadTimestamp` desc limit 1;"
        calculateDataConsumedPerPacket(query, latestDlDataUpload, latestDlDataDownload, latestDlTotal, connection, function (err, latestDlDataUpload, latestDlDataDownload, latestDlTotal) {
            if (err)
                callback(err, null, null, null);
            else {
                callback(null, latestDlDataUpload, latestDlDataDownload, latestDlTotal);
            }

        });

    } catch (exp) {
        callback(exp, null);
    }
}


function calculateDlClientDataPerPacket(client, connection, callback) {
    try {
        var latestDlDataUpload = client.User_DataUpload;
        var latestDlDataDownload = client.User_DataDownload;
        var latestDlTotal = client.User_Total;
        var deltalinkId = client.Deltalink_ID;

        var query = "SELECT User_DataUpload,User_DataDownload,User_Total,Actual_ReadTimestamp FROM `deltalink_clients_trending` WHERE `Deltalink_ID`= " + deltalinkId + " and `DataType` = '" + client.DataType + "' and `User_Mac_Id` = '" + client.User_Mac_Id + "' order by `Actual_ReadTimestamp` desc limit 1;"
        calculateDLClientDataConsumedPerPacket(query, latestDlDataUpload, latestDlDataDownload, latestDlTotal, connection, function (err, latestDlDataUpload, latestDlDataDownload, latestDlTotal) {
            if (err)
                callback(err, null, null, null);
            else {
                callback(null, latestDlDataUpload, latestDlDataDownload, latestDlTotal);
            }

        });

    } catch (exp) {
        callback(exp, null);
    }
}

function calculateHourlyData(managerial, callback) {
    try {
        let startReadtimestamp = new Date(managerial.TimeStamp);
        getCurrentHourStartTime(startReadtimestamp, function (currentStartvalue) {
            getCurrentHourEndTime(startReadtimestamp, function (currentLastvalue) {
                getPreviousHourStartTime(startReadtimestamp, function (PreviousStartTime) {
                    let endReadtimestamp = new Date(managerial.TimeStamp);
                    getPreviousHourEndTime(endReadtimestamp, function (PreviousEndTime) {
                        configPara.getConnection(function (err2, connection) {
                            if (err2) {
                                callback(err2, null);
                            } else {
                                let devices = managerial.DeviceArr;
                                let DataType = managerial.DataType;
                                calculateHsHourlyDataSum(devices, managerial, currentStartvalue, currentLastvalue, connection, function (err, managerial) {
                                    let flag = 1; //check if meters or deltalink data is present
                                    async.each(devices, function (device, innercallback1) {
                                        if (device.DeviceType == 2) {
                                            flag = 0;
                                            calculateMeterHourlyDataSum(device, managerial, currentStartvalue, currentLastvalue, connection, function (err, data) {
                                                if (err) {
                                                    innercallback1(err, null);
                                                } else {
                                                    innercallback1();
                                                }
                                            });
                                        } else if (device.DeviceType == 3) {
                                            flag = 0;
                                            calculateDlHourlyDataSum(device, managerial, currentStartvalue, currentLastvalue, connection, function (err, data) {
                                                if (err) {
                                                    innercallback1(err, null);
                                                } else {
                                                    calculateClientsHourlyData(device, DataType, currentStartvalue, currentLastvalue, PreviousStartTime, PreviousEndTime, connection, function (err, data) {
                                                        innercallback1();
                                                    });

                                                }

                                            });
                                        } else {
                                            innercallback1();
                                        }
                                    }, function (err) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (flag) {
                                                var hsObj = {};
                                                hsObj.Circuit_ID = managerial.Circuit_ID;
                                                hsObj.Transformer_ID = managerial.Transformer_ID;
                                                hsObj.Transformer_SerialNumber = managerial.Transformer_SerialNumber;
                                                hsObj.Hypersprout_ID = managerial.Hypersprout_ID;
                                                hsObj.Hypersprout_SerialNumber = managerial.Hypersprout_SerialNumber;
                                                hsObj.Meter_SerialNumber = 0;
                                                hsObj.Deltalink_SerialNumber = 0;
                                                hsObj.ReadTimestamp = currentStartvalue;
                                                hsObj.Transformer_DataUpload = managerial.Transformer_DataUpload;
                                                hsObj.Transformer_DataDownload = managerial.Transformer_DataDownload;
                                                hsObj.Transformer_Total = managerial.Transformer_Total;
                                                hsObj.Transformer_NetworkLatency = managerial.Transformer_NetworkLatency;
                                                hsObj.DataType = managerial.DataType;
                                                hsObj.IsHyperHub = managerial.IsHyperHub;
                                                hsObj.Transformer_DataRoute = managerial.DataRoute;
                                                hsObj.Meter_DataRoute = 0;
                                                hsObj.DeltaLink_DataRoute = 0;

                                                UpsertInToMySQL(hsObj, 'device_dataconsumption', deviceTableModel.objDeviceConsumption, deviceTableModel.objTableProps, function (err, result) {
                                                    if (err)
                                                        callback(err, null);
                                                    else
                                                        callback();
                                                });
                                            } else {
                                                callback();
                                            }
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            });
        });
    } catch (exp) {
        callback(exp, null);
    }
}

function calculateClientsHourlyData(device, DataType, currentStartvalue, currentLastvalue, PreviousStartTime, PreviousEndTime, connection, callback) {

    try {

        if (device.NoOfClients) {

            let clientsArr = device.ClientsArr;
            let latestUserDataUpload;
            let latestUserDownload;
            let latestUserTotal;
            let deltalinkId = device.Deltalink_ID;
            let deltalinkSerialNo = device.Deltalink_SerialNumber;
            let dataType = DataType;
            let macId = device.MACID;
            let clientObj;

            async.each(clientsArr, function (client, innercallback) {

                latestUserDataUpload = client.UserDataUpload;
                latestUserDownload = client.UserDataDownload;
                latestUserTotal = client.UserTotal;
                var query = "select sum(User_DataUploadDiff) as DataUploadSum , sum(User_DataDownloadDiff) as DataDownloadSum, sum(User_TotalDiff) as TotalSum, Actual_ReadTimestamp from deltalink_clients_trending where Actual_ReadTimestamp BETWEEN '" + currentStartvalue + "' AND '" + currentLastvalue + "' AND DataType = '" + DataType + "' AND User_Mac_Id='" + client.UserMacId + "' AND Deltalink_ID = '" + deltalinkId + "'";
                //var query1 = "SELECT User_DataUpload,User_DataDownload,User_Total,Actual_ReadTimestamp FROM `deltalink_clients_trending` WHERE `Deltalink_ID`='" + deltalinkId + "' and `User_Mac_Id` ='" + client.UserMacId + "' and `Actual_ReadTimestamp` BETWEEN '" + PreviousStartTime + "' AND '" + PreviousEndTime + "'  order by `Actual_ReadTimestamp` desc limit 1;"
                // var query2 = "SELECT User_DataUpload,User_DataDownload,User_Total,Actual_ReadTimestamp FROM `deltalink_clients_trending` WHERE `Deltalink_ID`='" + deltalinkId + "' and `User_Mac_Id` ='" + client.UserMacId + "' and `Actual_ReadTimestamp` BETWEEN '" + currentStartvalue + "' AND '" + currentLastvalue + "'  order by `Actual_ReadTimestamp` asc limit 1;"
                //var HostnameQuery = "SELECT distinct(User_Hostname) FROM deltamart.deltalink_clients_trending where User_Mac_Id='" + client.UserMacId + "' and Deltalink_ID='" + deltalinkId + "' and User_Hostname!='*'";
                var HostnameQuery = "SELECT distinct(User_Hostname) FROM deltamart.deltalink_clients_trending where User_Mac_Id='" + client.UserMacId + "' and Deltalink_ID='" + deltalinkId + "' and User_Hostname NOT IN ('*','')";
                calculateHourlSum(query, connection, function (err, latestUserDataUpload, latestUserDownload, latestUserTotal) {
                    //calculateHourlVal(query1, query2, latestUserDataUpload, latestUserDownload, latestUserTotal, connection, function (err, latestUserDataUpload, latestUserDownload, latestUserTotal) {
                    if (err)
                        callback(err, null, null, null);
                    else {
                        getHostname(HostnameQuery, connection, function (err, clientHostname) {
                            if (err)
                                callback(err, null, null, null);
                            else {
                                clientObj = {};
                                clientObj.Deltalink_ID = deltalinkId;
                                clientObj.Deltalink_SerialNumber = deltalinkSerialNo;
                                clientObj.DataType = dataType;
                                clientObj.DeviceType = "Deltalink Client";
                                clientObj.Deltalink_Mac_Id = macId;
                                clientObj.ReadTimestamp = currentStartvalue;
                                clientObj.User_Mac_Id = client.UserMacId;
                                clientObj.User_Hostname = clientHostname.replace(/\0/g, '')?clientHostname.replace(/\0/g, ''):'';
                                clientObj.User_DataUpload = latestUserDataUpload;
                                clientObj.User_DataDownload = latestUserDownload;
                                clientObj.User_Total = latestUserTotal;
                                UpsertInToMySQL(clientObj, 'deltalink_clients_hourly', deltalinkClientsHourlyModel.objDeviceConsumption, deltalinkClientsHourlyModel.objTableProps, function (err, result) {
                                    if (err)
                                        innercallback(err, null);
                                    else {
                                        innercallback();
                                    }
                                });
                            }
                        });
                    }
                });

            }, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback();
                }
            });
        }

    } catch (exp) {
        callback(exp, null);
    }
}

function calculateHsHourlyDataSum(devices, managerial, currentStartvalue, currentLastvalue, connection, callback) {
    var hypersproutId = managerial.Hypersprout_ID;
    var DataType = managerial.DataType;

    async.each(devices, function (device, innercallback) {
        if (device.DeviceType == 0 || device.DeviceType == 1) {
            var query = "select device_mac_id , DataType, DataRoute , sum(DataUploadDiff) as DataUploadSum , sum(DataDownloadDiff) as DataDownloadSum, sum(TotalDiff) as TotalSum, Actual_ReadTimestamp from transformer_dataconsumption where Actual_ReadTimestamp BETWEEN'" + currentStartvalue + "' AND '" + currentLastvalue + "' AND DataType = '" + DataType + "' AND DataRoute = '" + managerial.DataRoute + "' AND Hypersprout_ID = '" + hypersproutId + "'";
            calculateHourlSum(query, connection, function (err, latestDataUpload, latestDataDownload, latestDataTotal) {
                if (err)
                    innercallback(err, null);
                else {

                    managerial.Transformer_DataUpload = latestDataUpload;
                    managerial.Transformer_DataDownload = latestDataDownload;
                    managerial.Transformer_Total = latestDataTotal;
                    innercallback();
                }
            });
        } else {
            innercallback();
        }
    }, function (err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, managerial);
        }
    });
}

function calculateMeterHourlyDataSum(device, managerial, currentStartvalue, currentLastvalue, connection, callback) {
    try {

        var meterId = device.Meter_ID;
        var DataType = managerial.DataType;
        var query = "select device_mac_id , DataType, DataRoute , sum(DataUploadDiff) as DataUploadSum , sum(DataDownloadDiff) as DataDownloadSum, sum(TotalDiff) as TotalSum, Actual_ReadTimestamp from meter_dataconsumption where Actual_ReadTimestamp BETWEEN'" + currentStartvalue + "' AND '" + currentLastvalue + "' AND DataType = '" + DataType + "' AND DataRoute = 'Mesh Interface' AND Meter_ID = '" + meterId + "'";

        calculateHourlSum(query, connection, function (err, latestMeterDataUpload, latestMeterDataDownload, latestMeterTotal) {
            if (err)
                callback(err, null);
            else {
                var meterObj = {};
                meterObj.Circuit_ID = managerial.Circuit_ID;
                meterObj.Transformer_ID = managerial.Transformer_ID;
                meterObj.Transformer_SerialNumber = managerial.Transformer_SerialNumber;
                meterObj.Hypersprout_ID = managerial.Hypersprout_ID;
                meterObj.Hypersprout_SerialNumber = managerial.Hypersprout_SerialNumber;
                meterObj.Meter_ID = device.Meter_ID;
                meterObj.Meter_SerialNumber = device.Meter_SerialNumber;
                meterObj.Deltalink_SerialNumber = 0;
                meterObj.Meter_DataUpload = latestMeterDataUpload;
                meterObj.Meter_DataDownload = latestMeterDataDownload;
                meterObj.Meter_Total = latestMeterTotal;
                meterObj.Meter_NetworkLatency = device.NetworkLatency;
                meterObj.DataType = DataType;
                meterObj.ReadTimestamp = currentStartvalue;
                meterObj.Transformer_DataUpload = managerial.Transformer_DataUpload;
                meterObj.Transformer_DataDownload = managerial.Transformer_DataDownload;
                meterObj.Transformer_Total = managerial.Transformer_Total;
                meterObj.Transformer_NetworkLatency = managerial.Transformer_NetworkLatency;
                meterObj.IsHyperHub = managerial.IsHyperHub;
                meterObj.Transformer_DataRoute = managerial.DataRoute;
                meterObj.Meter_DataRoute = "Mesh_Interface";
                meterObj.DeltaLink_DataRoute = 0;
                UpsertInToMySQL(meterObj, 'device_dataconsumption', deviceTableModel.objDeviceConsumption, deviceTableModel.objTableProps, function (err, result) {
                    if (err)
                        callback(err, null);
                    else
                        callback();
                });
            }

        });

    } catch (exp) {
        callback(exp, null);
    }
}

function calculateDlHourlyDataSum(device, managerial, currentStartvalue, currentLastvalue, connection, callback) {
    try {

        var deltalinkId = device.Deltalink_ID;

        var DataType = managerial.DataType;
        var query = "select device_mac_id , DataType, DataRoute , sum(DataUploadDiff) as DataUploadSum , sum(DataDownloadDiff) as DataDownloadSum, sum(TotalDiff) as TotalSum, Actual_ReadTimestamp from deltalink_dataconsumption where Actual_ReadTimestamp BETWEEN'" + currentStartvalue + "' AND '" + currentLastvalue + "' AND DataType = '" + DataType + "' AND DataRoute = 'Mesh Interface' AND Deltalink_ID = '" + deltalinkId + "'";

        calculateHourlSum(query, connection, function (err, latestDlDataUpload, latestDlDataDownload, latestDlTotal) {
            if (err)
                callback(err, null, null, null);
            else {

                var dlObj = {};
                dlObj.Circuit_ID = managerial.Circuit_ID;
                dlObj.Transformer_ID = managerial.Transformer_ID;
                dlObj.Transformer_SerialNumber = managerial.Transformer_SerialNumber;
                dlObj.Hypersprout_ID = managerial.Hypersprout_ID;
                dlObj.Hypersprout_SerialNumber = managerial.Hypersprout_SerialNumber;
                dlObj.Meter_SerialNumber = 0;
                dlObj.Deltalink_ID = device.Deltalink_ID;
                dlObj.Deltalink_SerialNumber = device.Deltalink_SerialNumber;
                dlObj.DeltaLink_DataUpload = latestDlDataUpload;
                dlObj.DeltaLink_DataDownload = latestDlDataDownload;
                dlObj.DeltaLink_Total = latestDlTotal;
                dlObj.DeltaLink_NetworkLatency = device.NetworkLatency;
                dlObj.ReadTimestamp = currentStartvalue;
                dlObj.Transformer_DataUpload = managerial.Transformer_DataUpload;
                dlObj.Transformer_DataDownload = managerial.Transformer_DataDownload;
                dlObj.Transformer_Total = managerial.Transformer_Total;
                dlObj.Transformer_NetworkLatency = managerial.Transformer_NetworkLatency;
                dlObj.DataType = DataType;
                dlObj.IsHyperHub = managerial.IsHyperHub;
                dlObj.Transformer_DataRoute = managerial.DataRoute;
                dlObj.DeltaLink_DataRoute = "Mesh_Interface";
                dlObj.Meter_DataRoute = 0;

                UpsertInToMySQL(dlObj, 'device_dataconsumption', deviceTableModel.objDeviceConsumption, deviceTableModel.objTableProps, function (err, result) {
                    if (err)
                        callback(err, null);
                    else
                        callback();
                });
            }

        });

    } catch (exp) {
        callback(exp, null);
    }
}

function calculateHourlSum(query, connection, callback) {

    try {
        connection.query(query, {
            // A function (or false) for logging your queries
            // Will get called for every SQL query that gets sent
            // to the server.
            logging: console.log,
            // If plain is true, then sequelize will only return the first
            // record of the result set. In case of false it will return all records.
            plain: false,
            // Set this to true if you don't have a model definition for your query.
            raw: true,
            // The type of query you are executing. The query type affects how results are formatted before they are passed back.
            type: QueryTypes.SELECT
        }).then(function (currenthourSum) {

            latestDataUpload = currenthourSum[0].DataUploadSum;
            latestDataDownload = currenthourSum[0].DataDownloadSum;
            latestDataTotal = currenthourSum[0].TotalSum;
            callback(null, latestDataUpload, latestDataDownload, latestDataTotal);

        });
    } catch (exc) {
        callback(exc, null);
    }

}

function getHostname(query, connection, callback) {

    try {
        connection.query(query, {
            // A function (or false) for logging your queries
            // Will get called for every SQL query that gets sent
            // to the server.
            logging: console.log,
            // If plain is true, then sequelize will only return the first
            // record of the result set. In case of false it will return all records.
            plain: false,
            // Set this to true if you don't have a model definition for your query.
            raw: true,
            // The type of query you are executing. The query type affects how results are formatted before they are passed back.
            type: QueryTypes.SELECT
        }).then(function (Hostname) {
            var clientHostname = '';
            if (Hostname[0])
                clientHostname = Hostname[0].User_Hostname;
            callback(null, clientHostname);

        });
    } catch (exc) {
        callback(exc, null);
    }

}
function calculateHourlVal(query1, query2, latestDataUpload, latestDataDownload, latestDataTotal, connection, callback) {
    try {
        connection.query(query1, {
            // A function (or false) for logging your queries
            // Will get called for every SQL query that gets sent
            // to the server.
            logging: console.log,
            // If plain is true, then sequelize will only return the first
            // record of the result set. In case of false it will return all records.
            plain: false,
            // Set this to true if you don't have a model definition for your query.
            raw: true,
            // The type of query you are executing. The query type affects how results are formatted before they are passed back.
            type: QueryTypes.SELECT
        }).then(function (lastDeviceDetails) {
            if (Object.keys(lastDeviceDetails).length > 0) {
                console.log(lastDeviceDetails)

                latestDataUpload = ((latestDataUpload - lastDeviceDetails[0].User_DataUpload) >= 0) ? latestDataUpload - lastDeviceDetails[0].User_DataUpload : latestDataUpload;
                latestDataDownload = ((latestDataDownload - lastDeviceDetails[0].User_DataDownload) >= 0) ? latestDataDownload - lastDeviceDetails[0].User_DataDownload : latestDataDownload;
                latestDataTotal = ((latestDataTotal - lastDeviceDetails[0].User_Total) >= 0) ? latestDataTotal - lastDeviceDetails[0].User_Total : latestDataTotal;

                callback(null, latestDataUpload, latestDataDownload, latestDataTotal);
            } else {
                connection.query(query2, {
                    // A function (or false) for logging your queries
                    // Will get called for every SQL query that gets sent
                    // to the server.
                    logging: console.log,
                    // If plain is true, then sequelize will only return the first
                    // record of the result set. In case of false it will return all records.
                    plain: false,
                    // Set this to true if you don't have a model definition for your query.
                    raw: true,
                    type: QueryTypes.SELECT
                }).then(function (currentDeviceDetails) {
                    if (Object.keys(currentDeviceDetails).length > 0) {

                        latestDataUpload = ((latestDataUpload - currentDeviceDetails[0].User_DataUpload) >= 0) ? latestDataUpload - currentDeviceDetails[0].User_DataUpload : latestDataUpload;
                        latestDataDownload = ((latestDataDownload - currentDeviceDetails[0].User_DataDownload) >= 0) ? latestDataDownload - currentDeviceDetails[0].User_DataDownload : latestDataDownload;
                        latestDataTotal = ((latestDataTotal - currentDeviceDetails[0].User_Total) >= 0) ? latestDataTotal - currentDeviceDetails[0].User_Total : latestDataTotal;

                        callback(null, latestDataUpload, latestDataDownload, latestDataTotal);

                    } else {
                        callback(null, latestDataUpload, latestDataDownload, latestDataTotal);

                    }
                });
            }
        });
    } catch (exc) {
        callback(exc, null);
    }
}

module.exports = {
    insertDataConsumptionValue: insertDataConsumptionValue
}
