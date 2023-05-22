const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  address: String,
  photos: [mongoose.Schema.Types.Mixed],
  description: String,
  perks: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
  price: Number,
});

const Place =
  mongoose.models.Place || mongoose.model("placeSchema", placeSchema);

module.exports = Place;
