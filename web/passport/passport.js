
var GoogleStrategy = require('passport-google-oauth20').Strategy
var User = require('../models/user');
const jwt = require('jsonwebtoken');


module.exports = function(app,passport){

    
    app.use(passport.initialize());
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", value= "*");
      next();
    });
  
    passport.serializeUser(function(user, done) {
        done(null, user);
      });
      
      passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
      });

    passport.use(new GoogleStrategy({
        clientID: '360134415185-ru8j8nj84i016rbv6uaou37tgl0qn00s.apps.googleusercontent.com',
        clientSecret: 'yomlk6mTDEbW0azLE2jk3cm7',
        callbackURL: "http://localhost:3000/auth/google/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        
        User.findOne({googleID: profile.id}).then((currentUser)=>{
          if(currentUser){
            //if we already have a record with the given profile ID
            done(null, currentUser);
          } else{
               //if not, create a new user 
             new User({
                googleID: profile._json.sub,
                googleName:profile._json.name,
                photo:profile._json.picture
              }).save().then((newUser) =>{
                
                done(null, newUser);
              });
             
      }
     })}));
     
    app.get('/auth/google',
    passport.authenticate('google', {session: false, scope: ['https://www.googleapis.com/auth/plus.login'] }));

  app.get('/auth/google/callback', passport.authenticate('google', {session: false, failureRedirect: '/' }),
    function(req, res) {
      console.log(req.user);
     const token = jwt.sign({userID:req.user.googleID},'POPOLUPO',{expiresIn:'24h'} )
     res.cookie('ASGjwt',token);
     
     res.redirect('http://localhost:4200');
    
    });
    return passport;
}
