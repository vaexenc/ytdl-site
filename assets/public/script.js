"use strict";

const inputBar = document.getElementById("input-bar");
const progressBar = document.getElementById("progress-bar");
const failIndicator = document.getElementById("fail-indicator");

function getYoutubeIDFromString(input) {
	const pattern1 = /(?:vi?=|\/embed\/|youtu.be\/|\/vi?\/)(?<id>[a-zA-Z0-9-_]{11})/;
	const pattern2 = /^(?<id>[a-zA-Z0-9-_]{11})$/;
	const match = input.match(pattern1) || input.match(pattern2);
	if (match) return match.groups.id;
}

function getVideoJSON(youtubeID) {
	// fetch("/query?q=" + youtubeID).then();
}

function indicateWarning() {
	failIndicator.className = "fail-indicator-warning";
}

function indicateError() {
	failIndicator.className = "fail-indicator-error";
}

function disableIndicator() {
	failIndicator.className = "";
}

function enableProgressBar() {
	progressBar.className = "progress-bar-enabled";
}

function disableProgressBar() {
	progressBar.className = "";
}

inputBar.addEventListener("input", (e) => {
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
		// getVideoJSON(input);
	} else {
		indicateWarning();
		disableProgressBar();
	}
});

const playbackSpeed = 0.7;
document.querySelector("#background-video").defaultPlaybackRate = playbackSpeed;
document.querySelector("#background-video").playbackRate = playbackSpeed;
