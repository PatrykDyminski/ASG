var mongoose = require('mongoose');
mongoose.Primies=global.Promise;
var Schema = mongoose.Schema;
var BFSchema = new Schema({
nazwa: {type:String, required: true},
adres: {type:String, required: true},
wsp: {type: String, required: true},
opis : {type :String, required: true}
},{collection: 'Battlefields'});

module.exports = mongoose.model('Battlefield', BFSchema);