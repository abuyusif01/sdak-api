const fs = require('fs');
const mqtt = require('mqtt');

const caFile = fs.readFileSync('ssl/ca.crt');

const options = {
    clientId: '0001',
    protocol: 'mqtts',
    ca: caFile,
    rejectUnauthorized: true, // make sure the cert is valid
    username: 'user',
    password: '1234',
    
};

const client = mqtt.connect('mqtt://localhost:8883', options);

// Set callback handlers
client.on('connect', onConnect);
client.on('message', onMessageArrived);
client.on('error', onError);

// Called when the client connects
function onConnect() {
    console.log('Connected to MQTT broker');
    client.subscribe('World');
    //   client.publish('World', 'Hello');
}

// Called when a message arrives
function onMessageArrived(topic, message) {
    console.log(`Received message on topic ${topic}: ${message.toString()}`);
}

// Called when an error occurs
function onError(error) {
    console.error('MQTT error:', error);
}
