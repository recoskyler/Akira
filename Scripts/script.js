/*
AKIRA

By Recoskyler - Adil Atalay Hamamcıoğlu

MIT License

Copyright (c) 2020 Adil Atalay Hamamcıoğlu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*

HTML Element ID Formats:
====================================
[LETTER CODE][ID/URL]
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
w123 : <ul>   Window group
____________________________________
PAGES
------------------------------------
pURL : <ul>   Page group

*/

var manifestData = chrome.runtime.getManifest();
var bookmarksFolderName = "Akira Bookmarks";
var shiftDown = false, ctrlDown = false, mouseHold = false, mousePress = false;
var lastSelectedItemID = -1;
var div, searchBox, x1 = 0, y1 = 0, x2 = 0, y2 = 0;
var threshold = 185;
var timer = setTimeout(() => {}, 1);
var selectedTabs = [];
var allTabs = [];
var windowColors = ["#3F51B5", "#F44336", "#4CAF12", "#03A9F4", "#FFC107"];
var groupingMode = 0; // 0 - NONE : 1 - BY WINDOW : 2 - BY PAGE : 3 - BY BOTH
var firstTime = true;
var sortByName = false;
var screen = 0;
var recentActions = []; // c - closed, b - bookmarked, r - bookmark removed
var recentlyClosed = [];

// NAV SCREENS

function aboutScreen() {
    checkEmptyMain("");

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
    // REMOVE ALL CHILDREN OF MAIN

    checkEmptyGroup();

    var myNode = document.getElementById("main");

    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    if (document.getElementById("byWindow")) {
        document.getElementById("byWindow").style.display = "inline-block";
    }

    /////

    chrome.windows.getAll({populate:true}, function(windows) {
        var tabs = [];
        var pages = [];
        var windowIDs = [];

        // GET ALL TABS, WINDOWS, AND POPULATE ARRAYS

        windows.forEach(function(window) {
            var normalTabCount = 0;

            window.tabs.forEach(function(tab) {
                if (!tab.url.includes("chrome-extension://") && !tab.url.includes("chrome://")) {
                    var tabUrl = getPageDomain(tab.url);

                    tabs.push(tab);
                    normalTabCount++;

                    if (!pages.includes(window.id + "|" + tabUrl)) {
                        pages.push(window.id + "|" + tabUrl);
                    }
                }
            });

            if (normalTabCount > 0) {
                windowIDs.push(window.id);
            }
        });

        // SORT ALPHABETICALLY

        if (sortByName) {
            tabs.sort(function(a, b) {
                var textA = a.title.toUpperCase();
                var textB = b.title.toUpperCase();
                return (textA < textB) ? -1 : (textA >= textB) ? 1 : 0;
            });

            pages.sort(function(a, b) {
                var textA = a.split("|")[1].toUpperCase();
                var textB = b.split("|")[1].toUpperCase();
                return (textA < textB) ? -1 : (textA >= textB) ? 1 : 0;
            });
        }

        // GROUPING

        if (groupingMode === 1) { // BY WINDOW
            var wCount = 1;

            windowIDs.forEach((wid) => {
                var wCont = document.createElement("div");
                var wTitle = document.createElement("span");
                var wList = document.createElement("ul");

                wCont.className = "groupCont windowCont";
                wList.className = "tabList";
                wTitle.className = "groupTitle";
                wList.id = "w" + wid;
                wTitle.id = "wt" + wid;
                wTitle.innerHTML = `Window  ${wCount}`;

                wCont.appendChild(wTitle);
                wCont.appendChild(wList);
                myNode.appendChild(wCont);

                wCount++;
            });
        } else if (groupingMode === 2) { // BY PAGE
            pages.forEach((purl) => {
                var pCont = document.createElement("div");
                var pTitle = document.createElement("span");
                var pList = document.createElement("ul");

                pCont.className = "groupCont pageCont";
                pList.className = "tabList";
                pTitle.className = "groupTitle";
                pList.id = "p|" + purl;
                pTitle.innerHTML = purl.split("|")[1];

                pCont.appendChild(pTitle);
                pCont.appendChild(pList);
                myNode.appendChild(pCont);
            });
        } else if (groupingMode === 3) { // BY BOTH
            var wCount = 1;

            windowIDs.forEach((wid) => {
                var wCont = document.createElement("div");
                var wTitle = document.createElement("span");

                wCont.className = "groupCont windowCont";
                wTitle.className = "groupTitle";
                wTitle.id = "wt" + wid;
                wTitle.innerHTML = `Window  ${wCount}`;

                wCont.appendChild(wTitle);

                pages.forEach((purl) => {
                    if (purl.split("|")[0] == wid) {
                        var pCont = document.createElement("div");
                        var pTitle = document.createElement("span");
                        var pList = document.createElement("ul");
        
                        pCont.className = "groupCont pageCont";
                        pList.className = "tabList";
                        pTitle.className = "groupTitle";
                        pList.id = "p|" + purl;
                        pTitle.innerHTML = purl.split("|")[1];
        
                        pCont.appendChild(pTitle);
                        pCont.appendChild(pList);
                        wCont.appendChild(pCont);
                    }
                });

                myNode.appendChild(wCont);

                wCount++;
            });
        } else { // BY NONE
            var tabList = document.createElement("ul");

            tabList.id = "allTabsList";
            tabList.className = "tabList";

            myNode.appendChild(tabList);
        }

        // ADD TABS TO LIST

        tabs.forEach((tab) => {
            addTabToList(tab);
        });

        // CHECK EMPTY IN CASE THERE ARE 0 TABS

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
    // REMOVE ALL CHILDREN OF MAIN

    checkEmptyGroup();

    var myNode = document.getElementById("main");
    var pages = [];
    var tabs = [];

    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    if (document.getElementById("byWindow")) {
        document.getElementById("byWindow").style.display = "none";
    }

    if (document.getElementById("searchBox")) {
        document.getElementById("searchBox").style.display = "none";
    }

    if (document.getElementById("footer")) {
        document.getElementById("footer").style.display = "none";
    }

    /////

    recentlyClosed.forEach((tab) => {
        if (!tab.url.includes("chrome-extension://") && !tab.url.includes("chrome://")) {
            var tabUrl = getPageDomain(tab.url);
            tabs.push(tab);

            if (!pages.includes(tabUrl)) {
                pages.push(tabUrl);
            }
        }

        addTabToRecent(tab);
    });

    if (sortByName) {
        tabs.sort(function(a, b) {
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA < textB) ? -1 : (textA >= textB) ? 1 : 0;
        });

        pages.sort(function(a, b) {
            var textA = a.toUpperCase();
            var textB = b.toUpperCase();
            return (textA < textB) ? -1 : (textA >= textB) ? 1 : 0;
        });
    }

    if (groupingMode >= 2) { // BY PAGE
        pages.forEach((purl) => {
            var pCont = document.createElement("div");
            var pTitle = document.createElement("span");
            var pList = document.createElement("ul");

            pCont.className = "groupCont pageCont";
            pList.className = "tabList";
            pTitle.className = "groupTitle";
            pList.id = "p|" + purl;
            pTitle.innerHTML = purl;

            pCont.appendChild(pTitle);
            pCont.appendChild(pList);
            myNode.appendChild(pCont);
        });
    } else { // BY NONE
        var tabList = document.createElement("ul");

        tabList.id = "allTabsList";
        tabList.className = "tabList";

        myNode.appendChild(tabList);
    }

    recentlyClosed.forEach((tab) => {
        addTabToRecent(tab);
    });

    checkEmptyMain(`<h2 id="emptyPage">NO RECENTLY CLOSED TABS</h2>`);

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

        if (elem) {
            elem.parentNode.removeChild(elem);
            checkEmptyGroup();
        }
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
        if (res.length > 0) {
            var found = false;

            res.forEach((b) => {
                if (b.parentId === pid) {
                    found = true;

                    chrome.bookmarks.remove(b.id, () => {
                        updateTab(tab);
                        return;
                    });

                    return;
                }
            });

            if (!found) {
                chrome.bookmarks.create({title: tab.title, url: tab.url, parentId: pid}, () => {
                    updateTab(tab);
                });
            }
        } else {
            chrome.bookmarks.create({title: tab.title, url: tab.url, parentId: pid}, () => {
                updateTab(tab);
            });
        }
    });
}

function openTab(url) {
    chrome.tabs.create({url: url, active: true});
}

// TAB ACTIONS

function deselectAllTabItems() {
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (se[i].classList.contains("selected")) {
            se[i].classList.remove("selected");
        }

        if (selectedTabs.map(e => e.id).indexOf(parseInt(se[i].id.substr(1))) >= 0) {
            selectedTabs.splice(selectedTabs.map(e => e.id).indexOf(parseInt(se[i].id.substr(1))), 1);
        }
    }
}

function selectAllTabItems() {
    var se = document.getElementsByClassName("tabItem");

    for (i = 0; i < se.length; i++) {
        if (!se[i].classList.contains("selected")) {
            se[i].classList.add("selected");
        }

        if (!selectedTabs.includes(allTabs[allTabs.map(e => e.id).indexOf(parseInt(se[i].id.substr(1)))])) {
            selectedTabs.push(allTabs[allTabs.map(e => e.id).indexOf(parseInt(se[i].id.substr(1)))]);
        }
    }

    checkForSelected();
}

function closeSelectedTabs() {
    if (selectedTabs.length === 0) return;

    recentActions = [];
    var count = 0;

    selectedTabs.forEach((tab) => {
        recentlyClosed.push({title: tab.title, url: tab.url, favIconUrl: tab.favIconUrl});
        recentActions.push(tab.url);
        count++;

        closeTab(tab.id);
    });

    if (recentlyClosed.length > 300) {
        //recentlyClosed = recentlyClosed.slice(recentlyClosed.length - 301, recentlyClosed.length - 1);
    }

    showUndo("Closed " + count + " tabs.");

    chrome.storage.sync.set({key: JSON.stringify(recentlyClosed)});

    selectedTabs = [];
    checkForSelected();
}

function bookmarkSelectedTabs() {
    selectedTabs.forEach((tab) => {
        bookmarkTab(tab.id);
    });
}

// DYNAMIC LIST

function addTabToRecent(tab) {
    if (screen !== 1) return;

    var listItem = document.createElement("li");
    var favIcon = tab.favIconUrl;

    if (favIcon == "" || favIcon == null || favIcon == undefined) {
        favIcon = "../images/page.png";
    }

    listItem.classList.add("tabItem");
    listItem.classList.add("vis");
    listItem.classList.add(tab.url);
    
    listItem.innerHTML = `
        <table class="tabItemTable">
            <tr>
                <td><img class="favIcon" src=${favIcon} alt="ICO"></td>
                <td><span class="tabTitle">${tab.title}</span></td>
                <td rowspan='2' class="miniActions">
                    <img id="o${tab.url}" class="miniAction" src="../images/open.png" alt="REOPEN TAB">
                </td>
            </tr>
        </table>
    `;

    var pageList = document.getElementById("p|" + getPageDomain(tab.url));
    var allTabsList = document.getElementById("allTabsList");

    if (pageList) {
        listItem.style.borderLeftColor = "#303030";
        pageList.appendChild(listItem);
        allTabs.push(tab);
    } else if (allTabsList) {
        listItem.style.borderLeftColor = "#212121";
        allTabsList.appendChild(listItem);
        allTabs.push(tab);
    }

    checkEmptyMain(`<h2 id="emptyPage">NO RECENTLY CLOSED TABS</h2>`);
}

function addTabToList(tab) {
    if (screen > 1) return;

    if (document.getElementById("l" + tab.id)) {
        if (!allTabs.includes(tab)) {
            allTabs.push(tab);
        }

        return;
    }

    chrome.windows.getAll({populate:true}, function(windows) {
        if (tab.status === "complete") {
            var listItem = document.createElement("li");
            var bookmark = "../images/bookmark.png";

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
                    var wColor = windowColors[windows.map(e => e.id).indexOf(tab.windowId) % windowColors.length];
                    var favIcon = tab.favIconUrl;

                    if (favIcon == "" || favIcon == null || favIcon == undefined) {
                        favIcon = "../images/page.png";
                    }

                    listItem.classList.add("tabItem");
                    listItem.classList.add("vis");
                    listItem.classList.add(tab.url);
                    listItem.id = "l" + tab.id;
                    listItem.style.borderLeftColor = wColor;
                    
                    listItem.innerHTML = `
                        <table class="tabItemTable">
                            <tr>
                                <td><img id="f${tab.id}" class="favIcon" src=${favIcon} alt="ICO"></td>
                                <td><span id="t${tab.id}" class="tabTitle">${tab.title}</span></td>
                                <td rowspan='2' class="miniActions">
                                    <img id="c${tab.id}" class="miniAction" src="../images/close.png" alt="CLOSE TAB">
                                    <img id="v${tab.id}" class="miniAction" src="../images/view.png" alt="VIEW TAB">
                                    <img id="b${tab.id}" class="miniAction" src="${bookmark}" alt="BOOKMARK TAB">
                                </td>
                            </tr>
                        </table>
                    `;

                    var pageList = document.getElementById("p|" + tab.windowId + "|" + getPageDomain(tab.url));
                    var windowList = document.getElementById("w" + tab.windowId);
                    var allTabsList = document.getElementById("allTabsList");

                    if (pageList) {
                        pageList.appendChild(listItem);
                        
                        if (document.getElementById("wt" + tab.windowId)) {
                            document.getElementById("wt" + tab.windowId).style.backgroundColor = wColor;
                        }

                        allTabs.push(tab);
                    } else if (windowList) {
                        windowList.appendChild(listItem);
                        document.getElementById("wt" + tab.windowId).style.backgroundColor = wColor;
                        allTabs.push(tab);
                    } else if (allTabsList) {
                        allTabsList.appendChild(listItem);
                        allTabs.push(tab);
                    }

                    checkEmptyMain(`<h2 id="emptyPage">NO OPEN TABS</h2>`);
                });
            });
        }
    });
}

function updateTab(tab) {
    if (screen > 0) return;

    if (tab.status === "loading") {
        return;
    }

    if (tab.url.includes("chrome-extension://") || tab.url.includes("chrome://")) {
        return;
    }

    if (!document.getElementById("allTabsList") && document.getElementsByClassName("tabList").length === 0) {
        openTabsScreen();
        return;
    }

    if (!document.getElementById("l" + tab.id)) {
        addTabToList(tab);
        return;
    }

    chrome.windows.getAll({populate:true}, function(windows) { // TODO Fix newly added tabs not sorting
        for (i = 0; i < windows.length; i++) {
            var window = windows[i];

            for (k = 0; k < window.tabs.length; k++) {
                var item = window.tabs[k];

                if (item.id === tab.id) {
                    var bookmark = "../images/bookmark.png";
                    var tabBookmark = document.getElementById("b" + tab.id);
                    var tabTitle = document.getElementById("t" + tab.id);
                    var tabIcon = document.getElementById("f" + tab.id);
                    var tabItem = document.getElementById("l" + tab.id);
                    var wColor = windowColors[windows.map(e => e.id).indexOf(tab.windowId) % windowColors.length];

                    if (tabItem) {
                        tabTitle.innerHTML = tab.title;
                        tabIcon.src = tab.favIconUrl ? tab.favIconUrl : "../images/page.png";
                        tabItem.style.borderLeftColor = wColor;

                        if (allTabs.map(e => e.id).indexOf(tab.id) >= 0) {
                            allTabs[allTabs.map(e => e.id).indexOf(tab.id)] = tab;
                        } else {
                            allTabs.push(tab);
                        }

                        chrome.bookmarks.search({url: tab.url}, (res) => {            
                            chrome.bookmarks.search({title: bookmarksFolderName}, (ab) => {
                                res.forEach((b) => {
                                    if (b.parentId === ab[0].id) {
                                        bookmark = "../images/bookmarked.png";
                                    }
                                });

                                tabBookmark.src = bookmark;

                                checkEmptyGroup();
                                checkEmptyMain(`<h2 id="emptyPage">NO OPEN TABS</h2>`);
                            });
                        });
                    }
                }
            }
        }
    });
}

function searchTabs() {
    if (screen > 0) return;

    var tabList = document.getElementsByClassName("tabItem");

    if (tabList.length >= 1) {
        for (i = 0; i < tabList.length; i++) {
            var tabItem = document.getElementsByClassName("tabItem")[i];
            var tabTitle = document.getElementById("t" + tabItem.id.substr(1)).innerHTML.toLowerCase();
            var tabUrl = getPageDomain(tabItem.classList[2]);
            var query = searchBox.value.toLowerCase();

            if (tabUrl.includes(query) || tabTitle.includes(query) || query === "" || query === null || query === undefined) {
                tabItem.classList.replace("hid", "vis");
            } else {
                tabItem.classList.replace("vis", "hid");
            }
        }

        checkEmptyMain(`<h2 id="emptyPage">NO TAB RESULTS FOR "${searchBox.value}"</h2>`);
    }
}

// OTHER

function showUndo(text) {
    var undoCont = document.getElementById("undoCont");
    var undoText = document.getElementById("undoText");

    if (undoCont && undoText) {
        undoText.innerHTML = text;
        undoCont.style.display = "block";

        setTimeout(hideUndo, 4000);
    }
}

function hideUndo() {
    var undoCont = document.getElementById("undoCont");

    if (undoCont) {
        undoCont.style.display = "none";
    }
}

function undo() {
    mouseHold = false;
    mousePress = false;
    div.hidden = 1;

    recentActions.forEach((url) => {
        chrome.tabs.create({url: url});
    });
}

function getPageDomain(url) {
    if (url.includes("chrome-extension://") || url.includes("chrome://") || url == undefined || url == null || url == "") {
        return "CHROME";
    }

    var tabUrlTemp = url.split("/")[2].split(".");
    var tabUrl = "";

    for (k = 0; k < tabUrlTemp.length - 1; k++) {
        if (tabUrlTemp[k] !== "www") {
            tabUrl = tabUrl + "." + tabUrlTemp[k];
        }
    }

    tabUrl = tabUrl.substr(0, 1) === "." ? tabUrl.substr(1) : tabUrl;

    return tabUrl;
}

function removeNull(arr) {
    var newArr = [];

    arr.forEach((e) => {
        if (e !== null || e !== empty || e !== undefined) {
            newArr.push(e);
        }
    });

    return newArr;
}

function checkEmptyMain(blankPage) {
    var mainElem = document.getElementById("main");
    var empty = document.getElementById("emptyCont");

    if (empty) {
        empty.parentNode.removeChild(empty);
    }

    if (allTabs.length === 0 || document.getElementsByClassName("vis").length === 0) {
        var elem = document.createElement("div");
        elem.innerHTML = blankPage;
        elem.id = "emptyCont";

        mainElem.appendChild(elem);
    }
    
    if (allTabs.length === 0 || screen > 1 || Array.from(document.getElementsByClassName("tabItem")).length === 0) {
        document.getElementById("optionsCont").style.display = "none";
    } else if (document.getElementsByClassName("vis").length > 0) {
        document.getElementById("optionsCont").style.display = "flex";
    }

    if (screen === 0 && Array.from(document.getElementsByClassName("tabItem")).length > 0 && allTabs.length > 0) {
        document.getElementById("searchBox").style.display = "block";
    } else {
        document.getElementById("searchBox").style.display = "none";
    }
}

function resetNavClassNames() {
    document.getElementById("aboutScreen").className = "navButton rightMost";
    document.getElementById("bookmarksScreen").className = "navButton leftMost";
    document.getElementById("openTabsScreen").className = "navButton leftMost";
    document.getElementById("recentlyClosedScreen").className = "navButton leftMost";
}

function reloadAkira() {
    if (screen === 1) {
        recentlyClosedScreen();
        return;
    }

    chrome.tabs.getCurrent((t) => {
        chrome.tabs.reload(t.id);
    });
}

function openGit() {
    chrome.tabs.create({url: "https://github.com/recoskyler/Akira", active: true});
}

function checkForSelected() {
    if (selectedTabs.length >= 1) {
        document.getElementById("footer").style.display = "block";
    } else {
        document.getElementById("footer").style.display = "none";
    }

    document.getElementById("selectedCount").innerHTML = `${selectedTabs.length} Selected`;
}

function emptyFunction(a = 1, b = 2, c = 3, d = 4) {
}

function checkEmptyGroup() {
    var groups = document.getElementsByClassName("tabList");
    var wGroups = document.getElementsByClassName("groupCont");

    for (i = 0; i < groups.length; i++) {
        group = groups[i];

        if (group.childElementCount === 0) {
            const parent = group.parentNode;
            parent.removeChild(group);

            if (parent.id !== "main") {
                parent.parentNode.removeChild(parent);
            }
        }
    }

    for (i = 0; i < wGroups.length; i++) {
        group = wGroups[i];

        if (group.childElementCount === 1) {
            const parent = group.parentNode;
            parent.removeChild(group);

            if (parent.id !== "main") {
                parent.parentNode.removeChild(parent);
            }
        }
    }

    checkEmptyMain(`<h2 id="emptyPage">NO OPEN TABS</h2>`);
}

// GROUPING TOGGLES

function toggleByWindow() {
    document.getElementById("byWindow").classList.toggle("selectedOption");

    if (groupingMode === 2) {
        groupingMode = 3;
    } else if (groupingMode === 0) {
        groupingMode = 1;
    } else if (groupingMode === 1) {
        groupingMode = 0;
    } else if (groupingMode === 3) {
        groupingMode = 2;
    }

    document.getElementById("searchBox").value = "";

    openTabsScreen();
}

function toggleByPage() {
    document.getElementById("byPage").classList.toggle("selectedOption");
    
    if (groupingMode === 1) {
        groupingMode = 3;
    } else if (groupingMode === 0) {
        groupingMode = 2;
    } else if (groupingMode === 2) {
        groupingMode = 0;
    } else if (groupingMode === 3) {
        groupingMode = 1;
    }

    document.getElementById("searchBox").value = "";

    if (screen === 0) {
        openTabsScreen();
    } else if (screen === 1) {
        recentlyClosedScreen();
    }
}

function toggleByName() {
    document.getElementById("sortAlpha").classList.toggle("selectedOption");
    
    sortByName = sortByName === true ? false : true;

    document.getElementById("searchBox").value = "";

    if (screen === 0) {
        openTabsScreen();
    } else if (screen === 1) {
        recentlyClosedScreen();
    }
}

// SELECTION AND MOUSE CLICK/DRAG/ETC...

function reCalc() {
    var x3 = Math.min(x1,x2); //Smaller X
    var x4 = Math.max(x1,x2); //Larger X
    var y3 = Math.min(y1,y2); //Smaller Y
    var y4 = Math.max(y1,y2); //Larger Y
    div.style.left = x3 + 'px';
    div.style.top = y3 + 'px';
    div.style.width = x4 - x3 + 'px';
    div.style.height = y4 - y3 + 'px';
}

function checkIntersections() {
    // NAV CLICK

    var els = ["openTabsScreen", "recentlyClosedScreen", "bookmarksScreen", "aboutScreen"];
    var fus = [this.openTabsScreen, this.recentlyClosedScreen, this.bookmarksScreen, this.aboutScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);
        var rect1 = el.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown) {
            screen = i;
            document.getElementById("main").innerHTML = "";
            selectedTabs = [];
            allTabs = [];
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
                    var title = document.getElementById("t" + item.id.substring(1)).innerHTML;
                    var favIcon = document.getElementById("f" + item.id.substring(1)).src;
                    var url = document.getElementById("l" + item.id.substring(1)).classList[2];

                    recentActions = [];

                    recentlyClosed.push({title: title, url: url, favIconUrl: favIcon});
                    recentActions.push(url);

                    if (recentlyClosed.length > 300) {
                        //recentlyClosed = recentlyClosed.slice(recentlyClosed.length - 301, recentlyClosed.length - 1);
                    }

                    if (screen === 1) recentlyClosedScreen();
                
                    showUndo("Closed tab.");
                
                    chrome.storage.sync.set({key: JSON.stringify(recentlyClosed)});
                    closeTab(parseInt(item.id.substring(1)));
                    break;
                case 'o':
                    openTab(parseInt(item.id.substring(1)));
                    break;
                default:
                    break;
            }
        }
    }

    // OTHER BUTTONS

    var otherButtonIDs = ["git", "byWindow", "byPage", "sortAlpha", "bookmarkSelected", "closeSelected", "undoButton", "refresh"];
    var otherButtonFNs = [openGit, toggleByWindow, toggleByPage, toggleByName, bookmarkSelectedTabs, closeSelectedTabs, undo, reloadAkira];

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

    if (screen === 1) return;

    if ((mousePress && !mouseHold && !ctrlDown) || (mouseHold && !ctrlDown)) {
        deselectAllTabItems();
    }

    var tabItems = document.getElementsByClassName("tabItem");
    tabItems = Array.from(tabItems);

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
                if (lastSelectedItemID > tabItems.indexOf(item)) {
                    for (k = lastSelectedItemID; k > tabItems.indexOf(item); k--) {
                        var sei = document.getElementById(tabItems[k].id);

                        if (sei) {
                            if (k === lastSelectedItemID) {
                                continue;
                            }
        
                            sei.classList.toggle("selected");
                        }
                    }
                } else if (lastSelectedItemID < tabItems.indexOf(item)) {
                    for (k = lastSelectedItemID; k < tabItems.indexOf(item); k++) {
                        var sei = document.getElementById(tabItems[k].id);

                        if (sei) {        
                            if (k === lastSelectedItemID) {
                                continue;
                            }
        
                            sei.classList.toggle("selected");
                        }
                    }
                }
            }
            
            if (tabItems.length > 0) {
                lastSelectedItemID = tabItems.indexOf(item);
            } else {
                lastSelectedItemID = -1;
            }
            
        }

        var tab = allTabs[allTabs.map(e => e.id).indexOf(parseInt(item.id.substr(1)))];

        if (item.classList.contains("selected") && !selectedTabs.includes(tab)) {
            selectedTabs.push(tab);
        } else if (selectedTabs.includes(tab) && !item.classList.contains("selected")) {
            selectedTabs.splice(selectedTabs.indexOf(tab), 1);
        }
    }

    checkForSelected();
}

/////

window.onload = function() {
    div = document.getElementById('selectionRect');
    searchBox = document.getElementById('searchBox');

    // LOAD RECENTLY CLOSED

    chrome.storage.sync.get(['key'], function(result) {
        if (result.key) {
            recentlyClosed = JSON.parse(result.key);
        }
    });

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

        checkForSelected();
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

    searchBox.addEventListener("input", () => {
        this.searchTabs();
    });


    if (this.firstTime) {
        this.firstTime = false;
        openTabsScreen();
    }


    chrome.tabs.onCreated.addListener((tab) => {
        this.addTabToList(tab);
    });

    chrome.tabs.onUpdated.addListener((tid, change, tab) => {
        this.searchTabs();
        this.updateTab(tab);
    });

    chrome.tabs.onRemoved.addListener((tid) => {
        var elem = document.getElementById("l" + tid);

        while (this.allTabs.map(e => e.id).indexOf(tid) >= 0) {
            this.allTabs.splice(this.allTabs.map(e => e.id).indexOf(tid), 1);
        }

        while (this.selectedTabs.map(e => e.id).indexOf(tid) >= 0) {
            this.selectedTabs.splice(this.selectedTabs.map(e => e.id).indexOf(tid), 1);
        }

        if (elem) {
            elem.parentNode.removeChild(elem);
        }

        checkEmptyGroup();
        checkEmptyMain(`<h2 id="emptyPage">NO OPEN TABS</h2>`);
    });

    chrome.tabs.onDetached.addListener(this.reloadAkira);

    chrome.tabs.onAttached.addListener(this.reloadAkira);

    chrome.windows.onCreated.addListener(this.openTabsScreen);

    chrome.windows.onRemoved.addListener(this.openTabsScreen);

    chrome.storage.onChanged.addListener((res) => {
        if (this.recentlyClosed.length > 100) {
            this.recentlyClosed = this.recentlyClosed.slice(this.recentlyClosed.length - 1, this.recentlyClosed.length - 300);

            this.console.log(this.recentlyClosed);

            chrome.storage.sync.set({key: JSON.stringify(recentlyClosed)});
        }
    });
}