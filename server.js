const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// app
const app = express();

// Database
let dbConnectionString;
if (process.env.NODE_ENV === "development") {
  dbConnectionString = process.env.DATABASE_LOCAL;
} else {
  dbConnectionString = process.env.DATABASE_CLOUD;
}
mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected"));

// Middlewares
app.use(morgan("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
}

// Import Routes
const userRoutes = require("./routes/user");
const contactUsRoutes = require("./routes/contactUs");

// Routes Middlware
app.use("/api", userRoutes);
app.use("/api", contactUsRoutes);

// Port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});
