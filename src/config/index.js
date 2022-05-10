const {PORT, BOT_TOKEN, ADMIN_ID, ADMIN_PASSWORD} = require("./server")
const {connectionString} = require("./pool")

module.exports = {
   PORT: PORT,
   BOT_TOKEN: BOT_TOKEN,
   ADMIN_ID: ADMIN_ID,
   ADMIN_PASSWORD: ADMIN_PASSWORD,
   connectionString: connectionString
}