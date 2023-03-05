var express = require('express');
var router = express.Router();
var parser = require('../CEparser/parser');
var dbInsert = require('../db/dbInsert');
var postManagerial = require('./postManagerial');
var protocolValidation = require('./protocolValidation.js');
var configPara = require('../config/config.js');
var logger = require('../config/logger.js');
var insertDataConsumption = require('../db/dataConsumption.js');

/**
* @description - Check for CRC correction and parse the data and hit the equivalent web service.
*
* @param data - Message from IOT
*
* @return output of the webservices hit
*/
function decsionMaker(data, callback) {
    // CRC check
    protocolValidation.crcCheck(data, function (err) {
        if (err) {
            console.log('This is the error')
            callback(err);
            dbInsert.insert_db(
                {
                    RawData: data,
                    Type: "CRC",
                    DBTimestamp: new Date()
                }, configPara.invalidPacket, function (err) {
                    if (err) {
                        callback(err);
                    }
                });
        } else {
            // To check ProtocolSchema exists or Not
            protocolValidation.revCheck(data, function (err, jsonObj) {
                if (err) {
                    console.log('rev check eror')
                    callback(err);
                } else {
                    parser.getActionName(jsonObj, data, function (err, res) {
                        if (err) {
                            callback(err);
                        } else {
                            console.log('This is the responce in decison')
                            console.log(res);
                            switch (res) {
                                
                                case 'COLLECTOR_REGISTERATION':
                                case 'METER_REGISTERATION':
                                case 'ACTION_FOR_DEVICE':
                                case 'DELTALINK_REGISTER':
                                    parser.convertJson_MagerialData(jsonObj, data,
                                        function (err, result) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                if(result.Action === 'COLLECTOR_REGISTERATION'||result.Action === 'METER_REGISTERATION'){
                                                    if(result.Data[0].SERIAL_NO)
                                                    {
                                                      result.Data[0].SERIAL_NO = result.Data[0].SERIAL_NO.replace(/\0/g, '');
                                                    }
                                                    if(result.Data[0].ESN){
                                                        result.Data[0].ESN = result.Data[0].ESN.replace(/\0/g,'');  
                                                    }
                                                }
                                                if (result.Attribute === 'REGISTRATION_PARA' &&
                                                    result.Action === 'COLLECTOR_REGISTERATION') {
                                                    dbInsert.getID_db(configPara.Hypersprouts,
                                                        { "HypersproutSerialNumber": result.Data[0].SERIAL_NO },
                                                        function (err, hsID) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                if (hsID.length !== 0) {
                                                                    dbInsert.insert_db({
                                                                        "Rev": result.Rev,
                                                                        "CellID": hsID[0].HypersproutID,
                                                                        "MeterID": result.MeterID,
                                                                        "MessageID": result.MessageID,
                                                                        "Action": result.Action,
                                                                        "Attribute": result.Attribute,
                                                                        DBTimestamp: parser.getUTC()
                                                                    },
                                                                        configPara.eventLogs, function (err) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            }
                                                                        });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": result.Data[0].SERIAL_NO,
                                                                            "JobName": "Firmware Job",
                                                                            "JobType": "Collector Firmware Job",
                                                                            "Status": { $nin: ["Completed", "Failed","Upgrade Failed","Upgrade not Required" ]}
                                                                        },
                                                                        function (err, firmJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (firmJob.length > 0) {
                                                                                    if (firmJob[0].CardType === "iTM") {
                                                                                        if (firmJob[0].FirmwareID !== result.Data[0].iTMFirmwareVersion) {
                                                                                            result.Data[0]["Status"] = "Completed";
                                                                                        } else {
                                                                                            result.Data[0]["Status"] = "Failed";
                                                                                        }
                                                                                        result.Data[0]["Version"] = result.Data[0].iTMFirmwareVersion;
                                                                                        result.Data[0]["CardType"] = "iTM";
                                                                                    } else {
                                                                                        if (firmJob[0].FirmwareID !== result.Data[0].iNCFirmwareVersion) {
                                                                                            result.Data[0]["Status"] = "Completed";
                                                                                        } else {
                                                                                            result.Data[0]["Status"] = "Failed";
                                                                                        }
                                                                                        result.Data[0]["Version"] = result.Data[0].iNCFirmwareVersion;
                                                                                        result.Data[0]["CardType"] = "iNC";
                                                                                    }
                                                                                    postManagerial.postManagerialData(result, configPara.firmwareMngmt, function (err, resWeb) {
                                                                                        callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": result.Data[0].SERIAL_NO,
                                                                            "JobName": "Reboot Job",
                                                                            "JobType": "Collector Reboot Job",
                                                                            "Status": "Reboot Initiated"
                                                                        },
                                                                        function (err, rebootJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (rebootJob.length > 0) {
                                                                                    reboot = {};
                                                                                    reboot["DeviceType"] = "hs";
                                                                                    reboot["Status"] = "Completed";
                                                                                    reboot["Action"] = "REBOOT";
                                                                                    reboot["Attribute"] = "HS_REBOOT";
                                                                                    reboot["SERIAL_NO"] = result.Data[0].SERIAL_NO;
                                                                                    reboot["Rev"] = result.Rev;
                                                                                    reboot["CellID"] = hsID[0].HypersproutID;
                                                                                    reboot["MeterID"] = result.MeterID;
                                                                                    reboot["MessageID"] = result.MessageID;
                                                                                    postManagerial.postManagerialData(reboot, configPara.rebootMngmt, function (err, resWeb) {
                                                                                        callback(null, 'System management reboot Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });


                                                                } else {
                                                                    dbInsert.insert_db({
                                                                        "Rev": result.Rev,
                                                                        "CellID": result.CellID,
                                                                        "MeterID": result.MeterID,
                                                                        "MessageID": result.MessageID,
                                                                        "Action": result.Action,
                                                                        "Attribute": result.Attribute,
                                                                        "SerialNumber": result.Data[0].SERIAL_NO,
                                                                        DBTimestamp: parser.getUTC()
                                                                    },
                                                                        configPara.eventLogs, function (err) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            }
                                                                        });
                                                                }
                                                            }
                                                        });
                                                } else if (result.Attribute === 'GET_DEVICE_CONFIG' &&
                                                    (result.Action === 'COLLECTOR_REGISTERATION' ||result.Action === 'METER_REGISTERATION') ) {
                                                        console.log("in get from device config")
                                                    dbInsert.updateConfig(configPara.UpdateConfig, result,
                                                        function (err, getconfig) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                        });
                                                } else if (result.Attribute === 'REGISTRATION_PARA' &&
                                                    result.Action === 'METER_REGISTERATION') {
                                                    dbInsert.getID_db(configPara.meters,
                                                        { "MeterSerialNumber": result.Data[0].SERIAL_NO },
                                                        function (err, meterID) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                if (meterID.length !== 0) {
                                                                    dbInsert.insert_db({
                                                                        "Rev": result.Rev,
                                                                        "CellID": result.CellID,
                                                                        "MeterID": meterID[0].MeterID,
                                                                        "MessageID": result.MessageID,
                                                                        "Action": result.Action,
                                                                        "Attribute": result.Attribute,
                                                                        DBTimestamp: parser.getUTC()
                                                                    }, configPara.eventLogs, function (err) {
                                                                        if (err) {
                                                                            callback(err);
                                                                        }
                                                                    });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": result.Data[0].SERIAL_NO,
                                                                            "JobName": "Firmware Job",
                                                                            "JobType": "Mesh Firmware Job",
                                                                            "Status": { $nin: ["Completed", "Failed","Upgrade Failed","Upgrade not Required" ]}
                                                                        },
                                                                        function (err, firmJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (firmJob.length > 0) {
                                                                                    if (firmJob[firmJob.length-1].CardType === "MeshCard") {
                                                                                        if (firmJob[firmJob.length-1].FirmwareID !== result.Data[0].MeshCardFirmwareVersion) {
                                                                                            result.Data[0]["Status"] = "Completed";
                                                                                        } else {
                                                                                            result.Data[0]["Status"] = "Failed";
                                                                                        }
                                                                                        result.Data[0]["Version"] = result.Data[0].MeshCardFirmwareVersion;
                                                                                        result.Data[0]["CardType"] = "MeshCard";
                                                                                    } else {
                                                                                        if (firmJob[firmJob.length-1].FirmwareID !== result.Data[0].MeterFirmwareVersion) {
                                                                                            result.Data[0]["Status"] = "Completed";
                                                                                        } else {
                                                                                            result.Data[0]["Status"] = "Failed";
                                                                                        }
                                                                                        result.Data[0]["Version"] = result.Data[0].MeterFirmwareVersion.replace(/\0/g, '');
                                                                                        result.Data[0]["CardType"] = "MeterCard";
                                                                                    }
                                                                                    postManagerial.postManagerialData(result, configPara.firmwareMgmtMesh, function (err, resWeb) {
                                                                                        callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": result.Data[0].SERIAL_NO,
                                                                            "JobName": "Reboot Job",
                                                                            "JobType": "Mesh Reboot Job",
                                                                            "Status": "Reboot Initiated"
                                                                        },
                                                                        function (err, rebootJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (rebootJob.length > 0) {
                                                                                    reboot = {};
                                                                                    reboot["DeviceType"] = "meter";
                                                                                    reboot["Status"] = "Completed";
                                                                                    reboot["Action"] = "REBOOT";
                                                                                    reboot["Attribute"] = "METER_REBOOT";
                                                                                    reboot["SERIAL_NO"] = result.Data[0].SERIAL_NO;
                                                                                    reboot["Rev"] = result.Rev;
                                                                                    reboot["CellID"] = result.CellID;
                                                                                    reboot["MeterID"] = meterID[0].MeterID;
                                                                                    reboot["MessageID"] = result.MessageID;
                                                                                    postManagerial.postManagerialData(reboot, configPara.rebootMngmt, function (err, resWeb) {
                                                                                        callback(null, 'System management reboot Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                }
                                                                else {
                                                                    dbInsert.insert_db({
                                                                        "Rev": result.Rev,
                                                                        "CellID": result.CellID,
                                                                        "MeterID": result.MeterID,
                                                                        "MessageID": result.MessageID,
                                                                        "Action": result.Action,
                                                                        "Attribute": result.Attribute,
                                                                        "SerialNumber": result.Data[0].SERIAL_NO,
                                                                        DBTimestamp: parser.getUTC()
                                                                    },
                                                                        configPara.eventLogs, function (err) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            }
                                                                        });
                                                                }
                                                            }
                                                        });
                                                } else if (result.Attribute === 'REGISTRATION_PARA' &&
                                                    result.Action === 'DELTALINK_REGISTER') {
                                                    DeltalinkSerialNumber = result.Data[0].SERIAL_NO.replace(/\0/g, '');
                                                    dbInsert.getID_db(configPara.deltalink,
                                                        { "DeltalinkSerialNumber": DeltalinkSerialNumber },
                                                        function (err, DlID) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                if (DlID.length !== 0) {
                                                                    dbInsert.insert_db({
                                                                        "Rev": result.Rev,
                                                                        "CellID": result.CellID,
                                                                        "DeltalinkID": DlID[0].DeltalinkID,
                                                                        "MessageID": result.MessageID,
                                                                        "Action": result.Action,
                                                                        "Attribute": result.Attribute,
                                                                        DBTimestamp: parser.getUTC()
                                                                    }, configPara.eventLogs, function (err) {
                                                                        if (err) {
                                                                            callback(err);
                                                                        }
                                                                    });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": DeltalinkSerialNumber,
                                                                            "JobName": "Firmware Job",
                                                                            "JobType": "DeltaLink Firmware Job",
                                                                            "Status": { $nin: ["Completed", "Failed","Upgrade Failed","Upgrade not Required" ]}
                                                                        },
                                                                        function (err, firmJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (firmJob.length > 0) {
                                                                                    if (firmJob[0].FirmwareID !== result.Data[0].FirmwareVersion) {
                                                                                        result.Data[0]["Status"] = "Completed";
                                                                                    } else {
                                                                                        result.Data[0]["Status"] = "Failed";
                                                                                    }
                                                                                    result.Data[0]["Version"] = result.Data[0].FirmwareVersion;
                                                                                    result.Data[0]["CardType"] = "DeltaLink";
                                                                                    postManagerial.postManagerialData(result, configPara.DFirmwareresp, function (err, resWeb) {
                                                                                        callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                    dbInsert.getID_db(configPara.Jobs,
                                                                        {
                                                                            "SerialNumber": DeltalinkSerialNumber,
                                                                            "JobName": "Reboot Job",
                                                                            "JobType": "DL Reboot Job",
                                                                            "Status": "Reboot Initiated"
                                                                        },
                                                                        function (err, rebootJob) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            } else {
                                                                                if (rebootJob.length > 0) {
                                                                                    reboot = {};
                                                                                    reboot["DeviceType"] = "DeltaLink";
                                                                                    reboot["Status"] = "Completed";
                                                                                    reboot["Action"] = "REBOOT";
                                                                                    reboot["Attribute"] = "DL_REBOOT";
                                                                                    reboot["SERIAL_NO"] = DeltalinkSerialNumber;
                                                                                    reboot["Rev"] = result.Rev;
                                                                                    reboot["CellID"] = result.CellID;
                                                                                    reboot["MeterID"] = DlID[0].DeltalinkID;
                                                                                    reboot["MessageID"] = result.MessageID;
                                                                                    postManagerial.postManagerialData(reboot, configPara.rebootMngmt, function (err, resWeb) {
                                                                                        callback(null, 'System management reboot Webservice: ' + JSON.stringify(result) + resWeb);
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                }
                                                            }
                                                        });
                                                }
                                                else {
                                                    dbInsert.insert_db({
                                                        "Rev": result.Rev,
                                                        "CellID": result.CellID,
                                                        "MeterID": result.MeterID,
                                                        "MessageID": result.MessageID,
                                                        "Action": result.Action,
                                                        "Attribute": result.Attribute,
                                                        DBTimestamp: parser.getUTC()
                                                    },
                                                        configPara.eventLogs, function (err) {
                                                            if (err) {
                                                                callback(err);
                                                            }

                                                        });
                                                }

                                                if (res === 'ACTION_FOR_DEVICE') {
                                                    postManagerial.postManagerialData(result, configPara.connectDisconnectPage,
                                                        function (err, resWeb) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                callback(null, 'Webservice: ' + resWeb);
                                                            }
                                                        });
                                                }
                                                else {
                                                    postManagerial.postManagerialData(result,
                                                        configPara.regPage,
                                                        function (err, resWeb) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                callback(null, 'Webservice: ' + resWeb);
                                                            }
                                                        });
                                                }
                                                if (result.Attribute === 'REGISTRATION_PARA' &&
                                                    result.Action === 'METER_REGISTERATION') {
                                                    dbInsert.getID_db(configPara.Hypersprouts,
                                                        { "HypersproutID": result.CellID },
                                                        function (err, hsID) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                if (hsID.length !== 0) {
                                                                    dbInsert.update_db(configPara.SchedulerFlag,
                                                                        { "DeviceID": hsID[0].DeviceID }, { $set: { Flag: 0 } },
                                                                        function (err, res) {
                                                                            if (err) {
                                                                                callback(err);
                                                                            }

                                                                        });
                                                                }
                                                            }
                                                        });
                                                }
                                            }
                                        });
                                    break;
                                case 'NODE_PING':
                                case 'CONFIGURATION':
                                case 'COLLECTOR_DEREGISTERATION':
                                case 'ENDPOINT_REGISTERATION':
                                case 'ENDPOINT_DEREGISTERATION':
                                case 'DELTALINK_DEREGISTER':
                                case 'LOCK':
                                case 'UNLOCK':
                                case 'REBOOT':
                                case 'LOGS':
                                case 'FACTORY_RESET':
                                case 'ENDPOINT_UPDATE':
                                    parser.convertJson_MagerialData(jsonObj, data, function (err, result) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            dbInsert.insert_db(
                                                {
                                                    "Rev": result.Rev,
                                                    "CellID": result.CellID,
                                                    "MeterID": result.MeterID,
                                                    "MessageID": result.MessageID,
                                                    "Action": result.Action,
                                                    "Attribute": result.Attribute,
                                                    DBTimestamp: parser.getUTC()
                                                }, configPara.eventLogs, function (err) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                });

                                            if (res === 'NODE_PING') {
                                                if (result.Attribute !== 'DELTALINK_PING') {
                                                    postManagerial.postManagerialData(result,
                                                        configPara.meterNodeping, function (err, resWeb) {
                                                            if (err) {
                                                                callback(err);
                                                            }
                                                            else {
                                                                callback(null, 'Webservice: ' + resWeb);
                                                            }
                                                        });
                                                } else {
                                                    parser.convertJson_DLNodePing(jsonObj, data, function (err, result) {
                                                        if (err) {
                                                            callback(err);
                                                        } else {
                                                            postManagerial.postManagerialData(result,
                                                                configPara.DLNodePing, function (err, resWeb) {
                                                                    if (err) {
                                                                        callback(err);
                                                                    }
                                                                    else {
                                                                        callback(null, 'Webservice: ' + resWeb);
                                                                    }
                                                                });
                                                        }
                                                    });
                                                }
                                            } else if (res === 'DELTALINK_DEREGISTER') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.DlDereg, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (res === 'LOCK' || res === 'UNLOCK') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.deviceLockStatus, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (res === 'REBOOT') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.rebootMngmt, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (result.Attribute === 'METER_CLEAR_LOGS' || result.Attribute === 'HS_CLEAR_LOGS' || result.Attribute === 'HH_CLEAR_LOGS' || result.Attribute === 'DL_CLEAR_LOGS') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.clearLogsStatus, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                           // console.log("clear log resWeb", resWeb)
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (result.Attribute === 'METER_FETCH' || result.Attribute === 'HS_FETCH' || result.Attribute === 'HH_FETCH' || result.Attribute === 'DL_FETCH') {

                                                parser.covertJsonDeviceLog(jsonObj, data, function (err, result) {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        postManagerial.postManagerialData(result,
                                                            configPara.fetchDeviceLogStatus, function (err, resWeb) {
                                                                if (err) {
                                                                    callback(err);
                                                                }
                                                                else {
                                                                    callback(null, 'Webservice: ' + resWeb);
                                                                }
                                                            });
                                                    }
                                                });

                                            } else if (result.Attribute === 'METER_VERBOSITY' || result.Attribute === 'HH_VERBOSITY' || result.Attribute === 'HS_VERBOSITY' || result.Attribute === 'DL_VERBOSITY') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.verbosityLogsStatus, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (result.Attribute === 'DELTALINK_BANDWIDTH') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.EditDeltalinkBandwidthChangeResponse, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (result.Attribute === 'METER_BANDWIDTH' || result.Attribute === 'HH_BANDWIDTH' || result.Attribute === 'HS_BANDWIDTH') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.BandwidthLimitationsResponse, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            } else if (result.Attribute === 'METER_DATA_RATE' || result.Attribute === 'HS_DATA_RATE' || result.Attribute === 'HH_DATA_RATE'|| result.Attribute === 'DL_DATA_RATE' ){
                                                postManagerial.postManagerialData(result,
                                                    configPara.DataRateResponse, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            console.log("Data Rate........", resWeb)                        
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                             else if (result.Action === 'FACTORY_RESET') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.factoryResetMngmt, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            else if (res === 'COLLECTOR_DEREGISTERATION') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.hsDegister, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            else if (result.Attribute === 'HS_DOWNLOAD' ||
                                                result.Attribute === 'METER_DOWNLOAD') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.downloadConfig, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            else if (result.Attribute === 'HYPERSPROUT_WIFI') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.wifiHypersprout, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            else if (result.Attribute === 'METER_WIFI') {
                                                postManagerial.postManagerialData(result,
                                                    configPara.wifiMeter, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            else if (result.Attribute === 'ALL_DEVICE') {
                                             //   console.log(result)
                                                postManagerial.postManagerialData(result,
                                                    configPara.endPointRegDreg, function (err, resWeb) {
                                                        if (err) {
                                                            callback(err);
                                                        }
                                                        else {
                                                            callback(null, 'Webservice: ' + resWeb);
                                                        }
                                                    });
                                            }
                                            dbInsert.getID_db(configPara.Hypersprouts,
                                                { "HypersproutID": result.CellID },
                                                function (err, hsID) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                    else {
                                                        if (hsID.length !== 0) {
                                                            dbInsert.update_db(configPara.SchedulerFlag,
                                                                { "DeviceID": hsID[0].DeviceID }, { $set: { Flag: 0 } },
                                                                function (err, res) {
                                                                    if (err) {
                                                                        callback(err);
                                                                    }
                                                                });
                                                        }
                                                    }
                                                });
                                        }
                                    });
                                    break;
                                case 'EVENTS_ALARM_DATA':
                                    parser.convertJson_EventsAlarms(jsonObj, data, function (err, result) {
                                       // console.log(result)
                                        if (err) {
                                            callback(err);
                                        } else {
                                            // Insert Data to Database for Transformer / Meter Events/Alarms 
                                            dbInsert.insert_db({ result, DBTimestamp: parser.getUTC() }, configPara.alarmEvent, function (err) {
                                                if (err) {
                                                    callback(err);
                                                } else {
                                                    dbInsert.insert_db({ "Rev": result.Rev, "CellID": result.CellID, "MessageID": result.MessageID, "Action": result.Action, "Attribute": result.Attribute, "NoOfMeter": result.Transformer.NoOfMeter, DBTimestamp: parser.getUTC() }, configPara.eventLogs, function (err, val) {
                                                        if (err) {
                                                            callback(err);
                                                        } else {
                                                            callback(null, "DB Events/Alarms " + val);
                                                        }
                                                    });
                                                }
                                            });
                                            dbInsert.getID_db(configPara.Hypersprouts,
                                                { "HypersproutID": result.CellID },
                                                function (err, hsID) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                    else {
                                                        if (hsID.length !== 0) {
                                                            dbInsert.update_db(configPara.SchedulerFlag,
                                                                { "DeviceID": hsID[0].DeviceID }, { $set: { Flag: 0 } },
                                                                function (err, res) {
                                                                    if (err) {
                                                                        callback(err);
                                                                    }
                                                                });
                                                        }
                                                    }
                                                });
                                        }
                                    });
                                    break;
                                case 'SELFHEALEDMETER_DEREGISTERATION':
                                    parser.convertJson_MagerialData(jsonObj, data, function (err, result) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            dbInsert.updateSelfHeal(configPara.meters, result,
                                                function (err, updateDeviceConfig) {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        dbInsert.insert_db({ "Rev": result.Rev, "CellID": result.CellID, "MessageID": result.MessageID, "Action": result.Action, "Attribute": result.Attribute, DBTimestamp: parser.getUTC() }, configPara.eventLogs, function (err, val) {
                                                            if (err) {
                                                                callback(err);
                                                            } else {
                                                                callback(null, "Confif Update from Device" + val);
                                                            }
                                                        });
                                                    }
                                                });
                                        }
                                    });
                                    break;                                
                                case 'COLLECTOR_DATA_UPLOAD':
                                    parser.convertJson_TransactionData(jsonObj, data, function (err, result) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            logger.info("in COLLECTOR_DATA_UPLOAD");
                                            logger.info("in COLLECTOR_DATA_UPLOAD  Result : " + JSON.stringify(result));
                                            dbInsert.insert_db({
                                                "Rev": result.Rev,
                                                "CellID": result.CellID,
                                                "MessageID": result.MessageID,
                                                "Action": result.Action,
                                                "Attribute": result.Attribute,
                                                "NoOfMeter": result.Transformer.NoOfMeter,
                                                DBTimestamp: parser.getUTC()
                                            },
                                                configPara.eventLogs, function (err, val) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                });
                                            if (result.Attribute === 'COMBINED_TRANSACTIONAL_DATA') {
                                              //  console.log("------------------------TRANSACTION DATA------------------------------------------>")
                                                logger.info("------------------------TRANSACTION DATA------------------------------------------>");
                                                dbInsert.updateTransdataScheduler({ "TransactionDataResponse": result, "TimeStampResponse": parser.getUTC() }, function (err, resWeb) {
                                                    if (err) {
                                                      //  console.log("after update schedular" + err);
                                                        callback(err);
                                                    }
                                                    else {
                                                        if (resWeb === 'Success') {
                                                            logger.info("in success Result COMBINED_TRANSACTIONAL_DATA");
                                                            callback(null, "Transaction Data Inserted to DB");
                                                        }
                                                        else if (resWeb === 'Failure') {
                                                            logger.info("failure----+Bulk Data-");
                                                            callback(null, 'Bulk Data');
                                                        }
                                                    }
                                                });

                                            }
                                            else if (result.Attribute === 'ON_DEMAND_METER_DATA') {
                                                // Insert Data to Database for Tranactionl meter part
                                                dbInsert.insert_db({ result, DBTimestamp: parser.getUTC() }, configPara.onDemandMeterData, function (err) {
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        postManagerial.postManagerialData({ "MeterID": result.meters[0].DeviceID, "Status": result.meters[0].Status }, configPara.onDemandWebServicePage, function (err, resWeb) {
                                                            callback(null, 'OnDemand_Webservice: ' + resWeb);
                                                        });
                                                        //fetch Meter Connect disconnect status
                                                        dbInsert.getID_db(configPara.meters,
                                                            { "MeterID": result.meters[0].DeviceID },
                                                            function (err, meterDetails) {
                                                                if (err) {
                                                                    callback(err);
                                                                }
                                                                else {

                                                                    if (meterDetails.length !== 0) {
                                                                        if (meterDetails[0].ConnDisconnStatus == 'Connected' || meterDetails[0].ConnDisconnStatus == 'Disconnected' || meterDetails[0].ConnDisconnStatus == null) {
                                                                            dbInsert.update_db(configPara.meters,
                                                                                { "MeterID": result.meters[0].DeviceID }, { $set: { ConnDisconnStatus: result.meters[0].Status } },
                                                                                function (err, res) {
                                                                                    if (err) {
                                                                                        callback(err);
                                                                                    }
                                                                                });
                                                                        }
                                                                    }
                                                                }
                                                            });
                                                    }
                                                });
                                            }
                                            dbInsert.getID_db(configPara.Hypersprouts,
                                                { "HypersproutID": result.CellID },
                                                function (err, hsID) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                    else {
                                                        if (hsID.length !== 0) {
                                                            dbInsert.update_db(configPara.SchedulerFlag,
                                                                { "DeviceID": hsID[0].DeviceID }, { $set: { Flag: 0 } },
                                                                function (err, res) {
                                                                    if (err) {
                                                                        callback(err);
                                                                    }
                                                                });
                                                        }
                                                    }
                                                });
                                        }
                                    });
                                    break;
                                case 'METER_DEREGISTERATION':
                                    parser.convertJson_Deregister(jsonObj, data, function (err, result) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            postManagerial.postManagerialData(result, configPara.meterDegister, function (err, resWeb) {
                                                callback(null, 'MeterDeReg Webservice: ' + JSON.stringify(result) + resWeb);
                                            });
                                        }
                                    });
                                    break;
                                case 'COLLECTOR_FIRMWARE_UPGRADE':
                                case 'ITM_FIRMWARE_UPGRADE':
                                case 'CELLULAR_FIRMWARE_UPGRADE':
                                case 'BLUETOOTH_FIRMWARE_UPGRADE':
                                    parser.covertJsonFirmwareManagement(jsonObj, data, function (err, result) {
                                     //   console.log("iNC-------------result", result);
                                        if (err) {
                                            callback(err);
                                        } else {
                                            postManagerial.postManagerialData(result, configPara.firmwareMngmt, function (err, resWeb) {
                                                callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                            });
                                        }
                                    });
                                    break;
                                case 'BACKHAUL':
                                case 'HS_FRONTHAUL':
                                case 'METER_FRONTHAUL':
                                case 'Cloud_Connectivity':
                                case 'Configuration_Meter':
                                case 'System_Settings':
                                    parser.covertJsonConfigManagement(jsonObj, data, function (err, result) {
                                       // console.log("ConfigMgmnt-------------result", result);
                                        if (err) {
                                            callback(err);
                                        } else {
                                            if (result.Attribute !== 'CARRIER_LIST' && result.Attribute !== 'METER_SCAN') {
                                                postManagerial.postManagerialData(result, configPara.configMgmt, function (err, resWeb) {
                                                    callback(null, 'COnfig Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                });
                                            } else if (result.Attribute == 'METER_SCAN') {
                                              //  console.log("METER_SCAN")
                                                parser.convertJson_MeshScan(jsonObj, data, function (err, result) {
                                                 //   console.log(result)
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                      //  console.log("METER_SCAN++++++++++++++")
                                                        postManagerial.postManagerialData(result, configPara.Meshscan, function (err, resWeb) {
                                                            callback(null, 'COnfig Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                        });
                                                    }
                                                });
                                            } else {
                                                parser.convertJson_CarrierList(jsonObj, data, function (err, result) {
                                                  //  console.log(result)
                                                    if (err) {
                                                        callback(err);
                                                    } else {
                                                        postManagerial.postManagerialData(result, configPara.CarrierResp, function (err, resWeb) {
                                                            callback(null, 'COnfig Management Webservice: ' + JSON.stringify(result) + resWeb);
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    break;
                                case 'SET_BACKHAUL_CONFIGURATION':
                                case 'SET_HS_FRONTHAUL_CONFIGURATION':
                                case 'SET_METER_FRONTHAUL_CONFIGURATION':
                                case 'SET_METER_CONFIGURATION':
                                case 'SET_CLOUD_CONNECTIVITY':
                                case 'SET_SYSTEM_SETTINGS':
                                    parser.convertJson_MagerialData(jsonObj, data, function (err, result) {
                                        console.log("ConfigMgmnt-------------result", result);
                                        if (err) {
                                            callback(err);
                                        } else {
                                            dbInsert.updateDeviceConfig(configPara.UpdateConfig,configPara.Hypersprouts,configPara.meters, result,
                                                function (err, updateDeviceConfig) {
                                                    if (err) {
                                                        callback(err);
                                                    }else{
                                                        dbInsert.insert_db({ "Rev": result.Rev, "CellID": result.CellID, "MessageID": result.MessageID, "Action": result.Action, "Attribute": result.Attribute, DBTimestamp: parser.getUTC() }, configPara.eventLogs, function (err, val) {
                                                            if (err) {
                                                                callback(err);
                                                            } else {
                                                                if(result.Attribute === 'METER_MESH'){
                                                                    postManagerial.postManagerialData(result, configPara.MeshMacAclAddition, function (err, resWeb) {
                                                                        callback(null, 'Confif Update from Device Meter Mesh: ' + JSON.stringify(result) + resWeb);
                                                                    });
                                                                }else
                                                                callback(null, "Confif Update from Device" + val);
                                                            }
                                                        });
                                                    }
                                                });
                                        }
                                    });
                                    break;
                                case 'METER_FIRMWARE_UPGRADE':
                                case 'METERCARD_FIRMWARE_UPGRADE':
                                        parser.convertJsonMeterFirmwareManagement(jsonObj, data, res, function (err, result) {
                                             if (err) {
                                                 callback(err);
                                             } else {
                                                 if (res === 'METER_FIRMWARE_UPGRADE' || res === 'METERCARD_FIRMWARE_UPGRADE') {
                                                     postManagerial.postManagerialData(result, configPara.firmwareMgmtMesh, function (err, resWebfirmwareMgmtMesh) {
                                                         callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWebfirmwareMgmtMesh);
                                                     });
                                                 }
                                                 
                                             }
                                         });
                                         break;
                                case 'DELTALINK_FIRMWARE_UPGRADE':
                                    parser.covertJsonFirmwareManagement(jsonObj, data, function (err, result) {
                                        // console.log("Mesh-------------result", result);
                                        if (err) {
                                            callback(err);
                                        } else {
                                            // if (res === 'METER_FIRMWARE_UPGRADE' || res === 'METERCARD_FIRMWARE_UPGRADE') {
                                            //     postManagerial.postManagerialData(result, configPara.firmwareMgmtMesh, function (err, resWeb) {
                                            //         callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                            //     });
                                            // }
                                            // else {
                                            postManagerial.postManagerialData(result, configPara.DFirmwareresp, function (err, resWeb) {
                                                callback(null, 'Firmware Management Webservice: ' + JSON.stringify(result) + resWeb);
                                            });
                                            //  }
                                        }
                                    });
                                    break;
                                case 'MAC_ACL':
                                    parser.covertJsonMacAclManagement(jsonObj, data, function (err, result) {
                                       // console.log("MAC ACL-------------result", result);
                                        if (err) {
                                            callback(err);
                                        } else {

                                            dbInsert.insert_db({
                                                "Rev": result.Rev,
                                                "CellID": result.CellID,
                                                "MessageID": result.MessageID,
                                                "Action": result.Action,
                                                "Attribute": result.Attribute,
                                                DBTimestamp: parser.getUTC()
                                            },
                                                configPara.eventLogs, function (err, val) {
                                                    if (err) {
                                                        callback(err);
                                                    }
                                                });
                                            if ((result.Attribute === 'DV_URL_MAC_ACL' || result.Attribute === 'MC_DV_URL_MAC_ACL' || result.Attribute === 'DL_DV_URL_MAC_ACL') && result.Type === 'Request') {
                                                postManagerial.postManagerialData(result, configPara.macAclDv, function (err, resWeb) {
                                                    callback(null, 'MacACLDV: ' + resWeb);
                                                });

                                            } else if ((result.Attribute === 'HS_URL_MAC_ACL' || result.Attribute === 'MC_HS_URL_MAC_ACL' || result.Attribute === 'DL_HS_URL_MAC_ACL') && result.Type === 'Request') {
                                                postManagerial.postManagerialData(result, configPara.macAclHs, function (err, resWeb) {
                                                    callback(null, 'MacACLHS: ' + resWeb);
                                                });

                                            } else if ((result.Attribute === 'ALL_URL_MAC_ACL' || result.Attribute === 'MC_ALL_URL_MAC_ACL' || result.Attribute === 'DL_ALL_URL_MAC_ACL') && result.Type === 'Request') {
                                                postManagerial.postManagerialData(result, configPara.macAclAll, function (err, resWeb) {
                                                    callback(null, 'MacACLALL: ' + resWeb);
                                                });

                                            }
                                        }
                                    });
                                    break;
                                case 'DHCP_CONFIG':
                                    parser.convertJson_DhcpData(jsonObj, data,
                                        function (err, result) {
                                            postManagerial.postManagerialData(result, configPara.DhcpParam, function (err, resWeb) {
                                                if (err)
                                                    callback(err, null);
                                                else
                                                    callback(null, 'DHCP parameter for deltalink: ' + JSON.stringify(result) + resWeb);
                                            });
                                        });
                                    break;
                                case 'DELTALINK_STATUS':
                                    parser.convertJson_DeltalinkStatus(jsonObj, data,
                                        function (err, result) {
                                            postManagerial.postManagerialData(result, configPara.DeltaLinkStatus, function (err, resWeb) {
                                                if (err)
                                                    callback(err, null);
                                                else
                                                    callback(null, 'DHCP parameter for deltalink: ' + JSON.stringify(result) + resWeb);
                                            });
                                        });
                                    break;
                                case 'UPLOAD_CONFIG_SETTINGS':
                                    parser.convertJson_configUpload(jsonObj, data,
                                        function (err, result) {
                                            if (err) {
                                                callback(err);
                                            } else {
                                                if (result.Attribute === 'UPLOAD_METER_CONFIG' && result.Action === 'UPLOAD_CONFIG_SETTINGS' || result.Attribute === 'UPLOAD_HS_CONFIG' &&
                                                    result.Action === 'UPLOAD_CONFIG_SETTINGS') {
                                                    if (result.Attribute === 'UPLOAD_METER_CONFIG'&&result.Type==='Response') {
                                                        let configUpoadMeterStatus = result.Status;
                                                        if (configUpoadMeterStatus == 'Success') {
                                                            dbInsert.updateConfigUpoadJobStatus({ "configUploadResponse": result, "TimeStampResponse": parser.getUTC() }, function (err, resWeb) {
                                                                if (err) {
                                                                    console.log("after update schedular" + err);
                                                                    callback(err);
                                                                }
                                                                else {
                                                                    callback(null, true,);
                                                                }
                                                            })
                                                        }
                                                    } else {
                                                        let configUpoadHSStatus =result.Status;
                                                        if (configUpoadHSStatus == 'Success') {
                                                            dbInsert.updateConfigUpoadHSjobStatus({ "configUploadResponse": result, "TimeStampResponse": parser.getUTC() }, function (err, resWeb) {
                                                                if (err) {
                                                                    callback(err);
                                                                }
                                                                else {
                                                                    callback(null, true,);
                                                                }
                                                            })
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                        break;
                                case 'DATA_CONSUMPTION':
                                console.log("Data consumption -------------------")
                                    parser.convertJson_DataConsumption(jsonObj, data,
                                        function (err, result) {
                                            insertDataConsumption.insertDataConsumptionValue(result,function(err,result){
                                                if(err){
                                                    console.log("Errr in Data consumption",JSON.stringify(err));
                                                    callback(err, null);
                                                }else{
                                                    console.log("data consumption successfull",JSON.stringify(result));
                                                    callback(null,result);
                                                }
                                            });
                                            
                                        });
                                    break;
                                default:
                                    callback(null, 'Unknown Action defined in protocol Json file');
                                    break;

                            }
                        }
                    });
                }
            });
        }
    });
};

module.exports = {
    decsionMaker: decsionMaker,
}
