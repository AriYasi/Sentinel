const { MessageEmbed } = require('discord.js')
const needle = require('needle')

module.exports = function (address, serverName) {
    const API_REQUEST = `https://api.mcsrvstat.us/2/${address}`

    return needle('get', API_REQUEST, { json: true })
        .then(response => {
            const JSONResponse = response.body;

            const serverIP = JSONResponse.ip
            const serverStatus = JSONResponse.online;
            const serverVersion = JSONResponse.version
            const onlinePlayers = '' + JSONResponse.players.online;
            const serverPlayersMax = '' + JSONResponse.players.max;
            const listPlayers = JSONResponse.players.list ? JSONResponse.players.list.join('\n') : 'No on online';
            
            //return the statuses?
            return new MessageEmbed()
            .setColor(`${serverStatus ? '#B5D5C5' : '#FF9F9F'}`)
            .setTitle('Service Status')
            .setDescription(`${serverName}`)
            .addFields(
                { name: 'IP', value:  `${serverIP}`, inline: true },
                { name: 'Status', value:  `${serverStatus ? 'Online': 'Offline'}`, inline: true },
                { name: 'Version', value:  `${serverVersion}`, inline: true },
                { name: 'Players online: ', value: `${onlinePlayers}/${serverPlayersMax}`, inline: false},
                { name: 'List of players: ', value: `${listPlayers}`, inline: false},
        );


        })
        .catch(err => console.error(err));
}