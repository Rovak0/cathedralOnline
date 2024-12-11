const path = require('path');
const express = require('express');
const sequelize = require('./config/connection');
const routes = require('./routes');
const session = require('express-session');

const SequelizeStore = require('connect-session-sequelize')(session.Store);

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.use(routes);


const sess = { //figure out what this does    // used for cookies
  cookie : {
        // maxAge sets the maximum age for the cookie to be valid. Here, the cookie (and session) will expire after 15 minutes. The time should be given in milliseconds.
        maxAge: 60 * 15 * 1000,
        // httpOnly tells express-session to only store session cookies when the protocol being used to connect to the server is HTTP.
        httpOnly: true,
        // secure tells express-session to only initialize session cookies when the protocol being used is HTTPS. Having this set to true, and running a server without encryption will result in the cookies not showing up in your developer console.
        secure: false,
        // sameSite tells express-session to only initialize session cookies when the referrer provided by the client matches the domain out server is hosted from.
        sameSite: 'strict',
  },
    secret: 'Super secret secret',
    resave: false,
    saveUninitialized: true,
    store: new SequelizeStore({
      db: sequelize,
    }),
  };

app.use(session(sess));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// app.listen(PORT, () =>
//   console.log(`App listening at http://localhost:${PORT}`)
// );
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log('Now listening at ', PORT));
});
