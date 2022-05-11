require('dotenv').config()
const express = require('express')
const fs = require("fs");
const Bot = require("node-telegram-bot-api")

const { PORT, BOT_TOKEN, ADMIN_PASSWORD, ADMIN_ID } = require('./config/index')
const { fetch, fetchAll } = require('./utils/pg')

const app = express()
const bot = new Bot(BOT_TOKEN, {
   polling: true,
});


// ----------------- VARIABLES ------------------ //

let chatId = 0
let ready = []
let clients = []
let clientStep = null

// let accessNumber = ''
// let sentNumber = ''
let userToDelete

// ------------------- FUNCTIONS ------------------- //

const insertDot = (values, readay) => {
   let marray = []
   let sarray = []
   let revChars = []
   const final = []

   for(let i = 0; i<ready.length; i++){

      const chars = JSON.stringify(ready[i]).split(/(?!$)/) 
      revChars = chars.reverse()

      for(let i = 0; i < chars.length; i++){
         if(i % 3 == 0 && i != 0){
            marray.push(',')
         }
         marray.push(revChars[i])
      }
      sarray = marray.reverse()
      sarray = sarray.join('')
      final.push(`${values[i]}\xa0\xa0${sarray} so'm`)
      sarray = []
      marray = []
   }
   return final
}

const insertDotTotal = (total) => {
   let marray = []
   let sarray = []
   let revChars = []

   const chars = JSON.stringify(total).split(/(?!$)/) 
   revChars = chars.reverse()

   for(let i = 0; i < chars.length; i++){
      if(i % 3 == 0 && i != 0){
         marray.push('.')
      }
      marray.push(revChars[i])
   }
   sarray = marray.reverse()
   sarray = sarray.join('')
   return sarray
}

async function calcWhite (id){
   let currency
   let i3
   let i4
   let i5
   let i6
   let forWhite
   let forDecorative

   let valuesToSend = []
   let perimetr = 0
   let square = 0
   let totalSquare = 0
   let totalAmount = 0
   let overSize = 0

   let date = null
   let day = null
   let month = null
   let year = null
   let hour = null
   let minute = null
   let second = null
   let period

   const colorSeriya = await fetch('select color, seriya from characters where telegram_id = $1', [id])
   const {color, seriya} = colorSeriya[0]
   const [data] = await fetch('select dimensions from characters where telegram_id = $1', [id])
   const {dimensions} = data

   dimensions.forEach(e => {
      let num = null
      let num2 = []
      let width = 0
      let height = 0
      let quantity = 0

         if(e != ''){

            e = e.replaceAll(/\,/ig, '.')
            num = e.match(/\d+\.*\d*/g)
            
            num.forEach(c => {
               if(c == 0){
                  throw "o'lcham no'lga teng"
               }
               num2.push(c)
            })

            if(num2.length < 3){
               throw "o'lcham yetarli emas"
            }
            else if(num2[2].includes(".")){
               throw "noto'g'ri miqdor"
            }

            num2.forEach(n => {
               if(n.includes(".")){
                  n = n.split(".")
                  if(n[1].length > 1){
                     throw "nuqtadan keyin bittadan ko'p"
                  }
               }
            })

            if(num2.length > 3){
               throw "uchtadan ko'p"
            }

            valuesToSend.push(num2.join('=').replace('=', 'x'))
            
            height = Number(num2[0]) * 10 + 31
            width = Number(num2[1]) * 10 + 31
            quantity = Number(num2[2])

            if(height > 3031 || width > 3031 || quantity > 300){
               perimetr = 0
               totalSquare = 0
               totalAmount = 0
               overSize = 0
               valuesToSend = []
               throw "oversize"
            }
         }

         perimetr = perimetr + ((height + width) * quantity / 1000 * 2)
         square = (height * width / 1000000)
         totalSquare = totalSquare + ((height * width / 1000000 * quantity))
         totalAmount = totalAmount + quantity

         if(square > 1){
            overSize = overSize + ((square * quantity) - quantity)
         }
   })

   ;await (async function test(){
      const values = await fetchAll(`select * from values`)
      const {aksessuar, nak, nak2, setka, rezina, oq_profil, dekor_profil, kurs, muddat} = values[0]
      i3 = (aksessuar + nak) * kurs     // 62.445
      i4 = nak2 * kurs              // 32.200
      i5 = setka * kurs / 48 * 1.3    // 10.901
      i6 = rezina * kurs / 100        // 713
      forWhite = oq_profil * kurs       // 74.290
      forDecorative = dekor_profil * kurs  // 81.305
      period = muddat
   })()

   let i2
   const colorType = await getPaintType(color)

   if(colorType === "simple"){
      i2 = forWhite * 1.32 * 1.035 
   }else if(colorType === "decorative"){
      i2 = forDecorative * 1.32 * 1.035 
   }

   const j2 = perimetr * i2 / 6
   const j3 = totalAmount * i3
   const j4 = overSize * i4
   const j5 = totalSquare * i5
   const j6 = perimetr * i6

   const total = Math.round((j2+j3+j4+j5+j6)/5000)*5000 

   ;(function (){
      date = new Date()
      day = ("0" + date.getDate()).slice(-2)
      month = "0" + (date.getMonth()+1)
      year = date.getFullYear()  
      hour = ("0" + date.getHours()).slice(-2)  
      minute = ("0" + date.getMinutes()).slice(-2)
      second = ("0" + date.getSeconds()).slice(-2)
   })()

   return bot.sendMessage(id, `${day+'.'+month+'.'+year}\t\t${hour+':'+minute+':'+second}\nRangi:\t\t<b>${color}</b>\nProfili:\t\t<b>${seriya}</b>\r\n \r\n<b>bo'yi/eni/soni</b>\r\n${valuesToSend.join("\n")}  \r\n  \r\nSoni:\t\t<b>${totalAmount} ta</b>\r\nSumma:\t\t<b>${insertDotTotal(total)}</b>\nMuddati: <b>${'\u00b1'+period} kun</b>`, {
      reply_markup: {
         keyboard: [["boshidan boshlash"]],
         resize_keyboard: true,
      },
      parse_mode: 'HTML'
   })
}

async function calcColorful (per, sqr, amount, over){

   let currency
   let i3
   let i4
   let i5
   let i6
   let forWhite
   let forDecorative

   ;await (async function test(){

      const values = await fetchAll(`select * from values`)
      const {aksessuar, nak, nak2, setka, rezina, oq_profil, dekor_profil, kurs, muddat} = values[0]
      i3 = (aksessuar + nak) * kurs     // 62.445
      i4 = nak2 * kurs              // 32.200
      i5 = setka * kurs / 48 * 1.3    // 10.901
      i6 = rezina * kurs / 100        // 713
      forWhite = oq_profil * kurs       // 74.290
      forDecorative = dekor_profil * kurs  // 81.305
      period = muddat
   })()

   const i2 = forDecorative * 1.32 * 1.035 
   const j2 = per * i2 / 6
   const j3 = amount * i3
   const j4 = over * i4
   const j5 = sqr * i5
   const j6 = per * i6

   const total = Math.round((j2+j3+j4+j5+j6)/5000)*5000

   return total
}

const getPaintType = async (color) => {
   const decorative = [
      "Zolotoy Dub",
      "Dub Mokko",
      "306G/Aluks Antrazit",
      "Sheffild Seriy 7006",
      "Sheffild Alpine 9006dm",
      "Sheffild Beton 484",
      "Svetliy Dub",
      "Qora 9005",
      "Mahagon 8017",
      "Seriy 9006",
      "Seriy 7011",
      "boshqa rang",
   ]

   const simple = [
      "Oq"
   ]

      if(simple.includes(color)){
         return "simple"
      }else if(decorative.includes(color)){
         return "decorative"
      }
}

const onStart = async (msg) => {
   clients = getStep()
   let currentClient = clients.find(e => {return msg.chat.id == e.chatId})

   if(!currentClient){
      const newClient = {
      chatId: chatId,
      name: msg.from.first_name,
      step: "color"
   } 
   clients.push(newClient)
   currentClient = newClient
   clientStep = "color"
            
   updateStep(clients)
   }else{
      clients.forEach(c => {
         if(c.chatId == msg.chat.id){
            c.step = "color"
            currentClient = c
         }
      })
      fs.writeFileSync(__dirname + "/step.json", JSON.stringify(clients, null, 4))
      clientStep = "color"
   }

   await colorMenu(msg.chat.id)
}

const colorMenu = (id) => {
   return bot.sendMessage(id, "Rangini tanlang:", {
      reply_markup: {
         inline_keyboard: [
            [{ text: "Oq", callback_data: "Oq" },
            { text: "Zolotoy Dub", callback_data: "Zolotoy Dub" },
            { text: "Dub Mokko", callback_data: "Dub Mokko" }],
            [{ text: `306G/Aluks\nAntrazit`, callback_data: "306G/Aluks Antrazit" },
            { text: "Sheffild Seriy 7006", callback_data: "Sheffild Seriy 7006" },
            { text: "Sheffild Alpine 9006dm", callback_data: "Sheffild Alpine 9006dm" }],
            [{ text: "Sheffild Beton 484", callback_data: "Sheffild Beton 484" },
            { text: "Svetliy Dub", callback_data: "Svetliy Dub" },
            { text: "Qora 9005", callback_data: "Qora 9005" }],
            [{ text: "Mahagon 8017", callback_data: "Mahagon 8017" },
            { text: "Seriy 9006", callback_data: "Seriy 9006" },
            { text: "Seriy 7011", callback_data: "Seriy 7011" }],
            [{ text: "boshqa rang", callback_data: "boshqa rang" }],
         ],
      }
   });
} 

const seriyaMenu = (id) => {
   return bot.sendMessage(id, "Profil seriyasini tanlang:", {
      reply_markup: {
         inline_keyboard: [
            [{text: "Akfa 6000/5200", callback_data: "Akfa 6000/5200"},
            {text: "Akfa 7000", callback_data: "Akfa 7000"},
            {text: "Engelberg 7000", callback_data: "Engelberg 7000"}],
            [{text: "Termo 70", callback_data: "Termo 70"},
            {text: "Termo 65", callback_data: "Termo 65"},
            {text: "Termo 78", callback_data: "Termo 78"}],
            [{text: "Aldoks", callback_data: "Aldoks"},
            {text: "Imzo 8000", callback_data: "Imzo 8000"},
            {text: "Ekopen 6000 Forward", callback_data: "Ekopen 6000 Forward"}],
            [{text: "Ekopen 7000 Prime", callback_data: "Ekopen 7000 Prime"},
            {text: "Alutex Termal", callback_data: "Alutex Termal"},
            {text: "Rehau", callback_data: "Rehau"}],
            // {text: "Akfa Termo 57", callback_data: "Akfa Termo 57"},
            // {text: "Ekopen 6000 Lite", callback_data: "Ekopen 6000 Lite"},
            // [{text: "Ekopen 6000 Elite", callback_data: "Ekopen 6000 Elite"},
            
            [{text: "boshqa profil", callback_data: "boshqa profil"}]
         ]
      }
   })
}

const getSize = (id) => {
   return bot.sendMessage(id, "Kiriting:\tbo'yi▪️eni▪️soni") 
}

const getStep = (newStep) => {
   return JSON.parse(fs.readFileSync(__dirname + '/step.json'))
}

const updateStep = (data) => {
   return fs.writeFileSync(__dirname + "/step.json", JSON.stringify(data, null, 4))
}

const editStep = (data, newStep, id) => {
   data.forEach(c => {
      if(c.chatId == id){
         c.step = newStep
      }
   })
   return data
}

const chosen = (chat_id, msg_id, data) => {
   return bot.editMessageReplyMarkup({
            inline_keyboard: [[
               {text: `${data}  ${'\u2705'}`, callback_data: data}
            ]]},
            {
               chat_id: chat_id, 
               message_id: msg_id
            })
}

// ------------------------- ADMIN ------------------------ //

const mainMenuAdmin = async (id) => {
   if(id === ADMIN_ID - 0){

      bot.sendMessage(ADMIN_ID - 0, "tanlang:", {
         reply_markup: {
            keyboard: [["klientlar", "qiymatlar"]],
            one_time_keyboard: true,
            resize_keyboard: true
         },
      })

      clients = getStep()
      clients.forEach(c => {
         if(c.chatId == ADMIN_ID){
            c.step = "admin"
         }
      })
      updateStep(clients)
   }
}

const requestNumber = async (id) => {
   return await bot.sendMessage(id, "kiriting:", {
      reply_markup: {
         keyboard: [["orqaga"]],
         resize_keyboard: true,
         one_time_keyboard: true
      },
   })
}

const valuesSection = async (id, message) => {
   clients.forEach(c => {
      if(c.chatId == id){
         c.step = "sectionValues"
      }
   })

   updateStep(clients)
   return await bot.sendMessage(id, message ? message : "qiymatlar:", {
      reply_markup: {
         keyboard: [["aksessuar", "nak 1", "nak 2"], ["setka", "rezina", "oq profil"],["dekor profil", "kurs", "muddat"], ["orqaga", "ro'yxat"]],
         // one_time_keyboard: true,
         resize_keyboard: true
      }
   })
}

const clientsSection = async (id, message) => {
   clients = getStep()
   clients.forEach(c => {
      if(c.chatId == id){
         c.step = "sectionClients"
      }
   })
   updateStep(clients)
   return await bot.sendMessage(id, message ?  message : "klientlar:", {
      reply_markup: {
         keyboard: [["klient +", "klient -", "ro'yxat"], ["orqaga"]],
         // one_time_keyboard: true,
         resize_keyboard: true
      }
   })
   
}

try{

//------------------------  START  --------------------------//
   bot.onText(/\/start/, async (msg) => {
      
      const userAccess = await fetch(`select user_access from users where user_telegram_id = ${msg.chat.id}`)

      if(!userAccess.length){

         bot.sendMessage(msg.chat.id, "Botdan foydalanish uchun\nTelefon raqamingizni yuboring", {
            reply_markup: {
               keyboard: [[{text: "raqamni yuborish", request_contact: true}]],
               resize_keyboard: true,
               one_time_keyboard: true
            }
         })
      }else{
         onStart(msg)
      }
   });

      bot.on("contact", async (msg) => {
         const sentNumber = msg.contact.phone_number
         const accessNumber = await fetch(`select num_id from phoneNumbers where num_self = ${sentNumber}`)

         if(accessNumber.length){
            onStart(msg)
            const user = await fetch(`select user_telegram_id from users where user_telegram_id = ${msg.from.id}`)

            if(!user.length){
               const userId = await fetch(`insert into users (user_telegram_id, user_phone_number, user_ref_id) values ($1, $2, $3) returning user_id`, [msg.from.id, sentNumber, accessNumber[0].num_id])
               const telegramId = await fetch('select telegram_id from characters where telegram_id = $1', [msg.from.id])
               if(!telegramId.length){
                  await fetch('insert into characters (telegram_id, character_ref_id) values ($1, $2);', [msg.from.id, userId[0].user_id])
               }
            }

         }else{
            bot.sendMessage(msg.from.id, "Siz botdan foydalana olmaysiz")
         }
      })
   

//------------------------ ON MESSAGE --------------------------//
      bot.on("message", async (msg) => {
         
         clients = getStep()
         const text = msg.text
         clients.forEach(c => { if(c.chatId == msg.chat.id){ clientStep = c.step}})

         const userAccess = await fetch(`select user_access from users where user_telegram_id = $1`, [msg.chat.id])

         if(!userAccess.length && text != "/start" && !msg.contact){
            bot.sendMessage(msg.chat.id, "Siz botdan foydalana olmaysiz")

         } else if(userAccess.length && userAccess[0].user_access === true){
            try{

               if(clientStep == "getSize" && text != 'boshidan boshlash' && text != '/start' && text != 'admin'){
                  values = text.split('\n')
                  await fetch(`update characters set dimensions = $1 where telegram_id = $2`, [msg.text.split('\n'), msg.chat.id])

                  await calcWhite(msg.chat.id)
         
                  clients = getStep()
                  clients.forEach(c => {
                     if(c.chatId === msg.chat.id){
                        c.step = "color"
                     }
                  })
                  updateStep(clients)
               }
            }catch(error){
               await bot.sendMessage(msg.chat.id, "Xatolik. Boshidan kiriting")
               bot.sendMessage(msg.chat.id, "Kiriting:\tbo'yi▪️eni▪️soni")
               console.log(error);
            }
         }

      })

//------------------------ ON QUERY ------------------------//  

      bot.on('callback_query', async (msg) => {
         chatId = msg.message.chat.id
         try{
         
            const data = msg.data
            clients = getStep()
            const {step} = clients.find( c => {
               return c.chatId == msg.message.chat.id
            })

            if(step == "color"){
               color = data
               await fetch('update characters set color = $1 where telegram_id = $2', [msg.data, msg.message.chat.id])
               clients = getStep()
               clients.forEach( c => {
                  if(c.chatId == msg.message.chat.id){
                     c.step = "seriya"
                  }
               })
               updateStep(clients)
               await seriyaMenu(msg.message.chat.id)
            }
            else if(step == "seriya"){
               seriya = data
               await fetch('update characters set seriya = $1 where telegram_id = $2', [msg.data, msg.message.chat.id])

               clients = getStep()
               clients.forEach( c => {
                  if(c.chatId == msg.message.chat.id){
                     c.step = "getSize"
                  }
               })
               updateStep(clients)
               await getSize(msg.message.chat.id)
            }
            
            chosen(msg.from.id, msg.message.message_id, msg.data)

            fs.writeFileSync(__dirname + "/step.json", JSON.stringify(clients, null, 4))

            bot.answerCallbackQuery(callback_query_id = msg.id)
         }catch(error){
            console.log(error);
         }
      })

      //------------------------ FROM BEGINNING ------------------------//
      bot.onText(/boshidan boshlash/, async (msg) => {

         const userAccess = await fetch(`select user_access from users where user_telegram_id = $1`, [msg.chat.id])
         if(userAccess.length){

            clients = getStep()
            clients.forEach( c => {
               if(c.chatId == msg.chat.id){
                  c.step = "color"
               }
            })
            updateStep(clients)
            await colorMenu(msg.chat.id)
         }
      })

      //------------------------- ADMIN --------------------------//

      bot.onText(/admin/, async (msg) => {
         
         mainMenuAdmin(msg.chat.id)
      })

      bot.onText(/Admin/, async (msg) => {
         
         mainMenuAdmin(msg.chat.id)
      })

      //------------------------- CLIENTS SECTION --------------------------//

      bot.onText(/klientlar/, async (msg) => {
         
         clients = getStep()
         const {step} = clients.find( c => {
            return c.chatId == msg.chat.id
         })

         if(msg.chat.id == ADMIN_ID && step == "admin"){
            clientsSection(msg.chat.id)
         }
      })

      //------------------------- ADD CLIENT --------------------------//

      bot.onText(/klient +/, async (msg) => {
         
         if(msg.chat.id == ADMIN_ID){

            if(msg.text == "klient +"){
               requestNumber(msg.chat.id)
            }
            
            clients = getStep()
            clients.forEach( c => {
               if(c.chatId === msg.chat.id){
                  c.step = "addUser"
               }
            })
            updateStep(clients)
         }
      })

      //------------------------- DELETE CLIENT --------------------------//

      bot.onText(/klient -/, async (msg) => {
         

         if(msg.chat.id == ADMIN_ID){

            await requestNumber(msg.chat.id)
            
            clients = getStep()
            clients.forEach( c => {
               if(c.chatId === msg.chat.id){
                  c.step = "deleteUser"
               }
            })
            updateStep(clients)
         }
      })

      // ---------------------------- RO'YXAT ---------------------------- //

      bot.onText(/ro'yxat/, async (msg) => {
         
         clients = getStep()
         const {step} = clients.find( c => {
            return c.chatId == msg.chat.id
         })

         if(step == "sectionClients"){

            const data = await fetchAll('select num_self from phoneNumbers')
            let clientsList = []
            let count = 1
            data.forEach(c => {
               clientsList.push(count++ + ".\t" + c.num_self)
            })

            bot.sendMessage(msg.chat.id, clientsList.join("\n"))
            clientsSection(msg.chat.id)

         }else if(step == "sectionValues"){

            let aksessuar = "aksessuar - "
            let nak1 = "nak 1 - "
            let nak2 = "nak 2 - "
            let rubber = "rezina - "
            let grid = "setka - "
            let white_profil = "oq profil - "
            let decor_profil = "dekor profil - "
            let currency = "kurs - "
            let period = "muddat - "

            const data = await fetchAll('select * from values')
            aksessuar = aksessuar + data[0].aksessuar
            nak1 = nak1 + data[0].nak
            nak2 = nak2 + data[0].nak2
            rubber = rubber + data[0].rezina
            grid = grid + data[0].setka
            white_profil = white_profil + data[0].oq_profil
            decor_profil = decor_profil + data[0].dekor_profil
            currency = currency + data[0].kurs
            period = period + data[0].muddat

            const valsToSend = [aksessuar, nak1, nak2, grid, rubber, white_profil, decor_profil, currency, period]

            bot.sendMessage(msg.chat.id, valsToSend.join("\n"))
            valuesSection(msg.chat.id)
         }
      })

      // ------------------------- VALUES SECTION ------------------------ //

      bot.onText(/qiymatlar/, async (msg) => {
         
         clients = getStep()
         const {step} = clients.find( c => {
            return c.chatId == msg.chat.id
         })

         if(msg.chat.id == ADMIN_ID && step == "admin"){
            valuesSection(msg.chat.id)
         }
         
      })


      //------------------------- BACK --------------------------//

      bot.onText(/orqaga/, async (msg) => {
         clients = getStep()
         let step
         if(clients.length){
            step = clients.find(c => {
               return msg.chat.id == c.chatId
            }).step
         }

         if(msg.chat.id == ADMIN_ID){
         
         if(step == "addUser" || step == "deleteUser"){
            clientsSection(msg.chat.id)

         }else if(step === "aksessuar" || step === "nak 1" || step === "nak 2" || step === "setka" || step === "rezina" || step === "oq profil" || step === "dekor profil" || step === "kurs" || step === "muddat"){
            valuesSection(msg.chat.id)
            clients = getStep()
            clients.forEach(c => {
               if(c.chatId == msg.chat.id){
                  c.step = "sectionValues"
               }
            })
            updateStep(clients)
         }else if(step == "sectionClients" || step == "sectionValues"){
            bot.sendMessage(ADMIN_ID - 0, "tanlang:", {
               reply_markup: {
                  keyboard: [["klientlar", "qiymatlar"]],
                  one_time_keyboard: true,
                  resize_keyboard: true
               }
            })

            clients = getStep()
            clients.forEach(c => {
               if(c.chatId == msg.chat.id){
                  c.step = "admin"
               }
            })
            updateStep(clients)
         }
      }
      })

      bot.on("polling_error", console.log);

      // --------------------- ON MESSSAGE ----------------------- //

      bot.on("message", async (msg) => {
         
         const text = msg.text
         clients = getStep()
         const user = clients.find(c => {
            return c.chatId == msg.chat.id
         })

         if(msg.chat.id == ADMIN_ID && user){
            const {step} = clients.find(c => {
                  return msg.chat.id === c.chatId
            })

            if(step == "deleteUser" &&  text != "admin" && text != "orqaga" && text != "/start" ){
               userToDelete = await fetch(`select num_self from phoneNumbers where num_self = $1`, [text])
               if(!userToDelete.length){
                  bot.sendMessage(msg.chat.id, "bunday foydalanuvchi mavjud emas")
               }
            }

            if(step == "addUser" && text.match("^[0-9]*") && text.includes('+')){
               const phoneNumber = await fetch(`select num_self from phoneNumbers where num_self =$1`, [text])
               if(!phoneNumber.length){
                  await fetch(`insert into phoneNumbers (num_self) values ($1)`, [text])
                  clientsSection(msg.chat.id, "klient  qo'shildi")
               }else{
                  bot.sendMessage(msg.chat.id, "bu foydalanuvchi mavjud")
               }

            }else if(step == "addUser" && text.match("^[0-9]*$")) {
               const phoneNumber = await fetch(`select num_self from phoneNumbers where num_self =$1`, [text])
               if(!phoneNumber.length){
                  await fetch(`insert into phoneNumbers (num_self) values ($1)`, [text])
                  clientsSection(msg.chat.id, "klient qo'shildi")
               }else{
                  bot.sendMessage(msg.chat.id, "bu foydalanuvchi mavjud")
               }

            }else if(step == "addUser" && text != "admin" && text != "orqaga" && !text.match("^[0-9]*$")){
               bot.sendMessage(msg.chat.id, "noto'g'ri raqam kiritildi")

            }else if(step == "deleteUser" && text != "admin" && text != "orqaga" && text != "/start" && userToDelete.length && userToDelete[0].num_self == text){
               await fetch(`delete from phoneNumbers where num_self = $1 returning *`, [text])
               
               clientsSection(msg.chat.id, "Klient o'chirildi")
            }

            if(text === "aksessuar" || text === "nak 1" || text === "nak 2" || text === "setka" || text === "rezina" || text === "oq profil" || text === "dekor profil" || text === "kurs" || text === "muddat"){
               updateStep(editStep(clients, text, msg.chat.id))
               bot.sendMessage(msg.chat.id, "kiriting:", {
                  reply_markup: {
                     keyboard: [["orqaga"]],
                     resize_keyboard: true,
                     one_time_keyboard: true
                  }
               })
            }

            if(text != "orqaga" && step === "aksessuar" || step === "nak 1" || step === "nak 2" || step === "setka" || step === "rezina" || step === "oq profil" || step === "dekor profil" || step === "kurs" || step === "muddat"){
               let val
               if(text != "orqaga" && text.match("^[0-9]*")){
                  if(step == "nak 1"){
                     val = "nak"
                  }else if(step == "nak 2"){
                     val = "nak2"
                  }else if(step == "oq profil"){
                     val = "oq_profil"
                  }else if(step == "dekor profil"){
                     val = "dekor_profil"
                  }else{
                     val = step
                  }

                  await fetch(`update values set ${val} = $1 where value_id = 1`, [text])
                  valuesSection(msg.chat.id, String.fromCodePoint("0x"+'1f197'))
               }
            }
         }
      })

}catch(error){
   console.log(error);
}

app.get("/", (req, res) => {
   res.send("ok")
   res.status(200)
})

app.post("5340693714:AAHKqqMXD_8CN_6u9Yhmkei8TA0Ty__7YW0", (req, res) => {
   bot.processUpdate(req.body)
   res.status(200)
})

app.listen( PORT || 4000, () => {
   console.log("server is running on port:", PORT || 4000)
})
