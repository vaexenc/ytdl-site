"use strict";

const express = require("express");
const favicon = require("express-favicon");
const path = require("path");

const port = 80;

function onError(err) {
	if (!err) return;
	console.error(new Error().stack);
	console.error(err);
}

const app = express();
app.use(favicon(path.join(__dirname, "assets/public/favicon.png")));
app.use("/public", express.static("assets/public"));

// app.post("/request", (req, res) => {

// });

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/assets/index.html", (err) => onError(err));
});

app.get("/test", (req, res) => {
	res.send("test");
});

app.get("/*", (req, res) => {
	res.redirect("/");
});

app.listen(port, () => {
	console.log("Started app.");
});

// http.get("http://localhost");
