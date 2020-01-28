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