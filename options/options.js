/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
const defaultServerUrl = config.MAIN_SERVER_URL,
    httpUrlRegExp = new RegExp(/^https?:\/\/.+$/),
    urlRegExp = new RegExp(/^(https?:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,15}(:[0-9]{1,5})?(\/.*)?$/),
    ipv4 = "(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}",
    ipv4Reg = new RegExp(`^${ipv4}$`),
    storageController = new StorageController(init);

function validURL(e) {
    return urlRegExp.test(e) || "localhost" === e || ipv4Reg.test(e)
}

function localize() {
    translateSection(document.documentElement), translateElement("#havePremiumAccountDesc", {
        isHTML: !0,
        key: "havePremiumAccountDesc",
        interpolations: ["https://languagetoolplus.com/webextension/upgrade?pk_campaign=addon2-options"]
    })
}

function loadSettings() {
    const e = storageController.getSettings();
    document.getElementById("apiServerUrl").value = e.apiServerUrl, document.getElementById("otherServerUrl").value = e.otherServerUrl, e.apiServerUrl === config.MAIN_SERVER_URL ? document.getElementById("serverTypeCloud").checked = !0 : e.apiServerUrl === config.LOCAL_SERVER_URL ? document.getElementById("serverTypeLocal").checked = !0 : (document.getElementById("serverTypeOther").checked = !0, showOtherServerSetting()), document.getElementById("motherTongue").value = e.motherTongue, document.getElementById("variant-en").value = e.enVariant, document.getElementById("variant-de").value = e.deVariant, document.getElementById("variant-pt").value = e.ptVariant, document.getElementById("variant-ca").value = e.caVariant;
    const t = e.autoCheckOnDomains.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase())),
        n = e.ignoreCheckOnDomains.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase()));
    document.getElementById("autoCheck").checked = e.autoCheck, document.getElementById("autoCheckOnDomains").value = t.length ? t.join("\n") + "\n" : "", document.getElementById("ignoreCheckOnDomains").value = n.length ? n.join("\n") + "\n" : "", toggleAutoCheck(e.autoCheck), updatePremiumState(), renderIgnoredRules(), renderDisabledDomains(), renderPersonalDictionary(), showPrivacyLink()
}

function updatePremiumState() {
    const {
        hasPaidSubscription: e
    } = storageController.getUIState();
    e ? document.body.classList.add("lt-options--plus") : document.body.classList.remove("lt-options--plus"), toggleAccount()
}

function toggleAccount() {
    const {
        havePremiumAccount: e,
        username: t
    } = storageController.getSettings();
    e ? (document.getElementById("lt-account").style.display = "block", document.getElementById("lt-login").style.display = "none", document.getElementById("lt-server").style.display = "none", translateElement("#lt-account-text", {
        key: "settingsLoggedInAs",
        isHTML: !0,
        interpolations: [`<strong>${t}</strong>`]
    })) : (document.getElementById("lt-account").style.display = "none", document.getElementById("lt-login").style.display = "block", document.getElementById("lt-server").style.display = "block")
}

function toggleAutoCheck(e) {
    e ? (document.getElementById("autoCheckOnDomainsContainer").style.display = "none", document.getElementById("autoCheckContainer").style.display = "table-row") : (document.getElementById("autoCheckOnDomainsContainer").style.display = "table-row", document.getElementById("autoCheckContainer").style.display = "none")
}

function init() {
    localize(), loadSettings(), location.href.match(/ref=dialog\-ignored\-errors/) && (document.getElementById("ignoredRulesDesc").classList.add("lt-options-toggle-visible"), document.getElementById("ignoredRules-options").classList.add("lt-options-visible"), document.getElementById("personalDictionary-link").classList.add("lt-options-toggle-visible"), document.getElementById("personalDictionary-options").classList.add("lt-options-visible"), document.getElementById("loginHeadline").classList.remove("lt-options-toggle-visible"), document.getElementById("login-options").classList.remove("lt-options-visible")), Tracker.trackPageView()
}

function logout() {
    const e = document.getElementById("login-success"),
        t = document.getElementById("login-error"),
        n = document.getElementById("username"),
        o = document.getElementById("password");
    storageController.updateSettings({
        username: "",
        password: "",
        token: "",
        havePremiumAccount: !1
    }).then(() => {
        Tracker.trackEvent("Action", "logout", username), e.style.display = "block", translateElement(e, "settingsLogoutSuccess")
    }).catch(() => {
        t.style.display = "block", translateElement(t, "settingsUnknownError")
    }).then(() => {
        n.disabled = !1, o.disabled = !1, storageController.checkForPaidSubscription().then(updatePremiumState)
    })
}

function login() {
    const e = document.getElementById("login-success"),
        t = document.getElementById("login-error"),
        n = document.getElementById("username"),
        o = document.getElementById("password"),
        l = n.value,
        a = o.value;
    e.style.display = "none", t.style.display = "none", n.disabled = !0, o.disabled = !0;
    const i = new URLSearchParams;
    i.append("data", JSON.stringify({
        text: "Test",
        metadata: {}
    })), i.append("username", l), i.append("language", "en"), i.append("password", a), fetch(`${config.PREMIUM_SERVER_URL}/check`, {
        method: "post",
        mode: "cors",
        body: i
    }).then(e => {
        if (!e.ok) throw "invalid login";
        return storageController.updateSettings({
            username: l,
            password: a,
            token: "",
            knownEmail: l,
            havePremiumAccount: !0,
            apiServerUrl: StorageController.DEFAULT_SETTINGS.apiServerUrl
        })
    }).then(() => (Tracker.trackEvent("Action", "login", l), e.style.display = "block", translateElement(e, "settingsLoginSuccess"), storageController.checkForPaidSubscription())).then(() => {
        updatePremiumState()
    }).catch(() => {
        Tracker.trackEvent("Action", "login_error", l), t.style.display = "block", translateElement(t, "settingsLoginError")
    }).then(() => {
        n.disabled = !1, o.disabled = !1
    })
}

function saveExperimentalSettings() {
    const e = document.getElementById("experimental-success"),
        t = document.getElementById("experimental-error");
    e.style.display = "none", t.style.display = "none";
    const n = document.getElementById("apiServerUrl").value;
    if (httpUrlRegExp.test(n)) {
        const o = document.getElementById("autoCheck").checked,
            l = Array.from(new Set(document.getElementById("ignoreCheckOnDomains").value.split("\n").filter(e => e.length > 0 && validURL(e)).map(e => getHostNameFromUrl(e) || e))),
            a = Array.from(new Set(document.getElementById("autoCheckOnDomains").value.split("\n").filter(e => e.length > 0 && validURL(e)).map(e => getHostNameFromUrl(e) || e)));
        storageController.getSettings().autoCheck !== o && Tracker.trackEvent("Action", `auto-check:${o?"activated":"deactivated"}`), storageController.updateSettings({
            otherServerUrl: document.getElementById("otherServerUrl").value,
            apiServerUrl: n,
            autoCheck: o,
            motherTongue: document.getElementById("motherTongue").value,
            enVariant: document.getElementById("variant-en").value,
            deVariant: document.getElementById("variant-de").value,
            ptVariant: document.getElementById("variant-pt").value,
            caVariant: document.getElementById("variant-ca").value,
            ignoreCheckOnDomains: l,
            autoCheckOnDomains: a
        }).then(() => {
            translateElement(e, "settingsExperimentalSuccess"), e.style.display = "block"
        }, e => {
            translateElement(t, "settingsUnknownError"), t.style.display = "block"
        })
    } else translateElement(t, "serverUrlIsInvalid"), t.style.display = "block"
}

function removeExperimentalHintMessage() {
    document.getElementById("experimental-success").style.display = "none"
}

function toggleServerType() {
    const e = document.getElementById("otherServerUrl"),
        t = document.getElementById("apiServerUrl");
    document.getElementById("serverTypeCloud").checked ? (e.style.display = "none", e.required = !1, t.value = config.MAIN_SERVER_URL, document.getElementById("localServerAvailabilityWarning").style.display = "none") : document.getElementById("serverTypeLocal").checked ? (e.style.display = "none", e.required = !1, t.value = config.LOCAL_SERVER_URL, checkLocalServerAvailability()) : document.getElementById("serverTypeOther").checked && (showOtherServerSetting(), document.getElementById("localServerAvailabilityWarning").style.display = "none")
}

function checkLocalServerAvailability(e) {
    e && e.preventDefault(), fetch(config.LOCAL_SERVER_URL + "/languages", {
        method: "GET",
        mode: "cors"
    }).then(() => {
        document.getElementById("localServerAvailabilityWarning").style.display = "none"
    }).catch(() => {
        document.getElementById("localServerAvailabilityWarning").style.display = "block"
    })
}

function showOtherServerSetting() {
    const e = document.getElementById("otherServerUrl");
    e.style.display = "block", e.required = !0, document.getElementById("apiServerUrl").value = e.value
}

function copyOtherServer() {
    const e = document.getElementById("otherServerUrl");
    document.getElementById("apiServerUrl").value = e.value
}

function toggleAutoCheckCheckbox() {
    toggleAutoCheck(this.checked)
}

function renderPersonalDictionary() {
    const e = storageController.getSettings().dictionary.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase()));
    updatePersonalDictionaryWords(e, e)
}

function updatePersonalDictionaryWords(e, t) {
    const n = document.getElementById("personalDictionary");
    if (n.innerHTML = "", e.length > 0) {
        for (const [t, o] of e.entries()) {
            const e = document.createElement("li");
            e.className = "lt-options__personalDictionary__item";
            const l = document.createElement("lt-span");
            l.textContent = o, l.className = "lt-options__personalDictionary__title", e.appendChild(l), n.appendChild(e);
            const a = document.createElement("span");
            a.className = "lt-options__personalDictionary__delete-button", a.dataset.index = t, e.appendChild(a), a.addEventListener("click", deletePersonalDictionaryButtonClick)
        }
        document.getElementById("personalDictionary-optionsInside").style.display = "block", document.getElementById("personalDictionary-options__emptyState").style.display = "none", document.getElementById("personalDictionary-options__emptySearch").style.display = "none"
    } else t.length > 0 ? (document.getElementById("personalDictionary-optionsInside").style.display = "none", document.getElementById("personalDictionary-options__emptyState").style.display = "none", document.getElementById("personalDictionary-options__emptySearch").style.display = "block") : (document.getElementById("personalDictionary-optionsInside").style.display = "none", document.getElementById("personalDictionary-options__emptyState").style.display = "block", document.getElementById("personalDictionary-options__emptySearch").style.display = "none")
}

function getSortedDictionary() {
    return storageController.getSettings().dictionary.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase()))
}

function addToPersonalDictionary() {
    const e = document.getElementById("personalDictionaryInput"),
        t = getSortedDictionary();
    e.value.trim() && (t.push(e.value), e.value = "", document.getElementById("addToPersonalDictionary").disabled = !0, storageController.updateSettings({
        dictionary: t
    }).then(renderPersonalDictionary))
}

function filterPersonalDictionary() {
    const e = document.getElementById("personalDictionaryInput").value,
        t = storageController.getSettings().dictionary.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase())),
        n = [];
    document.getElementById("addToPersonalDictionary").disabled = "" === e.trim();
    for (const o of t) o.indexOf(e) > -1 && n.push(o);
    updatePersonalDictionaryWords(n, t)
}

function clearPersonalDictionary() {
    confirm(browser.i18n.getMessage("settingsAreYouSure")) && (dictionary = [], storageController.updateSettings({
        dictionary: dictionary
    }).then(renderPersonalDictionary))
}

function deletePersonalDictionaryButtonClick(e) {
    const t = storageController.getSettings().dictionary.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase())),
        n = e.currentTarget.dataset.index;
    n && (t.splice(n, 1), storageController.updateSettings({
        dictionary: t
    }).then(renderPersonalDictionary))
}

function getDisabledDomains() {
    return storageController.getSettings().disabledDomains
}

function renderDisabledDomains() {
    const e = getDisabledDomains();
    updateDisabledDomains(e, e)
}

function updateDisabledDomains(e, t) {
    const n = browser.i18n.getMessage("settingsEnableDomain"),
        o = document.getElementById("disabledDomains");
    if (o.innerHTML = "", e.length > 0) {
        for (const [t, l] of e.entries()) {
            const e = document.createElement("li");
            e.className = "lt-options__rules__item";
            const a = document.createElement("lt-span");
            a.textContent = "- " + l, a.className = "lt-options__rules__title", e.appendChild(a), o.appendChild(e);
            const i = document.createElement("span");
            i.className = "lt-options__rules__enable-button", i.setAttribute("title", n), i.dataset.ruleId = l, i.textContent = n, e.appendChild(i), i.dataset.index = t, i.addEventListener("click", onEnableDomainButtonClick)
        }
        document.getElementById("disabledDomains-optionsInside").style.display = "block", document.getElementById("disabledDomains-options__emptyState").style.display = "none", document.getElementById("disabledDomains-options__emptySearch").style.display = "none"
    } else t.length > 0 ? (document.getElementById("disabledDomains-optionsInside").style.display = "none", document.getElementById("disabledDomains-options__emptyState").style.display = "none", document.getElementById("disabledDomains-options__emptySearch").style.display = "block") : (document.getElementById("disabledDomains-optionsInside").style.display = "none", document.getElementById("disabledDomains-options__emptyState").style.display = "block", document.getElementById("disabledDomains-options__emptySearch").style.display = "none")
}

function addToDisabledDomains() {
    const e = document.getElementById("disabledDomainsInput"),
        t = storageController.getSettings().disabledDomains;
    e.value.trim() && validURL(e.value) && -1 === t.indexOf(e.value) ? (t.push(e.value), e.value = "", document.getElementById("addToDisabledDomains").disabled = !0, storageController.updateSettings({
        disabledDomains: t
    }).then(renderDisabledDomains)) : alert(browser.i18n.getMessage("settingsDomainInvalid"))
}

function filterDisabledDomains() {
    const e = document.getElementById("disabledDomainsInput").value,
        t = storageController.getSettings().disabledDomains.sort((e, t) => e.toLowerCase().localeCompare(t.toLowerCase())),
        n = [];
    document.getElementById("addToDisabledDomains").disabled = "" === e.trim();
    for (const o of t) o.indexOf(e) > -1 && n.push(o);
    updateDisabledDomains(n, t)
}

function copyPersonalDictionary() {
    const e = getSortedDictionary(),
        t = document.createElement("textarea");
    t.value = e.join("\n"), document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t);
    const n = document.getElementById("personalDictionary-options__copyMessage");
    n.style.display = "block", wait(3e3).then(() => fadeOut(n, () => {
        n.style.display = "none", n.style.opacity = "1"
    }))
}

function clearAllDisabledDomains() {
    confirm(browser.i18n.getMessage("settingsAreYouSure")) && (disabledDomains = [], storageController.updateSettings({
        disabledDomains: disabledDomains
    }).then(renderDisabledDomains))
}

function onEnableDomainButtonClick(e) {
    const t = getDisabledDomains(),
        n = e.currentTarget.dataset.index;
    n && (t.splice(n, 1), storageController.updateSettings({
        disabledDomains: t
    }).then(renderDisabledDomains))
}

function renderIgnoredRules() {
    const e = storageController.getSettings().ignoredRules,
        t = browser.i18n.getMessage("enableRuleTooltip"),
        n = document.getElementById("ignoredRules");
    if (n.innerHTML = "", e.length > 0) {
        for (const o of e) {
            if (o.language) {
                const e = getUserLanguageCodes().some(e => e === o.language.toLowerCase());
                if (StorageController.DEFAULT_SETTINGS.ignoredRules.some(e => e.id === o.id) && !e) continue
            }
            const e = document.createElement("li");
            e.className = "lt-options__rules__item";
            const l = document.createElement("lt-span");
            l.textContent = "- " + (o.description || o.id), l.className = "lt-options__rules__title", e.appendChild(l), n.appendChild(e);
            const a = document.createElement("span");
            a.className = "lt-options__rules__enable-button", a.setAttribute("title", t), a.dataset.ruleId = o.id, a.textContent = t, e.appendChild(a), a.addEventListener("click", onEnableRuleButtonClick)
        }
        document.getElementById("ignoredRules-optionsInside").style.display = "block", document.getElementById("ignoredRules-options__emptyState").style.display = "none"
    } else document.getElementById("ignoredRules-optionsInside").style.display = "none", document.getElementById("ignoredRules-options__emptyState").style.display = "block"
}

function enableAllIgnoredRules() {
    storageController.updateSettings({
        ignoredRules: []
    }).then(renderIgnoredRules)
}

function showPrivacyLink() {
    document.getElementById("privacyPolicy").innerHTML = "<a target='_blank' href='https://languagetool.org/privacy/'>" + browser.i18n.getMessage("privacyPolicy") + "</a>"
}

function onEnableRuleButtonClick(e) {
    const t = e.currentTarget.dataset.ruleId;
    if (t) {
        const e = storageController.getSettings().ignoredRules.filter(e => e.id !== t);
        storageController.updateSettings({
            ignoredRules: e
        }).then(renderIgnoredRules)
    }
}
document.getElementById("experimental-options").addEventListener("change", removeExperimentalHintMessage), document.getElementById("serverTypeCloud").addEventListener("click", toggleServerType), document.getElementById("serverTypeLocal").addEventListener("click", toggleServerType), document.getElementById("serverTypeOther").addEventListener("click", toggleServerType), document.getElementById("retryLocalServer").addEventListener("click", checkLocalServerAvailability), document.getElementById("otherServerUrl").addEventListener("change", copyOtherServer), document.getElementById("autoCheck").addEventListener("click", toggleAutoCheckCheckbox), document.getElementById("personalDictionaryInput").addEventListener("keydown", e => {
    "Enter" === e.key && addToPersonalDictionary()
}), document.getElementById("addToPersonalDictionary").addEventListener("click", addToPersonalDictionary), document.getElementById("disabledDomainsInput").addEventListener("keydown", e => {
    "Enter" === e.key && addToDisabledDomains()
}), document.getElementById("addToDisabledDomains").addEventListener("click", addToDisabledDomains), document.getElementById("disabledDomainsInput").addEventListener("input", () => {
    setTimeout(filterDisabledDomains, 0)
}), document.getElementById("personalDictionaryInput").addEventListener("input", () => {
    setTimeout(filterPersonalDictionary, 0)
}), document.getElementById("disabledDomainsInput").addEventListener("paste", e => {
    if (e.target.value) return;
    const t = e.clipboardData.getData("text/plain");
    if (t) {
        const n = t.split(/\s+/),
            o = getDisabledDomains();
        n.length > 1 && (e.preventDefault(), n.forEach(e => {
            e.trim() && validURL(e) && -1 === o.indexOf(e) && o.push(e)
        }), storageController.updateSettings({
            disabledDomains: o
        }).then(renderDisabledDomains))
    }
}), document.getElementById("personalDictionaryInput").addEventListener("paste", e => {
    if (e.target.value) return;
    const t = e.clipboardData.getData("text/plain");
    if (t) {
        const n = getSortedDictionary(),
            o = t.split(/\s+/);
        o.length > 1 && (e.preventDefault(), o.forEach(e => {
            n.push(e.trim())
        }), storageController.updateSettings({
            dictionary: n
        }).then(renderPersonalDictionary))
    }
}), document.getElementById("personalDictionary-options__copy").addEventListener("click", copyPersonalDictionary), document.getElementById("disabledDomains-options__clearAll").addEventListener("click", clearAllDisabledDomains), document.getElementById("ignoredRules-options__clearAll").addEventListener("click", enableAllIgnoredRules), document.getElementById("personalDictionary-options__clearAll").addEventListener("click", clearPersonalDictionary), document.getElementById("ignoredRulesDesc").addEventListener("click", e => {
    e.currentTarget.classList.toggle("lt-options-toggle-visible"), document.getElementById("ignoredRules-options").classList.toggle("lt-options-visible")
}), document.getElementById("personalDictionary-link").addEventListener("click", e => {
    e.currentTarget.classList.toggle("lt-options-toggle-visible"), document.getElementById("personalDictionary-options").classList.toggle("lt-options-visible"), e.currentTarget.classList.contains("lt-options-toggle-visible") && document.querySelector("#personalDictionaryInput").focus()
}), document.getElementById("disabledDomainsDesc").addEventListener("click", e => {
    e.currentTarget.classList.toggle("lt-options-toggle-visible"), document.getElementById("disabledDomains-options").classList.toggle("lt-options-visible"), e.currentTarget.classList.contains("lt-options-toggle-visible") && document.querySelector("#disabledDomainsInput").focus()
}), document.getElementById("experimental-link").addEventListener("click", e => {
    e.currentTarget.classList.toggle("lt-options-toggle-visible"), document.getElementById("experimental-options").classList.toggle("lt-options-visible")
}), document.getElementById("loginHeadline").addEventListener("click", e => {
    e.currentTarget.classList.toggle("lt-options-toggle-visible"), document.getElementById("login-options").classList.toggle("lt-options-visible")
}), document.getElementById("login-options").addEventListener("submit", e => {
    e.preventDefault(), login()
}), document.getElementById("logout").addEventListener("click", e => {
    e.preventDefault(), logout()
}), document.getElementById("experimental-options").addEventListener("submit", e => {
    e.preventDefault(), saveExperimentalSettings()
});
const isGerman = getUserLanguageCodes().some(e => e.startsWith("de"));
isGerman && (document.querySelector("#made-in-potsdam").style.display = "inline");