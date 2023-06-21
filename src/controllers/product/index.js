const { prisma } = require("../../config/prisma");
const { IsValidDataURI } = require("../../utils");
const { UploadImage, DeleteImage } = require("../../utils/upload-image");

async function CreateProduct(req, res) {
  const { name, price, stock, image, category, description } = req.body;

  try {
    const { image_id, image_url } = await UploadImage(image);

    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        description,
        category: { connect: { id: category } },
        image: { create: { name: image_id, url: image_url } },
      },
    });

    res.status(201).json({ message: "product created", data: product });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

async function GetProduct(req, res) {
  const { take, skip } = req.query;
  try {
    const productLength = await prisma.product.count();
    const product = await prisma.product.findMany({
      select: {
        id: true,
        category: { select: { id: true, name: true } },
        image: { select: { id: true, name: true, url: true } },
        name: true,
        stock: true,
        price: true,
        _count: true,
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
    });

    res.status(200).json({
      take,
      skip,
      length: productLength,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function GetDetailProduct(req, res) {
  const { product_id } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: product_id },
      select: {
        id: true,
        category: { select: { id: true, name: true } },
        image: { select: { id: true, name: true, url: true } },
        name: true,
        stock: true,
        price: true,
        _count: true,
      },
    });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function UpdateProduct(req, res) {
  const { name, price, stock, image, category, description } = req.body;
  const { product_id } = req.params;

  try {
    const editedProduct = await prisma.product.findUnique({
      where: { id: product_id },
      select: {
        image: { select: { id: true, name: true, url: true } },
      },
    });

    let data = {
      name,
      price,
      stock,
      description,
      categoryId: category,
    };

    if (IsValidDataURI(image)) {
      const { image_id, image_url } = await UploadImage(image);
      data = {
        ...data,
        image: {
          delete: { id: editedProduct.image.name },
          create: { name: image_id, url: image_url },
        },
      };
    }

    const product = await prisma.product.update({
      where: { id: product_id },
      data,
    });

    res.status(200).json({ message: "product updated", data: product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function DeleteProduct(req, res) {
  const { product_id } = req.params;
  try {
    const product = await prisma.product.delete({
      where: { id: product_id },
      include: { image: true },
      select: { image: { select: { name: true } } },
    });

    await DeleteImage(product.image.name);

    res.status(200).json({ message: "product deleted", data: product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  CreateProduct,
  GetProduct,
  UpdateProduct,
  GetDetailProduct,
  DeleteProduct,
};
