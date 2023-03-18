const express = require("express");
const session = require("express-session");
require("dotenv").config();
const cors = require("cors");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const bodyParser = require("body-parser");
const { mongoDB } = require("./db");
const app = express();
const http = require("http");

const cookieParser = require("cookie-parser");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

mongoDB();
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
const whitelist = [
  "https://winedinechatbot.onrender.com",
  "http://localhost:8000",
];
app.use(
  cors({
    origin: whitelist,
    headers: ["Content-Type"],
    credentials: true,
  })
);
app.use(cors());
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
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

class Cart {
  constructor(meal, price) {
    this.meal = meal;
    this.price = price;
  }
}

const placedorders = [];
var today = new Date();
var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
var time = today.getHours() + ":" + today.getMinutes();
var dateTime = date+' '+time;
console.log(dateTime)
class POrder {
  constructor(order, total) {
    this.date = dateTime;
    this.order = order;
    this.total = total;
    this.Status = "pending";
  }
}

app.get("/", function (req, res) {
  console.log(req.session.id);
  res.sendFile(__dirname + "/chatbot.html");
});

app.get("/admin", function (req, res) {
  res.sendFile(__dirname + "/admin.html");
});
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

  socket.on("addtocart", (carttotal) => {
    const order = new Cart(carttotal.meal, carttotal.price);

    socket.broadcast.emit("addtocart", order);
    console.log(`${carttotal.meal} has been added to cart`);
  });

  socket.on("placed_order", (data) => {
    const placedorder = new POrder(data.order, data.total);
    placedorders.push(placedorder);

    io.emit("placed_order_client", placedorders);
    io.emit("placed_order_admin", placedorder);
  });
});


server.listen(8000, () => {
  console.log("listening on 8000");
});
