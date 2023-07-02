const { prisma } = require("../../config/prisma");
const { GenerateUniqueCode, DecodeSignature } = require("../../utils");
const { UploadImage, DeleteImage } = require("../../utils/upload-image");
const invoiceHelper = require("../../utils/createInvoice");
const dayjs = require("dayjs");

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
    console.log(error);
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
                images: true,
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
                images: true,
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
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

async function GetOrderById(req, res) {
  const { order_id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: order_id },
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
                images: true,
                category: { select: { name: true } },
                name: true,
                price: true,
                code: true,
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
      data: {
        paymentProof: { create: { name: image_id, url: image_url } },
        status: "payment",
      },
    });

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function ChangeStatus(req, res) {
  const { order_id } = req.params;
  const { status } = req.body;

  try {
    const order = await prisma.order.update({
      where: { id: order_id },
      data: {
        status,
      },
    });

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function DeleteOrder(req, res) {
  const { order_id } = req.params;

  try {
    const order = await prisma.order.deleteMany({
      where: { id: order_id },
    });

    res.status(200).json({ data: order });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
}

async function DownloadPdf(req, res) {
  const { order_id } = req.params;

  prisma.order
    .findUnique({
      where: { id: order_id },
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
                images: true,
                category: { select: { name: true } },
                name: true,
                price: true,
                code: true,
              },
            },
          },
        },
      },
    })
    .then((data) => {
      const stream = res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment;filename=${data.orderCode}.pdf`,
      });

      invoiceHelper.createInvoice(
        {
          namaPemesan: data.customerName,
          kodePemesanan: data.orderCode,
          tanggalPemesanan: dayjs(data.orderDate).format("YYYY/MM/DD"),
          noWa: data.whatsappNumber,
          tanggalPengambilan: dayjs(data.pickupDate).format("YYYY/MM/DD"),
          items: data.orderProduct.map((barang) => {
            return {
              kodeBarang: barang.product.code,
              namaBarang: barang.product.name,
              harga: barang.product.price,
              jumlah: barang.quantity,
            };
          }),
        },
        (chunk) => stream.write(chunk),
        () => stream.end()
      );
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({ message: error.message });
    });
}

module.exports = {
  CreateOrder,
  GetOrder,
  GetOrderById,
  UploadPaymentProof,
  GetUserOrder,
  DeleteOrder,
  ChangeStatus,
  DownloadPdf,
};
