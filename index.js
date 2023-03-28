const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const nano = require('nano');
const { useUserController } = require('./controllers/user');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connectionString = "http://dev:dev@localhost/db/"
const users = useUserController(connectionString)
// users.register("test", "test").then(x => console.log(x))
// users.isRegistered("test").then(x => console.log(x))



// Mount CouchAuth's routes to our app
app.post('/users', async (req, res) => {
    const users = useUserController(connectionString)
    const { email, password } = req.body
    const isRegistered = await users.isRegistered(email)

    if (isRegistered) {
        res.status(400).json({ error: "User already registered" })
        return
    }

    users.register(email, password)
})


app.get("/status", (req, res) => { res.json({ status: "ok" }) })
app.listen(app.get("port"), "0.0.0.0");
