const express = require("express");
const path = require("path");
const config = require("config");
const mongoose = require("mongoose");
const cors = require("cors");
const PORT = process.env.port || 5000;
const app = express();

// const whitelist = [
//   "http://localhost:5000",
//   "http://localhost:3000",
// "https://udzel-test-be-production.up.railway.app/"
// ];

const corsOptions = {
  origin: "https://daryaenina.github.io/udzel-test/",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  mode: "no-cors",
};

app.use(express.json({ extended: true }), cors(corsOptions));
app.use("/api/users", cors(corsOptions), require("./routes/auth.routes"));

async function start() {
  try {
    await mongoose.connect(config.get("mongoURL"), {});
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}...`);
    });
  } catch (error) {
    console.log("Server Error", error.message);
    process.exit(1);
  }
}

start();
