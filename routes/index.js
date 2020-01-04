var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Workout = require("../models/workout");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");




//ROOT ROUTE to the home page
router.get("/", function(req,res){
    res.render("landing");
});

//AUTH ROUTES
//show register form
router.get("/register", function(req,res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req,res){
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar,
        bio: req.body.bio
    });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("register", {"error": err.message});
        } else {
            passport.authenticate("local")(req,res, function(){
                req.flash("success", "Welcome to WorkoutCamp "+ user.username);
                res.redirect('/workouts');
            });
        }
    });
});


//SHOW LOGIN FORM
router.get("/login", function(req,res){
    res.render("login");
});
//handling login logic
router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/workouts",
    failureRedirect: "/login",
    failureFlash: true
}), function(req,res){
});

//LOGOUT route
router.get("/logout", function(req,res){
    req.logout();
    req.flash("success", "Logged out!");
    res.redirect("/workouts");
});

//forgot password
router.get("/forgot", function(req,res){
    res.render("forgot");
});

//Handling forgot password logic & ALLOWS FOR PASSWORD RESET FEATURE
//post method copied from password reset walkthrough
//BOMBARDED WITH CODE FROM YOUTUBE VIDEO 
//============================================================================================
router.post("/forgot", function(req,res,next){
    //allows multiple functions to run at once
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err, buf){
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token,done){
            User.findOne({
                email: req.body.email
            }, function(err,user){
                if(!user){
                    req.flash('error', 'No account with that email address exists!');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token,user,done){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'martian0718@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'martian0718@gmail.com',
                subject: "WorkoutCamp Password Reset",
                text: "Hey! You ar receiving this because you or (someone else) have requested the reset of the password for Workout Camp."
                + "Please click on the following link, or paste into your browser to complete the process: "
                + "http://"+req.headers.host+'/reset/'+token+'\n\n'+
                "If you did not request this, please ignore this email"
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log('mail sent');
                req.flash('success', 'An email has been sent to ' + user.email + ' with further instructions');
                done(err, 'done');
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now() } }, function(err, user){
        if(!user){
           req.flash('error', 'Password reset token is invalid or has expired.');
           return res.redirect('/forgot'); 
        } else {
            res.render('reset', {token: req.params.token});
        }
    });
});

router.post('/reset/:token', function(req,res){
    async.waterfall([
       function(done){
           User.findOne({
               resetPasswordToken: req.params.token,
               resetPasswordExpires: {$gt: Date.now()}
           }, function(err, user){
               if(!user){
                   req.flash('error', 'Password reset token is invalid or has expired.');
                   return res.redirect('back');
               }
               if(req.body.password === req.body.confirm){
                   user.setPassword(req.body.password, function(err){
                       user.resetPasswordToken = undefined;
                       user.resetPasswordExpires = undefined;

                       user.save(function(err){
                           req.logIn(user, function(err){
                               done(err, user);
                           });
                       });
                   });
               } else {
                   req.flash('error', 'Passwords do not match.');
                   return res.redirect('back');
               }
           });
       },
       function(user,done){
           var smtpTransport = nodemailer.createTransport({
               service: 'Gmail',
               auth: {
                   user: 'matian0718@gmail.com',
                   pass: process.env.GMAILPW
               }
           });
           var mailOptions = {
               to: user.email,
               from: 'martian0718@gmail.com',
               subject: 'Your password has been changed',
               text: 'This is a confirmation that the password for your account has changed.'
           };
           smtpTransport.sendMail(mailOptions, function(err){
               req.flash('success', 'Success! Your password has been changed.');
               done(err);
           });
       }
    ], function(err){
        res.redirect('/workouts');
    });
});
//END OF BOMBARDED CODE FROM YOUTUBE VIDEO 
//====================================================================================================



module.exports = router;


