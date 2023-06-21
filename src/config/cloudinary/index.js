const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();

const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

const uploadImageOptions = {
  resource_type: "image",
  folder: "souvenir-murah-banyuwangi/",
};

module.exports = { cloudinary, uploadImageOptions };
