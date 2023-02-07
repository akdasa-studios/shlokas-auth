const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors')
const path = require('path');
const nano = require('nano')
const { CouchAuth } = require('@perfood/couch-auth');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

const connectionString = `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@${process.env.COUCHDB_HOST}:5984`
console.log(connectionString)
const nanoDb = nano(connectionString);
nanoDb.db.get(process.env.SHLOKAS_USERS_DB).catch(x => {
  nanoDb.db.create(process.env.SHLOKAS_USERS_DB).catch(x => {
    console.log("Can't create database...", x)
    throw x
  })
  // console.log("Database doesn't exist, exiting...", x); throw x
})

var config = {
  dbServer: {
    protocol: 'http://',
    host: `${process.env.COUCHDB_HOST}:5984`,
    user: process.env.COUCHDB_USER,
    password: process.env.COUCHDB_PASSWORD,
    userDB: process.env.SHLOKAS_USERS_DB,
    couchAuthDB: '_users'
  },
  // uncomment this if you want your users to select their own username an login with the username
  // local: {
  //   emailUsername: false, // store the username in the database instead of an auto-generated key
  //   usernameLogin: true, // allow login with username
  // },
  mailer: {
    fromEmail: 'Shlokas <akd@shlokas.app>',
    options: {
      service: process.env.EMAIL_HOST || "mail.privateemail.com",
      host: process.env.EMAIL_HOST || "mail.privateemail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.SHLOKAS_EMAIL,
        pass: process.env.SHLOKAS_EMAIL_PASSWORD
      }
    }
  },
  userDBs: {
    defaultDBs: {
      private: ['shlokas']
    }
  },
  emailTemplates: {
    folder: path.join(__dirname, './templates/email')
  }
};

// Initialize CouchAuth
var couchAuth = new CouchAuth(config);

// Mount CouchAuth's routes to our app
app.use('/auth', couchAuth.router);
app.get("/status", (req, res) => { res.json({ status: "ok" }) })
app.listen(app.get("port"), "0.0.0.0");
