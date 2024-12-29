require('dotenv').config();
const express = require('express');
const path = require('path');
const port = process.env.PORT || 4500;
require("../src/db/conn");
const Register = require("./models/register");
const app = express();
const hbs = require("hbs");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

 
const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
// middleware to parse json data
app.use(express.json());
app.use(express.urlencoded({extended:false}));
// console.log(static_path);
app.use(express.static(static_path));
app.set("view engine","hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);

app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/register", (req, res) => {
    res.render("register", {
        title: "User Registration",
    });
});

// create a new user in our database
app.post("/register", async(req,res)=>{
    try {
        const password = req.body.password;
        const confirm_password= req.body.confirm_password;
        if(password===confirm_password){
            const registerEmployee = new Register({
                first_name:req.body.first_name,
                last_name:req.body.last_name,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                email:req.body.email,
                password:req.body.password,
                confirm_password:req.body.confirm_password
            });
            const token = await registerEmployee.generateAuthToken();
            console.log(`the token part ${token}`)

            // to password hash
            const result = await registerEmployee.save();
            res.status(201).render("index");
        }else{
            res.send("invalid information");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/getUser",async(req,res)=>{
    const userdata = await Register.find();
    console.log(userdata);
    res.send(userdata);
}); 

app.get("/login", (req, res) => {
    res.render("login", {
        title: "Login Page",
    });
});

// login check
app.post("/login", async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({email:email});
         
        const isMatch = await bcrypt.compare(password,useremail.password);

        const token = await useremail.generateAuthToken();
        console.log(`the token part ${token}`);

        if(isMatch){
            res.status(201).render("index");
        }else{
            res.send("invalid password details");
        }
    } catch (error) {
        res.status(400).send("invalid Email details");
    }
});


app.listen(port,()=>{
    console.log(`connection is setup at the port ${port}`);
});