const createError = require("http-errors");
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./middleware/authenticate");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const galleriesRouter = require("./routes/galleries");
const imagesRouter = require("./routes/images");
const commentsRouter = require("./routes/comments");

mongoose.connect("mongodb://localhost:27017/gallery");
const app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  try {
    const token = req.cookies.mytoken;
    const decode = jwt.verify(token, JWT_SECRET);
    res.locals.loggedUser = decode.username;
  } catch {
    res.locals.loggedUser = null;
  }
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PUBLIC_PATHS = ["/", "/docs", "/users/user_login", "/users/user_register"];

app.use((req, res, next) => {
  if (PUBLIC_PATHS.includes(req.path) || res.locals.loggedUser) return next();
  res.render("info", { title: "Info", messages: ["Must be logged!"] });
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/galleries", galleriesRouter);
app.use("/galleries/:galleryId/images", imagesRouter);
app.use("/galleries/:galleryId/images/:imageId/comments", commentsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
