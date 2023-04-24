const redis = require('redis');
const client = redis.createClient({
    password: '5MuV35lkrHkJtAhBmWjwfUjjRibt1cHO',
    socket: {
        host: 'redis-12187.c282.east-us-mz.azure.cloud.redislabs.com',
        port: 12187
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