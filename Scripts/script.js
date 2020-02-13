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
var timer = setTimeout(() => {}, 1);
var eggTimer = setTimeout(() => {}, 1);
var selectedTabs = [];
var allTabs = [];
var groupingMode = 0;   // 0 - NONE : 1 - BY WINDOW : 2 - BY PAGE : 3 - BY BOTH
var firstTime = true;
var sortByName = false;
var includeUrlInSearch = false;
var addManuallyClosed = false;
var screen = 0;         // 0 - Open Tabs, 1 - Recently Closed, 2 - 
var recentActions = []; // c - closed, b - bookmarked, r - bookmark removed
var recentlyClosed = [];
var eekws = "";
var secretActive = false;
const threshold = 185;
const windowColors = ["#3F51B5", "#F44336", "#4CAF12", "#03A9F4", "#FFC107"];
const eestc = [
    "011001000110010101101110011010010111101001110000011010010110110001101001011011010110001001101001011101000111010001101001",
    "0111010001110011011101010111100101110101",
    "01100001011100110111010101101001",
    "01101001001111000011001101110101",
    "011001100111001001101111011100000111000001111001"
];
const eefnc = [axisPray, tafuwu, tafuwu, ily, tafuwu];
const eelgs = "01011011010000100100010101000111010010010100111001001110010010010100111001000111001000000100111101000110001000000101010001010010010000010100111001010011010011010100100101010011010100110100100101001111010011100101110100001010001100100011010000101111001100000011000100101111001100100011000000110010001100000010000000110010001100010011101000110100001101010010000001111100001000000100000101110011001000000111010001101000011001010010000001110100011010010110110101100101001000000111011101100001011100110010000001101100011010010110110101101001011101000110010101100100001011000010000001001001001000000111011101100001011100110010000001100001011000100110110001100101001000000111010001101111001000000111001001100101011000110110100001100001011100100110011101100101011001000010000001101101011110010010000000100111010001000110010101101110011010010111101000100000010000100110000101110100011101000110010101110010011110010010011100101100001000000110011001101111011100100010000001101010011101010111001101110100001000000011010000110101001000000110110101101001011011100111010101110100011001010111001100101100001000000111010001101111001000000011001100110000001000000111000001100101011100100110001101100101011011100111010000101110001000000100100101110100001000000111001101101000011011110111010101101100011001000010000001100010011001010010000001110011011101010110011001100110011010010110001101101001011001010110111001110100001000000110011001101111011100100010000001100001011101000010000001101100011001010110000101110011011101000010000000110011001100000010000001100100011000010111100101110011001011100000101000110010001101010010111100110000001100010010111100110010001100000011001000110000001000000011000100110011001110100011001000110000001000000111110000100000010010010010000001110011011101000110000101110010011101000110010101100100001000000110110101111001001000000110101001101111011101010111001001101110011001010111100100100000011101000110111100100000011101000110100001100101001000000110001101101111011011110111001001100100011010010110111001100001011101000110010101110011001000000011010100111001001011100011001100111001001101000011011100110001001100000010110000100000001100100011010000101110001101100011010100110001001110000011100100110001001000000110000101110100001000000011000000111001001110100011010000110000001011100010000001000001011001100111010001100101011100100010000000110100001000000110100001101111011101010111001001110011001011000010000001001001001000000110000101110010011100100110100101110110011001010110010000100000011000010111010000100000011101000110100001100101001000000110010001100101011100110110100101100111011011100110000101110100011001010110010000100000011000110110111101101111011100100110010001101001011011100110000101110100011001010111001100101110001000000100110101111001001000000010011101000100011001010110111001101001011110100010000001000010011000010111010001110100011001010111001001111001001001110010000001101100011001010111011001100101011011000010000001101001011100110010000000110010001110000010000001110000011001010111001001100011011001010110111001110100001011100010000001001001001000000110000101101101001000000110111001101111011101000010000001110011011101010111001001100101001000000110100101100110001000000111010001101000011010010111001100100000011000010110110101101111011101010110111001110100001000000111011101101001011011000110110000100000011000100110010100100000011100110111010101100110011001100110100101100011011010010110010101101110011101000010000001100110011011110111001000100000001100100011100100100000011011010110111101110010011001010010000001100100011000010111100101110011001011100000101000110010001110000010111100110000001100010010111100110010001100000011001000110000001000000011000100111000001110100011000000110101001000000111110000100000010101110110100001100101011011100010000001001001001000000110001101101000011001010110001101101011011001010110010000100000011011010111100100100000001001110100010001100101011011100110100101111010001000000100001001100001011101000111010001100101011100100111100100100111001000000110110001100101011101100110010101101100001011000010000001001001001000000111011101100001011100110010000001110011011010000110111101100011011010110110010101100100001011100010000001001001011101000010000001110111011000010111001100100000011000010111010000100000001100010011010100100000011100000110010101110010011000110110010101101110011101000010000100100000010010010010000001110100011100100110100101100101011001000010000001101110011011110111010000100000011101000110111100100000011101000110100001101001011011100110101100100000011011110110011000100000011101000110100001100101001000000110100101101110011001010111011001101001011101000110000101100010011011000110010100100000011010000110111101110010011100100110111101110010011100110010000001110100011010000110000101110100001000000111011101101001011011000110110000100000011100110111010101110010011001100110000101100011011001010010000001101111011011100110001101100101001000000110100101110100001000000111001001110101011011100111001100100000011011110111010101110100001011100000101000110010001110010010111100110000001100010010111100110010001000000011001000110000001000000011000000110010001110100011001000110010001000000111110000100000010010010010000001110111011000010111001100100000011000010110001001101100011001010010000001110100011011110010000001110011011101000110111101110000001000000111010001101000011001010010000001100110011000010111001101110100001000000110010001110010011011110111000000100000011010010110111000100000001001110100010001100101011011100110100101111010001000000100001001100001011101000111010001100101011100100111100100100111001000000110110001100101011101100110010101101100001000000110011001101111011100100010000000110100001000000110100001101111011101010111001001110011001011000010000001100010011110010010000001110101011100110110100101101110011001110010000000100111010100100110010101101101011011110111010001100101001000000100001101101000011000010111001001100111011010010110111001100111001001110010111000100000010010010111010000100000011010010111001100100000011011100110111101110111001000000110000101110100001000000011100000100000011100000110010101110010011000110110010101101110011101000010111000100000011010010010000001100100011011110110111000100111011101000010000001101011011011100110111101110111001000000111011101101000011000010111010000100000011101000110111100100000011001000110111100101110001011100010111000001010001100110011000000101111001100000011000100101111001100100011000000110010001100000010000000110010001100110011101000101101001011010010000000111010001000000110000101110011001000000100100100100000011100110110000101110111001000000111010001101000011001010010000001101100011001010111011001100101011011000010000001100100011100100110111101110000001000000111010001101111001000000011010000100000011100000110010101110010011000110110010101101110011101000010110000100000011010010010000001110011011101000110000101110010011101000110010101100100001000000111011101110010011010010111010001101001011011100110011100100000011011010111100100100000011101110110100101101100011011000010110000100000011000010110111001100100001000000111000001110010011000010111100101101001011011100110011100100000011101000110111100100000011001110110111101100100011100110010000001110100011010000110000101110100001000000110100100100000011001000110100101100100011011100111010000100000011000100110010101101100011010010110010101110110011001010010000001101001011011100010111000100000011101000110100001100101011100100110010100100000011010010111001100100000011011100110111100100000001001110011010000100000011011010110111101110010011001010010000001100100011000010111100101110011001001110010110000100000011011110110111001101100011110010010000001101000011011110111010101110010011100110010000001101100011001010110011001110100001011100000101000110011001100010010111100110001001011100010111100110010001100000010000000110001001100100011101100110110001101110010000000100111001000000110100100100000011000110110111101110101001100010110010001101110011000100111010000100000011001000110111100100000011011110110100101110100001000000010110000100000011010010010000001100100011010010110010001101110001101110010000001101000011000010111011000100000011101000110100000100000011000110110111101110101011100100110011101100101001000000010111001101001001000000110010001101111011011100010000001101011011011100111011100100000011101110110100001100001011101000010000001110100011100000010000001100100001100000010000001100001011011100111100101101101011100100010111001101001011101000111001100100000011000010111010000100000001100000010000001110000011001010111001001100011011011100111010000101110001000000110100100100000011000110011000001110101011001000110111001110100001000000111001100110100011110010010000001110100011010000110000101110100001000000110100100100000011011000011000001110110010110110100010101001110010001000010000001001111010001100010000001010100010100100100000101001110010100110100110101001001010100110101001101001001010011110100111001011101";

// NAV SCREENS

function aboutScreen() {
    checkEmptyMain("");

    eekws = "";

    var title = buildSpan("AKIRA");
    var line1 = buildSpan("Akira is a Chrome extension for sorting -> viewing -> bookmarking/closing\n a bunch of tabs that are open on multiple windows. If you\n have dozens of tabs open, give AKIRA a try!");
    var madeb = buildSpan("Made by Recoskyler (Adil Atalay Hamamcioglu) :3");
    var versi = buildSpan(`<Version: ${manifestData.version}>`);

    document.getElementById('main').innerHTML = `
        <img src="./images/icon_512.png" id="logo" alt="AKIRA"/>

        <h1>${title}</h1>

        <br/>
        
        <p class="mono">${line1}</p>
        
        <p class="mono">${madeb}</p>
        
        <br/>
        
        <p class="mono">${versi}</p>
        
        <br/>
        
        <p><img id='git' src='../images/github.png' alt='GITHUB'></p>

        <span id="secret"></span>
    `;

    resetNavClassNames();
    document.getElementById("aboutScreen").className += " selectedNav";
}

function openTabsScreen() {
    // REMOVE ALL CHILDREN OF MAIN

    checkEmptyGroup();

    clearElementByID("main");
    showElementByID("byWindow", "inline-block");

    var myNode = document.getElementById("main");

    if (!myNode) return;

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
                wList.id = "w|" + wid;
                wTitle.id = "wt|" + wid;
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
                pTitle.id = "pt|" + purl;
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
                wTitle.id = "wt|" + wid;
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
                        pTitle.id = "pt|" + purl;
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

    var pages = [];
    var tabs = [];
    var myNode = document.getElementById("main");

    clearElementByID("main");
    hideElementByID("byWindow");
    hideElementByID("footer");

    if (!myNode) return;

    if (document.getElementById("searchBox")) {
        hideElementByID("searchBox");
        document.getElementById("searchBox").value = "";
    }

    /////
    if (recentlyClosed !== null && recentlyClosed !== undefined && recentlyClosed.length > 0) {
        for (i = recentlyClosed.length - 1; i >= 0; i--) {
            var tab = recentlyClosed[i];

            if (!tab.url.includes("chrome-extension://") && !tab.url.includes("chrome://") && !tabs.includes(tab)) {
                var tabUrl = getPageDomain(tab.url);
                tabs.push(tab);

                if (!pages.includes(tabUrl)) {
                    pages.push(tabUrl);
                }
            }
        }
    } else {
        resetNavClassNames();
        document.getElementById("recentlyClosedScreen").className += " selectedNav";
        checkEmptyMain(`<h2 id="emptyPage">NO RECENTLY CLOSED TABS</h2>`);
        return;
    }

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
            pTitle.id = "pt|" + purl;
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

    for (i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        addTabToRecent(tab);
    }

    checkEmptyMain(`<h2 id="emptyPage">NO RECENTLY CLOSED TABS</h2>`);

    resetNavClassNames();
    document.getElementById("recentlyClosedScreen").className += " selectedNav";
}

function settingsScreen() {
    // REMOVE ALL CHILDREN OF MAIN

    checkEmptyGroup();

    var myNode = document.getElementById("main");

    clearElementByID("main");
    hideElementByID("byWindow");
    hideElementByID("footer");

    if (!myNode) return;

    if (document.getElementById("searchBox")) {
        hideElementByID("searchBox");
        document.getElementById("searchBox").value = "";
    }

    /////

    myNode.innerHTML = `
        <ul id="settingsList">
            <li>
                <label class="container" id="includeUrlInSearch">Search term in page URLs.
                    <input type="checkbox" id="includeUrlInSearchCB">
                    <span class="checkmark"></span>
                </label>
            </li>

            <li>
                <label class="container" id="addManuallyClosed">Add manually closed tabs to "Recently Closed". This requires Akira to be already open in one tab.
                    <input type="checkbox" id="addManuallyClosedCB">
                    <span class="checkmark"></span>
                </label>
            </li>
        </ul>
    `;

    var checkBox = document.getElementById("includeUrlInSearchCB");
    
    if (checkBox) {
        checkBox.checked = includeUrlInSearch;
    }

    checkBox = document.getElementById("addManuallyClosedCB");
    
    if (checkBox) {
        checkBox.checked = addManuallyClosed;
    }

    resetNavClassNames();
    document.getElementById("settingsScreen").className += " selectedNav";
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
        if (!recentlyClosed.includes({title: tab.title, url: tab.url, favIconUrl: tab.favIconUrl})) {
            recentlyClosed.push({title: tab.title, url: tab.url, favIconUrl: tab.favIconUrl});
        }
       
        recentActions.push(tab.url);
        count++;

        closeTab(tab.id);
    });

    if (recentlyClosed.length > 100) {
        recentlyClosed = recentlyClosed.slice(recentlyClosed.length - 299, recentlyClosed.length - 1);
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
    if (screen !== 1 || !tab || tab.url === "") return;

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
    if (screen >= 1 && !allTabs.includes(tab)) {
        allTabs.push(tab);
        return;
    }

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
                    var windowList = document.getElementById("w|" + tab.windowId);
                    var allTabsList = document.getElementById("allTabsList");

                    if (pageList) {
                        pageList.appendChild(listItem);
                        
                        if (document.getElementById("wt|" + tab.windowId)) {
                            document.getElementById("wt|" + tab.windowId).style.backgroundColor = wColor;
                        }

                        allTabs.push(tab);
                    } else if (windowList) {
                        windowList.appendChild(listItem);
                        document.getElementById("wt|" + tab.windowId).style.backgroundColor = wColor;
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
    if (tab.status === "loading") {
        return;
    }

    if (tab.url.includes("chrome-extension://") || tab.url.includes("chrome://")) {
        return;
    }

    if (screen >= 1 && !allTabs.includes(tab)) {
        allTabs.push(tab);
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

    chrome.windows.getAll({populate:true}, function(windows) {
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
            var titleElem = document.getElementById("t" + tabItem.id.substr(1));
            
            titleElem.innerHTML = titleElem.innerHTML.replace(new RegExp("<mark>|</mark>", "g"), "");

            var tabTitle = titleElem.innerHTML.toLowerCase();
            var tabUrl = getPageDomain(tabItem.classList[2]);
            var query = searchBox.value.toLowerCase();
            var qRes = includeUrlInSearch ? (tabUrl.includes(query) || tabTitle.includes(query)) : tabTitle.includes(query);

            if (qRes || query === "" || query === null || query === undefined) {
                tabItem.classList.replace("hid", "vis");
                titleElem.innerHTML = titleElem.innerHTML.replace(new RegExp(query, "gi"), (match) => {
                    return "<mark>" + match + "</mark>";
                });
            } else {
                tabItem.classList.replace("vis", "hid");
            }
        }

        checkEmptyMain(`<h2 id="emptyPage">NO TAB RESULTS FOR "${searchBox.value}"</h2>`);
    }
}

// OTHER

function closeWindows() {
    chrome.windows.getAll({populate:true}, function(windows) {
        windows.forEach(function(window) {
            try {
                if (window.tabs.length === 0 || window.tabs[0].url.includes("chrome://")) {
                    chrome.windows.remove(window.id);
                }
            } catch (error) {
                console.log("WINDOW NOT FOUND, or something... idk");
            }
        });
    });
}

function showUndo(text) {
    var undoText = document.getElementById("undoText");

    if (undoCont && undoText) {
        undoText.innerHTML = text;
        showElementByID("undoCont");

        setTimeout(hideUndo, 4000);
    }
}

function hideUndo() {
    hideElementByID("undoCont");
}

function undo() {
    mouseHold = false;
    mousePress = false;
    div.hidden = 1;

    recentActions.forEach((url) => {
        chrome.tabs.create({url: url, active: false});
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

        if (screen <= 1) mainElem.appendChild(elem);
    }
    
    if (allTabs.length === 0 || screen > 1 || Array.from(document.getElementsByClassName("tabItem")).length === 0) {
        hideElementByID("optionsCont");
    } else if (document.getElementsByClassName("vis").length > 0) {
        showElementByID("optionsCont", "flex");
    }

    if (screen === 0 && Array.from(document.getElementsByClassName("tabItem")).length > 0 && allTabs.length > 0) {
        showElementByID("searchBox", "block");
    } else {
        hideElementByID("searchBox");
    }
}

function resetNavClassNames() {
    document.getElementById("aboutScreen").className = "navButton rightMost";
    document.getElementById("bookmarksScreen").className = "navButton leftMost";
    document.getElementById("openTabsScreen").className = "navButton leftMost";
    document.getElementById("recentlyClosedScreen").className = "navButton leftMost";
    document.getElementById("settingsScreen").className = "navButton rightMost";
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
        showElementByID("footer");
    } else {
        hideElementByID("footer");
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

function toggleIncludeUrl() {
    includeUrlInSearch = !includeUrlInSearch;

    var checkBox = document.getElementById("includeUrlInSearchCB");
    
    if (checkBox) {
        checkBox.checked = includeUrlInSearch;
    }

    chrome.storage.sync.set({includeUrl: includeUrlInSearch});
}

function toggleManuallyClosed() {
    addManuallyClosed = !addManuallyClosed;

    var checkBox = document.getElementById("addManuallyClosedCB");
    
    if (checkBox) {
        checkBox.checked = addManuallyClosed;
    }

    chrome.storage.sync.set({addManuallyClosed: addManuallyClosed});
}

// OPTIMIZATION

function hideElementByID(id) {
    var elem = document.getElementById(id);

    if (elem) {
        elem.style.display = "none";
    }
}

function showElementByID(id, disp = "block") {
    var elem = document.getElementById(id);

    if (elem) {
        elem.style.display = disp;
    }
}

function hideElementsByClass(cls) {
    var elems = document.getElementsByClassName(cls);

    if (!elems) return;

    for (i = 0; i < elems.length; i++) {
        var elem = elems[i];

        if (elem) {
            elem.style.display = "none";
        }
    }
}

function showElementsByClass(cls, disp = "block") {
    var elems = document.getElementsByClassName(cls);

    if (!elems) return;

    for (i = 0; i < elems.length; i++) {
        var elem = elems[i];

        if (elem) {
            elem.style.display = disp;
        }
    }
}

function clearElementByID(id) {
    var myNode = document.getElementById(id);

    if (!myNode) return;

    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

// EE FUNCTIONALITY MODULES

function toBin(str, spaceSeparatedOctets) {
    function zeroPad(num) {
        return "00000000".slice(String(num).length) + num;
    }

    return str.replace(/[\s\S]/g, function(str) {
        str = zeroPad(str.charCodeAt().toString(2));
        return !1 == spaceSeparatedOctets ? str : str + " ";
    });
};

function fromBin(str) {
    // Removes the spaces from the binary string
    str = str.replace(/\s+/g, '');
    // Pretty (correct) print binary (add a space every 8 characters)
    str = str.match(/.{1,8}/g).join(" ");

    var newBinary = str.split(" ");
    var binaryCode = [];

    for (i = 0; i < newBinary.length; i++) {
        binaryCode.push(String.fromCharCode(parseInt(newBinary[i], 2)));
    }
    
    return binaryCode.join("");
}

function checkEEAchieved() {
    if (eekws.length < 8 * 4) return;

    if (eestc.includes(eekws.substr(eekws.length - 4 * 8))) {
        eefnc[eestc.indexOf(eekws.substr(eekws.length - 4 * 8))](eekws.substr(eekws.length - 4 * 8));
    }

    if (eekws.length < 8 * 5) return;

    if (eestc.includes(eekws.substr(eekws.length - 5 * 8))) {
        eefnc[eestc.indexOf(eekws.substr(eekws.length - 5 * 8))](eekws.substr(eekws.length - 5 * 8));
    }

    if (eekws.length < 8 * 6) return;

    if (eestc.includes(eekws.substr(eekws.length - 6 * 8))) {
        eefnc[eestc.indexOf(eekws.substr(eekws.length - 6 * 8))](eekws.substr(eekws.length - 6 * 8));
    }

    if (eekws.length < 8 * 15) return;

    if (eestc.includes(eekws)) {
        eefnc[eestc.indexOf(eekws)](eekws.substr(eekws.length - 15 * 8));
    }
}

function buildSpan(text) {
    var res = "";

    for (i = 0; i < text.length; i++) {
        var chr = text.charAt(i) == ' ' ? "&nbsp;" : text.charAt(i);
        res += `<span class="charButton ${chr}">${chr}</span>`
    }

    return res;
}

function tafuwu(code) {
    if (!eestc.includes(code)) return;

    secretActive = true;

    var logo = document.getElementById("logo");
    var main = document.getElementById("main");
    var scrt = document.getElementById("secret");
    var navb = document.getElementById("nav");
    var body = document.getElementById("body");
    var nico = document.getElementById("nameIcon");
    var gico = document.getElementById("git");

    if (logo && main && scrt && navb && body && nico) {
        logo.src = "../images/fta_temp.jpg";
        scrt.innerHTML = "TSUYU-CHAN <3";
        navb.style.borderColor = "#BAC351";
        navb.style.backgroundColor = "#369032";
        navb.style.color = "#253122";
        body.style.backgroundColor = "#223227";
        scrt.style.color = "#BAC351";
        nico.innerHTML = "TSUYU-CHAN ❤️";
        main.style.borderColor = "#BAC351";
        gico.src = "../images/kurbagaamk.png";
        gico.style.width = "auto";
        gico.style.height = "auto";
    }
}

function ily(code) {
    if (!eestc.includes(code)) return;

    secretActive = true;

    var hrts = document.getElementsByClassName("LOVE_YOU_uwu");

    while (hrts.length > 0) {
        hrts = document.getElementsByClassName("LOVE_YOU_uwu");
        hrts[0].parentNode.removeChild(hrts[0]);
    }

    console.log(hrts.length);

    for (i = 0; i < 200; i++) {
        var rnd = Math.floor(Math.random() * 10);
        var hrt = document.createElement("img");
        hrt.src = rnd < 5 ? "../images/h1.png" : "../images/h2.png";

        rnd = Math.floor(Math.random() * 64) + 8;

        hrt.style.width = `${rnd}px`;
        hrt.style.position = "absolute";
        hrt.id = `${i}`;
        hrt.className = "LOVE_YOU_uwu";

        rnd = Math.floor(Math.random() * 100) - 50;

        hrt.style.transform = `rotate(${rnd}deg)`;

        var window_Height = window.innerHeight;
        var window_Width = window.innerWidth;

        document.getElementById("cont").appendChild(hrt);
        
        var image_Element = document.getElementById(`${i}`);
        var image_Height = image_Element.height;
        var image_Width = image_Element.width;
        
        var availSpace_V = window_Height - image_Height - 50;
        var availSpace_H = window_Width - image_Width - 50;
        
        var randNum_V = Math.round(Math.random() * availSpace_V);
        var randNum_H = Math.round(Math.random() * availSpace_H);
        
        image_Element.style.top = randNum_V + "px";
        image_Element.style.left = randNum_H + "px";
    }

    eggTimer = setTimeout(() => {ily("01101001001111000011001101110101")}, 400);
}

function axisPray(code) {
    if (!eestc.includes(code)) return;

    secretActive = true;

    var logo = document.getElementById("logo");
    var main = document.getElementById("main");
    var scrt = document.getElementById("secret");

    if (logo && main && scrt) {
        logo.src = "../images/axis.png";
        scrt.innerHTML = fromBin(eelgs);
    }
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
    // EE MOUSE CLICK

    var charButtons = document.getElementsByClassName("charButton");

    for (i = 0; i < charButtons.length; i++) {
        var item = charButtons[i];
        var rect1 = item.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown) {
            try {
                eekws += toBin(item.classList[1].toLowerCase(), false);

                if (eekws.length > 8 * 15) {
                    eekws = eekws.substr(eekws.length - (8 * 17));
                }

                if (document.getElementById("secret") && !secretActive) {
                    document.getElementById("secret").innerHTML = fromBin(eekws);
                }

                checkEEAchieved();
            } catch (error) {
                console.log("fug"); // Who catches errors anyway?
            }
        }
    }

    // NAV CLICK

    var els = ["openTabsScreen", "recentlyClosedScreen", "bookmarksScreen", "aboutScreen", "settingsScreen"];
    var fus = [this.openTabsScreen, this.recentlyClosedScreen, this.bookmarksScreen, this.aboutScreen, this.settingsScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);
        var rect1 = el.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown) {
            screen = i;
            clearElementByID("main");
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

                    if (!recentlyClosed.includes({title: title, url: url, favIconUrl: favIcon})) {
                        recentlyClosed.push({title: title, url: url, favIconUrl: favIcon});
                    }

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
                    openTab(item.id.substring(1));
                    break;
                default:
                    break;
            }
        }
    }

    
    // OTHER BUTTONS
    
    var otherButtonIDs = ["git", "byWindow", "byPage", "sortAlpha", "bookmarkSelected", "closeSelected", "undoButton", "refresh", "includeUrlInSearch", "addManuallyClosed"];
    var otherButtonFNs = [openGit, toggleByWindow, toggleByPage, toggleByName, bookmarkSelectedTabs, closeSelectedTabs, undo, reloadAkira, toggleIncludeUrl, toggleManuallyClosed];
    
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
    
    // WINDOW/PAGE GROUP SELECT

    var groups = document.getElementsByClassName("groupTitle");

    for (i = 0; i < groups.length; i++) {
        var groupTitle = groups[i];
        var rect1 = groupTitle.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !shiftDown) {
            var tabItems = document.getElementsByClassName("tabItem");
            tabItems = Array.from(tabItems);

            for (i = 0; i < tabItems.length; i++) {
                var tabItem = tabItems[i];
                var parentNode = tabItem.parentElement;
                var tab = allTabs[allTabs.map(e => e.id).indexOf(parseInt(tabItem.id.substr(1)))];

                if (groupTitle.id.split("|")[0] === "pt" && parentNode.id.split("|")[2] === groupTitle.id.split("|")[2]) {
                    tabItem.classList.toggle("selected");
                } else if (groupTitle.id.split("|")[0] === "wt" && parentNode.id.split("|")[1] === groupTitle.id.split("|")[1]) {
                    tabItem.classList.toggle("selected");
                }

                if (tabItem.classList.contains("selected")) {
                    tabItem.style.backgroundColor = tabItem.style.borderLeftColor;
                } else {
                    tabItem.style.backgroundColor = "";
                }

                if (tabItem.classList.contains("selected") && !selectedTabs.includes(tab)) {
                    selectedTabs.push(tab);
                } else if (selectedTabs.includes(tab) && !tabItem.classList.contains("selected")) {
                    selectedTabs.splice(selectedTabs.indexOf(tab), 1);
                }
            }

            checkForSelected();
            return;
        }
    }

    // SINGLE/MULTI ITEM SELECT

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

                            if (sei.classList.contains("selected")) {
                                sei.style.backgroundColor = sei.style.borderLeftColor;
                            } else {
                                sei.style.backgroundColor = "";
                            }
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

                            if (sei.classList.contains("selected")) {
                                sei.style.backgroundColor = sei.style.borderLeftColor;
                            } else {
                                sei.style.backgroundColor = "";
                            }
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

        if (item.classList.contains("selected")) {
            item.style.backgroundColor = item.style.borderLeftColor;
        } else {
            item.style.backgroundColor = "";
        }

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

    chrome.storage.sync.get(['includeUrl'], function(result) {
        if (result.includeUrl) {
            includeUrlInSearch = result.includeUrl;

            var checkBox = document.getElementById("includeUrlInSearchCB");
    
            if (checkBox) {
                checkBox.checked = includeUrlInSearch;
            }
        }
    });

    chrome.storage.sync.get(['addManuallyClosed'], function(result) {
        if (result.addManuallyClosed) {
            addManuallyClosed = result.addManuallyClosed;

            var checkBox = document.getElementById("addManuallyClosedCB");
    
            if (checkBox) {
                checkBox.checked = addManuallyClosed;
            }
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
        this.div.hidden = 0;
        this.x1 = event.pageX;
        this.y1 = event.pageY;
        this.reCalc();
        this.checkIntersections();
    });

    // MOUSE MOVE
    this.document.addEventListener("mousemove", (event) => {
        this.x2 = event.pageX;
        this.y2 = event.pageY;

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
        this.div.hidden = 1;
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
        closeWindows();

        var elem = document.getElementById("l" + tid);

        if (this.addManuallyClosed && this.allTabs.map(e => e.id).indexOf(tid) >= 0) {
            var tabElem = this.allTabs[this.allTabs.map(e => e.id).indexOf(tid)];
            var reTab = {title: tabElem.title, url: tabElem.url, favIconUrl: tabElem.favIconUrl};

            if (!this.recentlyClosed.includes(reTab)){
                recentlyClosed.push(reTab);

                if (recentlyClosed.length > 100) {
                    recentlyClosed = recentlyClosed.slice(recentlyClosed.length - 299, recentlyClosed.length - 1);
                }
            
                chrome.storage.sync.set({key: JSON.stringify(recentlyClosed)});

                if (screen === 1) this.recentlyClosedScreen();
            }
        }

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