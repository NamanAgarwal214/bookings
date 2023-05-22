const cloudinary = require("cloudinary").v2;
// const imageDownloader = require("image-downloader");
const multer = require("multer");

const storage = multer.memoryStorage();

exports.multerUploads = multer({ storage }).array("photos", 100);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadImages = async (req, res) => {
  try {
    // const result = await cloudinary.uploader.upload(file.content, {
    //   public_id: `${Date.now()}`,
    //   folder: "images",
    // });
    // res.json({
    //   result,
    // });
  } catch (error) {
    res.json(error.message);
  }
};

// exports.uploadByLink = async (req, res) => {
//   const { link } = req.body;
//   const name = "photo" + Date.now() + ".jpg";
//   console.log("link", link);
//   let result;
//   imageDownloader
//     .image({
//       url: link,
//       dest: "../../uploads/" + name,
//     })
//     .then(async (file) => {
//       console.log("file", file);
//       result = await cloudinary.uploader.upload(`../uploads/${name}`, {
//         public_id: `${Date.now()}`,
//         folder: "images",
//       });
//     })
//     .catch((err) => {
//       console.log("error", err.message);
//     });
//   res.json({
//     result,
//   });
// };
