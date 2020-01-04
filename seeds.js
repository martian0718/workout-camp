var mongoose = require('mongoose'),
    Workout = require('./models/workout'),
    Comment = require('./models/comment');
//Sample workouts to put in database for testing
var data = [
    {
        name: "Leg Day",
        image: "https://dynaimage.cdn.cnn.com/cnn/c_fill,g_auto,w_1200,h_675,ar_16:9/https%3A%2F%2Fcdn.cnn.com%2Fcnnnext%2Fdam%2Fassets%2F160813133720-michael-phelps-legacy.jpg",
        description: "first leg day ever"

    },
    {
        name: "Arm Day",
        image: "https://www.biography.com/.image/t_share/MTY1MDU2ODg0MzU5ODMyODg4/mens-100-meter-butterfly-during-day-seven-of-the-2016-us-olympic-team-swimming-trials-at-centurylink-center-on-july-2-2016-in-omaha-nebraska-photo-by-tom-penningtongetty-images.jpg",
        description: "first arm day ever"

    },
    {
        name: "All body day",
        image: "https://i.ytimg.com/vi/KyQgxLxG3iQ/maxresdefault.jpg",
        description: "first whole body day ever"

    }
];


function seedDB(){
    //Remove all Campground for testing
    Workout.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed workouts");

            //Adding a few workouts from data array
            data.forEach(function(seed){
                Workout.create(seed, function(err,workout){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("added a workout");
                        //create a comment
                        Comment.create(
                            {
                                text: "This place is great",
                                author: "Homer"
                        
                            }, function(err, comment){
                            if(err){
                                console.log(err);
                            } else {
                                workout.comments.push(comment);
                                workout.save();
                                console.log("added a comment");
                            }
                        });
                    }
                });
            });
        }
    });
}


module.exports = seedDB;


