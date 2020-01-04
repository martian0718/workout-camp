//MIDDLEWARE FUNCTIONS
var Workout = require("../models/workout");
var Comment = require("../models/comment");
var User = require("../models/user");
var middlewareObj = {};

middlewareObj.checkWorkoutOwnership = function(req,res,next){
                                            if(req.isAuthenticated()){
                                                Workout.findById(req.params.id, function(err, foundWorkout){
                                                    if(err || !foundWorkout){
                                                        req.flash("error", "Workout not found");
                                                        res.redirect("back");
                                                    } else 
                                                        if(foundWorkout.author.id.equals(req.user._id) || req.user.isAdmin){
                                                            req.workout = foundWorkout;
                                                            next();
                                                        } else {
                                                            req.flash("error", "You don't have permission to do that!");
                                                            res.redirect("/workouts/"+req.params.id);
                                                        }
                                                    
                                                });
                                            } else {
                                                req.flash("error", "You must be logged in to do that!");
                                                res.redirect("back");
                                            }
                                        }

middlewareObj.checkCommentOwnership = function(req,res,next){
                                            if(req.isAuthenticated()){
                                                Comment.findById(req.params.comment_id, function(err, foundComment){
                                                    if(err || !foundComment){
                                                        req.flash('error', "sorry, that comment doesn't exist!");
                                                        res.redirect("back");
                                                    } else 
                                                        
                                                        if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                                                            req.comment = foundComment;
                                                            next();
                                                        } else {
                                                            req.flash('error', "You don't have permission to do that!");
                                                            res.redirect("/workouts/"+req.params.id);
                                                        }
                                                    
                                                });
                                            } else {
                                                res.redirect("back");
                                            }
                                        }

middlewareObj.isLoggedIn = function(req,res,next){
                                if(req.isAuthenticated()){
                                    return next();
                                } else {
                                    req.flash("error", "You must be logged in to do that!"); //won't actually display anything but give us capability to display for next request
                                    res.redirect("/login");
                                }
                            }
middlewareObj.checkUser = function(req,res,next){
                                if(req.isAuthenticated()){
                                    User.findById(req.params.id, function(err, foundUser){
                                        if(err || !foundUser){
                                            req.flash('error', "Sorry, the user doesn't exist!");
                                            res.redirect("back");
                                        } else {
                                            if(foundUser.username == req.user.username){
                                                next();
                                            } else {
                                                req.flash('error', "You don't have permission to edit this user's profile");
                                                res.redirect('/workouts');
                                            }
                                        }
                                    });
                                } else {
                                    res.redirect('back');
                                }
                            }
module.exports = middlewareObj;