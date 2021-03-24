var bookmarksFolderName = "Akira Bookmarks";

function openTab(tabURL) {
    chrome.windows.getAll({populate:true}, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                if (tab.url === tabURL) {
                    chrome.tabs.update(tab.id, {active: true});
                    chrome.tabs.get(tab.id, (t) => {
                        chrome.windows.update(t.windowId, {focused: true});
                    });

                    return;
                }
            });
        });

        chrome.tabs.create({url: tabURL, active: true});
    });
}

function bookmarkTab() {
    chrome.tabs.query({active: true, currentWindow: true}, (t) => {
        chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
            if (res.length > 0) {
                bookmarkTabF(t[0], res[0].id);
            } else {
                chrome.bookmarks.create({title: bookmarksFolderName}, (node) => {
                    bookmarkTabF(t[0], node.id);
                })
            }
        });
    });
}

function bookmarkTabF(tab, pid) {
    chrome.bookmarks.search({url: tab.url}, (res) => {
        if (res.length > 0) {
            var found = false;

            res.forEach((b) => {
                if (b.parentId === pid) {
                    found = true;

                    chrome.bookmarks.remove(b.id, () => {
                        document.getElementById("bookmarked").innerHTML = "Bookmark";
                        document.getElementById("bookmarked").id = "bookmark";

                        return;
                    });

                    return;
                }
            });

            if (!found) {
                chrome.bookmarks.create({title: tab.title, url: tab.url, parentId: pid}, () => {
                    document.getElementById("bookmark").innerHTML = "Remove Bookmark";
                    document.getElementById("bookmark").id = "bookmarked";
                });
            }
        } else {
            chrome.bookmarks.create({title: tab.title, url: tab.url, parentId: pid}, () => {
                document.getElementById("bookmark").innerHTML = "Remove Bookmark";
                document.getElementById("bookmark").id = "bookmarked";
            });
        }
    });
}

function bookmarksScreen() {
    chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
        if (res.length > 0) {
            openTab("chrome://bookmarks/?id=" + res[0].id);
        } else {
            chrome.bookmarks.create({title: bookmarksFolderName}, (node) => {
                openTab("chrome://bookmarks/?id=" + node.id);
            });
        }
    });
}

window.onload = function() {
    var myID = chrome.i18n.getMessage("@@extension_id");
    var el = document.getElementById("manage");

    if (el){
        el.addEventListener('click', function() {
            openTab("chrome-extension://" + myID + "/options.html");
        });
    }

    el = document.getElementById("bookmarks");

    if (el){
        el.addEventListener('click', this.bookmarksScreen);
    }

    el = document.getElementById("bookmark");

    if (el){
        el.addEventListener('click', this.bookmarkTab);
    }

    try {
        chrome.tabs.query({active: true, currentWindow: true}, (tab) => {
            if (tab.length > 0) {
                if (tab[0].url.includes("chrome://") || tab[0].url.includes("chrome-extension://")) {
                    document.getElementById("bookmark").style.display = "none";
                }
    
                chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
                    if (res.length > 0) {
                        chrome.bookmarks.search({url: tab[0].url}, (bmres) => {
                            bmres.forEach((bm) => {
                                if (bm.parentId === res[0].id) {
                                    document.getElementById("bookmark").innerHTML = "Remove Bookmark";
                                    document.getElementById("bookmark").id = "bookmarked";
                                }
                            });
                        });
                    }
                });
            }
        });
    } catch (error) {

    }
}