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
    await mongoose.connect("mongodb+srv://AjwadG:PIF9RnDFt82uuYJm@cluster0.0ge3uap.mongodb.net/uniDB");

    const workShopScema = new mongoose.Schema({
        image : String,
        title : String,
        date : String,
        body : String,
        duration : String,
        place: String
    })
    const userScema = new mongoose.Schema({
        name : String,
        userName : String,
        password : String,
        level : Number
    })
    const studentScema = new mongoose.Schema({
        name : String,
        idNo : String,
        phoneNo : Number,
        cert : String,
        Behavior : String,
        health : String,
        birth : String,
        resdient : String,
        selfie : String
    })
    const WorkShop = new mongoose.model("WorkShop" , workShopScema);
    const User = new mongoose.model("User" , userScema);
    const Student = new mongoose.model("Student" , studentScema);

    app.get("/", function(req, res){
        res.render("home", {})
    });

    app.post("/", function(req, res){
        const workshop = new WorkShop({
            image : req.body.image,
            title : req.body.title,
            date : req.body.date,
            body : req.body.body,
            duration : req.body.duration,
            place: req.body.place
        })
        workshop.save()
        res.redirect("/workShop")
    });

    app.get("/signUp", function(req, res){
    res.sendFile(__dirname + "/signup.html");
    })
    app.get("/login", function(req, res){
        res.sendFile(__dirname + "/signup.html");
    })
    app.get("/addUser", function(req, res){
        res.sendFile(__dirname + "/signup.html");
    })
    app.get("/workShops", function(req, res){
        res.sendFile(__dirname + "/signup.html");
    })

    app.get("/about", function(req, res){
        res.render("about", {})
    });


    app.get("/workShop", async function(req, res){
        let workShops = await WorkShop.find({})
        res.render("workShop", {workShops: workShops,})
    });


    app.listen(process.env.PORT || 3000 , function(){
        console.log("server started at port 3000 or " + process.env.PORT);
    })
}