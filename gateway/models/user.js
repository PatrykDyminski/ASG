var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
var UserSchema = new Schema(
  {
    googleID: { type: String, required: true, unique: true },
    googleName: { type: String, required: true },
    photo: { type: String, required: false, unique: false },
    email: { type: String, requierd: true, unique: false },
  },
  { collection: "Users" }
);

module.exports = mongoose.model("User", UserSchema);
