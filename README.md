# COMP 4021 Group Project -- Busy McDonald

# Introduction

The game is set in a McDonald's restaurant, where players must complete as many customer orders as possible within a limited time frame. When the time is up, the player with the highest total income will win the game. In the event that players have the same income, the game will result in a tie, and both players will share the same ranking.


# Game Features

- Support multiple players playing at the same time

- Rich sound effect and wonderful graphics

- User-friendly interface and simple to use


# Game Instruction

Each player receives a list of randomly generated orders from a selection of food items, such as beef hamburgers, fried fish hamburgers, potato sticks, and drinks, which are assigned periodically. Players must submit <strong>all required ingredients</strong> for each order to complete it. 

Each order has a specific price, and players <strong>must fulfill each order within a designated time limit</strong>; otherwise, the order will expire. Expired orders will be removed from the list. There can be a maximum of three orders in the order list, ensuring that it is never empty. 

Players can complete the orders in any sequence, and once an order is fulfilled, it will be removed from their order list and corresponding score will be added. 

However, the banana will randomly appear on the floor. If the players step on it, they will lose 1 item and $5. Therefore, players should be careful when collecting food for the orders.


# Game Control

- Movement

The player can move around the game field with <strong>'up', 'down', 'left' and 'right' keys</strong>.

- Pick Item

The player can pick item when they are <strong>in front of the cabinet</strong> with <strong>'E' key</strong>. 

- Drop 

If a player picks up the wrong items, they can drop items to the rubbish bin in FIFO (First In, First Out) order. The player can drop item when they are <strong>in front of the rubbish bin</strong> with <strong>'E' key</strong>.

- Submit Ingredients

The player can submit the ingredients when they are <strong>in front of the cashier</strong> in fulfilment of the orders with <strong>'E' key</strong>.


# Cheat Mode

The player can speed up with <strong>Space Bar</strong>, so that they can collect the required ingredient quickly and complete a order with a shorter amount of time. 


# Project Structure
```plaintext
Project/
├── client/                         # Client side
│   ├── public/               
│   │   ├── assets/
│   │   │   ├── audio/              # audio files for the game, including background music, sound effects etc.
│   │   │   ├── img/                # image used in index.html
│   │   │   ├── svg/                # svg used in index.html
│   │   │   └── index.css           # stylesheet
│   │   ├── scripts/                # JavaScript files for UI and game control
│   │   └──index.html               # main html file
│   ├── index.js                    # client side main program, which serves index.html
│   ├── package.json
│   └── package-lock.json
├── server/                         # Server side
│   ├── data/
│   │   └── users.json              # users data
│   ├── utils/
│   │   ├── gameRoom.js             # handle the data transmission during game play
│   │   └── matchPool.js            # handle the matching of the players into pairs
│   ├── server.js                   # server side main program
│   ├── package.json
│   └── package-lock.json
└── README.md
```
This application is a single-page-application, only one html file is needed for the client side.
The server is implemented with node.js and WebSocket.


# API 

You can view the details of all the API involved in this application in "API.pdf".


# Installation


1. install dependencies

For <b>Client</b> side:

```plaintext
cd client
npm install
```

For <b>Server</b> side:

```plaintext
cd server
npm install
```

2. Run the project
For <b>Client</b> side:

```plaintext
node index.js
```
For <b>Server</b> side:

```plaintext
node server.js
```
Both the server and client side should run on the same computer.
If you visit them with the same computer,
you can visit the client side with "localhost:8000", and visit the server side with "localhost:3000".

Otherwise, you need to do additional steps to enter the game website.
1. Update client side <code>BASE_URL</code>

Edit "client/public/scripts/constant.js",

change constant <code>BASE_URL</code> to the IP address of the server with the correct port number

2. Update server cors setting
Edit "server/server.js", replace the origin with IP address of the server
```plaintext
app.use(cors({
    origin: "http://localhost:8000", // replace "http://localhost:8000" with the correct link
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:8000', // replace "http://localhost:8000" with the correct link
        methods: ["GET", "POST"],
        credentials: true
    }
});
```
3. Visit the game main page

Now, you can visit the game main page with the IP address of the server and the port number of running the frontend, e.g. http://127.0.0.5:8000