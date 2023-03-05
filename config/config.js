var Sequelize = require("sequelize");
var objconnpool = null;

// IoT Connection String
var IOTConnectionString = process.env.IOTConnectionString;
// Database Details
var DBconnectionString = 'mongodb://' + process.env.MongoUsername + ':' +
    process.env.Password + '@' +
    process.env.mongoIP + '/' +
    process.env.mongoDB + '?authSource=admin';
//+ '&connectTimeoutMS=' + process.env.connectTimeoutMS
//+ '&socketTimeoutMS=' + process.env.socketTimeoutMS
//+ '&maxPoolSize=' + process.env.maxPoolSize;

/**My sql config */
var mySqlHost = process.env.mysqlHost;
var mySqlDb = process.env.mysqlDb;
var mySqlUser = process.env.mysqlUsername;
var mySqlPass = process.env.mysqlPassword;

//mysql connection
function getConnection(callback) {
	if (!objconnpool) {
		objconnpool = new Sequelize(mySqlDb, mySqlUser,
			mySqlPass,
			{
				host: mySqlHost,
				dialect: 'mysql',
				logging: false,
				pool: {
					max: 15,
					min: 0,
					idle: 120000,
					maxIdleTime: 120000,
					acquire: 100000
				},
				retry: {
					match: 'ER_LOCK_DEADLOCK: Deadlock found when trying to get lock; try restarting transaction',
					max: 3
				}
			}
		);
	}
	callback(null, objconnpool);
}

// DB Table Name
var rawData = "DELTA_RawData";
var invalidPacket = "DELTA_InvalidPacket";
var transactionData = "DELTA_Transaction_Data";
var onDemandMeterData = "DELTA_Meters_OnDemand_Transactions";
var alarmEvent = "DELTA_AlarmsAndEvents";
var eventLogs = "DELTA_SystemEvents";
var Hypersprouts = "DELTA_Hypersprouts";
var Jobs = "DELTA_Jobs";
var UpdateConfig = "DELTA_Config";
var SchedulerFlag = "DELTA_SchedulerFlags";
var meters = "DELTA_Meters";
var deltalink = "DELTA_DeltaLink";

// Webservice details
var Hostname = process.env.Hostname;
var port = process.env.port;
var regPage = "/EndpointRegistration";
var connectDisconnectPage = "/MeterConnectDisconnectResponse";
var onDemandWebServicePage = "/MeterKwHResponse";
var invalidPacketweb = "/InvalidPacketIntimation";
var meterDegister = "/RemovingMeterFromTransformerResponse";
var meterNodeping = "/SMMeterNodePingStatus";
var deviceLockStatus = "/LockUnlockDeviceStatus";
var wifiHypersprout = "/EditTransformerHypersproutWifiChangeResponse";
var wifiMeter = "/EditMeterWifiChangeResponse";
var hsDegister = '/RemovingTransformerFromCircuitResponse';
var downloadConfig = '/DownloadConfigurationResponse';
var endPointRegDreg = '/EndpointResponse';
var firmwareMngmt = '/FirmwareMgmtResponse';
var firmwareMgmtMesh = '/FirmwareMgmtMeshResponse';
var macAclDv = '/MacACLDV';
var macAclHs = '/MacACLHS';
var macAclAll = '/MacACLALL';
var rebootMngmt = '/RebootDeviceStatus';
var clearLogsStatus = '/ClearLogsStatus';
var verbosityLogsStatus = '/VerbosityLogsStatus';
var fetchDeviceLogStatus = '/FetchDeviceLogStatus';
var factoryResetMngmt = '/FactoryResetResponse';
var DlDereg = '/RemovingDeltalinkFromMeterResponse';
var DFirmwareresp = '/FirmwareMgmtDeltalinkResponse';
var DLNodePing = '/SMDeltalinkNodePingStatus';
var configMgmt = '/ConfigMgmtStatus';
var EditDeltalinkBandwidthChangeResponse = "/EditDeltalinkBandwidthChangeResponse";
var BandwidthLimitationsResponse = "/BandwidthLimitationsResponse";
var CarrierResp = '/CarrierListRep';
var Meshscan = '/MeshResp';
var DhcpParam = '/DhcpParam';
var DeltaLinkStatus = '/DeltaLinkStatus';
var MeshMacAclAddition = '/MeshMacAclAddition';
var DataRateResponse = "/DataRateResponse";



//Protocol Struture (JSON file)
var filePath = process.env.filePath;

module.exports = {
	IOTConnectionString: IOTConnectionString,
	DBconnectionString: DBconnectionString,
	rawData: rawData,
	invalidPacket: invalidPacket,
	transactionData: transactionData,
	onDemandMeterData: onDemandMeterData,
	alarmEvent: alarmEvent,
	eventLogs: eventLogs,
	Hypersprouts: Hypersprouts,
	meters: meters,
	deltalink: deltalink,
	Hostname: Hostname,
	port: port,
	regPage: regPage,
	connectDisconnectPage: connectDisconnectPage,
	onDemandWebServicePage: onDemandWebServicePage,
	invalidPacketweb: invalidPacketweb,
	meterDegister: meterDegister,
	meterNodeping: meterNodeping,
	DLNodePing: DLNodePing,
	deviceLockStatus: deviceLockStatus,
	DlDereg: DlDereg,
	wifiHypersprout: wifiHypersprout,
	wifiMeter: wifiMeter,
	hsDegister: hsDegister,
	downloadConfig: downloadConfig,
	endPointRegDreg: endPointRegDreg,
	filePath: filePath,
	Jobs: Jobs,
	UpdateConfig : UpdateConfig,
	firmwareMngmt: firmwareMngmt,
	firmwareMgmtMesh: firmwareMgmtMesh,
	DFirmwareresp: DFirmwareresp,
	rebootMngmt: rebootMngmt,
	macAclAll: macAclAll,
	macAclDv: macAclDv,
	macAclHs: macAclHs,
	clearLogsStatus: clearLogsStatus,
	verbosityLogsStatus: verbosityLogsStatus,
	fetchDeviceLogStatus: fetchDeviceLogStatus,
	factoryResetMngmt: factoryResetMngmt,
	SchedulerFlag: SchedulerFlag,
	configMgmt: configMgmt,
	CarrierResp: CarrierResp,
	Meshscan: Meshscan,
	EditDeltalinkBandwidthChangeResponse: EditDeltalinkBandwidthChangeResponse,
	BandwidthLimitationsResponse: BandwidthLimitationsResponse,
	DhcpParam: DhcpParam,
	DeltaLinkStatus: DeltaLinkStatus,
	getConnection : getConnection,
	MeshMacAclAddition : MeshMacAclAddition,
	DataRateResponse:DataRateResponse
}
