let isMessageListenerSet = !1;

function reloadContentScriptsIfNecessary(e) {
    isMessageListenerSet || (isMessageListenerSet = !0, browser.runtime.onMessage.addListener((t, s) => {
        t && "INJECT_SCRIPTS" === t.command && (browser.runtime.getManifest().content_scripts.forEach(t => {
            t.js && t.js.forEach(t => {
                browser.tabs.executeScript(e, {
                    file: "/" + t,
                    matchAboutBlank: !0,
                    allFrames: !1,
                    frameId: s.frameId
                }).catch(e => console.error(e.message))
            }), t.css && t.css.forEach(t => {
                browser.tabs.insertCSS(e, {
                    file: "/" + t,
                    matchAboutBlank: !0,
                    allFrames: !1,
                    frameId: s.frameId
                }).catch(e => console.error(e.message))
            })
        }), Tracker.trackEvent("Action", "inject_scripts", hostName))
    })), browser.tabs.executeScript(e, {
        code: '\n\t\t\tif (typeof(LTAssistant) === "undefined" && window.chrome && window.chrome.runtime && !location.pathname.includes(\'_generated_background_page\')) {\n\t\t\t\twindow._ltLastActiveElement = document.activeElement;\n\t\t\t\tchrome.runtime.sendMessage({ command: "INJECT_SCRIPTS" }, () => null);\n\t\t\t}\n\t\t',
        matchAboutBlank: !0,
        allFrames: !0
    }).catch(() => null)
}