const express = require('express');
const sequelize = require('./config/connection');
const routes = require('./routes');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(routes);


// app.listen(PORT, () =>
//   console.log(`App listening at http://localhost:${PORT}`)
// );
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening at ', PORT));
});
