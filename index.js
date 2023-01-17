const fs = require('node:fs');
const path = require('node:path');
const SQLite = require('better-sqlite3');
const sql = new SQLite('./services_database.sqlite');
const { Client, Intents, Collection } = require('discord.js');
const { token, administrative, users } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands')
const commands = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commands) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.name, command);
}

client.once('ready', c => {
    //Load sqlite table and check if it is available. Create a new table if it is not.
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'server_services';").get();

    if (!table['count(*)']) {
        sql.prepare("CREATE TABLE server_services (id TEXT PRIMARY KEY, service_name TEXT, service_data TEXT);").run();
        sql.prepare("CREATE UNIQUE INDEX idx_services_id ON server_services (id);").run();
        sql.pragma("synchronous = 1");
        sql.pragma("journal_mode = wal");
    }

    client.getService = sql.prepare("SELECT * FROM server_services WHERE service_name = ?");
    client.setService = sql.prepare("INSERT OR REPLACE INTO server_services (id, service_name, service_data) VALUES (@id, @service_name, @service_data);");

    console.log(`Client is Ready. Logged in as ${c.user.tag}`);
});

const prefix = '.'
client.on('messageCreate', (message) => {
    //Setup command, arguments, and do a check if they use a prefix.
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //Get commands from  client.commands collection and check if they are a valid command
    const getCMD = client.commands.get(command);
    if (!getCMD) return;
    
    if (getCMD.args && !args.length && getCMD.name) return message.channel.send(`You did not provide any arguments.\nUsage: \`${getCMD.usage}\``);
    if(!administrative["bind_channel"] && getCMD.name != "bind_channel") return message.channel.send("You have not bound a channel to use the commands.");

    const userData = users.find(usr => usr.id == "141320718766833664");
    if (getCMD.permissions && (!userData || !getCMD.permissions.includes(userData["permission_level"]))) return message.channel.send("You do not have proper permissions to use this command");

    //Check if channel bind is active

    if (getCMD.name == "bind_channel") return getCMD.execute(client, message, args);
    
    client.channels.fetch(administrative.bind_channel)
        .then((channel) => { 
            if (message.channel.id != channel.id) return;

            getCMD.execute(client, message, args);
        })
        .catch((error) => console.error(error));

});

client.login(token);