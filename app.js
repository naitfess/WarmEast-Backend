require("dotenv").config();

//ambil module express
const express = require("express");
const app = express();

//ambil router yang mengandle endpoint user
const cartRouter = require("./routes/cart");
const menuRouter = require("./routes/menu");
const orderRouter = require("./routes/order");
const userRouter = require("./routes/user");
const warmindoRouter = require("./routes/warmindo");

const association = require("./util/assoc_db");

//untuk ngambil request body
app.use(express.json());

//jalanin router
app.use(cartRouter);
app.use(menuRouter);
app.use(orderRouter);
app.use(userRouter);
app.use(warmindoRouter);

app.use("/", (req, res, next) => {
  res.status(404).json({
    message: "Resource not found!",
  });
});

//ambil data dari dotenv
const PORT = process.env.PORT;

association()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
