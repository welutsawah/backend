const { cloudinary, uploadImageOptions } = require("../config/cloudinary");

module.exports.UploadImage = (image) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, uploadImageOptions, (error, result) => {
      if (result && result.secure_url) {
        return resolve({
          image_id: result.public_id,
          image_url: result.url,
        });
      }
      return reject({ message: error.message });
    });
  });
};

module.exports.GetImage = (image_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.resource(image_id, (error, result) => {
      if (result) {
        return resolve(result);
      }
      return reject({ message: error.message });
    });
  });
};

module.exports.DeleteImage = (image_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      image_id,
      uploadImageOptions,
      (error, result) => {
        if (result) {
          return resolve({ image_id, result });
        }
        return reject({ message: error.message });
      }
    );
  });
};
