"use strict";

const inputBar = document.getElementById("input-bar");
const progressBar = document.getElementById("progress-bar");
const failIndicator = document.getElementById("fail-indicator");
let globalFetchObject;

function getYoutubeIDFromString(input) {
	const pattern1 = /(?:vi?=|\/embed\/|youtu.be\/|\/vi?\/)(?<id>[a-zA-Z0-9-_]{11})(?:[^a-zA-Z0-9-_]|$)/;
	const pattern2 = /^(?<id>[a-zA-Z0-9-_]{11})$/;
	const match = input.match(pattern1) || input.match(pattern2);
	if (match) return match.groups.id;
}

function indicateWarning() {
	failIndicator.className = "fail-indicator-warning";
	failIndicator.title = "Invalid input";
}

function indicateError() {
	failIndicator.className = "fail-indicator-error";
	failIndicator.title = "Error";
}

function disableIndicator() {
	failIndicator.className = "";
	failIndicator.title = "";
}

function enableProgressBar() {
	progressBar.className = "progress-bar-enabled";
}

function disableProgressBar() {
	progressBar.className = "";
}

function fetchVideoJSON(youtubeID) {
	globalFetchObject = fetch("/query?q=" + youtubeID);
	const fetchObject = globalFetchObject;
	fetchObject.then((response, error) => {
		if (fetchObject !== globalFetchObject) return;
		if (error) {
			disableProgressBar();
			indicateError();
		}
		return response.json();
	}).then((json, error) => {
		// todo: error?
		if (fetchObject !== globalFetchObject) return;
		disableProgressBar();
		console.log(json);
		if (Object.keys(json).length === 0) {
			indicateError();
		} else {
			disableIndicator();
			// todo: display data
		}
	});
}

inputBar.addEventListener("input", (e) => {
	globalFetchObject = null;
	const input = e.target.value;
	if (input === "") {
		disableIndicator();
		disableProgressBar();
		return;
	}
	const youtubeID = getYoutubeIDFromString(input);
	if (youtubeID) {
		disableIndicator();
		enableProgressBar();
		fetchVideoJSON(input);
	} else {
		indicateWarning();
		disableProgressBar();
	}
});

const playbackSpeed = 0.7;
document.querySelector("#background-video").defaultPlaybackRate = playbackSpeed;
document.querySelector("#background-video").playbackRate = playbackSpeed;
