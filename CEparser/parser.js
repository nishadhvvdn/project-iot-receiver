
var express = require('express');
var router = express.Router();
const util = require('util');
var fs = require('fs');
var BitArray = require('node-bitarray');
var dateFormat = require('dateformat');
var dbInsert = require('../db/dbInsert');
var configPara = require('../config/config.js');
var dbInsert123 = require('../routes/decisionMaker.js');
var postManagerial = require('../routes/postManagerial');

var chkAction = false;
var chkAttribute = false;
var rawData = '';

var Rev = '';
var Count = '';
var MessageID = '';
var CountryCode = '';
var RegionCode = '';
var CellID = '';
var MeterID = '';
var Action = '';
var action1 = "";
var Attribute = '';
var Attribute1 = '';
var ActualData = '';
var ArrJson = [];
var objJson = {};
var DataType = "";
var bits = '';
var ack = 0;
var startAttrIndex = 0;
var endAttrIndex = 0;
var Meter_Num = 0;
var objTransformerData = {};
var objMeter = {};
var arrMeter = [];

/**
* @description - Function to Get UTC TimeStamp.
*
* @param Nil
*
* @return Return the UTC TimeStamp.
*/
function getUTC() {
    return new Date();
}


/**
* @description - Parse and convert the bytes received from
*                device into proper data.
*
* @param hexx  - Hex data Received from Device for each field
*                as per the protocol structure
*
* @param dataType  - Datatype of the hex data.
*
* @return converted value.
*/
function convertHexa(hexx, dataType, len) {
    var hex = hexx.toString();//force conversion
    var str = '';
    try {
        if (dataType === 'string') {
            for (var i = 0; i < hex.length; i += 2)
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        else if (dataType === 'float') {
            // var arrFloat = [];
            // var o = 0;
            // for (var g = 0; g < hex.length; g += 2) {
            //     arrFloat[o] = '0x' + hex.substr(g, 2);
            //     o++;
            // }
            // str = (new DataView((new Uint8Array(arrFloat)).buffer)).getFloat32(0, true);
            // str = Number(str.toFixed(6));
            str = (Buffer(hex,'hex').readFloatBE(0)).toFixed(6);
        }
        else if (dataType === 'timestamp') {
            for (var k = 0; k < hex.length; k += 2)
                str += String.fromCharCode(parseInt(hex.substr(k, 2), 16));

            return new Date(str.replace(' ', 'T'));
        }
        else if (dataType === 'char') {
            if (hex.length === 2) {
                str = parseInt(hex, 16);
            }
            else {
                var j = 0;
                for (var l = 0; l < hex.length; l += 2) {
                    str += parseInt(hex.substr(l, 2), 16);
                    if (j <= hex.length) {
                        str += '.';
                        j += 3;
                    }
                }
            }
        }
        else if (dataType === 'mchar') {
            str = hex.replace(/(.{2})/g, "$1:").slice(0, -1);
        } else if (dataType === 'ipint') {
            var c = 0;
            for (var n = 0; n < hex.length; n += 2) {
                c++;
                hex1 = hex.substr(n, 2);
                str += parseInt(hex1, 16);
                if (c != 4) str += '.'
            }
        } else if (dataType === 'vint') {
            var d = 0;
            for (var n = 0; n < hex.length; n += 2) {
                d++;
                hex1 = hex.substr(n, 2);
                str += parseInt(hex1, 16);
                if (d != (hex.length / 2)) str += '.'
            }
        } else if (dataType === 'passtring') {
            for (var i = 0; i < hex.length; i += 2) {
                if (hex.substr(i, 2) != '00')
                    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
        } else {
            if (len === 1) {
                str = parseInt(hex, 16);
            }
            else if (len === 2) {
                var arrInt = [];
                var q = 0;
                for (var m = 0; m < hex.length; m += 2) {
                    arrInt[q] = '0x' + hex.substr(m, 2);
                    q++;
                }
                str = (new DataView((new Uint8Array(arrInt)).buffer)).getUint16(0, true);
            }
            else if (len === 4) {
                var arrInt1 = [];
                var p = 0;
                for (var n = 0; n < hex.length; n += 2) {
                    arrInt1[p] = '0x' + hex.substr(n, 2);
                    p++;
                }
                str = (new DataView((new Uint8Array(arrInt1)).buffer)).getUint32(0, true);
            } else if (len === 8) {
                // if (hex.length % 2) { hex = '0' + hex; }
                // var bn = BigInt('0x' + hex);
                // var d = bn.toString(10);
                // str = d;
                var i, j, digits = [0], carry;
                for (i = 0; i < hex.length; i += 1) {
                    carry = parseInt(hex.charAt(i), 16);
                    for (j = 0; j < digits.length; j += 1) {
                        digits[j] = digits[j] * 16 + carry;
                        carry = digits[j] / 10 | 0;
                        digits[j] %= 10;
                    }
                    while (carry > 0) {
                        digits.push(carry % 10);
                        carry = carry / 10 | 0;
                    }
                }
                str = digits.reverse().join('');
            }

        }
        return str;
    }
    catch (err) {
        dbInsert.insert_db({ RawData: rawData, Type: "invalidPacket", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
            if (err) {
                return callback(err);
            } else {
                postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                    if (err)
                        return callback(new Error("error: ", objJson), null);
                });
            }
        });
    }
}

/**
* @description - Get the Action Name as per the data received.
*
* @param obj - Protocol structure
*
* @param Actn - Action field value.
*
* @return Action Name.
*/
function getAction(obj, Actn) {
    for (var key in obj.Actions) {
        if (obj.Actions[key] === Actn) {
            Actn = key;
            break;
        }
    }
    return Actn;
}


/**
* @description - Get the Action Name as per the data received.
*
* @param obj - Protocol structure
*
* @param Actn - Action field value.
*
* @param Attr - Attribute field value.
*
* @return Attribute Name.
*/
function getAtrribute(obj, Actn, Attr) {
    for (var key in obj.Actions) {
        if (obj.Actions[key] === Actn) {
            chkAction = true;
            Actn = key;
            for (var key1 in obj.ActionAttribute[key]) {
                if (obj.ActionAttribute[key][key1] === Attr) {
                    Attr = key1;
                    chkAttribute = true;
                    break;
                }
            }
        }
        if (chkAction && chkAttribute) {
            chkAction = false;
            chkAttribute = false;
            break;
        }
    }
    return Attr;
}

/**
* @description - Get the Meter Device Status for Transactional Data.
*
* @param deviceMStatus - Device Status value receive in Transactional/EventAlarm Data packet
*
* @param eventMType - Event Type - Alarms/Events.
*
* @return Nil
*/
function getMeterDeviceStatus(deviceMStatus, eventMType) {
    if (deviceMStatus === 8 || deviceMStatus === 9) {
        objMeter['Phase'] = 3;
        objMeter['Status'] = (deviceMStatus === 8) ? 'CommonFault' : 'Disconnected';
    }
    else if (deviceMStatus === 10) {
        if (eventMType === 'Alarm')
            objMeter['Status'] = 'No Events/Alarms';
        else
            objMeter['Status'] = 'Data not requested by Admin';
    }
}

/**
* @description - Get the Meter Device Status for Transactional Data.
*
* @param protoObj - Protocol Structure
*
* @param MeterAttribute - Meter Attribute for the Transactional/EventAlarm Data received
*
* @return Meter's Transactional Data Status Code.
*/
function getMeterStatusCode(protoObj, MeterAttribute) {

    DataType = protoObj[Action][MeterAttribute].DeviceID.Type;
    startAttrIndex = endAttrIndex;
    endAttrIndex = (2 * Number(protoObj[Action][MeterAttribute].DeviceID.Length)) + Number(startAttrIndex);
    objMeter['DeviceID'] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(protoObj[Action][MeterAttribute].DeviceID.Length));

    DataType = protoObj[Action][MeterAttribute].StatusMeter.Type;
    startAttrIndex = endAttrIndex;
    endAttrIndex = (2 * Number(protoObj[Action][MeterAttribute].StatusMeter.Length)) + Number(startAttrIndex);
    var meterStatus = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(protoObj[Action][MeterAttribute].StatusMeter.Length));
    return meterStatus;
}

/**
* @description - Get the Transformer Device Status for Transactional Data.
*
* @param deviceStatus - Device Status value receive in Transactional/EventAlarm Data packet
*
* @param eventType - Event Type - Alarms/Events.
*
* @return Nil
*/
function getTraDeviceStatus(deviceStatus, eventType) {
    if (deviceStatus === 8 || deviceStatus === 9) {
        objTransformerData['Phase'] = 3;
        objTransformerData['StatusTransformer'] = (deviceStatus === 8) ? 'CommonFault' : 'Disconnected';
    }
    else if (deviceStatus === 10) {
        if (eventType === 'Alarm')
            objTransformerData['StatusTransformer'] = 'No Events/Alarms';
        else
            objTransformerData['StatusTransformer'] = 'NotRelavant';
    } else if (deviceStatus === 13) {
        if (eventType === 'Alarm')
            objTransformerData['StatusTransformer'] = 'BatteryOperated';
        else
            objTransformerData['StatusTransformer'] = 'BatteryOperated';
    }

}

/**
* @description - Get the Transformer Device Status for Transactional Data.
*
* @param protocolobj - Protocol Structure
*
* @param rawData - Data received from Device.
*
* @param startIndexNum - Start index of Transformer Device Status from whole data
*
* @param endIndexNum - End index of Transformer Device Status from whole data
*
* @return Transformer's Transactional Data Status Code.
*/
function getTransformerStatusCode(protocolobj, rawData, startIndexNum, endIndexNum) {
    endIndexNum = Count * 2;
    ActualData = rawData.substring(startIndexNum, endIndexNum + startIndexNum);
    endAttrIndex = (2 * Number(protocolobj[Action][Attribute].NoOfMeter.Length)) + Number(startAttrIndex);
    DataType = protocolobj[Action][Attribute].NoOfMeter.Type;
    Meter_Num = ActualData.substring(startAttrIndex, endAttrIndex);
    Meter_Num = convertHexa(Meter_Num, DataType, Number(protocolobj[Action][Attribute].NoOfMeter.Length));

    startAttrIndex = endAttrIndex;
    endAttrIndex = (2 * Number(protocolobj[Action][Attribute].StatusTransformer.Length)) + Number(startAttrIndex);
    DataType = protocolobj[Action][Attribute].StatusTransformer.Type;
    var storeStatus = ActualData.substring(startAttrIndex, endAttrIndex);
    storeStatus = convertHexa(storeStatus, DataType, Number(protocolobj[Action][Attribute].StatusTransformer.Length));

    return storeStatus;
}

/**
* @description - Get the Action Name while parsing the data.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Action Name, unless wrong data is there.
*/
function getActionName(obj, data, callback) {
    var startIndex = 0;
    for (var key in obj.FrameFormat) {
        if ((obj.FrameFormat).hasOwnProperty(key)) {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            if (key === 'Action') {
                Action = data.substring(startIndex, endIndex);
                bits = BitArray.fromHex(Action);
                if (bits.toJSON()[7] === 1) {// Check MSB is 1 or 0 [0: Request, 1: Response]
                    FirstBit = Action.substring(0, 1);
                    console.log("Thi sis the first bit---------------->");
                    console.log(FirstBit)
                    Action = Action.substring(1, 2);
                    if (FirstBit == 8)
                        Action = '0' + Action;
                    else if (FirstBit == 9)
                        Action = '1' + Action;
                    else if (FirstBit == 'a')
                        Action = '2' + Action;
                    else if (FirstBit == 'b')
                        Action = '3' + Action;
                }
                console.log(Action);
                console.log('This is the action name--->');
                Action = getAction(obj, Action);



                return callback(null, Action);
            }
            startIndex = endIndex;
        }
    }
    return callback(new Error("Action not found"), null);
}

/**
* @description - Get values of Rev, country, region, cellid, deviceid, Action, Atrribute.
*
* @param startIndex - Start Index of the particular field in the data.
*
* @param endIndex - End Index of the particular field in the data.
*
* @param key - Field for which the value is required, e.g- Rev or cellid or action etc.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Nil
*/
function getCommValues(startIndex, endIndex, key, obj, data) {

    DataType = "";
    DataType = obj.FrameFormat[key].Type;
    switch (key) {
        case 'Rev':
            Rev = data.substring(startIndex, endIndex);
            Rev = convertHexa(Rev, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = Rev;
            break;

        case 'Count':
            Count = data.substring(startIndex, endIndex);
            Count = convertHexa(Count, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = Count;
            break;

        case 'MessageID':
            MessageID = data.substring(startIndex, endIndex);
            MessageID = convertHexa(MessageID, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = MessageID;
            break;

        case 'CountryCode':
            CountryCode = data.substring(startIndex, endIndex);
            CountryCode = convertHexa(CountryCode, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = CountryCode;
            break;

        case 'RegionCode':
            RegionCode = data.substring(startIndex, endIndex);
            RegionCode = convertHexa(RegionCode, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = RegionCode;
            break;

        case 'CellID':
            CellID = data.substring(startIndex, endIndex);
            CellID = convertHexa(CellID, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = CellID;
            break;

        case 'MeterID':
            MeterID = data.substring(startIndex, endIndex);
            MeterID = convertHexa(MeterID, DataType, Number(obj.FrameFormat[key].Length));
            objJson[key] = MeterID;
            break;

        case 'Action':
            Action = data.substring(startIndex, endIndex);
            bits = BitArray.fromHex(Action);
            if (bits.toJSON()[7] === 1) {// Check MSB is 1 or 0 [0: Request, 1: Response]
                objJson['Type'] = 'Response';
                FirstBit = Action.substring(0, 1);
                Action = Action.substring(1, 2);
                if (FirstBit == 8)
                    Action = '0' + Action;
                else if (FirstBit == 9)
                    Action = '1' + Action;
                else if (FirstBit == 'a')
                    Action = '2' + Action;
                else if (FirstBit == 'b')
                    Action = '3' + Action;
            }
            else {
                objJson['Type'] = 'Request';
            }
            action1 = Action;
            Action = getAction(obj, action1);
            objJson[key] = Action;
            break;

        case 'Attribute':
            Attribute = data.substring(startIndex, endIndex);
            bits = '';
            bits = BitArray.fromHex(Attribute);

            if (bits.toJSON()[7] === 1) {// Check MSB is 1 or 0 [0: Request, 1: Response]
                ack = 1;
                FirstBit = Attribute.substring(0, 1);
                Attribute = Attribute.substring(1, 2);
                if (FirstBit == 8)
                    Attribute = '0' + Attribute;
                else if (FirstBit == 9)
                    Attribute = '1' + Attribute;
                else if (FirstBit == 'a')
                    Attribute = '2' + Attribute;
                else if (FirstBit == 'b')
                    Attribute = '3' + Attribute;
            }
            else {
                ack = 0;
            }
            Attribute = getAtrribute(obj, action1, Attribute);
            objJson[key] = Attribute;
            break;

        default:
            if (!key) {
                dbInsert.insert_db({ RawData: data, Type: "No header Found", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                    if (err) {
                        return 'Failed to Insert DB';
                    }
                });
            }
            break;
    }
}

/**
* @description - Function to convert byte_json for De-Registeration Meters.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for Meter Transactional Data
*/

function convertJson_Deregister(obj, data, callback) {
    var startIndex = 0;
    var startAttrIndex = 0;
    var objMeter = {};
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'COLLECTOR_DATA_UPLOAD'; // The action and attribute should be collector becasue same protocol stutrure is maintained 
            Attribute = 'COMBINED_TRANSACTIONAL_DATA';
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var endAttrIndex = (2 * Number(obj[Action][Attribute].NoOfMeter.Length)) + Number(startAttrIndex);
            var DataType = obj[Action][Attribute].NoOfMeter.Type;
            var Meter_Num = ActualData.substring(startAttrIndex, endAttrIndex);
            Meter_Num = convertHexa(Meter_Num, DataType, Number(obj[Action][Attribute].NoOfMeter.Length));
            objJson['NoOfMeter'] = Meter_Num;
            /*************************************** Meter Data Starts ***************************************************************/

            var arrMeter = [];
            for (var k = 0; k < Meter_Num; k++) {

                DataType = obj[Action][Attribute].DeviceID.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].DeviceID.Length)) + Number(startAttrIndex);
                var meter_ID = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].DeviceID.Length));
                objMeter['DeviceID'] = meter_ID;

                DataType = obj[Action][Attribute].StatusMeter.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].StatusMeter.Length)) + Number(startAttrIndex);
                var storeMStatus = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].StatusMeter.Length));

                if (storeMStatus === 1 || storeMStatus === 2) {
                    objMeter['Status'] = (storeMStatus === 1) ? 'Success' : 'Failure';
                    continue;
                }
                else if (storeMStatus === 3 || storeMStatus === 4) {
                    objMeter['Status'] = (storeMStatus === 3) ? 'MeterNotRegistered' : 'MeterDoesntExist';
                    continue;
                }
                else if (storeMStatus === 5) {
                    objMeter['Status'] = 'MeshBreakage';
                    continue;
                }
                else {
                    dbInsert.insert_db({ RawData: data, Type: "InvalidMeterStatus", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                                if (err) {
                                    callback(err);
                                }
                            });
                        }
                    });
                    return callback(new Error("De-Register Invalid Meter Status"), null);
                }
            }
            if (Meter_Num > 0) {
                arrMeter.push(objMeter);
                objMeter = {};
                objJson['meters'] = arrMeter;
            }

            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};


/**
* @description - Function to convert byte_json for De-Registeration Meters.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for Meter Transactional Data
*/

function convertJson_DLNodePing(obj, data, callback) {
    var startIndex = 0;
    var startAttrIndex = 0;
    var objDL = {};
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'NODE_PING';
            Attribute = 'DELTALINK_PING';
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
            var MasterType = obj[Action][Attribute].STATUSCODE.Type;
            var MasterStatus = ActualData.substring(startAttrIndex, endAttrIndex);
            MasterStatus = convertHexa(MasterStatus, MasterType, Number(obj[Action][Attribute].STATUSCODE.Length));
            objJson['MasterStatus'] = MasterStatus;
            startAttrIndex = endAttrIndex;
            var endAttrIndex = (2 * Number(obj[Action][Attribute].NoofDL.Length)) + Number(startAttrIndex);
            var DataType = obj[Action][Attribute].NoofDL.Type;
            var DL_Num = ActualData.substring(startAttrIndex, endAttrIndex);
            DL_Num = convertHexa(DL_Num, DataType, Number(obj[Action][Attribute].NoofDL.Length));
            objJson['NoOfDL'] = DL_Num;
            /*************************************** Slave Data Starts ***************************************************************/

            var arrDL = [];
            for (var k = 0; k < DL_Num; k++) {

                DataType = obj[Action][Attribute].SERIAL_NO.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].SERIAL_NO.Length)) + Number(startAttrIndex);
                var meter_ID = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].SERIAL_NO.Length));
                objDL['SerialNo'] = meter_ID;
                DataType = obj[Action][Attribute].STATUSCODE.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
                var storeMStatus = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].STATUSCODE.Length));
                if (storeMStatus === 0 || storeMStatus === 1) {
                    objDL['Status'] = (storeMStatus === 1) ? 'Success' : 'Failure';
                    continue;
                } else {
                    dbInsert.insert_db({ RawData: data, Type: "InvalidDLStatus", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                                if (err) {
                                    callback(err);
                                }
                            });
                        }
                    });
                    return callback(new Error("Invalid DL Status"), null);
                }
            }
            if (DL_Num > 0) {
                arrDL.push(objDL);
                objDL = {};
                objJson['DL'] = arrDL;
            }

            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

function convertJson_MeshScan(obj, data, callback) {
    var startIndex = 0;
    var startAttrIndex = 0;
    var objDL = {};
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'METER_FRONTHAUL';
            Attribute = 'METER_SCAN';
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var endAttrIndex = (2 * Number(obj[Action][Attribute].radio_band.Length)) + Number(startAttrIndex);
            var MasterType = obj[Action][Attribute].radio_band.Type;
            var MasterStatus = ActualData.substring(startAttrIndex, endAttrIndex);
            MasterStatus = convertHexa(MasterStatus, MasterType, Number(obj[Action][Attribute].radio_band.Length));
            objJson['radio_band'] = "2.4GHz";
            startAttrIndex = endAttrIndex;
            var endAttrIndex = (2 * Number(obj[Action][Attribute].scanCount.Length)) + Number(startAttrIndex);
            var DataType = obj[Action][Attribute].scanCount.Type;
            var M_Num = ActualData.substring(startAttrIndex, endAttrIndex);
            M_Num = convertHexa(M_Num, DataType, Number(obj[Action][Attribute].scanCount.Length));
            objJson['scanCount'] = M_Num;
            /*************************************** Slave Data Starts ***************************************************************/

            var arrDL = [];
            for (var k = 0; k < M_Num; k++) {
                DataType = obj[Action][Attribute].mesh_id.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].mesh_id.Length)) + Number(startAttrIndex);
                var mesh_id = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].mesh_id.Length));
                mesh_id = mesh_id.replace(/\0/g, '');
                objDL['mesh_id'] = mesh_id;
                DataType = obj[Action][Attribute].mac_addr.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].mac_addr.Length)) + Number(startAttrIndex);
                var mac_addr = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].mac_addr.Length));
                mac_addr = mac_addr.replace(/\0/g, '');
                objDL['mac_addr'] = mac_addr;
                DataType = obj[Action][Attribute].device.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].device.Length)) + Number(startAttrIndex);
                var device = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].device.Length));
                device = device.replace(/\0/g, '');
                objDL['device'] = device;
                DataType = obj[Action][Attribute].encryption.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].encryption.Length)) + Number(startAttrIndex);
                var encryption = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].encryption.Length));
                encryption = encryption.replace(/\0/g, '');
                objDL['encryption'] = encryption;
                DataType = obj[Action][Attribute].rssi.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].rssi.Length)) + Number(startAttrIndex);
                //var rssi = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].rssi.Length));
                var rssi = ActualData.substring(startAttrIndex, endAttrIndex);
                rssi = rssi.match(/[a-fA-F0-9]{2}/g).reverse().join('')
                if (rssi.length % 2 != 0) {
                    rssi = "0" + rssi;
                }
                var num = parseInt(rssi, 16);
                var maxVal = Math.pow(2, rssi.length / 2 * 8);
                if (num > maxVal / 2 - 1) {
                    num = num - maxVal
                }
                rssi = num;
                objDL['rssi'] = rssi;
                DataType = obj[Action][Attribute].discovery_score.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].discovery_score.Length)) + Number(startAttrIndex);
                var discovery_score = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].discovery_score.Length));
                objDL['discovery_score'] = discovery_score;
                DataType = obj[Action][Attribute].self_heal.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].self_heal.Length)) + Number(startAttrIndex);
                var self_heal = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].self_heal.Length));
                objDL['self_heal'] = self_heal;
                DataType = obj[Action][Attribute].channel.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].channel.Length)) + Number(startAttrIndex);
                var channel = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].channel.Length));
                objDL['channel'] = channel;
                DataType = obj[Action][Attribute].serialNumber.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].serialNumber.Length)) + Number(startAttrIndex);
                var serialNumber = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].serialNumber.Length));
                serialNumber = serialNumber.replace(/\0/g, '');
                objDL['serialNumber'] = serialNumber;
                if (M_Num > 0) {
                    arrDL.push(objDL);
                    objDL = {};
                    objJson['scanList'] = arrDL;
                }
            }
            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};


function convertJson_CarrierList(obj, data, callback) {
    var startIndex = 0;
    var startAttrIndex = 0;
    var objDL = {};
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'BACKHAUL';
            Attribute = 'CARRIER_LIST';
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var endAttrIndex = (2 * Number(obj[Action][Attribute].carrier_status.Length)) + Number(startAttrIndex);
            var Carrier_StatusType = obj[Action][Attribute].carrier_status.Type;
            var Carrier_Status = ActualData.substring(startAttrIndex, endAttrIndex);
            Carrier_Status = convertHexa(Carrier_Status, Carrier_StatusType, Number(obj[Action][Attribute].carrier_status.Length));
            objJson['CarrierStatus'] = Carrier_Status;
            startAttrIndex = endAttrIndex;
            var endAttrIndex = (2 * Number(obj[Action][Attribute].no_of_carriers.Length)) + Number(startAttrIndex);
            var DataType = obj[Action][Attribute].no_of_carriers.Type;
            var Carrier_Num = ActualData.substring(startAttrIndex, endAttrIndex);
            Carrier_Num = convertHexa(Carrier_Num, DataType, Number(obj[Action][Attribute].no_of_carriers.Length));
            objJson['NoOfCarrier'] = Carrier_Num;
            /*************************************** Slave Data Starts ***************************************************************/

            var arrCarrier = [];
            for (var k = 0; k < Carrier_Num; k++) {
                DataType1 = obj[Action][Attribute].carrier.Type;
                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][Attribute].carrier.Length)) + Number(startAttrIndex);
                var carrier_ID = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType1, Number(obj[Action][Attribute].carrier.Length));
                carrier_ID = carrier_ID.replace(/\0/g, '');
                arrCarrier.push(carrier_ID);
            }
            if (Carrier_Num > 0) {
                objJson['Carrier'] = arrCarrier;
            }

            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};


/**
* @description - Function to convert byte_json for Managerial Data.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for Managerial Data
*/
function convertJson_MagerialData(obj, data, callback) {
    rawData = data;
    DataType = '';
    var startIndex = 0;
    var endIndex = 0;
    bits = '';
    objJson = {};
    var arrData = [];
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            if (ack === 0) {
                if (Count === 2) {
                    objJson['Status'] = 'Success';
                }
                else {
                    var objData = {};
                    endIndex = Count * 2;
                    ActualData = data.substring(startIndex, endIndex + startIndex);
                    var startAttrIndex = 0;
                    for (var key1 in obj[Action][Attribute]) {
                        var endAttrIndex = (2 * Number(obj[Action][Attribute][key1].Length)) + Number(startAttrIndex);
                        DataType = obj[Action][Attribute][key1].Type;
                        var Datatodecode = ActualData.substring(startAttrIndex, endAttrIndex);
                        if (key1 == 'config_time')
                            Datatodecode = Datatodecode.match(/[a-fA-F0-9]{2}/g).reverse().join('')
                        objData[key1] = convertHexa(Datatodecode, DataType, Number(obj[Action][Attribute][key1].Length));
                        startAttrIndex = endAttrIndex;
                    }
                    arrData.push(objData);
                    objJson['Data'] = arrData;
                }
                Action = '';
                Attribute = '';
                startIndex = endIndex + startIndex;
            }
            else if (ack === 1) {
                objJson['Status'] = 'Failure';
            }
        }
        else {
            endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

function convertJson_configUpload(obj, data, callback) {
    console.log('Inside the convert JSON');
    // console.log(data);
    rawData = data;
    DataType = '';
    var startIndex = 0;
    var endIndex = 0;
    bits = '';
    objJson = {};
    var arrData = [];
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            console.log("this is the count---------------->" + Count)
            if (ack === 0) {
                console.log('in  data 1');
                if (Count === 27) {
                    objJson['Status'] = 'Success';
                }
                else {
                    console.log('in 2 error case');
                    objJson['Status'] = 'Failure';
                }
                Action = '';
                Attribute = '';
                startIndex = endIndex + startIndex;
            }
            else if (ack === 1) {
                var objData = {};
                endIndex = Count * 2;
                ActualData = data.substring(startIndex, endIndex + startIndex);
               // console.log(ActualData)
                var startAttrIndex = 0;
                for (var key1 in obj[Action][Attribute]) {
                    // console.log(key1);
                    // console.log(obj[Action][Attribute])
                    // var endAttrIndex = (2 * Number(obj[Action][Attribute][key1].Length)) + Number(startAttrIndex);
                    // console.log('in 6');
                    // DataType = obj[Action][Attribute][key1].Type;
                    endIndexNum = Count * 2;
                    ActualData = rawData.substring(startIndex, endIndex + startIndex);
                    startAttrIndex = 0;
                    endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
                    DataType = obj[Action][Attribute].STATUSCODE.Type;
                    statusCode = ActualData.substring(startAttrIndex, endAttrIndex);
                    statusCode = convertHexa(statusCode, DataType, Number(obj[Action][Attribute].STATUSCODE.Length));
                    // console.log('This is sthe status code');
                    // console.log(statusCode);
                    if (statusCode === 1) {
                        objJson['STATUSCODE'] = "Invalid Attribute";
                    } else if (statusCode === 2) {
                        objJson['STATUSCODE'] = "Invalid CRC";
                    } else if (statusCode === 3) {
                        objJson['STATUSCODE'] = "Invalid Payload";
                    } else if (statusCode === 4) {
                        objJson['STATUSCODE'] = "Invalid DeviceID";
                    } else if (statusCode === 5) {
                        objJson['STATUSCODE'] = "Device Rebooted";
                    } else if (statusCode === 6) {
                        objJson['STATUSCODE'] = "Invalid Configuration";
                    } else if (statusCode === 7) {
                        objJson['STATUSCODE'] = "Update Failed in Device";
                    } else {
                        objJson['STATUSCODE'] = "Invalid Status";
                    }
                }
                arrData.push(objData);
                objJson['Data'] = arrData;
                objJson['Status'] = 'Failure';
            }

        }
        else {
            endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }

    //console.log(objJson);
    return callback(null, objJson);
};

// function convertJson_GetConfig(obj, data, callback) {

// }

function covertJsonConfigManagement(obj, data, callback) {
    var startIndex = 0;
    var endIndex = 0;
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            if (ack === 0) {
                if (Count === 2) {
                    objJson['Status'] = 'Success';
                }
            } else {
                objJson['Status'] = 'Failure';
                Action = 'COLLECTOR_FIRMWARE_UPGRADE'; // The action and attribute should be collector becasue same protocol stutrure is maintained 
                Attribute = 'START_FIRMWARE_UPDATE';
                endIndexNum = Count * 2;
                ActualData = rawData.substring(startIndex, endIndex + startIndex);
                startAttrIndex = 0;
                endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
                DataType = obj[Action][Attribute].STATUSCODE.Type;
                statusCode = ActualData.substring(startAttrIndex, endAttrIndex);
                statusCode = convertHexa(statusCode, DataType, Number(obj[Action][Attribute].STATUSCODE.Length));
                if (statusCode === 1) {
                    objJson['STATUSCODE'] = "Invalid Attribute";
                } else if (statusCode === 2) {
                    objJson['STATUSCODE'] = "Invalid CRC";
                } else if (statusCode === 3) {
                    objJson['STATUSCODE'] = "Invalid Payload";
                } else if (statusCode === 4) {
                    objJson['STATUSCODE'] = "Invalid DeviceID";
                } else if (statusCode === 5) {
                    objJson['STATUSCODE'] = "Device Rebooted";
                } else if (statusCode === 6) {
                    objJson['STATUSCODE'] = "Invalid Configuration";
                } else if (statusCode === 7) {
                    objJson['STATUSCODE'] = "Update Failed in Device";
                } else {
                    objJson['STATUSCODE'] = "Invalid Status";
                }

            }

        } else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
}


function covertJsonFirmwareManagement(obj, data, callback) {
    var startIndex = 0;
    var endIndex = 0;
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'COLLECTOR_FIRMWARE_UPGRADE'; // The action and attribute should be collector becasue same protocol stutrure is maintained 
            Attribute = 'START_FIRMWARE_UPDATE';
            endIndexNum = Count * 2;
            ActualData = rawData.substring(startIndex, endIndex + startIndex);
            startAttrIndex = 0;
            endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
            DataType = obj[Action][Attribute].STATUSCODE.Type;
            statusCode = ActualData.substring(startAttrIndex, endAttrIndex);
            statusCode = convertHexa(statusCode, DataType, Number(obj[Action][Attribute].STATUSCODE.Length));
            if (statusCode === 7) {
                objJson['Status'] = "Download in Progress";
            } else if (statusCode === 8) {
                objJson['Status'] = "Download Failed";
            } else if (statusCode === 9) {
                objJson['Status'] = "Download Success";
            } else if (statusCode === 10) {
                objJson['Status'] = "Upgrade Success";
            } else if (statusCode === 11) {
                objJson['Status'] = "Upgrade Failed";
            } else if (statusCode === 12) {
                objJson['Status'] = "Upgrade Required";
            } else if (statusCode === 13) {
                objJson['Status'] = "Upgrade not Required";
            } else if (statusCode === 14) {
                objJson['Status'] = "Invalid Device ID";
            } else if (statusCode === 15) {
                objJson['Status'] = "MD5Sum Valid";
            } else if (statusCode === 16) {
                objJson['Status'] = "MD5Sum Invalid";
            } else if (statusCode === 17) {
                objJson['Status'] = "Firmware Upgrade in Progress";
            } else if (statusCode === 18) {
                objJson['Status'] = "Device Rebooting";
            } else if (statusCode === 20) {
                objJson['Status'] = "Invalid File";
            } else {
                objJson['Status'] = "Invalid Status";
            }

        } else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
}


function convertJsonMeterFirmwareManagement(obj, data, action, callback) {
    let startIndex = 0;
    let endIndex = 0;
    rawData = data;
    let Action1
    let Action;
    let Attribute;
    let objBind = {}
    objJson = {};
    var FirmwareVersion;
    let startAttrIndex;
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action1 = 'COLLECTOR_REGISTERATION'
            if (action === 'METER_FIRMWARE_UPGRADE') {
                Action = 'METER_FIRMWARE_UPGRADE'; // The action and attribute should be collector becasue same protocol stutrure is maintained 
            } else {
                Action = 'METERCARD_FIRMWARE_UPGRADE';
            }
            Attribute = 'START_FIRMWARE_UPDATE';
            endIndexNum = Count * 2;
            ActualData = rawData.substring(startIndex, endIndexNum + startIndex);
            startAttrIndex = 0;
            endAttrIndex = (2 * Number(obj[Action1][Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
            DataType = obj[Action1][Action][Attribute].STATUSCODE.Type;
            statusCode = ActualData.substring(startAttrIndex, endAttrIndex);
            statusCode = convertHexa(statusCode, DataType, Number(obj[Action1][Action][Attribute].STATUSCODE.Length));

            startAttrIndex = endAttrIndex;
            endAttrIndex = (2 * Number(obj[Action1][Action][Attribute].FirmwareVersion.Length)) + Number(startAttrIndex);
            DataType = obj[Action1][Action][Attribute].FirmwareVersion.Type;
            FirmwareVersion = ActualData.substring(startAttrIndex, endAttrIndex);
            FirmwareVersion = convertHexa(FirmwareVersion, DataType, Number(obj[Action1][Action][Attribute].FirmwareVersion.Length));
            objBind['FirmwareVersion'] = FirmwareVersion.replace(/\0/g, '');
            switch (statusCode) {
                case 7: objBind['Status'] = "Download in Progress";
                    break;
                case 8: objBind['Status'] = "Download Failed";
                    break;
                case 9: objBind['Status'] = "Download Success";
                    break;
                case 10: objBind['Status'] = "Upgrade Success";
                    break;
                case 11: objBind['Status'] = "Upgrade Failed"
                    break;
                case 12: objBind['Status'] = "Upgrade Required";
                    break;
                case 13: objBind['Status'] = "Upgrade not Required";
                    break;
                case 14: objBind['Status'] = "Invalide Device ID";
                    break;
                case 15: objBind['Status'] = "MD5Sum Valid";
                    break;
                case 16: objBind['Status'] = "MD5Sum Invalid";
                    break;
                case 17: objBind['Status'] = "Firmware Upgrade in Prgress";
                    break;
                case 18: objBind['Status'] = "Device Rebooting";
                    break;
                case 20: objBind['Status'] = "Invalid File";
                    break;
                default: objBind['Status'] = "Invalid Status";
            }
           
            objJson['Data'] = [{
                Status: objBind['Status'],
                FirmwareVersion: objBind['FirmwareVersion']
            }]


        } else {
            endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
}



function covertJsonDeviceLog(obj, data, callback) {
    var startIndex = 0;
    var endIndex = 0;
    rawData = data;
    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'LOGS'; // The action and attribute should be collector becasue same protocol stutrure is maintained 
            Attribute = 'HS_FETCH';
            endIndexNum = Count * 2;
            ActualData = rawData.substring(startIndex, endIndex + startIndex);
            startAttrIndex = 0;
            endAttrIndex = (2 * Number(obj[Action][Attribute].STATUSCODE.Length)) + Number(startAttrIndex);
            DataType = obj[Action][Attribute].STATUSCODE.Type;
            statusCode = ActualData.substring(startAttrIndex, endAttrIndex);
            statusCode = convertHexa(statusCode, DataType, Number(obj[Action][Attribute].STATUSCODE.Length));
            if (statusCode === 1) {
                objJson['Status'] = "Success";
            } else if (statusCode === 2) {
                objJson['Status'] = "Failure";
            } else if (statusCode === 3) {
                objJson['Status'] = "In Progress";
            } else {
                objJson['Status'] = "Invalid Status";
            }

        } else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
}

/**
* @description - Function to convert byte_json for MAC ACL.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for complete Transactional Data
*/

function covertJsonMacAclManagement(obj, data, callback) {
    var startIndex = 0;
    var endIndex = 0;
    rawData = data;

    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'MAC_ACL'; // The action and attribute should be MAC_ACL becasue same protocol stutrure is maintained
            Attribute = 'URL_MAC_ACL';
            endIndexNum = Count * 2;
            ActualData = rawData.substring(startIndex, endIndex + startIndex);
            startAttrIndex = 0;
            endAttrIndex = (2 * Number(obj[Action][Attribute].MAC_ACL_TYPE.Length)) + Number(startAttrIndex);
            DataType = obj[Action][Attribute].MAC_ACL_TYPE.Type;
            type = ActualData.substring(startAttrIndex, endAttrIndex);
            type = convertHexa(type, DataType, Number(obj[Action][Attribute].MAC_ACL_TYPE.Length));
            if (type === 1 || type === 2 || type === 3 || type === 6 || type === 7 || type === 8 || type === 9 || type == 10 || type == 11) {
                objJson['MAC_ACL_TYPE'] = type;
            }
            if (type === 1)
                Attribute = 'DV_URL_MAC_ACL';
            else if (type === 2)
                Attribute = 'HS_URL_MAC_ACL';
            else if (type === 3)
                Attribute = 'ALL_ URL_MAC_ACL';
            else if (type === 6)
                Attribute = 'MC_DV_URL_MAC_ACL';
            else if (type === 7)
                Attribute = 'MC_HS_URL_MAC_ACL'
            else if (type === 8)
                Attribute = 'MC_ALL_URL_MAC_ACL';
            else if (type === 9)
                Attribute = 'DL_DV_URL_MAC_ACL';
            else if (type === 10)
                Attribute = 'DL_HS_URL_MAC_ACL'
            else if (type === 11)
                Attribute = 'DL_ALL_URL_MAC_ACL'
        } else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }

    return callback(null, objJson);
}
/**
* @description - Function to convert byte_json for Tranactional Data.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for complete Transactional Data
*/
function convertJson_TransactionData(obj, data, callback) {
    var cntOfConnectedMeter = 0;
    var startIndex = 0;
    startAttrIndex = 0;
    endAttrIndex = 0;
    objTransformerData = {};
    objMeter = {};
    rawData = data;
    objJson = {};
    var AttributeNew = '';
    for (var key in obj.FrameFormat) {

        if (key === 'Data') {
            if (Attribute === 'ON_DEMAND_METER_DATA' || Attribute === 'ON_DEMAND_HS_DATA') {
                AttributeNew = Attribute;
                Attribute = 'COMBINED_TRANSACTIONAL_DATA';
            }

            /*************************************** Transformer Data Starts ***************************************************************/

            var storeStatus = getTransformerStatusCode(obj, data, startIndex, endIndex);
            var storeAttribute = Attribute;
            var AttributeCommon = storeAttribute + '_COMMONPARAMETERS';
            objTransformerData['NoOfMeter'] = Meter_Num;
            if (storeStatus === 1) {
                objTransformerData['Phase'] = 1;
                objTransformerData['StatusTransformer'] = 'Connected';

                Attribute = storeAttribute + '_1PHASE_Transformer';
            } else if (storeStatus === 2 || storeStatus === 3) {
                objTransformerData['Phase'] = 1;
                objTransformerData['StatusTransformer'] = (storeStatus === 2) ? 'CommonFault' : 'Disconnected';
            }
            /*else if (storeStatus === 4){ // Currently Phase2 is not required....
               objTransformerData['Phase'] = 2;
               objTransformerData['StatusTransformer'] = 'Connected';
 
               Attribute = storeAttribute + '_1PHASE_Transformer';
            }
            else if (storeStatus === 5 || storeStatus == 6){
                objTransformerData['Phase'] = 2;                        
                objTransformerData['StatusTransformer'] = (storeStatus == 5 ) ? 'CommonFault' : 'Disconnected';
            }*/
            else if (storeStatus === 7) { // Currently Phase2 is not required....
                objTransformerData['Phase'] = 3;
                objTransformerData['StatusTransformer'] = 'Connected';

                Attribute = storeAttribute + '_3PHASE_Transformer';
            }
            else if (storeStatus === 8 || storeStatus === 9 || storeStatus === 10) {
                getTraDeviceStatus(storeStatus, 'Transaction');
            } else if (storeStatus === 11) {
                objTransformerData['Phase'] = 1;
                objTransformerData['StatusTransformer'] = '1PHASE_UART_FAULT';
            } else if (storeStatus === 12) {
                objTransformerData['Phase'] = 3;
                objTransformerData['StatusTransformer'] = '3PHASE_UART_FAULT';
            }
            else if (storeStatus === 13) {
                objTransformerData['Phase'] = 3;
                objTransformerData['StatusTransformer'] = 'BatteryOperated';
                Attribute = storeAttribute + '_3PHASE_Transformer';
            }
            else {
                dbInsert.insert_db({
                    RawData: data
                    , Type: "InvalidTransformerStatus",
                    DBTimestamp: new Date()
                }, configPara.invalidPacket, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                            if (err)
                                callback(err);
                        });
                    }
                });
                return callback(new Error("Invalid Transformer Status"), null);
            }

            // For 1 and 3 phase is connected store the Transformer details
            if (storeStatus === 1 || storeStatus === 7 || storeStatus === 13) {
                for (var key1 in obj[Action][Attribute]) // For Transformer
                {
                    if ((obj[Action][Attribute]).hasOwnProperty(key1)) {
                        DataType = obj[Action][Attribute][key1].Type;
                        startAttrIndex = endAttrIndex;
                        endAttrIndex = (2 * Number(obj[Action][Attribute][key1].Length)) + Number(startAttrIndex);
                        objTransformerData[key1] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute][key1].Length));
                    }
                }
                for (var key2 in obj[Action][AttributeCommon]) // For Transformer Common Parameters
                {
                    if ((obj[Action][AttributeCommon]).hasOwnProperty(key2)) {
                        DataType = obj[Action][AttributeCommon][key2].Type;
                        startAttrIndex = endAttrIndex;
                        endAttrIndex = (2 * Number(obj[Action][AttributeCommon][key2].Length)) + Number(startAttrIndex);
                        objTransformerData[key2] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][AttributeCommon][key2].Length));
                    }
                }
            }

            /*************************************** Transformer Data Ends ***************************************************************/

            /*************************************** Meter Data Starts ***************************************************************/

            arrMeter = [];
            var Meter_Status = [1, 2, 3, 7, 8, 9, 10.11, 12];
            for (var k = 0; k < Meter_Num; k++) {

                var storeMStatus = getMeterStatusCode(obj, storeAttribute);

                if (storeMStatus === 1) {
                    objMeter['Phase'] = 1;
                    objMeter['Status'] = 'Connected';
                    cntOfConnectedMeter++;
                    Attribute1 = storeAttribute + '_1PHASE_Meter';
                } else if (storeMStatus === 2 || storeMStatus === 3) {
                    objMeter['Phase'] = 1;
                    objMeter['Status'] = (storeMStatus === 2) ? 'CommonFault' : 'Disconnected';
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                }
                /*else if (storeMStatus == 4){ // Currently Phase2 is not required....
                    objMeter['Phase'] = 2;
                    objMeter['Status'] = 'Connected';
                    cntOfConnectedMeter++;
                    Attribute1 = storeAttribute + '_2PHASE_Meter';
                }
                else if (storeMStatus == 5 || storeMStatus == 6){
                    objMeter['Phase'] = 2;                        
                    objMeter['Status'] = (storeMStatus == 5 ) ? 'CommonFault' : 'Disconnected';
                    arrMeter.push(objMeter);
                    continue;
                }*/
                else if (storeMStatus === 7) { // Currently Phase2 is not required....
                    objMeter['Phase'] = 3;
                    objMeter['Status'] = 'Connected';
                    cntOfConnectedMeter++;
                    Attribute1 = storeAttribute + '_3PHASE_Meter';
                }
                else if (storeMStatus === 8 || storeMStatus === 9 || storeMStatus === 10) {
                    getMeterDeviceStatus(storeMStatus, 'Transaction');
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                } else if (storeMStatus === 11) {
                    objMeter['Phase'] = 1;
                    objMeter['Status'] = '1PHASE_UART_FAULT';
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                } else if (storeMStatus === 12) {
                    objMeter['Phase'] = 3;
                    objMeter['Status'] = '3PHASE_UART_FAULT';
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                } else if (Meter_Status.includes(storeMStatus) == false) {
                    objMeter['Phase'] = 3;
                    objMeter['Status'] = 'CommonFault';
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                }
                else {
                    dbInsert.insert_db({ RawData: data, Type: "InvalidMeterStatus", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                                if (err) {
                                    callback(err);
                                }
                            });
                        }
                    });
                    return callback(new Error("Invalid Meter Status"), null);
                }

                if (storeMStatus === 1 || storeMStatus === 7) {
                    for (var key3 in obj[Action][Attribute1]) {
                        if ((obj[Action][Attribute1]).hasOwnProperty(key3)) {
                            if (((key3 == 'SelfHeal') || (key3 == 'ParentHS')) && AttributeNew == 'ON_DEMAND_METER_DATA') {
                                continue;
                            } else {
                                DataType = obj[Action][Attribute1][key3].Type;
                                startAttrIndex = endAttrIndex;
                                endAttrIndex = (2 * Number(obj[Action][Attribute1][key3].Length)) + Number(startAttrIndex);
                                objMeter[key3] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute1][key3].Length));
                            }
                        }
                    }
                    for (var key4 in obj[Action][AttributeCommon]) {
                        if ((obj[Action][AttributeCommon]).hasOwnProperty(key4)) {
                            DataType = obj[Action][AttributeCommon][key4].Type;
                            startAttrIndex = endAttrIndex;
                            endAttrIndex = (2 * Number(obj[Action][AttributeCommon][key4].Length)) + Number(startAttrIndex);
                            objMeter[key4] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][AttributeCommon][key4].Length));
                        }
                    }
                    arrMeter.push(objMeter);
                    objMeter = {};
                }
            }

            objTransformerData['NoOfConnectedMeter'] = cntOfConnectedMeter;
            objJson['Transformer'] = objTransformerData;
            objTransformerData = {};
            if (Meter_Num > 0) {
                objJson['meters'] = arrMeter;
            }

            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

/**
* @description - Function to convert byte_json for Events/Alarms Data.
*
* @param obj - Protocol Structure
*
* @param data - Data received from Device.
*
* @return Return the JSON for Events/Alarms Data
*/
function convertJson_EventsAlarms(obj, data, callback) {
    rawData = data;
    var startIndex = 0;
    startAttrIndex = 0;
    endAttrIndex = 0;
    objTransformerData = {};
    objMeter = {};
    var bits = '';
    var alarmData = '';
    var startAlarmIndex = 0;
    objJson = {};
    for (var key in obj.FrameFormat) {

        if (key === 'Data') {

            /*************************************** Transformer Events/Alarm Starts ***************************************************************/

            var storeStatus = getTransformerStatusCode(obj, data, startIndex, endIndex);
            var storeAttribute = Attribute;
            var totLength = Number(obj[Action][Attribute].AlarmEventLength.Length);
            Attribute = storeAttribute + '_TRANSFORMER';
            objTransformerData['NoOfMeter'] = Meter_Num;

            if (storeStatus === 1) {
                objTransformerData['Phase'] = 1;
                objTransformerData['StatusTransformer'] = 'Connected';
            } else if (storeStatus === 2 || storeStatus === 3) {
                objTransformerData['Phase'] = 1;
                objTransformerData['StatusTransformer'] = (storeStatus === 2) ? 'CommonFault' : 'Disconnected';
            }
            /*else if (storeStatus === 4){ // Currently Phase2 is not required....
               objTransformerData['Phase'] = 2;
               objTransformerData['StatusTransformer'] = 'Connected';
            }
            else if (storeStatus == 5 || storeStatus == 6){
                objTransformerData['Phase'] = 2;                        
                objTransformerData['StatusTransformer'] = (storeStatus == 5 ) ? 'CommonFault' : 'Disconnected';
            }*/
            else if (storeStatus === 7) { // Currently Phase2 is not required....
                objTransformerData['Phase'] = 3;
                objTransformerData['StatusTransformer'] = 'Connected';
            }
            else if (storeStatus === 8 || storeStatus === 9 || storeStatus === 10 || storeStatus === 13) {
                getTraDeviceStatus(storeStatus, 'Alarm');
            }
            else {
                dbInsert.insert_db({ RawData: data, Type: "InvalidTransformerStatus", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                            if (err)
                                return callback(new Error('Response from webservice for Invalid Alarm Transformer Status'), null);
                        });
                    }
                });
                return callback(new Error("Invalid Transformer Status"), null);
            }
            // For 1 and 3 phase is connected store the Transformer Events/Alarm
            if (storeStatus === 1 || storeStatus === 7 || storeStatus === 13) {

                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * Number(obj[Action][storeAttribute].ReadTimestamp.Length)) + Number(startAttrIndex);
                DataType = obj[Action][storeAttribute].ReadTimestamp.Type;
                var ReadAlarmTransformerTime = ActualData.substring(startAttrIndex, endAttrIndex);
                objTransformerData['ReadTimestamp'] = convertHexa(ReadAlarmTransformerTime, DataType, Number(obj[Action][storeAttribute].ReadTimestamp.Length));

                startAttrIndex = endAttrIndex;
                endAttrIndex = (2 * totLength) + Number(startAttrIndex);
                alarmData = ActualData.substring(startAttrIndex, endAttrIndex);
                var chkBit = 0;
                startAlarmIndex = 0;
                for (var m = 0; m < Object.keys(obj[Action][Attribute]).length;) // For Transformer
                {
                    bits = BitArray.fromHex(alarmData.substr(startAlarmIndex, 2));
                    for (var n = 0; n < 8; n++) {
                        if (bits.toJSON()[chkBit] == null && (Object.keys(obj[Action][Attribute])[m]) != null)
                            objTransformerData[Object.keys(obj[Action][Attribute])[m]] = 0;
                        else if ((Object.keys(obj[Action][Attribute])[m]) != null)
                            objTransformerData[Object.keys(obj[Action][Attribute])[m]] = bits.toJSON()[chkBit];

                        chkBit++;
                        m++;
                    }
                    startAlarmIndex += 2;
                    chkBit = 0;
                }
            }
            objJson['Transformer'] = objTransformerData;
            objTransformerData = {};
            /*************************************** Transformer Events/Alarm Ends ***************************************************************/

            /*************************************** Meter Events/Alarm Starts ***************************************************************/
            var meterPhase = 0;

            arrMeter = [];
            for (var k = 0; k < Meter_Num; k++) {

                var storeMStatus = getMeterStatusCode(obj, storeAttribute);
                Attribute1 = storeAttribute + '_METER';
                if (storeMStatus === 1) {
                    objMeter['Phase'] = 1;
                    objMeter['Status'] = 'Connected';
                } else if (storeMStatus === 2 || storeMStatus === 3) {
                    objMeter['Phase'] = 1;
                    objMeter['Status'] = (storeMStatus === 2) ? 'CommonFault' : 'Disconnected';
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                }
                /*else if (storeMStatus === 4){ // Currently Phase2 is not required....
                    objMeter['Phase'] = 2;
                    objMeter['Status'] = 'Connected';
                    Attribute1 = storeAttribute + '_2PHASE_Meter';
                }
                else if (storeMStatus === 5 || storeMStatus === 6){
                    objMeter['Phase'] = 2;                        
                    objMeter['Status'] = (storeMStatus === 5 ) ? 'CommonFault' : 'Disconnected';
                    arrMeter.push(objMeter);
                    continue;
                }*/
                else if (storeMStatus === 7) { // Currently Phase2 is not required....
                    objMeter['Phase'] = 3;
                    objMeter['Status'] = 'Connected';
                }
                else if (storeMStatus === 8 || storeMStatus === 9 || storeMStatus === 10) {
                    getMeterDeviceStatus(storeMStatus, 'Alarm');
                    arrMeter.push(objMeter);
                    objMeter = {};
                    continue;
                }
                else {
                    dbInsert.insert_db({ RawData: data, Type: "InvalidMeterStatus", DBTimestamp: new Date() }, configPara.invalidPacket, function (err) {
                        if (err) {
                            callback(err);
                        } else {
                            postManagerial.postManagerialData(objJson, configPara.invalidPacketweb, function (err) {
                                if (err)
                                    callback(new Error('Response from webservice for Invalid Alarm Meter Status'), null);
                            });
                        }
                    });
                    return callback(new Error("Invalid Meter Status"), null);
                }

                if (storeMStatus === 1 || storeMStatus === 7) {
                    startAttrIndex = endAttrIndex;
                    endAttrIndex = (2 * Number(obj[Action][storeAttribute].ReadTimestamp.Length)) + Number(startAttrIndex);
                    DataType = obj[Action][storeAttribute].ReadTimestamp.Type;
                    var ReadAlarmMeterTime = ActualData.substring(startAttrIndex, endAttrIndex);
                    objMeter['ReadTimestamp'] = convertHexa(ReadAlarmMeterTime, DataType, Number(obj[Action][storeAttribute].ReadTimestamp.Length));

                    startAttrIndex = endAttrIndex;
                    endAttrIndex = (2 * totLength) + Number(startAttrIndex);
                    alarmData = ActualData.substring(startAttrIndex, endAttrIndex);
                    chkBit = 0;
                    startAlarmIndex = 0;
                    for (var a = 0; a < Object.keys(obj[Action][Attribute1]).length;) // For Meter
                    {
                        bits = BitArray.fromHex(alarmData.substr(startAlarmIndex, 2));
                        for (var b = 0; b < 8; b++) {
                            if (bits.toJSON()[chkBit] == null && (Object.keys(obj[Action][Attribute1])[a]) != null)
                                objMeter[Object.keys(obj[Action][Attribute1])[a]] = 0;
                            else if ((Object.keys(obj[Action][Attribute1])[a]) != null)
                                objMeter[Object.keys(obj[Action][Attribute1])[a]] = bits.toJSON()[chkBit];

                            chkBit++;
                            a++;
                        }
                        startAlarmIndex += 2;
                        chkBit = 0;
                    }
                    arrMeter.push(objMeter);
                    objMeter = {};
                }
            }
            if (Meter_Num > 0) {
                objJson['meters'] = arrMeter;
            }
            /*************************************** Meter Events/Alarm Ends ***************************************************************/
        }
        else {
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

function convertJson_DhcpData(obj, data, callback) {
    rawData = data;
    DataType = '';
    var startIndex = 0;
    var endIndex = 0;
    bits = '';
    objJson = {};
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            Action = 'DHCP_CONFIG';
            Attribute = 'DHCP_CONFIG';
            var objData = {};
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var startAttrIndex = 0;
            // for (var key1 in obj[Action][Attribute]) {
            var endAttrIndex = (2 * Number(obj[Action][Attribute].Ip.Length)) + Number(startAttrIndex);
            DataType = obj[Action][Attribute].Ip.Type;
            objJson['Ip'] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute].Ip.Length));
            startAttrIndex = endAttrIndex;
            startIndex = endIndex + startIndex;
        }
        else {
            endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

function convertJson_DeltalinkStatus(obj, data, callback) {
    rawData = data;
    DataType = '';
    var startIndex = 0;
    var endIndex = 0;
    bits = '';
    objJson = {};
    var arrData = [];
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {

            endIndex = Count * 2;
            ActualData = data.substring(startIndex, endIndex + startIndex);
            var startAttrIndex = 0;
            for (var key1 in obj[Action][Attribute]) {
                var endAttrIndex = (2 * Number(obj[Action][Attribute][key1].Length)) + Number(startAttrIndex);
                DataType = obj[Action][Attribute][key1].Type;
                objJson[key1] = convertHexa(ActualData.substring(startAttrIndex, endAttrIndex), DataType, Number(obj[Action][Attribute][key1].Length));
                startAttrIndex = endAttrIndex;
            }

            Action = '';
            Attribute = '';
            startIndex = endIndex + startIndex;

        }
        else {
            endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    return callback(null, objJson);
};

function convertJson_DataConsumption(obj, data, callback) {
    try {
        var startIndex = 0;
        var startAttrIndex = 0;
        rawData = data;

        objJson = {};
        for (var key in obj.FrameFormat) {
            if (key === 'Data') {
                Action = 'DATA_CONSUMPTION';
                Attribute = 'DATA_CONSUMPTION';
                endIndex = Count * 2;
                ActualData = data.substring(startIndex, endIndex + startIndex);
                var endAttrIndex = (2 * Number(obj[Action][Attribute].TimeStamp.Length)) + Number(startAttrIndex);
                var TimeStampType = obj[Action][Attribute].TimeStamp.Type;
                var TimeStamp = ActualData.substring(startAttrIndex, endAttrIndex);
                TimeStamp = convertHexa(TimeStamp, TimeStampType, Number(obj[Action][Attribute].TimeStamp.Length));
                objJson['TimeStamp'] = TimeStamp;

                startAttrIndex = endAttrIndex;
                var endAttrIndex = (2 * Number(obj[Action][Attribute].DataRoute.Length)) + Number(startAttrIndex);
                var DataType = obj[Action][Attribute].DataRoute.Type;
                var DataRoute = ActualData.substring(startAttrIndex, endAttrIndex);
                DataRoute = convertHexa(DataRoute, DataType, Number(obj[Action][Attribute].DataRoute.Length));
                objJson['DataRoute'] = DataRoute;

                startAttrIndex = endAttrIndex;
                var endAttrIndex = (2 * Number(obj[Action][Attribute].NoOfDevice.Length)) + Number(startAttrIndex);
                var DataType = obj[Action][Attribute].NoOfDevice.Type;
                var NoOfDevice = ActualData.substring(startAttrIndex, endAttrIndex);
                NoOfDevice = convertHexa(NoOfDevice, DataType, Number(obj[Action][Attribute].NoOfDevice.Length));
                objJson['NoOfDevice'] = NoOfDevice;

                startAttrIndex = endAttrIndex;
                var endAttrIndex = (2 * Number(obj[Action][Attribute].DataType.Length)) + Number(startAttrIndex);
                var DataTypee = obj[Action][Attribute].DataType.Type;
                var DataType = ActualData.substring(startAttrIndex, endAttrIndex);
                DataType = convertHexa(DataType, DataTypee, Number(obj[Action][Attribute].DataType.Length));
                objJson['DataType'] = DataType;


                if (DataType == 1) { // For System
                    let deviceArr = [];
                    for (var i = 0; i < NoOfDevice; i++) {
                        let deviceObj = {};
                        for (var j in obj[Action]['DATA_CONSUMPTION_SYSTEM']) {

                            startAttrIndex = endAttrIndex;
                            var endAttrIndex = (2 * Number(obj[Action]['DATA_CONSUMPTION_SYSTEM'][j].Length)) + Number(startAttrIndex);
                            var DataType = obj[Action]['DATA_CONSUMPTION_SYSTEM'][j].Type;
                            var dataConsumption = ActualData.substring(startAttrIndex, endAttrIndex);
                            dataConsumption = convertHexa(dataConsumption, DataType, Number(obj[Action]['DATA_CONSUMPTION_SYSTEM'][j].Length));
                            deviceObj[j] = dataConsumption;

                        }

                        deviceArr.push(deviceObj);
                        if (i == NoOfDevice - 1) {
                            objJson['DeviceArr'] = deviceArr;
                        }
                    }
                } else {  // For User
                    //adding data consumption details per device dynamically
                    let deviceArr = [];
                    for (var i = 0; i < NoOfDevice; i++) {
                        var deviceObj = {};
                        for (var j in obj[Action][Attribute]) {
                            if (j != 'TimeStamp' && j != 'NoOfDevice' && j != 'DataRoute' && j != 'DataType') {
                                if (j == 'DeviceType') {
                                    startAttrIndex = endAttrIndex;
                                    var endAttrIndex = (2 * Number(obj[Action][Attribute][j].Length)) + Number(startAttrIndex);
                                    var DataType = obj[Action][Attribute][j].Type;
                                    var dataConsumption = ActualData.substring(startAttrIndex, endAttrIndex);
                                    dataConsumption = convertHexa(dataConsumption, DataType, Number(obj[Action][Attribute][j].Length));
                                    deviceObj[j] = dataConsumption;

                                    if (dataConsumption == 3) {

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].MACID.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].MACID.Type;
                                        var MACID = ActualData.substring(startAttrIndex, endAttrIndex);
                                        MACID = convertHexa(MACID, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].MACID.Length));
                                        deviceObj['MACID'] = MACID;

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].DataUpload.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].DataUpload.Type;
                                        var DataUpload = ActualData.substring(startAttrIndex, endAttrIndex);
                                        DataUpload = convertHexa(DataUpload, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].DataUpload.Length));
                                        deviceObj['DataUpload'] = DataUpload;

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].DataDownload.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].DataDownload.Type;
                                        var DataDownload = ActualData.substring(startAttrIndex, endAttrIndex);
                                        DataDownload = convertHexa(DataDownload, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].DataDownload.Length));
                                        deviceObj['DataDownload'] = DataDownload;

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].Total.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].Total.Type;
                                        var Total = ActualData.substring(startAttrIndex, endAttrIndex);
                                        Total = convertHexa(Total, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].Total.Length));
                                        deviceObj['Total'] = Total;

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].NetworkLatency.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].NetworkLatency.Type;
                                        var NetworkLatency = ActualData.substring(startAttrIndex, endAttrIndex);
                                        NetworkLatency = convertHexa(NetworkLatency, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].NetworkLatency.Length));
                                        deviceObj['NetworkLatency'] = NetworkLatency;

                                        startAttrIndex = endAttrIndex;
                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'].NoOfClients.Length)) + Number(startAttrIndex);
                                        var DataType = obj[Action]['DELTALINK_CLIENTS'].NoOfClients.Type;
                                        var NoOfClients = ActualData.substring(startAttrIndex, endAttrIndex);
                                        NoOfClients = convertHexa(NoOfClients, DataType, Number(obj[Action]['DELTALINK_CLIENTS'].NoOfClients.Length));
                                        deviceObj['NoOfClients'] = NoOfClients;

                                        var deviceArr2 = [];
                                        if (NoOfClients) {
                                            for (var i2 = 0; i2 < NoOfClients; i2++) {
                                                var deviceObj2 = {};
                                                for (var j2 in obj[Action]['DELTALINK_CLIENTS']) {

                                                    if (j2 != 'MACID' && j2 != 'DataUpload' && j2 != 'DataDownload' && j2 != 'Total' && j2 != 'NetworkLatency' && j2 != 'NoOfClients') {
                                                        startAttrIndex = endAttrIndex;
                                                        var endAttrIndex = (2 * Number(obj[Action]['DELTALINK_CLIENTS'][j2].Length)) + Number(startAttrIndex);
                                                        var DataType = obj[Action]['DELTALINK_CLIENTS'][j2].Type;
                                                        var dataConsumption = ActualData.substring(startAttrIndex, endAttrIndex);
                                                        dataConsumption = convertHexa(dataConsumption, DataType, Number(obj[Action]['DELTALINK_CLIENTS'][j2].Length));
                                                        deviceObj2[j2] = dataConsumption;
                                                    }
                                                }
                                                deviceArr2.push(deviceObj2);
                                                if (i2 == NoOfClients - 1) {
                                                    deviceObj['ClientsArr'] = deviceArr2;
                                                }
                                            }
                                        } else {
                                            deviceObj['ClientsArr'] = deviceArr2;
                                        }
                                        break;

                                    }

                                } else {

                                    startAttrIndex = endAttrIndex;
                                    var endAttrIndex = (2 * Number(obj[Action][Attribute][j].Length)) + Number(startAttrIndex);
                                    var DataType = obj[Action][Attribute][j].Type;
                                    var dataConsumption = ActualData.substring(startAttrIndex, endAttrIndex);
                                    dataConsumption = convertHexa(dataConsumption, DataType, Number(obj[Action][Attribute][j].Length));
                                    deviceObj[j] = dataConsumption;
                                }
                            }
                        }
                        deviceArr.push(deviceObj);
                        if (i == NoOfDevice - 1) {
                            objJson['DeviceArr'] = deviceArr;
                        }
                    }
                }
            }
            else {
                var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
                getCommValues(startIndex, endIndex, key, obj, data);
                startIndex = endIndex;
            }
        }
        return callback(null, objJson);
    } catch (e) {
        return callback(e, null);
    }
}

function convertJson_CoilUploadData(obj, data, callback) {
    var cntOfConnectedMeter = 0;
    var startIndex = 0;
    startAttrIndex = 0;
    endAttrIndex = 0;
    objTransformerData = {};
    objMeter = {};
    rawData = data;
    objJson = {};
    var AttributeNew = '';
    let arrData = [];
    // console.log(typeof obj , data)
    for (var key in obj.FrameFormat) {
        if (key === 'Data') {
            var objData = {};
            endIndex = Count * 2;
            ActualData = data.substring(startIndex, data.length-endIndex );
            var startAttrIndex = 0;
            for (var key1 in obj[Action][Attribute]) {
                var endAttrIndex = (2 * Number(obj[Action][Attribute][key1].Length)) + Number(startAttrIndex);
                DataType = obj[Action][Attribute][key1].Type;
                var Datatodecode = ActualData.substring(startAttrIndex, endAttrIndex);
                if (key1 == 'config_time')
                    Datatodecode = Datatodecode.match(/[a-fA-F0-9]{2}/g).reverse().join('')
                objData[key1] = convertHexa(Datatodecode, DataType, Number(obj[Action][Attribute][key1].Length));
                startAttrIndex = endAttrIndex;
            }
            arrData.push(objData);
            objJson['Data'] = arrData;

            /*************************************** Meter Data Ends ***************************************************************/
            startIndex = endIndex + startIndex;
        }
        else {
            // console.log("else paert")
            var endIndex = (2 * Number(obj.FrameFormat[key].Length)) + Number(startIndex);
            getCommValues(startIndex, endIndex, key, obj, data);
            startIndex = endIndex;
        }
    }
    // console.log(" Transformer Obj :: ",objJson)
    return callback(null, objJson);
}

module.exports = {
    convertJson_Deregister: convertJson_Deregister,
    convertJson_MagerialData: convertJson_MagerialData,
    convertJson_TransactionData: convertJson_TransactionData,
    convertJson_EventsAlarms: convertJson_EventsAlarms,
    getActionName: getActionName,
    covertJsonFirmwareManagement: covertJsonFirmwareManagement,
    covertJsonMacAclManagement: covertJsonMacAclManagement,
    getUTC: getUTC,
    covertJsonDeviceLog: covertJsonDeviceLog,
    convertJson_DLNodePing: convertJson_DLNodePing,
    covertJsonConfigManagement: covertJsonConfigManagement,
    convertJson_CarrierList: convertJson_CarrierList,
    convertJson_MeshScan: convertJson_MeshScan,
    convertJson_DhcpData: convertJson_DhcpData,
    convertJson_DeltalinkStatus: convertJson_DeltalinkStatus,
    convertJson_configUpload: convertJson_configUpload,
    convertJson_DataConsumption: convertJson_DataConsumption,
    convertJsonMeterFirmwareManagement:convertJsonMeterFirmwareManagement,
    convertJson_CoilUploadData: convertJson_CoilUploadData
}

