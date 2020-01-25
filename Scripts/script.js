// AKIRA
//
// By Recoskyler - Adil Atalay Hamamcıoğlu
// 2020

/*

HTML Element ID Formats:
====================================
[LETTER CODE][ID]
____________________________________
TABS
------------------------------------
l123 : <li>   List item of tab
c123 : <img>  "Close Tab" button
b123 : <img>  "Bookmark Tab" button
v123 : <img>  "View Tab" button
f123 : <img>  Favicon of tab
t123 : <span> Title of tab
____________________________________
WINDOWS
------------------------------------
g123 : <ul>   Window group
w123 : <div>  Window group block
n123 : <span> Window group title

*/

var manifestData = chrome.runtime.getManifest();
var bookmarksFolderName = "Akira Bookmarks";
var shiftDown = false, ctrlDown = false, mouseHold = false, mousePress = false;
var lastSelectedItemID = -1;
var div, x1 = 0, y1 = 0, x2 = 0, y2 = 0;
var threshold = 185;
var timer = setTimeout(() => {}, 1);
var selectedTabs = [];
var allTabs = [];
var windowColors = ["#3F51B5", "#F44336", "#4CAF12", "#03A9F4", "#FFC107"];
var updateTabF = emptyFunction;

// NAV SCREENS

function aboutScreen() {
    document.getElementById('main').innerHTML = `
        <img src="./images/icon_512.png" id="logo" alt="AKIRA"/>

        <h1>AKIRA</h1>

        <br/>
        
        <p>Akira is a Chrome extension for sorting -> viewing -> bookmarking/closing
         a bunch of tabs that are open on multiple windows.</p>
        
        <p>Made by Recoskyler (Adil Atalay Hamamcıoğlu)</p>
        
        <br/>
        
        <p>Version: ${manifestData.version}</p>
        
        <br/>
        
        <p><img id='git' src='../images/github.png' alt='GITHUB'></p>
    `;

    resetNavClassNames();
    document.getElementById("aboutScreen").className += " selectedNav";
}

function openTabsScreen() {
    chrome.windows.getAll({populate:true}, function(windows) {
        var tabList = document.createElement("ul");
        var myNode = document.getElementById("main");

        tabList.id = "allTabsList";

        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        myNode.appendChild(tabList);

        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
                addTabToList(tab);
            });
        });

        checkEmptyMain(`<h2 id="emptyPage">NO OPEN TABS</h2>`);

        resetNavClassNames();
        document.getElementById("openTabsScreen").className += " selectedNav";
    });
}

function bookmarksScreen() {
    chrome.tabs.getCurrent(function(tab) {
        chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
            if (res.length > 0) {
                chrome.tabs.update(tab.id, {url: ("chrome://bookmarks/?id=" + res[0].id)}, function() {});
            } else {
                chrome.bookmarks.create({title: bookmarksFolderName}, (node) => {
                    chrome.tabs.update(tab.id, {url: ("chrome://bookmarks/?id=" + node.id)}, function() {});
                })
            }
        });
    });
}

function recentlyClosedScreen() {
    checkEmptyMain(`
        <h2 id="emptyPage">NO RECENTLY CLOSED TABS</h2>
    `);

    resetNavClassNames();
    document.getElementById("recentlyClosedScreen").className += " selectedNav";
}

// MINI ACTIONS

function viewTab(tabID) {
    chrome.tabs.update(tabID, {active: true});
    chrome.tabs.get(tabID, (tab) => {
        chrome.windows.update(tab.windowId, {focused: true});
    });
}

function closeTab(tabID) {
    chrome.tabs.remove(tabID, () => {
        var elem = document.getElementById("l" + tabID);
        elem.parentNode.removeChild(elem);
    });
}

function bookmarkTab(tabID) {
    chrome.tabs.get(tabID, (t) => {
        chrome.bookmarks.search({title: bookmarksFolderName}, (res) => {
            if (res.length > 0) {
                bookmarkTabF(t, res[0].id);
            } else {
                chrome.bookmarks.create({title: bookmarksFolderName}, (node) => {
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

// TAB ACTIONS

function deselectAllTabItems() {
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (se[i].classList.contains("selected")) {
            se[i].classList.remove("selected");
        }
    }
}

function selectAllTabItems() {
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (!se[i].classList.contains("selected")) {
            se[i].classList.add("selected");
        }
    }
}

function closeSelectedTabs() { // TODO Close selected
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (!se[i].classList.contains("selected")) {
            se[i].classList.add("selected");
        }
    }
}

function bookmarkSelectedTabs() { // TODO Bookmark selected
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (!se[i].classList.contains("selected")) {
            se[i].classList.add("selected");
        }
    }
}

// DYNAMIC LIST

function addTabToList(tab) {
    chrome.windows.getAll({populate:true}, function(windows) {
        if (tab.status === "complete") {
            var listItem = document.createElement("li");
            var bookmark = "../images/bookmark.png";
            var window = windows[windows.map(e => e.id).indexOf(tab.windowId)];

            chrome.bookmarks.search({ url: tab.url}, (res) => {
                if (tab.url.includes("chrome-extension://") || tab.url.includes("chrome://")) {
                    return;
                }

                chrome.bookmarks.search({title: bookmarksFolderName}, (ab) => {
                    res.forEach((b) => {
                        if (b.parentId === ab[0].id) {
                            bookmark = "../images/bookmarked.png";
                        }
                    });

                    // Get Color and id
                    var itemID = window.tabs.map(e => e.id).indexOf(tab.id);
                    var wColor = windowColors[windows.map(e => e.id).indexOf(tab.windowId) % windowColors.length];

                    for (i = windows.map(e => e.id).indexOf(tab.windowId) - 1; i >= 0; i--) {
                        itemID += windows[i].tabs.length - 1;                        
                    }

                    listItem.classList.add("tabItem");
                    listItem.classList.add(itemID);
                    listItem.id = "l" + tab.id;
                    listItem.style.borderLeftColor = wColor;

                    listItem.innerHTML = `
                        <table class="tabItemTable">
                            <tr>
                                <td><img id="f${tab.id}" class="favIcon" src=${tab.favIconUrl} alt="ICO"></td>
                                <td><span id="t${tab.id}" class="tabTitle">${tab.title}</span></td>
                                <td rowspan='2' class="miniActions">
                                    <img id="c${tab.id}" class="miniAction" src="../images/close.png" alt="CLOSE TAB">
                                    <img id="v${tab.id}" class="miniAction" src="../images/view.png" alt="VIEW TAB">
                                    <img id="b${tab.id}" class="miniAction" src="${bookmark}" alt="BOOKMARK TAB">
                                </td>
                            </tr>
                        </table>
                    `;

                    var allTabsList = document.getElementById("allTabsList");

                    if (allTabsList) {
                        allTabsList.appendChild(listItem);
                    }

                    allTabs.push(tab);

                    updateTabF = updateTab;
                });
            });
        }
    });
}

function updateTab(tab) {
    if (tab.status !== "complete") {
        return;
    }

    if (tab.url.includes("chrome-extension://") || tab.url.includes("chrome://")) {
        return;
    }

    if (!document.getElementById("l" + tab.id)) {
        addTabToList(tab);
    }

    chrome.windows.getAll({populate:true}, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(item) {
                if (item.id === tab.id) {
                    var tabTitle = document.getElementById("t" + tab.id);
                    var tabIcon = document.getElementById("f" + tab.id);
                    var tabItem = document.getElementById("l" + tab.id);
                    var itemID = window.tabs.map(e => e.id).indexOf(tab.id);
                    var wColor = windowColors[windows.map(e => e.id).indexOf(tab.windowId) % windowColors.length];

                    for (i = windows.map(e => e.id).indexOf(tab.windowId) - 1; i >= 0; i--) {
                        itemID += windows[i].tabs.length - 1;
                    }

                    if (tabItem) {
                        tabTitle.innerHTML = tab.title;
                        tabIcon.src = tab.favIconUrl;
                        tabItem.style.borderLeftColor = wColor;

                        if (itemID !== tabItem.classList[1]) {
                            openTabsScreen();
                        }

                        allTabs[allTabs.map(e => e.id).indexOf(tab.id)] = tab;
                    }

                    return;
                }
            });
        });
    });
}

// OTHER

function checkEmptyMain(blankPage) {
    var mainElem = document.getElementById("main");

    if (mainElem.childElementCount === 0) {
        mainElem.innerHTML = blankPage;
    }
}

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

function openGit() {
    chrome.tabs.create({url: "https://github.com/recoskyler/Akira", active: true});
}

function checkForSelected() {
    if (selectedTabs.length >= 2) {
        document.getElementById("footer").style.display = "block";
    } else {
        document.getElementById("footer").style.display = "none";
    }

    document.getElementById("selectedCount").innerHTML = `${selectedTabs.length} Selected`;
}

function emptyFunction(a = 1, b = 2, c = 3, d = 4) {}

// SELECTION AND MOUSE CLICK/DRAG/ETC...

function reCalc() { //This will restyle the div
    var x3 = Math.min(x1,x2); //Smaller X
    var x4 = Math.max(x1,x2); //Larger X
    var y3 = Math.min(y1,y2); //Smaller Y
    var y4 = Math.max(y1,y2); //Larger Y
    div.style.left = x3 + 'px';
    div.style.top = y3 + 'px';
    div.style.width = x4 - x3 + 'px';
    div.style.height = y4 - y3 + 'px';
}

function checkIntersections() { // TODO Add functionality to "Bookmark Selected" and "Close Selected" buttons
    // NAV CLICK

    var els = ["openTabsScreen", "recentlyClosedScreen", "bookmarksScreen", "aboutScreen"];
    var fus = [this.openTabsScreen, this.recentlyClosedScreen, this.bookmarksScreen, this.aboutScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);
        var rect1 = el.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown) {
            document.getElementById("main").innerHTML = "";
            fus[i]();
        }
    }

    // MINI ACTIONS

    var miniActions = document.getElementsByClassName("miniAction");

    for (i = 0; i < miniActions.length; i++) {
        var item = miniActions[i];
        var rect1 = item.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown) {
            mouseHold = false;
            mousePress = false;
            div.hidden = 1;

            switch (item.id.charAt(0)) {
                case 'b':
                    bookmarkTab(parseInt(item.id.substring(1)));
                    break;
                case 'v':
                    viewTab(parseInt(item.id.substring(1)));
                    break;
                case 'c':
                    closeTab(parseInt(item.id.substring(1)));
                    break;
                default:
                    break;
            }
        }
    }

    // OTHER BUTTONS

    var otherButtonIDs = ["git"];
    var otherButtonFNs = [openGit];

    for (i = 0; i < otherButtonIDs.length; i++) {
        if (!document.getElementById(otherButtonIDs[i])) {
            continue;
        }

        var item = document.getElementById(otherButtonIDs[i]);
        var rect1 = item.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && !shiftDown && !ctrlDown) {
            otherButtonFNs[i]();
        }
    }

    // TABS SELECT/CLICK

    if ((mousePress && !mouseHold && !ctrlDown) || (mouseHold && !ctrlDown)) {
        deselectAllTabItems();
    }

    var tabItems = document.getElementsByClassName("tabItem");

    for (i = 0; i < tabItems.length; i++) {
        var item = tabItems[i];
        var rect1 = item.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && mouseHold && !shiftDown) {
            if (!item.classList.contains("selected")) {
                item.classList.add("selected");
            }
        } else if (overlap && mousePress && !mouseHold) {
            item.classList.toggle("selected");

            if (lastSelectedItemID != -1 && shiftDown && ctrlDown) {
                if (parseInt(lastSelectedItemID) > parseInt(item.classList[1])) {
                    for (k = parseInt(lastSelectedItemID); k > parseInt(item.classList[1]); k--) {
                        if (document.getElementsByClassName(k).length > 0) {
                            var sei = document.getElementsByClassName(k);
                            
                            if (k == lastSelectedItemID) {
                                continue;
                            }
        
                            sei[0].classList.toggle("selected");
                        }
                    }
                } else if (parseInt(lastSelectedItemID) < parseInt(item.classList[1])) {
                    for (k = parseInt(lastSelectedItemID); k < parseInt(item.classList[1]); k++) {
                        if (document.getElementsByClassName(k).length > 0) {
                            var sei = document.getElementsByClassName(k);
        
                            if (k == lastSelectedItemID) {
                                continue;
                            }
        
                            sei[0].classList.toggle("selected");
                        }
                    }
                }
            }
            
            lastSelectedItemID = item.classList[1];
        }

        if (item.classList.contains("selected") && !selectedTabs.includes(item)) {
            selectedTabs.push(item);
        } else if (selectedTabs.includes(item) && !item.classList.contains("selected")) {
            selectedTabs.splice(selectedTabs.indexOf(item), 1);
        }
    }

    checkForSelected();
}

/////

window.onload = function() {
    div = document.getElementById('selectionRect');

    // CTRL, A, B, C DOWN
    this.document.addEventListener("keydown", (event) => {
        if (event.key === "Control") {
            this.ctrlDown = true;
        }

        if (event.key === "a" && this.ctrlDown && !this.shiftDown) {
            this.selectAllTabItems();
        } else if (event.key === "a" && this.ctrlDown && this.shiftDown) {

        } else if (event.key === "b" && this.ctrlDown && !this.shiftDown) {
            this.bookmarkSelectedTabs();
        } else if (event.key === "c" && this.ctrlDown && !this.shiftDown) {
            this.closeSelectedTabs();
        }
    });

    // CTRL UP
    this.document.addEventListener("keyup", (event) => {
        if (event.key === "Control") {
            this.ctrlDown = false;
        }
    });

    // SHIFT DOWN
    this.document.addEventListener("keydown", (event) => {
        if (event.key === "Shift") {
            this.shiftDown = true;
        }
    });

    // SHIFT UP
    this.document.addEventListener("keyup", (event) => {
        if (event.key === "Shift") {
            this.shiftDown = false;
        }
    });

    // MOUSE DOWN
    this.document.addEventListener("mousedown", (event) => {
        this.timer = this.setTimeout(() => {
            this.mouseHold = true;
        }, this.threshold);

        this.mousePress = true;
        this.div.hidden = 0; //Unhide the div
        this.x1 = event.pageX; //Set the initial X
        this.y1 = event.pageY; //Set the initial Y
        this.reCalc();
        this.checkIntersections();
    });

    // MOUSE MOVE
    this.document.addEventListener("mousemove", (event) => {
        this.x2 = event.pageX; //Update the current position X
        this.y2 = event.pageY; //Update the current position Y

        if (this.mousePress) {
            this.reCalc();
        }

        if (this.mouseHold) {
            this.checkIntersections();
        }
    });

    // MOUSE UP
    this.document.addEventListener("mouseup", (event) => {
        clearTimeout(timer);
        this.mouseHold = false;
        this.mousePress = false;
        this.div.hidden = 1; //Hide the div
        this.reCalc();
    });

    openTabsScreen();

    chrome.tabs.onUpdated.addListener((tid, change, tab) => {
        this.updateTabF(tab);
    });
    chrome.tabs.onRemoved.addListener((tid) => {
        var elem = document.getElementById("l" + tid);

        if (elem) {
            elem.parentNode.removeChild(elem);
        }
    });
    chrome.tabs.onDetached.addListener(this.reloadAkira);
    chrome.tabs.onAttached.addListener(this.reloadAkira);
    chrome.windows.onCreated.addListener(this.reloadAkira);
}
