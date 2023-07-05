const { prisma } = require("../../config/prisma");

const { updloadListImage, destroyListImage } = require("../../utils/product");

async function CreateProduct(req, res) {
  const {
    name,
    price,
    stock = 0,
    images,
    category,
    description,
    code,
  } = req.body;

  try {
    const listImage = await updloadListImage(images);

    const product = await prisma.product.create({
      data: {
        name,
        code,
        description,
        stock: Number(stock),
        price: Number(price),
        category: { connect: { id: category } },
        images: { createMany: { data: listImage } },
      },
    });

    res.status(201).json({ message: "product created", data: product });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

async function GetProduct(req, res) {
  const { take, skip, category, name } = req.query;
  try {
    const productLength = await prisma.product.count();
    const product = await prisma.product.findMany({
      where: {
        categoryId: category,
        name: { contains: name, mode: "insensitive" },
      },
      select: {
        id: true,
        category: { select: { id: true, name: true } },
        images: { select: { id: true, name: true, url: true } },
        name: true,
        stock: true,
        price: true,
        description: true,
        code: true,
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
        images: { select: { id: true, name: true, url: true } },
        name: true,
        stock: true,
        price: true,
        description: true,
        code: true,
        _count: true,
      },
    });
    res.status(200).json({ data: product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function UpdateProduct(req, res) {
  const {
    name,
    price,
    stock = 0,
    images,
    category,
    description,
    code,
  } = req.body;
  const { product_id } = req.params;

  try {
    const editedProduct = await prisma.product.findUnique({
      where: { id: product_id },
      select: {
        images: { select: { id: true, name: true, url: true } },
      },
    });

    const listImageProduct = editedProduct.images.map((value) => {
      return value.id;
    });

    const deletedImage = listImageProduct.filter(
      (value) => !images.includes(value)
    );

    const newImage = images.filter(
      (value) => !listImageProduct.includes(value)
    );

    const listImage = await updloadListImage(newImage);
    const listDestroyedImage = await destroyListImage(deletedImage);

    const imageCreateMany = listImage.length !== 0 && {
      createMany: { data: listImage },
    };

    const product = await prisma.product.update({
      where: { id: product_id },
      data: {
        name,
        code,
        description,
        categoryId: category,
        stock: Number(stock),
        price: Number(price),
        images: {
          deleteMany: { id: { in: listDestroyedImage } },
          ...imageCreateMany,
        },
      },
    });

    res.status(200).json({ message: "product updated", data: product });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

async function DeleteProduct(req, res) {
  const { product_id } = req.params;
  try {
    const product = await prisma.product.delete({
      where: { id: product_id },
      select: { images: { select: { name: true, id: true } } },
    });

    const listImageProduct = product.images.map((value) => {
      return value.id;
    });

    await prisma.image.deleteMany({ where: { id: { in: listImageProduct } } });

    await destroyListImage(listImageProduct);

    res.status(200).json({ message: "product deleted", data: product });
  } catch (error) {
    console.log(error);
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
