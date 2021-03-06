

/**
 * Facilitates the overall control flow of the extension
 */
class NewtabNuevo {
	constructor() {
		this.StorageObjects = null;
	}

	// Get a setting from localstorage
	// Setting name, default value if not found
	getSetting(name, defVal) {
		if(typeof this.StorageObjects.get(name) !== "undefined"){
			return this.StorageObjects.get(name);
		}
		else {
			if(typeof defVal === "undefined") return "";
			else return defVal;
		}
	}
	// Save a setting to localstorage
	// Setting name, value for setting could be an array, object, etc.
	setSetting(name, val) {
		this.StorageObjects.set(name,val);
		var setting = {};
		setting[name] = val;
		chrome.storage.local.set(setting);
	}

	// What to do when the extension starts
	startup() {
		var firstRun = this.getSetting("FirstRun",true);
		if(firstRun){
				this.setSetting("FirstRun", false);
				this.openTab(chrome.extension.getURL("newtab/blank.html#newTab"));
		}

	}
	// Retrieve all settings from localstorage and map them to session StorageObjects
	loadSettings() {
		chrome.storage.local.get(function(storedItems) {
			console.log(storedItems);
			window.NTInstance.StorageObjects=new Map();
			for(var key in storedItems) {
				window.NTInstance.StorageObjects.set(key,storedItems[key]);
			}
		});
	}

	// Open a new tab
	openTab(tabURL) {
		chrome.tabs.create({url: tabURL});
	}

}
var NTInstance = new NewtabNuevo();
window.NTInstance=NTInstance;
NTInstance.loadSettings();
chrome.runtime.onStartup.addListener(function(){
	var intervalId=setInterval(function(){

		if (window.NTInstance.StorageObjects !== null)
		{
			clearInterval(intervalId);
			NTInstance.startup();
		}
	},500);
});
chrome.runtime.onInstalled.addListener(function(){
    chrome.tabs.create({url: chrome.extension.getURL("newtab/blank.html")});
});
chrome.tabs.onCreated.addListener(function created(tab){
	if (tab.url=="chrome://newtab/") {
		chrome.tabs.update(tab.id, {url: chrome.extension.getURL("newtab/blank.html")});
	}
});

// Messaging Event Listeners
chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
	var res = {};
  switch(req.task) {
		case "checkFirstRun":
      var firstRun = NTInstance.getSetting("FirstRun",true);
			res.firstRun = firstRun;
      if(firstRun){
				sendResponse(res);
        NTInstance.setSetting("FirstRun", false);
      }
			sendResponse(res);
		break;

		default:
			console.log("default");
			break;

	}});

// Open a new tab when you click on extension icon
chrome.browserAction.onClicked.addListener(function ()
{
	NTInstance.openTab(chrome.extension.getURL("newtab/blank.html"));
});
