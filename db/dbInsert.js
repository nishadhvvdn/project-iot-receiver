var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var configPara = require('../config/config.js');
var cnnString = configPara.DBconnectionString;
global.dbase = {};
var logger = require('../config/logger.js');


var theDb = null;
function getDb(callback) {
    var response = {}
    if (!theDb || (theDb && !theDb.db.serverConfig.isConnected())) {
        mongodb.MongoClient.connect(cnnString, { poolSize: 6, socketTimeoutMS: 60000 }, function (err, databaseClient) {
            if (err) {
                response.Type = false;
                response.Message = "Database connection refused";
                callback(response);
            } else {
                dbase = databaseClient;
                let db = databaseClient.db("DELTA");
                theDb = {
                    db: db
                };
                callback(null, theDb);
            }
        });
    } else {
        callback(null, theDb);
    }
}


/**
* @description - Insert data to mongo db.
*
* @param val - Value to insert
*
* @param collectionName - Collection to which to insert.
*
* @return Success/Failure.
*/
var insert_db = function (val, collectionName, callback) {
   // create connection to mogodb
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            var collection = dbConn.db.collection(collectionName);
            collection.insertOne(val, function (err) {
                if (err) {
                    // if (theDb) {
                    //     dbConn.db.close();
                    //     theDb = null;
                    // }
                    return callback(err, null);
                } else {
                    return callback(null, 'inserted');
                }

            });
        }
    });

};

/**
* @description - Get HS or MeterID from mongo db.
*
* @param val - Value for which to get HS/Meter ID
*
* @param collectionName - Collection to which to insert.
*
* @return HS/Meter ID.
*/
var getID_db = function (collectionName, val, callback) {
    // create connection to mogodb
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            var collection = dbConn.db.collection(collectionName);
            collection.find(val).toArray(function (err, result) {
                if (err) {
                    // if (theDb) {
                    //     dbConn.db.close();
                    //     theDb = null;
                    // }
                    return callback(err, null);
                } else {
                    return callback(null, result);
                }

            });
        }
    });

};

/**
* @description - Get HS or MeterID from mongo db.
*
* @param val - Value for which to get HS/Meter ID
*
* @param collectionName - Collection to which to insert.
*
* @return HS/Meter ID.
*/
var updateConfig = function (collectionName, val, callback) {
    // create connection to mogodb
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            for (x in val.Data[0]) {
                if (typeof val.Data[0][x] === 'string')
                    val.Data[0][x] = val.Data[0][x].replace(/\0/g, '');
            }
            var collection = dbConn.db.collection(collectionName);
            if (val.Action === 'COLLECTOR_REGISTERATION')
                regex = { HypersproutID: val.CellID }
            else
                regex = { MeterID: val.MeterID }
            if (val.Action === 'COLLECTOR_REGISTERATION') {
                updateData = {
                    "BackHaul": {
                        "Cellular": {
                            "username": val.Data[0].Username, "password": val.Data[0].Password, "sim_pin": val.Data[0].Sim_Pin, "network_selection": val.Data[0].Network_Selection, "carrier": val.Data.Carrier, "CarrierList": []
                        },
                        "Ethernet": {
                            "mode": val.Data[0].bMode, "ip": val.Data[0].bIP, "gateway": val.Data[0].bGateway, "subnet": val.Data[0].bSubnet,
                            "primary_dns": val.Data[0].bPrimary_DNS, "secondary_dns": val.Data[0].bSecondary_DNS
                        },
                        "Advanced": {
                            "primary_backhaul": val.Data[0].Primary_Bachaul, "auto_switchover": val.Data[0].Auto_Switchover
                        }
                    },
                    "FrontHaul": {
                        "Radio_Configuration": {
                            "two_four": {
                                "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": val.Data[0].r2_radio_mode,
                                "chan_bw": val.Data[0].r2_chan_bw, "channel": val.Data[0].r2_channel, "txpower": val.Data[0].r2_txpower, "stream_selection": val.Data[0].r2_stream_selection, "guard_interval": val.Data[0].r2_guard_interval
                            },
                            "five_low": {
                                "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": val.Data[0].r5l_radio_mode,
                                "chan_bw": val.Data[0].r5l_chan_bw, "channel": val.Data[0].r5l_channel, "txpower": val.Data[0].r5l_txpower, "stream_selection": val.Data[0].r5l_stream_selection, "guard_interval": val.Data[0].r5l_guard_interval
                            },
                            "five_high": {
                                "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": val.Data[0].r5h_radio_mode,
                                "chan_bw": val.Data[0].r5h_chan_bw, "channel": val.Data[0].r5h_channel, "txpower": val.Data[0].r5h_txpower, "stream_selection": val.Data[0].r5h_stream_selection, "guard_interval": val.Data[0].r5h_guard_interval
                            }
                        },
                        "Mesh_Configuration": {
                            "two_four": {
                                "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].m2_meshID, "securityType": val.Data[0].m2_SecurityType,
                                "PSK": val.Data[0].m2_PSK, "enable": 1, "action": 1
                            },
                            "five_high": {
                                "status": 1, "radio_band": "5 GHz(High)", "meshID": val.Data[0].m5_meshID, "securityType": val.Data[0].m5_SecurityType,
                                "PSK": val.Data[0].m5_PSK, "enable": 1, "action": 1
                            }
                        },
                        "Hotspot_Configuration": {
                            "two_four": {
                                "action": 1, "status": val.Data[0].h2_Status, "radio_band": "2.4 GHz",
                                "ssid": val.Data[0].h2_SSID, "security": val.Data[0].h2_WirelessSecurity, "password": val.Data[0].h2_Password,
                                "vap_details": [{ "status": val.Data[0].h2_Status1,"ssid": val.Data[0].h2_SSID1, "security": val.Data[0].h2_WirelessSecurity1, "password": val.Data[0].h2_Password1 }]
                            },
                            "five": {
                                "action": 1, "status": 1, "radio_band": "5 GHz",
                                "vap_details": [{ "status": val.Data[0].h5_Status,"ssid": val.Data[0].h5_SSID, "security": val.Data[0].h5_WirelessSecurity, "password": val.Data[0].h5_Password }, { "status": val.Data[0].h5_Status1,"ssid": val.Data[0].h5_SSID1, "security": val.Data[0].h5_WirelessSecurity1, "password": val.Data[0].h5_Password1 }]
                            }
                        },
                        "DHCP": {
                            "Hotspot": {
                                "Status": val.Data[0].d_Status, "StartIpAddr": val.Data[0].d_StartAddress,
                                "EndIpAddr": val.Data[0].d_EndAddress, "Gateway": val.Data[0].d_Gateway,
                                "Subnet": val.Data[0].d_Subnet, "PrimaryDNS": val.Data[0].d_Primary_DNS,
                                "SecondaryDNS": val.Data[0].d_Secondary_DNS
                            },
                            "Mesh": {
                                "Status": val.Data[0].d_Status1, "StartIpAddr": val.Data[0].d_StartAddress1,
                                "EndIpAddr": val.Data[0].d_EndAddress1, "Gateway": val.Data[0].d_Gateway1,
                                "Subnet": val.Data[0].d_Subnet1, "PrimaryDNS": val.Data[0].d_Primary_DNS1,
                                "SecondaryDNS": val.Data[0].d_Secondary_DNS1
                            }
                        }
                    },
                    "System_Settings": {
                        "sysname": val.Data[0].SystemName, "country": val.Data[0].Country.toUpperCase(), "timezone": val.Data[0].Timezone
                    },
                    "config_UpdateTime": val.Data[0].config_time
                }
                for (x in updateData.FrontHaul.Radio_Configuration) {
                    if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 7)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11a";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 0)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11b";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 2)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11ng";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 1)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11g";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 3)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11axg";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 5)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11na";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 6)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11ac";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 4)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11axa";

                    if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 0)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "20MHz";
                    else if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 1)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "40MHz";
                    else if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 2)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "80MHz";
                    //    "guard_interval"
                    if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 0)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "800ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 1)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "400ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 2)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "1600ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 3)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "3200ns";
                    //    "stream_selection"
                    if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 1)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "1x1";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 3)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "2x2";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 7)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "3x3";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 15)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "4x4";

                }
                for (x in updateData.Mesh_Configuration) {
                    if (updateData.Mesh_Configuration.securityType == 'none')
                        updateData.Mesh_Configuration.securityType = 'Open';
                    else
                        updateData.Mesh_Configuration.securityType = 'SAE';
                    if (updateData.Mesh_Configuration.securityType == 'none')
                        updateData.Mesh_Configuration.securityType = 'Open';
                    else
                        updateData.Mesh_Configuration.securityType = 'SAE';
                }
            } else {
                val.Data[0].StartAddress = val.Data[0].StartAddress.replace(/[^\d.]/g, '');
                val.Data[0].EndAddress = val.Data[0].EndAddress.replace(/[^\d.]/g, '');
                val.Data[0].Gateway = val.Data[0].Gateway.replace(/[^\d.]/g, '');
                val.Data[0].Subnet = val.Data[0].Subnet.replace(/[^\d.]/g, '');
                val.Data[0].Primary_DNS = val.Data[0].Primary_DNS.replace(/[^\d.]/g, '');
                val.Data[0].Secondary_DNS = val.Data[0].Secondary_DNS.replace(/[^\d.]/g, '');
                updateData = {
                    "FrontHaul": {
                        "Radio_Configuration": {
                                "status": 1, "radio_band": val.Data[0].radio_band, "radio_state": 1, "radio_mode": val.Data[0].radio_mode,
                                "chan_bw": val.Data[0].chan_bw, "channel": val.Data[0].channel, "txpower": val.Data[0].txpower, "stream_selection": val.Data[0].stream_selection
                        },
                        "Mesh_Configuration": {
                            "Primary": {
                                "status": 1,
                                "radio_band": "2.4 GHz",
                                "meshID": val.Data[0].meshID,
                                "securityType": val.Data[0].SecurityType,
                                "PSK": val.Data[0].PSK,
                                "Mac":val.Data[0].MeshMac.toLowerCase(),
                                "DeviceType":val.Data[0].MeshDeviceType,
                                "SerialNumber":val.Data[0].MeshSerialNumber,
                                "enable": 1,
                                "action": 1
                            },
                            "Secondary": {
                                "status": 1,
                                "radio_band": "2.4 GHz",
                                "meshID": val.Data[0].meshID1,
                                "securityType": val.Data[0].SecurityType1,
                                "PSK": val.Data[0].PSK1,
                                "Mac":val.Data[0].MeshMac1.toLowerCase(),
                                "DeviceType":val.Data[0].MeshDeviceType1,
                                "SerialNumber":val.Data[0].MeshSerialNumber1,
                                "enable": 1,
                                "action": 1
                            }
                        },
                        "Hotspot_Configuration": {
                            "action": 1,
                            "status": val.Data[0].Status,
                            "radio_band": "2.4 GHz",
                            "ssid": val.Data[0].SSID,
                            "security": val.Data[0].WirelessSecurity,
                            "password": val.Data[0].Password
                        },
                        "DHCP": {
                            "Status": val.Data[0].dStatus,
                            "StartIpAddr": val.Data[0].StartAddress,
                            "EndIpAddr": val.Data[0].EndAddress,
                            "Gateway": val.Data[0].Gateway,
                            "Subnet": val.Data[0].Subnet,
                            "PrimaryDNS": val.Data[0].Primary_DNS,
                            "SecondaryDNS": val.Data[0].Secondary_DNS
                        }
                    },
                    "Meter_Configuration": {
                        "uti_ID": val.Data[0].UtilityID,
                        "cir_ID": val.Data[0].CircuitID,
                        "cer_num": val.Data[0].CertificationNumber,
                        "esn": val.Data[0].MeterESN
                    },
                    "System_Settings": {
                        "sysname": val.Data[0].SystemName, "country": val.Data[0].Country.toUpperCase(), "timezone": val.Data[0].Timezone
                    },
                    "config_UpdateTime": val.Data[0].config_time
                }
                if (updateData.FrontHaul.Mesh_Configuration.Primary.securityType == 'none')
                    updateData.FrontHaul.Mesh_Configuration.Primary.securityType = 'Open';
                if (updateData.FrontHaul.Mesh_Configuration.Secondary.securityType == 'none')
                    updateData.FrontHaul.Mesh_Configuration.Secondary.securityType = 'Open';

                if (updateData.FrontHaul.Radio_Configuration.radio_mode == 7)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11a";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 0)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11b";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 2)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11ng";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 1)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11g";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 3)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11axg";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 5)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11na";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 6)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11ac";
                else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 4)
                    updateData.FrontHaul.Radio_Configuration.radio_mode = "11axa";

                if (updateData.FrontHaul.Radio_Configuration.radio_band == 0)
                    updateData.FrontHaul.Radio_Configuration.radio_band = "5 GHz";
                else if (updateData.FrontHaul.Radio_Configuration.radio_band == 1)
                    updateData.FrontHaul.Radio_Configuration.radio_band = "2.4 GHz";

                if (updateData.FrontHaul.Radio_Configuration.chan_bw == 0)
                    updateData.FrontHaul.Radio_Configuration.chan_bw = "Auto";
                else if (updateData.FrontHaul.Radio_Configuration.chan_bw == 1)
                    updateData.FrontHaul.Radio_Configuration.chan_bw = "20MHz";
                else if (updateData.FrontHaul.Radio_Configuration.chan_bw == 2)
                    updateData.FrontHaul.Radio_Configuration.chan_bw = "40MHz";
                if (updateData.FrontHaul.Radio_Configuration.stream_selection == 1)
                    updateData.FrontHaul.Radio_Configuration.stream_selection = "1x1";
                else if (updateData.FrontHaul.Radio_Configuration.stream_selection == 2)
                    updateData.FrontHaul.Radio_Configuration.stream_selection = "2x2";
            }
            if (updateData.System_Settings.timezone == 0)
                updateData.System_Settings.timezone = 'Asia/Kolkata - GMT+5:30';
            else if (updateData.System_Settings.timezone == 1)
                updateData.System_Settings.timezone = 'Asia/Tashkent - GMT+5';
            else if (updateData.System_Settings.timezone == 2)
                updateData.System_Settings.timezone = 'Asia/Manila - GMT+8';
            else if (updateData.System_Settings.timezone == 3)
                updateData.System_Settings.timezone = 'Africa/Johannesburg - GMT+2';
            else if (updateData.System_Settings.timezone == 4)
                updateData.System_Settings.timezone = 'America/Tijuana - UTC --8:00/ -7:00';
            else if (updateData.System_Settings.timezone == 5)
                updateData.System_Settings.timezone = 'America/Hermosillo - UTC -7';
            else if (updateData.System_Settings.timezone == 6)
                updateData.System_Settings.timezone = 'America/Mazatlan - UTC -7:00 / -6:00';
            else if (updateData.System_Settings.timezone == 7)
                updateData.System_Settings.timezone = 'America/Mexico_City- UTC -6:00 / -5:00';
            else if (updateData.System_Settings.timezone == 8)
                updateData.System_Settings.timezone = 'America/Cancun - UTC -5:00';
            else if (updateData.System_Settings.timezone == 9)
                updateData.System_Settings.timezone = 'Asia/Singapore - GMT+8';
            else if (updateData.System_Settings.timezone == 10)
                updateData.System_Settings.timezone = 'Europe/Kaliningrad - UTC+02:00';
            else if (updateData.System_Settings.timezone == 11)
                updateData.System_Settings.timezone = 'Europe/Moscow - UTC+03:00';
            else if (updateData.System_Settings.timezone == 12)
                updateData.System_Settings.timezone = 'Europe/Samara - UTC+04:00';
            else if (updateData.System_Settings.timezone == 13)
                updateData.System_Settings.timezone = 'Asia/Yekaterinburg- UTC+05:00';
            else if (updateData.System_Settings.timezone == 14)
                updateData.System_Settings.timezone = 'Asia/omsk - UTC+06:00';
            else if (updateData.System_Settings.timezone == 15)
                updateData.System_Settings.timezone = 'Asia/Krasnoyarsk - UTC+07:00';
            else if (updateData.System_Settings.timezone == 16)
                updateData.System_Settings.timezone = 'Asia/Irkutsk- UTC+08:00';
            else if (updateData.System_Settings.timezone == 17)
                updateData.System_Settings.timezone = 'Asia/Yakutsk - UTC+09:00';
            else if (updateData.System_Settings.timezone == 18)
                updateData.System_Settings.timezone = 'Asia/Vladivostok - UTC+10:00';
            else if (updateData.System_Settings.timezone == 19)
                updateData.System_Settings.timezone = 'Asia/Magadan - UTC+11:00';
            else if (updateData.System_Settings.timezone == 20)
                updateData.System_Settings.timezone = 'Asia/Kamchatka - UTC+12:00';
            else if (updateData.System_Settings.timezone == 21)
                updateData.System_Settings.timezone = 'America/Vancouver - UTC -8:00 / -7:00';
            else if (updateData.System_Settings.timezone == 22)
                updateData.System_Settings.timezone = 'America/Dawson Creek - UTC -7:00';
            else if (updateData.System_Settings.timezone == 23)
                updateData.System_Settings.timezone = 'America/Edmonton - UTC -7:00 / -6:00';
            else if (updateData.System_Settings.timezone == 24)
                updateData.System_Settings.timezone = 'America/Regina - UTC -6:00';
            else if (updateData.System_Settings.timezone == 25)
                updateData.System_Settings.timezone = 'America/Winnipeg - UTC -6:00 / -5:00';
            else if (updateData.System_Settings.timezone == 26)
                updateData.System_Settings.timezone = 'America/Atikokan - UTC -5:00';
            else if (updateData.System_Settings.timezone == 27)
                updateData.System_Settings.timezone = 'America/Toronto - UTC -5:00 / -4:00';
            else if (updateData.System_Settings.timezone == 28)
                updateData.System_Settings.timezone = 'America/Blanc-Sablon - UTC -4:00';
            else if (updateData.System_Settings.timezone == 29)
                updateData.System_Settings.timezone = 'America/Halifax - UTC -4:00 / -3:00';
            else if (updateData.System_Settings.timezone == 30)
                updateData.System_Settings.timezone = 'America/St Johns - UTC -3.30 / -2.30';
            else if (updateData.System_Settings.timezone == 31)
                updateData.System_Settings.timezone = 'Pacific/Honolulu - UTC -10:00';
            else if (updateData.System_Settings.timezone == 32)
                updateData.System_Settings.timezone = 'America/Anchorage - UTC -9:00 / -8:00';
            else if (updateData.System_Settings.timezone == 33)
                updateData.System_Settings.timezone = 'America/Los Angeles - UTC -8:00 / -7:00';
            else if (updateData.System_Settings.timezone == 34)
                updateData.System_Settings.timezone = 'America/Phoenix - UTC -7:00';
            else if (updateData.System_Settings.timezone == 35)
                updateData.System_Settings.timezone = 'America/Boise - UTC -7.00/-6.00';
            else if (updateData.System_Settings.timezone == 37)
                updateData.System_Settings.timezone = 'America/Chicago - UTC -6:00 / -5:00';
            else if (updateData.System_Settings.timezone == 38)
                updateData.System_Settings.timezone = 'America/New York - UTC -5:00 / -4:00';
            if (val.Action === 'COLLECTOR_REGISTERATION') {
                collection.updateOne(regex, { $set: { "BackHaul": updateData.BackHaul, "FrontHaul": updateData.FrontHaul, "System_Settings": updateData.System_Settings, config_UpdateTime: updateData.config_UpdateTime } }, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }

                });
            } else {
                collection.updateOne(regex, { $set: { "FrontHaul": updateData.FrontHaul, "System_Settings": updateData.System_Settings, "Meter_Configuration": updateData.Meter_Configuration, config_UpdateTime: updateData.config_UpdateTime } }, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    } else { 
                        return callback(null, result);
                    }

                });
            }

        }
    });

};

/**
* @description - Get HS or MeterID from mongo db.
*
* @param val - Value for which to get HS/Meter ID
*
* @param collectionName - Collection to which to insert.
*
* @return HS/Meter ID.
*/
var updateDeviceConfig = function (collectionName, HSCollection, MeterCollection, val, callback) {
    // create connection to mogodb
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            for (x in val.Data[0]) {
                if (typeof val.Data[0][x] === 'string')
                    val.Data[0][x] = val.Data[0][x].replace(/\0/g, '');
            }
            var collection = dbConn.db.collection(collectionName);
            if ((val.Action === 'SET_BACKHAUL_CONFIGURATION') || (val.Action === 'SET_HS_FRONTHAUL_CONFIGURATION') || (val.Action === 'SET_CLOUD_CONNECTIVITY') || (val.Attribute === 'HS_System_Settings'))
                regex = { HypersproutID: val.CellID }
            else
                regex = { MeterID: val.MeterID }
                
            if (val.Action === 'SET_BACKHAUL_CONFIGURATION') {
                if (val.Attribute === 'CELLULAR') {
                    updateData = {
                        "BackHaul.Cellular": {
                            "username": val.Data[0].Username, "password": val.Data[0].Password, "sim_pin": val.Data[0].Sim_Pin, "network_selection": val.Data[0].Network_Selection, "carrier": val.Data[0].Carrier, "CarrierList": []
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'ETHERNET') {
                    updateData = {
                        "BackHaul.Ethernet": {
                            "mode": val.Data[0].Mode, "ip": val.Data[0].IP, "gateway": val.Data[0].Gateway, "subnet": val.Data[0].Subnet,
                            "primary_dns": val.Data[0].Primary_DNS, "secondary_dns": val.Data[0].Secondary_DNS
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'ADVANCED') {
                    updateData = {
                        "BackHaul.Advanced": {
                            "primary_backhaul": val.Data[0].Primary_Bachaul, "auto_switchover": val.Data[0].Auto_Switchover
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    }
                }
            } else if (val.Action == 'SET_HS_FRONTHAUL_CONFIGURATION') {
                if (val.Attribute === 'RADIO_2_4') {
                    updateData = {
                        "FrontHaul": {
                            "Radio_Configuration": {
                                "two_four": {
                                    "status": 1, "radio_band": "2.4 GHz", "radio_state": 1, "radio_mode": val.Data[0].radio_mode,
                                    "chan_bw": val.Data[0].chan_bw, "channel": val.Data[0].channel, "txpower": val.Data[0].txpower, "stream_selection": val.Data[0].stream_selection, "guard_interval": val.Data[0].guard_interval
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'RADIO_5_L') {
                    updateData = {
                        "FrontHaul": {
                            "Radio_Configuration": {
                                "five_low": {
                                    "status": 1, "radio_band": "5 GHz(Low)", "radio_state": 1, "radio_mode": val.Data[0].radio_mode,
                                    "chan_bw": val.Data[0].chan_bw, "channel": val.Data[0].channel, "txpower": val.Data[0].txpower, "stream_selection": val.Data[0].stream_selection, "guard_interval": val.Data[0].guard_interval
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'RADIO_5_H') {
                    updateData = {
                        "FrontHaul": {
                            "Radio_Configuration": {
                                "five_high": {
                                    "status": 1, "radio_band": "5 GHz(High)", "radio_state": 1, "radio_mode": val.Data[0].radio_mode,
                                    "chan_bw": val.Data[0].chan_bw, "channel": val.Data[0].channel, "txpower": val.Data[0].txpower, "stream_selection": val.Data[0].stream_selection, "guard_interval": val.Data[0].guard_interval
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'MESH_2_4') {
                    updateData = {
                        "FrontHaul": {
                            "Mesh_Configuration": {
                                "two_four": {
                                    "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].meshID, "securityType": val.Data[0].SecurityType,
                                    "PSK": val.Data[0].PSK, "enable": 1, "action": 1
                                },
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'MESH_5_L') {
                    updateData = {
                        "FrontHaul": {
                            "Mesh_Configuration": {
                                "five_high": {
                                    "status": 1, "radio_band": "5 GHz(High)", "meshID": val.Data[0].meshID, "securityType": val.Data[0].SecurityType,
                                    "PSK": val.Data[0].PSK, "enable": 1, "action": 1
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    }
                } else if (val.Attribute === 'HOTSPOT_2_4') {
                    updateData = {
                        "FrontHaul": {
                            "Hotspot_Configuration": {
                                "two_four": {
                                    "action": 1, "status": 1, "radio_band": "2.4 GHz",
                                    "ssid": val.Data[0].SSID, "security": val.Data[0].WirelessSecurity, "password": val.Data[0].Password,
                                    "vap_details": [{ "status":val.Data[0].Status1 ,"ssid": val.Data[0].SSID1, "security": val.Data[0].WirelessSecurity1, "password": val.Data[0].Password1 }]
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'HOTSPOT_5') {
                    updateData = {
                        "FrontHaul": {
                            "Hotspot_Configuration": {
                                "five": {
                                    "action": 1, "status": 1, "radio_band": "5 GHz",
                                    "vap_details": [{ "status":val.Data[0].Status ,"ssid": val.Data[0].SSID, "security": val.Data[0].WirelessSecurity, "password": val.Data[0].Password }, {"status":val.Data[0].Status1 , "ssid": val.Data[0].SSID1, "security": val.Data[0].WirelessSecurity1, "password": val.Data[0].Password1 }]
                                }
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    }
                } else if (val.Attribute === 'HS_DHCP') {
                    if (val.Data[0].Server == 0) {
                        updateData = {
                            "FrontHaul": {
                                "DHCP": {
                                    "Hotspot": {
                                        "Status": val.Data[0].Status, "StartIpAddr": val.Data[0].StartAddress,
                                        "EndIpAddr": val.Data[0].EndAddress, "Gateway": val.Data[0].Gateway,
                                        "Subnet": val.Data[0].Subnet, "PrimaryDNS": val.Data[0].Primary_DNS,
                                        "SecondaryDNS": val.Data[0].Secondary_DNS
                                    }
                                }
                            },
                            "config_UpdateTime": val.Data[0].config_time
                        }
                    } else {
                        updateData = {
                            "FrontHaul": {
                                "DHCP": {
                                    "Mesh": {
                                        "Status": val.Data[0].Status, "StartIpAddr": val.Data[0].StartAddress,
                                        "EndIpAddr": val.Data[0].EndAddress, "Gateway": val.Data[0].Gateway,
                                        "Subnet": val.Data[0].Subnet, "PrimaryDNS": val.Data[0].Primary_DNS,
                                        "SecondaryDNS": val.Data[0].Secondary_DNS
                                    }
                                }
                            },
                            "config_UpdateTime": val.Data[0].config_time
                        }
                    }
                }
            } else if (val.Action === 'SET_SYSTEM_SETTINGS') {
                updateData = {
                    "System_Settings": {
                        "sysname": val.Data[0].SystemName, "country": val.Data[0].Country.toUpperCase(), "timezone": val.Data[0].Timezone
                    },
                    "config_UpdateTime": val.Data[0].config_time
                }
            } else if (val.Action === 'SET_METER_FRONTHAUL_CONFIGURATION') {
                if (val.Attribute === 'METER_RADIO') {
                    updateData = {
                        "FrontHaul.Radio_Configuration": {
                            "status": 1, "radio_band": val.Data[0].radio_band, "radio_state": 1, "radio_mode": val.Data[0].radio_mode,
                            "chan_bw": val.Data[0].chan_bw, "channel": val.Data[0].channel, "txpower": val.Data[0].txpower, "stream_selection": val.Data[0].stream_selection
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'METER_MESH') {
                    updateData = {
                        "FrontHaul.Mesh_Configuration": {
                            "Primary": {
                                "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].meshID, "securityType": val.Data[0].SecurityType,
                                "PSK": val.Data[0].PSK,"Mac":val.Data[0].MeshMac.toLowerCase(),"DeviceType":val.Data[0].MeshDeviceType,"SerialNumber":val.Data[0].MeshSerialNumber, "enable": 1, "action": 1
                            },
                            "Secondary": {
                                "status": 1, "radio_band": "2.4 GHz", "meshID": val.Data[0].meshID1, "securityType": val.Data[0].SecurityType1,
                                "PSK": val.Data[0].PSK1,"Mac":val.Data[0].MeshMac1.toLowerCase(),"DeviceType":val.Data[0].MeshDeviceType1,"SerialNumber":val.Data[0].MeshSerialNumber1, "enable": 1, "action": 1
                            }
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'METER_HOTSPOT') {
                    updateData = {
                        "FrontHaul.Hotspot_Configuration": {
                            "action": 1, "status": 1, "radio_band": "2.4 GHz",
                            "ssid": val.Data[0].SSID, "security": val.Data[0].WirelessSecurity, "password": val.Data[0].Password
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    };
                } else if (val.Attribute === 'METER_DHCP') {
                    updateData = {
                        "FrontHaul.DHCP": {
                            "Status": val.Data[0].Status, "StartIpAddr": val.Data[0].StartAddress,
                            "EndIpAddr": val.Data[0].EndAddress, "Gateway": val.Data[0].Gateway,
                            "Subnet": val.Data[0].Subnet, "PrimaryDNS": val.Data[0].Primary_DNS,
                            "SecondaryDNS": val.Data[0].Secondary_DNS
                        },
                        "config_UpdateTime": val.Data[0].config_time
                    }
                }
            } else if (val.Action === 'SET_METER_CONFIGURATION') {
                updateData = {
                    "Meter_Configuration": {
                        "uti_ID": val.Data[0].UtilityID, "cir_ID": val.Data[0].CircuitID, "cer_num": val.Data[0].CertificationNumber, "esn": val.Data[0].MeterESN
                    },
                    "config_UpdateTime": val.Data[0].config_time
                }
            }

            if ((val.Attribute === 'RADIO_2_4') || (val.Attribute === 'RADIO_5_L') || (val.Attribute === 'RADIO_5_H')) {

                for (x in updateData.FrontHaul.Radio_Configuration) {
                    if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 7)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11a";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 0)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11b";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 2)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11ng";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 1)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11g";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 3)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11axg";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 5)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11na";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 6)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11ac";
                    else if (updateData.FrontHaul.Radio_Configuration[x].radio_mode == 4)
                        updateData.FrontHaul.Radio_Configuration[x].radio_mode = "11axa";

                    if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 0)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "20MHz";
                    else if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 1)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "40MHz";
                    else if (updateData.FrontHaul.Radio_Configuration[x].chan_bw == 2)
                        updateData.FrontHaul.Radio_Configuration[x].chan_bw = "80MHz";
                    //    "guard_interval"
                    if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 0)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "800ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 1)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "400ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 2)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "1600ns";
                    else if (updateData.FrontHaul.Radio_Configuration[x].guard_interval == 3)
                        updateData.FrontHaul.Radio_Configuration[x].guard_interval = "3200ns";
                    //    "stream_selection"
                    if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 1)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "1x1";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 3)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "2x2";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 7)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "3x3";
                    else if (updateData.FrontHaul.Radio_Configuration[x].stream_selection == 15)
                        updateData.FrontHaul.Radio_Configuration[x].stream_selection = "4x4";

                }
            }
            if ((val.Attribute === 'MESH_2_4') || (val.Attribute === 'MESH_5_L')) {
                for (x in updateData.Mesh_Configuration) {
                    if (updateData.Mesh_Configuration.securityType == 'none')
                        updateData.Mesh_Configuration.securityType = 'Open';
                    else
                        updateData.Mesh_Configuration.securityType = 'SAE';
                    if (updateData.Mesh_Configuration.securityType == 'none')
                        updateData.Mesh_Configuration.securityType = 'Open';
                    else
                        updateData.Mesh_Configuration.securityType = 'SAE';
                }
            }
            if (val.Attribute === 'METER_RADIO') {
                // if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 7)
                //     updateData.FrontHaul.Radio_Configuration.radio_mode = "11a";
                // else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 0)
                //     updateData.FrontHaul.Radio_Configuration.radio_mode = "11b";
                // else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 2)
                //     updateData.FrontHaul.Radio_Configuration.radio_mode = "11ng";
                // else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 1)
                //     updateData.FrontHaul.Radio_Configuration.radio_mode = "11g";
                // else if (updateData.FrontHaul.Radio_Configuration.radio_mode == 5)
                //     updateData.FrontHaul.Radio_Configuration.radio_mode = "11na";

                // if (updateData.FrontHaul.Radio_Configuration.chan_bw == 0)
                //     updateData.FrontHaul.Radio_Configuration.chan_bw = "Auto";
                // else if (updateData.FrontHaul.Radio_Configuration.chan_bw == 1)
                //     updateData.FrontHaul.Radio_Configuration.chan_bw = "20MHz";
                // else if (updateData.FrontHaul.Radio_Configuration.chan_bw == 2)
                //     updateData.FrontHaul.Radio_Configuration.chan_bw = "40MHz";
                // if (updateData.FrontHaul.Radio_Configuration.radio_band == 1)
                //     updateData.FrontHaul.Radio_Configuration.radio_band = "2.4 GHz";
                // else
                //     updateData.FrontHaul.Radio_Configuration.radio_band = "5 GHz";

                // if (updateData.FrontHaul.Radio_Configuration.stream_selection == 1)
                //     updateData.FrontHaul.Radio_Configuration.stream_selection = "1x1";
                // else
                //     updateData.FrontHaul.Radio_Configuration.stream_selection = "2x2";
                if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 7)
                    updateData["FrontHaul.Radio_Configuration"].radio_mode = "11a";
                else if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 0)
                    updateData["FrontHaul.Radio_Configuration"].radio_mode = "11b";
                else if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 2)
                    updateData["FrontHaul.Radio_Configuration"].radio_mode = "11ng";
                else if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 1)
                    updateData["FrontHaul.Radio_Configuration"].radio_mode = "11g";
                else if (updateData["FrontHaul.Radio_Configuration"].radio_mode == 5)
                    updateData["FrontHaul.Radio_Configuration"].radio_mode = "11na";

                if (updateData["FrontHaul.Radio_Configuration"].radio_band == 1)
                    updateData["FrontHaul.Radio_Configuration"].radio_band = "2.4 GHz";
                else if (updateData["FrontHaul.Radio_Configuration"].radio_band == 0)
                    updateData["FrontHaul.Radio_Configuration"].radio_band = "5 GHz";

                if (updateData["FrontHaul.Radio_Configuration"].chan_bw == 0)
                    updateData["FrontHaul.Radio_Configuration"].chan_bw = "Auto";
                else if (updateData["FrontHaul.Radio_Configuration"].chan_bw == 1)
                    updateData["FrontHaul.Radio_Configuration"].chan_bw = "20MHz";
                else if (updateData["FrontHaul.Radio_Configuration"].chan_bw == 2)
                    updateData["FrontHaul.Radio_Configuration"].chan_bw = "40MHz";

                if (updateData["FrontHaul.Radio_Configuration"].stream_selection == 1)
                    updateData["FrontHaul.Radio_Configuration"].stream_selection = "1x1";
                else
                    updateData["FrontHaul.Radio_Configuration"].stream_selection = "2x2";
            } else if (val.Attribute === 'METER_MESH') {
                if (updateData["FrontHaul.Mesh_Configuration"]["Primary"].securityType == 'none')
                    updateData["FrontHaul.Mesh_Configuration"]["Primary"].securityType = 'Open';
                else
                    updateData["FrontHaul.Mesh_Configuration"]["Primary"].securityType = 'SAE';
                if (updateData["FrontHaul.Mesh_Configuration"]["Secondary"].securityType == 'none')
                    updateData["FrontHaul.Mesh_Configuration"]["Secondary"].securityType = 'Open';
                else
                    updateData["FrontHaul.Mesh_Configuration"]["Secondary"].securityType = 'SAE';

            }
            if (val.Action == 'SET_SYSTEM_SETTINGS') {
                if (updateData.System_Settings.timezone == 0)
                    updateData.System_Settings.timezone = 'Asia/Kolkata - GMT+5:30';
                else if (updateData.System_Settings.timezone == 1)
                    updateData.System_Settings.timezone = 'Asia/Tashkent - GMT+5';
                else if (updateData.System_Settings.timezone == 2)
                    updateData.System_Settings.timezone = 'Asia/Manila - GMT+8';
                else if (updateData.System_Settings.timezone == 3)
                    updateData.System_Settings.timezone = 'Africa/Johannesburg - GMT+2';
                else if (updateData.System_Settings.timezone == 4)
                    updateData.System_Settings.timezone = 'America/Tijuana - UTC --8:00/ -7:00';
                else if (updateData.System_Settings.timezone == 5)
                    updateData.System_Settings.timezone = 'America/Hermosillo - UTC -7';
                else if (updateData.System_Settings.timezone == 6)
                    updateData.System_Settings.timezone = 'America/Mazatlan - UTC -7:00 / -6:00';
                else if (updateData.System_Settings.timezone == 7)
                    updateData.System_Settings.timezone = 'America/Mexico_City- UTC -6:00 / -5:00';
                else if (updateData.System_Settings.timezone == 8)
                    updateData.System_Settings.timezone = 'America/Cancun - UTC -5:00';
                else if (updateData.System_Settings.timezone == 9)
                    updateData.System_Settings.timezone = 'Asia/Singapore - GMT+8';
                else if (updateData.System_Settings.timezone == 10)
                    updateData.System_Settings.timezone = 'Europe/Kaliningrad - UTC+02:00';
                else if (updateData.System_Settings.timezone == 11)
                    updateData.System_Settings.timezone = 'Europe/Moscow - UTC+03:00';
                else if (updateData.System_Settings.timezone == 12)
                    updateData.System_Settings.timezone = 'Europe/Samara - UTC+04:00';
                else if (updateData.System_Settings.timezone == 13)
                    updateData.System_Settings.timezone = 'Asia/Yekaterinburg- UTC+05:00';
                else if (updateData.System_Settings.timezone == 14)
                    updateData.System_Settings.timezone = 'Asia/omsk - UTC+06:00';
                else if (updateData.System_Settings.timezone == 15)
                    updateData.System_Settings.timezone = 'Asia/Krasnoyarsk - UTC+07:00';
                else if (updateData.System_Settings.timezone == 16)
                    updateData.System_Settings.timezone = 'Asia/Irkutsk- UTC+08:00';
                else if (updateData.System_Settings.timezone == 17)
                    updateData.System_Settings.timezone = 'Asia/Yakutsk - UTC+09:00';
                else if (updateData.System_Settings.timezone == 18)
                    updateData.System_Settings.timezone = 'Asia/Vladivostok - UTC+10:00';
                else if (updateData.System_Settings.timezone == 19)
                    updateData.System_Settings.timezone = 'Asia/Magadan - UTC+11:00';
                else if (updateData.System_Settings.timezone == 20)
                    updateData.System_Settings.timezone = 'Asia/Kamchatka - UTC+12:00';
                else if (updateData.System_Settings.timezone == 21)
                    updateData.System_Settings.timezone = 'America/Vancouver - UTC -8:00 / -7:00';
                else if (updateData.System_Settings.timezone == 22)
                    updateData.System_Settings.timezone = 'America/Dawson Creek - UTC -7:00';
                else if (updateData.System_Settings.timezone == 23)
                    updateData.System_Settings.timezone = 'America/Edmonton - UTC -7:00 / -6:00';
                else if (updateData.System_Settings.timezone == 24)
                    updateData.System_Settings.timezone = 'America/Regina - UTC -6:00';
                else if (updateData.System_Settings.timezone == 25)
                    updateData.System_Settings.timezone = 'America/Winnipeg - UTC -6:00 / -5:00';
                else if (updateData.System_Settings.timezone == 26)
                    updateData.System_Settings.timezone = 'America/Atikokan - UTC -5:00';
                else if (updateData.System_Settings.timezone == 27)
                    updateData.System_Settings.timezone = 'America/Toronto - UTC -5:00 / -4:00';
                else if (updateData.System_Settings.timezone == 28)
                    updateData.System_Settings.timezone = 'America/Blanc-Sablon - UTC -4:00';
                else if (updateData.System_Settings.timezone == 29)
                    updateData.System_Settings.timezone = 'America/Halifax - UTC -4:00 / -3:00';
                else if (updateData.System_Settings.timezone == 30)
                    updateData.System_Settings.timezone = 'America/St Johns - UTC -3.30 / -2.30';
                else if (updateData.System_Settings.timezone == 31)
                    updateData.System_Settings.timezone = 'Pacific/Honolulu - UTC -10:00';
                else if (updateData.System_Settings.timezone == 32)
                    updateData.System_Settings.timezone = 'America/Anchorage - UTC -9:00 / -8:00';
                else if (updateData.System_Settings.timezone == 33)
                    updateData.System_Settings.timezone = 'America/Los Angeles - UTC -8:00 / -7:00';
                else if (updateData.System_Settings.timezone == 34)
                    updateData.System_Settings.timezone = 'America/Phoenix - UTC -7:00';
                else if (updateData.System_Settings.timezone == 35)
                    updateData.System_Settings.timezone = 'America/Boise - UTC -7.00/-6.00';
                else if (updateData.System_Settings.timezone == 37)
                    updateData.System_Settings.timezone = 'America/Chicago - UTC -6:00 / -5:00';
                else if (updateData.System_Settings.timezone == 38)
                    updateData.System_Settings.timezone = 'America/New York - UTC -5:00 / -4:00';
            }
            if (val.Action == 'SET_HS_FRONTHAUL_CONFIGURATION') {
                if (val.Attribute === 'RADIO_2_4') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Radio_Configuration.two_four": updateData.FrontHaul.Radio_Configuration["two_four"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'RADIO_5_L') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Radio_Configuration.five_low": updateData.FrontHaul.Radio_Configuration["five_low"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'RADIO_5_H') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Radio_Configuration.five_high": updateData.FrontHaul.Radio_Configuration["five_high"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'MESH_2_4') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Mesh_Configuration.two_four": updateData.FrontHaul.Mesh_Configuration["two_four"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'MESH_5_L') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Mesh_Configuration.five_high": updateData.FrontHaul.Mesh_Configuration["five_high"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'HOTSPOT_2_4') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Hotspot_Configuration.two_four": updateData.FrontHaul.Hotspot_Configuration["two_four"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'HOTSPOT_5') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Hotspot_Configuration.five": updateData.FrontHaul.Hotspot_Configuration["five"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute == 'HS_DHCP') {
                    if(val.Data[0].Server == 0){
                    collection.updateOne(regex, { $set: { "FrontHaul.DHCP.Hotspot": updateData.FrontHaul.DHCP["Hotspot"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                }else{
                    collection.updateOne(regex, { $set: { "FrontHaul.DHCP.Mesh": updateData.FrontHaul.DHCP["Mesh"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                }
                }

            } else if (val.Action == 'SET_SYSTEM_SETTINGS') {
                collection.updateOne(regex, { $set: { "System_Settings": updateData["System_Settings"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }

                });
            } else if (val.Action === 'SET_BACKHAUL_CONFIGURATION') {
                if (val.Attribute === 'CELLULAR') {
                    collection.updateOne(regex, { $set: { "BackHaul.Cellular": updateData["BackHaul.Cellular"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });

                } else if (val.Attribute === 'ETHERNET') {
                    collection.updateOne(regex, { $set: { "BackHaul.Ethernet": updateData["BackHaul.Ethernet"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'ADVANCED') {
                    collection.updateOne(regex, { $set: { "BackHaul.Advanced": updateData["BackHaul.Advanced"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                }
            } else if (val.Action === 'SET_METER_FRONTHAUL_CONFIGURATION') {
                if (val.Attribute === 'METER_RADIO') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Radio_Configuration": updateData["FrontHaul.Radio_Configuration"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'METER_MESH') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Mesh_Configuration": updateData["FrontHaul.Mesh_Configuration"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'METER_HOTSPOT') {
                    collection.updateOne(regex, { $set: { "FrontHaul.Hotspot_Configuration": updateData["FrontHaul.Hotspot_Configuration"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Attribute === 'METER_DHCP') {
                    collection.updateOne(regex, { $set: { "FrontHaul.DHCP": updateData["FrontHaul.DHCP"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                } else if (val.Action === 'SET_METER_CONFIGURATION') {
                    collection.updateOne(regex, { $set: { "Meter_Configuration": updateData["Meter_Configuration"], "config_UpdateTime": val.Data[0].config_time } }, function (err, result) {
                        if (err) {
                            return callback(err, null);
                        } else {
                            return callback(null, result);
                        }

                    });
                }
            } else {
                collection.updateOne(regex, { $set: updateData }, function (err, result) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }

                });
            }

        }
    });

};
/**
* @description - Update flag in mongo db.
*
* @param val - Value for setting mongo db
*
* @param key - Key  for condition
*
* @param collectionName - Collection to which to update.
*
* @return Update.
*/

var update_db = function (collectionName, key, val, callback) {
    // create connection to mogodb
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            var collection = dbConn.db.collection(collectionName);
            collection.updateOne(key, val, function (err, res) {
                if (err) {
                    // if (theDb) {
                    //     dbConn.db.close();
                    //     theDb = null;
                    // }
                    return callback(err, null);
                } else {
                    return callback(null, 'updated');
                }

            });
        }
    });

};
/**
* @description - Updating Scheduler Job and Insert Transaction Data.
*
* @input Request from IoT hub
*
* @return callback.
*/
var updateTransdataScheduler = function (input, callback) {
    logger.info('inside the update schedular first MessageID :' + input.TransactionDataResponse.MessageID + " CellId : " + input.TransactionDataResponse.CellID);
    getDb(function (err, dbConn) {
        if (err) {
            logger.info("error updateScheduler : " + err);
            return callback(err, null);
        } else {
            var SchedulerLogscollection = dbConn.db.collection('DELTA_SchedulerLogs');
            var SchedulerFlagscollection = dbConn.db.collection('DELTA_SchedulerFlags');
            var Transactiondata = dbConn.db.collection('DELTA_Transaction_Data');
            var jobsCollection = dbConn.db.collection('DELTA_Jobs');
            updateSchedulerLogs(SchedulerLogscollection, SchedulerFlagscollection, Transactiondata, jobsCollection, input, function (err1, res) {
                if (err1) {
                    logger.info("Error in updateSchedulerLog : " + err1);
                    return callback(err, "Failure");
                } else {
                    if (res == "Data Updated") {
                        logger.info("All logs and job  Updated for transaction data: ");
                        return callback(null, "Success");
                    } else {
                        logger.info("In the failure for schedular logs ");
                        return callback(null, "Failure");
                    }
                }
            });
        }
    });
};

/**
* @description - Updating Scheduler Job and Insert Transaction Data.
*
* @SchedulerLogscollection Request from IoT hub
*
* @SchedulerFlagscollection Request from IoT hub
*
* @Transactiondata Request from IoT hub
*
* @jobsCollection Request from IoT hub
*
* @input Transaction Request
*
* @return callback.
*/
function updateSchedulerLogs(SchedulerLogscollection, SchedulerFlagscollection, Transactiondata, jobsCollection, input, callback) {
    var responseTimeStamp = input.TimeStampResponse;
    SchedulerLogscollection.find({ CellID: input.TransactionDataResponse.CellID, MessageID: input.TransactionDataResponse.MessageID }).sort({ TimeStampRequest: -1 }).limit(1).toArray(function (err, result) {
        logger.info("Result from schedular log : " + JSON.stringify(result));
        if (err) {
            logger.info('<<-- Unable to find SchedulerLog for Cell Id :' + input.TransactionDataResponse.CellID + " Message ID : " + input.TransactionDataResponse.MessageID + " Error -->> " + err);
            callback(err, null);
        } else if (result.length === 0) {
            logger.info('<<-- SchedulerLog length is 0 for Cell Id :' + input.TransactionDataResponse.CellID + " Message ID : " + input.TransactionDataResponse.MessageID + " Error -->> " + err);
            callback("No Device", null);
        } else {
            var lastConnectedMeterCount = 0;
            if (input.TransactionDataResponse.Transformer.NoOfConnectedMeter) {
                lastConnectedMeterCount = input.TransactionDataResponse.Transformer.NoOfConnectedMeter;
            }
            if ((result[0].TimeStampResponse === undefined) || (result[0].TimeStampResponse === null)) {
                SchedulerLogscollection.findAndModify({ _id: result[0]._id }, [], { $set: { TimeStampResponse: new Date(responseTimeStamp), NoOfMeters: lastConnectedMeterCount } }, { remove: false, new: true, upsert: false }, function (err, res) {
                    if (err) {
                        logger.info("<<-- Error in update SchedulerLogscollection Error : -->> " + err);
                        callback(err, null)
                    } else {
                        var result = input.TransactionDataResponse;
                        Transactiondata.insertOne({ result, DBTimestamp: responseTimeStamp }, function (err) {
                            if (err) {
                                logger.info("<<-- Error in transaaction insert Error : -->>" + err);
                                return callback(err, null);
                            } else {
                                logger.info("Transactiondata insertion success proceeding job updation ");
                                SchedulerFlagscollection.updateOne({ DeviceID: res.value.DeviceID }, { $set: { Flag: 0 } }, function (err, output) {
                                    if (err) {
                                        logger.info('<<-- Unable to update SchedulerFlagscollection for DeviceId :' + res.value.DeviceID + " -->> Error : " + err);
                                        callback(err, null)
                                    } else {

                                        jobsCollection.find({
                                            JobName: "Interval Read Job",
                                            JobType: "Transactional Polling Interval",
                                            MessageID: input.TransactionDataResponse.MessageID,
                                            DeviceID: res.value.DeviceID,
                                            Status: "Pending"
                                        }).sort({ "CreatedDateTimestamp": -1 }).limit(1).next(function (err, record) {
                                            if (err) {
                                                logger.info('<<-- Error in jobsCollection find --> Error : ' + err);
                                                callback(err, null)
                                            }
                                            else if (record !== undefined && record != null) {
                                                jobsCollection.updateOne({ JobID: record.JobID }, { $set: { Status: "Completed", EndTime: new Date() } }, function (err, jobsUpdated) {
                                                    if (err) {
                                                        logger.info('<<-- Unable to update jobsCollection for JobId :' + record.JobID + " -->> Error : " + err);
                                                        callback(err, null)
                                                    } else {
                                                        logger.info('Job data updated success JobId : ' + record.JobID);
                                                        callback(null, "Data Updated");
                                                    }
                                                });
                                            } else {
                                                logger.info('job not created or undefined or null DeviceId : ' + res.value.DeviceID);
                                                callback(null, "job not created");
                                            }
                                        });
                                    }
                                });
                            }

                        });
                    }
                });
            } else {
                logger.info('Else No Request Sent');
                callback(null, "No Request Sent");
            }
        }
    });
}
function updateSelfHeal(MeterCollection, result, callback) {
    MeterCollection.find({ MeterID: result.MeterID }).toArray(function (err, res) {
        if (err) {
            callback(err, null);
        } else if (res.length === 0) {
            callback("No Device", null);
        } else {
            if (res[0].self_heal == 1) {
                MeterCollection.updateOne({ MeterID: result.MeterID }, { $set: { HypersproutID: res[0].ParentHS, self_heal: 0 , ParentHS: null } }, function (err, result1) {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, result1);
                    }

                });
            } else {
                callback("No Self Heal Device Found", null);
            }
        }
    });
}



var updateConfigUpoadJobStatus = function (input, callback) {
    getDb(function (err, dbConn) {
        if (err) {
            return callback(err, null);
        } else {
            var jobsCollection = dbConn.db.collection('DELTA_Jobs');
            jobsCollection.find({
                JobName: "configupload Job",
                JobType: "Config UploadMeter",
                MessageID: input.configUploadResponse.MessageID,
                MeterID: input.configUploadResponse.MeterID,
                DeviceType: "Meter",
                CellID: input.configUploadResponse.CellID,
                Status: "Pending"
            }).sort({ "CreatedDateTimestamp": -1 }).limit(1).next(function (err, record) {
                if (err) {
                    console.log('<<-- Error in jobsCollection find --> Error : ' + err);
                    return callback(err, null)
                }
                else if (record !== undefined && record != null) {
                    jobsCollection.updateOne({ JobID: record.JobID }, { $set: { Status: "Completed", EndTime: new Date() } }, function (err, jobsUpdated) {
                        if (err) {
                            console.log('<<-- Unable to update jobsCollection for JobId :' + record.JobID + " -->> Error : " + err);
                            return callback(err, null)
                        } else {
                            let configData = {};
                            configData = record.ConfigData;
                            let FrontHaul = configData.FrontHaul;
                            let Meter_Configuration = configData.Meter_Configuration;
                            let System_Settings = configData.System_Settings;
                            let Bandwidth_Details = configData.Bandwidth_Details;
                            let config_UpdateTime=record.config_time;
                            configCollection = dbConn.db.collection('DELTA_Config');
                            regex = { MeterSerialNumber: new RegExp('^' + record.SerialNumber, 'i') };
                            configCollection.updateOne(regex, { $set: { "FrontHaul": FrontHaul, "Meter_Configuration": Meter_Configuration, "System_Settings": System_Settings, "Bandwidth_Details": Bandwidth_Details,"config_UpdateTime":config_UpdateTime } }, function (err, res) {
                                if (err) {
                                    return callback(err, null);
                                }
                                else if (res.result.nModified === 0) {
                                    return callback(null, true);
                                }
                                else {
                                    console.log('config upload sucess for Meter---------------------->'+record.SerialNumber)
                                    return callback(null, "Data Updated");
                                }
                            });
                        }
                    });
                } else {
                    console.log('job not created or undefined or null DeviceId : ' + input.configUploadResponse.CellID);
                    return callback(null, "job not Updated");
                }
            });
        }
    });
};
var updateConfigUpoadHSjobStatus = function (input, callback) {
    getDb(function (err, dbConn) {
        if (err) {
            console.log("error updateScheduler : " + err);
            return callback(err, null);
        } else {
            var jobsCollection = dbConn.db.collection('DELTA_Jobs');
            jobsCollection.find({
                JobName: "configupload Job",
                JobType: "Config UploadHS",
                MessageID: input.configUploadResponse.MessageID,
                CellID: input.configUploadResponse.CellID,
                Status: "Pending"
            }).sort({ "CreatedDateTimestamp": -1 }).limit(1).next(function (err, record) {
                console.log(record)
                if (err) {
                    console.log('<<-- Error in jobsCollection find --> Error : ' + err);
                    return callback(err, null)
                }
                else if (record !== undefined && record != null) {
                    console.log('reached inside the record find' + record.JobID)
                    jobsCollection.updateOne({ JobID: record.JobID }, { $set: { Status: "Completed", EndTime: new Date() } }, function (err, jobsUpdated) {
                        if (err) {
                            console.log('<<-- Unable to update jobsCollection for JobId :' + record.JobID + " -->> Error : " + err);
                            return callback(err, null)
                        } else {
                            console.log('Job data updated success JobId : ' + record.JobID);
                            let configData = {};
                            configData = record.ConfigData;
                            let FrontHaul = configData.FrontHaul;
                            let BackHaul = configData.BackHaul;
                            let System_Settings = configData.System_Settings;
                            let Bandwidth_Details = configData.Bandwidth_Details;
                            let Cloud_Connectivity_Settings = configData.Cloud_Connectivity_Settings;
                            let config_UpdateTime=record.config_time;
                            configCollection = dbConn.db.collection('DELTA_Config');
                            regex = { "HypersproutSerialNumber": new RegExp("^" + (record.SerialNumber).toLowerCase, "i"), 'DeviceType': { $in: ['hh', 'hs'] } };
                            configCollection.updateOne(regex, { $set: { "FrontHaul": FrontHaul, "BackHaul": BackHaul, "Cloud_Connectivity_Settings": Cloud_Connectivity_Settings, "System_Settings": System_Settings, "Bandwidth_Details": Bandwidth_Details,"config_UpdateTime":config_UpdateTime} }, function (err, res) {
                                if (err) {
                                    return callback(err, null);
                                }
                                else if (res.result.nModified === 0) {
                                    return callback(null, true);
                                }
                                else {
                                    console.log('config upload sucess for HS----->'+record.SerialNumber)
                                    return callback(null, "Data Updated");
                                }
                            });
                        }
                    });
                } else {
                    console.log('job not created or undefined or null DeviceId : ' + input.configUploadResponse.CellID);
                    return callback(null, "job not Updated");
                }
            });
        }
    });
};
module.exports = {
    insert_db: insert_db,
    getID_db: getID_db,
    update_db: update_db,
    updateTransdataScheduler: updateTransdataScheduler,
    updateConfig: updateConfig,
    updateDeviceConfig: updateDeviceConfig,
    updateSelfHeal: updateSelfHeal,
    updateConfigUpoadHSjobStatus:updateConfigUpoadHSjobStatus,
    updateConfigUpoadJobStatus:updateConfigUpoadJobStatus,
    getDb : getDb
}
