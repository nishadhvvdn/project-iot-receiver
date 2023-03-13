const moment = require('moment')
var mysql = require('mysql');
const json2csv = require('json2csv').parse;
var fs = require('fs');
const appendFileSync = require('fs').appendFileSync
var parser = require("./../CEparser/parser")
var protocolValidation = require("./../routes/protocolValidation")
var crc16 = require('crc-16');
var fs = require('fs');
var transactionResult = require("./transactionResult")
var configPara = require('../config/config.js');
var BitArray = require('node-bitarray');

const csv = require('fast-csv');
const csvStream = csv.format({ headers: true });

var pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.mysqlHost,
    user: process.env.mysqlUsername,
    password: process.env.mysqlPassword,
    database: process.env.mysqlDb,
    debug: false
});

async function convertToCSV(row) {
    try {
        let result = { transformer: "", meter: "" }
        if (row) {
            let [transformerResult, meterResult] = await Promise.all([transactionResult.transformerObject(row), transactionResult.meterObject(row)]);
            if (transformerResult.length > 0) {
                try {
                    const csvTransformer = await csvStream(transformerResult);
                    result.transformer = csvTransformer;
                } catch (error) {
                    console.log(error)
                    return error;
                }
            }
            if (meterResult.length > 0) {
                try {
                    const csvMeter = await csvStream(meterResult);
                    result.meter = csvMeter;
                } catch (error) {
                    console.log(error)
                    return error
                }
            }
            return result;
        }
    } catch (error) {
        console.log('err :', error)
    }
}

async function saveToCSV(result, meterFilename, transformerFilename) {
    try {
        // process the meter and transformer data in our format
        let [transformerResult, meterResult] = await Promise.all([transactionResult.transformerObject(result), transactionResult.meterObject(result)]);

        //check the transaformer data in object if data is there create one csv file and append that data that data into csv file
        if (transformerResult.length > 0) {
            try {
                csvTransformer = await json2csv(transformerResult, { header: false });
                await appendFileSync(transformerFilename, (csvTransformer + '\n'))

            } catch (error) {
                console.log(error)
                return error;
            }
        }
        //check the meter data in object if data is there create one csv file and append that data into csv file

        if (meterResult.length > 0) {

            try {
                const csvMeter = await json2csv(meterResult, { header: false });
                await appendFileSync(meterFilename, (csvMeter + '\n'))
            } catch (error) {
                console.log(error)
                return error
            }
        }

    } catch (error) {
        console.log('err :', error)
    }

}
// function to store the  csv file into mysql database
async function saveToDB(meterFilename, transformerFilename) {
    var filename = process.env.BASE_FILE_PATH + meterFilename.substring(1);
    var filenameForQuery = process.env.BASE_FILE_PATH + transformerFilename.substring(1);

    // console.log("filename = ", filename)
    console.log("Start saveToDB Time : ", Date.now())

    // check the file name if file is available in that path.to store the  csv file into mysql metertransactions table
    if (fs.existsSync(meterFilename)) {

        let sqlQuery = `LOAD DATA LOCAL INFILE "${filename}" INTO TABLE metertransactions1 FIELDS TERMINATED BY \',\' (uniqueIdVal,Rev,Count,CountryCode,RegionCode,CellID,MeterID,Type,Action,Attribute,DeviceID,Phase,Status,Line1InstVoltage,Line1InstCurrent,Line1Frequency,Line1PowerFactor,ImportedActiveEnergyRate3_LBP,ImportedActiveEnergyRate4_LBP,TotImportedActiveMaxDemand_LBP,ImportedActiveMaxDemandRate1_LBP,ImportedActiveMaxDemandRate2_LBP,ImportedActiveMaxDemandRate3_LBP,ImportedActiveMaxDemandRate4_LBP,TotImportedActiveMaxDemandRate_LBP,ImportedActiveCumMaxDemandRate1_LBP,ImportedActiveCumMaxDemandRate2_LBP,ImportedActiveCumMaxDemandRate3_LBP,ImportedActiveCumMaxDemandRate4_LBP,TotImportedActiveCumMaxDemandRate_LBP,ImportedReactiveEnergyRate1_LBP,ImportedReactiveEnergyRate2_LBP,ImportedReactiveEnergyRate3_LBP,ImportedReactiveEnergyRate4_LBP,TotImportedReactiveEnergyRate_LBP,ImportedReactiveMaxDemandRate1_LBP,ImportedReactiveMaxDemandRate2_LBP,ImportedReactiveMaxDemandRate3_LBP,ImportedReactiveMaxDemandRate4_LBP,TotImportedReactiveMaxDemandRate_LBP,ImportedReactiveCumMaxDemandRate1_LBP,ImportedReactiveCumMaxDemandRate2_LBP,ImportedReactiveCumMaxDemandRate3_LBP,ImportedReactiveCumMaxDemandRate4_LBP,ActiveReceivedCumulativeRate1,ActiveReceivedCumulativeRate2,ActiveReceivedCumulativeRate3,ActiveReceivedCumulativeRate4,ActiveReceivedCumulativeRate_Total,ActiveDeliveredCumulativeRate1,ActiveDeliveredCumulativeRate2,ActiveDeliveredCumulativeRate3,ActiveDeliveredCumulativeRate4,ActiveDeliveredCumulativeRate_Total,Active_m_Total,ReactiveReceivedCumulativeRate1,ReactiveReceivedCumulativeRate2,ReactiveReceivedCumulativeRate3,ReactiveReceivedCumulativeRate4,ReactiveReceivedCumulativeTotal,ReactiveDeliveredCumulativeRate1,ReactiveDeliveredCumulativeRate2,ReactiveDeliveredCumulativeRate3,ReactiveDeliveredCumulativeRate4,ReactiveDeliveredCumulativeTotal,Reactive_m_Total,ApparentReceivedCumulativeRate_1,ApparentReceivedCumulativeRate_2,ApparentReceivedCumulativeRate_3,ApparentReceivedCumulativeRate_4,ApparentReceivedCumulativeRate_Total,ApparentDeliveredCumulativeRate_1,ApparentDeliveredCumulativeRate_2,ApparentDeliveredCumulativeRate_3,ApparentDeliveredCumulativeRate_4,ApparentDeliveredCumulativeRate_Total,Apparent_m_Total,ActiveMaxdemandMonthlyPeak1,ActiveMaxdemandMonthlyPeak2,ActiveMaxdemandMonthlyPeak3,ActiveMaxdemandMonthlyPeak4,ActiveMaxdemandMonthlyPeak,ActiveMaxdemandMonthlyPeak1Date,ActiveMaxdemandMonthlyPeak1Month,ActiveMaxdemandMonthlyPeak1Year,ActiveMaxdemandMonthlyPeak1Hour,ActiveMaxdemandMonthlyPeak1Min,ActiveMaxdemandMonthlyPeak1Sec,ActiveMaxdemandMonthlyPeak2Date,ActiveMaxdemandMonthlyPeak2Month,ActiveMaxdemandMonthlyPeak2Year,ActiveMaxdemandMonthlyPeak2Hour,ActiveMaxdemandMonthlyPeak2Min,ActiveMaxdemandMonthlyPeak2Sec,ActiveMaxdemandMonthlyPeak3Date,ActiveMaxdemandMonthlyPeak3Month,ActiveMaxdemandMonthlyPeak3Year,ActiveMaxdemandMonthlyPeak3Hour,ActiveMaxdemandMonthlyPeak3Min,ActiveMaxdemandMonthlyPeak3Sec,ActiveMaxdemandMonthlyPeak4Date,ActiveMaxdemandMonthlyPeak4Month,ActiveMaxdemandMonthlyPeak4Year,ActiveMaxdemandMonthlyPeak4Hour,ActiveMaxdemandMonthlyPeak4Min,ActiveMaxdemandMonthlyPeak4Sec,ActiveMaxdemandMonthlyPeakDate,ActiveMaxdemandMonthlyPeakMonth,ActiveMaxdemandMonthlyPeakYear,ActiveMaxdemandMonthlyPeakHour,ActiveMaxdemandMonthlyPeakMin,ActiveMaxdemandMonthlyPeakSec,ReactiveMaxdemandMonthlyPeak1,ReactiveMaxdemandMonthlyPeak2,ReactiveMaxdemandMonthlyPeak3,ReactiveMaxdemandMonthlyPeak4,ReactiveMaxdemandMonthlyPeak,ReactiveMaxdemandMonthlyPeak1Date,ReactiveMaxdemandMonthlyPeak1Month,ReactiveMaxdemandMonthlyPeak1Year,ReactiveMaxdemandMonthlyPeak1Hour,ReactiveMaxdemandMonthlyPeak1Min,ReactiveMaxdemandMonthlyPeak1Sec,ReactiveMaxdemandMonthlyPeak2Date,ReactiveMaxdemandMonthlyPeak2Month,ReactiveMaxdemandMonthlyPeak2Year,ReactiveMaxdemandMonthlyPeak2Hour,ReactiveMaxdemandMonthlyPeak2Min,ReactiveMaxdemandMonthlyPeak2Sec,ReactiveMaxdemandMonthlyPeak3Date,ReactiveMaxdemandMonthlyPeak3Month,ReactiveMaxdemandMonthlyPeak3Year,ReactiveMaxdemandMonthlyPeak3Hour,ReactiveMaxdemandMonthlyPeak3Min,ReactiveMaxdemandMonthlyPeak3Sec,ReactiveMaxdemandMonthlyPeak4Date,ReactiveMaxdemandMonthlyPeak4Month,ReactiveMaxdemandMonthlyPeak4Year,ReactiveMaxdemandMonthlyPeak4Hour,ReactiveMaxdemandMonthlyPeak4Min,ReactiveMaxdemandMonthlyPeak4Sec,ReactiveMaxdemandMonthlyPeakDate,ReactiveMaxdemandMonthlyPeakMonth,ReactiveMaxdemandMonthlyPeakYear,ReactiveMaxdemandMonthlyPeakHour,ReactiveMaxdemandMonthlyPeakMin,ReactiveMaxdemandMonthlyPeakSec,ApparentMaxdemandMonthlyPeak1,ApparentMaxdemandMonthlyPeak2,ApparentMaxdemandMonthlyPeak3,ApparentMaxdemandMonthlyPeak4,ApparentMaxdemandMonthlyPeak,ApparentMaxdemandMonthlyPeak1Date,ApparentMaxdemandMonthlyPeak1Month,ApparentMaxdemandMonthlyPeak1Year,ApparentMaxdemandMonthlyPeak1Hour,ApparentMaxdemandMonthlyPeak1Min,ApparentMaxdemandMonthlyPeak1Sec,ApparentMaxdemandMonthlyPeak2Date,ApparentMaxdemandMonthlyPeak2Month,ApparentMaxdemandMonthlyPeak2Year,ApparentMaxdemandMonthlyPeak2Hour,ApparentMaxdemandMonthlyPeak2Min,ApparentMaxdemandMonthlyPeak2Sec,ApparentMaxdemandMonthlyPeak3Date,ApparentMaxdemandMonthlyPeak3Month,ApparentMaxdemandMonthlyPeak3Year,ApparentMaxdemandMonthlyPeak3Hour,ApparentMaxdemandMonthlyPeak3Min,ApparentMaxdemandMonthlyPeak3Sec,ApparentMaxdemandMonthlyPeak4Date,ApparentMaxdemandMonthlyPeak4Month,ApparentMaxdemandMonthlyPeak4Year,ApparentMaxdemandMonthlyPeak4Hour,ApparentMaxdemandMonthlyPeak4Min,ApparentMaxdemandMonthlyPeak4Sec,ApparentMaxdemandMonthlyPeakDate,ApparentMaxdemandMonthlyPeakMonth,ApparentMaxdemandMonthlyPeakYear,ApparentMaxdemandMonthlyPeakHour,ApparentMaxdemandMonthlyPeakMin,ApparentMaxdemandMonthlyPeakSec,Line0InstCurrent,Line2InstVoltage,Line2InstCurrent,Line2Frequency,Line2PowerFactor,Line3InstVoltage,Line3InstCurrent,Line3Frequency,Line3PowerFactor,ReadTimestamp,DBTimestamp,createdAt,updatedAt)`;


        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
            }
            // execte the query 
            connection.query(sqlQuery, async function (err, rows) {
                connection.release();
                if (!err) {
                    console.log("End Meter: ", Date.now());
                    await fs.unlinkSync(meterFilename);
                }
            });
            connection.on('error', function (err) {
                //   throw err;
                return;
            });
        });

    }
    // check the file name if file is available in that path.to store the  csv file into mysql transformertransactions table
    if ((fs.existsSync(transformerFilename))) {

        let sql = `LOAD DATA LOCAL INFILE "${filenameForQuery}" INTO TABLE transformertransactions1 FIELDS TERMINATED BY \',\' (uniqueIdVal, Rev, Count, CountryCode, RegionCode, CellID, MeterID, Type, Action, Attribute, Phase,NoOfMeter,StatusTransformer,Line1Voltage,Line1Current, Line1Period, Line1PhaseAngle, THD, ThirdHarm, FifthHarm, SeventhHarm, NinthHarm, EleventhHarm, ThirteenthHarm,FifteenthHarm, AmbientTemperarture, TopTemperature, BottomTemperature, TransformerOilLevel, BatteryVoltage, BatteryStatus, ActiveReceivedCumulativeRate1, ActiveReceivedCumulativeRate2, ActiveReceivedCumulativeRate3, ActiveReceivedCumulativeRate4, ActiveReceivedCumulativeRate_Total, ActiveDeliveredCumulativeRate1, ActiveDeliveredCumulativeRate2, ActiveDeliveredCumulativeRate3, ActiveDeliveredCumulativeRate4, ActiveDeliveredCumulativeRate_Total, Active_m_Total, ReactiveReceivedCumulativeRate1, ReactiveReceivedCumulativeRate2, ReactiveReceivedCumulativeRate3, ReactiveReceivedCumulativeRate4, ReactiveReceivedCumulativeTotal, ReactiveDeliveredCumulativeRate1, ReactiveDeliveredCumulativeRate2, ReactiveDeliveredCumulativeRate3, ReactiveDeliveredCumulativeRate4, ReactiveDeliveredCumulativeTotal, Reactive_m_Total, ApparentReceivedCumulativeRate_1, ApparentReceivedCumulativeRate_2, ApparentReceivedCumulativeRate_3, ApparentReceivedCumulativeRate_4, ApparentReceivedCumulativeRate_Total, ApparentDeliveredCumulativeRate_1, ApparentDeliveredCumulativeRate_2, ApparentDeliveredCumulativeRate_3, ApparentDeliveredCumulativeRate_4, ApparentDeliveredCumulativeRate_Total, Apparent_m_Total, ActiveMaxdemandMonthlyPeak1, ActiveMaxdemandMonthlyPeak2, ActiveMaxdemandMonthlyPeak3, ActiveMaxdemandMonthlyPeak4, ActiveMaxdemandMonthlyPeak, ActiveMaxdemandMonthlyPeak1Date, ActiveMaxdemandMonthlyPeak1Month, ActiveMaxdemandMonthlyPeak1Year, ActiveMaxdemandMonthlyPeak1Hour, ActiveMaxdemandMonthlyPeak1Min, ActiveMaxdemandMonthlyPeak1Sec, ActiveMaxdemandMonthlyPeak2Date, ActiveMaxdemandMonthlyPeak2Month, ActiveMaxdemandMonthlyPeak2Year, ActiveMaxdemandMonthlyPeak2Hour, ActiveMaxdemandMonthlyPeak2Min, ActiveMaxdemandMonthlyPeak2Sec, ActiveMaxdemandMonthlyPeak3Date, ActiveMaxdemandMonthlyPeak3Month, ActiveMaxdemandMonthlyPeak3Year, ActiveMaxdemandMonthlyPeak3Hour, ActiveMaxdemandMonthlyPeak3Min, ActiveMaxdemandMonthlyPeak3Sec, ActiveMaxdemandMonthlyPeak4Date, ActiveMaxdemandMonthlyPeak4Month, ActiveMaxdemandMonthlyPeak4Year, ActiveMaxdemandMonthlyPeak4Hour, ActiveMaxdemandMonthlyPeak4Min, ActiveMaxdemandMonthlyPeak4Sec, ActiveMaxdemandMonthlyPeakDate, ActiveMaxdemandMonthlyPeakMonth, ActiveMaxdemandMonthlyPeakYear, ActiveMaxdemandMonthlyPeakHour, ActiveMaxdemandMonthlyPeakMin, ActiveMaxdemandMonthlyPeakSec, ReactiveMaxdemandMonthlyPeak1, ReactiveMaxdemandMonthlyPeak2, ReactiveMaxdemandMonthlyPeak3, ReactiveMaxdemandMonthlyPeak4, ReactiveMaxdemandMonthlyPeak, ReactiveMaxdemandMonthlyPeak1Date, ReactiveMaxdemandMonthlyPeak1Month, ReactiveMaxdemandMonthlyPeak1Year, ReactiveMaxdemandMonthlyPeak1Hour, ReactiveMaxdemandMonthlyPeak1Min, ReactiveMaxdemandMonthlyPeak1Sec, ReactiveMaxdemandMonthlyPeak2Date, ReactiveMaxdemandMonthlyPeak2Month, ReactiveMaxdemandMonthlyPeak2Year, ReactiveMaxdemandMonthlyPeak2Hour, ReactiveMaxdemandMonthlyPeak2Min, ReactiveMaxdemandMonthlyPeak2Sec, ReactiveMaxdemandMonthlyPeak3Date, ReactiveMaxdemandMonthlyPeak3Month, ReactiveMaxdemandMonthlyPeak3Year, ReactiveMaxdemandMonthlyPeak3Hour, ReactiveMaxdemandMonthlyPeak3Min, ReactiveMaxdemandMonthlyPeak3Sec, ReactiveMaxdemandMonthlyPeak4Date, ReactiveMaxdemandMonthlyPeak4Month, ReactiveMaxdemandMonthlyPeak4Year, ReactiveMaxdemandMonthlyPeak4Hour, ReactiveMaxdemandMonthlyPeak4Min, ReactiveMaxdemandMonthlyPeak4Sec, ReactiveMaxdemandMonthlyPeakDate, ReactiveMaxdemandMonthlyPeakMonth, ReactiveMaxdemandMonthlyPeakYear, ReactiveMaxdemandMonthlyPeakHour, ReactiveMaxdemandMonthlyPeakMin, ReactiveMaxdemandMonthlyPeakSec, ApparentMaxdemandMonthlyPeak1, ApparentMaxdemandMonthlyPeak2, ApparentMaxdemandMonthlyPeak3, ApparentMaxdemandMonthlyPeak4, ApparentMaxdemandMonthlyPeak, ApparentMaxdemandMonthlyPeak1Date, ApparentMaxdemandMonthlyPeak1Month, ApparentMaxdemandMonthlyPeak1Year, ApparentMaxdemandMonthlyPeak1Hour, ApparentMaxdemandMonthlyPeak1Min, ApparentMaxdemandMonthlyPeak1Sec, ApparentMaxdemandMonthlyPeak2Date, ApparentMaxdemandMonthlyPeak2Month, ApparentMaxdemandMonthlyPeak2Year, ApparentMaxdemandMonthlyPeak2Hour, ApparentMaxdemandMonthlyPeak2Min, ApparentMaxdemandMonthlyPeak2Sec, ApparentMaxdemandMonthlyPeak3Date, ApparentMaxdemandMonthlyPeak3Month, ApparentMaxdemandMonthlyPeak3Year, ApparentMaxdemandMonthlyPeak3Hour, ApparentMaxdemandMonthlyPeak3Min, ApparentMaxdemandMonthlyPeak3Sec, ApparentMaxdemandMonthlyPeak4Date, ApparentMaxdemandMonthlyPeak4Month, ApparentMaxdemandMonthlyPeak4Year, ApparentMaxdemandMonthlyPeak4Hour, ApparentMaxdemandMonthlyPeak4Min, ApparentMaxdemandMonthlyPeak4Sec, ApparentMaxdemandMonthlyPeakDate, ApparentMaxdemandMonthlyPeakMonth, ApparentMaxdemandMonthlyPeakYear, ApparentMaxdemandMonthlyPeakHour, ApparentMaxdemandMonthlyPeakMin, ApparentMaxdemandMonthlyPeakSec, THD_1, ThirdHarm_1, FifthHarm_1, SeventhHarm_1, NinthHarm_1, EleventhHarm_1, ThirteenthHarm_1, FifteenthHarm_1, THD_2, ThirdHarm_2,FifthHarm_2, SeventhHarm_2, NinthHarm_2, EleventhHarm_2, ThirteenthHarm_2, FifteenthHarm_2, THD_3, ThirdHarm_3, FifthHarm_3, SeventhHarm_3,NinthHarm_3,EleventhHarm_3, ThirteenthHarm_3, FifteenthHarm_3, Line2Voltage, Line2Current, Line2Period, Line2PhaseAngle, Line3Voltage, Line3Current, Line3Period, Line3PhaseAngle, ReadTimestamp, DBTimestamp, createdAt, updatedAt)`;


        pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
            }
            connection.query(sql, async function (err, rows) {
                connection.release();
                if (!err) {
                    console.log("End Trans: ", Date.now());
                    await fs.unlinkSync(transformerFilename);
                }
            });
            connection.on('error', function (err) {
                return;
            });
        });

    }
}


async function getTransacriondata(data) {
    var crcResult = crcCheck(data)
    var transactionData = false;
    if (crcResult) {
        try {
            var fileName = configPara.filePath + '0.json';
            var jsonObj = await fs.readFileSync(fileName, 'utf8');
            jsonObj = JSON.parse(jsonObj);
            parser.getActionName(jsonObj, data, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    if (res == "COLLECTOR_DATA_UPLOAD") {
                        
                        parser.convertJson_TransactionData(jsonObj, data, function (err, result) {
                            if (err) {
                                callback(err);
                            } else {
                                transactionData =result;
                            }
                        })
                    }
                    else{
                        transactionData = false;
                    }
                }
            })
        } catch (error) {
            console.log("err", error);
        }
    }
    return transactionData;
}

function crcCheck(rawData, callback) {

    var strCrc = rawData.slice(0, rawData.length - 4);
    var crc = rawData.slice(rawData.length - 4);

    // Calculate the CRC
    var buf = new Buffer(strCrc, 'hex');
    var crcResult = crc16(buf);
    crcResult = new Buffer(crcResult).toString('hex');
    if (crcResult === crc) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    saveToCSV: saveToCSV,
    saveToDB: saveToDB,
    convertToCSV: convertToCSV,
    getTransacriondata: getTransacriondata,
}
