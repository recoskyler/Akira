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

/*
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'developer.chrome.com'},
            })
            ],
                actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});
*/