
// load the things we need
var express = require('express'), bodyParser = require('body-parser');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
require('dotenv').config({ path: './db.env' });
const port = process.env['PORT'];
const url = process.env['URL_DB'];
const mongoose = require('mongoose');
mongoose.connect(url);


// set the view engine to ejs
app.set('view engine', 'ejs');

var controller = require("./controller");

controller.controller(app);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})