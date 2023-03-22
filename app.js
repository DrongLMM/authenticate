//jshint esversion:6
require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// var encrypt = require('mongoose-encryption');

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));



const dbConnect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/"+process.env.DB);
    console.log("DB scretDB is connected");
  } catch (e) {
    console.log("DB is not connected");
    console.log(e.message);
    process.exit(1);
  }
};

const userSchema = mongoose.Schema({
  email: {
    type: String,
    unique: [ true, "This is registered already" ],
    required: [ true, "Email is required"],
    validate: {
      validator: function(v){
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not an email id`
    }
  },
  password:{
    type: String,
    required: [true, "Password is required"],
    validate: {
      validator: function(v){
        return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{4,}$/.test(v);
      },
      message: props => `${props.value} is not valid password`
    }
  }
});

// var secret = "thisisastringtocreatesecretestring";
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const User =  mongoose.model("User", userSchema );



app.get("/", (req, res) =>{
  res.render("home");
});

app.get("/register", (req, res) =>{
  res.render("register", {error: ""});
});

app.get("/login", (req, res) =>{
  res.render("login", {error: ""});
});


app.post("/register", async (req, res) =>{
  const userName = req.body.username;
  const password = req.body.password;
  try {
    const newUser = new User({
      email: userName,
      password: password
    });

    const addUser = await newUser.save();
    if(addUser){
      res.render("secrets");
    }{
      const err = "You are not registered, Please try again";
      res.render("register", { error: err } );
    }

  } catch (e) {

    if(e.name === "MongoServerError"){
        res.render("register", { error: userName + " is already registered!" } );
    } else if(e.errors.email){
      res.render("register", { error: e.errors.email.message } );
    }else if(e.errors.password){
      res.render("register", { error: e.errors.password.message } );
    }else {
      console.log(e.message);
    }

  }

});


app.post("/login", async (req, res) =>{
  const userName = req.body.username;
  const password = req.body.password;

  try {

    const foundUserName = await User.findOne({email: userName});

    if(foundUserName === null){
      res.render("login", {error: "Email is not registered"});
    } else {
      if(foundUserName.email === userName ){
        if(foundUserName.password === password){
          res.render("secrets");
        }else{
          res.render("login", {error: "Password doesn't match"});
        }
      }else {
        res.render("login", {error: "Email doesn't match"});
      }
    }




  } catch (e) {
    console.log(e.message);
  }

})


app.listen(3000, async function(){
  console.log("server is running at port 3000");
  await dbConnect();
})
