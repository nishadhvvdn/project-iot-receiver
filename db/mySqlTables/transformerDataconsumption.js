var Sequelize = require("sequelize");

var objDeviceConsumption = {
    id: { type: Sequelize.INTEGER,primaryKey: true, autoIncrement: true },
    device_mac_id :{type: Sequelize.STRING(17) },
    Circuit_ID: { type: Sequelize.STRING(100) },
    Transformer_ID: { type: Sequelize.INTEGER(11) },
    Transformer_SerialNumber: { type: Sequelize.STRING(100) },
    Hypersprout_ID: { type: Sequelize.INTEGER(11) },
    Hypersprout_SerialNumber: { type: Sequelize.STRING(100) },
    DataType: { type: Sequelize.STRING(100) },
    DataRoute: {type: Sequelize.STRING(100) },
    DeviceType: {type: Sequelize.STRING(100) },
    Actual_ReadTimestamp: { type: Sequelize.DATE() },
    Number_of_device: { type: Sequelize.INTEGER(11) },
    DataUpload: { type: Sequelize.DECIMAL(20, 6) },
    DataDownload: { type: Sequelize.DECIMAL(20, 6) },
    Total: { type: Sequelize.DECIMAL(20, 6) },
    DataUploadDiff : { type: Sequelize.DECIMAL(20, 6) },
    DataDownloadDiff : { type: Sequelize.DECIMAL(20, 6) },
    TotalDiff : { type: Sequelize.DECIMAL(20, 6) },
    NetworkLatency: { type: Sequelize.DECIMAL(20,6) },
    IsHyperHub: { type: Sequelize.BOOLEAN }
}
var objTableProps = {
    timestamps: true,
    freezeTableName: true,
    tableName: 'transformer_dataconsumption'
}

module.exports = {
    objDeviceConsumption: objDeviceConsumption,
    objTableProps: objTableProps
}