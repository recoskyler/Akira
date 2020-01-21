var manifestData = chrome.runtime.getManifest();

function aboutScreen() {
    document.getElementById('main').innerHTML = `
        <img src="./images/icon512.png" id="logo" alt="AKIRA"/>
        
        <p>Akira is a Chrome extension for sorting -> viewing -> bookmarking/closing a bunch of tabs that are open on multiple windows.</p>
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
    

    resetNavClassNames();
    document.getElementById("openTabsScreen").className += " selectedNav";
}

function bookmarksScreen() {
    chrome.tabs.getCurrent(function(tab) {
        chrome.tabs.update(tab.id, {url: "chrome://bookmarks/"}, function() {})
    });

    resetNavClassNames();
    document.getElementById("bookmarksScreen").className += " selectedNav";
}

function recentlyClosedScreen() {
    document.getElementById('main').innerHTML = `
        c
    `;

    resetNavClassNames();
    document.getElementById("recentlyClosedScreen").className += " selectedNav";
}

function resetNavClassNames() {
    document.getElementById("aboutScreen").className = "navButton rightMost";
    document.getElementById("bookmarksScreen").className = "navButton leftMost";
    document.getElementById("openTabsScreen").className = "navButton leftMost";
    document.getElementById("recentlyClosedScreen").className = "navButton leftMost";
}

window.onload = function() {
    var els = ["openTabsScreen", "bookmarksScreen", "recentlyClosedScreen", "aboutScreen"];
    var fus = [this.openTabsScreen, this.bookmarksScreen, this.recentlyClosedScreen, this.aboutScreen];

    for (var i = 0; i < els.length; i++) {
        var el = document.getElementById(els[i]);

        if (el){
            el.addEventListener('click', fus[i]);
        }
    }

    openTabsScreen();
}
