const { Client } = require('pg')
const connectionData = {
    user: 'postgres',
    host: 'localhost',
    database: 'agenda_wilson',
    password: '2000depan', 
    port: 5432,
  }
const client = new Client(connectionData)
module.exports = client;