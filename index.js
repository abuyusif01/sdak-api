const { User, Door, Permission } = require('./models');
const bodyParser = require("body-parser");
const express = require("express");
const https = require('https');
const db = require('./models')
const cors = require("cors");
const fs = require('fs');

const app = express();
db.sequelize.sync().then(() => { })




let corsOptions = {
    origin: "https://localhost:8081"
};

app.use(cors(corsOptions));

// // parse requests of content-type - application/json
app.use(bodyParser.json());

// // parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


// // simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to SDAK application. The cool https version!!" });
});

// routes
require('./api/routes/adminRoutes')(app);
require('./api/routes/authRoutes')(app);
require('./api/routes/userRoutes')(app);
// require('./api/routes/modRoutes')(app);


//https options 
const httpsOptions = {
    cert: fs.readFileSync('./ssl/localhost.crt'),
    key: fs.readFileSync('./ssl/localhost.key')
};
// create https server
let server = https.createServer(httpsOptions, app);
// set port, listen for requests

server.listen(8081, () => {
    console.log('I am listening.....');
});