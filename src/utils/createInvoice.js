const PDFDocument = require("pdfkit");
const fs = require("fs");

module.exports = class {
  static formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return year + "/" + month + "/" + day;
  }

  static formatCurrency(cents) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(cents);
  }

  static generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  static generateTableRow(
    doc,
    y,
    item,
    description,
    unitCost,
    quantity,
    lineTotal
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 300, y, { width: 90, align: "right" })
      .text(quantity, 350, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }

  static generateHeader(doc, image) {
    doc
      .image(image, 50, 40, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Souvenir Murah", 110, 45)
      .text("Banyuwangi", 110, 65)
      .fontSize(10)
      .text("Perum. Puri Brawijaya", 200, 65, { align: "right" })
      .text("Blok MD 10, Kebalenan", 200, 80, { align: "right" })
      .moveDown();
  }

  static generateFooter(doc) {
    doc
      .fontSize(10)
      .text("Terimakasih atas kepercayaan anda kepada kami ", 50, 780, {
        align: "center",
        width: 500,
      });
  }

  static generateCustomerInformation(doc, invoice) {
    doc.fillColor("#444444").fontSize(20).text("Pesanan", 50, 160);

    this.generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
      .fontSize(10)
      .text("Kode Pesanan:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(invoice.kodePemesanan, 180, customerInformationTop)
      .font("Helvetica")
      .text("Tanggal Pemesanan:", 50, customerInformationTop + 15)
      .text(invoice.tanggalPemesanan, 180, customerInformationTop + 15)
      .text("Nama Pemesan", 50, customerInformationTop + 30)
      .text(invoice.namaPemesan, 180, customerInformationTop + 30)
      .text("Nomor Whatsapp:", 50, customerInformationTop + 45)
      .text(invoice.noWa, 180, customerInformationTop + 45)
      .text("Tanggal Pengambilan:", 50, customerInformationTop + 60)
      .text(invoice.tanggalPengambilan, 180, customerInformationTop + 60)
      .font("Helvetica-Bold")
      .moveDown();

    this.generateHr(doc, 282);
  }

  static generateInvoiceTable(doc, invoice) {
    let i;
    const invoiceTableTop = 330;

    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      invoiceTableTop,
      "Kode Barang",
      "Nama Barang",
      "Harga",
      "Jml",
      "Total"
    );
    this.generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      this.generateTableRow(
        doc,
        position,
        item.kodeBarang,
        item.namaBarang,
        this.formatCurrency(item.harga),
        item.jumlah,
        this.formatCurrency(item.harga * item.jumlah)
      );

      this.generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    this.generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Total",
      "",
      this.formatCurrency(this.getTotal(invoice.items))
    );
  }

  static getTotal(items) {
    let total = 0;
    items.forEach((item) => {
      total += item.harga * item.jumlah;
    });
    return total;
  }

  static createInvoice(invoice, dataCallback, endCallback) {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      this.generateHeader(doc, image);
      this.generateCustomerInformation(doc, invoice);
      this.generateInvoiceTable(doc, invoice);
      this.generateFooter(doc);

      doc.on("data", dataCallback);
      doc.on("end", endCallback);

      doc.end();
    } catch (error) {
      console.log(error);
    }
  }
};