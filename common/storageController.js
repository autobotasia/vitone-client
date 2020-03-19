/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class StorageController {
    constructor(e = (e => {})) {
        this._onStoredDataChanged = (e => {
            let t = !1,
                i = !1,
                n = !1,
                r = !1;
            for (const s in e) /^dictionary(_\d+)?$/.test(s) && (t = !0), this._settings && StorageController.DEFAULT_SETTINGS.hasOwnProperty(s) && "dictionary" !== s && (this._settings[s] = e[s].newValue, i = !0), this._privacySettings && StorageController.DEFAULT_PRIVACY_SETTINGS.hasOwnProperty(s) && (this._privacySettings[s] = e[s].newValue, n = !0), this._statistics && StorageController.DEFAULT_STATISTICS.hasOwnProperty(s) && (this._statistics[s] = e[s].newValue), this._uiState && StorageController.DEFAULT_UI_STATE.hasOwnProperty(s) && (this._uiState[s] = e[s].newValue, r = !0), this._testFlags && StorageController.DEFAULT_TEST_FLAGS.hasOwnProperty(s) && (this._testFlags[s] = e[s].newValue), "uniqueId" === s && (this._uniqueId = e[s].newValue);
            i && this._eventBus.fire(StorageController.eventNames.settingsChanged, e), t && this._storage.get().then(e => {
                if (!this._settings) return;
                const t = this._joinChunks(e, "dictionary"),
                    i = {
                        dictionary: {
                            oldValue: this._settings.dictionary,
                            newValue: t
                        }
                    };
                this._settings.dictionary = t, this._eventBus.fire(StorageController.eventNames.settingsChanged, i)
            }), n && this._eventBus.fire(StorageController.eventNames.privacySettingsChanged, e), r && this._eventBus.fire(StorageController.eventNames.uiStateChanged, e)
        }), this._storage = StorageController._getStorage(), this._eventBus = new EventBus, this._ready = !1, this._onReadyCallbacks = [e], this._loadData(), browser.storage.onChanged.addListener(this._onStoredDataChanged)
    }
    static _deepClone(e) {
        return JSON.parse(JSON.stringify(e || {}))
    }
    static _combineObjects(e, t) {
        const i = StorageController._deepClone(e);
        for (const e in i) t.hasOwnProperty(e) && (i[e] = t[e]);
        return i
    }
    static _dec2hex(e) {
        return ("0" + e.toString(16)).substr(-2)
    }
    static _getStringSize(e) {
        let t = 0;
        for (let i = 0; i < e.length; i++) {
            const n = e.charCodeAt(i);
            t += n < 128 ? 1 : n < 2048 ? 2 : n < 65536 ? 3 : n < 1 << 21 ? 4 : n < 1 << 26 ? 5 : n < 1 << 31 ? 6 : Number.NaN
        }
        return t
    }
    static _normalizeDomain(e = "") {
        return e.toLowerCase().trim().replace(/^www\./, "")
    }
    static _isListContainsDomain(e, t) {
        const i = StorageController._normalizeDomain(t);
        return (e || []).some(e => {
            const t = StorageController._normalizeDomain(e);
            return t === i || i.endsWith("." + t)
        })
    }
    static _getStorage() {
        return browser.storage.sync && !BrowserDetector.isFirefox() ? browser.storage.sync : browser.storage.local
    }
    _splitInChunks(e, t, i = this._storage.QUOTA_BYTES_PER_ITEM) {
        let n = e[t],
            r = 0,
            s = [],
            a = StorageController._getStringSize(t) + StorageController._getStringSize("[]");
        for (; n.length;) {
            const o = n.shift(),
                l = StorageController._getStringSize(`,"${o}"`);
            if (a + l > i) {
                e[0 === r ? t : `${t}_${r}`] = s, r++, s = [o], a = StorageController._getStringSize(`${t}_${i}`) + StorageController._getStringSize(`["${o}"]`)
            } else s.push(o), a += l;
            if (0 === n.length) {
                e[0 === r ? t : `${t}_${r}`] = s
            }
        }
        e[`${t}_${r+1}`] = []
    }
    _joinChunks(e, t, i = this._storage.MAX_ITEMS) {
        let n = e[t] || [];
        for (let r = 1; r < i; r++) {
            const i = e[`${t}_${r}`];
            if (void 0 === i || 0 === i.length) break;
            n = n.concat(i)
        }
        return n
    }
    _loadData() {
        return this._storage.get().then(e => {
            const t = StorageController._combineObjects(StorageController.DEFAULT_SETTINGS, e);
            t.dictionary = this._joinChunks(e, "dictionary");
            for (const e of t.ignoredRules)
                if (void 0 === e.description) {
                    const t = StorageController.DEFAULT_SETTINGS.ignoredRules.find(t => t.id === e.id && t.language === e.language);
                    e.description = t ? t.description : ""
                }
            this._settings = t, this._privacySettings = StorageController._combineObjects(StorageController.DEFAULT_PRIVACY_SETTINGS, e), this._statistics = StorageController._combineObjects(StorageController.DEFAULT_STATISTICS, e), this._uiState = StorageController._combineObjects(StorageController.DEFAULT_UI_STATE, e), this._testFlags = StorageController._combineObjects(StorageController.DEFAULT_TEST_FLAGS, e), e.uniqueId ? this._uniqueId = e.uniqueId : (this._uniqueId = this.generateUniqueId(), this._storage.set({
                uniqueId: this._uniqueId
            })), this._statistics.firstVisit || this.updateStatistics({
                firstVisit: Math.round(Date.now() / 1e3)
            }), this._ready = !0, this._onReadyCallbacks.forEach(e => e(this)), this._onReadyCallbacks = []
        })
    }
    onReady(e) {
        this._ready ? e() : this._onReadyCallbacks.push(e)
    }
    addEventListener(e, t) {
        this._eventBus.subscribe(e, t)
    }
    generateUniqueId() {
        const e = new Uint8Array(8);
        return window.crypto.getRandomValues(e), Array.from(e, StorageController._dec2hex).join("")
    }
    getUniqueId() {
        return this._uniqueId
    }
    getSettings() {
        return StorageController._deepClone(this._settings)
    }
    updateSettings(e) {
        for (const t in e)
            if (!StorageController.DEFAULT_SETTINGS.hasOwnProperty(t)) throw new Error(`Unknown setting ${t}`);
        return void 0 === e.dictionary || BrowserDetector.isFirefox() || this._splitInChunks(e, "dictionary"), Object.assign(this._settings || {}, e), this._storage.set(e)
    }
    getValidationSettings(e) {
        if (!this._settings) return {
            isDisabled: !1,
            isAutoCheckEnabled: !0,
            shouldCapitalizationBeChecked: !0
        };
        if (e === browser.runtime.id) return {
            isDisabled: !1,
            isAutoCheckEnabled: !0,
            shouldCapitalizationBeChecked: !0
        };
        const t = StorageController._isListContainsDomain(this._settings.disabledDomains, e),
            i = !StorageController._isListContainsDomain(this._settings.disabledDomainsCapitalization, e);
        if (this._settings.autoCheck) {
            return {
                isDisabled: t,
                isAutoCheckEnabled: !StorageController._isListContainsDomain(this._settings.ignoreCheckOnDomains, e),
                shouldCapitalizationBeChecked: i
            }
        }
        return {
            isDisabled: t,
            isAutoCheckEnabled: StorageController._isListContainsDomain(this._settings.autoCheckOnDomains, e),
            shouldCapitalizationBeChecked: i
        }
    }
    disableDomain(e) {
        const t = StorageController._normalizeDomain(e),
            i = this.getSettings(),
            n = "object" == typeof i.disabledDomains ? i.disabledDomains : [];
        return n.push(t), this.updateSettings({
            disabledDomains: n
        })
    }
    enableDomain(e) {
        const t = StorageController._normalizeDomain(e),
            i = this.getSettings();
        let n = "object" == typeof i.disabledDomains ? i.disabledDomains : [];
        return n = n.filter(e => {
            const i = StorageController._normalizeDomain(e);
            return i !== t && !t.endsWith("." + i)
        }), this.updateSettings({
            disabledDomains: n
        })
    }
    disableCapitalization(e) {
        const t = StorageController._normalizeDomain(e),
            i = this.getSettings(),
            n = "object" == typeof i.disabledDomainsCapitalization ? i.disabledDomainsCapitalization : [];
        return n.push(t), this.updateSettings({
            disabledDomainsCapitalization: n
        })
    }
    enableCapitalization(e) {
        const t = StorageController._normalizeDomain(e),
            i = this.getSettings();
        let n = "object" == typeof i.disabledDomainsCapitalization ? i.disabledDomainsCapitalization : [];
        return n = n.filter(e => {
            const i = StorageController._normalizeDomain(e);
            return i !== t && !t.endsWith("." + i)
        }), this.updateSettings({
            disabledDomainsCapitalization: n
        })
    }
    isUsedCustomServer() {
        return Boolean(this._settings && this._settings.apiServerUrl !== StorageController.DEFAULT_SETTINGS.apiServerUrl)
    }
    getPrivacySettings() {
        return StorageController._deepClone(this._privacySettings)
    }
    updatePrivacySettings(e) {
        for (const t in e)
            if (!StorageController.DEFAULT_PRIVACY_SETTINGS.hasOwnProperty(t)) throw new Error(`Unknown privacy setting ${t}`);
        return Object.assign(this._privacySettings || {}, e), this._storage.set(e)
    }
    getStatistics() {
        return StorageController._deepClone(this._statistics)
    }
    updateStatistics(e) {
        for (const t in e)
            if (!StorageController.DEFAULT_STATISTICS.hasOwnProperty(t)) throw new Error(`Unknown privacy setting ${t}`);
        return Object.assign(this._statistics || {}, e), this._storage.set(e)
    }
    getUIState() {
        return StorageController._deepClone(this._uiState)
    }
    updateUIState(e) {
        for (const t in e)
            if (!StorageController.DEFAULT_UI_STATE.hasOwnProperty(t)) throw new Error(`Unknown UI state ${t}`);
        return Object.assign(this._uiState || {}, e), this._storage.set(e)
    }
    checkForPaidSubscription() {
        return new Promise((e, t) => {
            this.onReady(() => {
                const {
                    havePremiumAccount: i,
                    username: n,
                    password: r,
                    token: s,
                    apiServerUrl: a
                } = this.getSettings();
                if (this.isUsedCustomServer()) return this.disablePaidSubscription(), void e(!1);
                if (!i && a === config.MAIN_SERVER_URL) return this.disablePaidSubscription(), void e(!1);
                const o = `${i?config.PREMIUM_SERVER_URL:a||config.MAIN_SERVER_URL}/check`,
                    l = new URLSearchParams;
                l.append("language", "en"), l.append("data", JSON.stringify({
                    text: "languagetool testrule 8634756"
                })), n && r ? (l.append("username", n), l.append("password", r)) : n && s && (l.append("username", n), l.append("tokenV2", s)), fetch(o, {
                    method: "post",
                    mode: "cors",
                    body: l
                }).then(e => e.json()).then(t => {
                    const i = t.matches.some(e => "PREMIUM_FAKE_RULE" === e.rule.id);
                    i ? this.enablePaidSubscription() : this.disablePaidSubscription(), e(i)
                }).catch(t)
            })
        })
    }
    enablePaidSubscription() {
        return !this._uiState || this._uiState.hasPaidSubscription ? Promise.resolve() : this.updateUIState({
            hasPaidSubscription: !0
        })
    }
    disablePaidSubscription() {
        return this._uiState && this._uiState.hasPaidSubscription ? this.updateUIState({
            hasPaidSubscription: !1
        }) : Promise.resolve()
    }
    getTestFlags() {
        return StorageController._deepClone(this._testFlags)
    }
    updateTestFlags(e) {
        for (const t in e)
            if (!StorageController.DEFAULT_TEST_FLAGS.hasOwnProperty(t)) throw new Error(`Unknown test flag ${t}`);
        return Object.assign(this._testFlags || {}, e), this._storage.set(e)
    }
    destroy() {
        this._ready = !1, this._eventBus.destroy(), this._onReadyCallbacks = [];
        try {
            browser.storage.onChanged.removeListener(this._onStoredDataChanged)
        } catch (e) {}
    }
}
StorageController.eventNames = {
    settingsChanged: "lt-storageController.settingsChanged",
    privacySettingsChanged: "lt-storageController.privacySettingsChanged",
    uiStateChanged: "lt-storageController.uiStateChanged"
}, StorageController.DEFAULT_SETTINGS = {
    apiServerUrl: config.MAIN_SERVER_URL,
    otherServerUrl: "",
    autoCheck: !0,
    havePremiumAccount: !1,
    knownEmail: "",
    username: "",
    password: "",
    token: "",
    motherTongue: "",
    geoIpLanguages: [],
    geoIpCountry: "",
    enVariant: getPreferredVariantFromBrowserLanguage(["en-US", "en-GB", "en-AU", "en-CA", "en-NZ", "en-ZA"]) || "en-US",
    deVariant: getPreferredVariantFromBrowserLanguage(["de-DE", "de-AT", "de-CH"]) || "de-DE",
    ptVariant: getPreferredVariantFromBrowserLanguage(["pt-PT", "pt-BR", "pt-MZ", "pt-AO"]) || "pt-PT",
    caVariant: "ca-ES",
    dictionary: [],
    ignoredRules: [{
        id: "PUNCTUATION_PARAGRAPH_END",
        language: "*",
        description: "No punctuation mark at the end of paragraph"
    }, {
        id: "DASH_RULE",
        language: "*",
        description: "Hyphen, n-dash and m-dash"
    }, {
        id: "FINAL_PUNCTUATION",
        language: "pt",
        description: "Pontuagão final em falta"
    }, {
        id: "FINAL_STOPS",
        language: "pt",
        description: "Pontuação: pontuação final em falta"
    }, {
        id: "SMART_QUOTES",
        language: "pt",
        description: "Aspas inteligentes (“”)"
    }, {
        id: "ELLIPSIS",
        language: "pt",
        description: "Reticências inteligentes (…)"
    }, {
        id: "DASH_SPACE_RULES",
        language: "pt",
        description: "Travessão em enumerações"
    }, {
        id: "EN_QUOTES",
        language: "en",
        description: "Smart quotes (“”)"
    }, {
        id: "TYPOGRAFISCHE_ANFUEHRUNGSZEICHEN",
        language: "de",
        description: "Typografische Anführungszeichen und Prime"
    }, {
        id: "FALSCHE_VERWENDUNG_DES_BINDESTRICHS",
        language: "de",
        description: "Mögliche falsche Verwendung des Bindestrichs"
    }, {
        id: "BISSTRICH",
        language: "de",
        description: "Bis-Strich vs. Bindestrich"
    }, {
        id: "AUSLASSUNGSPUNKTE",
        language: "de",
        description: "Auslassungspunkte"
    }, {
        id: "ABKUERZUNG_LEERZEICHEN",
        language: "de",
        description: 'Geschütztes Leerzeichen bei Abkürzungen wie "z. B."'
    }, {
        id: "EINDE_ZIN_ONVERWACHT",
        language: "nl",
        description: "Onverwacht einde zin"
    }, {
        id: "BACKTICK",
        language: "nl",
        description: "Geen ` (backtick)"
    }, {
        id: "GEDACHTESTREEPJE",
        language: "nl",
        description: "Gedachtestreepje"
    }, {
        id: "OPTIONAL_HYPHEN",
        language: "nl",
        description: "Optioneel koppelteken"
    }, {
        id: "PUNT_FINAL",
        language: "ca",
        description: "Falta el punt final en frases llargues"
    }],
    disabledDomains: [],
    disabledDomainsCapitalization: [],
    ignoreCheckOnDomains: [],
    autoCheckOnDomains: []
}, StorageController.DEFAULT_PRIVACY_SETTINGS = {
    allowRemoteCheck: !0
}, StorageController.DEFAULT_STATISTICS = {
    usageCount: 0,
    sessionCount: 0,
    appliedSuggestions: 0,
    hiddenErrors: [],
    firstVisit: null,
    ratingValue: null,
    premiumClicks: 0
}, StorageController.DEFAULT_UI_STATE = {
    hasSeenPrivacyConfirmationDialog: !1,
    hasPaidSubscription: !1,
    hasRated: !1,
    hasUsedValidator: !1,
    hasSeenOnboarding: !1,
    isNewUser: !1,
    hasSeenGoogleDocsTeaser: !0
}, StorageController.DEFAULT_TEST_FLAGS = {
    frenchPremiumRules: null
};