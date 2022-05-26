var mongoose = require('mongoose');
// const socketIO = require('socket.io');

// const io=socketIO(server);
const queue = require("./queue.js")

queue.init()

 mongoose.Promise=global.Promise;
 mongoose.connect('mongodb://localhost:27017/AsgApp',  { useNewUrlParser: true,useUnifiedTopology: true },function (err){
     if(err) {
         console.log("Not connected to the database "+err);
     }else {
         console.log('Succesfully connected to AsgApp');
     }
 })


console.log("EVENTS WORKING")

