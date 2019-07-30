function setup() {
	noCanvas();


	function sendMessage1(event) {
		console.log(event);
		var msg = {
			text1: 'package01',
		}
		var params = {
			active: true,
			currentWindow: true
		}
		chrome.tabs.query(params, gotTabs);
		function gotTabs(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, msg);
		}
	}

	function sendMessage() {

		var msg = {
			text1: 'package02',
		}
		var params = {
			active: true,
			currentWindow: true
		}
		chrome.tabs.query(params, gotTabs);
		function gotTabs(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, msg);
		}
	}

	document.getElementById("change01").addEventListener("click", sendMessage1);
	document.getElementById("change02").addEventListener("click", sendMessage);
}
function setDOMInfo(info) {
	document.getElementById('total').textContent = info.total;
	console.log('total', info.total);
};

window.addEventListener('DOMContentLoaded', () => {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, tabs => {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{ from: 'popup' },
			setDOMInfo);
	});
});