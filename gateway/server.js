var express = require ('express');
var app= express();
var path = require('path');
var mongoose = require('mongoose');
var morgan = require('morgan');
var router = express.Router();
var appRoutes = require('./routes/app')(router);
var bodyParser = require('body-parser');
var passport = require('passport');
var social = require('./passport/passport')(app,passport);
var cors = require('cors');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const queue = require("./queue.js")

queue.init()

const server=express().use(app).listen(3000);
const io=socketIO(server);


app.use(function (err, req, res, next) {
    var responseData;
  
    if (err.name === "JsonSchemaValidation") {
      // Log the error however you please
      console.log(JSON.stringify(err.message));
      // logs "express-jsonschema: Invalid data found"
  
      // Set a bad request http response status or whatever you want
      res.status(400);
  
      // Format the response body however you want
      responseData = {
        statusText: "Bad Request",
        jsonSchemaValidation: true,
        validations: err.validations, // All of your validation information
      };
  
      // Take into account the content type if your app serves various content types
      if (req.xhr || req.get("Content-Type") === "application/json") {
        res.json(responseData);
      } else {
        // If this is an html request then you should probably have
        // some type of Bad Request html template to respond with
        res.render("badrequestTemplate", responseData);
      }
    } else {
      // pass error to next error middleware handler
      next(err);
    }
  });
  
app.use(express.static(__dirname+'/client/dist'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Methods", 'GET,POST,PATCH,DELETE,PUT,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Authorization, Origin, Content-Type, X-Auth-Token, content-type, Access-Control-Request-Method');
    next();
  });
app.use('/api',appRoutes);

console.log("GATEWAY WORKING")

// mongoose.Promise=global.Promise;
// mongoose.connect('mongodb://localhost:27017/AsgApp',  { useNewUrlParser: true,useUnifiedTopology: true },function (err){
//     if(err) {
//         console.log("Not connected to the database "+err);
//     }else {
//         console.log('Succesfully connected to AsgApp');
//     }
// })



