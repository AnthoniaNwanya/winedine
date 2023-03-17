const express = require("express");
const session = require("express-session");
require("dotenv").config();

const MongoStore = require("connect-mongo");
const passport = require("passport");
const bodyParser = require("body-parser");
const { mongoDB } = require("./db");
const app = express();
const path = require("path");
const publicPath = path.join(__dirname, "public");

const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const io = new Server(server);

mongoDB();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const sessionMiddleware = session({
  secret: "auyfyuwhje9u8e93yehiu",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.url,
    ttl: 60 * 60 * 24,
  }),
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

class Order {
  constructor(meal, price) {
    this.meal = meal;
    this.price = price;
  }
}

function addHours(date, hours) {
  date.setHours(date.getHours() + hours);
  return date;
}
const date = new Date();
const newDate = addHours(date, 1);
const placedorders = [];
class POrder {
  constructor(order, total) {
    this.date = new Date(newDate);
    this.order = order;
    this.total = total;
    this.Status = "pending";
  }
}
let watch = false;
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res, next);
});
io.on("connection", (socket) => {
  let adminSocket;
  io.emit("connected", (msg) => {
    console.log("user connected");
  });

  const userType = socket.handshake.auth.user_type;
  if (userType === "admin") {
    adminSocket = socket;
    console.log("admin connected");
  }

  socket.on("disconnect", (data) => {
    io.emit("disconnected", `user disconnected`);
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("addtocart", (totalorder) => {
    const order = new Order(totalorder.meal, totalorder.price);

    socket.broadcast.emit("addtocart", order);
    console.log(`${totalorder.meal} has been added to cart`);
  });

  socket.on("placed_order", (data) => {
    const placedorder = new POrder(data.order, data.total);
    placedorders.push(placedorder);

    io.emit("placed_order_client", placedorders);
    io.emit("placed_order_admin", placedorder);
    console.log(`server side2: ${placedorders}`);
    watch = true;
  });
});
setInterval(logPH, 1000);
function logPH() {
  if (watch == true) {
    console.log(placedorders);
  }
}

// setInterval(function () {
//   element.innerHTML += "Hello";
// }, 1000);

app.use(express.static(__dirname));

app.get("/home", function (req, res) {
  res.sendFile(publicPath + "/index.html");
});
app.get("/admin", function (req, res) {
  res.sendFile(publicPath + "/admin.html");
});
app.get("/", function (req, res) {
  console.log(req.session.id);
  res.sendFile(publicPath + "/chatbot.html");
});

server.listen(8000, () => {
  console.log("listening on 8000");
});
