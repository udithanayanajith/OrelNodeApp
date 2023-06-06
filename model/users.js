const mongooseDB = require("mongoose");
const userShcema = mongooseDB.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const collection = new mongooseDB.model("users", userShcema);
module.exports = collection;
