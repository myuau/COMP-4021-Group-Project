# COMP-4021-Group-Project
COMP 4021 Group Project -- Busy McDonald

# Introduction


The game is set in a McDonald's restaurant, where players must complete as many customer orders as possible within a limited time frame. When the time is up, the player with the highest total income will win the game. In the event that players have the same income, the game will result in a tie, and both players will share the same ranking.

# Game Instruction


Each player receives a list of randomly generated orders from a selection of food items, such as beef hamburgers, fried fish hamburgers, potato sticks, and drinks, which are assigned periodically. Players must submit <strong>all required ingredients</strong> for each order to complete it. 

Each order has a specific price, and players <strong>must fulfill each order within a designated time limit</strong>; otherwise, the order will expire. Expired orders will be removed from the list. There can be a maximum of three orders in the order list, ensuring that it is never empty. 

Players can complete the orders in any sequence, and once an order is fulfilled, it will be removed from their order list. 

However, the banana will randomly appear on the floor. If the players step on it, they will lose 1 item and $5. Therefore, players should be careful when collecting food for the orders.


# Game Operation


1. Movement
<br>
The player can move around the game field with 'up', 'down', 'left' and 'right' keys.
<br>
2. Pick Item
The player can pick item when they are <strong>in front of the cabinet</strong> with 'E' key. 
<br>
3. Drop Item
If a player picks up the wrong items, they can drop items to the rubbish bin in FIFO (First In, First Out) order. The player can drop item when they are <strong>in front of the rubbish bin</strong> with 'E' key.
<br>
4. Submit Ingredients
The player can submit the ingredients when they are <strong>in front of the cashier</strong> in fulfilment of the orders with 'E' key.

# Installation
<br>
1. install dependencies
<br>
For <b>Client</b> side:
<br>
<code>
cd client
npm install
</code>
<br>
For <b>Server</b> side:
<br>
<code>
cd server
npm install
</code>
<br>
2. Run the project
For <b>Client</b> side:
<br>
<code>
node index.js
</code>
For <b>Server</b> side:
<br>
<code>
node server.js
</code>
<br>
Both the server and client side should run on the same computer.
If you visit them with the same computer,
you can visit the client side with "localhost:8000", and visit the server side with "localhost:3000".

Otherwise, you need to do additional step to enter the game website.
1. Update client side BASE_URL
<br>
Edit "client/public/scripts/constant.js",

change constant <code>BASE_URL</code> to the IP address of the server with the correct port number
<br>
2. Update server cors setting
Edit "server/server.js", replace the origin with IP address of the server
```plaintext
app.use(cors({
    origin: "http://localhost:8000", // replace "http://localhost:8000"
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:8000', // replace "http://localhost:8000"
        methods: ["GET", "POST"],
        credentials: true
    }
});
```
3. Visit the game main page
<br>
Now, you can visit the game main page with the IP address of the server and the port number of running the frontend, e.g. http://127.0.0.5:8000