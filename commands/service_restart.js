const { exec } = require('child_process');
const needle = require('needle');

module.exports = {
    name: 'service_restart',
    description: 'Restart the system.d daemon based off of the name.',
    args: true,
    usage: '<SERVICE NAME:STRING>',
    permissions: ['OWNER', 'USER'],
    execute(client, message, args) {
        //ONLY WORKS FOR MINECRAFT AT THE MOMENT
        const [serviceName] = args;
        const sqliteService = client.getService.get(serviceName);

        if (!sqliteService) return message.channel.send("Invalid service name given.");

        const address = '67.187.212.114';

        const API_REQUEST = `https://api.mcsrvstat.us/2/${address}`
        needle('get', API_REQUEST, { json: true })
            .then(response => {
                const JSONResponse = response.body;
                const serverStatus = JSONResponse.online;

                if (serverStatus) return message.channel.send('Server is online, No need for restart.');

                exec(`systemctl restart ${sqliteService.service_name}`, (err, stdout, stderr) => {
                    if (err) return console.error(err);
                    if (stderr) return console.error(stderr);
                    
                    message.channel.send('Service has restarted, please wait until it is accessible.');
                });
            })
            .catch(err => console.error(err));
    }
};