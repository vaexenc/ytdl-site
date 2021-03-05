"use strict";

const INPUT_COOLDOWN_DURATION = 500;

const inputBar = document.querySelector(".input__bar");
const progressBar = document.querySelector(".input__progress-bar");
const inputContainer = document.querySelector(".input");
const inputFailSymbol = document.querySelector(".input__fail__symbol");
const content = document.querySelector(".content");
const backgroundVideo = document.querySelector(".background__video");
const directLinks = document.querySelector(".direct-links");
const videoLinks = document.querySelector(".video-links");
const audioLinks = document.querySelector(".audio-links");
let globalPendingFetchObject;
let globalInputCooldownTimeoutID;

function getYoutubeIDFromString(input) {
	const pattern1 = /(?:(?:vi?=)|(?:\/embed\/)|(?:youtu.be\/)|(?:\/vi?\/))(?<id>[a-zA-Z0-9-_]{11})(?:[^a-zA-Z0-9-_]|$)/;
	const pattern2 = /^(?<id>[a-zA-Z0-9-_]{11})$/;
	const match = input.match(pattern1) || input.match(pattern2);
	if (match) return match.groups.id;
}

function disableIndicator() {
	inputFailSymbol.classList.remove("input__fail__symbol--warning", "input__fail__symbol--error");
	inputFailSymbol.title = "";
	inputBar.classList.remove("input__bar--has-indicator");
	inputContainer.classList.remove("input--shake");
}

function indicateWarning() {
	disableIndicator();
	inputFailSymbol.classList.add("input__fail__symbol--warning");
	inputFailSymbol.title = "Invalid input";
	inputBar.classList.add("input__bar--has-indicator");
	inputContainer.classList.add("input--shake");
}

function indicateError() {
	disableIndicator();
	inputFailSymbol.classList.add("input__fail__symbol--error");
	inputFailSymbol.title = "Error";
	inputBar.classList.add("input__bar--has-indicator");
	inputContainer.classList.add("input--shake");
}

function enableProgressBar() {
	progressBar.classList.add("input__progress-bar--enabled");
}

function disableProgressBar() {
	progressBar.classList.remove("input__progress-bar--enabled");
}

function updateContent(json) {
	// text
	content.classList.add("content--visible");
	const infoSelectorsAndValues = [
		[".video-title", json.title],
		[".info__data__text-uploader", json.uploader],
		[".info__data__text-views", json.view_count.toLocaleString()],
		[".info__data__text-upload-date", json.upload_date.match(/(\d{4})(\d{2})(\d{2})/).slice(1).join("-")],
		[".info__data__text-likes", json.like_count.toLocaleString()],
		[".info__data__text-dislikes", json.dislike_count.toLocaleString()]
	];
	for (const classNameAndValue of infoSelectorsAndValues) {
		const className = classNameAndValue[0];
		const value = classNameAndValue[1];
		document.querySelector(className).innerHTML = value;
		document.querySelector(className).title = value;
	}

	// thumbnails
	const thumbnailSelectorsAndValues = [
		[".info__thumbnail-grid__thumbnail-main", "https://img.youtube.com/vi/" + json.id + "/mqdefault.jpg"],
		[".info__thumbnail-grid__thumbnail-1", "https://img.youtube.com/vi/" + json.id + "/1.jpg"],
		[".info__thumbnail-grid__thumbnail-2", "https://img.youtube.com/vi/" + json.id + "/2.jpg"],
		[".info__thumbnail-grid__thumbnail-3", "https://img.youtube.com/vi/" + json.id + "/3.jpg"]
	];
	for (const classNameAndValue of thumbnailSelectorsAndValues) {
		const className = classNameAndValue[0];
		const value = classNameAndValue[1];
		document.querySelector(className).src = "";
		document.querySelector(className).src = value;
	}

	// likes & dislikes bar
	document.querySelector(".info__data__likes-dislikes-bar__likes").style.width = json.like_count / (json.like_count + json.dislike_count) * 100 + "%";

	// direct download links
	directLinks.innerHTML = "";
	videoLinks.innerHTML = "";
	audioLinks.innerHTML = "";
	const formats = [...json.formats].reverse();
	for (const format of formats) {
		let insertionTarget;
		let text;
		if (format.vcodec !== "none" && format.acodec !== "none") {
			insertionTarget = directLinks;
			text = format.format_note.match(/(\d+p?)/)[0] + " " + format.fps + "fps " + format.ext;
		}
		else if (format.vcodec !== "none") {
			insertionTarget = videoLinks;
			text = format.format_note.match(/(\d+p?)/)[0] + " " + format.fps + "fps " + format.ext;
		}
		else if (format.acodec !== "none") {
			insertionTarget = audioLinks;
			text = parseInt(format.abr) + "abr " + format.ext;
		} else {
			continue;
		}
		text += ` ${(format.filesize / 1024 / 1024).toFixed(2)}MB`;
		const downloadButton = document.createElement("div");
		downloadButton.classList.add("download-format");
		downloadButton.innerHTML = text;
		const elementToInsert = document.createElement("a");
		elementToInsert.href = format.url;
		elementToInsert.appendChild(downloadButton);
		insertionTarget.appendChild(elementToInsert);
	}
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
backgroundVideo.defaultPlaybackRate = playbackSpeed;
backgroundVideo.playbackRate = playbackSpeed;
