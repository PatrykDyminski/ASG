var mongoose = require('mongoose');

mongoose.Promise=global.Promise;
  var Schema = mongoose.Schema;
var AccesorySchema = new Schema({
owner: {type: String, required:true},    
nazwa: {type:String, required:true },
rodzaj:{type:String,required:false},
opis:{type: String, required: false}
},

{collection: 'Accesory'},
);

 module.exports= mongoose.model('Accesory',AccesorySchema);