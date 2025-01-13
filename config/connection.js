const Sequelize = require('sequelize');
require('dotenv').config();

let sequelize;

//figure this out and fix it later
const DB_USER = "postgres"
const DB_PASSWORD = "TestTest"
const DB_NAME = "chess_db"

if (process.env.Internal_Database_URL) {
  sequelize = new Sequelize(process.env.Internal_Database_URL);

}
// else if(process.env.External_Database_URL){
//   console.log("Outside base");
//   sequelize = new Sequelize(process.env.External_Database_URL);
// }
else {
  sequelize = new Sequelize(
    // DB_NAME,
    // DB_USER,
    // DB_PASSWORD,
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: 'localhost',
      dialect: 'postgres'
    }
  );
}

// async function testSqlize(){
//   try{
//     await sequelize.authenticate();
//     console.log("FIND ME: Pass sequilize");
  
//   }
//   catch(err){
//     console.log("FIND ME: Failed sequilize");
//   }
// }

// testSqlize();

module.exports = sequelize;
