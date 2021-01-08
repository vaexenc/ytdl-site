"use strict";

const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const youtubedl = require("youtube-dl");

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
		res.json({});
	}
	const query = req.query;
	if (!query || !query.q) {
		sendEmptyResponse();
		return;
	}
	youtubedl.exec(query.q, ["--dump-json"], {}, (err, output) => {
		if (err) {
			sendEmptyResponse();
			return;
		}
		const outputJSON = output[0];
		const jsonParsed = JSON.parse(outputJSON);
		if (jsonParsed.extractor !== "youtube") {
			sendEmptyResponse();
		} else {
			res.json(jsonParsed);
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
	console.log(`Running at port ${port}`);
});
