"use strict";

const INPUT_COOLDOWN_DURATION = 500;

const inputBar = document.getElementById("input-bar");
const progressBar = document.getElementById("progress-bar");
const failIndicator = document.getElementById("fail-indicator");
const contentContainer = document.getElementById("content-container");
let globalPendingFetchObject;
let globalInputCooldownTimeoutID;

function getYoutubeIDFromString(input) {
	const pattern1 = /(?:(?:vi?=)|(?:\/embed\/)|(?:youtu.be\/)|(?:\/vi?\/))(?<id>[a-zA-Z0-9-_]{11})(?:[^a-zA-Z0-9-_]|$)/;
	const pattern2 = /^(?<id>[a-zA-Z0-9-_]{11})$/;
	const match = input.match(pattern1) || input.match(pattern2);
	if (match) return match.groups.id;
}

function disableIndicator() {
	failIndicator.classList.remove("fail-indicator-warning", "fail-indicator-error", "fail-shake");
	failIndicator.title = "";
	inputBar.classList.remove("input-has-indicator", "input-warning", "input-error", "fail-shake");
}

function indicateWarning() {
	disableIndicator();
	failIndicator.classList.add("fail-indicator-warning", "fail-shake");
	failIndicator.title = "Invalid input";
	inputBar.classList.add("input-has-indicator", "input-warning", "fail-shake");
}

function indicateError() {
	disableIndicator();
	failIndicator.classList.add("fail-indicator-error", "fail-shake");
	failIndicator.title = "Error";
	inputBar.classList.add("input-has-indicator", "input-error", "fail-shake");
}

function enableProgressBar() {
	progressBar.classList.add("progress-bar-enabled");
}

function disableProgressBar() {
	progressBar.classList.remove("progress-bar-enabled");
}

function updateContent(json) {
	contentContainer.classList.add("content-container-visible");
	const videoInfoSelectorIDsAndValues = [
		["video-title", json.title],
		["video-uploader", json.uploader],
		["video-views", json.view_count.toLocaleString()],
		["video-upload-date", json.upload_date.match(/(\d{4})(\d{2})(\d{2})/).slice(1).join("-")],
		["video-likes", json.like_count.toLocaleString()],
		["video-dislikes", json.dislike_count.toLocaleString()]
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
		document.getElementById(idAndValue[0]).src = "";
		document.getElementById(idAndValue[0]).src = idAndValue[1];
	}
	document.getElementById("video-likes-dislikes-bar-likes").style.width = json.like_count / (json.like_count + json.dislike_count) * 100 + "%";
}

function fetchVideoJSONAndUpdatePage(youtubeID) {
	globalPendingFetchObject = fetch("/query?q=" + youtubeID);
	const fetchObject = globalPendingFetchObject;
	fetchObject
	.then((response) => {
		if (fetchObject !== globalPendingFetchObject) return;
		return response.json();
	})
	.then((json) => {
		if (fetchObject !== globalPendingFetchObject) return;
		if (Object.keys(json).length === 0 || !json) throw "";
		disableProgressBar();
		disableIndicator();
		updateContent(json);
		globalPendingFetchObject = null;
	})
	.catch(() => {
		if (fetchObject !== globalPendingFetchObject) return;
		disableProgressBar();
		indicateError();
		globalPendingFetchObject = null;
	});
}

function _putInputBarOnCooldownAndTriggerAfter(callback) {
	clearTimeout(globalInputCooldownTimeoutID);
	globalInputCooldownTimeoutID = setTimeout(() => {
		globalInputCooldownTimeoutID = null;
		if (callback) callback();
	}, INPUT_COOLDOWN_DURATION);
}

function putInputBarOnCooldown() {
	_putInputBarOnCooldownAndTriggerAfter();
}

function putInputBarOnCooldownAndTriggerAfter(isTriggeredWithoutManualDispatch) {
	if (isTriggeredWithoutManualDispatch) {
		_putInputBarOnCooldownAndTriggerAfter(() => {inputBar.dispatchEvent(new Event("input"));});
	} else {
		_putInputBarOnCooldownAndTriggerAfter();
	}
}

inputBar.addEventListener("input", (e) => {
	const input = e.target.value;
	if (input === "") {
		disableIndicator();
		disableProgressBar();
		globalPendingFetchObject = null;
		return;
	}
	const youtubeID = getYoutubeIDFromString(input);
	if (!youtubeID) {
		indicateWarning();
		disableProgressBar();
		globalPendingFetchObject = null;
		return;
	}
	if (globalInputCooldownTimeoutID) {
		putInputBarOnCooldownAndTriggerAfter(e.isTrusted);
		return;
	}
	globalPendingFetchObject = null;
	disableIndicator();
	enableProgressBar();
	fetchVideoJSONAndUpdatePage(youtubeID);
	putInputBarOnCooldown();
});

const playbackSpeed = 0.7;
document.querySelector("#background-video").defaultPlaybackRate = playbackSpeed;
document.querySelector("#background-video").playbackRate = playbackSpeed;
