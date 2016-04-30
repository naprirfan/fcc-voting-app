/*
TODO :
1. Implement vote
2. Make all UI's path more seamless if possible
*/

//setup variables & modules
const ACCESS_TOKEN_REQUEST_URL = "https://github.com/login/oauth/access_token";
require('dotenv').config();
var express = require("express");
var app = express();
var sass = require("node-sass");
var request = require("request");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var mongodb = require("mongodb");
var mongodbclient = mongodb.MongoClient;
var db_url = "mongodb://"+ process.env.MONGODB_USER +":"+ process.env.MONGODB_PASSWORD +"@ds013951.mlab.com:13951/fcc-challenge";

app.use('/dist', express.static(__dirname + '/dist'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());

//define view engine
app.set("views", __dirname + "/src/jade");
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
			res.cookie("token", body.access_token, {maxAge : 360000000});
			res.redirect("/");
		}
	)
});
app.get("/findAllPoll", function(req,res){
	mongodbclient.connect(db_url, function(err,db){
		if (err) throw err;
		
		var collection = db.collection("voting_app");
		collection.find(
			{}
		).toArray(function(err, docs){
			if (err) throw err;
			res.cookie("ip_address", req.ip, {maxAge : 360000000});
			res.end(JSON.stringify(docs));
			db.close();
		});	
	});
});
app.get("/signout", function(req,res){
	res.clearCookie("token");
	res.redirect("/");
});
app.put("/vote", function(req,res) {
	var pushUpdate;
	//if user is authed
	if (req.cookies.token !== undefined) {
		pushUpdate = {
			username_voters : req.cookies.token
		};
	}
	//if user is NOT authed
	else {
		pushUpdate = {
			ip_voters : req.ip
		}
	}

	mongodbclient.connect(db_url, function(err,db){
		if (err) throw err;
		
		var votekey = "result." + req.body.vote;
		var incrementUpdate = {};
		incrementUpdate[votekey] = 1;

		var collection = db.collection("voting_app");
		collection.findAndModify(
		    { _id: new mongodb.ObjectID(req.body._id) },     // query
		    [],               // represents a sort order if multiple matches
		    { 
		    	$push: pushUpdate,
		    	$inc : incrementUpdate
		    },   // update statement
		    { new: false },    // options - new to return the modified document
		    function(err,doc) {
		    	res.end(JSON.stringify(doc));
		    }
		);
	});
});

app.put("/vote/add_option", function(req,res){

});

app.delete("/deletepoll", function(req,res){
	
	if (req.cookies.token === undefined) {
		res.end(403, "not authorized");
		return;
	}
	
	mongodbclient.connect(db_url, function(err,db){
		if (err) throw err;
		
		var collection = db.collection("voting_app");
		collection.remove(
			{
				_id : new mongodb.ObjectID(req.body.id)
			},
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

app.post("/createpoll", function(req,res){
	
	if (req.cookies.token === undefined) {
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

	mongodbclient.connect(db_url, function(err,db){
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