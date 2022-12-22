const { Schema, model } = require("mongoose");

const schema = new Schema({
  id: { type: String },
  name: { type: String },
  email: { type: String, required: true, unique: true },
});

module.exports = model("Users", schema);
