const Sequelize = require('sequelize')
const database = require('../env');
let sequelize = new Sequelize(
  database.databaseName,
  database.databaseUser,
  database.databasePassword, {
    host: database.databaseHost,
    dialect: database.databaseType,
    omitNull: true
})

if(database.databaseTestConexion) {
  sequelize
  .authenticate()
  .then(data => {
    console.log('Connection has been established successfully', data);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
}

module.exports = sequelize;