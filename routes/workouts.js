var express = require("express");
var router = express.Router({mergeParams: true});
var Workout = require("../models/workout");
var middleware = require("../middleware/index");
//code from github to take in image files
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'workoutcamp', 
  api_key: '975229855485475', 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
//end of github code 

//Retrieving all workouts to show to users 
router.get("/", function(req,res){
    //get all workouts from DB
    Workout.find({}, function(err, allWorkouts){
        if(err){
            console.log(err);
        } else {
            res.render("workouts/index", {workouts: allWorkouts, currentUser: req.user});
        }
    });
  

    //res.render("workouts", {workouts: workouts});//second workouts is the data we are putting into the workouts.ejs file
});
//CREATE - add new workout to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    //get data from form and add to workouts array
    cloudinary.uploader.upload(req.file.path, function(result){
        req.body.workout.image = result.secure_url;
        req.body.workout.author = {
            id: req.user._id,
            username: req.user.username
        };
        //create a new workout and save to DB
        Workout.create(req.body.workout, function(err, workout){
            if(err){
                return res.redirect('back', {'error': err.message});
            } else {
                //redirect back to campgrounds page
                res.redirect("/workouts/"+workout.id);
            }
        });
    });
});
//NEW - allows us to input information into form to add workouts to database
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("workouts/new");
});

//SHOW - shows more info about one campground
router.get("/:id", function(req,res){
    //find workout with provided ID
    Workout.findById(req.params.id).populate("comments").exec(function(err, foundWorkout){
        if(err || !foundWorkout){
            console.log(err);
            req.flash("error", "Sorry, that workout does not exist!");
            res.redirect("back");
        } else {
            console.log(foundWorkout);
            //render show template with the workout
            res.render("workouts/show", {workout: foundWorkout});
        }
    });
    //render show page with specific workout
});

//EDIT WORKOUT ROUTE

router.get("/:id/edit", middleware.checkWorkoutOwnership, function(req,res){
        Workout.findById(req.params.id, function(err, foundWorkout){
            if(err || !foundWorkout){
                req.flash("error", "Could not find workout!");
                res.redirect("back");
            } else {
                res.render("workouts/edit", {workout: foundWorkout});
            }
            
        });     
});

//UPDATE WORKOUT ROUTE
router.put("/:id", middleware.checkWorkoutOwnership, upload.single('image'), function(req,res){
    //find and update correct workout
    //redirect somewhere else
    Workout.findByIdAndUpdate(req.params.id, req.body.workout, function(err, updatedWorkout){
        if(err){
            res.redirect('/workouts');
        } else {
            req.flash("success", "Successfully updated!");
            res.redirect("/workouts/" + req.params.id);
        }
    });
});

//DESTROY WORKOUT ROUTE
router.delete("/:id", middleware.checkWorkoutOwnership, function(req,res){
    Workout.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/workouts");
        } else {
            req.flash("success", "Workout successfully deleted!");
            res.redirect("/workouts");
        }
    });
});





module.exports = router;