const mongooseDB = require("mongoose");

const drugShcema = mongooseDB.Schema({
  gName: { type: String, required: true },
  dBrand: { type: String, required: true },
});

const collection = new mongooseDB.model("drugs", drugShcema);
module.exports = collection;
