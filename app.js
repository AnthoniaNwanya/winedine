const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const { mongoDB } = require("./db");
const server = http.createServer(app);
const io = new Server(server);
require('dotenv').config();
mongoDB();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.url,
    ttl: 60 * 60 * 24 
  })
}))


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
    
    socket.emit("placed_order_client", (placedorders));
   
    io.emit("placed_order_admin", placedorder);
  });
});

app.use(express.static(__dirname));

app.get("/home", function (req, res) {
  res.sendFile(publicPath + "/index.html");
});
app.get("/admin", function (req, res) {
  res.sendFile(publicPath + "/admin.html");
});
app.get("/", function (req, res) {

  res.sendFile(publicPath + "/chatbot.html");
});
app.get('/logout', (req,res,next) => {
  req.session.destroy(err => {
      if(err){
          console.log(err);
      } else {
          res.send('Session is destroyed')
      }
  });
})
server.listen(8000, () => {
  console.log("listening on 8000");
});
