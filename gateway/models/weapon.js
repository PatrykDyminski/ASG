var mongoose = require('mongoose');

mongoose.Promise=global.Promise;
  var Schema = mongoose.Schema;
var WeaponSchema = new Schema({
owner: {type: String, required:true},    
nazwa: {type:String, required:true},
rodzaj:{type:String,required:true},
fps:{type:String, required:true,unique:false},
rof: {type: Number, required: false},
opis: {type: String, required: false},
skuteczny: {type:Number, require: false}},

{collection: 'Weapons'},
);

 module.exports= mongoose.model('Weapon',WeaponSchema);