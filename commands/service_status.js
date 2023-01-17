const minecraftAPIScript = require('../api_scripts/minecraft_status');

module.exports = {
    name: 'service_status',
    description: 'List data and configurations of a particular service.',
    args: true,
    usage: '<SERVICE NAME:STRING>',
    permissions: ['OWNER', 'USER'],
    async execute(client, message, args) {
        const [serviceName] = args;
        const sqliteService = client.getService.get(serviceName);

        if (!sqliteService) return message.channel.send("Invalid service name given.");

        //Only works for minecraft server for now.
        minecraftAPIScript('67.187.212.114', sqliteService.service_name)
            .then(response => {
                message.channel.send({ embeds: [response] })
            });
    }
};