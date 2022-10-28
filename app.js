const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const config = require("./config/dbconfig")
const Handlebars = require('./config/helper');
const logger = require('./logger/logger');



dotenv.config({ path: './.env'});
const app = express();
const db = mysql.createConnection(config);
const publicDirectory = path.join(__dirname, './public');
const uploadDirectory = path.join(__dirname, "./");

app.use(express.static(publicDirectory));
app.use(express.static(uploadDirectory));


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

//set view engine to HBS
app.set('view engine', 'hbs');

//connect to MYSQL database
db.connect( (error) => {
  if(error) {
    console.log(error)
  } else {
    console.log("MYSQL Connected...")
  }
})

//Define Routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

//start app in port 5001
app.listen(5001, () => {
  console.log("Server started on Port 5001");
  logger.info('Server running');
})



