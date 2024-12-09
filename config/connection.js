const Sequelize = require('sequelize');
require('dotenv').config();

let sequelize;

//figure this out and fix it later
const DB_USER = "postgres"
const DB_PASSWORD = "TestTest"
const DB_NAME = "chess_db"

if (process.env.DB_URL) {
  sequelize = new Sequelize(process.env.DB_URL);
} else {
  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    {
      host: 'localhost',
      dialect: 'postgres'
    }
  );
}

module.exports = sequelize;
