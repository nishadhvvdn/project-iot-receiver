var Sequelize = require("sequelize");

var objDeviceConsumption = {
    id: { type: Sequelize.INTEGER,primaryKey: true, autoIncrement: true },
    Circuit_ID: { type: Sequelize.STRING(100) , unique: 'unique_device' },
    Transformer_ID: { type: Sequelize.INTEGER(11) },
    Transformer_SerialNumber: { type: Sequelize.STRING(100) , unique: 'unique_device' },
    Hypersprout_ID: { type: Sequelize.INTEGER(11) },
    Hypersprout_SerialNumber: { type: Sequelize.STRING(100) , unique: 'unique_device'},
    Meter_ID: { type: Sequelize.INTEGER(11)},
    Meter_SerialNumber: { type: Sequelize.STRING(100) , unique: 'unique_device' },
    Deltalink_ID: { type: Sequelize.INTEGER(11) },
    Deltalink_SerialNumber: { type: Sequelize.STRING(100),  unique: 'unique_device' },
    DataType: { type: Sequelize.STRING(100) },
    Transformer_DataRoute: {type: Sequelize.STRING(100) },
    Meter_DataRoute: {type: Sequelize.STRING(100) },
    DeltaLink_DataRoute: {type: Sequelize.STRING(100) },
    ReadTimestamp: { type: Sequelize.DATE() , unique: 'unique_device' },
    Transformer_DataUpload: { type: Sequelize.DECIMAL(20, 6) },
    Transformer_DataDownload: { type: Sequelize.DECIMAL(20, 6) },
    Transformer_Total: { type: Sequelize.DECIMAL(20, 6) },
    Transformer_NetworkLatency: { type: Sequelize.DECIMAL(20,6) },
    Meter_DataUpload: { type: Sequelize.DECIMAL(20, 6) },
    Meter_DataDownload: { type: Sequelize.DECIMAL(20, 6) },
    Meter_Total: { type: Sequelize.DECIMAL(20, 6) },
    Meter_NetworkLatency: { type: Sequelize.DECIMAL(20,6) },
    DeltaLink_DataUpload: { type: Sequelize.DECIMAL(20,6) },
    DeltaLink_DataDownload: { type: Sequelize.DECIMAL(20,6) },
    DeltaLink_Total: { type: Sequelize.DECIMAL(20,6) },
    DeltaLink_NetworkLatency: { type: Sequelize.DECIMAL(20,6) },
    IsHyperHub: { type: Sequelize.BOOLEAN }
}

var objTableProps = {
    timestamps: true,
    freezeTableName: true,
    tableName: 'device_dataconsumption'
}

module.exports = {
    objDeviceConsumption: objDeviceConsumption,
    objTableProps: objTableProps
}