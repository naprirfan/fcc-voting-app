//setup variables & modules
var express = require("express");
var app = express();
var sass = require("node-sass");
app.use('/dist', express.static(__dirname + '/dist'));
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

app.get("*", function(req,res){
	res.end("404!");
});

//start server
app.listen(process.env.PORT || 5000);
console.log("I'm listening...");