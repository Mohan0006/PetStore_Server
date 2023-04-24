const redis = require('redis');


const client = redis.createClient({
    password: 'ZipWfWo5GCs3GxCZAvF0bdUxjQkeVhxr',
    socket: {
        host: 'redis-13243.c56.east-us.azure.cloud.redislabs.com',
        port: 13243
    }
});
client.connect();
client.on('connect', function() {
    console.log('Redis connected successfully');
});

client.on('error', function (err) {
    console.log('Error: ' + err);
});


module.exports = client;