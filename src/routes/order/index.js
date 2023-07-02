const express = require("express");
const {
  CreateOrder,
  DeleteOrder,
  GetOrder,
  GetUserOrder,
  GetOrderById,
  UploadPaymentProof,
  ChangeStatus,
  DownloadPdf,
} = require("../../controllers/order");

const router = express.Router();

router.get("/", GetOrder);
router.get("/user", GetUserOrder);
router.get("/detail/:order_id", GetOrderById);
router.post("/create", CreateOrder);
router.put("/upload-payment/:order_id", UploadPaymentProof);
router.put("/change-status/:order_id", ChangeStatus);
router.get("/print-order/:order_id", DownloadPdf);
router.delete("/delete/:order_id", DeleteOrder);

module.exports = router;
