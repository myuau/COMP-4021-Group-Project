const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

app.listen(8000, ()=>{
    console.log("The server side is running at port 8000...");
});