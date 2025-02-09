/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class LTAssistant {
    constructor(e) {
        if (this._instances = [], this._otherSpellCheckers = new Map, BrowserDetector.isUnsupportedChrome() || BrowserDetector.isUnsupportedFirefox() || !document.documentElement || "HTML" !== document.documentElement.nodeName) return;
        this._options = e, this._behaviorTweaks = TweaksManager.getTweaks(getCurrentUrl()), this._behaviorTweaks.init();
        const t = this._behaviorTweaks.supported(), n = this._behaviorTweaks.unsupportedMessage();
        if (this._onMessage = bindAndCatch(this._onMessage, this), !t) return browser.runtime.sendMessage({
            command: "PAGE_LOADED",
            enabled: !0,
            capitalization: !0,
            supported: t,
            unsupportedMessage: n
        }),
            void browser.runtime.onMessage.addListener(this._onMessage);
        this._validateInstanceDebounce = new Debounce(bindAndCatch(this._validateInstance, this),
            config.VALIDATION_DEBOUNCE_TIMEOUT), this._onDocumentClick = bindAndCatch(this._onDocumentClick, this),
            this._onDocumentFocus = bindAndCatch(this._onDocumentFocus, this),
            this._onTextChanged = bindAndCatch(this._onTextChanged, this),
            this._onInputScroll = bindAndCatch(this._onInputScroll, this),
            this._onBlockClicked = bindAndCatch(this._onBlockClicked, this),
            this._onPermissionRequiredIconClicked = bindAndCatch(this._onPermissionRequiredIconClicked, this),
            this._onToggleDialog = bindAndCatch(this._onToggleDialog, this),
            this._onPremiumIconVisible = bindAndCatch(this._onPremiumIconVisible, this),
            this._onLanguageChanged = bindAndCatch(this._onLanguageChanged, this),
            this._enableHere = bindAndCatch(this._enableHere, this),
            this._enableEverywhere = bindAndCatch(this._enableEverywhere, this),
            this._onErrorSelected = bindAndCatch(this._onErrorSelected, this),
            this._onTurnOffClicked = bindAndCatch(this._onTurnOffClicked, this),
            this._onOptionsOpen = bindAndCatch(this._onOptionsOpen, this),
            this._onAddToDictionaryClicked = bindAndCatch(this._onAddToDictionaryClicked, this),
            this._onDialogDestroyed = bindAndCatch(this._onDialogDestroyed, this),
            this._onFixSelected = bindAndCatch(this._onFixSelected, this),
            this._onIgnoreRuleClicked = bindAndCatch(this._onIgnoreRuleClicked, this),
            this._onTemporarilyIgnoreRule = bindAndCatch(this._onTemporarilyIgnoreRule, this),
            this._onTemporarilyIgnoreWord = bindAndCatch(this._onTemporarilyIgnoreWord, this),
            this._onErrorCardDestroyed = bindAndCatch(this._onErrorCardDestroyed, this),
            this._onSettingsChanged = bindAndCatch(this._onSettingsChanged, this),
            this._onUiStateChanged = bindAndCatch(this._onUiStateChanged, this),
            this._onShowFeedbackForm = bindAndCatch(this._onShowFeedbackForm, this),
            this._onPrivacySettingsChanged = bindAndCatch(this._onPrivacySettingsChanged, this),
            this._onDestroy = bindAndCatch(this.destroy, this),
            this._onMoreDetailsClicked = bindAndCatch(this._onMoreDetailsClicked, this),
            this._onBadgeClicked = bindAndCatch(this._onBadgeClicked, this),
            this._onLogoClicked = bindAndCatch(this._onLogoClicked, this),
            this._onPageHide = bindAndCatch(this._onPageHide, this),
            this._sendPageLoaded = bindAndCatch(this._sendPageLoaded, this),
            this._checkExtensionHealthInterval = window.setInterval(bindAndCatch(this._checkExtensionHealth, this), config.CHECK_EXTENSION_HEALTH_INTERVAL),
            document.addEventListener(LTAssistant.eventNames.destroy, this._onDestroy),
            window.addEventListener("pageshow", this._sendPageLoaded),
            window.addEventListener("pagehide", this._onPageHide),
            this._storageController = new StorageController(bindAndCatch(() => {
                this._sendPageLoaded();
                const e = document.querySelector(":focus");
                e && this._initInstance(e, !0),
                    document.body && hasFirefoxDesignMode(document.body) && this._initInstance(document.body, !0),
                    window._ltLastActiveElement && (this._initInstance(window._ltLastActiveElement, !1), window._ltLastActiveElement = null),
                    browser.runtime.onMessage.addListener(this._onMessage), document.addEventListener("click", this._onDocumentClick, !0),
                    document.addEventListener("focus", this._onDocumentFocus, !0),
                    BrowserDetector.isChromium() && window.innerHeight > 10 && (this._tinyMceInterval = window.setInterval(() => this._checkForIframeWithoutContentScripts(), 2e3)),
                    window.frameElement && window.frameElement.ownerDocument && window.frameElement.ownerDocument.addEventListener("click", this._onDocumentClick, !0),
                    document.addEventListener(InputAreaWrapper.eventNames.textChanged, this._onTextChanged),
                    document.addEventListener(InputAreaWrapper.eventNames.scroll, this._onInputScroll),
                    document.addEventListener(Highlighter.eventNames.blockClicked, this._onBlockClicked),
                    document.addEventListener(Toolbar.eventNames.permissionRequiredIconClicked, this._onPermissionRequiredIconClicked),
                    document.addEventListener(Toolbar.eventNames.toggleDialog, this._onToggleDialog),
                    document.addEventListener(Toolbar.eventNames.notifyAboutPremiumIcon, this._onPremiumIconVisible),
                    document.addEventListener(Dialog.eventNames.changeLanguage, this._onLanguageChanged),
                    document.addEventListener(Dialog.eventNames.enableHere, this._enableHere),
                    document.addEventListener(Dialog.eventNames.enableEverywhere, this._enableEverywhere),
                    document.addEventListener(Dialog.eventNames.errorSelected, this._onErrorSelected),
                    document.addEventListener(Dialog.eventNames.fixSelected, this._onFixSelected),
                    document.addEventListener(Dialog.eventNames.turnOff, this._onTurnOffClicked),
                    document.addEventListener(Dialog.eventNames.addToDictionaryClicked, this._onAddToDictionaryClicked),
                    document.addEventListener(Dialog.eventNames.ignoreRuleClicked, this._onIgnoreRuleClicked),
                    document.addEventListener(Dialog.eventNames.temporarilyIgnoreWordClicked, this._onTemporarilyIgnoreWord),
                    document.addEventListener(Dialog.eventNames.temporarilyIgnoreRuleClicked, this._onTemporarilyIgnoreRule),
                    document.addEventListener(Dialog.eventNames.moreDetailsClicked, this._onMoreDetailsClicked),
                    document.addEventListener(Dialog.eventNames.openOptions, this._onOptionsOpen),
                    document.addEventListener(Dialog.eventNames.showFeedbackForm, this._onShowFeedbackForm),
                    document.addEventListener(Dialog.eventNames.destroyed, this._onDialogDestroyed),
                    document.addEventListener(ErrorCard.eventNames.fixSelected, this._onFixSelected),
                    document.addEventListener(ErrorCard.eventNames.addToDictionaryClicked, this._onAddToDictionaryClicked),
                    document.addEventListener(ErrorCard.eventNames.ignoreRuleClicked, this._onIgnoreRuleClicked),
                    document.addEventListener(ErrorCard.eventNames.temporarilyIgnoreWordClicked, this._onTemporarilyIgnoreWord),
                    document.addEventListener(ErrorCard.eventNames.temporarilyIgnoreRuleClicked, this._onTemporarilyIgnoreRule),
                    document.addEventListener(ErrorCard.eventNames.destroyed, this._onErrorCardDestroyed),
                    document.addEventListener(ErrorCard.eventNames.moreDetailsClicked, this._onMoreDetailsClicked),
                    document.addEventListener(ErrorCard.eventNames.badgeClicked, this._onBadgeClicked),
                    document.addEventListener(ErrorCard.eventNames.logoClicked, this._onLogoClicked),
                    this._storageController.addEventListener(StorageController.eventNames.settingsChanged, this._onSettingsChanged),
                    this._storageController.addEventListener(StorageController.eventNames.privacySettingsChanged, this._onPrivacySettingsChanged),
                    this._storageController.addEventListener(StorageController.eventNames.uiStateChanged, this._onUiStateChanged)
            }, this))
    }
    static _isStartWithUppercase(e) {
        const t = e.charAt(0);
        return t === t.toUpperCase() && t !== t.toLowerCase()
    }
    static "_toLowerсaseFirstChar"(e) {
        return e.charAt(0).toLowerCase() + e.substr(1)
    }
    static _isErrorIgnoredByDictionary(e, t) {
        if (!e.isSpellingError) return !1;
        let n = e.misspelledWord;
        if (/^\w+\.$/.test(n) && (n = n.substring(0, n.length - 1)), t.includes(n)) return !0;
        if (LTAssistant._isStartWithUppercase(n)) {
            const e = LTAssistant._toLowerсaseFirstChar(n);
            if (t.includes(e)) return !0
        }
        return !1
    }
    static _isErrorRuleIgnored(e, t) {
        const n = getPrimaryLanguageCode(e.language.code);
        return !!t.find(t => t.id === e.rule.id && ("*" === t.language || t.language === n))
    }
    static _getTextChanges(e, t, n) {
        const r = getParagraphsDiff(e, t),
            i = [];
        for (const e of n) {
            const t = Object.assign({}, e),
                n = t.offset,
                s = t.offset + t.length;
            let o = !0;
            for (const e of r)
                if (null !== e.oldText) {
                    const r = e.oldOffset,
                        i = e.oldOffset + e.oldText.length + 1;
                    if (isIntersect(n, s, r, i)) {
                        if (null !== e.textDiff) {
                            const r = e.oldOffset + e.textDiff.from,
                                i = r + e.textDiff.oldFragment.length;
                            if (isIntersect(n, s, r, i, !0)) {
                                o = !1;
                                break
                            }
                            if (n > i) {
                                const n = e.textDiff.newFragment.length - e.textDiff.oldFragment.length;
                                t.offset += n
                            }
                        }
                        t.offset += e.newOffset - e.oldOffset
                    }
                }
            o && i.push(t)
        }
        const s = r.filter(e => e.oldText !== e.newText && null !== e.newText).map(e => ({
            text: e.newText,
            offset: e.newOffset
        }));
        return {
            changedParagraphs: s,
            nonAffectedErrors: i,
            isAllTextChanged: s.map(e => e.text).join("\n") === t
        }
    }
    static _getRemainedErrors(e, t) {
        const n = [];
        for (const r of e) {
            const e = Object.assign({}, r),
                i = e.offset,
                s = e.offset + e.length;
            let o = !0;
            for (const e of t) {
                const t = e.offset,
                    n = e.offset + e.text.length + 1;
                if (isIntersect(i, s, t, n)) {
                    o = !1;
                    break
                }
            }
            o && n.push(Object.assign({}, e))
        }
        return n
    }
    _getDomainState() {
        const e = getMainPageHostname();
        return this._storageController.getValidationSettings(e)
    }
    _sendPageLoaded() {
        const e = this._behaviorTweaks.supported(),
            t = this._behaviorTweaks.unsupportedMessage(),
            n = this._getDomainState();
        browser.runtime.sendMessage({
            command: "PAGE_LOADED",
            enabled: !n.isDisabled,
            capitalization: n.shouldCapitalizationBeChecked,
            supported: e,
            unsupportedMessage: t
        })
    }
    _checkForIframeWithoutContentScripts() {
        if (!document.activeElement || "IFRAME" !== document.activeElement.nodeName) return;
        const e = document.activeElement.contentWindow;
        let t = !1;
        try {
            t = !!e.location.href
        } catch (e) { }
        t && (e.__ltLoaded || "complete" !== e.document.readyState || e.document.documentElement && !e.document.documentElement.hasAttribute("data-lt-installed") && e.document.body && isTinyMCE(e.document.body) && (e.__ltLoaded = !0, loadContentScripts(e)))
    }
    _setDisplayedErrors(e, t) {
        const n = e.displayedErrors;
        if (e.pendingErrors = [], e.displayedErrors = [], 0 === t.length) return;
        const {
            dictionary: r,
            ignoredRules: i
        } = this._storageController.getSettings(), s = e.validatedText, o = e.inputAreaWrapper.getSelection();
        t.forEach(t => {
            if (!(LTAssistant._isErrorIgnoredByDictionary(t, r) || LTAssistant._isErrorIgnoredByDictionary(t, e.ignoredWords) || LTAssistant._isErrorRuleIgnored(t, i) || LTAssistant._isErrorRuleIgnored(t, e.ignoredRules))) {
                if (e.isTyping) {
                    const r = !n.some(e => e.offset === t.offset);
                    if (r && t.contextForSureMatch) {
                        const n = s.substr(t.offset + t.length, 100),
                            r = !!n.match(LTAssistant.PUNCTUATION_REG_EXP) || !!t.originalPhrase.match(LTAssistant.PUNCTIUATION_CHAR_REG_EXP);
                        if (-1 === t.contextForSureMatch && !r) return void e.pendingErrors.push(t);
                        if (!r) {
                            if (n.split(/\s+/).length - 1 < t.contextForSureMatch) return void e.pendingErrors.push(t)
                        }
                    }
                    const i = o && (o.start === t.offset || o.end === t.offset + t.length);
                    if (r && i) return void e.pendingErrors.push(t)
                }
                e.displayedErrors.push(t)
            }
        })
    }
    _setHiddenErrors(e, t) {
        const n = e.displayedHiddenErrors;
        if (e.pendingHiddenErrors = [], e.displayedHiddenErrors = [], 0 === t.length) return;
        const r = e.validatedText,
            i = e.inputAreaWrapper.getSelection();
        t.forEach(t => {
            if (e.isTyping) {
                const s = !n.some(e => e.offset === t.offset);
                if (s && t.contextForSureMatch) {
                    const n = r.substr(t.offset + t.length, 100),
                        i = !!n.match(LTAssistant.PUNCTUATION_REG_EXP) || !!t.originalPhrase.match(LTAssistant.PUNCTIUATION_CHAR_REG_EXP);
                    if (-1 === t.contextForSureMatch && !i) return void e.pendingHiddenErrors.push(t);
                    if (!i) {
                        if (n.split(/\s+/).length - 1 < t.contextForSureMatch) return void e.pendingHiddenErrors.push(t)
                    }
                }
                const o = i && (i.start === t.offset || i.end === t.offset + t.length);
                if (s && o) return void e.pendingHiddenErrors.push(t)
            }
            e.displayedHiddenErrors.push(t)
        })
    }
    _getIgnoredErrorsStats(e) {
        const {
            dictionary: t,
            ignoredRules: n
        } = this._storageController.getSettings(), r = [], i = [];
        return e.forEach(e => {
            e.isSpellingError && LTAssistant._isErrorIgnoredByDictionary(e, t) && !r.includes(e.misspelledWord) && r.push(e.misspelledWord), e.isSpellingError || !LTAssistant._isErrorRuleIgnored(e, n) || i.includes(e.rule.id) || i.push(e.rule.id)
        }), {
            byDictionary: r.length,
            byRules: i.length
        }
    }
    _initInstance(e, t = !0) {
        e.parentElement &&
            (
                this._instances.some(t => t.targetElement === e) ||
                this._getDomainState().isDisabled ||
                this._behaviorTweaks.isElementCompatible(e) &&
                (
                    this._disableOtherSpellCheckers(e), clearTimeout(this._initTimeout),
                    this._initTimeout = window.setTimeout(() => {
                        if (t && !hasFocus(e)) return void this._enableOtherSpellCheckers(e);
                        const n = Math.round(99999 * Math.random()) + ":" + Date.now(),
                            r = isCEElement(e) ? null : new Mirror(e),
                            i = new InputAreaWrapper(e, r ? r.getCloneElement() : e, this._behaviorTweaks.getParsingDetector(e)),
                            s = new Highlighter(e, i, r ? r.getCloneElement() : e, this._behaviorTweaks.getHighlighterAppearance(e), !!r),
                            o = new Toolbar(e, this._behaviorTweaks.getToolbarAppearance(e), r),
                            a = {
                                id: n,
                                group: location.pathname,
                                targetElement: e,
                                mirror: r,
                                inputAreaWrapper: i,
                                highlighter: s,
                                toolbar: o,
                                errorCard: null,
                                dialog: null,
                                requestStatus: REQUEST_STATUS.COMPLETED,
                                isRemoteCheckAllowed: this._storageController.getPrivacySettings().allowRemoteCheck,
                                isAutoCheckEnabled: this._getDomainState().isAutoCheckEnabled,
                                isConnected: !0,
                                isTyping: !1,
                                isValidating: !1,
                                isIncompleteResult: !1,
                                isTextTooLong: !1,
                                exception: null,
                                language: null,
                                forceLanguage: !1,
                                isSupportedLanguage: !0,
                                lastValidation: 0,
                                validatedText: "",
                                allErrors: [],
                                displayedErrors: [],
                                pendingErrors: [],
                                allHiddenErrors: [],
                                displayedHiddenErrors: [],
                                displayedHiddenErrorCount: 0,
                                pendingHiddenErrors: [],
                                selectedErrorId: null,
                                temporaryDisabledErrorId: null,
                                ignoredRules: [],
                                ignoredWords: [],
                                tracking: {
                                    sawPremiumIcon: !1,
                                    hasEnoughText: !1,
                                    language: null,
                                    hasTracked: !1,
                                    textLength: 0
                                }
                            };
                        this._instances.push(a),
                            this.updateState(a),
                            this._validateInstance(a),
                            onElementDisabled(e, () => this._destroyInstance(a)),
                            onElementRemoved(e, () => this._destroyInstance(a))
                    }, 150)
                )
            )
    }
    _validateInstance(e, t, n, r = !1) {
        if (!e.isRemoteCheckAllowed || !e.isAutoCheckEnabled) return;
        if (-1 === this._instances.indexOf(e)) return;
        void 0 === t && (t = e.inputAreaWrapper.getText(), n = LTAssistant._getTextChanges(e.validatedText, t, e.allErrors)), e.isTextTooLong = !1, e.exception = null;
        const { hasPaidSubscription: i } = this._storageController.getUIState();
        if (!i && !this._storageController.isUsedCustomServer() && t.length > config.MAX_TEXT_LENGTH)
            return e.isValidating = !1,
                e.isTextTooLong = !0,
                e.allErrors = [],
                e.allHiddenErrors = [],
                this._setDisplayedErrors(e, e.allErrors),
                this._setHiddenErrors(e, e.allHiddenErrors),
                this._leaveTypingMode(e),
                this._highlight(e),
                this.updateState(e),
                void (e.validatedText = "");
        e.isValidating = !0,
            e.lastValidation = Date.now(),
            e.isSupportedLanguage || (e.isSupportedLanguage = !0, e.forceLanguage || (e.language = null)),
            this.updateState(e),
            !e.forceLanguage && n.isAllTextChanged && (e.language = null),
            this._behaviorTweaks.getRecipientInfo(e.targetElement).then(i => {
                const s = {
                    instanceId: e.id,
                    url: getCurrentUrl(),
                    recipientInfo: i
                },
                    o = {
                        command: "VALIDATE_TEXT",
                        text: t,
                        changedParagraphs: n.changedParagraphs,
                        language: e.language,
                        forceLanguage: e.forceLanguage,
                        userLanguageCodes: getUserLanguageCodes(),
                        elementLanguage: e.targetElement.lang,
                        hasUserChangedLanguage: r,
                        metaData: s
                    };
                browser.runtime.sendMessage(o).then(e => {
                    e && "VALIDATION_COMPLETED" === e.command ? this._onValidationCompleted(e) : e && "VALIDATION_FAILED" === e.command && this._onValidationFailed(e)
                }).catch(t => {
                    e.isValidating = !1,
                        Tracker.trackError("message", t.message, o.command),
                        (t.message && t.message.startsWith("Invocation of form runtime.connect(null, ) doesn't match definition runtime.connect") || t.message.startsWith("Extension context invalidated.")) &&
                        this._instances.forEach(e => {
                            e.isConnected = !1, e.highlighter && e.highlighter.destroy()
                        }), this.updateState(e)
                })
            })
    }
    _revalidateInstance(e, t, n = !1) {
        e.language = t, e.forceLanguage = n, e.validatedText = "", e.allErrors = [], e.displayedErrors = [], e.allHiddenErrors = [], e.displayedHiddenErrors = [], this._highlight(e), this._hideAllErrorCards(), this._validateInstance(e, void 0, void 0, n)
    }
    _destroyInstance(e) {
        const t = this._instances.indexOf(e); - 1 !== t && (t > -1 && this._instances.splice(t, 1), e.inputAreaWrapper.destroy(), e.highlighter.destroy(), e.toolbar.destroy(), clearTimeout(e.typingTimeout), e.mirror && e.mirror.destroy(), e.errorCard && e.errorCard.destroy(), e.dialog && e.dialog.destroy(), this._enableOtherSpellCheckers(e.targetElement), this._savePremiumErrorCount(e), this._trackInstance(e))
    }
    updateState(e, t = "") {
        let n = REQUEST_STATUS.COMPLETED,
            r = "";
        e.isConnected ? e.isValidating || e.isTyping ? n = REQUEST_STATUS.IN_PROGRESS : e.exception ? (n = REQUEST_STATUS.FAILED, r = e.exception.message) : e.isTextTooLong ? n = REQUEST_STATUS.TEXT_TOO_LONG : e.isSupportedLanguage ? e.isAutoCheckEnabled ? e.isRemoteCheckAllowed ? e.validatedText.length < config.MIN_TEXT_LENGTH && (n = REQUEST_STATUS.TEXT_TOO_SHORT) : n = REQUEST_STATUS.PERMISSION_REQUIRED : n = REQUEST_STATUS.DISABLED : n = REQUEST_STATUS.UNSUPPORTED_LANGUAGE : n = REQUEST_STATUS.DISCONNECTED, e.requestStatus = n;
        const i = {
            requestStatus: n,
            errorsCount: e.displayedErrors.length,
            hiddenErrorsCount: e.displayedHiddenErrors.length,
            isIncompleteResult: e.isIncompleteResult,
            languageName: t,
            exceptionMessage: r
        };
        if (e.toolbar.updateState(i), e.dialog) {
            const i = {
                requestStatus: n,
                languageName: t,
                errors: e.displayedErrors,
                hiddenErrors: e.displayedHiddenErrors,
                ignoredErrorsStats: this._getIgnoredErrorsStats(e.allErrors),
                isIncompleteResult: e.isIncompleteResult,
                exceptionMessage: r
            };
            e.dialog.updateState(i)
        }
        e.displayedHiddenErrorCount = Math.max(e.displayedHiddenErrorCount, e.displayedHiddenErrors.length), dispatchCustomEvent(LTAssistant.eventNames.updateState, {
            requestStatus: n,
            exceptionMessage: r,
            languageName: t,
            errors: e.displayedErrors,
            hiddenErrors: e.displayedHiddenErrors,
            isIncompleteResult: e.isIncompleteResult
        })
    }
    _highlight(e) {
        const t = e.displayedErrors.map(t => {
            let n = config.COLORS.GRAMMAR.UNDERLINE,
                r = config.COLORS.GRAMMAR.BACKGROUND;
            return t.isSpellingError ? (n = config.COLORS.SPELLING.UNDERLINE, r = config.COLORS.SPELLING.BACKGROUND) : t.isStyleError && (n = config.COLORS.STYLE.UNDERLINE, r = config.COLORS.STYLE.BACKGROUND), {
                id: t.id,
                offset: t.offset,
                length: t.length,
                isEmphasized: t.id === e.selectedErrorId,
                backgroundColor: r,
                isUnderlined: !0,
                underlineColor: n
            }
        });
        e.highlighter.highlight(t)
    }
    _showErrorCard(e, t, n) {
        this._hideAllErrorCards(), e.errorCard = new ErrorCard(n, t, e.targetElement, this._storageController.getUIState().hasPaidSubscription)
    }
    _hideAllErrorCards() {
        this._instances.forEach(e => {
            e.errorCard && e.errorCard.destroy()
        })
    }
    _showDialog(e) {
        this._hideAllErrorCards(), this._hideAllDialogs(), e.dialog = new Dialog(e.toolbar.getContainer(), e.language && e.language.code, {
            requestStatus: e.requestStatus,
            errors: e.displayedErrors,
            hiddenErrors: e.displayedHiddenErrors,
            ignoredErrorsStats: this._getIgnoredErrorsStats(e.allErrors),
            isIncompleteResult: e.isIncompleteResult,
            exceptionMessage: e.exception && e.exception.message || ""
        }, this._storageController.getUIState())
    }
    _hideAllDialogs() {
        this._instances.forEach(e => {
            e.dialog && e.dialog.destroy()
        })
    }
    _showTurnOnHint() {
        if (window.parent !== window) browser.runtime.sendMessage({
            command: "SHOW_TURN_ON_HINT"
        });
        else {
            const e = document.createElement("lt-hint"),
                t = document.createElement("lt-div");
            t.classList.add("lt-hint__wrapper");
            const n = document.createElement("lt-div");
            n.classList.add("lt-hint__message"), n.textContent = browser.i18n.getMessage("turnOnHint");
            const r = document.createElement("lt-div");
            r.classList.add("lt-hint__arrow"), t.appendChild(n), t.appendChild(r), e.appendChild(t), (document.body.isContentEditable ? document.documentElement : document.body).appendChild(e), setAnimationFrameTimeout(() => {
                fadeOutAndRemove(e)
            }, 5e3)
        }
    }
    _enableHere(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        t && (t.isAutoCheckEnabled = !0, this._revalidateInstance(t, t.language), Tracker.trackEvent("Action", "check_trigger:manually_triggered"))
    }
    _enableEverywhere(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        t && (t.isAutoCheckEnabled = !0, this._revalidateInstance(t, t.language), this._storageController.updateSettings({
            autoCheck: !0,
            ignoreCheckOnDomains: []
        }), Tracker.trackEvent("Action", "enable_everywhere"))
    }
    _onTextChanged(e) {
        const t = e.detail.inputAreaWrapper, n = this._instances.find(e => e.inputAreaWrapper === t);
        if (!n) return;
        if (!n.isConnected || !n.isRemoteCheckAllowed || !n.isAutoCheckEnabled) return;
        this._hideAllErrorCards(),
            this._enterTypingMode(n);
        const r = e.detail.text;
        if (n.exception = null, r.trim().length < config.MIN_TEXT_LENGTH)
            n.language = n.forceLanguage ? n.language : null,
                n.isValidating = !1,
                n.isTextTooLong = !1,
                n.allErrors = [],
                n.allHiddenErrors = [],
                this._setDisplayedErrors(n, n.allErrors),
                this._setHiddenErrors(n, n.allHiddenErrors),
                this._leaveTypingMode(n),
                this._highlight(n),
                this.updateState(n),
                n.validatedText = r,
                this._validateInstanceDebounce.cancelCall();
        else if (r === n.validatedText)
            n.isValidating = !1,
                this._setDisplayedErrors(n, n.allErrors),
                this._setHiddenErrors(n, n.allHiddenErrors),
                this._highlight(n), this.updateState(n),
                this._validateInstanceDebounce.cancelCall();
        else {
            const e = LTAssistant._getTextChanges(n.validatedText, r, n.allErrors);
            n.isValidating = !0,
                n.isTextTooLong = !1,
                this._setDisplayedErrors(n, e.nonAffectedErrors),
                this._setHiddenErrors(n, n.allHiddenErrors),
                this._highlight(n),
                this.updateState(n),
                Date.now() - n.lastValidation > config.INTERMEDIATE_VALIDATION_INTERVAL ? (this._validateInstanceDebounce.cancelCall(), this._validateInstance(n, r, e)) : this._validateInstanceDebounce.call(n, r, e)
        }
    }
    _enterTypingMode(e) {
        e.isTyping = !0, clearTimeout(e.typingTimeout), e.typingTimeout = window.setTimeout(() => {
            this._leaveTypingMode(e), this._setDisplayedErrors(e, e.allErrors), this._setHiddenErrors(e, e.allHiddenErrors), this._highlight(e), this.updateState(e, e.language && e.language.code || "")
        }, config.STOPPED_TYPING_TIMEOUT)
    }
    _leaveTypingMode(e) {
        e.isTyping = !1, clearTimeout(e.typingTimeout)
    }
    _onInputScroll() {
        window.requestAnimationFrame(() => this._hideAllErrorCards())
    }
    _onMessage(e) {
        switch (e.command) {
            case "GET_SELECTED_TEXT":
                {
                    const e = getSelectedText();
                    if (e) return Promise.resolve({
                        selectedText: e
                    });
                    break
                }
            case "SHOW_TURN_ON_HINT":
                this._showTurnOnHint();
                break;
            case "HIGHLIGHT_GOOGLE_DOCS_PLUGIN":
                document.documentElement.classList.add("lt-google-docs-highlight");
                break;
            case "DESTROY":
                this.destroy()
        }
        return !1
    }
    _onUnsupportedLanguage(e, t) {
        e.isSupportedLanguage = !1, e.isIncompleteResult = !1, e.validatedText = t.text, e.allErrors = [], e.allHiddenErrors = [], this._setDisplayedErrors(e, e.allErrors), this._setHiddenErrors(e, e.allHiddenErrors), e.selectedErrorId = null, e.language = t.language, e.forceLanguage = !1, e.errorCard && e.errorCard.destroy(), e.dialog && (e.dialog.destroy(), e.dialog = null), this._highlight(e), this.updateState(e, t.language.code)
    }
    _onValidationCompleted(e) {
        const t = this._instances.find(t => t.id === e.instanceId);
        if (t)
            if (t.isValidating = !1, e.isUnsupportedLanguage) this._onUnsupportedLanguage(t, e);
            else if (e.language && !t.language && (t.language = e.language), e.text.length > config.MIN_TEXT_LENGTH && (t.tracking.language = e.language ? e.language.code : null, t.tracking.hasEnoughText = !0), t.tracking.textLength = Math.max(e.text.length, t.tracking.textLength), t.dialog && e.language && t.dialog.setCurrentLanguage(e.language.code), t.forceLanguage || !e.language || e.language.code.toLowerCase() === t.language.code.toLowerCase()) {
                let n = t.allErrors.slice(0),
                    r = t.allHiddenErrors.slice(0);
                n = n.filter(e => e.isPartialValidation), r = r.filter(e => e.isPartialValidation);
                let i = LTAssistant._getTextChanges(t.validatedText, e.text, n),
                    s = LTAssistant._getTextChanges(t.validatedText, e.text, r);
                n = LTAssistant._getRemainedErrors(i.nonAffectedErrors, i.changedParagraphs), r = LTAssistant._getRemainedErrors(s.nonAffectedErrors, s.changedParagraphs), n = n.concat(e.partialValidationErrors), r = r.concat(e.partialValidationHiddenErrors);
                for (const t of e.validationErrors) n.some(e => e.offset === t.offset && e.length === t.length) || n.push(t);
                for (const t of e.validationHiddenErrors) r.some(e => e.offset === t.offset && e.length === t.length) || r.push(t);
                n.sort((e, t) => e.offset > t.offset ? 1 : -1);
                for (let e = 0; e < n.length; e++) n[e].id = e + 1;
                r.sort((e, t) => e.offset > t.offset ? 1 : -1);
                for (let e = 0; e < r.length; e++) r[e].id = e + 1;
                const o = t.inputAreaWrapper.getText();
                i = LTAssistant._getTextChanges(e.text, o, n), s = LTAssistant._getTextChanges(e.text, o, r), t.validatedText = e.text, t.allErrors = n, t.allHiddenErrors = r, t.isIncompleteResult = e.isIncompleteResult, this._setDisplayedErrors(t, i.nonAffectedErrors), this._setHiddenErrors(t, s.nonAffectedErrors), t.pendingErrors.length || t.pendingHiddenErrors.length || this._leaveTypingMode(t), this._highlight(t), this.updateState(t)
            } else this._revalidateInstance(t, e.language)
    }
    _onValidationFailed(e) {
        const t = this._instances.find(t => t.id === e.instanceId);
        if (t) {
            if (
                t.isValidating = !1,
                t.isIncompleteResult = !1,
                t.exception = e.exception,
                t.validatedText = "",
                t.allErrors = [],
                t.displayedErrors = [],
                t.pendingErrors = [],
                t.allHiddenErrors = [],
                t.displayedHiddenErrors = [],
                t.pendingHiddenErrors = [],
                e && e.exception && void 0 !== e.exception.status)
                this._storageController.isUsedCustomServer() || Tracker.trackError("http", `${e.exception.status}: ${e.exception.response}`);
            else if (e && e.exception && e.exception.message) {
                const n = e.exception;
                t.exception = {
                    message: browser.i18n.getMessage("statusIconError")
                };
                const r = generateStackTrace(n);
                Tracker.trackError("js", n.message, r || "")
            } else Tracker.trackError("http", "unknown");
            this._highlight(t), this.updateState(t)
        }
    }
    _onDocumentFocus(e) {
        e.target instanceof HTMLElement && this._initInstance(e.target), e.target === document && document.body && hasFirefoxDesignMode(document.body) && this._initInstance(document.body)
    }
    _onDocumentClick(e) {
        if (this._behaviorTweaks.isClickIgnored(e)) return;
        closestElement(e.target, ErrorCard.CONTAINER_ELEMENT_NAME) || this._hideAllErrorCards(), closestElement(e.target, `${Dialog.CONTAINER_ELEMENT_NAME}, ${Toolbar.CONTAINER_ELEMENT_NAME}`) || this._hideAllDialogs()
    }
    _disableOtherSpellCheckers(e) {
        if (this._otherSpellCheckers.get(e)) return;
        const t = {
            spellcheck: e.getAttribute("spellcheck"),
            "data-gramm": e.getAttribute("data-gramm")
        };
        e.setAttribute("spellcheck", "false"), e.setAttribute("data-gramm", "false");
        const n = new MutationObserver(() => {
            "false" === e.getAttribute("spellcheck") && "false" === e.getAttribute("data-gramm") || (e.setAttribute("spellcheck", "false"), e.setAttribute("data-gramm", "false"))
        });
        n.observe(e, {
            attributes: !0,
            attributeFilter: ["spellcheck", "data-gramm"]
        }), this._otherSpellCheckers.set(e, {
            originalAttributes: t,
            mutationObserver: n
        })
    }
    _enableOtherSpellCheckers(e) {
        const t = this._otherSpellCheckers.get(e);
        if (t) {
            t.mutationObserver.disconnect();
            for (const n in t.originalAttributes) {
                const r = t.originalAttributes[n];
                t.originalAttributes[n] ? e.setAttribute(n, r) : e.removeAttribute(n)
            }
            this._otherSpellCheckers.delete(e)
        }
    }
    _onBlockClicked(e) {
        const t = this._instances.find(t => t.highlighter === e.detail.highlighter);
        if (this._hideAllErrorCards(), this._hideAllDialogs(), t) {
            const n = t.displayedErrors.find(t => t.id === e.detail.blockId);
            if (!n) return;
            if (t.temporaryDisabledErrorId === n.id) return;
            if (getSelectedText().trim()) return;
            this._showErrorCard(t, e.detail.clickedRectangle, n), t.selectedErrorId = n.id, this._highlight(t)
        }
    }
    _onErrorSelected(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        if (t) {
            t.selectedErrorId = e.detail.errorId, this._highlight(t);
            const n = t.displayedErrors.find(e => e.id === t.selectedErrorId);
            n && t.inputAreaWrapper.scrollToText(n.offset, n.length)
        }
    }
    _onFixSelected(e) {
        let t;
        if ("errorCard" in e.detail) {
            const n = e.detail.errorCard;
            t = this._instances.find(e => e.errorCard === n)
        } else if ("dialog" in e.detail) {
            const n = e.detail.dialog;
            t = this._instances.find(e => e.dialog === n)
        }
        if (this._hideAllErrorCards(), !t) return;
        const n = e.detail.error,
            r = {
                error: n,
                replacementText: n.fixes[e.detail.fixIndex].value,
                instance: t
            };
        this._behaviorTweaks.applyFix(r), this._validateInstanceDebounce.callAfter(100);
        const {
            appliedSuggestions: i
        } = this._storageController.getStatistics();
        this._storageController.updateStatistics({
            appliedSuggestions: i + 1
        }), Tracker.trackEvent("Action", "check_trigger:apply_suggestion", String(e.detail.fixIndex))
    }
    _onTurnOffClicked(e) {
        const t = getMainPageHostname();
        this._storageController.disableDomain(t), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            enabled: !1
        }), this._showTurnOnHint()
    }
    _onAddToDictionaryClicked(e) {
        const t = this._instances.find(t => "errorCard" in e.detail && e.detail.errorCard === t.errorCard || "dialog" in e.detail && e.detail.dialog === t.dialog);
        this._hideAllErrorCards();
        const n = e.detail.error,
            r = this._storageController.getSettings().dictionary;
        r.push(n.misspelledWord), this._storageController.updateSettings({
            dictionary: r
        });
        const i = t && t.language ? getPrimaryLanguageCode(t.language.code) : "unknown";
        Tracker.trackEvent("Action", "check_trigger:add_to_dict", `${i}: ${n.misspelledWord}`)
    }
    _onIgnoreRuleClicked(e) {
        this._hideAllErrorCards();
        const t = e.detail.error,
            n = this._storageController.getSettings().ignoredRules,
            r = getPrimaryLanguageCode(t.language.code),
            i = {
                id: t.rule.id,
                language: r,
                description: t.rule.description
            };
        n.push(i), this._storageController.updateSettings({
            ignoredRules: n
        });
        let s = r + ":" + t.rule.id;
        t.rule.isPremium && (s = "premium:" + s), Tracker.trackEvent("DisabledRule", s, t.contextPhrase)
    }
    _onTemporarilyIgnoreWord(e) {
        const t = this._instances.find(t => "errorCard" in e.detail && t.errorCard === e.detail.errorCard || "dialog" in e.detail && t.dialog === e.detail.dialog);
        if (this._hideAllErrorCards(), !t) return;
        const n = e.detail.error,
            r = t.group;
        this._instances.filter(e => e.group === r).forEach(e => {
            e.ignoredWords.push(n.misspelledWord), this._setDisplayedErrors(e, e.allErrors), this._highlight(e), this.updateState(e, e.language && e.language.code || "")
        }), Tracker.trackEvent("Action", "check_trigger:temp_ignore_word", n.contextPhrase)
    }
    _onTemporarilyIgnoreRule(e) {
        const t = this._instances.find(t => "errorCard" in e.detail && t.errorCard === e.detail.errorCard || "dialog" in e.detail && t.dialog === e.detail.dialog);
        if (this._hideAllErrorCards(), !t) return;
        const n = e.detail.error,
            r = t.group,
            i = this._instances.filter(e => e.group === r),
            s = getPrimaryLanguageCode(n.language.code);
        i.forEach(e => {
            e.ignoredRules.push({
                id: n.rule.id,
                language: s,
                description: n.rule.description
            }), this._setDisplayedErrors(e, e.allErrors), this._highlight(e), this.updateState(e, e.language && e.language.code || "")
        });
        let o = s + ":" + n.rule.id;
        n.rule.isPremium && (o = "premium:" + o), Tracker.trackEvent("TempDisabledRule", o, n.contextPhrase)
    }
    _onShowFeedbackForm(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        if (!t) return;
        const n = t.targetElement.cloneNode(!1);
        try {
            n.innerText = `${t.inputAreaWrapper.getText().length} chars, ${t.language ? t.language.code : "unknown lang"}`
        } catch (e) { }
        browser.runtime.sendMessage({
            command: "OPEN_FEEDBACK_FORM",
            url: getCurrentUrl(),
            html: n.outerHTML || ""
        })
    }
    _onMoreDetailsClicked(e) {
        window.open(e.detail.url, "_blank"), Tracker.trackEvent("Action", "show_rule_details", e.detail.url)
    }
    _onBadgeClicked(e) {
        browser.runtime.sendMessage({
            command: "OPEN_OPTIONS",
            ref: "errorcard"
        }), this._hideAllErrorCards(), Tracker.trackEvent("Action", "check_trigger:badge:clicked", String(`premium:${this._storageController.getUIState().hasPaidSubscription}`))
    }
    _onLogoClicked(e) {
        window.open("https://autobot.asia/?pk_campaign=addon2-errorcard-logo", "_blank"), this._hideAllErrorCards(), Tracker.trackEvent("Action", "check_trigger:logo:clicked", String(`premium:${this._storageController.getUIState().hasPaidSubscription}`))
    }
    _onToggleDialog(e) {
        const t = this._instances.find(t => t.toolbar === e.detail.toolbar);
        if (!t) return;
        const n = !t.dialog;
        this._hideAllDialogs(), n && this._showDialog(t)
    }
    _onPremiumIconVisible(e) {
        const t = this._instances.find(t => t.toolbar === e.detail.toolbar);
        t && t.language && (t.tracking.sawPremiumIcon = !0)
    }
    _onErrorCardDestroyed(e) {
        const t = this._instances.find(t => t.errorCard === e.detail.errorCard);
        t && (t.errorCard = null, t.selectedErrorId === e.detail.error.id && (t.temporaryDisabledErrorId = t.selectedErrorId, setTimeout(() => t.temporaryDisabledErrorId = null, 500), t.selectedErrorId = null, this._highlight(t)))
    }
    _onDialogDestroyed(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        t && (t.dialog = null, null === t.errorCard && null !== t.selectedErrorId && (t.selectedErrorId = null, this._highlight(t)))
    }
    _onLanguageChanged(e) {
        const t = this._instances.find(t => t.dialog === e.detail.dialog);
        if (!t) return;
        const n = t.language;
        if (t.language = e.detail.language, this._revalidateInstance(t, e.detail.language, !0), n && n.code) {
            if (Tracker.trackEvent("Action", "check_trigger:switch_language", `${n.code} -> ${e.detail.language.code}`), n.code.indexOf("-") > -1 && e.detail.language.code.indexOf("-") > -1) {
                const t = n.code.split(/-(.+)/),
                    r = e.detail.language.code.split(/-(.+)/),
                    i = t[0],
                    s = t[1],
                    o = r[0],
                    a = r[1];
                if (i === o && s !== a) {
                    const t = e.detail.language.code.split(/-/),
                        n = 2 === t.length ? t[0] + "-" + t[1].toUpperCase() : t[0] + "-" + t[1].toUpperCase() + "-" + t.splice(2);
                    "en" === o ? this._storageController.updateSettings({
                        enVariant: n
                    }) : "de" === o ? this._storageController.updateSettings({
                        deVariant: n
                    }) : "pt" === o ? this._storageController.updateSettings({
                        ptVariant: n
                    }) : "ca" === o && this._storageController.updateSettings({
                        caVariant: n
                    })
                }
            }
        } else Tracker.trackEvent("Action", "check_trigger:switch_language", `unknown -> ${e.detail.language.code}`)
    }
    _onOptionsOpen(e) {
        browser.runtime.sendMessage({
            command: "OPEN_OPTIONS",
            ref: e.detail.ref
        })
    }
    _onSettingsChanged(e) {
        if (e.dictionary || e.ignoredRules)
            for (const e of this._instances) this._setDisplayedErrors(e, e.allErrors), this._highlight(e), this.updateState(e, e.language && e.language.code || "");
        if (e.disabledDomains || e.autoCheck || e.ignoreCheckOnDomains || e.autoCheckOnDomains) {
            const e = this._getDomainState(),
                t = Array.prototype.slice.call(this._instances);
            for (const n of t)
                if (e.isDisabled) this._destroyInstance(n);
                else if (e.isAutoCheckEnabled) {
                    !n.isAutoCheckEnabled && (n.isAutoCheckEnabled = !0, this._revalidateInstance(n, n.language))
                } else e.isAutoCheckEnabled ? e.shouldCapitalizationBeChecked || this._revalidateInstance(n, n.language) : (n.isAutoCheckEnabled = !1, n.allErrors = [], n.displayedErrors = [], n.pendingErrors = [], n.allHiddenErrors = [], n.displayedHiddenErrors = [], n.pendingHiddenErrors = [], this._highlight(n), this.updateState(n), this._hideAllErrorCards(), this._hideAllDialogs())
        }
        e.disabledDomainsCapitalization && this._instances.forEach(e => {
            this._revalidateInstance(e, e.language)
        })
    }
    _onUiStateChanged(e) {
        if (e.hasPaidSubscription)
            for (const e of this._instances) this._revalidateInstance(e, e.language)
    }
    _onPermissionRequiredIconClicked() {
        window.open(config.INSTALL_URL), Tracker.trackEvent("Action", "toolbar:open_install_url")
    }
    _onPrivacySettingsChanged(e) {
        e.allowRemoteCheck && e.allowRemoteCheck.newValue && this._instances.forEach(e => {
            e.isRemoteCheckAllowed = !0, this._validateInstance(e)
        })
    }
    _checkExtensionHealth() {
        isRuntimeConnected() || (this._instances.forEach(e => {
            e.isConnected = !1, e.highlighter && e.highlighter.destroy(), this.updateState(e)
        }), clearInterval(this._checkExtensionHealthInterval))
    }
    _trackInstance(e) {
        (isRuntimeConnected() || e.tracking.hasTracked) && (e.tracking.hasTracked = !0, e.tracking.hasEnoughText && browser.runtime.sendMessage({
            command: "TRACK_EVENT",
            action: `saw_premium_icon:${e.tracking.sawPremiumIcon}`,
            label: e.tracking.language
        }), Math.random() < .1 && browser.runtime.sendMessage({
            command: "TRACK_TEXT_LENGTH",
            textLength: e.tracking.textLength
        }))
    }
    _savePremiumErrorCount(e) {
        if (!e.displayedHiddenErrorCount || !isRuntimeConnected()) return;
        const t = (new Date).toDateString(),
            {
                hiddenErrors: n
            } = this._storageController.getStatistics();
        n[0] && n[0].day === t ? n[0].count += e.displayedHiddenErrorCount : n.unshift({
            day: t,
            count: e.displayedHiddenErrorCount
        }), n.length = Math.min(n.length, 62), this._storageController.updateStatistics({
            hiddenErrors: n
        })
    }
    _onPageHide() {
        this._instances.forEach(e => {
            this._savePremiumErrorCount(e), this._trackInstance(e)
        })
    }
    destroy() {
        this._instances.slice(0).forEach(e => this._destroyInstance(e)), this._otherSpellCheckers.forEach((e, t) => {
            this._enableOtherSpellCheckers(t)
        });
        try {
            browser.runtime.onMessage.removeListener(this._onMessage)
        } catch (e) { }
        document.removeEventListener("click", this._onDocumentClick, !0),
            document.removeEventListener("focus", this._onDocumentFocus, !0),
            window.frameElement && window.frameElement.ownerDocument && window.frameElement.ownerDocument.removeEventListener("click", this._onDocumentClick, !0),
            document.removeEventListener(InputAreaWrapper.eventNames.textChanged, this._onTextChanged),
            document.removeEventListener(InputAreaWrapper.eventNames.scroll, this._onInputScroll),
            document.removeEventListener(Highlighter.eventNames.blockClicked, this._onBlockClicked),
            document.removeEventListener(Toolbar.eventNames.permissionRequiredIconClicked, this._onPermissionRequiredIconClicked),
            document.removeEventListener(Toolbar.eventNames.toggleDialog, this._onToggleDialog),
            document.removeEventListener(Toolbar.eventNames.notifyAboutPremiumIcon, this._onPremiumIconVisible),
            document.removeEventListener(Dialog.eventNames.changeLanguage, this._onLanguageChanged),
            document.removeEventListener(Dialog.eventNames.enableHere, this._enableHere),
            document.removeEventListener(Dialog.eventNames.enableEverywhere, this._enableEverywhere),
            document.removeEventListener(Dialog.eventNames.errorSelected, this._onErrorSelected),
            document.removeEventListener(Dialog.eventNames.fixSelected, this._onFixSelected),
            document.removeEventListener(Dialog.eventNames.turnOff, this._onTurnOffClicked),
            document.removeEventListener(Dialog.eventNames.addToDictionaryClicked, this._onAddToDictionaryClicked),
            document.removeEventListener(Dialog.eventNames.ignoreRuleClicked, this._onIgnoreRuleClicked),
            document.removeEventListener(Dialog.eventNames.temporarilyIgnoreWordClicked, this._onTemporarilyIgnoreWord),
            document.removeEventListener(Dialog.eventNames.temporarilyIgnoreRuleClicked, this._onTemporarilyIgnoreRule),
            document.removeEventListener(Dialog.eventNames.moreDetailsClicked, this._onMoreDetailsClicked),
            document.removeEventListener(Dialog.eventNames.openOptions, this._onOptionsOpen),
            document.removeEventListener(Dialog.eventNames.showFeedbackForm, this._onShowFeedbackForm),
            document.removeEventListener(Dialog.eventNames.destroyed, this._onDialogDestroyed),
            document.removeEventListener(ErrorCard.eventNames.fixSelected, this._onFixSelected),
            document.removeEventListener(ErrorCard.eventNames.addToDictionaryClicked, this._onAddToDictionaryClicked),
            document.removeEventListener(ErrorCard.eventNames.ignoreRuleClicked, this._onIgnoreRuleClicked),
            document.removeEventListener(ErrorCard.eventNames.temporarilyIgnoreWordClicked, this._onTemporarilyIgnoreWord),
            document.removeEventListener(ErrorCard.eventNames.temporarilyIgnoreRuleClicked, this._onTemporarilyIgnoreRule),
            document.removeEventListener(ErrorCard.eventNames.destroyed, this._onErrorCardDestroyed),
            document.removeEventListener(ErrorCard.eventNames.moreDetailsClicked, this._onMoreDetailsClicked),
            document.removeEventListener(ErrorCard.eventNames.badgeClicked, this._onBadgeClicked),
            document.removeEventListener(ErrorCard.eventNames.logoClicked, this._onLogoClicked),
            window.removeEventListener("pageshow", this._sendPageLoaded),
            window.removeEventListener("pagehide", this._onPageHide),
            this._storageController && this._storageController.destroy(),
            clearTimeout(this._initTimeout), clearInterval(this._checkExtensionHealthInterval),
            clearInterval(this._tinyMceInterval),
            this._validateInstanceDebounce && this._validateInstanceDebounce.cancelCall(),
            document.documentElement && document.documentElement.removeAttribute("data-lt-installed"),
            this._options.onDestroy && this._options.onDestroy()
    }
}
LTAssistant.eventNames = {
    destroy: "_lt-destroy",
    updateState: "_lt-update-state"
}, LTAssistant.PUNCTUATION_REG_EXP = /^[^\n]*?[.!?]($|\s)/, LTAssistant.PUNCTIUATION_CHAR_REG_EXP = /^[.!?]$/;