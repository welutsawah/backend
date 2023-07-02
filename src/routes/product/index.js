const express = require("express");
const {
  CreateProduct,
  GetProduct,
  UpdateProduct,
  DeleteProduct,
  GetDetailProduct,
} = require("../../controllers/product");
const UserAuth = require("../../midlewares/auth");

const router = express.Router();

router.get("/", GetProduct);
router.post("/create", CreateProduct);
router.put("/update/:product_id", UpdateProduct);
router.delete("/delete/:product_id", DeleteProduct);
router.get("/detail/:product_id", GetDetailProduct);

module.exports = router;
