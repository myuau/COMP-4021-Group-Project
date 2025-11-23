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

const gameSession = session({
    secret: "game",
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        maxAge: 300000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    }
});
app.use(gameSession);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

const matchPool = require('./utils/matchPool.js')(io); 

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

            req.session.save((err) => {
                if (err) {
                    return res.json({
                        status: "error",
                        error: "Fail to login, please try again"
                    });
                }
                
                console.log('Login successfully, user:', account);
                console.log('Session ID:', req.sessionID);

                return res.json({ 
                    status: "success",
                    user: account
                });
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

app.get("/user/:userId", (req, res) => {
    let userData = fs.readFileSync("data/users.json", {encoding: "utf-8"});
    let users = JSON.parse(userData);

    let target = Object.keys(users).filter(ele => ele === req.param.userId);

    if(target){
        return res.json({
            status: "success",
            data: users[target]
        });
    }
    else{
        return res.json({
            status: "error",
            error: "The required user is not found."
        })
    }
})

app.get("/signout", (req, res) => {
    req.session.user = null;

    return res.json({ status: "success" });
});

// GET order pool

io.use((socket, next) => {
    gameSession(socket.request, {}, next);
});

io.on("connection", (socket) => {
    console.log('socket info:', {
        socketId: socket.id,
        hasSession: !!socket.request.session,
        sessionID: socket.request.sessionID,
        user: socket.request.session?.user
    });
    if(!socket.request.session.user || !socket.request.session){
        console.error("no session...");
    }
    socket.on("request match", () => {
        matchPool.handleMatchRequest(socket);
    });

    socket.on("cancel match", () => {
        matchPool.handleCancelMatch(socket);
    });

    socket.on("end game", (data) => {
        matchPool.handleEndGame(data.groupId);
    });

    socket.on("ready", () => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.setReady(socket.id, true);
        }
    })

    socket.on("move", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handlePlayerMove(socket.id, data.isMoved, data.dir);
        }
    });

    socket.on("speedup", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handlePlayerSpeedup(socket.id, data.speedup);
        }
    });

    socket.on("trap", () => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handlePlayerTrap(socket.id);
        }
    })

    socket.on("update orders", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handleOrders(socket.id, data.orders);
        }
    });

    socket.on("update items", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handleItems(socket.id, data.items);
        }
    });

    socket.on("update score", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handleScore(socket.id, data.score);
        }
    });

    socket.on("complete", () => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if(gameRoom){
            gameRoom.handleOrderComplete(socket.id);
        }
    })

    socket.on("game field", (data) => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if (gameRoom) {
            gameRoom.getGameField(data);
        }
    });

    socket.on("opponent info", () => {
        const gameRoom = matchPool.getPlayerRoom(socket.id);
        if (gameRoom) {
            gameRoom.getOpponent(socket.id);
        }
    })

    socket.on("disconnect", () => {
        matchPool.handleDisconnect(socket);
    });

    // Additional
    socket.on("update DataBase", (data) => {
        const dataBase = JSON.parse(fs.readFileSync("data/userData.json", "utf-8"));
        const playerIndex = dataBase.findIndex(item => item.id === data.id);
        dataBase[playerIndex] = {
            "id": data.id,
            "bagItems": data.bag,
            "orderList": data.orders,
            "cash": data.score
        }
        fs.writeFileSync("data/userData.json", JSON.stringify(dataBase, null, 2));
        io.emit("gameData", dataBase);
    });
    socket.on("get Ids", () => {
        const users = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
        socket.emit("Ids", {
            // Find the userId based on the session user
        });
    });
});

httpServer.listen(8000, ()=>{
    console.log("The server side is running at port 8000...");
});