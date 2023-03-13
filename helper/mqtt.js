const mqtt = require('mqtt');
var url = process.env.MQTT_URL;

var client = mqtt.connect(url, {
    clean: true,
    connectTimeout: 4000,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 1000,
    protocolId: 'MQTT',
    clientId: process.env.MQTT_CLIENTID,
    keepalive: 60
});

client.on('connect', () => {
    console.log(`Mqtt server Connected`)
})
client.on('error', (error) => {
    console.log(`Mqtt Cannot connect:`, error)
})
client.on('reconnect', (error) => {
    console.log("Mqtt Reconnecting..")
})


function mqttMessagePublish(topicName, publishData) {
    try {
        console.log("mqttMessagePublish : ",topicName);
        client.publish(topicName, JSON.stringify(publishData));
    } catch (error) {
        console.log("err", error);
    }

}



module.exports = {
    mqttMessagePublish: mqttMessagePublish,
}
