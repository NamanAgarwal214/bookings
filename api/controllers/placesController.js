const Place = require("../models/Place");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

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

exports.getPlaces = async (req, res) => {
  try {
    const places = await Place.find();
    res.status(200).json({
      type: "success",
      places,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.getUserPlaces = async (req, res) => {
  try {
    const places = await Place.find({ user: res.locals.id });
    res.status(200).json({
      type: "success",
      places,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.getPlaceInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const place = await Place.findById(id);
    res.status(200).json({
      type: "success",
      place,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.addPhotos = async (req, res, next) => {
  try {
    // console.log(req.files.length);
    const { photos } = req.files;
    let uploadedFiles = [];

    Promise.all(
      photos.map(async (photo) => {
        return cloudinary.uploader.upload(photo.tempFilePath, {
          public_id: `${Date.now()}`,
          folder: "places",
        });
      })
    )
      .then((data) => {
        uploadedFiles = data.map((resp) => {
          return { url: resp.secure_url, id: resp.public_id };
        });
        return res.status(200).json({
          type: "success",
          url: uploadedFiles,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.removePhoto = async (req, res) => {
  try {
    cloudinary.uploader.destroy(req.body.id).then((data) => {
      if (data.result === "ok") {
        res.status(200).json({
          type: "success",
        });
      }
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    } = req.body;

    const newPlace = new Place({
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
      user: res.locals.id,
    });

    await newPlace.save();

    return res.status(200).json({
      type: "success",
      message: "added successfully",
      place: newPlace,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};

exports.updatePlace = async (req, res) => {
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;

  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          address,
          photos: addedPhotos,
          description,
          perks,
          extraInfo,
          checkIn,
          checkOut,
          maxGuests,
          price,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      type: "success",
      place: updatedPlace,
    });
  } catch (error) {
    res.json({
      type: "error",
      message: error.message,
    });
  }
};
