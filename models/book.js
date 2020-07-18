const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	title : String,
	cover : String,
	file : String,
	desc : String,
	genre : [String],
	comments : [{
		type : mongoose.Schema.Types.ObjectId,
		ref : "Comment"
	}]
});

module.exports = mongoose.model("Book", bookSchema);