var User = require('../models/user');
var Event = require('../models/event');
var Battlefield = require('../models/battlefield');
var Weapon = require ('../models/weapon');
var Item = require ('../models/item');
var Accesory = require ('../models/accessory');
const jwt = require('jsonwebtoken');
const validate = require('express-jsonschema').validate;
const queue = require("../queue.js")


module.exports = function(router){  
    router.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", value= "*");
        next();
      });

const checkToken = (req, res, next) => {
        const header = req.headers['authorization'];
    
        if(typeof header !== 'undefined') {
            const bearer = header.split(' ');
            const token = bearer[1];
    
            req.decode=jwt.verify(token,'POPOLUPO',(err,decoded)=>{
                if(err)
                {
                res.sendStatus(403);
                }
                else{
                    req.decoded=decoded;
                   // console.log(req.decoded);
                    next();
                }
            })
           
        } else {
            //If header is undefined return Forbidden (403)
            res.sendStatus(403)
        }
    }


router.get('/user',checkToken,function(req,res){
    
    User.findOne({googleID:req.decoded.userID}).select('googleID googleName photo').exec((err,user)=>{
        if(err)
        {
            res.json({succes:false,message:"Wystąpił błąd"});
        }
        else{
            if(!user)
            res.json({succes:false,message:'User not found'});
            else
            res.json({succes:true,message:'Found user',userID:user.googleID,name:user.googleName,photo:user.photo});
           
        }
        
    })

    
})

// PAYMENTS

router.put('/updateUserPayment', function(req,res){
    queue.sendMessageToEventsQueue("updateUserPayment", {body: req.body}, res)
})

router.get('/payment/authorize', function(req,res){
    queue.sendMessageToEventsQueue("payment/authorize", {body: {}}, res)
})

router.post('/payment/createOrder', function(req,res){
    queue.sendMessageToEventsQueue('payment/createOrder', {body: req.body}, res)
})

router.get('/orderDetails/:id', function(req,res){
    queue.sendMessageToEventsQueue("orderDetails", {body: req.params.id}, res)
})

// NOTIFICATIONS

var NotificationSchema = {
    type: 'object',
    properties: {
        "LastName": {
            type: 'string',
            required: true
        },
        "FirstName": {
            type: 'string',
            required: true
        },
        "Email": {
            type: 'string',
            required: true
        },
        "EventName": {
            type: 'string',
            required: true
        },
        "EventDate": {
            type: 'string',
            required: true
        },
        "EventLocation": {
            type: 'string',
            required: true
        }
    }
}

router.post("/notifications/send/", validate({body: NotificationSchema}),  function (req, res) {
    // #swagger.tags = ['Notifications'] 
    // #swagger.description = 'Test description'

    let notification = JSON.stringify(req.body)
    queue.sendMessageToNotificationsQueue(notification)

    res.send('Notification send')
});


return router;
};
