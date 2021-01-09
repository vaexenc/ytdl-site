"use strict";

const inputBar = document.getElementById("input-bar");
const progressBar = document.getElementById("progress-bar");
const failIndicator = document.getElementById("fail-indicator");
const contentContainer = document.getElementById("content-container");
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
	inputBar.className = "has-indicator";
}

function indicateError() {
	failIndicator.className = "fail-indicator-error";
	failIndicator.title = "Error";
	inputBar.className = "has-indicator";
}

function disableIndicator() {
	failIndicator.className = "";
	failIndicator.title = "";
	inputBar.className = "";
}

function enableProgressBar() {
	progressBar.className = "progress-bar-enabled";
}

function disableProgressBar() {
	progressBar.className = "";
}

function updateContent(json) {
	contentContainer.style.transform = "scaleY(100%)";
	const videoInfoSelectorIDsAndValues = [
		["video-title", json.title],
		["video-uploader", json.uploader],
		["video-views", json.view_count.toLocaleString()],
		["video-upload-date", json.upload_date.match(/(\d{4})(\d{2})(\d{2})/).slice(1).join("-")]
	];
	for (const idAndValue of videoInfoSelectorIDsAndValues) {
		document.getElementById(idAndValue[0]).innerHTML = idAndValue[1];
	}
	const videoThumbnailSelectorIDs = [
		["video-thumbnail-main", "https://img.youtube.com/vi/" + json.id + "/mqdefault.jpg"],
		["video-thumbnail-1", "https://img.youtube.com/vi/" + json.id + "/1.jpg"],
		["video-thumbnail-2", "https://img.youtube.com/vi/" + json.id + "/2.jpg"],
		["video-thumbnail-3", "https://img.youtube.com/vi/" + json.id + "/3.jpg"]
	];
	for (const idAndValue of videoThumbnailSelectorIDs) {
		document.getElementById(idAndValue[0]).src = idAndValue[1];
	}
	document.getElementById("video-likes-dislikes-bar-likes").style.width = json.like_count / (json.like_count + json.dislike_count) * 100 + "%";
}

function fetchVideoJSONAndUpdatePage(youtubeID) {
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
		if (Object.keys(json).length === 0) {
			indicateError();
		} else {
			disableIndicator();
			updateContent(json);
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
		fetchVideoJSONAndUpdatePage(input);
	} else {
		indicateWarning();
		disableProgressBar();
	}
});

const playbackSpeed = 0.7;
document.querySelector("#background-video").defaultPlaybackRate = playbackSpeed;
document.querySelector("#background-video").playbackRate = playbackSpeed;
