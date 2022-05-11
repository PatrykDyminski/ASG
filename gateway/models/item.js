var mongoose = require('mongoose');

mongoose.Promise=global.Promise;
  var Schema = mongoose.Schema;
var ItemSchema = new Schema({
owner: {type: String, required:true},    
nazwa: {type:String, required:true },
kamo:{type:String,required:false},
rodzaj: {type: String, required: false},
opis: {type: String, required: false}},
{collection: 'Items'},
);

 module.exports= mongoose.model('Item',ItemSchema);