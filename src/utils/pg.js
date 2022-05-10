const { Pool } = require("pg")
const { connectionString } = require('../config')

const pool = new Pool(connectionString)

const fetch = async (SQL, values) => {
   const client = await pool.connect()

   try{
      const {rows} = await client.query(SQL, values)
      return rows
   }catch(error){
      console.log(error);
   }finally{
      client.release()
   }
}

const fetchAll = async (SQL) => {
   const client = await pool.connect()

   try{
      const {rows} = await client.query(SQL)
      return rows
   }catch(error){
      console.log(error);
   }finally{
      client.release()
   }
}

module.exports = {
   fetch,
   fetchAll
}