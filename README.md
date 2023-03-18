# Wine-Dine-Chatbot


###  ![#1589F0](https://via.placeholder.com/15/1589F0/000000?text=+) ChatBot Requirements


- ChatBot interface would be like a chat interface
- No need for authentication but we should be able to store user session based on devices
- When a customer lands on the chatbot page, the bot should send these options to the customer:
- Select 1 to Place an order
- Select 99 to checkout order
- Select 98 to see order history
- Select 97 to see current order
- Select 0 to cancel order

- When a customer selects “1”, the bot should return a list of items from the restaurant. It is up to you to create the items in your restaurant for the customer. The order items can have multiple options but the customer should be able to select the preferred items from the list using this same number select system and place an order.
- When a customer selects “99” out an order, the bot should respond with “order placed” and if none the bot should respond with “No order to place”. Customer should also see an option to place a new order
- When a customer selects “98”, the bot should be able to return all placed order
- When a customer selects “97”, the bot should be able to return current order
- When a customer selects “0”, the bot should cancel the order if there is.

###  ![#c5f015](https://via.placeholder.com/15/c5f015/000000?text=+) ChatBot Instructions: 

When a customer lands on the page, the first button to pop up is the "Place An Order" button. This was on the assumption that customers using the chatbot are likely trying to place an order. 


![#f03c15](https://via.placeholder.com/15/f03c15/000000?text=+) <ins>Most Importantly: 

To see Order History, a customer must have checked out an order. Though flawed, order history has to be updated on click of a current order checkout.

Please note that this is a button-click chatbot. On click of buttons provided, the chatbot responds.


## Built With: 
- Node.js 
- Express.js 
- Socket.io
- Express-session

## Clone this Repo: 

```
git clone https://github.com/AnthoniaNwanya/winedine.git
```


## Install Dependencies: 
``` 
npm install 
```

## Start Server: 
``` 
npm run dev 
```
