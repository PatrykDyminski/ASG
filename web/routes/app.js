var User = require('../models/user');
var Event = require('../models/event');
var Battlefield = require('../models/battlefield');
var Weapon = require ('../models/weapon');
var Item = require ('../models/item');
var Accesory = require ('../models/accessory');
const { response } = require('express');
const jwt = require('jsonwebtoken');
const { deleteOne } = require('../models/user');
const { isValidObjectId } = require('mongoose');
const { json } = require('body-parser');


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


/*
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
            res.json({succes:true,message:'Found user',userID:user.googleID,name:user.googleName,photo:user.photo, mail: user.email});
           
        }
        
    })

    
})
*/

router.post('/event', function(req,res){
    new Event({
        organizator:req.body.organizator,
    nazwa:req.body.nazwa,
    wsp:req.body.wsp,
    miejsce:req.body.miejsce,
    rodzaj:req.body.rodzaj,
    limity:req.body.limity,
    oplata:req.body.oplata,
    termin:req.body.termin,
    roznica:req.body.roznica,
    frakcje:req.body.frakcje,
    opis:req.body.opis

    }).save((err, event)=>{
        if(err!==null)
        {
           console.log(err);
            res.status(400).json({success:false, message:"Wystąpił błąd", created_id:''});
        }
        else{
            
            console.log(err);
        res.status(200).json({success:true,message:'Utworzono wydarzenie', created_id: event._id});
        }
    });
   
})
router.get('/events',function(req,res){
    var date = new Date();
    date.setDate(date.getDate()-1);
    date.setHours(23,59,59);
    //console.log(date);
    Event.find({"termin":{"$gte": date}},function(error,result){
        if(error)
        console.log(error)
        else{
            res.json(result);
        }
    });
})
router.put('/unsignUser',function(req,res){
    Event.updateOne({"_id":req.body._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body.gracz}}},{safe:true,multi:true},function(error,result){
        if(error){
            console.log(error);
            res.json({success:false,message:"Wystąpił błąd"})
            }
            else{
                res.json({success:true,message:"Wypisano z wydarzenia"});
            }
    })
})
router.put('/updateEvent',async function(req,res){
    await Event.updateOne({_id:req.body._id},req.body,function(error,result){
        if(error){
        console.log(error);
        res.json({success:false,message:"Wystąpił błąd"})
        }
        else{
            res.json({success:true,message:"Wydarzenie zaaktualizowane"});
        }
    });
    
})

router.put('/signUser',async function(req,res){
    if(req.body.params._id==='') {
        res.status(200).json({success:false, message:' Musisz być zalogowany'})
    }
    else{

    await Event.updateOne({"_id":req.body.params._id},{$pull:{"frakcje.$[].zapisani":{"_id":req.body.params._idGracz}}},{safe:true,multi:true});
    await Event.updateOne({"_id":req.body.params._id},{$addToSet:{"frakcje.$[s].zapisani":{_id:req.body.params._idGracz,imie:req.body.params.gracz, czy_oplacone: req.body.params.czy_oplacone}}},
    {arrayFilters:[{"s.strona":req.body.params.strona}],upsert:true},function(error,result){
       if(error)
       console.log(error);
       else{
           if(result.nModified==0)
           {
               res.json({message:"Już jesteś zapisany"});
           }
           else{
            res.json({message:"Zostałeś zapisany"});
           }
           
       }

})}
})

router.delete('/deleteEvent', function(req,res){
    Event.remove({_id:req.query._id},function(error,result){
        if(error){
        console.log(error);
        res.json({success:false,message:"Wystąpił błąd"})
        }
        else{
            res.json({success:true,message:"Wydarzenie usunięte"});
        }
    })
})



    router.put('/updateUserPayment', function(req,res){
         Event.updateOne({_id:req.body.params._id},
            ///some creazy logic to write
            {
                $set: {
                    //"frakcje.$[f].zapisani.[z].czy_oplacone" : req.body.params.czy_oplacone 
                    //"frakcje.$[f].zapisani.$[z].czy_oplacone" : req.body.params.czy_oplacone 
                    "frakcje.$[f].zapisani.$[z].czy_oplacone" : req.body.params.czy_oplacone  
                }
            },
            {
                arrayFilters:[
                    {
                        "f.strona": req.body.params.strona
                    },
                    {
                        "z._id": req.body.params._idGracz
                    }
                ]
            }
            ,function(error,result){
            if(error){
            console.log(error);
            res.json({success:false,message:"Wystąpił błąd"})
            }
            else{
                console.log(result);
                res.json({success:true,message:"Zapisano opłatę"});
            }
        });
        
    })
    






return router;
};
