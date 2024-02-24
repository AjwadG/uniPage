require('dotenv').config()
const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");

const multer = require('multer');
const fs = require('fs');

const mysql = require('mysql');

const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy
const { error, log } = require('console');


const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.use(session({
    secret: process.env.SESSION_SECREAT,
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

    const sql = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE,
        password: process.env.MYSQL_PASSWORD
    });


    authUser = async (username, password, done) => {
        user = await get_user(username, password);
        if (user == undefined)
            done (null, false);
        else {
            let authenticated_user = { id: user.id, name: user.name, level: user.level} 
            return done (null, authenticated_user ) 
        }
    }

    passport.use(new LocalStrategy (authUser))


    passport.serializeUser( (user, done) => {done(null, user.id)})

    passport.deserializeUser(async (id, done) => {done (null, await get_user_id(id)); }) 


    
    function get_workshops() {
          return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM workshops;", (err, result) => {
                return err ? reject(err) : resolve(result);
              }
            );
          })
    }
    function get_workshop(title) {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM workshops WHERE title = ?;", [title], (err, result) => {
                return err ? reject(err) : resolve(result[0]);
              }
            );
          })
    }
    function delete_workshop(image) {
        return new Promise((resolve, reject) => {
            sql.query( "DELETE FROM `workshops` WHERE image = ?;", [image], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    function add_workshop(values) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `workshops`(`image`, `title`, `date`, `dates`, `body`, `duration`, `place`) VALUES (?, ?, ?, ?, ?, ?, ?);", values, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    function edit_workshop(values) {
        return new Promise((resolve, reject) => {
            sql.query( "UPDATE `workshops` SET `title`= ? ,`date`= ? , `dates`= ? , `body`= ? , `image`= ? WHERE title = ?;", values, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    function get_students() {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM students;", (err, result) => {
                return err ? reject(err) : resolve(result);
              }
            );
          })
    }

    function get_student(idNO) {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM students WHERE idNo = ?;", [idNO],(err, result) => {
                return err ? reject(err) : resolve(result[0]);
              }
            );
          })
    }

    function delete_student(idNO) {
        return new Promise((resolve, reject) => {
            sql.query( "DELETE FROM `students` WHERE idNo = ?;", [idNO], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    function add_student(values) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `students`(`name`, `idNo`, `phoneNo`, `cert`, `Behavior`, `health`, `birth`, `resdient`, `selfie`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            values, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }
    function edit_student(values) {
        return new Promise((resolve, reject) => {
            sql.query( "UPDATE `students` SET `name`= ? ,`phoneNo`= ? WHERE idNo = ?", values, (err, result) => {
                return err ? reject(err) : resolve(result);
              }
            );
          })
    }

    function get_users() {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM users;", (err, result) => {
                return err ? reject(err) : resolve(result);
              }
            );
          })
    }

    function get_user(username, password) {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM users WHERE username = ? AND password = ?;", [username, password],(err, result) => {
                return err ? reject(err) : resolve(result[0]);
              }
            );
          })
    }

    function add_user(user) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `users`(`name`, `username`, `password`, `level`) VALUES (?, ?, ?, ?)", user, (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    function get_user_id(id) {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM users WHERE id;", [id],(err, result) => {
                return err ? reject(err) : resolve(result[0]);
              }
            );
          })
    }

    function delete_user(username) {
        return new Promise((resolve, reject) => {
            sql.query( "DELETE FROM `users` WHERE username = ?;", [username], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }





    var capacity = 10;

    app.get("/", async function(req, res){ 
        let workShops = await get_workshops();
        if (workShops == undefined)
            workShops = []
        if (workShops.length > 3)
            workShops = workShops.reverse().slice(0, 3);
        let a = -1;
            if (req.isAuthenticated()) {a = 1;};
        res.render("home", {workShops: workShops, lvl: a, now: Date.now()}) 
    });

    app.get("/about", function(req, res){ res.render("about", {}) });

    app.get("/architecture", function(req, res){ res.render("departments/architecture-department", {}) });

    app.get("/civil", function(req, res){ res.render("departments/civil-department", {}) });

    app.get("/communication", function(req, res){ res.render("departments/communication-department", {}) });

    app.get("/department:name", function(req, res){
         res.render("departments/tmp", {name: req.params.name}) 
        });

    app.get("/genral_news", function(req, res){
        res.render("news/genral", {}) 
    });
    app.get("/students_news", function(req, res){
        res.render("news/students", {}) 
    });
    app.get("/employees_news", function(req, res){
        res.render("news/employees", {}) 
    });

    app.get("/one", function(req, res){
        res.render("news/one", {}) 
    });

    app.get("/teachers", function(req, res){
        res.render("teachers", {}) 
    });

    app.get("/computer", function(req, res){ res.render("departments/computer-department", {}) });

    app.get("/general", function(req, res){ res.render("departments/general-department", {}) });

    app.get("/oil", function(req, res){ res.render("departments/oil-department", {}) });

    app.get("/dean", function(req, res){ res.render("dean-of-college", {}) });

    app.get("/administrations", function(req, res){res.render("administrations", {})});
    
    app.get("/offices", function(req, res){res.render("offices", {})});

    app.get("/about", function(req, res){ res.render("about", {}) });

    app.get("/signUp", async function(req, res){ 
        res.render("forms/signup", {access : 1, msg: 0}); 
    })

    app.get("/workShop", async function(req, res){
        let a = -1;
            if (req.isAuthenticated()) {a = 1;};
        let workShops = await get_workshops();
        res.render("Shop", {workShops: workShops, lvl: a, now: Date.now()})
    });
                        // delete button //
    app.post("/workShop", async function(req, res){
         if (req.isAuthenticated() && 1 >= 0) {
            if (await delete_workshop(req.body.image)  != 0) {
                try
                {
                        fs.unlinkSync(__dirname + "/public/" + req.body.image)
                }
                catch
                {
                    console.log("nothing to delete catch");
                }
            } else {
                console.log("nothing to delete else");
            }
        }
        res.redirect("workShop")
    });

   
    const fields = [{ name: 'cert', maxCount: 1 }, { name: 'Behavior', maxCount: 1 },
                    { name: 'health', maxCount: 1 }, { name: 'birth', maxCount: 1 },
                    { name: 'resdient', maxCount: 1 }, { name: 'selfie', maxCount: 1 }];

    app.post("/signUp", upload.fields(fields), async function(req, res) {
        state = await get_student(req.body.idNo)
         if (state != undefined) {
            let students = await get_students()
            res.render("forms/signup", {access : (students.length < capacity), msg: 1});
        }
        else
        {
            for (const [key, value] of Object.entries(req.files))
            {
                value[0].path = "uploads/students/" + req.body.idNo + value[0].fieldname + "." + value[0].originalname.split('.')[1];
                fs.rename(__dirname + "/public/uploads/" + value[0].filename, __dirname + "/public/" + value[0].path, ()=>{});
            }

            const student = [
                req.body.name,
                req.body.idNo,
                req.body.phoneNo,
                req.files["cert"][0].path,
                req.files["Behavior"][0].path,
                req.files["health"][0].path,
                req.files["birth"][0].path,
                req.files["resdient"][0].path,
                req.files["selfie"][0].path
            ]
            await add_student(student).catch(error => console.log(error))
            res.redirect("/");
        }})

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
        res.render("forms/login", {msg: "Wrong User Name or Password"});
    });


    app.get("/addUser", function(req, res){
        if (req.isAuthenticated() && req.user.level == 0)
                res.render("forms/addUser", {});
        else
            res.redirect("/");
    })

    app.post("/addUser",  async function(req, res){
        if (req.isAuthenticated() && req.user.level == 0)
        {
            let user = [req.body.name, req.body.username, req.body.password, 1]
            await add_user(user).catch(err => console.log(err))
        }
        res.redirect("/users");

    })

    app.get("/students", async function(req, res){
        if (req.isAuthenticated()){
            let students = await get_students()
            res.render("user/student", {Students : students, lvl: req.user.level, cpt: capacity});
        } else {
            res.redirect("/login");
        }
    })
    app.post("/cpt", async function(req, res){
        if (req.isAuthenticated() && req.user.level == 0){
            capacity = req.body.cpt
        }
        res.redirect("/students");
    })

    app.get("/student-info_:idNO", async function(req, res){
        if (req.isAuthenticated()) {
            let students = await get_student(req.params.idNO);
            if (students == undefined)
                res.redirect("/students");
            else
                res.render("user/student-Info", {student : students, lvl : req.user.level});
        }
        else {
            res.redirect("/");
        }
    })
                    // delete student //
    app.post("/student-info", async function(req, res) {
        const student = await get_student(req.body.idNO);
        await delete_student(req.body.idNo).then(resault => {
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.cert);
            }
            catch
            {
                console.log("nothing to delete");
            }
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.Behavior);
            }
            catch
            {
                console.log("nothing to delete");
            }
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.health);
            }
            catch
            {
                console.log("nothing to delete");
            }
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.birth);
            }
            catch
            {
                console.log("nothing to delete");
            }
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.resdient);
            }
            catch
            {
                console.log("nothing to delete");
            }
            try
            {
                fs.unlinkSync(__dirname + "/public/" + student.selfie);
            }
            catch
            {
                console.log("nothing to delete");
            }
        }).catch(err => console.log(err));
        res.redirect("/students");
    })
    
    app.get("/edit-student:idNo", async function(req, res) {
        if (req.isAuthenticated()) {
            let student = get_student(req.params.idNo);
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
            await edit_student([req.body.name, req.body.phoneNo, req.body.idNo]).catch(err => console.log(err))
        } 
        res.redirect("/student-info_" + req.body.idNo);
    })

    app.get("/users", async function(req, res){
        if (req.isAuthenticated() && req.user.level == 0) {
                let users = await get_users();
                res.render("user/users", {Users : users});
        } else {
            res.redirect("/");
        }
    })
    app.post("/users", async function(req, res) {
        await delete_user(req.body.username).catch(err => console.log(err))
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
            let workShop = await get_workshop(req.params.title);
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
            
            await edit_workshop([req.body.title, req.body.date, req.body.date, req.body.body, path, req.body.old])
                .then(resault => {
                    if (resault != 0)
                        fs.rename(__dirname + "/public/" + req.body.path, __dirname + "/public/" + path, () => {});
                }).catch(err => console.log(err));
        } 
        res.redirect("/workShop");
    })

    app.get("/logout", function(req, res){
         req.logout(function(err) {
            if (err) { console.log(err); } else {
                res.redirect('/');
            }});
        res.redirect('/');
    })
    
    app.post("/workShops", upload.single('image'), async function(req, res) {
        const path = "uploads/workshops/" + req.body.title + "." +req.file.originalname.split('.')[1];
        fs.rename(__dirname + "/public/uploads/" + req.file.filename, __dirname + "/public/" + path, ()=>{});
         const workshop = [
            path,
            req.body.title,
            req.body.date,
            req.body.date,
            req.body.body,
            req.body.duration,
            req.body.place
        ]
        await add_workshop(workshop).catch(err => console.log(err))
        res.redirect("/workShop")
    });

    app.get("/feadBack", async function(req, res){
        res.render("feadBack/main", {});
    })

    app.post("/feadBack", async function(req, res){
        const dept = req.body.dept;
        const year = req.body.year;
        res.render("feadBack/good", {dept: dept, year: year});
    })

    function add_good(body, i) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `good`(`dept`, `year`, `name`, `tech`, `percent`, `notes`) VALUES (?, ?, ?, ?, ?, ?)", 
            [body.dept, body.year, body.name[i], body.tech[i], body.percent[i], body.notes[i]], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }
    app.post("/good", async function(req, res){
        const dept = req.body.dept;
        const year = req.body.year;

        for (let i = 0; i < req.body.name.length; i++) {
            await add_good(req.body, i).catch(err => console.log(err));
        }
        res.render("feadBack/bad", {dept: dept, year: year});
    })

    function add_bad(body, i) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `bad`(`dept`, `year`, `name`, `tech`, `percent`, `number`, `notes`) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [body.dept, body.year, body.name[i], body.tech[i], body.percent[i], body.number[i], body.notes[i]], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }
    app.post("/bad", async function(req, res){
        const dept = req.body.dept;
        const year = req.body.year;

        for (let i = 0; i < req.body.name.length; i++) {
            await add_bad(req.body, i).catch(err => console.log(err));
        }
        res.render("feadBack/improve", {dept: dept, year: year});
    })

    function add_improve(body, i) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `improve`(`dept`, `year`, `name`, `type`, `why`, `notes`) VALUES (?, ?, ?, ?, ?, ?)", 
            [body.dept, body.year, body.name[i], body.type[i], body.why[i], body.notes[i]], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }
    app.post("/improve", async function(req, res){
        const dept = req.body.dept;
        const year = req.body.year;

        for (let i = 0; i < req.body.name.length; i++) {
            await add_improve(req.body, i).catch(err => console.log(err));
        }
        res.render("feadBack/weak", {dept: dept, year: year});
    })

    function add_weak(body, i) {
        return new Promise((resolve, reject) => {
            sql.query( "INSERT INTO `weak`(`dept`, `year`, `name`, `tech`, `type`, `notes`) VALUES (?, ?, ?, ?, ?, ?)", 
            [body.dept, body.year, body.name[i], body.tech[i], body.type[i], body.notes[i]], (err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }
    app.post("/weak", async function(req, res){
        for (let i = 0; i < req.body.name.length; i++) {
            await add_weak(req.body, i).catch(err => console.log(err));
        }
        res.redirect("/done");
    })

    function get_from(table) {
        return new Promise((resolve, reject) => {
            sql.query( "SELECT * FROM " + table + ";", (err, result) => {
                return err ? reject(err) : resolve(result);
              }
            );
          })
    }

    app.get("/review", async function(req, res){
        if (!req.isAuthenticated()) {
            return res.redirect("/");
        } 
        
        const tables = ["weak", "improve", "bad", "good"]
        for (let i = 0; i < tables.length; i++) {
            const a = tables[i];
            tables[i] = await get_from(tables[i]).catch(err => console.log(err));
            tables[i] = [a, [...tables[i]]]
        }
        res.render("user/review", {tables: tables});
    })

    function delete_from(table, id) {
        return new Promise((resolve, reject) => {
            sql.query( "DELETE FROM " + table + " WHERE id = ?;", [id],(err, result) => {
                return err ? reject(err) : resolve(result.affectedRows);
              }
            );
          })
    }

    app.post("/review", async function(req, res){
        if (!req.isAuthenticated()) {
            return res.redirect("/");
        } 
        const tables = ["weak", "improve", "bad", "good"]
        const { table, id } = req.body
        if (tables.includes(table)) {
            await delete_from(table, id)
        }
        res.redirect("/review");
    })

    app.get("/done", function(req, res){
        res.render("feadBack/done", {});
    })


    app.get("*", (req, res) => {
        res.redirect("/");
    })

    const PORT = process.env.PORT || 3000 ;
    app.listen(PORT , function(){
        console.log("server started at port " + PORT);
    })
}