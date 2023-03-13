const moment = require('moment')

function transformerObject(resultData) {
    try {
        let objToInsert = {};
        let dateTimeNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        objToInsert.uniqueIdVal =  Date.now().toString();
        objToInsert.Rev = resultData.Rev;
        objToInsert.Count = resultData.Count;
        objToInsert.CountryCode = resultData.CountryCode;
        objToInsert.RegionCode = resultData.RegionCode;
        objToInsert.CellID = resultData.CellID;
        objToInsert.MeterID = resultData.MeterID;
        objToInsert.Type = resultData.Type;
        objToInsert.Action = resultData.Action;
        objToInsert.Attribute = resultData.Attribute;
        // if (resultData.Transformer.StatusTransformer == 'NotRelavant') {
        //     console.log('Not relevant Transformer returning null')
        //     return true;
        // } else {
            
            objToInsert.Phase = resultData.Transformer.Phase ? resultData.Transformer.Phase : 0;
            objToInsert.NoOfMeter = resultData.Transformer.NoOfMeter ? resultData.Transformer.NoOfMeter : 0;
            objToInsert.StatusTransformer = resultData.Transformer.StatusTransformer ? resultData.Transformer.StatusTransformer : '';

            objToInsert.Line1Voltage = resultData.Transformer.Line1Voltage ? resultData.Transformer.Line1Voltage : 0;
            objToInsert.Line1Current = resultData.Transformer.Line1Current ? resultData.Transformer.Line1Current : 0;
            objToInsert.Line1Period = resultData.Transformer.Line1Period ? resultData.Transformer.Line1Period : 0;
            objToInsert.Line1PhaseAngle = resultData.Transformer.Line1PhaseAngle ? resultData.Transformer.Line1PhaseAngle : 0;
            objToInsert.THD = resultData.THD ? resultData.THD : 0;
            objToInsert.ThirdHarm = resultData.ThirdHarm ? resultData.ThirdHarm : 0;
            objToInsert.FifthHarm = resultData.FifthHarm ? resultData.FifthHarm : 0;
            objToInsert.SeventhHarm = resultData.SeventhHarm ? resultData.SeventhHarm : 0;
            objToInsert.NinthHarm = resultData.NinthHarm ? resultData.NinthHarm : 0;
            objToInsert.EleventhHarm = resultData.EleventhHarm ? resultData.EleventhHarm : 0;
            objToInsert.ThirteenthHarm = resultData.ThirteenthHarm ? resultData.ThirteenthHarm : 0;
            objToInsert.FifteenthHarm = resultData.FifteenthHarm ? resultData.FifteenthHarm : 0;

            objToInsert.AmbientTemperarture = resultData.Transformer.AmbientTemperarture ? resultData.Transformer.AmbientTemperarture : 0;
            objToInsert.TopTemperature = resultData.Transformer.TopTemperature ? resultData.Transformer.TopTemperature : 0;
            objToInsert.BottomTemperature = resultData.Transformer.BottomTemperature ? resultData.Transformer.BottomTemperature : 0;
            objToInsert.TransformerOilLevel = resultData.Transformer.TransformerOilLevel ? resultData.Transformer.TransformerOilLevel : 0;
            objToInsert.BatteryVoltage = resultData.Transformer.BatteryVoltage ? resultData.Transformer.BatteryVoltage : 0;
            objToInsert.BatteryStatus = resultData.Transformer.BatteryStatus ? resultData.Transformer.BatteryStatus : 0;
            objToInsert.ActiveReceivedCumulativeRate1 = resultData.Transformer.ActiveReceivedCumulativeRate1 ? resultData.Transformer.ActiveReceivedCumulativeRate1 : 0;
            objToInsert.ActiveReceivedCumulativeRate2 = resultData.Transformer.ActiveReceivedCumulativeRate2 ? resultData.Transformer.ActiveReceivedCumulativeRate2 : 0;
            objToInsert.ActiveReceivedCumulativeRate3 = resultData.Transformer.ActiveReceivedCumulativeRate3 ? resultData.Transformer.ActiveReceivedCumulativeRate3 : 0;
            objToInsert.ActiveReceivedCumulativeRate4 = resultData.Transformer.ActiveReceivedCumulativeRate4 ? resultData.Transformer.ActiveReceivedCumulativeRate4 : 0;
            objToInsert.ActiveReceivedCumulativeRate_Total = resultData.Transformer.ActiveReceivedCumulativeRate_Total ? resultData.Transformer.ActiveReceivedCumulativeRate_Total : 0;
            objToInsert.ActiveDeliveredCumulativeRate1 = resultData.Transformer.ActiveDeliveredCumulativeRate1 ? resultData.Transformer.ActiveDeliveredCumulativeRate1 : 0;
            objToInsert.ActiveDeliveredCumulativeRate2 = resultData.Transformer.ActiveDeliveredCumulativeRate2 ? resultData.Transformer.ActiveDeliveredCumulativeRate2 : 0;
            objToInsert.ActiveDeliveredCumulativeRate3 = resultData.Transformer.ActiveDeliveredCumulativeRate3 ? resultData.Transformer.ActiveDeliveredCumulativeRate3 : 0;
            objToInsert.ActiveDeliveredCumulativeRate4 = resultData.Transformer.ActiveDeliveredCumulativeRate4 ? resultData.Transformer.ActiveDeliveredCumulativeRate4 : 0;
            objToInsert.ActiveDeliveredCumulativeRate_Total = resultData.Transformer.ActiveDeliveredCumulativeRate_Total ? resultData.Transformer.ActiveDeliveredCumulativeRate_Total : 0;
            objToInsert.Active_m_Total = resultData.Transformer.Active_m_Total ? resultData.Transformer.Active_m_Total : 0;
            objToInsert.ReactiveReceivedCumulativeRate1 = resultData.Transformer.ReactiveReceivedCumulativeRate1 ? resultData.Transformer.ReactiveReceivedCumulativeRate1 : 0;
            objToInsert.ReactiveReceivedCumulativeRate2 = resultData.Transformer.ReactiveReceivedCumulativeRate2 ? resultData.Transformer.ReactiveReceivedCumulativeRate2 : 0;
            objToInsert.ReactiveReceivedCumulativeRate3 = resultData.Transformer.ReactiveReceivedCumulativeRate3 ? resultData.Transformer.ReactiveReceivedCumulativeRate3 : 0;

            objToInsert.ReactiveReceivedCumulativeRate4 = resultData.Transformer.ReactiveReceivedCumulativeRate4 ? resultData.Transformer.ReactiveReceivedCumulativeRate4 : 0;
            objToInsert.ReactiveReceivedCumulativeTotal = resultData.Transformer.ReactiveReceivedCumulativeTotal ? resultData.Transformer.ReactiveReceivedCumulativeTotal : 0;
            objToInsert.ReactiveDeliveredCumulativeRate1 = resultData.Transformer.ReactiveDeliveredCumulativeRate1 ? resultData.Transformer.ReactiveDeliveredCumulativeRate1 : 0;
            objToInsert.ReactiveDeliveredCumulativeRate2 = resultData.Transformer.ReactiveDeliveredCumulativeRate2 ? resultData.Transformer.ReactiveDeliveredCumulativeRate2 : 0;
            objToInsert.ReactiveDeliveredCumulativeRate3 = resultData.Transformer.ReactiveDeliveredCumulativeRate3 ? resultData.Transformer.ReactiveDeliveredCumulativeRate3 : 0;
            objToInsert.ReactiveDeliveredCumulativeRate4 = resultData.Transformer.ReactiveDeliveredCumulativeRate4 ? resultData.Transformer.ReactiveDeliveredCumulativeRate4 : 0;
            objToInsert.ReactiveDeliveredCumulativeTotal = resultData.Transformer.ReactiveDeliveredCumulativeTotal ? resultData.Transformer.ReactiveDeliveredCumulativeTotal : 0;
            objToInsert.Reactive_m_Total = resultData.Transformer.Reactive_m_Total ? resultData.Transformer.Reactive_m_Total : 0;
            objToInsert.ApparentReceivedCumulativeRate_1 = resultData.Transformer.ApparentReceivedCumulativeRate_1 ? resultData.Transformer.ApparentReceivedCumulativeRate_1 : 0;
            objToInsert.ApparentReceivedCumulativeRate_2 = resultData.Transformer.ApparentReceivedCumulativeRate_2 ? resultData.Transformer.ApparentReceivedCumulativeRate_2 : 0;
            objToInsert.ApparentReceivedCumulativeRate_3 = resultData.Transformer.ApparentReceivedCumulativeRate_3 ? resultData.Transformer.ApparentReceivedCumulativeRate_3 : 0;
            objToInsert.ApparentReceivedCumulativeRate_4 = resultData.Transformer.ApparentReceivedCumulativeRate_4 ? resultData.Transformer.ApparentReceivedCumulativeRate_4 : 0;
            objToInsert.ApparentReceivedCumulativeRate_Total = resultData.Transformer.ApparentReceivedCumulativeRate_Total ? resultData.Transformer.ApparentReceivedCumulativeRate_Total : 0;
            objToInsert.ApparentDeliveredCumulativeRate_1 = resultData.Transformer.ApparentDeliveredCumulativeRate_1 ? resultData.Transformer.ApparentDeliveredCumulativeRate_1 : 0;
            objToInsert.ApparentDeliveredCumulativeRate_2 = resultData.Transformer.ApparentDeliveredCumulativeRate_2 ? resultData.Transformer.ApparentDeliveredCumulativeRate_2 : 0;
            objToInsert.ApparentDeliveredCumulativeRate_3 = resultData.Transformer.ApparentDeliveredCumulativeRate_3 ? resultData.Transformer.ApparentDeliveredCumulativeRate_3 : 0;


            objToInsert.ApparentDeliveredCumulativeRate_4 = resultData.Transformer.ApparentDeliveredCumulativeRate_4 ? resultData.Transformer.ApparentDeliveredCumulativeRate_4 : 0;
            objToInsert.ApparentDeliveredCumulativeRate_Total = resultData.Transformer.ApparentDeliveredCumulativeRate_Total ? resultData.Transformer.ApparentDeliveredCumulativeRate_Total : 0;
            objToInsert.Apparent_m_Total = resultData.Transformer.Apparent_m_Total ? resultData.Transformer.Apparent_m_Total : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1 = resultData.Transformer.ActiveMaxdemandMonthlyPeak1 ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1 : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2 = resultData.Transformer.ActiveMaxdemandMonthlyPeak2 ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2 : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3 = resultData.Transformer.ActiveMaxdemandMonthlyPeak3 ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3 : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4 = resultData.Transformer.ActiveMaxdemandMonthlyPeak4 ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4 : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak = resultData.Transformer.ActiveMaxdemandMonthlyPeak ? resultData.Transformer.ActiveMaxdemandMonthlyPeak : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Date = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Date ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Date : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Month = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Month ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Month : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Year = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Year ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Year : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Hour = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Hour ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Hour : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Min = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Min ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Min : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak1Sec = resultData.Transformer.ActiveMaxdemandMonthlyPeak1Sec ? resultData.Transformer.ActiveMaxdemandMonthlyPeak1Sec : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2Date = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Date ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Date : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2Month = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Month ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Month : 0;

            objToInsert.ActiveMaxdemandMonthlyPeak2Year = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Year ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Year : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2Hour = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Hour ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Hour : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2Min = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Min ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Min : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak2Sec = resultData.Transformer.ActiveMaxdemandMonthlyPeak2Sec ? resultData.Transformer.ActiveMaxdemandMonthlyPeak2Sec : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Date = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Date ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Date : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Month = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Month ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Month : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Year = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Year ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Year : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Hour = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Hour ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Hour : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Min = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Min ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Min : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak3Sec = resultData.Transformer.ActiveMaxdemandMonthlyPeak3Sec ? resultData.Transformer.ActiveMaxdemandMonthlyPeak3Sec : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Date = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Date ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Date : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Month = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Month ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Month : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Year = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Year ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Year : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Hour = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Hour ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Hour : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Min = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Min ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Min : 0;
            objToInsert.ActiveMaxdemandMonthlyPeak4Sec = resultData.Transformer.ActiveMaxdemandMonthlyPeak4Sec ? resultData.Transformer.ActiveMaxdemandMonthlyPeak4Sec : 0;

            objToInsert.ActiveMaxdemandMonthlyPeakDate = resultData.Transformer.ActiveMaxdemandMonthlyPeakDate ? resultData.Transformer.ActiveMaxdemandMonthlyPeakDate : 0;
            objToInsert.ActiveMaxdemandMonthlyPeakMonth = resultData.Transformer.ActiveMaxdemandMonthlyPeakMonth ? resultData.Transformer.ActiveMaxdemandMonthlyPeakMonth : 0;
            objToInsert.ActiveMaxdemandMonthlyPeakYear = resultData.Transformer.ActiveMaxdemandMonthlyPeakYear ? resultData.Transformer.ActiveMaxdemandMonthlyPeakYear : 0;
            objToInsert.ActiveMaxdemandMonthlyPeakHour = resultData.Transformer.ActiveMaxdemandMonthlyPeakHour ? resultData.Transformer.ActiveMaxdemandMonthlyPeakHour : 0;
            objToInsert.ActiveMaxdemandMonthlyPeakMin = resultData.Transformer.ActiveMaxdemandMonthlyPeakMin ? resultData.Transformer.ActiveMaxdemandMonthlyPeakMin : 0;
            objToInsert.ActiveMaxdemandMonthlyPeakSec = resultData.Transformer.ActiveMaxdemandMonthlyPeakSec ? resultData.Transformer.ActiveMaxdemandMonthlyPeakSec : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1 = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1 ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1 : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2 = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2 ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2 : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3 = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3 ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3 : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4 = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4 ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4 : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak = resultData.Transformer.ReactiveMaxdemandMonthlyPeak ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1Date = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Date ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Date : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1Month = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Month ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Month : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1Year = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Year ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Year : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1Hour = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Hour ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Hour : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak1Min = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Min ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Min : 0;

            objToInsert.ReactiveMaxdemandMonthlyPeak1Sec = resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Sec ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak1Sec : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Date = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Date ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Date : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Month = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Month ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Month : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Year = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Year ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Year : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Hour = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Hour ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Hour : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Min = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Min ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Min : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak2Sec = resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Sec ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak2Sec : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Date = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Date ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Date : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Month = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Month ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Month : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Year = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Year ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Year : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Hour = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Hour ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Hour : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Min = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Min ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Min : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak3Sec = resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Sec ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak3Sec : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4Date = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Date ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Date : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4Month = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Month ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Month : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4Year = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Year ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Year : 0;

            objToInsert.ReactiveMaxdemandMonthlyPeak4Hour = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Hour ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Hour : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4Min = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Min ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Min : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeak4Sec = resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Sec ? resultData.Transformer.ReactiveMaxdemandMonthlyPeak4Sec : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakDate = resultData.Transformer.ReactiveMaxdemandMonthlyPeakDate ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakDate : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakMonth = resultData.Transformer.ReactiveMaxdemandMonthlyPeakMonth ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakMonth : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakYear = resultData.Transformer.ReactiveMaxdemandMonthlyPeakYear ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakYear : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakHour = resultData.Transformer.ReactiveMaxdemandMonthlyPeakHour ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakHour : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakMin = resultData.Transformer.ReactiveMaxdemandMonthlyPeakMin ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakMin : 0;
            objToInsert.ReactiveMaxdemandMonthlyPeakSec = resultData.Transformer.ReactiveMaxdemandMonthlyPeakSec ? resultData.Transformer.ReactiveMaxdemandMonthlyPeakSec : 0;

            objToInsert.ApparentMaxdemandMonthlyPeak1 = resultData.Transformer.ApparentMaxdemandMonthlyPeak1 ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1 : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2 = resultData.Transformer.ApparentMaxdemandMonthlyPeak2 ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2 : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3 = resultData.Transformer.ApparentMaxdemandMonthlyPeak3 ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3 : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4 = resultData.Transformer.ApparentMaxdemandMonthlyPeak4 ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4 : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak = resultData.Transformer.ApparentMaxdemandMonthlyPeak ? resultData.Transformer.ApparentMaxdemandMonthlyPeak : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Date = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Date ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Date : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Month = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Month ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Month : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Year = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Year ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Year : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Hour = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Hour ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Hour : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Min = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Min ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Min : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak1Sec = resultData.Transformer.ApparentMaxdemandMonthlyPeak1Sec ? resultData.Transformer.ApparentMaxdemandMonthlyPeak1Sec : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Date = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Date ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Date : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Month = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Month ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Month : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Year = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Year ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Year : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Hour = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Hour ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Hour : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Min = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Min ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Min : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak2Sec = resultData.Transformer.ApparentMaxdemandMonthlyPeak2Sec ? resultData.Transformer.ApparentMaxdemandMonthlyPeak2Sec : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Date = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Date ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Date : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Month = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Month ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Month : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Year = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Year ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Year : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Hour = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Hour ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Hour : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Min = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Min ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Min : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak3Sec = resultData.Transformer.ApparentMaxdemandMonthlyPeak3Sec ? resultData.Transformer.ApparentMaxdemandMonthlyPeak3Sec : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Date = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Date ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Date : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Month = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Month ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Month : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Year = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Year ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Year : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Hour = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Hour ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Hour : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Min = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Min ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Min : 0;
            objToInsert.ApparentMaxdemandMonthlyPeak4Sec = resultData.Transformer.ApparentMaxdemandMonthlyPeak4Sec ? resultData.Transformer.ApparentMaxdemandMonthlyPeak4Sec : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakDate = resultData.Transformer.ApparentMaxdemandMonthlyPeakDate ? resultData.Transformer.ApparentMaxdemandMonthlyPeakDate : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakMonth = resultData.Transformer.ApparentMaxdemandMonthlyPeakMonth ? resultData.Transformer.ApparentMaxdemandMonthlyPeakMonth : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakYear = resultData.Transformer.ApparentMaxdemandMonthlyPeakYear ? resultData.Transformer.ApparentMaxdemandMonthlyPeakYear : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakHour = resultData.Transformer.ApparentMaxdemandMonthlyPeakHour ? resultData.Transformer.ApparentMaxdemandMonthlyPeakHour : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakMin = resultData.Transformer.ApparentMaxdemandMonthlyPeakMin ? resultData.Transformer.ApparentMaxdemandMonthlyPeakMin : 0;
            objToInsert.ApparentMaxdemandMonthlyPeakSec = resultData.Transformer.ApparentMaxdemandMonthlyPeakSec ? resultData.Transformer.ApparentMaxdemandMonthlyPeakSec : 0;
            
            objToInsert.THD_1 = resultData.Transformer.THD_1 ? resultData.Transformer.THD_1 : 0;
            objToInsert.ThirdHarm_1 = resultData.Transformer.ThirdHarm_1 ? resultData.Transformer.ThirdHarm_1 : 0;
            objToInsert.FifthHarm_1 = resultData.Transformer.FifthHarm_1 ? resultData.Transformer.FifthHarm_1 : 0;
            objToInsert.SeventhHarm_1 = resultData.Transformer.SeventhHarm_1 ? resultData.Transformer.SeventhHarm_1 : 0;
            objToInsert.NinthHarm_1 = resultData.Transformer.NinthHarm_1 ? resultData.Transformer.NinthHarm_1 : 0;
            objToInsert.EleventhHarm_1 = resultData.Transformer.EleventhHarm_1 ? resultData.Transformer.EleventhHarm_1 : 0;
            objToInsert.ThirteenthHarm_1 = resultData.Transformer.ThirteenthHarm_1 ? resultData.Transformer.ThirteenthHarm_1 : 0;
            objToInsert.FifteenthHarm_1 = resultData.Transformer.FifteenthHarm_1 ? resultData.Transformer.FifteenthHarm_1 : 0;

            objToInsert.THD_2 = resultData.Transformer.THD_2 ? resultData.Transformer.THD_2 : 0;
            objToInsert.ThirdHarm_2 = resultData.Transformer.ThirdHarm_2 ? resultData.Transformer.ThirdHarm_2 : 0;
            objToInsert.FifthHarm_2 = resultData.Transformer.FifthHarm_2 ? resultData.Transformer.FifthHarm_2 : 0;
            objToInsert.SeventhHarm_2 = resultData.Transformer.SeventhHarm_2 ? resultData.Transformer.SeventhHarm_2 : 0;
            objToInsert.NinthHarm_2 = resultData.Transformer.NinthHarm_2 ? resultData.Transformer.NinthHarm_2 : 0;
            objToInsert.EleventhHarm_2 = resultData.Transformer.EleventhHarm_2 ? resultData.Transformer.EleventhHarm_2 : 0;
            objToInsert.ThirteenthHarm_2 = resultData.Transformer.ThirteenthHarm_2 ? resultData.Transformer.ThirteenthHarm_2 : 0;
            objToInsert.FifteenthHarm_2 = resultData.Transformer.FifteenthHarm_2 ? resultData.Transformer.FifteenthHarm_2 : 0;

            objToInsert.THD_3 = resultData.Transformer.THD_3 ? resultData.Transformer.THD_3 : 0;
            objToInsert.ThirdHarm_3 = resultData.Transformer.ThirdHarm_3 ? resultData.Transformer.ThirdHarm_3 : 0;
            objToInsert.FifthHarm_3 = resultData.Transformer.FifthHarm_3 ? resultData.Transformer.FifthHarm_3 : 0;
            objToInsert.SeventhHarm_3 = resultData.Transformer.SeventhHarm_3 ? resultData.Transformer.SeventhHarm_3 : 0;
            objToInsert.NinthHarm_3 = resultData.Transformer.NinthHarm_3 ? resultData.Transformer.NinthHarm_3 : 0;
            objToInsert.EleventhHarm_3 = resultData.Transformer.EleventhHarm_3 ? resultData.Transformer.EleventhHarm_3 : 0;
            objToInsert.ThirteenthHarm_3 = resultData.Transformer.ThirteenthHarm_3 ? resultData.Transformer.ThirteenthHarm_3 : 0;
            objToInsert.FifteenthHarm_3 = resultData.Transformer.FifteenthHarm_3 ? resultData.Transformer.FifteenthHarm_3 : 0;


            objToInsert.Line2Voltage = resultData.Transformer.Line2Voltage ? resultData.Transformer.Line2Voltage : 0;
            objToInsert.Line2Current = resultData.Transformer.Line2Current ? resultData.Transformer.Line2Current : 0;
            objToInsert.Line2Period = resultData.Transformer.Line2Period ? resultData.Transformer.Line2Period : 0;
            objToInsert.Line2PhaseAngle = resultData.Transformer.Line2PhaseAngle ? resultData.Transformer.Line2PhaseAngle : 0;

            objToInsert.Line3Voltage = resultData.Transformer.Line3Voltage ? resultData.Transformer.Line3Voltage : 0;
            objToInsert.Line3Current = resultData.Transformer.Line3Current ? resultData.Transformer.Line3Current : 0;
            objToInsert.Line3Period = resultData.Transformer.Line3Period ? resultData.Transformer.Line3Period : 0;
            objToInsert.Line3PhaseAngle = resultData.Transformer.Line3PhaseAngle ? resultData.Transformer.Line3PhaseAngle : 0;


            if (resultData.Transformer.ReadTimestamp === undefined || typeof resultData.Transformer.ReadTimestamp === undefined || resultData.Transformer.ReadTimestamp == 'Invalid Date' || resultData.Transformer.ReadTimestamp == '1970-01-01 00:00:00.000Z' || resultData.Transformer.StatusTransformer == 'NotRelavant') {
                if (resultData.Transformer.NoOfConnectedMeter > 0) {
                    if (resultData.meters[0].ReadTimestamp !== undefined && typeof resultData.meters[0].ReadTimestamp !== undefined && resultData.meters[0].ReadTimestamp != 'Invalid Date' && resultData.meters[0].ReadTimestamp != '1970-01-01 00:00:00.000Z' || resultData.Transformer.StatusTransformer == 'NotRelavant') {
                        objToInsert.ReadTimestamp = resultData.meters[0].ReadTimestamp.toISOString();
                    } else {
                        objToInsert.ReadTimestamp = dateTimeNow;
                    }
                } else {
                    objToInsert.ReadTimestamp = dateTimeNow;
                }
            } else {
                objToInsert.ReadTimestamp = resultData.Transformer.ReadTimestamp
            }


            objToInsert.DBTimestamp = dateTimeNow;
            objToInsert.createdAt = dateTimeNow;
            objToInsert.updatedAt = dateTimeNow;

            // objToInsert.Circuit_ID = 0;
            // objToInsert.TransformerSerialNumber = 0;
            // objToInsert.HypersproutID = 0;
            // objToInsert.HypersproutSerialNumber = 0;

            let bulkTSArr = [];
            bulkTSArr.push(objToInsert);
            
            return bulkTSArr;
        // }
    } catch (exception) {
        console.log(exception);
    }
}

function meterObject(resultData) {
    let objMeterToInsert = [];
    let dateTimeNow = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    objMeterToInsert = resultData.meters;
    let bulkMeterArr = [];
    try{
        if (objMeterToInsert.length > 0) {
            try {
                for (let i = 0; i < objMeterToInsert.length; i++) {

                    if (objMeterToInsert[i].ReadTimestamp == undefined || objMeterToInsert[i].ReadTimestamp == 'Invalid Date' || objMeterToInsert[i].ReadTimestamp == '1970-01-01 00:00:00.000Z') {
                        objMeterToInsert[i].ReadTimestamp = dateTimeNow;
                    }
                    let meterReadtimestamp = new Date(objMeterToInsert[i].ReadTimestamp);
                    let dateTimeinISO = meterReadtimestamp;
                    dateTimeinISO.toISOString().replace(/T/, ' ').replace(/\..+/, '');
                    let datehour = moment.utc(dateTimeinISO, 'DD-MM-YYYY HH:mm:ss');
                    let currentReadtime = datehour.format('YYYY-MM-DD HH:mm:ss');
                    let arrayToInsert = {};
                    arrayToInsert.uniqueIdVal =  Date.now().toString();
                    arrayToInsert.Rev = resultData.Rev;
                    arrayToInsert.Count = resultData.Count;
                    arrayToInsert.CountryCode = resultData.CountryCode;
                    arrayToInsert.RegionCode = resultData.RegionCode;
                    arrayToInsert.CellID = resultData.CellID;
                    arrayToInsert.MeterID = resultData.MeterID;
                    arrayToInsert.Type = resultData.Type;
                    arrayToInsert.Action = resultData.Action;
                    arrayToInsert.Attribute = resultData.Attribute;
                    arrayToInsert.DeviceID = objMeterToInsert[i].DeviceID ? objMeterToInsert[i].DeviceID : 0;
                    arrayToInsert.Phase = objMeterToInsert[i].Phase ? objMeterToInsert[i].Phase : 0;
                    arrayToInsert.Status = objMeterToInsert[i].Status ? objMeterToInsert[i].Status : '';
                    arrayToInsert.Line1InstVoltage = objMeterToInsert[i].Line1InstVoltage ? objMeterToInsert[i].Line1InstVoltage : 0;
                    arrayToInsert.Line1InstCurrent = objMeterToInsert[i].Line1InstCurrent ? objMeterToInsert[i].Line1InstCurrent : 0;
                    arrayToInsert.Line1Frequency = objMeterToInsert[i].Line1Frequency ? objMeterToInsert[i].Line1Frequency : 0;
                    arrayToInsert.Line1PowerFactor = objMeterToInsert[i].Line1PowerFactor ? objMeterToInsert[i].Line1PowerFactor : 0;
                    arrayToInsert.ImportedActiveEnergyRate3_LBP = objMeterToInsert[i].ImportedActiveEnergyRate3_LBP ? objMeterToInsert[i].ImportedActiveEnergyRate3_LBP : 0;
                    arrayToInsert.ImportedActiveEnergyRate4_LBP = objMeterToInsert[i].ImportedActiveEnergyRate4_LBP ? objMeterToInsert[i].ImportedActiveEnergyRate4_LBP : 0;
                    arrayToInsert.TotImportedActiveMaxDemand_LBP = objMeterToInsert[i].TotImportedActiveMaxDemand_LBP ? objMeterToInsert[i].TotImportedActiveMaxDemand_LBP : 0;
                    arrayToInsert.ImportedActiveMaxDemandRate1_LBP = objMeterToInsert[i].ImportedActiveMaxDemandRate1_LBP ? objMeterToInsert[i].ImportedActiveMaxDemandRate1_LBP : 0;
                    arrayToInsert.ImportedActiveMaxDemandRate2_LBP = objMeterToInsert[i].ImportedActiveMaxDemandRate2_LBP ? objMeterToInsert[i].ImportedActiveMaxDemandRate2_LBP : 0;
                    arrayToInsert.ImportedActiveMaxDemandRate3_LBP = objMeterToInsert[i].ImportedActiveMaxDemandRate3_LBP ? objMeterToInsert[i].ImportedActiveMaxDemandRate3_LBP : 0;
                    arrayToInsert.ImportedActiveMaxDemandRate4_LBP = objMeterToInsert[i].ImportedActiveMaxDemandRate4_LBP ? objMeterToInsert[i].ImportedActiveMaxDemandRate4_LBP : 0;
                    arrayToInsert.TotImportedActiveMaxDemandRate_LBP = objMeterToInsert[i].TotImportedActiveCumMaxDemand_LBP;
                    arrayToInsert.ImportedActiveCumMaxDemandRate1_LBP = objMeterToInsert[i].ImportedActiveCumMaxDemandRate1_LBP ? objMeterToInsert[i].ImportedActiveCumMaxDemandRate1_LBP : 0;
                    arrayToInsert.ImportedActiveCumMaxDemandRate2_LBP = objMeterToInsert[i].ImportedActiveCumMaxDemandRate2_LBP ? objMeterToInsert[i].ImportedActiveCumMaxDemandRate2_LBP : 0;
                    arrayToInsert.ImportedActiveCumMaxDemandRate3_LBP = objMeterToInsert[i].ImportedActiveCumMaxDemandRate3_LBP ? objMeterToInsert[i].ImportedActiveCumMaxDemandRate3_LBP : 0;
                    arrayToInsert.ImportedActiveCumMaxDemandRate4_LBP = objMeterToInsert[i].ImportedActiveCumMaxDemandRate4_LBP ? objMeterToInsert[i].ImportedActiveCumMaxDemandRate4_LBP : 0;
                    arrayToInsert.TotImportedActiveCumMaxDemandRate_LBP = objMeterToInsert[i].TotImportedReactiveEnergy_LBP;
                    arrayToInsert.ImportedReactiveEnergyRate1_LBP = objMeterToInsert[i].ImportedReactiveEnergyRate1_LBP ? objMeterToInsert[i].ImportedReactiveEnergyRate1_LBP : 0;
                    arrayToInsert.ImportedReactiveEnergyRate2_LBP = objMeterToInsert[i].ImportedReactiveEnergyRate2_LBP ? objMeterToInsert[i].ImportedReactiveEnergyRate2_LBP : 0;
                    arrayToInsert.ImportedReactiveEnergyRate3_LBP = objMeterToInsert[i].ImportedReactiveEnergyRate3_LBP ? objMeterToInsert[i].ImportedReactiveEnergyRate3_LBP : 0;
                    arrayToInsert.ImportedReactiveEnergyRate4_LBP = objMeterToInsert[i].ImportedReactiveEnergyRate4_LBP ? objMeterToInsert[i].ImportedReactiveEnergyRate4_LBP : 0;
                    arrayToInsert.TotImportedReactiveEnergyRate_LBP = objMeterToInsert[i].TotImportedReactiveMaxDemand_LBP;
                    arrayToInsert.ImportedReactiveMaxDemandRate1_LBP = objMeterToInsert[i].ImportedReactiveMaxDemandRate1_LBP ? objMeterToInsert[i].ImportedReactiveMaxDemandRate1_LBP : 0;
                    arrayToInsert.ImportedReactiveMaxDemandRate2_LBP = objMeterToInsert[i].ImportedReactiveMaxDemandRate2_LBP ? objMeterToInsert[i].ImportedReactiveMaxDemandRate2_LBP : 0;
                    arrayToInsert.ImportedReactiveMaxDemandRate3_LBP = objMeterToInsert[i].ImportedReactiveMaxDemandRate3_LBP ? objMeterToInsert[i].ImportedReactiveMaxDemandRate3_LBP : 0;
                    arrayToInsert.ImportedReactiveMaxDemandRate4_LBP = objMeterToInsert[i].ImportedReactiveMaxDemandRate4_LBP ? objMeterToInsert[i].ImportedReactiveMaxDemandRate4_LBP : 0;
                    arrayToInsert.TotImportedReactiveMaxDemandRate_LBP = objMeterToInsert[i].TotImportedReactiveCumMaxDemand_LBP ? objMeterToInsert[i].TotImportedReactiveCumMaxDemand_LBP : 0;
                    arrayToInsert.ImportedReactiveCumMaxDemandRate1_LBP = objMeterToInsert[i].ImportedReactiveCumMaxDemandRate1_LBP ? objMeterToInsert[i].ImportedReactiveCumMaxDemandRate1_LBP : 0;
                    arrayToInsert.ImportedReactiveCumMaxDemandRate2_LBP = objMeterToInsert[i].ImportedReactiveCumMaxDemandRate2_LBP ? objMeterToInsert[i].ImportedReactiveCumMaxDemandRate2_LBP : 0;
                    arrayToInsert.ImportedReactiveCumMaxDemandRate3_LBP = objMeterToInsert[i].ImportedReactiveCumMaxDemandRate3_LBP ? objMeterToInsert[i].ImportedReactiveCumMaxDemandRate3_LBP : 0;
                    arrayToInsert.ImportedReactiveCumMaxDemandRate4_LBP = objMeterToInsert[i].ImportedReactiveCumMaxDemandRate4_LBP ? objMeterToInsert[i].ImportedReactiveCumMaxDemandRate4_LBP : 0;
                    arrayToInsert.ActiveReceivedCumulativeRate1 = objMeterToInsert[i].ActiveReceivedCumulativeRate1 ? objMeterToInsert[i].ActiveReceivedCumulativeRate1 : 0;
                    arrayToInsert.ActiveReceivedCumulativeRate2 = objMeterToInsert[i].ActiveReceivedCumulativeRate2 ? objMeterToInsert[i].ActiveReceivedCumulativeRate2 : 0;
                    arrayToInsert.ActiveReceivedCumulativeRate3 = objMeterToInsert[i].ActiveReceivedCumulativeRate3 ? objMeterToInsert[i].ActiveReceivedCumulativeRate3 : 0;
                    arrayToInsert.ActiveReceivedCumulativeRate4 = objMeterToInsert[i].ActiveReceivedCumulativeRate4 ? objMeterToInsert[i].ActiveReceivedCumulativeRate4 : 0;
                    arrayToInsert.ActiveReceivedCumulativeRate_Total = objMeterToInsert[i].ActiveReceivedCumulativeRate_Total ? objMeterToInsert[i].ActiveReceivedCumulativeRate_Total : 0;
                    arrayToInsert.ActiveDeliveredCumulativeRate1 = objMeterToInsert[i].ActiveDeliveredCumulativeRate1 ? objMeterToInsert[i].ActiveDeliveredCumulativeRate1 : 0;
                    arrayToInsert.ActiveDeliveredCumulativeRate2 = objMeterToInsert[i].ActiveDeliveredCumulativeRate2 ? objMeterToInsert[i].ActiveDeliveredCumulativeRate2 : 0;
                    arrayToInsert.ActiveDeliveredCumulativeRate3 = objMeterToInsert[i].ActiveDeliveredCumulativeRate3 ? objMeterToInsert[i].ActiveDeliveredCumulativeRate3 : 0;
                    arrayToInsert.ActiveDeliveredCumulativeRate4 = objMeterToInsert[i].ActiveDeliveredCumulativeRate4 ? objMeterToInsert[i].ActiveDeliveredCumulativeRate4 : 0;
                    arrayToInsert.ActiveDeliveredCumulativeRate_Total = objMeterToInsert[i].ActiveDeliveredCumulativeRate_Total ? objMeterToInsert[i].ActiveDeliveredCumulativeRate_Total : 0;
                    arrayToInsert.Active_m_Total = objMeterToInsert[i].Active_m_Total ? objMeterToInsert[i].Active_m_Total : 0;
                    arrayToInsert.ReactiveReceivedCumulativeRate1 = objMeterToInsert[i].ReactiveReceivedCumulativeRate1 ? objMeterToInsert[i].ReactiveReceivedCumulativeRate1 : 0;
                    arrayToInsert.ReactiveReceivedCumulativeRate2 = objMeterToInsert[i].ReactiveReceivedCumulativeRate2 ? objMeterToInsert[i].ReactiveReceivedCumulativeRate2 : 0;
                    arrayToInsert.ReactiveReceivedCumulativeRate3 = objMeterToInsert[i].ReactiveReceivedCumulativeRate3 ? objMeterToInsert[i].ReactiveReceivedCumulativeRate3 : 0;
                    arrayToInsert.ReactiveReceivedCumulativeRate4 = objMeterToInsert[i].ReactiveReceivedCumulativeRate4 ? objMeterToInsert[i].ReactiveReceivedCumulativeRate4 : 0;
                    arrayToInsert.ReactiveReceivedCumulativeTotal = objMeterToInsert[i].ReactiveReceivedCumulativeTotal ? objMeterToInsert[i].ReactiveReceivedCumulativeTotal : 0;
                    arrayToInsert.ReactiveDeliveredCumulativeRate1 = objMeterToInsert[i].ReactiveDeliveredCumulativeRate1 ? objMeterToInsert[i].ReactiveDeliveredCumulativeRate1 : 0;
                    arrayToInsert.ReactiveDeliveredCumulativeRate2 = objMeterToInsert[i].ReactiveDeliveredCumulativeRate2 ? objMeterToInsert[i].ReactiveDeliveredCumulativeRate2 : 0;
                    arrayToInsert.ReactiveDeliveredCumulativeRate3 = objMeterToInsert[i].ReactiveDeliveredCumulativeRate3 ? objMeterToInsert[i].ReactiveDeliveredCumulativeRate3 : 0;
                    arrayToInsert.ReactiveDeliveredCumulativeRate4 = objMeterToInsert[i].ReactiveDeliveredCumulativeRate4 ? objMeterToInsert[i].ReactiveDeliveredCumulativeRate4 : 0;
                    arrayToInsert.ReactiveDeliveredCumulativeTotal = objMeterToInsert[i].ReactiveDeliveredCumulativeTotal ? objMeterToInsert[i].ReactiveDeliveredCumulativeTotal : 0;
                    arrayToInsert.Reactive_m_Total = objMeterToInsert[i].Reactive_m_Total ? objMeterToInsert[i].Reactive_m_Total : 0;
                    arrayToInsert.ApparentReceivedCumulativeRate_1 = objMeterToInsert[i].ApparentReceivedCumulativeRate_1 ? objMeterToInsert[i].ApparentReceivedCumulativeRate_1 : 0;
                    arrayToInsert.ApparentReceivedCumulativeRate_2 = objMeterToInsert[i].ApparentReceivedCumulativeRate_2 ? objMeterToInsert[i].ApparentReceivedCumulativeRate_2 : 0;
                    arrayToInsert.ApparentReceivedCumulativeRate_3 = objMeterToInsert[i].ApparentReceivedCumulativeRate_3 ? objMeterToInsert[i].ApparentReceivedCumulativeRate_3 : 0;
                    arrayToInsert.ApparentReceivedCumulativeRate_4 = objMeterToInsert[i].ApparentReceivedCumulativeRate_4 ? objMeterToInsert[i].ApparentReceivedCumulativeRate_4 : 0;
                    arrayToInsert.ApparentReceivedCumulativeRate_Total = objMeterToInsert[i].ApparentReceivedCumulativeRate_Total ? objMeterToInsert[i].ApparentReceivedCumulativeRate_Total : 0;
                    arrayToInsert.ApparentDeliveredCumulativeRate_1 = objMeterToInsert[i].ApparentDeliveredCumulativeRate_1 ? objMeterToInsert[i].ApparentDeliveredCumulativeRate_1 : 0;
                    arrayToInsert.ApparentDeliveredCumulativeRate_2 = objMeterToInsert[i].ApparentDeliveredCumulativeRate_2 ? objMeterToInsert[i].ApparentDeliveredCumulativeRate_2 : 0;
                    arrayToInsert.ApparentDeliveredCumulativeRate_3 = objMeterToInsert[i].ApparentDeliveredCumulativeRate_3 ? objMeterToInsert[i].ApparentDeliveredCumulativeRate_3 : 0;
                    arrayToInsert.ApparentDeliveredCumulativeRate_4 = objMeterToInsert[i].ApparentDeliveredCumulativeRate_4 ? objMeterToInsert[i].ApparentDeliveredCumulativeRate_4 : 0;
                    arrayToInsert.ApparentDeliveredCumulativeRate_Total = objMeterToInsert[i].ApparentDeliveredCumulativeRate_Total ? objMeterToInsert[i].ApparentDeliveredCumulativeRate_Total : 0;
                    arrayToInsert.Apparent_m_Total = objMeterToInsert[i].Apparent_m_Total ? objMeterToInsert[i].Apparent_m_Total : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1 = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1 ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1 : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2 = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2 ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2 : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3 = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3 ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3 : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4 = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4 ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4 : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Date = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Date ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Date : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Month = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Month ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Month : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Year = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Year ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Year : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Hour = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Hour ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Hour : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Min = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Min ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Min : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak1Sec = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Sec ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak1Sec : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Date = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Date ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Date : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Month = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Month ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Month : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Year = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Year ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Year : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Hour = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Hour ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Hour : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Min = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Min ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Min : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak2Sec = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Sec ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak2Sec : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Date = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Date ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Date : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Month = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Month ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Month : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Year = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Year ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Year : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Hour = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Hour ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Hour : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Min = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Min ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Min : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak3Sec = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Sec ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak3Sec : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Date = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Date ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Date : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Month = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Month ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Month : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Year = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Year ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Year : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Hour = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Hour ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Hour : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Min = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Min ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Min : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeak4Sec = objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Sec ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeak4Sec : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakDate = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakDate ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakDate : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakMonth = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakMonth ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakMonth : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakYear = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakYear ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakYear : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakHour = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakHour ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakHour : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakMin = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakMin ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakMin : 0;
                    arrayToInsert.ActiveMaxdemandMonthlyPeakSec = objMeterToInsert[i].ActiveMaxdemandMonthlyPeakSec ? objMeterToInsert[i].ActiveMaxdemandMonthlyPeakSec : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1 = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1 ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1 : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2 = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2 ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2 : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3 = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3 ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3 : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4 = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4 ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4 : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Date = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Date ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Date : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Month = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Month ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Month : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Year = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Year ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Year : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Hour = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Hour ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Hour : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Min = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Min ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Min : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak1Sec = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Sec ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak1Sec : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Date = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Date ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Date : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Month = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Month ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Month : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Year = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Year ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Year : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Hour = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Hour ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Hour : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Min = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Min ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Min : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak2Sec = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Sec ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak2Sec : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Date = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Date ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Date : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Month = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Month ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Month : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Year = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Year ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Year : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Hour = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Hour ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Hour : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Min = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Min ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Min : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak3Sec = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Sec ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak3Sec : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Date = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Date ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Date : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Month = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Month ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Month : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Year = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Year ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Year : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Hour = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Hour ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Hour : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Min = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Min ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Min : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeak4Sec = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Sec ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeak4Sec : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakDate = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakDate ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakDate : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakMonth = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakMonth ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakMonth : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakYear = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakYear ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakYear : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakHour = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakHour ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakHour : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakMin = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakMin ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakMin : 0;
                    arrayToInsert.ReactiveMaxdemandMonthlyPeakSec = objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakSec ? objMeterToInsert[i].ReactiveMaxdemandMonthlyPeakSec : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1 = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1 ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1 : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2 = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2 ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2 : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3 = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3 ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3 : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4 = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4 ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4 : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Date = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Date ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Date : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Month = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Month ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Month : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Year = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Year ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Year : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Hour = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Hour ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Hour : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Min = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Min ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Min : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak1Sec = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Sec ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak1Sec : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Date = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Date ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Date : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Month = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Month ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Month : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Year = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Year ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Year : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Hour = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Hour ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Hour : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Min = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Min ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Min : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak2Sec = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Sec ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak2Sec : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Date = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Date ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Date : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Month = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Month ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Month : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Year = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Year ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Year : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Hour = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Hour ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Hour : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Min = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Min ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Min : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak3Sec = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Sec ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak3Sec : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Date = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Date ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Date : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Month = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Month ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Month : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Year = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Year ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Year : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Hour = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Hour ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Hour : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Min = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Min ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Min : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeak4Sec = objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Sec ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeak4Sec : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakDate = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakDate ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakDate : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakMonth = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakMonth ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakMonth : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakYear = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakYear ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakYear : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakHour = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakHour ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakHour : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakMin = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakMin ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakMin : 0;
                    arrayToInsert.ApparentMaxdemandMonthlyPeakSec = objMeterToInsert[i].ApparentMaxdemandMonthlyPeakSec ? objMeterToInsert[i].ApparentMaxdemandMonthlyPeakSec : 0;
                    arrayToInsert.Line0InstCurrent = objMeterToInsert[i].Line0InstCurrent ? objMeterToInsert[i].Line0InstCurrent : 0;
                    arrayToInsert.Line2InstVoltage = objMeterToInsert[i].Line2InstVoltage ? objMeterToInsert[i].Line2InstVoltage : 0;
                    arrayToInsert.Line2InstCurrent = objMeterToInsert[i].Line2InstCurrent ? objMeterToInsert[i].Line2InstCurrent : 0;
                    arrayToInsert.Line2Frequency = objMeterToInsert[i].Line2Frequency ? objMeterToInsert[i].Line2Frequency : 0;
                    arrayToInsert.Line2PowerFactor = objMeterToInsert[i].Line2PowerFactor ? objMeterToInsert[i].Line2PowerFactor : 0;
                    arrayToInsert.Line3InstVoltage = objMeterToInsert[i].Line3InstVoltage ? objMeterToInsert[i].Line3InstVoltage : 0;
                    arrayToInsert.Line3InstCurrent = objMeterToInsert[i].Line3InstCurrent ? objMeterToInsert[i].Line3InstCurrent : 0;
                    arrayToInsert.Line3Frequency = objMeterToInsert[i].Line3Frequency ? objMeterToInsert[i].Line3Frequency : 0;
                    arrayToInsert.Line3PowerFactor = objMeterToInsert[i].Line3PowerFactor ? objMeterToInsert[i].Line3PowerFactor : 0;
                    arrayToInsert.ReadTimestamp = currentReadtime;
                    arrayToInsert.DBTimestamp = dateTimeNow;
                    arrayToInsert.createdAt = dateTimeNow;
                    arrayToInsert.updatedAt = dateTimeNow;

                    bulkMeterArr.push(arrayToInsert);
                    return bulkMeterArr;
                }
            } catch (exception) {
                console.log('Exception in MeterObject processing' + exception)
                return exception;
                
            }
        } else {
            console.log("No Meter Connected-------------->")
            return true
            
        }

    }catch(err){
        // console.log("error in meter connected meters",err);
        return err;
       
    }
    
}

module.exports = {
    transformerObject: transformerObject,
    meterObject: meterObject
}