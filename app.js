//setup variables & modules
const ACCESS_TOKEN_REQUEST_URL = "https://github.com/login/oauth/access_token";
require('dotenv').config();
var express = require("express");
var app = express();
var sass = require("node-sass");
var request = require("request");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var mongodb = require("mongodb").MongoClient;
var db_url = "mongodb://"+ process.env.MONGODB_USER +":"+ process.env.MONGODB_PASSWORD +"@ds013951.mlab.com:13951/fcc-challenge";

app.use('/dist', express.static(__dirname + '/dist'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());

//define view engine
app.set("views", __dirname + "/views");
app.set("view engine", "pug");

/*
-------------
ROUTES
-------------
*/
app.get("/", function(req,res){
	res.render("index");
});

app.get("/auth/github_callback", function(req,res){
	request.post(
		ACCESS_TOKEN_REQUEST_URL,
		{json : {
			client_id : process.env.GITHUB_ID,
			client_secret : process.env.GITHUB_SECRET,
			code : req.query.code
		}},
		function (err, response, body) {
			if (err) res.end(err);
			//put the token in cookie
			res.cookie("token", req.query.code, {maxAge : 360000000});
			res.redirect("/");
		}
	)
});
app.get("/findAllPoll", function(req,res){
	mongodb.connect(db_url, function(err,db){
		if (err) throw err;
		
		var collection = db.collection("voting_app");
		collection.find(
			{}
		).toArray(function(err, docs){
			if (err) throw err;
			res.end(JSON.stringify(docs));
			db.close();
		});	
	});
	
	
});
app.get("/signout", function(req,res){
	res.clearCookie("token");
	res.redirect("/");
});
app.post("/vote", function(req,res) {
	res.end(JSON.stringify({message : "success"}));
});

//todo : implement authorized only
app.post("/createpoll", function(req,res){
	console.log("post coming");


	if (req.cookies.token === undefined) {
		console.log('not authorized');
		res.end(403, "not authorized");
		return;
	}

	var optArr = req.body.poll_options.split(",");
	var result = {};
	for (var i = 0; i < optArr.length; i++) {
		result[optArr[i]] = 0;
	}
	//forming entry
	var entry = {
		author : req.cookies.token,
		status : "active",
		title : req.body.title,
		description : req.body.description,
		result : result,
		ip_voters : [],
		username_voters : []
	};

	mongodb.connect(db_url, function(err,db){
		if (err) throw err;
		
		var collection = db.collection("voting_app");
		collection.insert(
			entry,
			function(err, docs) {
				
				if (err) {
					res.end(err);
				}
				else {
					res.end(JSON.stringify({message: "success"}));
				}
				db.close();
			}
		);
	});
});
app.get("*", function(req,res){
	res.end("404!");
});

//start server
app.listen(process.env.PORT || 5000);
console.log("I'm listening...");