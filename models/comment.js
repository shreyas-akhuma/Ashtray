const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    text : String,
	rate : String   
});

module.exports = mongoose.model("Comment", commentSchema);