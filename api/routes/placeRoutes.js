const {
  protect,
  getUserPlaces,
  getPlaces,
  createPlace,
  getPlaceInfo,
  updatePlace,
  addPhotos,
  removePhoto,
} = require("../controllers/placesController");

const router = require("express").Router();

router.get("/places", getPlaces);
router.get("/user-places", protect, getUserPlaces);
router.post("/addPlace", protect, createPlace);
router.get("/:id", protect, getPlaceInfo);
router.put("/updatePlace", protect, updatePlace);
router.post("/uploadPhotos", protect, addPhotos);
router.post("/removePhoto", protect, removePhoto);

module.exports = router;
