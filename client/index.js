const express = require("express");
const path = require("path");
const app = express();

app.use(express.static("public"));

app.listen(8000, ()=>{
    console.log("The client side is running at port 8000...");
});