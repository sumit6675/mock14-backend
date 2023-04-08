require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { userRoute } = require("./Routes/User.Routes");
const { connection } = require("./config/db");

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Mock 14");
});

app.use("/users",userRoute)

app.listen(process.env.port, async () => {
  try {
    await connection;
    console.log("connected to databse");
  } catch (err) {
    console.log("err", err);
  }
  console.log(`server is connected to : ${process.env.port}`);
});
