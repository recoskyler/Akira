function openTab(filename) {
    var myID = chrome.i18n.getMessage("@@extension_id");

    chrome.windows.getCurrent(function(win) { 
        chrome.tabs.query(
            {'windowId': win.id}, 
            function(tabArray) {
                for(var i in tabArray) {
                    if(tabArray[i].url == "chrome-extension://" + myID + "/" + filename) { 
                        console.warn("Already opened");
                        chrome.tabs.update(tabArray[i].id, {active: true});

                        return; 
                    }
                }

                chrome.tabs.create({url:chrome.runtime.getURL(filename), selected: true});
            }
        );
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    openTab("popup.html");
});