var Sequelize = require("sequelize");

var objDeviceConsumption = {
    id: { type: Sequelize.INTEGER,primaryKey: true, autoIncrement: true },
    Deltalink_ID :{type: Sequelize.INTEGER(11) },
    Deltalink_SerialNumber: { type: Sequelize.STRING(100) },
    DataType: { type: Sequelize.STRING(100) },
    DeviceType: { type: Sequelize.STRING(100) },
    Deltalink_Mac_Id: { type: Sequelize.STRING(17) },
    ReadTimestamp: { type: Sequelize.DATE()  },
    User_Mac_Id: { type: Sequelize.STRING(17) },
    User_Hostname: { type: Sequelize.STRING(100) },
    User_DataUpload: { type: Sequelize.DECIMAL(20, 6) },
    User_DataDownload: { type: Sequelize.DECIMAL(20, 6) },
    User_Total: { type: Sequelize.DECIMAL(20, 6) }
}

var objTableProps = {
    timestamps: true,
    freezeTableName: true,
    tableName: 'deltalink_clients_hourly'
}

module.exports = {
    objDeviceConsumption: objDeviceConsumption,
    objTableProps: objTableProps
}