const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const bodyParser = require("body-parser");


const multer = require('multer');
const fs = require('fs');

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
        date : Date,
        dates : String,
        body : String
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

    app.get("/", function(req, res){ res.render("home", {}) });

    app.get("/about", function(req, res){ res.render("about", {}) });

    app.get("/architecture", function(req, res){ res.render("departments/architecture-department", {}) });

    app.get("/civil", function(req, res){ res.render("departments/civil-department", {}) });

    app.get("/communication", function(req, res){ res.render("departments/communication-department", {}) });

    app.get("/computer", function(req, res){ res.render("departments/computer-department", {}) });

    app.get("/general", function(req, res){ res.render("departments/general-department", {}) });

    app.get("/oil", function(req, res){ res.render("departments/oil-department", {}) });

    app.get("/dean", function(req, res){ res.render("dean-of-college", {}) });


    app.get("/about", function(req, res){ res.render("about", {}) });

    app.get("/signUp", function(req, res){ res.render("forms/signup", {}); })

    app.get("/workShop", async function(req, res){
        let a = -1;
        if (req.isAuthenticated()) {a = req.user.level;};
        let workShops = await WorkShop.find({})
        res.render("workShop", {workShops: workShops, lvl: a, now: Date.now()})
    });
    app.post("/workShop", async function(req, res){
        if (req.isAuthenticated() && req.user.level >= 0) {
            await WorkShop.deleteOne({title: req.body.title});
        }
        res.redirect("workShop")
    });

   
    const fields = [{ name: 'cert', maxCount: 1 }, { name: 'Behavior', maxCount: 1 },
                    { name: 'health', maxCount: 1 }, { name: 'birth', maxCount: 1 },
                    { name: 'resdient', maxCount: 1 }, { name: 'selfie', maxCount: 1 }];

    app.post("/signUp", upload.fields(fields), function(req, res) {
        for (const [key, value] of Object.entries(req.files))
        {
            value[0].path = "uploads/students/" + req.body.idNo + value[0].fieldname + "." + value[0].originalname.split('.')[1];
            fs.rename(__dirname + "/public/uploads/" + value[0].filename, __dirname + "/public/" + newpath, ()=>{});
        }
        const student = new Student({
            name : req.body.name,
            idNo : req.body.idNo,
            phoneNo : req.body.phoneNo,
            cert : req.files["cert"][0].path,
            Behavior : req.files["Behavior"][0].path,
            health : req.files["health"][0].path,
            birth : req.files["birth"][0].path,
            resdient : req.files["resdient"][0].path,
            selfie : req.files["selfie"][0].path
        })
        student.save()
        res.redirect("/students");
    })

    app.get("/login", async function(req, res){
        if (req.isAuthenticated())
        {
            if (req.user.level == 0)
                res.redirect("/users");
            else
                res.redirect("/students");
        } else {
             res.render("forms/login", {msg : null});
        }
    })
    app.post("/login", passport.authenticate('local', { successRedirect: '/login', failWithError: true }),
    function(err, req, res, next) {
        res.render("forms/login", {msg: "Wrong userName or Password"});
    });

    app.get("/addUser", function(req, res){
        if (req.isAuthenticated())
        {
            if (req.user.level == 0) {
                res.render("forms/addUser", {});
            } 
        } else {
             res.redirect("/");
        }
    })
    app.post("/addUser",  async function(req, res){

        let name = req.body.name, username = req.body.username, pass = req.body.password;

        User.register({name: name, username: username, level: 1}, pass, (err, user) => {
            if (err)
                res.redirect("/addUser");
            else
                res.redirect("/");
        });
    })

    app.get("/students", async function(req, res){
        if (req.isAuthenticated()){
            let students = await Student.find({} , {name : 1, idNo : 1, phoneNo : 1})
            res.render("user/student", {Students : students, lvl: req.user.level});
        } else {
            res.redirect("/login");
        }
    })

    app.get("/student-info_:idNO", async function(req, res){
        if (req.isAuthenticated()) {
            let students = await Student.findOne({idNo: req.params.idNO});
            if (students == null)
                res.redirect("/students");
            else
                res.render("user/student-info", {student : students, lvl : req.user.level});
        }
        else {
            res.redirect("/");
        }
    })
    app.post("/student-info", async function(req, res) {
        await Student.deleteOne({username: req.body.idNO}).then(resault => {
            //fs.rename(__dirname + "/public/" + req.body.path, __dirname + "/public/deleted", () => {});
        });
        res.redirect("/students");
    })
    
    app.get("/edit-student:idNo", async function(req, res) {
        if (req.isAuthenticated()) {
            let student = await Student.findOne({idNo: req.params.idNo})
            if (student != undefined)
            {
                res.render("forms/edit-student", {student: student}); 
                return;
            }
        } 
        res.redirect("/");
    })
    app.post("/edit-student", async function(req, res){
        if (req.isAuthenticated()) {
            await Student.findOneAndUpdate({idNo: req.body.old}, 
                {idNo: req.body.idNo, name: req.body.name, phoneNo: req.body.phoneNo})
        } 
        res.redirect("/student-info_" + req.body.idNo);
    })

    app.get("/users", async function(req, res){
        if (req.isAuthenticated() && req.user.level == 0) {
                let users = await User.find({}, {name : 1, username : 1, level : 1})
                res.render("user/users", {Users : users});
        } else {
        res.redirect("/");
        }
    })
    app.post("/users", async function(req, res) {
        let a = await User.deleteOne({username: req.body.username}).then(resault => {
            //fs.rename(__dirname + "/public/" + req.body.path, __dirname + "/public/deleted", () => {});
        });
        res.redirect("/users");
    })

    app.get("/workShops", function(req, res){
        if (req.isAuthenticated()) 
            res.render("forms/workShops", {});
        else
            res.redirect("/");
    })

    app.get("/edit-workShops:title", async function(req, res){
        if (req.isAuthenticated()) {
            let workShop = await WorkShop.findOne({title: req.params.title})
            if (workShop != undefined)
            {
                res.render("forms/edit-workShop", {workShop: workShop}); 
                return;
            }
        } 
            res.redirect("/");
    })
    app.post("/edit-workShops", async function(req, res){
        if (req.isAuthenticated()) {
            let path = req.body.path.split(req.body.old)[0] + req.body.title + "." + req.body.path.split(".")[1];
            
            await WorkShop.findOneAndUpdate({title: req.body.old}, 
                {title: req.body.title, date: req.body.date, dates: req.body.date, body: req.body.body, image: path})
                .then(resault => {
                    if (resault != null)
                        fs.rename(__dirname + "/public/" + req.body.path, __dirname + "/public/" + path, () => {});
                });
        } 
        res.redirect("/workShop");
    })

    app.get("/logout", function(req, res){
        req.logout(function(err) {
            if (err) { console.log(err); } else {
                res.redirect('/');
            }});
    })
    
    app.post("/workShops", upload.single('image'), function(req, res) {
        const path = "uploads/workshops/" + req.body.title + "." +req.file.originalname.split('.')[1];
        fs.rename(__dirname + "/public/uploads/" + req.file.filename, __dirname + "/public/" + path, ()=>{});
        const workshop = new WorkShop({
            image : path,
            title : req.body.title,
            date : req.body.date,
            dates : req.body.date,
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