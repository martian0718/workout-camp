require('dotenv').config();

const express = require("express"),
      app = express(),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require('passport'),
      LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      flash = require("connect-flash"),
      Workout = require('./models/workout'),
      Comment = require("./models/comment"),
      User = require("./models/user"),
      seedDB = require("./seeds");
//REQUIRING ROUTES
var commentRoutes = require("./routes/comments"),
    workoutRoutes = require("./routes/workouts"),
    userRoutes = require("./routes/users"),
    indexRoutes   = require("./routes/index");

//seedDB(); //seed the database
mongoose.connect("mongodb+srv://martian0718:Martian0718@cluster0-q4yhz.mongodb.net/workout_camp?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); //allows us to not have to write ejs after every ejs file
app.use(express.static(__dirname + "/public"));//includes files in public 
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Swimming is the best sport ever!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//middleware that will run for every single route
//allows us to include currentUser on every template
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/users", userRoutes);
app.use("/workouts", workoutRoutes);
app.use("/workouts/:id/comments", commentRoutes);


//always listen to local port 3000 for testing 
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("WorkoutCamp has started");
});