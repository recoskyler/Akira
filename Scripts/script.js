var manifestData = chrome.runtime.getManifest();
var bookmarksFolderName = "Akira Bookmarks";
var shiftDown = false, ctrlDown = false, mouseHold = false, mousePress = false;
var lastsliid = -1;
var div, x1 = 0, y1 = 0, x2 = 0, y2 = 0;
var threshold = 185;
var timer = setTimeout(() => {}, 1);

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
    dropEvents("miniAction");
    dropEvents("tabItem");

    var list = document.createElement("ul");
    var liid = 0;
    
    list.id = "allTabsList";

    chrome.windows.getAll({populate:true}, function(windows) {
        windows.forEach(function(window) {
            window.tabs.forEach(function(tab) {
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

    checkEmptyMain(`
        <h2 id="emptyPage">NO OPEN TABS</h2>
    `);

    resetNavClassNames();
    document.getElementById("openTabsScreen").className += " selectedNav";
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

// OTHER

function checkEmptyMain(blankPage) {
    if (document.getElementById("main").childElementCount === 0) {
        document.getElementById("main").innerHTML = blankPage;
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

function openGit() {
    chrome.tabs.create({url: "https://github.com/recoskyler/Akira", active: true});
}

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

function checkIntersections() {
    // NAV CLICK

    var els = ["openTabsScreen", "recentlyClosedScreen", "bookmarksScreen", "aboutScreen"];
    var fus = [this.openTabsScreen, this.recentlyClosedScreen, this.bookmarksScreen, this.aboutScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);
        var rect1 = el.getBoundingClientRect();
        var rect2 = div.getBoundingClientRect();
        var overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);

        if (overlap && !mouseHold && mousePress && !ctrlDown && !shiftDown){
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

        if (overlap && mouseHold && !shiftDown) {
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

            if (lastsliid != -1 && shiftDown && ctrlDown) {
                if (lastsliid > item.classList[1]) {
                    for (k = lastsliid; k > item.classList[1]; k--) {
                        var sei = document.getElementsByClassName(k);
                        
                        if (k == lastsliid) {
                            continue;
                        }
    
                        sei[0].classList.toggle("selected");
                    }
                } else if (lastsliid < item.classList[1]) {
                    for (k = lastsliid; k < item.classList[1]; k++) {
                        var sei = document.getElementsByClassName(k);
    
                        if (k == lastsliid) {
                            continue;
                        }
    
                        sei[0].classList.toggle("selected");
                    }
                }
            }
            
            lastsliid = item.classList[1];
        }
    }
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
        this.x1 = event.clientX; //Set the initial X
        this.y1 = event.clientY; //Set the initial Y
        this.reCalc();
        this.checkIntersections();
    });

    // MOUSE MOVE
    this.document.addEventListener("mousemove", (event) => {
        this.x2 = event.clientX; //Update the current position X
        this.y2 = event.clientY; //Update the current position Y

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

        if (event.button === 0) {
            this.mouseHold = false;
            this.mousePress = false;
            this.x1 = 0; //Set the initial X
            this.y1 = 0; //Set the initial Y
            this.div.hidden = 1; //Hide the div
            this.reCalc();
        }
    });

    // TODO Optimize this part VVVVVV

    chrome.tabs.onUpdated.addListener(openTabsScreen);
    chrome.tabs.onCreated.addListener(reloadAkira);
    chrome.tabs.onRemoved.addListener(reloadAkira);
    chrome.tabs.onMoved.addListener(reloadAkira);
    chrome.tabs.onReplaced.addListener(reloadAkira);
    chrome.tabs.onDetached.addListener(reloadAkira);
    chrome.tabs.onAttached.addListener(reloadAkira);
    chrome.windows.onCreated.addListener(reloadAkira);

    /////

    openTabsScreen();
}