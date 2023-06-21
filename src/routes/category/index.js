const express = require("express");
const {
  CreateCategory,
  DeleteCategory,
  GetCategory,
  UpdateCategory,
} = require("../../controllers/category");
const UserAuth = require("../../midlewares/auth");

const router = express.Router();

router.get("/", GetCategory);
router.post("/create", UserAuth, CreateCategory);
router.put("/update/:category_id", UserAuth, UpdateCategory);
router.delete("/delete/:category_id", UserAuth, DeleteCategory);

module.exports = router;
