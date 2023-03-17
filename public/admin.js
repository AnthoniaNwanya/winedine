const socket = io("ws://localhost:8000", {
  auth: {
    user_type: "admin",
  },
});

socket.on("connected", (msg) => {
  console.log("Admin connected");
});

socket.on("placed_order_admin", (placedorder) => {
  const orderTable = document.getElementById("orders");
  const orderid = Math.round(Math.random() * 10000);
  const row = orderTable.insertRow(-1);
  let column1 = row.insertCell(0);
  let column2 = row.insertCell(1);
  let column3 = row.insertCell(2);
  let column4 = row.insertCell(3);
  let column5 = row.insertCell(4);
  let column6 = row.insertCell(5);
  column1.innerText = orderid;
  column2.innerText = placedorder.order;
  column3.innerText = placedorder.total;
  column4.innerText = socket.id;
  column5.innerText = placedorder.Status;

  const acceptId = `accept_order_${orderid}`;
  const rejectId = `reject_order_${orderid}`;

  if (placedorder.Status === "pending") {
    column6.innerHTML = `
        <div>
          <button id="${acceptId}">Accept</button>
          <button id="${rejectId}">Reject</button>
        </div>
        `;
  }
});
