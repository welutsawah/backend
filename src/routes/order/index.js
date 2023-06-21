const express = require("express");
const {
  CreateOrder,
  DeleteOrder,
  GetOrder,
  GetUserOrder,
  UploadPaymentProof,
} = require("../../controllers/order");
const UserAuth = require("../../midlewares/auth");

const router = express.Router();

router.get("/", UserAuth, GetOrder);
router.get("/user", UserAuth, GetUserOrder);
router.post("/create", UserAuth, CreateOrder);
router.put("/upload-payment/:order_id", UserAuth, UploadPaymentProof);
router.delete("/delete/:order_id", UserAuth, DeleteOrder);

module.exports = router;
