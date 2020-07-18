const mongoose = require("mongoose");

const studySchema = new mongoose.Schema({
    topic : String,
    file : String,
    by : String,
    type : [String]
});

module.exports = mongoose.model("Study", studySchema);