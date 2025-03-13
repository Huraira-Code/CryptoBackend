const dotenv = require("dotenv");
require("dotenv").config();
const express = require("express");
const app = express();
const connectDB = require("./db/db_connection");
const router = require("./routes/route");
const authenticationMiddleware = require("./middleware/authentication");
const cors = require("cors");

const port = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000", // Allow only frontend origin
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

app.use("/", router);
app.use("/api/v1/", authenticationMiddleware, router);

app.get("/", (req, res) => {
  res.send("First page");
});

app.listen(port, () =>
  console.log(`Server is running at: http://localhost:${port}`)
);
