var manifestData = chrome.runtime.getManifest();
var ctrlDown = false;
var shiftDown = false;
var lastsliid = -1;

// NAV SCREENS

function aboutScreen() {
    document.getElementById('main').innerHTML = `
        <img src="./images/icon512.png" id="logo" alt="AKIRA"/>
        
        <p>Akira is a Chrome extension for sorting -> viewing -> bookmarking/closing
         a bunch of tabs that are open on multiple windows.</p>
        
        <p>Made by Recoskyler (Adil Atalay Hamamcıoğlu)</p>
        
        <br/>
        
        <p>Version: ${manifestData.version}</p>
        
        <br/>
        
        <p><a href='https://github.com/recoskyler/Akira' target='_blank'><img id='git' src='../images/github.png' alt='GITHUB'></a></p>
    `;

    resetNavClassNames();
    document.getElementById("aboutScreen").className += " selectedNav";
}

function openTabsScreen() {
    dropEvents("miniAction");
    dropEvents("tabItem");

    var list = document.createElement("ul");
    var liid = 0;
    
    list.id = "allTabsList";

    document.getElementById("main").innerHTML = "";

    chrome.windows.getAll({populate:true}, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                var listItem = document.createElement("li");
                var bookmark = "../images/bookmark.png";

                chrome.bookmarks.search({ url: tab.url}, (res) => {
                    if (tab.url.includes("chrome-extension://") || tab.url.includes("chrome://")) {
                        return;
                    }

                    chrome.bookmarks.search({title: "Akira Bookmarks"}, (ab) => {
                        res.forEach((b) => {
                            if (b.parentId === ab[0].id) {
                                bookmark = "../images/bookmarked.png";
                            }
                        });

                        var btnIDs = [];

                        listItem.classList.add("tabItem");
                        listItem.classList.add(liid);
                        listItem.id = "l" + tab.id;

                        listItem.innerHTML = `
                        <table class="tabItemTable">
                                <tr>
                                    <td><span class="tabTitle">${tab.title}</span></td>
                                    <td rowspan='2' class="miniActions">
                                        <img id="c${tab.id}" class="miniAction" src="../images/close.png" alt="CLOSE TAB">
                                        <img id="v${tab.id}" class="miniAction" src="../images/view.png" alt="VIEW TAB">
                                        <img id="b${tab.id}" class="miniAction" src="${bookmark}" alt="BOOKMARK TAB">
                                    </td>
                                </tr>
                            </table>`;

                        list.appendChild(listItem);

                        btnIDs.push("c" + tab.id);
                        btnIDs.push("b" + tab.id);
                        btnIDs.push("v" + tab.id);

                        document.getElementById("main").innerHTML = "";
                        document.getElementById("main").appendChild(list);

                        // SELECTION

                        document.getElementById("l" + tab.id).addEventListener("click", () => {
                            var li = document.getElementById("l" + tab.id);

                            if (!ctrlDown) {
                                var se = document.getElementsByClassName("tabItem");

                                for (i = 0; i < se.length; i++) {
                                    if (se[i].id !== li.id || (!shiftDown && document.getElementsByClassName("selected").length > 1)) {
                                        se[i].classList.remove("selected");
                                    }
                                }
                            }

                            if (lastsliid != -1 && shiftDown && ctrlDown) {
                                if (lastsliid > li.classList[1]) {
                                    for (k = lastsliid; k > li.classList[1]; k--) {
                                        var sei = document.getElementsByClassName(k);
                                        
                                        if (k == lastsliid) {
                                            continue;
                                        }

                                        sei[0].classList.toggle("selected");
                                    }
                                } else if (lastsliid < li.classList[1]) {
                                    for (k = lastsliid; k < li.classList[1]; k++) {
                                        var sei = document.getElementsByClassName(k);

                                        if (k == lastsliid) {
                                            continue;
                                        }

                                        sei[0].classList.toggle("selected");
                                    }
                                }
                            }
                            
                            li.classList.toggle('selected');

                            lastsliid = li.classList[1];
                        });

                        // MINI ACTIONS

                        btnIDs.forEach((btnID) => {
                            document.getElementById(btnID).addEventListener("click", () => {            
                                switch (btnID.charAt(0)) {
                                    case 'b':
                                        bookmarkTab(parseInt(btnID.substring(1)));
                                        break;
                                    case 'v':
                                        viewTab(parseInt(btnID.substring(1)));
                                        break;
                                    case 'c':
                                        closeTab(parseInt(btnID.substring(1)));
                                        break;
                                    default:
                                        break;
                                }
                            });
                        });

                        liid++;
                    });
                });
            });
        });
    });

    resetNavClassNames();
    document.getElementById("openTabsScreen").className += " selectedNav";
}

function bookmarksScreen() {
    chrome.tabs.getCurrent(function(tab) {
        chrome.bookmarks.search({title: "Akira Bookmarks"}, (res) => {
            if (res.length > 0) {
                chrome.tabs.update(tab.id, {url: ("chrome://bookmarks/?id=" + res[0].id)}, function() {});
            } else {
                chrome.bookmarks.create({title: "Akira Bookmarks"}, (node) => {
                    chrome.tabs.update(tab.id, {url: ("chrome://bookmarks/?id=" + node.id)}, function() {});
                })
            }
        });
    });
}

function recentlyClosedScreen() {
    document.getElementById('main').innerHTML = `
        RECENTLY CLOSED
    `;

    resetNavClassNames();
    document.getElementById("recentlyClosedScreen").className += " selectedNav";
}

// MINI ACTIONS

function viewTab(tabID) {
    chrome.tabs.update(tabID, {active: true});
}

function closeTab(tabID) {
    chrome.tabs.remove(tabID, () => {
        chrome.tabs.getCurrent((t) => {
            chrome.tabs.reload(t.id);
        });
    });
}

function bookmarkTab(tabID) {
    chrome.tabs.get(tabID, (t) => {
        chrome.bookmarks.search({title: "Akira Bookmarks"}, (res) => {
            if (res.length > 0) {
                bookmarkTabF(t, res[0].id);
            } else {
                chrome.bookmarks.create({title: "Akira Bookmarks"}, (node) => {
                    bookmarkTabF(t, node.id);
                })
            }
        });
    });
}

function bookmarkTabF(tab, pid) {
    chrome.bookmarks.search({url: tab.url}, (res) => {
        if (res.length >= 1) {
            res.forEach((b) => {
                chrome.bookmarks.remove(b.id, () => {
                    openTabsScreen();
                });
            });
        } else {
            chrome.bookmarks.create({title: tab.title, url: tab.url, parentId: pid}, () => {
                openTabsScreen();
            });
        }
    });
}

// OTHER

function resetNavClassNames() {
    document.getElementById("aboutScreen").className = "navButton rightMost";
    document.getElementById("bookmarksScreen").className = "navButton leftMost";
    document.getElementById("openTabsScreen").className = "navButton leftMost";
    document.getElementById("recentlyClosedScreen").className = "navButton leftMost";
}

function reloadAkira() {
    chrome.tabs.getCurrent((t) => {
        chrome.tabs.reload(t.id);
    });
}

function dropEvents(c) {
    let drops = document.querySelectorAll(c);

    drops.forEach((drop) => {
        try {
            drop.removeEventListener('click', handlers[drop.id]);
        } catch (error) {
            console.log("Could not remove listener");
        }
    });
}

/////

window.onload = function() {
    var els = ["openTabsScreen", "bookmarksScreen", "recentlyClosedScreen", "aboutScreen"];
    var fus = [this.openTabsScreen, this.bookmarksScreen, this.recentlyClosedScreen, this.aboutScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);

        if (el){
            el.addEventListener('click', fus[i]);
        }
    }

    this.document.addEventListener("keydown", (event) => {
        if (event.key === "Control") {
            this.ctrlDown = true;
        }
    });

    this.document.addEventListener("keyup", (event) => {
        if (event.key === "Control") {
            this.ctrlDown = false;
        }
    });

    this.document.addEventListener("keydown", (event) => {
        if (event.key === "Shift") {
            this.shiftDown = true;
        }
    });

    this.document.addEventListener("keyup", (event) => {
        if (event.key === "Shift") {
            this.shiftDown = false;
        }
    });

    chrome.tabs.onUpdated.addListener(openTabsScreen);
    chrome.tabs.onCreated.addListener(reloadAkira);
    chrome.tabs.onRemoved.addListener(reloadAkira);
    chrome.tabs.onMoved.addListener(reloadAkira);
    chrome.tabs.onReplaced.addListener(reloadAkira);
    chrome.tabs.onDetached.addListener(reloadAkira);
    chrome.tabs.onAttached.addListener(reloadAkira);
    chrome.windows.onCreated.addListener(reloadAkira);

    openTabsScreen();
}