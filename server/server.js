const express = require("express");
const path = require("path");
const {createServer} = require("http");
const {Server} = require("socket.io");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require('cors');
const fs = require("fs");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const matchPool = require('./utils/matchPool.js')(io); 

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

const gameSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(gameSession);

function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

app.post("/register", (req, res) => {
    const {username, password} = req.body;

    let userData = fs.readFileSync("data/users.json", {encoding: "utf-8"});
    let users = JSON.parse(userData);

    if(!username){
        return res.json({
            status: "error",
            error: "Username cannot be empty!"
        })
    }
    else if(!password){
        return res.json({
            status: "error",
            error: "Password cannot be empty!"
        })
    }

    if(!containWordCharsOnly(username)){
        return res.json({
            status: "error",
            error: "Username is invalid!"
        })
    }

    if(username in users){
        return res.json({
            status: "error",
            error: "Username already exists!"
        })
    }

    const hash = bcrypt.hashSync(password, 10);

    users[username] = {
        password: hash,
        userId: "" + Object.keys(users).length
    }

    fs.writeFileSync("data/users.json", JSON.stringify(users, null, 2));

    res.json({ status: "success" });
})

app.post("/login", (req, res) => {
    const {username, password} = req.body;

    let userData = fs.readFileSync("data/users.json", {encoding: "utf-8"});
    let users = JSON.parse(userData);

    if(!username){
        return res.json({
            status: "error",
            error: "Username cannot be empty!"
        })
    }
    else if(!password){
        return res.json({
            status: "error",
            error: "Password cannot be empty!"
        })
    }

    if(username in users){
        if(bcrypt.compareSync(password, users[username].password)){
            const account = {
                username: username,
                userId: users[username].userId
            };

            req.session.user = account;

            return res.json({ 
                status: "success",
                user: account
            });
        }
        else{
            return res.json({
                status: "error",
                error: "Password is incorrect!"
            })
        }
    }
    else{
        return res.json({
            status: "error",
            error: "User does not exist. Please try again!"
        })
    }
})

app.get("/validate", (req, res) => {
    let user = req.session.user;

    if(user){
        return res.json({ status: "success", user: user });
    }
    else{
        return res.json({ status: "error", error: "The session is expired. Please login again!"});
    }
});

app.get("/signout", (req, res) => {
    req.session.user = null;

    return res.json({ status: "success" });
});

// GET order pool

io.use((socket, next) => {
    gameSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    socket.on("request match", () => {
        matchPool.handleMatchRequest(socket);
    });

    socket.on("cancel match", () => {
        matchPool.handleCancelMatch(socket);
    })

    socket.on("end game", (data) => {
        matchPool.handleEndGame(data.groupId);
    })

    // on "order update", "opponent order update", broadcast to the player in the same group
    // on "move", (x, y, dir), "opponent move", broadcast to the player in the same group(expect himself/herself)
    // on "update items", (item_list), "opponent update items", broadcast to the player in the same group
    // on "opponent move", send the opponent movement to the player(?)
    // on "update state", (score), "opponent update state", broadcast to the players
    // broadcast "banana position" to the players
    // on "final score", emit the final score the players(for ranking page)

    socket.on("disconnect", () => {
        matchPool.handleDisconnect(socket);
    });
})

httpServer.listen(8000, ()=>{
    console.log("The server side is running at port 8000...");
});