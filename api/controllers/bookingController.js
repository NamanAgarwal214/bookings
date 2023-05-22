const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  let decoded;
  if (token) {
    try {
      decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        type: "error",
        message: error.message,
      });
    }

    try {
      const currentUser = await User.findById({ _id: decoded.sub });
      if (!currentUser) {
        throw new Error("The user does not exist anymore.");
      }
      res.locals.id = decoded.sub;
      console.log("Success from middleware");
      next();
    } catch (error) {
      return res.status(500).json({
        type: "error",
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      type: "error",
      message: "You aren't Logged In",
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: res.locals.id }).populate({
      path: "place",
    });
    console.log(bookings);
    res.status(200).json({
      type: "success",
      bookings,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
      req.body;

    console.log(req.body);

    const booking = new Booking({
      user: res.locals.id,
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
    });

    await booking.save();

    res.status(200).json({
      type: "success",
      booking,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};
