const fs = require('node:fs');
const configFile = '../config.json';
const config = require(configFile);

module.exports = {
    name: 'permission_add',
    description: 'Grants a user permission rights.',
    args: true,
    usage: '<USER ID:STRING> <PERMISSIONS:ARRAY>',
    permissions: ['OWNER'],
    execute(client, message, args) {
        const [userIDSearch, permission] = args;

        client.users.fetch(userIDSearch)
            .then((user) => {
                const userID = user.id;

                config["users"].push({id: userID, permission_level: permission});

                fs.writeFile('./config.json', JSON.stringify(config), (err) => {
                    if (err) return console.error(err);

                    message.channel.send(`Added permissions [${permission}] to ${user.username}.`);

                });
            })
            .catch((err) => {
                console.error(err);

                message.channel.send('Could not find user.');
            });
    }
};