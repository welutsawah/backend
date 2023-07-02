const { UploadImage, DeleteImage } = require("./upload-image");

module.exports.updloadListImage = async (arrImg) => {
  const images = [];
  for (const imagePath of arrImg) {
    try {
      const { image_id, image_url } = await UploadImage(imagePath);
      images.push({ name: image_id, url: image_url });
    } catch (error) {
      throw new Error("Failed create product");
    }
  }

  return images;
};

module.exports.destroyListImage = async (arrImg) => {
  const images = [];

  for (const imagePath of arrImg) {
    try {
      const { image_id } = await DeleteImage(imagePath);
      images.push(image_id);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  return images;
};
