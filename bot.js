const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require("./config.json")
const token = config.token;

var webscrape = require('webscrape');
var scraper = webscrape.default();

let online = "0/100"; // Don't touch, it will change automatically 
let myServerName = config.serverName
let minutesForUpdate = config.timerDelayInMinutes;
var timer = null;

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log("Server Name: " + myServerName);
  console.log("Bot is running now.")
  timer = setInterval(() => {
    scrapOnline();
  }, 60000 * minutesForUpdate);
});

async function scrapOnline() {
  try {
    const result = await scraper.get('http://bully-mp.ru/API/getServers.php');
    if (result) {
      const servers = JSON.parse(result.body);
      let server = Object.values(servers).find((el) => el.name.includes(myServerName) === true);
      if (server !== undefined) {
        online = server.players + "/" + server.max_players;
        UpdateChannelName(online);
      } else {
        console.log("Server wasn't found on masterlist of Bully-MP")
      }
    }
  } catch (error) {
    console.log(error)
  }

}

function UpdateChannelName(tempOnline = "0/100") {
  let cache = client.channels.cache;
  let channelElement = cache.find((el) => el.name.includes("Server Online:") === true);
  const channel = client.channels.cache.get(channelElement.id);
  if (!channel) return console.error("Channel or Category wasn't found.");
  channel.setName("Server Online: " + tempOnline)
   let date = new Date();
  console.log("Time: " + date.getHours() + ":" + date.getMinutes() + " | " + "Current Online: " + tempOnline);
  client.user.setPresence({
    activities: [{ 
		name: "Server Online: " + tempOnline,
		type: "WATCHING"
		}],
    status: 'online',
  })
}
  