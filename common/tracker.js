/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Tracker {
    static _constructor() {
        Tracker._isInitialized || (window.addEventListener("error", r => {
            const e = r.message,
                t = r.filename,
                a = r.lineno,
                o = r.error;
            if (!t || !t.startsWith(browser.runtime.getURL("/"))) return;
            if ("string" != typeof e) return;
            if (e.includes("ResizeObserver")) return;
            const n = o && generateStackTrace(o);
            n ? Tracker.trackError("js", e, n) : Tracker.trackError("js", e, `${t}:${a}`)
        }), Tracker._isInitialized = !0)
    }
    static _getCustomVariables() {
        const r = Tracker.MANIFEST && Tracker.MANIFEST.version ? Tracker.MANIFEST.version : "unknown",
            e = Tracker._storageController.getSettings(),
            t = Tracker._storageController.getUIState(),
            a = Tracker._storageController.getTestFlags();
        return {
            1: ["version", String(r)],
            2: ["autoCheck", String(e.autoCheck)],
            3: ["account", String(e.havePremiumAccount)],
            4: ["subscription", String(t.hasPaidSubscription)],
            5: ["frenchPremiumRules", String(a.frenchPremiumRules)]
        }
    }
    static _getTrackingUrlForPageView(r) {
        return r = r.replace(/^(chrome|moz)-extension:\/\/.+?\//i, ""), r = `${Tracker.TRACKING_BASE_PAGE_URL}${r}`, new Promise((e, t) => {
            Tracker._storageController.onReady(() => {
                const {
                    firstVisit: t,
                    sessionCount: a
                } = Tracker._storageController.getStatistics(), o = Tracker._storageController.getUniqueId(), n = {
                    idsite: Tracker.TRACKING_SITE_ID,
                    _cvar: JSON.stringify(Tracker._getCustomVariables()),
                    rec: "1",
                    url: r,
                    rand: Date.now(),
                    apiv: "1",
                    res: `${screen.width}x${screen.height}`,
                    _id: o,
                    _idts: t,
                    _idvc: a
                };
                let s = "";
                for (const r in n) n.hasOwnProperty(r) && (s += `${r}=${encodeURIComponent(n[r])}&`);
                e(`${Tracker.TRACKING_BASE_URL}?${s}`)
            })
        })
    }
    static _getTrackingUrlForEvent(r, e, t = "", a) {
        return a = a || Tracker.TRACKING_BASE_PAGE_URL, new Promise((o, n) => {
            Tracker._storageController.onReady(() => {
                const {
                    firstVisit: n,
                    sessionCount: s
                } = Tracker._storageController.getStatistics(), i = Tracker._storageController.getUniqueId(), c = {
                    idsite: Tracker.TRACKING_SITE_ID,
                    _cvar: JSON.stringify(this._getCustomVariables()),
                    rec: "1",
                    url: a,
                    action_name: e,
                    rand: Date.now(),
                    apiv: "1",
                    res: `${screen.width}x${screen.height}`,
                    _id: i,
                    _idts: n,
                    _idvc: s,
                    e_c: r,
                    e_a: e,
                    e_n: t
                };
                let g = "";
                for (const r in c) c.hasOwnProperty(r) && (g += `${r}=${encodeURIComponent(c[r])}&`);
                o(`${Tracker.TRACKING_BASE_URL}?${g}`)
            })
        })
    }
    static _sendRequest(r) {
        if ("1" !== navigator.doNotTrack) {
            const e = new Image;
            e.referrerPolicy = "no-referrer", e.src = r
        }
    }
    static trackPageView(r) {
        r = r || getCurrentUrl(), Tracker._getTrackingUrlForPageView(r).then(e => {
            isProductionEnvironment() ? Tracker._sendRequest(e) : console.log("LT Page view tracking disabled in dev mode", {
                pageUrl: r,
                trackingUrl: e
            })
        }).catch(r => {
            console.log("LT could not track because:", r && r.message)
        })
    }
    static trackEvent(r, e, t, a) {
        this._getTrackingUrlForEvent(r, e, t, a).then(a => {
            isProductionEnvironment() ? this._sendRequest(a) : console.log("LT Event tracking disabled in dev mode", {
                actionCategory: r,
                action: e,
                actionName: t,
                trackingUrl: a
            })
        }).catch(r => {
            console.log("LT could not track because:", r && r.message)
        })
    }
    static trackInstall() {
        Tracker.trackEvent("Action", "install", getPrimaryLanguageCode(navigator.language)), this._storageController.updateUIState({
            isNewUser: !0,
            hasSeenGoogleDocsTeaser: !1
        })
    }
    static trackActivity() {
        const r = Date.now(),
            {
                sessionCount: e,
                firstVisit: t
            } = this._storageController.getStatistics(),
            {
                isNewUser: a
            } = this._storageController.getUIState();
        r - Tracker._lastTrackedActivity > Tracker.ACTIVITY_TRACK_INTERVAL && (Tracker._lastTrackedActivity = r, this._storageController.updateStatistics({
            sessionCount: e + 1
        }), this.trackEvent("Action", "ping", getPrimaryLanguageCode(navigator.language)));
        a && t && r - 1e3 * t > 6048e5 && this._storageController.updateUIState({
            isNewUser: !1
        }).then(() => {
            this.trackEvent("Action", "active_after_one_week", getPrimaryLanguageCode(navigator.language))
        }).catch(r => {
            const e = String(r && r.message ? r.message : r);
            this.trackEvent("JS-Error", `activity error: ${e}`)
        })
    }
    static trackError(r, e, t = "") {
        try {
            if (BrowserDetector.isUnsupportedChrome()) return;
            if (Tracker._errorCount++, Tracker._errorCount > config.MAX_EXCEPTION_COUNT) return;
            if ("string" != typeof e) return;
            if (Tracker._loggedErrors)
                if (Tracker._loggedErrors.length < Tracker.THROTTLE_REQUESTS) Tracker._loggedErrors.push(Date.now());
                else {
                    const r = Date.now();
                    if (!(r - Tracker._loggedErrors[0] >= Tracker.MAX_TIME)) return;
                    Tracker._loggedErrors.push(r), Tracker._loggedErrors.splice(0, 1)
                } else Tracker._loggedErrors = [Date.now()];
            let a = "JS-Error";
            "message" === r ? a = "Message-Error" : "http" === r && (a = "HTTP-Error");
            const o = getCurrentUrl();
            this.trackEvent(a, e, t || o, o)
        } catch (r) {
            console.error("Error while logging error from language tool", r)
        }
    }
    static trackStat(r, e) {
        0 === Math.floor(10 * Math.random()) && Tracker.trackEvent("Stat", r, e)
    }
    static trackTextLength(r) {
        if (0 === r) return;
        let e = "";
        e = r <= 100 ? "1-100" : r <= 1e3 ? "101-1000" : r <= 2500 ? "1001-2500" : r <= 5e3 ? "2501-5000" : r <= 7500 ? "5001-7500" : r <= 1e4 ? "7501-10000" : r <= 15e3 ? "10001-15000" : r <= 2e4 ? "15001-20000" : r <= 4e4 ? "20001-40000" : ">40000", this.trackStat("text_length", e)
    }
}
Tracker.TRACKING_BASE_URL = "https://analytics.languagetoolplus.com/matomo/piwik.__php__", Tracker.TRACKING_BASE_PAGE_URL = "https://fake/", Tracker.TRACKING_SITE_ID = "12", Tracker.ACTIVITY_TRACK_INTERVAL = 432e5, Tracker.MAX_TIME = 6e4, Tracker.THROTTLE_REQUESTS = 10, Tracker.MANIFEST = browser.runtime.getManifest(), Tracker._storageController = new StorageController, Tracker._lastTrackedActivity = 0, Tracker._isInitialized = !1, Tracker._loggedErrors = null, Tracker._errorCount = 0, Tracker._constructor();