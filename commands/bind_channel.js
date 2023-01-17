const fs = require('node:fs');
const configFile = '../config.json';
const config = require(configFile);

module.exports = {
    name: 'bind_channel',
    description: 'Binds the commands to a channel, this is required to have access to the bot.',
    args: true,
    usage: '<CHANNEL ID:STRING>',
    permissions: ['OWNER'],
    async execute(client, message, args) {
        const [channelID] = args;
        
        config.administrative.bind_channel = channelID;

        client.channels.fetch(channelID)
            .then((channel) => {
                fs.writeFile('./config.json', JSON.stringify(config), (err) => {
                    if (err) return console.error(err);

                    message.channel.send(`Successfully bound to <#${channel.id}>`);

                });
            })
            .catch((err) => {
                console.error(err);
                return message.channel.send('Could not find channel.');

            });

    }
};