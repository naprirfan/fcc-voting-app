//setup variables & modules
const ACCESS_TOKEN_REQUEST_URL = "https://github.com/login/oauth/access_token";
require('dotenv').config();
var express = require("express");
var app = express();
var sass = require("node-sass");
var request = require("request");
var bodyParser = require("body-parser");
app.use('/dist', express.static(__dirname + '/dist'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

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
			res.cookie("token", req.query.code, {maxAge : 3600000});
			res.redirect("/");
		}
	)
});
app.get("/signout", function(req,res){
	res.clearCookie("token");
	res.redirect("/");
});
app.post("/vote", function(req,res) {
	console.log(req.body);
	res.end(JSON.stringify({message : "success"}));
});

//todo : implement authorized only
app.get("/createpoll", function(req,res){
	res.end(JSON.stringify({message : "success"}));
});
app.get("*", function(req,res){
	res.end("404!");
});

//start server
app.listen(process.env.PORT || 5000);
console.log("I'm listening...");