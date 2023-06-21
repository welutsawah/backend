const { prisma } = require("../../config/prisma");

async function CreateCategory(req, res) {
  const { name } = req.body;

  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json({ message: "category created", data: category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function GetCategory(req, res) {
  try {
    const category = await prisma.category.findMany();
    res.status(200).json({ data: category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function UpdateCategory(req, res) {
  const { category_id } = req.params;
  const { name } = req.body;

  try {
    const category = await prisma.category.update({
      where: { id: category_id },
      data: { name },
    });

    res.status(200).json({ data: category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function DeleteCategory(req, res) {
  const { category_id } = req.params;
  try {
    const category = await prisma.category.delete({
      where: { id: category_id },
    });
    res.status(200).json({ data: category });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  CreateCategory,
  GetCategory,
  UpdateCategory,
  DeleteCategory,
};
