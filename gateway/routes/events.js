const express = require("express");
const router = express.Router();
var validate = require('express-jsonschema').validate;
const queue = require("./queue.js.js")


router.post('/event', function(req,res){
    queue.sendMessageToEventsQueue({endpoint: 'event', body: req.body}, res)
})

router.get('/events',function(req,res){
    queue.sendMessageToEventsQueue({endpoint: 'events', body: {}}, res)
})

router.put('/unsignUser',function(req,res){
    queue.sendMessageToEventsQueue({endpoint: "unsignUser", body: req.body}, res)
})

router.put('/updateEvent',async function(req,res){
    queue.sendMessageToEventsQueue({endpoint: "updateEvent", body: req.body}, res)    
})

router.put('/signUser',async function(req,res){
    queue.sendMessageToEventsQueue({endpoint: "signUser", body: req.body}, res)    
})

router.delete('/deleteEvent', function(req,res){
    queue.sendMessageToEventsQueue({endpoint: "deleteEvent", body: req.body}, res)    
})

module.exports = router;