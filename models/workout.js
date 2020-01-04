var mongoose = require('mongoose');
const Comment = require('./comment');

//SCHEMA SETUP
var workoutSchema = new mongoose.Schema({
    name: String,
    typeOfWorkout: String,
    image: String,
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

workoutSchema.pre('remove', async function(){
    await Comment.remove({
        _id: {
            $in: this.comments
        }
    });
});

module.exports = mongoose.model("Workout", workoutSchema); 