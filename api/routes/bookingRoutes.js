const {
  getBookings,
  createBooking,
  protect,
} = require("../controllers/bookingController");

const router = require("express").Router();

router.get("/allBookings", protect, getBookings);
router.post("/create", protect, createBooking);

module.exports = router;
