"use strict";

const {exec} = require("child_process");
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

app.get("/query", (req, res) => {
	function sendEmptyResponse() {
		res.json("{}");
	}
	const query = req.query;
	if (!query || !query.q) {
		sendEmptyResponse();
		return;
	}
	exec("youtube-dl --dump-json " + query.q, (error, stdout, stderr) => {
		if (error) {
			sendEmptyResponse();
		}
		else {
			res.set("Content-Type", "application/json");
			res.end(stdout);
		}
	});
});

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/assets/index.html", (err) => onError(err));
});

// app.get("/test", (req, res) => {
// 	res.send("test")
// });

app.get("/*", (req, res) => {
	res.redirect("/");
});

app.listen(port, () => {
	console.log("Started app.");
});
