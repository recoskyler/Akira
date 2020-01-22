var bookmarksFolderName = "Akira Bookmarks";

function getBookmarkFolderID() {
    var bid;

    try {
        chrome.storage.sync.get(['key'], function(result) {
            if (result.key == undefined) {
                chrome.bookmarks.create({title: bookmarksFolderName}, function(node) {
                    chrome.storage.sync.set({key: node.id}, function() {});

                    bid = node.id;
                });
            }

            bid = result.key;
        });
    } catch (error) {
        console.error("ERROR : Failed to check if bookmark folder id is stored");
    }

    // Check if Akira Bookmarks folder exists

    try {
        chrome.bookmarks.search({title: bookmarksFolderName}, function(res) {
            if (res.length === 0) {
                if (res.id == null) {
                    chrome.bookmarks.create({title: bookmarksFolderName}, function(node) {
                        chrome.storage.sync.set({key: node.id}, function() {});
    
                        bid = node.id;
                        console.log(bid);
                        return bid;
                    });
                }
            }
        });
    } catch (error) {
        console.error("ERROR : Failed to check if bookmark folder exists");
    }
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.tabs.getCurrent(function(tab) {
        chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
            if (res.length > 0) {
                //chrome.tabs.update(tab.id, {url: ("chrome://bookmarks/?id=" + res[0].id)}, function() {});
            } else {
                chrome.bookmarks.create({title: bookmarksFolderName}, (node) => {})
            }
        });
    });   
});