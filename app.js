const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/uniDB");

    app.get("/", function(req, res){
        res.send("hi")
    });



    app.listen(process.env.PORT || 3000 , function(){
        console.log("server started at port 3000 or " + process.env.PORT);
    })
}