const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const nano = require('nano')
const { CouchAuth } = require('@perfood/couch-auth');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connectionString = `http://${process.env.COUCHDB_USER}:${process.env.COUCHDB_PASSWORD}@${process.env.COUCHDB_HOST}:5984`
const nanoDb = nano(connectionString);

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
    folder: path.join(__dirname, './templates/email'),
    data: {
      host: process.env.EMAIL_HOST_LINK || "https://shlokas.app"
    }
  }
};

// Initialize CouchAuth
var couchAuth = new CouchAuth(config);

// Mount CouchAuth's routes to our app
app.use('/', couchAuth.router);
app.get("/status", (req, res) => { res.json({ status: "ok" }) })
app.listen(app.get("port"), "0.0.0.0");
