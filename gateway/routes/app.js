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

// NEW EVENTS

router.get('/testEvents', function(req,res){
    queue.sendMessageToEventsQueue({endpoint: 'testEvents', body: {}}, res)
})

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

router.get('/getFields', function(req,res){
    Battlefield.find({},function(error,result){
        if(error)
            res.status(500).json({message:"Nie udało się pobrać lokacji"})
        else{
            res.status(200).json(result);
        }
    });
})

router.post('/postField', function(req,res){
    new Battlefield({
        nazwa: req.body.nazwa,
        adres: req.body.adres,
        wsp: req.body.wsp,
        opis: req.body.opis
    }).save((err, field)=>{
        if(err)
        {
            res.status(400).json({success:false, message:"Wystąpił błąd", created_id:''});
        }
        else{
            console.log(field);
        res.status(200).json({success:true,message:'Utworzono lokację', created_id: field._id});
        }
    });
});

    router.get('/getWeapons',function(req,res){
        
        Weapon.find({owner:req.query.owner},function(error,result){
            if(error)
                res.status(500).json({message:"Nie udało się pobrać lokacji"})
            else{
                res.status(200).json(result);
            }
        });
        
    });
    router.post('/postWeapon', function(req,res){ 
        new Weapon({
        owner: req.body.owner,    
        nazwa: req.body.nazwa,
        rodzaj:req.body.rodzaj,
        fps:req.body.fps,
        rof:req.body.rof,
        opis: req.body.opis,
        skuteczny: req.body.skuteczny
    }).save((err, weapon)=>{
        if(err)
        {
            res.status(500).json({success:false, message:"Wystąpił błąd", created_id:''});
        }
        else{
            console.log(weapon);
        res.status(200).json({success:true,message:'Dodano replikę', created_id: weapon._id});
        }});
    });
    router.put('/putWeapon', function(req,res){
         Weapon.updateOne({_id:req.body._id},req.body,function(error,result){
            if(error){
            console.log(error);
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Replika zaaktualizowana"});
            }
        });
    });
    router.delete('/deleteWeapon', function(req,res){
        Weapon.remove({_id:req.query._id},function(error,result){
            if(error){
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Broń usunięta"});
            }
        })
    });

    router.get('/getItems',function(req,res){
        Item.find({owner:req.query.owner},function(error,result){
            if(error)
                res.status(500).json({message:"Nie udało się pobrać lokacji"})
            else{
                res.status(200).json(result);
            }
        });
    });
    router.post('/postItem', function(req,res){
         new Item({
        owner: req.body.owner,    
        nazwa: req.body.nazwa,
        rodzaj:req.body.rodzaj,
        kamo: req.body.kamo,
        opis: req.body.opis
    }).save((err, item)=>{
        if(err)
        {
            res.status(400).json({success:false, message:"Wystąpił błąd", created_id:''});
        }
        else{
            
        res.status(200).json({success:true,message:'Dodano broń', created_id: item._id});
        }});
    });
    router.put('/putItem', function(req,res){
        Item.updateOne({_id:req.body._id},req.body,function(error,result){
            if(error){
            console.log(error);
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Replika zaaktualizowana"});
            }
        });

    });
    router.delete('/deleteItem', function(req,res){
        Item.remove({_id:req.query._id},function(error,result){
            if(error){
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Broń usunięta"});
            }
        })
    });

    router.get('/getAccesories',function(req,res){
        Accesory.find({owner:req.query.owner},function(error,result){
            if(error)
                res.status(500).json({message:"Nie udało się pobrać lokacji"})
            else{
                res.status(200).json(result);
            }
        });
    });
    router.post('/postAccesory', function(req,res){
        new Accesory({
            owner: req.body.owner,    
            nazwa: req.body.nazwa,
            rodzaj:req.body.rodzaj,
            opis: req.body.opis
        }).save((err, accesory)=>{
            if(err)
            {
                res.status(400).json({success:false, message:"Wystąpił błąd", created_id:''});
            }
            else{
                
            res.status(200).json({success:true,message:'Dodano broń', created_id: accesory._id});
            }});

    });
    router.put('/putAccesory', function(req,res){
        Accesory.updateOne({_id:req.body._id},req.body,function(error,result){
            if(error){
            console.log(error);
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Replika zaaktualizowana"});
            }
        });
    });
    router.delete('/deleteAccesory', function(req,res){
        Accesory.remove({_id:req.body._id},function(error,result){
            if(error){
            res.status(500).json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.status(200).json({success:true,message:"Broń usunięta"});
            }
        })
    });
    






return router;
};
