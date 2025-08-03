const express = require("express");
const airoutes = require("./routes/airoutes");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/ai", airoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
