var express = require("express");
var router = express.Router({mergeParams: true});
var Workout = require("../models/workout");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");


//========================================================
//COMMENTS ROUTES
//======================================================

//COMMMENTS NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
    //find workout by id
    Workout.findById(req.params.id, function(err, workout){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {workout: workout});
        }
    });
    
});
//COMMENTS CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
    //lookup workouts using ID
    Workout.findById(req.params.id, function(err, workout){
        if(err){
            console.log(err);
            res.redirect("/workouts");
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    workout.comments.push(comment);
                    workout.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/workouts/"+ workout._id);
                }
            });
            //connect new comment to workout
            //redirect to workout show page
        }
    });
});

//COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.isLoggedIn,middleware.checkCommentOwnership, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "Successfully deleted comment");
            res.redirect("/workouts/" + req.params.id);
        }
    });
});





module.exports = router;
