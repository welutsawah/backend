const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

const authRoute = require("./src/routes/auth");
const categoryRoute = require("./src/routes/category");
const orderRoute = require("./src/routes/order");
const productRoute = require("./src/routes/product");

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/v1/auth", authRoute);
app.use("/v1/order", orderRoute);
app.use("/v1/product", productRoute);
app.use("/v1/category", categoryRoute);

app.get("/", (req, res) => {
  res.send("its working");
});

app.listen(port, () => {
  console.log(`running on port ${port}`);
});
