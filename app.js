const express = require("express");
const dotenv = require("dotenv");
const UserRouter = require("./router/users");
const ProductRouter = require("./router/product");
const TransferRouter = require("./router/transfer");
const connectDB = require("./db/connect");
var cors = require("cors");
const bodyparser = require("body-parser");
const path = require("path");
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.send("working correctly");
});
app.use("/user", UserRouter);
app.use("/product", ProductRouter);
app.use("/transfer", TransferRouter);
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("db connection established");
    app.listen(port, () => {
      console.log(`port ${port} activated`);
    });
  } catch (err) {
    console.log(err.message);
  }
};

start();
