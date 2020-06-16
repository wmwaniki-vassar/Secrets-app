require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

//Initialize "app" via exxpress
const app = express();

//set ejs as view engine for express
app.set('view engine', 'ejs');

//set up app to use bodyParser to obtain data from post requests
app.use(bodyParser.urlencoded({ extended: true }));

//set up express to load static files from the public folder
app.use(express.static("public"));

//Set up MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true });

//create a model and schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model('User', userSchema);


// //example for creating and saving a new document based on the model defined previously
// const user = new Article({ 
//     title: 'React', 
//     content: "React is a front end library that speeds app the development process" 
// });

// article1.save().then(() => console.log('saved article'));

// HTTP requests to the home route
app.route("/")
    .get((req, res) => { res.render("home") });

app.route("/login")
    .get((req, res) => { res.render("login") })

    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ email: username }, (err, foundUser) => {
            if (err) {
                console.log(err)
            } else if (foundUser) {
                foundUser.password === password ? res.render("secrets") : res.send("Uh Oh! Check your Password, " + username)
            } else {
                res.send("User not found");
            }
        })
    });

app.route("/register")
    .get((req, res) => { res.render("register") })

    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save((err) => {
            err ? res.render("Sorry, Unable to create user") : res.render("secrets");
        })
    });

//server app via port 3000
app.listen(3000, () => { console.log("Server started on port 3000") });