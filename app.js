const express     = require("express"),
	  mongoose    = require("mongoose"),
	  app         = express(),
	  bodyParser  = require("body-parser"),
	  multer      = require("multer"),
	  path        = require("path"),
	  fs          = require("fs"),
	  Book        = require("./models/book"),
	  Comment     = require("./models/comment"),
	  Study       = require("./models/study"),
	  studyDest   = "./public/uploads/study";

// SETTING UP STORAGE
const storageBook = multer.diskStorage({
	destination : function (req, file, callback) {
		callback(null, "./public/uploads/book");
	},
	filename : function (req, file, callback) {
		callback(null, file.fieldname + Date.now() + path.extname(file.originalname));
	}
});

const storageStudy = multer.diskStorage({
	destination : function (req, file, callback) {
		callback(null, studyDest);
	},
	filename : function (req, file, callback) {
		callback(null, file.fieldname +  Date.now() + path.extname(file.originalname));
	}
});

// UPLOAD INITIALISATION
const uploadBook = multer({
	storage : storageBook
}).fields([{name : "file", maxCount : 1}, {name : "cover", maxCount : 1}]);

const uploadStudy = multer({
	storage : storageStudy
}).single("zip");

mongoose.connect("mongodb://localhost/ashtray", {useNewUrlParser : true});

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
	res.render("landing");
});

// STUDY ROUTES

app.get("/study", function(req, res) {
	res.render("study/index");
});

app.post("/uploadStudy", function(req, res) {
	uploadStudy(req, res, function (err) {
		var newZip = studyDest + "/"+ req.body.exam + Date.now() + path.extname(req.file.filename);
		var topic = req.body.topic;
		var by = req.body.by;
		var type = req.body.type;
		fs.renameSync(req.file.path, newZip);
		var	newStudy = {topic : topic, file : newZip, by : by, type : type};
		Study.create(newStudy, function(err, newlyCreated) {
			if(err) {
				console.log(err);
			} else {
				console.log(newlyCreated);
				res.redirect("back");
			}
		});
	});
});

app.get("/study/:id", function(req, res) {
	Study.find({file: {$regex: req.params.id, $options: "$i"}}, function(err, allfiles) {
		if(err){
			console.log(err);
		} else {
			console.log(allfiles);
			res.render("study/show", {files : allfiles});
		}
	}); 
});

// BOOK ROUTES

app.get("/book", function(req, res) {
	Book.find({}, function(err, allbooks) {
		if(err){
			console.log(err);
		} else {
			res.render("book/index", {books : allbooks});
		}
    });
});

app.post("/uploadBook", uploadBook, function(req, res) {
	var title = req.body.title,
		file = "/uploads/book/" + req.files.file[0].filename,
		cover = "/uploads/book/" + req.files.cover[0].filename,
		genre = req.body.genre,
		desc = req.body.desc;
	var	newBook = {title : title, file : file, cover : cover, genre : genre, desc : desc};
	Book.create(newBook, function(err, newlyCreated) {
		if(err) {
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect("back");
		}
	});
});

app.get("/book/:id", function(req, res) {
	Book.findById(req.params.id).populate("comments").exec(function(err, foundBook) { 
		if(err) {
			console.log(err);
		} else {
			res.render("book/show", {book : foundBook});
		}
	});
});

app.post("/book/:id/comments", function(req, res) {
	Book.findById(req.params.id, function(err, book) {
		if(err) {
			console.log(err);
			res.redirect("/book/" + book._id);
		} else {
			var text = req.body.text,
				rate = req.body.rate;
			var	newComment = {text : text, rate : rate};
			Comment.create(newComment, function(err, comment) {
				if(err) { 
					console.log(err);
				} else {
					book.comments.push(comment);
					book.save();
					res.redirect("/book/" + book._id);
				}
			});
		}
	});
});

app.listen(process.env.PORT || 3000, process.env.IP, function() {
	console.log("Ashtray Server Has Started!");
});