const fs = require('node:fs');
const path = require('node:path');

module.exports = {
    name: 'service_add',
    description: 'Adds a service to the database.',
    args: true,
    usage: '<ID:INT> <NAME:STRING> <DATA:DICTIONARY>',
    permissions: ['OWNER'],
    execute(client, message, args) {
        const [serviceName, serviceID] = args;
        const serviceData = JSON.parse(args.slice(2).join(" "));
        const HOMEDIR = '/home/yasinskiy0'
        
        if (!serviceData["directory"]) return message.channel.send('Error in adding service. No directory specified in data argument.\nExample: `{"directory": "~/"}`'); 

        const serviceDirectory = path.join(HOMEDIR, serviceData["directory"]);

        fs.access(serviceDirectory, err => {
            if (err) return message.channel.send("```[Error] Could not find directory where the service is located.```");

            let sqliteService = client.getService.get(serviceName);

            if (sqliteService) return message.channel.send("Service already exists");

            sqliteService = {
                id: serviceID,
                service_name: serviceName,
                service_data: JSON.stringify(serviceData)
            }

            client.setService.run(sqliteService);

            //Creates and loads a new system.d service
            const systemdTemplateContent = `[Unit]\nDescription=${serviceData["description"]}\nAfter=network.target\n\n[Service]\nWorkingDirectory=${serviceDirectory}\nExecStart=/usr/bin/env ${serviceDirectory}${serviceData["script"]}\nType=simple\n\n[Install]\nWantedBy=multi-user.target\n`;
            const systemdTemplateLocation = `/etc/systemd/system/${serviceName}.service`;

            fs.writeFileSync(systemdTemplateLocation, systemdTemplateContent);

            message.channel.send(`The service \`${serviceName}\` has been added to the database.`);
        });
    }
};