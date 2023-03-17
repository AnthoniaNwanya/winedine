// Icons made by Freepik from www.flaticon.com
const socket = io("ws://localhost:8000");
const messages = document.getElementById("messages");
const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const BOT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
const PERSON_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
const BOT_NAME = "BOT";
const PERSON_NAME = window.prompt("Enter username") || "Diner";
const welcomemsg = document.getElementById("msg-text");
welcomemsg.innerText = `Hi ${PERSON_NAME}, Welcome to Wine-Dine.`;

const btn_1 = document.getElementById("btn_1");
const btn_99 = document.getElementById("btn_99");
const btn_98 = document.getElementById("btn_98");
const btn_97 = document.getElementById("btn_97");
const btn_0 = document.getElementById("btn_0");
// Socket user connection
socket.on("connected", function (data) {
  console.log(`user connected`);
});

function appendMessage(name, img, side, text) {
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-img" style="background-image: url(${img})"></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

// Utils
function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Send message emit
msgerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  var msgText = msgerInput.value;
  if (!msgText) return;

  socket.emit(
    "message",
    appendMessage(PERSON_NAME, PERSON_IMG, "right", msgText)
  );
  msgerInput.value = "";
});
socket.on("message", (data) => {
   data =
    "Hi there! I see you might be trying to send a message. Unfortunately, this is a 'button-click' conversation. Kindly go back to the top to select a number.";

  appendMessage(BOT_NAME, BOT_IMG, "left", data);
});
//Display Menu
btn_1.addEventListener("click", function (e) {
  var menuList = document.getElementById("menu_list");
  menuList.classList.toggle("hidden");
  socket.emit("menu_requested", menuList);
});

// Add Order to Cart
var cartbtn = document.getElementById("cart");
var order1 = document.getElementById("btnPO");
var table = document.getElementsByTagName("table")[0];
var tbody = table.getElementsByTagName("tbody")[0];

tbody.addEventListener("click", function (e) {
  var notifyorder = document.getElementById("select_btn");
  notifyorder.style.display = "contents";
  var alist = document.createElement("li");
  alist.textContent = "Item has been added to cart.";
  messages.appendChild(alist);
  window.scrollTo(0, document.body.scrollHeight);

  e = e || window.event;
  var data = [];
  var target = e.srcElement || e.target;
  while (target && target.nodeName !== "TR") {
    target = target.parentNode;
  }
  if (target) {
    var cells = target.getElementsByTagName("td");
    for (var i = 0; i < cells.length; i++) {
      data.push(cells[i].innerHTML);
    }
  }
  data.pop();

  const totalorder = {
    meal: data[0].toString(),
    price: data[1].toString(),
  };
  // Add to Cart Event
  socket.emit("addtocart", totalorder);
  // Event that displays items in cart upon "add to cart"
  socket.on("addtocart", totalorder)
    const mytable = document.getElementById("myPopup");
    const row = mytable.insertRow(-1);
    let column1 = row.insertCell(0);
    let column2 = row.insertCell(1);
    column1.innerText = totalorder.meal;
    column2.innerText = totalorder.price;


  // Checkout Order
  btn_99.addEventListener("click", function (e) {
    var popup = document.getElementById("myPopup");

    var notifyorder = document.getElementById("notifyorder");
    notifyorder.style.display = "block";
    const notifymsg = document.getElementById("notifymsg");
    let myorder = popup.textContent.trim().toString();

    // Calculate Order Total for each addition to cart
    let sumVal = 0;
    for (let i = 0; i < popup.rows.length; i++) {
      sumVal = sumVal + parseInt(popup.rows[i].cells[1].innerHTML);
      notifymsg.innerText = `Order placed. Total: ${sumVal}`;
      const data = {
        order: myorder,
        total: sumVal,
      };

      socket.emit("placed_order", data);
    }

    popup.textContent = "";
  });
});

// Show Current Order
btn_97.addEventListener("click", function (e) {
  var popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
  window.onclick = function (event) {
    if (event.target == popup) {
      popup.classList.toggle("show");
    }
  };
});

// Cancel Order
btn_0.addEventListener("click", function (e) {
  var popup = document.getElementById("myPopup");
  popup.textContent = "";
  var alist = document.createElement("li");
  alist.textContent = "Current order has been cancelled.";
  messages.appendChild(alist);
  window.scrollTo(0, document.body.scrollHeight);
});

// Event that pushes all placed orders in an array for Order History display
socket.on("placed_order_client", (placedorders) => {
  let obj = {};
  placedorders.forEach((element) => {
    obj = element;
    var modaltable = document.getElementById("modal_table");
    const row = modaltable.insertRow(-1);
    let column1 = row.insertCell(0);
    let column2 = row.insertCell(1);
    let column3 = row.insertCell(2);
    let column4 = row.insertCell(3);
    column1.innerText = new Date();
    column2.innerText = obj.order;
    column3.innerText = obj.total;
    column4.innerText = "processing order";
  });
});

// Order History
btn_98.addEventListener("click", function (e) {
  var modal = document.getElementById("myModal");
  modal.style.display = "block";

  var span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});
