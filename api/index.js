const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const CookieSession = require("cookie-session");
const fileUpload = require("express-fileupload");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const imageRoutes = require("./routes/imageRoutes");
const placesRoutes = require("./routes/placeRoutes");
const { connectDb, disconnectDb } = require("./mongo/mongo");
const morgan = require("morgan");
require("dotenv").config({ path: "./.env" });
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  CookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static(__dirname + "/api/uploads"));
// app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    limits: { fileSize: 50 * 2024 * 1024 },
  })
);

app.use("/api", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/place", placesRoutes);
app.use("/api/upload", imageRoutes);

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server successfully started on port: ${port}`);
    });
  })
  .catch(async (err) => {
    console.log(err.message);
    await disconnectDb();
  });