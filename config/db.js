const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.dbName, process.env.dbUserName, process.env.dbPassword, {
  host: process.env.dbHost,
  dialect: 'postgres',
});

module.exports = sequelize;
