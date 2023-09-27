const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");


const fs = require("fs");
const multer = require("multer");
const path = require("path");


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

    app.get("/about", function(req, res){
        res.render("about", {})
    });

    app.get("/architecture", function(req, res){
        res.render("departments/architecture-department", {})
    });

    app.get("/civil", function(req, res){
        res.render("departments/civil-department", {})
    });

    app.get("/communication", function(req, res){
        res.render("departments/communication-department", {})
    });

    app.get("/computer", function(req, res){
        res.render("departments/computer-department", {})
    });

    app.get("/general", function(req, res){
        res.render("departments/general-department", {})
    });

    app.get("/oil", function(req, res){
        res.render("departments/oil-department", {})
    });

    app.get("/dean", function(req, res){
        res.render("dean-of-college", {})
    });


    app.get("/about", function(req, res){
        res.render("about", {})
    });

    app.get("/workShop", async function(req, res){
        let workShops = await WorkShop.find({})
        res.render("workShop", {workShops: workShops,})
    });

   

    app.get("/signUp", function(req, res){
        res.render("forms/signup", {});
    })
    app.get("/login", function(req, res){
        res.render("forms/login", {});
    })
    app.get("/addUser", function(req, res){
        res.render("forms/addUser", {});
    })


    app.get("/workShops", function(req, res){
        res.render("forms/workShops", {});
    })

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'public/uploads/');
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        }
      });
      
    // const upload = multer({ dest: 'uploads/' })
    const upload = multer({ storage: storage });
    app.post("/workShops", upload.single('image'), function(req, res){
        console.log(__dirname);
        console.log(req.file);
        fs.rename(__dirname + "/public/uploads/" + req.file.filename, __dirname + "/public/uploads/" + req.body.title + ".jpg", ()=>{});
        const path = "uploads/" + req.body.title + ".jpg";
        res.send('<img src="' + path + '" width="120px" alt="asd">');
        // res.redirect("/workShops");
        return;
        fs.rename(req.file.path, __dirname + req.body.image, err => {
            if (err) console.log(err);
            else console.log("water");});
            res.redirect("/workShops");
        // const workshop = new WorkShop({
        //     image : req.body.image,
        //     title : req.body.title,
        //     date : req.body.date,
        //     body : req.body.body,
        //     duration : req.body.duration,
        //     place: req.body.place
        // })
        // workshop.save()
        // res.redirect("/workShop")
    });









    app.listen(process.env.PORT || 3000 , function(){
        console.log("server started at port 3000 or " + process.env.PORT);
    })
}