const express = require("express");
const session = require("express-session");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config();
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
   },
});
if (app.get('env') === 'production'){
  app.set('trust proxy', 1);
  sessionMiddleware.cookie.secure = true
  
}
app.use(sessionMiddleware);

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);

});

const path = require("path");
const publicPath = path.join(__dirname, "public");

const orders = [];
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

let adminSocket;

io.on("connection", (socket) => {
  const session = socket.request.session;
  session.connections++;
  session.save();
  
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
    socket.emit("message", data);
  });

  socket.on("addtocart", (totalorder) => {
    const order = new Order(totalorder.meal, totalorder.price);

    socket.broadcast.emit("addtocart", order);
    console.log(`${totalorder.meal} has been added to cart`);
    orders.push(order);
  });

  socket.on("placed_order", (data) => {
    const placedorder = new POrder(data.order, data.total);
    
    placedorders.push(placedorder); 
    // const OrderHistory = placedorders.pop()
    
    socket.emit("placed_order_client", (placedorders));
   
    io.emit("placed_order_admin", placedorder);
  });
});

app.use(express.static(__dirname));

app.get("/", function (req, res) {
  res.sendFile(publicPath + "/index.html");
});
app.get("/admin", function (req, res) {
  res.sendFile(publicPath + "/admin.html");
});
app.get("/chatbot", function (req, res) {
  res.sendFile(publicPath + "/chatbot.html");
});

server.listen(8000, () => {
  console.log("listening on 8000");
});
