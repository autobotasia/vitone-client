/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Dialog {
  constructor(e, t, o, n) {
    (this._toolbarContainer = e),
      (this._document = this._toolbarContainer.ownerDocument),
      (this._onUnload = bindAndCatch(this._onUnload, this)),
      window.addEventListener("pagehide", this._onUnload, !0),
      (this._uiState = n),
      (this._controls = {}),
      (this._eventListeners = []),
      this._render(),
      this.setCurrentLanguage("vi"),
      this.updateState(o),
      this._eventListeners.push(
        addUseCaptureEvent(document, "keydown", this._onKeydown.bind(this))
      ),
      (this._inApplyFixMode = !1);
  }
  _render() {
    if (this._controls.container) return;
    (this._controls.container = this._document.createElement(
      Dialog.CONTAINER_ELEMENT_NAME
    )),
      this._controls.container.setAttribute("contenteditable", "false");
    const e = e => {
      e.stopImmediatePropagation();
    };
    this._eventListeners.push(
      addUseCaptureEvent(this._controls.container, "mousedown", e),
      addUseCaptureEvent(this._controls.container, "mouseup", e),
      addUseCaptureEvent(this._controls.container, "pointerdown", e),
      addUseCaptureEvent(this._controls.container, "pointerup", e),
      addUseCaptureEvent(this._controls.container, "focusin", e),
      addUseCaptureEvent(this._controls.container, "focusout", e)
    ),
      this._controls.container.addEventListener("click", e),
      (this._controls.innerContainer = this._document.createElement("lt-div")),
      (this._controls.innerContainer.className = "lt-dialog__container"),
      this._controls.container.appendChild(this._controls.innerContainer),
      (this._controls.header = this._document.createElement("lt-div")),
      (this._controls.header.className = "lt-dialog__header"),
      this._controls.innerContainer.appendChild(this._controls.header),
      (this._controls.languageSelectorWrapper = this._document.createElement(
        "lt-div"
      )),
      (this._controls.languageSelectorWrapper.className =
        "lt-dialog__language-selector-wrapper"),
      this._controls.header.appendChild(this._controls.languageSelectorWrapper),
      (this._controls.currentLanguage = this._document.createElement(
        "lt-span"
      )),
      (this._controls.currentLanguage.className =
        "lt-dialog__current-language"),
      this._controls.languageSelectorWrapper.appendChild(
        this._controls.currentLanguage
      ),
      (this._controls.languageSelector = this._document.createElement(
        "select"
      )),
      (this._controls.languageSelector.className =
        "lt-dialog__language-selector"),
      this._eventListeners.push(
        addUseCaptureEvent(
          this._controls.languageSelector,
          "change",
          this._onLanguageChange.bind(this)
        )
      ),
      LANGUAGES.forEach(e => {
        const t = this._document.createElement("option");
        (t.value = e.code),
          (t.textContent = e.name),
          this._controls.languageSelector.appendChild(t);
      }),
      this._controls.languageSelectorWrapper.appendChild(
        this._controls.languageSelector
      ),
      // (this._controls.optionsLink = this._document.createElement("lt-span")),
      // (this._controls.optionsLink.className = "lt-dialog__options-link"),
      // (this._controls.optionsLink.title = Dialog.MESSAGES.OPTIONS_TITLE),
      // this._eventListeners.push(
      //   addUseCaptureEvent(
      //     this._controls.optionsLink,
      //     "click",
      //     this._onOptionsClick.bind(this)
      //   )
      // ),
      // this._controls.header.appendChild(this._controls.optionsLink),
      (this._controls.content = this._document.createElement("lt-div")),
      (this._controls.content.className = "lt-dialog__content"),
      this._controls.innerContainer.appendChild(this._controls.content),
      (this._controls.footer = this._document.createElement("lt-div")),
      (this._controls.footer.className = "lt-dialog__footer"),
      this._controls.innerContainer.appendChild(this._controls.footer),
      (this._controls.incompleteResult = this._document.createElement(
        "lt-div"
      )),
      (this._controls.incompleteResult.className =
        "lt-dialog__incomplete-result"),
      (this._controls.incompleteResult.textContent =
        Dialog.MESSAGES.INCOMPLETE_RESULT),
      this._controls.footer.appendChild(this._controls.incompleteResult),
      (this._controls.poweredBy = this._document.createElement("lt-span")),
      (this._controls.poweredBy.className = "lt-dialog__powered-by"),
      (this._controls.poweredBy.innerHTML = Dialog.MESSAGES.POWERED_BY),
      this._eventListeners.push(
        addUseCaptureEvent(
          this._controls.poweredBy,
          "click",
          this._gotoLanguageTool.bind(this)
        )
      ),
      this._controls.footer.appendChild(this._controls.poweredBy),
      (this._controls.sendFeedback = this._document.createElement("lt-span")),
      (this._controls.sendFeedback.className = "lt-dialog__send-feedback"),
      (this._controls.sendFeedback.innerHTML = Dialog.MESSAGES.FEEDBACK),
      this._eventListeners.push(
        addUseCaptureEvent(
          this._controls.sendFeedback,
          "click",
          this._showFeedbackForm.bind(this)
        )
      ),
      // this._controls.footer.appendChild(this._controls.sendFeedback),
      (this._controls.pointer = this._document.createElement("lt-span")),
      (this._controls.pointer.className = "lt-dialog__pointer"),
      this._controls.innerContainer.appendChild(this._controls.pointer),
      this._toolbarContainer.appendChild(this._controls.container),
      this._toolbarContainer.classList.add("lt-toolbar--dialog-opened");
  }
  _position() {
    const e = new DomMeasurement(this._document);
    let t = this._controls.innerContainer.getBoundingClientRect();
    t.right >=
      this._document.documentElement.clientWidth -
      Dialog.SPACE_TO_SCREEN_EDGE && this._alignToBottom(),
      (t = this._controls.innerContainer.getBoundingClientRect()).bottom +
      t.height >=
      this._document.documentElement.clientHeight && this._alignToTop();
    const o = e.getDocumentScroll();
    (t = this._controls.innerContainer.getBoundingClientRect()),
      o.top + t.top <= Dialog.SPACE_TO_SCREEN_EDGE && this._alignToBottom();
  }
  _alignToBottom() {
    const e = new DomMeasurement(this._document);
    this._controls.innerContainer.classList.remove("lt-dialog__container-top"),
      this._controls.innerContainer.classList.add(
        "lt-dialog__container-bottom"
      );
    const t = this._controls.innerContainer.getBoundingClientRect();
    if (t.left <= Dialog.SPACE_TO_SCREEN_EDGE) {
      const o =
        parseInt(e.getStyle(this._controls.innerContainer, "right"), 10) +
        t.left -
        Dialog.SPACE_TO_SCREEN_EDGE,
        n =
          parseInt(e.getStyle(this._controls.pointer, "right"), 10) -
          t.left +
          Dialog.SPACE_TO_SCREEN_EDGE;
      e.setStyles(this._controls.innerContainer, {
        right: o + "px !important",
        left: "auto !important"
      }),
        e.setStyles(this._controls.pointer, {
          right: n + "px !important",
          left: "auto !important"
        });
    }
  }
  _alignToTop() {
    this._controls.innerContainer.classList.remove(
      "lt-dialog__container-bottom"
    ),
      this._controls.innerContainer.classList.add("lt-dialog__container-top");
    const e = this._controls.innerContainer.getBoundingClientRect(),
      t = new DomMeasurement(this._document);
    if (
      (this._controls.innerContainer.classList.add("lt-dialog__container-hide"),
        e.right >=
        this._document.documentElement.clientWidth -
        Dialog.SPACE_TO_SCREEN_EDGE)
    ) {
      const o =
        parseInt(t.getStyle(this._controls.innerContainer, "left"), 10) -
        (e.right - this._document.documentElement.clientWidth) -
        Dialog.SPACE_TO_SCREEN_EDGE,
        n =
          parseInt(t.getStyle(this._controls.pointer, "left"), 10) +
          (e.right - this._document.documentElement.clientWidth) +
          Dialog.SPACE_TO_SCREEN_EDGE;
      t.setStyles(this._controls.innerContainer, {
        left: o + "px !important",
        right: "auto !important"
      }),
        t.setStyles(this._controls.pointer, {
          left: n + "px !important",
          right: "auto !important"
        });
    }
    this._controls.innerContainer.classList.remove("lt-dialog__container-hide");
  }
  _removeTeaser() {
    this._controls.teaserElement &&
      (this._controls.teaserElement.remove(),
        (this._controls.teaserElement = void 0));
  }
  _updateContent() {
    if (!this._controls.content) return;
    (this._controls.content.innerHTML = ""),
      this._controls.content.classList.remove("lt-dialog__has-errors");
    const e = this._state.requestStatus;
    e === REQUEST_STATUS.COMPLETED ||
      (this._inApplyFixMode && e === REQUEST_STATUS.IN_PROGRESS)
      ? this._renderCompletedState()
      : e === REQUEST_STATUS.IN_PROGRESS
        ? this._renderInProgressState()
        : e === REQUEST_STATUS.DISABLED
          ? this._renderDisabledState()
          : e === REQUEST_STATUS.TEXT_TOO_SHORT
            ? this._renderTextTooShortState()
            : e === REQUEST_STATUS.TEXT_TOO_LONG
              ? this._renderTextTooLongState()
              : e === REQUEST_STATUS.UNSUPPORTED_LANGUAGE
                ? this._renderLanguageUnsupportedState()
                : e === REQUEST_STATUS.DISCONNECTED
                  ? this._renderDisconnectedState()
                  : e === REQUEST_STATUS.FAILED && this._renderFailedState(),
      this._position();
  }
  _renderInProgressState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__big-loader"),
      this._controls.content.appendChild(e);
  }
  _renderCompletedState() {
    this._state.errors && this._state.errors.length
      ? (this._renderErrors(),
        this._renderIgnoredErrorsStats(),
        this._renderPremiumErrorsTeaser())
      : this._state.hiddenErrors && this._state.hiddenErrors.length
        ? (this._removeTeaser(), this._renderPremiumState())
        : (this._renderNoErrorsState(),
          this._renderIgnoredErrorsStats(),
          this._renderPremiumErrorsTeaser()),
      this._controls.incompleteResult.classList.toggle(
        "lt-dialog__incomplete-result-show",
        !!this._state.isIncompleteResult
      );
  }
  _renderErrors() {
    this._controls.content.classList.add("lt-dialog__has-errors"),
      this._state.errors.forEach(e => {
        const t = this._document.createElement("lt-div");
        t.className = "lt-dialog__error-item";
        const o = this._document.createElement("lt-div");
        (o.className = "lt-dialog__error-headline"),
          e.isSpellingError
            ? ((o.textContent = Dialog.MESSAGES.HEADLINE_SPELLING_ERROR),
              (o.style.color = config.COLORS.SPELLING.TITLE))
            : e.isStyleError
              ? ((o.textContent = Dialog.MESSAGES.HEADLINE_SUGGESTION_ERROR),
                (o.style.color = config.COLORS.STYLE.TITLE))
              : e.isPunctuationError
                ? ((o.textContent = Dialog.MESSAGES.HEADLINE_PUNCTUATION_ERROR),
                  (o.style.color = config.COLORS.GRAMMAR.TITLE))
                : ((o.textContent = Dialog.MESSAGES.HEADLINE_GRAMMAR_ERROR),
                  (o.style.color = config.COLORS.GRAMMAR.TITLE)),
          t.append(o);
        const n = this._document.createElement("lt-div");
        if (
          ((n.className = "lt-dialog__error-text"),
            (n.textContent = e.description),
            t.append(n),
            e.rule.urls && e.rule.urls.length > 0)
        ) {
          const t = this._document.createElement("lt-span");
          t.classList.add("lt-dialog__more-details"),
            (t.title = browser.i18n.getMessage("moreDetails")),
            this._eventListeners.push(
              addUseCaptureEvent(t, "click", t => {
                this._onMoreDetailsClick(e.rule.urls[0], t);
              })
            ),
            n.appendChild(t);
        }
        let s = null;
        t.addEventListener("mouseenter", () => {
          s = window.setTimeout(() => this._onErrorSelected(e.id), 800);
        }),
          t.addEventListener("mouseleave", () => {
            clearTimeout(s), this._onErrorSelected(null);
          });
        const i = Math.min(e.fixes.length, config.MAX_FIXES_COUNT);
        for (let o = 0; o < i; o++) {
          const n = this._document.createElement("lt-div");
          n.className = "lt-dialog__fix-container";
          const s = this._document.createElement("lt-div");
          (s.className = "lt-dialog__original-phrase"),
            (s.textContent = e.originalPhrase),
            n.appendChild(s);
          const i = this._document.createElement("lt-div");
          (i.className = "lt-dialog__arrow"), n.appendChild(i);
          const r = this._document.createElement("lt-div");
          (r.textContent = e.fixes[o].value),
            (r.title = e.fixes[o].shortDescription || ""),
            (r.className = "lt-dialog__fix"),
            this._eventListeners.push(
              addUseCaptureEvent(r, "click", n => {
                this._onFixClick(e, o, n), t.remove();
              })
            ),
            n.appendChild(r),
            t.appendChild(n),
            e.fixes[o].value.length >= 14 &&
            t.classList.add("lt-dialog__long-fix");
        }
        if (0 === i) {
          const o = this._document.createElement("lt-div");
          o.className = "lt-dialog__fix-container";
          const n = this._document.createElement("lt-div");
          (n.className = "lt-dialog__original-phrase"),
            (n.textContent = e.originalPhrase),
            o.appendChild(n),
            t.appendChild(o);
        }
        if (e.isSpellingError) {
          const o = this._document.createElement("lt-div");
          o.classList.add("lt-dialog__add-to-dictionary"),
            (o.textContent = browser.i18n.getMessage(
              "addToDictionaryTitle",
              e.misspelledWord
            )),
            this._eventListeners.push(
              addUseCaptureEvent(o, "click", o => {
                this._onAddToDictionaryClick(e, o), t.remove();
              })
            )
          // t.appendChild(o);
          const n = this._document.createElement("lt-div");
          n.classList.add("lt-dialog__temporarily-ignore-word"),
            (n.textContent = browser.i18n.getMessage("ignoreHere")),
            this._eventListeners.push(
              addUseCaptureEvent(n, "click", o => {
                this._onTemporarilyIgnoreWordClick(e, o), t.remove();
              })
            ),
            t.appendChild(n);
          console.log("icnore:", t);
        } else {
          const o = this._document.createElement("lt-div");
          o.classList.add("lt-dialog__ignore-rule"),
            (o.textContent = browser.i18n.getMessage("turnOffRule")),
            this._eventListeners.push(
              addUseCaptureEvent(o, "click", o => {
                this._onIgnoreRuleClick(e, o), t.remove();
              })
            ),
            t.appendChild(o);
          const n = this._document.createElement("lt-div");
          n.classList.add("lt-dialog__temporarily-ignore-rule"),
            (n.textContent = browser.i18n.getMessage("ignoreHere")),
            this._eventListeners.push(
              addUseCaptureEvent(n, "click", o => {
                this._onTemporarilyIgnoreRuleClick(e, o), t.remove();
              })
            ),
            t.appendChild(n);
          console.log("icnore1:", t)
        }
        console.log("icnore2:", t)
        this._controls.content.appendChild(t);
      });
  }
  _renderTextTooShortState() {
    this._removeTeaser();
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__text-too-short__headline"),
      (e.innerHTML = Dialog.MESSAGES.TEXT_TOO_SHORT_HEADLINE);
    const t = this._document.createElement("lt-div");
    (t.className = "lt-dialog__text-too-short__text"),
      (t.innerHTML = Dialog.MESSAGES.TEXT_TOO_SHORT_TEXT),
      this._controls.content.appendChild(e),
      this._controls.content.appendChild(t);
  }
  _renderNoErrorsState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__no-errors"),
      (e.innerHTML = Dialog.MESSAGES.NO_ERRORS),
      this._controls.content.appendChild(e),
      this._renderRatingTeaser();
  }
  _renderIgnoredErrorsStats() {
    if (
      this._state.ignoredErrorsStats &&
      (0 !== this._state.ignoredErrorsStats.byDictionary ||
        0 !== this._state.ignoredErrorsStats.byRules)
    ) {
      let e = [];
      if (this._state.ignoredErrorsStats.byDictionary > 0) {
        const t =
          1 === this._state.ignoredErrorsStats.byDictionary
            ? "errorsIgnoredByDictionarySingular"
            : "errorsIgnoredByDictionary",
          o = browser.i18n.getMessage(t, [
            this._state.ignoredErrorsStats.byDictionary
          ]);
        e.push(o);
      }
      if (this._state.ignoredErrorsStats.byRules > 0) {
        const t =
          1 === this._state.ignoredErrorsStats.byRules
            ? "errorsIgnoredByRulesSingular"
            : "errorsIgnoredByRules",
          o = browser.i18n.getMessage(t, [
            this._state.ignoredErrorsStats.byRules
          ]);
        e.push(o);
      }
      const t = this._document.createElement("lt-div");
      this._state.errors && this._state.errors.length
        ? (t.className = "lt-dialog__ignored-errors-item")
        : (t.className = "lt-dialog__ignored-errors-message"),
        (t.textContent = e.join(", ")),
        this._eventListeners.push(
          addUseCaptureEvent(t, "click", this._onIgnoredErrorsClick.bind(this))
        ),
        this._controls.content.appendChild(t);
    }
  }
  _renderRatingTeaser() {
    if (
      !this._state.hiddenErrors.length &&
      !this._controls.teaserElement &&
      !this._uiState.hasRated &&
      isRuntimeConnected() &&
      0 === Math.floor(2 * Math.random())
    ) {
      let e = browser.runtime.getURL("/content/iframes/rating/rating.html");
      (e += `?componentName=dialog&url=${encodeURIComponent(
        getCurrentUrl().substr(0, 150)
      )}`),
        (this._controls.teaserElement = this._document.createElement("iframe")),
        (this._controls.teaserElement.src = e),
        (this._controls.teaserElement.className =
          "lt-dialog-iframe lt-dialog-rating-iframe");
      // this._controls.content.after(this._controls.teaserElement); //remote frame 
    }
  }
  _renderPremiumErrorsTeaser() {
    if (
      this._state.hiddenErrors.length &&
      !this._controls.teaserElement &&
      isRuntimeConnected()
    ) {
      let e = browser.runtime.getURL(
        "/content/iframes/premiumErrors/premiumErrors.html"
      );
      const t = this._state.hiddenErrors.filter(e => !e.isStyleError).length,
        o = this._state.hiddenErrors.filter(e => e.isStyleError).length;
      (e += `?grammarMatches=${t}`),
        (e += `&styleMatches=${o}`),
        (this._controls.teaserElement = this._document.createElement("iframe")),
        (this._controls.teaserElement.src = e),
        (this._controls.teaserElement.className =
          "lt-dialog-iframe lt-dialog-premium-errors-iframe"),
        this._controls.content.after(this._controls.teaserElement);
    }
  }
  _renderPremiumState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__premium__headline"),
      (e.textContent =
        1 === this._state.hiddenErrors.length
          ? browser.i18n.getMessage("dialogPremiumHeadlineSingular")
          : browser.i18n.getMessage("dialogPremiumHeadlinePlural", [
            this._state.hiddenErrors.length
          ]));
    const t = this._document.createElement("lt-div");
    (t.className = "lt-dialog__premium__text"),
      (t.textContent = browser.i18n.getMessage("dialogPremiumText"));
    const o = this._document.createElement("lt-div");
    (o.className = "lt-dialog__premium__button"),
      (o.textContent = browser.i18n.getMessage("dialogPremiumButton")),
      this._eventListeners.push(
        addUseCaptureEvent(o, "click", e => {
          e.stopImmediatePropagation();
          let t =
            "https://autobot.asia/webextension/upgrade?pk_campaign=addon2-dialog-premium";
          (t += `&grammarMatches=${
            this._state.hiddenErrors.filter(e => !e.isStyleError).length
            }`),
            (t += `&styleMatches=${
              this._state.hiddenErrors.filter(e => e.isStyleError).length
              }`),
            window.open(t, "_blank"),
            Tracker.trackEvent("Action", "dialog:premium:click");
        })
      ),
      this._controls.content.appendChild(e),
      this._controls.content.appendChild(t),
      this._controls.content.appendChild(o);
  }
  _renderDisabledState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__enable-text"),
      (e.innerHTML = Dialog.MESSAGES.ENABLE);
    const t = this._document.createElement("lt-div");
    (t.className = "lt-dialog__enable-everywhere"),
      (t.innerHTML = Dialog.MESSAGES.ENABLE_EVERYWHERE_BUTTON),
      this._eventListeners.push(
        addUseCaptureEvent(t, "click", this._enableEverywhere.bind(this))
      );
    const o = this._document.createElement("lt-div");
    (o.className = "lt-dialog__enable-here"),
      (o.innerHTML = Dialog.MESSAGES.ENABLE_HERE_BUTTON),
      this._eventListeners.push(
        addUseCaptureEvent(o, "click", this._enableHere.bind(this))
      ),
      this._controls.content.appendChild(e),
      this._controls.content.appendChild(t),
      this._controls.content.appendChild(o);
  }
  _renderTextTooLongState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__premium__headline"),
      (e.textContent = Dialog.MESSAGES.TEXT_TOO_LONG_HEADLINE);
    const t = this._document.createElement("lt-div");
    (t.className = "lt-dialog__premium__text"),
      (t.textContent = Dialog.MESSAGES.TEXT_TOO_LONG_TEXT);
    const o = this._document.createElement("lt-div");
    (o.className = "lt-dialog__premium__button"),
      (o.textContent = Dialog.MESSAGES.TEXT_TOO_LONG_BUTTON),
      this._eventListeners.push(
        addUseCaptureEvent(o, "click", e => {
          e.stopImmediatePropagation(),
            window.open(
              "https://autobot.asia/webextension/upgrade?pk_campaign=addon2-dialog-text-too-long",
              "_blank"
            ),
            Tracker.trackEvent("Action", "dialog:text_too_long:click");
        })
      ),
      this._controls.content.appendChild(e),
      this._controls.content.appendChild(t),
      this._controls.content.appendChild(o);
  }
  _renderLanguageUnsupportedState() {
    const e = this._document.createElement("lt-div");
    (e.className = "lt-dialog__language-unsupported__headline"),
      (e.textContent = Dialog.MESSAGES.UNSUPPORTED_LANGUAGE_HEADLINE);
    const t = this._document.createElement("lt-div");
    if (
      ((t.className = "lt-dialog__language-unsupported__text"),
        (t.textContent = Dialog.MESSAGES.UNSUPPORTED_LANGUAGE_TEXT),
        this._controls.content.appendChild(e),
        this._controls.content.appendChild(t),
        this._controls.currentLanguage)
    ) {
      this._controls.currentLanguage.textContent =
        Dialog.MESSAGES.SELECT_LANGUAGE_LABEL;
      const e = this._document.createElement("option");
      (e.disabled = !0),
        (e.selected = !0),
        (e.textContent = Dialog.MESSAGES.UNSUPPORTED_LANGUAGE_LABEL),
        this._controls.languageSelector.prepend(e),
        new DomMeasurement(this._document).setStyles(
          this._controls.currentLanguage,
          { "background-image": "" }
        );
    }
  }
  _renderDisconnectedState() {
    this._controls.header.remove(), this._controls.sendFeedback.remove();
    const e = this._document.createElement("lt-div");
    (e.innerHTML = Dialog.MESSAGES.EXTENSION_UPDATED_HEADLINE),
      (e.className = "lt-dialog__exception-headline"),
      this._controls.content.appendChild(e);
    const t = this._document.createElement("lt-div");
    (t.innerHTML = Dialog.MESSAGES.EXTENSION_UPDATED_TEXT),
      (t.className = "lt-dialog__exception-message"),
      this._controls.content.appendChild(t);
  }
  _renderFailedState() {
    const e = this._document.createElement("lt-div");
    (e.innerHTML =
      DOMPurify.sanitize(this._state.exceptionMessage) ||
      browser.i18n.getMessage("statusIconError")),
      (e.className = "lt-dialog__exception-message"),
      this._controls.content.appendChild(e);
  }
  _onUnload() {
    this.destroy();
  }
  _onKeydown(e) {
    "Escape" === e.key && (this.destroy(), e.stopImmediatePropagation());
  }
  _onLanguageChange(e) {
    e.stopImmediatePropagation();
    const t = LANGUAGES.find(
      e => e.code === this._controls.languageSelector.value
    );
    if (!t) throw new Error("Selected language not found in LANGUAGES array");
    const o = { dialog: this, language: t };
    dispatchCustomEvent(Dialog.eventNames.changeLanguage, o),
      this.setCurrentLanguage(t.code);
  }
  _onTurnOffClick() {
    dispatchCustomEvent(Dialog.eventNames.turnOff);
  }
  _onOptionsClick(e) {
    e.stopImmediatePropagation(),
      dispatchCustomEvent(Dialog.eventNames.openOptions);
  }
  _onIgnoredErrorsClick(e) {
    e.stopImmediatePropagation();
    const t = { dialog: this, ref: "dialog-ignored-errors" };
    dispatchCustomEvent(Dialog.eventNames.openOptions, t);
  }
  _gotoLanguageTool(e) {
    e.stopImmediatePropagation(),
      window.open("https://ncc.asia/", "_blank");
  }
  _showFeedbackForm(e) {
    e.stopImmediatePropagation();
    const t = { dialog: this };
    dispatchCustomEvent(Dialog.eventNames.showFeedbackForm, t);
  }
  _onErrorSelected(e) {
    const t = { dialog: this, errorId: e };
    dispatchCustomEvent(Dialog.eventNames.errorSelected, t);
  }
  _onMoreDetailsClick(e, t) {
    t.stopImmediatePropagation();
    const o = { url: e.value };
    dispatchCustomEvent(Dialog.eventNames.moreDetailsClicked, o);
  }
  _onFixClick(e, t, o) {
    o.stopImmediatePropagation(), (this._inApplyFixMode = !0);
    const n = { dialog: this, error: e, fixIndex: t };
    dispatchCustomEvent(Dialog.eventNames.fixSelected, n);
  }
  _onAddToDictionaryClick(e, t) {
    t.stopImmediatePropagation(), (this._inApplyFixMode = !0);
    const o = { dialog: this, error: e };
    dispatchCustomEvent(Dialog.eventNames.addToDictionaryClicked, o);
  }
  _onIgnoreRuleClick(e, t) {
    t.stopImmediatePropagation(), (this._inApplyFixMode = !0);
    const o = { dialog: this, error: e };
    dispatchCustomEvent(Dialog.eventNames.ignoreRuleClicked, o);
  }
  _onTemporarilyIgnoreWordClick(e, t) {
    t.stopImmediatePropagation(), (this._inApplyFixMode = !0);
    const o = { dialog: this, error: e };
    dispatchCustomEvent(Dialog.eventNames.temporarilyIgnoreWordClicked, o);
  }
  _onTemporarilyIgnoreRuleClick(e, t) {
    t.stopImmediatePropagation(), (this._inApplyFixMode = !0);
    const o = { dialog: this, error: e };
    dispatchCustomEvent(Dialog.eventNames.temporarilyIgnoreRuleClicked, o);
  }
  _enableEverywhere(e) {
    e.stopImmediatePropagation();
    const t = { dialog: this };
    dispatchCustomEvent(Dialog.eventNames.enableEverywhere, t);
  }
  _enableHere(e) {
    e.stopImmediatePropagation();
    const t = { dialog: this };
    dispatchCustomEvent(Dialog.eventNames.enableHere, t);
  }
  updateState(e) {
    isSameObjects(this._state, e) ||
      ((this._state = Object.assign(this._state || {}, e)),
        this._updateContent());
  }
  setCurrentLanguage(e) {
    if (!isRuntimeConnected()) return;
    e = e.toLowerCase();
    const t =
      LANGUAGES.find(t => t.code === e) ||
      LANGUAGES.find(t => e.startsWith(t.code)) ||
      LANGUAGES.find(e => "vi" === e.code),
      o = browser.runtime.getURL("/assets/images/flags/" + t.code + ".svg");
    (this._controls.currentLanguage.textContent = t.name),
      new DomMeasurement(this._document).setStyles(
        this._controls.currentLanguage,
        { "background-image": `url('${o}') !important` }
      ),
      (this._controls.languageSelector.value = t.code);
  }
  destroy() {
    fadeOutAndRemove(this._controls.container, () => {
      this._toolbarContainer.classList.remove("lt-toolbar--dialog-opened");
    }),
      (this._controls = {}),
      window.removeEventListener("pagehide", this._onUnload, !0),
      this._eventListeners.forEach(e => {
        e.destroy();
      }),
      (this._eventListeners = []);
    const e = { dialog: this };
    dispatchCustomEvent(Dialog.eventNames.destroyed, e);
  }
}
(Dialog.CONTAINER_ELEMENT_NAME = "lt-dialog"),
  (Dialog.SPACE_TO_SCREEN_EDGE = 5),
  (Dialog.MESSAGES = {
    EXTENSION_UPDATED_HEADLINE: browser.i18n.getMessage(
      "extensionUpdatedHeadline"
    ),
    EXTENSION_UPDATED_TEXT: browser.i18n.getMessage("extensionUpdatedText", [
      "<lt-span class='lt-dialog__icon'></lt-span>"
    ]),
    INCOMPLETE_RESULT: browser.i18n.getMessage("incompleteResult"),
    POWERED_BY: browser.i18n.getMessage("poweredBy"),
    FEEDBACK: browser.i18n.getMessage("reportAnIssue"),
    ENABLE: browser.i18n.getMessage("enableInDialog"),
    ENABLE_EVERYWHERE_BUTTON: browser.i18n.getMessage("enableEverywhereButton"),
    ENABLE_HERE_BUTTON: browser.i18n.getMessage("enableHereButton"),
    OPTIONS_TITLE: browser.i18n.getMessage("settingsHeadline"),
    NO_ERRORS: browser.i18n.getMessage("noErrorsFound2"),
    TEXT_TOO_LONG_HEADLINE: browser.i18n.getMessage(
      "dialogTextTooLongHeadline"
    ),
    TEXT_TOO_LONG_TEXT: browser.i18n.getMessage("dialogTextTooLongText"),
    TEXT_TOO_LONG_BUTTON: browser.i18n.getMessage("dialogTextTooLongButton"),
    TEXT_TOO_SHORT_TEXT: browser.i18n.getMessage("dialogTextTooShortText"),
    TEXT_TOO_SHORT_HEADLINE: browser.i18n.getMessage(
      "dialogTextTooShortHeadline"
    ),
    HEADLINE_SPELLING_ERROR: browser.i18n.getMessage("spellingError"),
    HEADLINE_SUGGESTION_ERROR: browser.i18n.getMessage("suggestionError"),
    HEADLINE_PUNCTUATION_ERROR: browser.i18n.getMessage("punctuationError"),
    HEADLINE_GRAMMAR_ERROR: browser.i18n.getMessage("grammarError"),
    SELECT_LANGUAGE_LABEL: browser.i18n.getMessage("dialogSelectLanguageLabel"),
    UNSUPPORTED_LANGUAGE_LABEL: browser.i18n.getMessage(
      "dialogUnsupportedLanguageLabel"
    ),
    UNSUPPORTED_LANGUAGE_HEADLINE: browser.i18n.getMessage(
      "dialogUnsupportedLanguageHeadline"
    ),
    UNSUPPORTED_LANGUAGE_TEXT: browser.i18n.getMessage(
      "dialogUnsupportedLanguageText"
    )
  }),
  (Dialog.eventNames = {
    changeLanguage: "lt-dialog.changeLanguage",
    enableHere: "lt-dialog.enableHere",
    enableEverywhere: "lt-dialog.enableEverywhere",
    errorSelected: "lt-dialog.errorSelected",
    fixSelected: "lt-dialog.fixSelected",
    turnOff: "lt-dialog.turnOff",
    openOptions: "lt-dialog.openOptions",
    addToDictionaryClicked: "lt-dialog.addToDictionaryClicked",
    ignoreRuleClicked: "lt-dialog.ignoreRuleClicked",
    moreDetailsClicked: "lt-dialog.moreDetailsClicked",
    temporarilyIgnoreWordClicked: "lt-dialog.temporarilyIgnoreWordClicked",
    temporarilyIgnoreRuleClicked: "lt-dialog.temporarilyIgnoreRuleClicked",
    destroyed: "lt-dialog.destroyed",
    showFeedbackForm: "lt-dialog.showFeedbackForm"
  });
