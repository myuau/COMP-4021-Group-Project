const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cors = require('cors');
const fs = require("fs");

const app = express();

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
        password: hash
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
                username: username
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

app.listen(8000, ()=>{
    console.log("The server side is running at port 8000...");
});