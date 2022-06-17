var popupWindowID;
var windowIsOpen = false;

chrome.runtime.onInstalled.addListener(() => {
    // code to run when installed -- get the referrer from the jump page that installed the CE
    chrome.cookies.get({'url': 'https://www.yawmp.com/timer', 'name': 'referrer_src'}, (cookie) => {
        if (cookie){
            console.log('cookie for referrer_src found', cookie.value)
            // send this referrer value to a backend server so we can see which marketing channels are the most effective
            fetch('https://www.yawmp.com/timer/installs_referrer_log.php?src=' + cookie.value)
                .then(response => response.json())
                .then(data => console.log(data))
        } else {
            console.log('no cookie for referrer_src found')
        }
    })

    const foo = 1

    // try getAll cookies
    var gettingAll = chrome.cookies.getAll({name: "referrer_src"})
    console.log(gettingAll)
});

chrome.action.onClicked.addListener((tab) => {
    // see if we already have a timertab open, and do nothing if we do
    if (windowIsOpen){
        // don't create a new window, but bring the existing window into focus
        if (popupWindowID > 0){
            chrome.windows.update(popupWindowID, { "focused": true });  
        }
    } else {
        // create the window
        chrome.windows.create({
            url: "index.html",
            type: "popup",
            width: 300,
            height: 100,
            left: 0,
            top: 0,
            focused: true,
            type: "popup" // or normal
        }, (win) => {
            // TODO: store the window ID so we can reference it later to bring it into focus - need to move this to localstorage for persistence
            popupWindowID = win.id
        });
    }
});

chrome.windows.onCreated.addListener(() => {
    // set a flag so we know that we've created a new window and so we don't create a second one
    windowIsOpen = true
})

chrome.windows.onRemoved.addListener(() => {
    // set a flag so we know that we've created a new window and so we don't create a second one
    windowIsOpen = false
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('page updated', tabId, changeInfo, tab)

    chrome.tabs.sendMessage(tabId, {
        cmd: "eval_page",
        changeInfo: changeInfo
    });
})
