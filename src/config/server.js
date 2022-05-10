require('dotenv').config()

module.exports = {
   PORT: process.env.SERVER_PORT,
   BOT_TOKEN: process.env.BOT_TOKEN,
   ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
   ADMIN_ID: process.env.ADMIN_ID
}
