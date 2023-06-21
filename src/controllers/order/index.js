const { prisma } = require("../../config/prisma");
const { GenerateUniqueCode, DecodeSignature } = require("../../utils");
const { UploadImage, DeleteImage } = require("../../utils/upload-image");

async function CreateOrder(req, res) {
  const {
    orderProduct,
    customerName,
    whatsappNumber,
    description,
    eventDate,
    pickupDate,
    address,
    status,
  } = req.body;
  try {
    const { id: userId } = await DecodeSignature(req);
    const orderCode = GenerateUniqueCode();

    const order = await prisma.order.create({
      data: {
        userId,
        orderCode,
        customerName,
        whatsappNumber,
        description,
        eventDate,
        pickupDate,
        address,
        status,
        orderProduct: { createMany: { data: orderProduct } },
      },
    });

    res.status(201).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function GetOrder(req, res) {
  const { take, skip } = req.query;

  try {
    const orderLength = await prisma.order.count();
    const order = await prisma.order.findMany({
      select: {
        address: true,
        customerName: true,
        description: true,
        eventDate: true,
        id: true,
        orderCode: true,
        orderDate: true,
        paymentProof: true,
        pickupDate: true,
        status: true,
        whatsappNumber: true,
        user: { select: { email: true, id: true } },
        orderProduct: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                image: true,
                category: { select: { name: true } },
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      take,
      skip,
      length: orderLength,
      data: order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function GetUserOrder(req, res) {
  try {
    const { id: userId } = await DecodeSignature(req);

    const order = await prisma.order.findMany({
      where: { userId },
      select: {
        address: true,
        customerName: true,
        description: true,
        eventDate: true,
        id: true,
        orderCode: true,
        orderDate: true,
        paymentProof: true,
        pickupDate: true,
        status: true,
        whatsappNumber: true,
        user: { select: { email: true, id: true } },
        orderProduct: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                image: true,
                category: { select: { name: true } },
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function UploadPaymentProof(req, res) {
  const { order_id } = req.params;
  const { paymentProof } = req.body;
  try {
    const { image_id, image_url } = await UploadImage(paymentProof);

    const order = await prisma.order.update({
      where: { id: order_id },
      data: { paymentProof: { create: { name: image_id, url: image_url } } },
    });

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function DeleteOrder(req, res) {
  const { order_id } = req.params;

  try {
    const order = await prisma.order.delete({
      where: { id: order_id },
      include: { paymentProof: true },
      select: { paymentProof: { select: { name: true } } },
    });

    await DeleteImage(order.paymentProof.name);

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = {
  CreateOrder,
  GetOrder,
  UploadPaymentProof,
  GetUserOrder,
  DeleteOrder,
};
