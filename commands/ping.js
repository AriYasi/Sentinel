module.exports = {
    name: 'ping',
    description: 'Returns response time of application and API.',
    execute(client, message, args) {
        message.channel.send(`Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms.`);
    }
};