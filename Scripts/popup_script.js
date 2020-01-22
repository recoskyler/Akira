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

function bookmarksScreen() {
    chrome.bookmarks.search({title: "Akira Bookmarks"}, (res) => {
        if (res.length > 0) {
            chrome.tabs.create({url: ("chrome://bookmarks/?id=" + res[0].id)}, function() {});
        } else {
            chrome.bookmarks.create({title: "Akira Bookmarks"}, (node) => {
                chrome.tabs.create({url: ("chrome://bookmarks/?id=" + node.id)}, function() {});
            })
        }
    });
}

window.onload = function() {
    var el = document.getElementById("manage");

    if (el){
        el.addEventListener('click', function() {
            openTab("options.html");
        });
    }

    var el = document.getElementById("bookmarks");

    if (el){
        el.addEventListener('click', this.bookmarksScreen);
    }
}