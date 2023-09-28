const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");

const fs = require("fs");
const multer = require("multer");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { request } = require("http");
const { log } = require("console");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: "cetz secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  });
  
const upload = multer({ storage: storage });


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
        username : String,
        password : String,
        level : Number
    })
    userScema.plugin(passportLocalMongoose);

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

    passport.use(User.createStrategy());
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

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
    // upload.array('photos', 12),
    app.post("/signUp", function(req, res) {
        const student = new Student({
            name : req.body.name,
            idNo : req.body.idNo,
            phoneNo : req.body.phoneNo,
            cert : req.body.cert,
            Behavior : req.body.Behavior,
            health : req.body.health,
            birth : req.body.birth,
            resdient : req.body.resdient,
            selfie : req.body.selfie
        })
        student.save()
        res.redirect("/signUp");
    })

    app.get("/login", async function(req, res){
        if (req.isAuthenticated()) {
            res.redirect("/students");
        } else {
             res.render("forms/login", {});
        }
    })
    app.post("/login", passport.authenticate('local', { successRedirect: '/students', failWithError: true }),
    function(err, req, res, next) {
        res.redirect("/login");
    });

    app.get("/addUser", function(req, res){
        res.render("forms/addUser", {});
    })
    app.post("/addUser",  async function(req, res){

        let name = req.body.name;
        let username = req.body.username;
        let pass = req.body.password;

        User.register({name: name, username: username, level: 1}, pass, (err, user) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/addUser");
        });
    })

    app.get("/students", async function(req, res){
        if (req.isAuthenticated()){
            let students = await Student.find({} , {name : 1, idNo : 1, phoneNo : 1})
            res.render("user/student", {Students : students});
            } else {
                res.redirect("/login");
            }
    })
    app.get("/student-info", async function(req, res){

        let students = await Student.findOne({idNo: "2000000"});
        res.render("user/student-info", {student : students});

    })
    app.get("/users", async function(req, res){
        let users = await User.find({}, {name : 1, username : 1, level : 1})
        res.render("user/users", {Users : users});
    })
    app.get("/workShops", function(req, res){
        res.render("forms/workShops", {});
    })
    app.get("/edit-workShops", function(req, res){
        res.render("forms/edit-workShop", {});
    })


    app.post("/workShops", upload.single('image'), function(req, res){
        console.log(__dirname);
        console.log(req.file);
        fs.rename(__dirname + "/public/uploads/" + req.file.filename, __dirname + "/public/uploads/" + req.body.title + ".jpg", ()=>{});
        const path = "uploads/" + req.body.title + ".jpg";
        res.send('<img src="' + path + '" width="120px" alt="asd">');
        // res.redirect("/workShops");
        return;
        const workshop = new WorkShop({
            image : path,
            title : req.body.title,
            date : req.body.date,
            body : req.body.body,
            duration : req.body.duration,
            place: req.body.place
        })
        workshop.save()
        res.redirect("/workShop")
    });









    app.listen(process.env.PORT || 3000 , function(){
        console.log("server started at port 3000 or " + process.env.PORT);
    })
}