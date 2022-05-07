var User = require('../models/user');
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










return router;
};
