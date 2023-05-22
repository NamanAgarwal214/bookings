const {
  multerUploads,
  uploadImages,
} = require("../controllers/imageController");
const DataURIParser = require("datauri/parser");
const Datauri = require("datauri/parser");
const path = require("path");
const router = require("express").Router();
const dUri = new DataURIParser();

router.post(
  "/photo",
  (req, res, next) => {
    let dataUri = [];
    multerUploads(req, res, function (err) {
      if (err) {
        console.log(err);
      } else {
        for (let i = 0; i < req.files.length; i++) {
          dataUri.push(
            dUri.format(
              path.extname(req.files[i].originalname).toString(),
              req.files[i].buffer
            )
          );
        }
      }
    });

    next();
  },
  (req, res) => {
    // console.log(res.locals);
  }
  //   uploadImages
);

module.exports = router;
