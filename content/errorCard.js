/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class ErrorCard {
  constructor(e, t, r, o) {
    (this._renderOutsideIframe = !1),
      (this.error = e),
      (this._inputArea = r),
      (this._referenceArea = r),
      (this._document = this._inputArea.ownerDocument),
      (this._hasSubscription = o);
    const i = getFrameElement(window);
    i &&
      this._inputArea === this._inputArea.ownerDocument.body &&
      isLTAvailable(window.parent) &&
      ((this._referenceArea = i),
        (this._document = this._referenceArea.ownerDocument),
        (this._renderOutsideIframe = !0),
        (this._onUnload = bindAndCatch(this._onUnload, this)),
        window.addEventListener("pagehide", this._onUnload, !0)),
      (this._domMeasurement = new DomMeasurement(this._document)),
      (this._eventListeners = []),
      this._render(t);
  }
  _getVisibleBox() {
    const e = this._domMeasurement.getDocumentScroll(),
      t = this._document.documentElement.clientHeight,
      r = this._document.documentElement.clientWidth;
    return {
      top: e.top,
      left: e.left,
      bottom: e.top + t,
      right: e.left + r,
      height: t,
      width: r
    };
  }
  _render(e) {
    (this._container = this._document.createElement(
      ErrorCard.CONTAINER_ELEMENT_NAME
    )),
      this._container.setAttribute("contenteditable", "false"),
      this._eventListeners.push(
        addUseCaptureEvent(document, "keydown", this._onKeyDown.bind(this)),
        addUseCaptureEvent(this._container, "mousedown", e => {
          e.stopImmediatePropagation(), e.preventDefault();
        }),
        addUseCaptureEvent(this._container, "mouseup", e =>
          e.stopImmediatePropagation()
        ),
        addUseCaptureEvent(this._container, "pointerdown", e =>
          e.stopImmediatePropagation()
        ),
        addUseCaptureEvent(this._container, "pointerup", e =>
          e.stopImmediatePropagation()
        )
      ),
      this._container.addEventListener("click", e => e.stopPropagation());
    const t = this._document.createElement("lt-div");
    t.classList.add("lt-errorcard__container"), this._renderContent(t);
    const r = this._document.createElement("lt-span");
    (r.className = "lt-errorcard__close-button"),
      this._eventListeners.push(
        addUseCaptureEvent(r, "click", this._onCloseClicked.bind(this))
      ),
      t.appendChild(r),
      this._container.appendChild(t),
      ("BODY" === this._referenceArea.nodeName
        ? this._document.documentElement
        : this._document.body
      ).appendChild(this._container),
      this._domMeasurement.clearCache();
    const o = this._getVisibleBox(),
      i = this._domMeasurement.getBorderBox(t);
    if (this._renderOutsideIframe) {
      let t = document.createElement("lt-span");
      (t.style.position = "absolute"),
        (t.style.left = e.left + "px"),
        (t.style.top = e.top + "px"),
        document.documentElement.appendChild(t);
      const r = t.getBoundingClientRect();
      t.remove(), (t = null);
      const o = new DomMeasurement(this._document).getContentBox(
        this._referenceArea,
        !0
      );
      (e.left = o.left + r.left),
        (e.top = o.top + r.top),
        (e.bottom = o.top + r.top + e.height),
        (e.right = o.left + r.left + e.width);
    }
    let n = Math.min(e.left, o.width - i.width),
      s = e.bottom + 5;
    s + i.height > o.bottom && (s = Math.max(o.top, e.top - i.height - 5)),
      (t.style.left = n + "px"),
      (t.style.top = s + "px"),
      Tracker.trackEvent("Action", "check_trigger:open");
  }
  _renderContent(e) {
    const t = this._document.createElement("lt-div");
    t.classList.add("lt-errorcard__headline"),
      this.error.isSpellingError
        ? ((t.textContent = ErrorCard.MESSAGES.HEADLINE_SPELLING_ERROR),
          (t.style.color = config.COLORS.SPELLING.TITLE))
        : this.error.isStyleError
          ? ((t.textContent = ErrorCard.MESSAGES.HEADLINE_SUGGESTION_ERROR),
            (t.style.color = config.COLORS.STYLE.TITLE))
          : this.error.isPunctuationError
            ? ((t.textContent = ErrorCard.MESSAGES.HEADLINE_PUNCTUATION_ERROR),
              (t.style.color = config.COLORS.GRAMMAR.TITLE))
            : ((t.textContent = ErrorCard.MESSAGES.HEADLINE_GRAMMAR_ERROR),
              (t.style.color = config.COLORS.GRAMMAR.TITLE));
    // e.appendChild(t);
    const r = this._document.createElement("lt-div");
    if (
      (r.classList.add("lt-errorcard__text"),
        (r.textContent = this.error.description),
        e.appendChild(r),
        this.error.rule.urls && this.error.rule.urls.length > 0)
    ) {
      const e = this._document.createElement("lt-span");
      e.classList.add("lt-errorcard__more-details"),
        (e.title = ErrorCard.MESSAGES.LINK_MORE_DETAILS),
        this._eventListeners.push(
          addUseCaptureEvent(e, "click", this._onMoreDetailsClick.bind(this))
        ),
        r.appendChild(e);
    }
    const o = Math.min(this.error.fixes.length, config.MAX_FIXES_COUNT);
    for (let t = 0; t < o; t++) {
      const r = this._document.createElement("lt-span");
      r.classList.add("lt-errorcard__suggestion"),
        (r.textContent = this.error.fixes[t].value),
        (r.title = this.error.fixes[t].shortDescription || ""),
        this._eventListeners.push(
          addUseCaptureEvent(r, "click", this._onFixClick.bind(this, t))
        ),
        e.appendChild(r);
    }
    if (this.error.isSpellingError) {
      const t = this._document.createElement("lt-div");
      t.classList.add("lt-errorcard__add-to-dictionary"),
        (t.textContent = browser.i18n.getMessage(
          "addToDictionaryTitle",
          this.error.misspelledWord
        )),
        this._eventListeners.push(
          addUseCaptureEvent(
            t,
            "click",
            this._onAddToDictionaryClick.bind(this)
          )
        )
      // e.appendChild(t);
      const r = this._document.createElement("lt-div");
      r.classList.add("lt-errorcard__temporarily-ignore-word"),
        (r.textContent = ErrorCard.MESSAGES.LINK_IGNORE_HERE),
        this._eventListeners.push(
          addUseCaptureEvent(
            r,
            "click",
            this._onTemporarilyIgnoreWordClick.bind(this)
          )
        ),
        e.appendChild(r);
    } else {
      const t = this._document.createElement("lt-div");
      t.classList.add("lt-errorcard__ignore-rule"),
        (t.textContent = ErrorCard.MESSAGES.LINK_IGNORE_RULE),
        this._eventListeners.push(
          addUseCaptureEvent(t, "click", this._onIgnoreRuleClick.bind(this))
        ),
        e.appendChild(t);
      const r = this._document.createElement("lt-div");
      r.classList.add("lt-errorcard__temporarily-ignore-rule"),
        (r.textContent = ErrorCard.MESSAGES.LINK_IGNORE_HERE),
        this._eventListeners.push(
          addUseCaptureEvent(
            r,
            "click",
            this._onTemporarilyIgnoreRuleClick.bind(this)
          )
        ),
        e.appendChild(r);
    }
    const i = this._document.createElement("lt-div");
    i.classList.add("lt-errorcard__footer"),
      e.appendChild(i);
    const n = this._document.createElement("lt-div");
    n.classList.add("lt-errorcard__logo"),
      i.appendChild(n),
      this._eventListeners.push(
        addUseCaptureEvent(n, "click", this._onLogoClicked.bind(this))
      );
    const s = this._document.createElement("lt-div");
    s.classList.add("lt-errorcard__badge-container"), i.appendChild(s);
    const d = this._document.createElement("lt-div");
    d.classList.add("lt-errorcard__name"),
      (d.textContent = "Autobot"),
      s.appendChild(d);
    // const a = this._document.createElement("lt-div");
    // this._hasSubscription
    //   ? (a.classList.add("lt-errorcard__badge--premium"),
    //     (a.textContent = "Premium"))
    //   : (a.classList.add("lt-errorcard__badge--basic"),
    //     (a.textContent = "Basic")),
    //   s.appendChild(a),
    //   this._eventListeners.push(
    //     addUseCaptureEvent(a, "click", this._onBadgeClicked.bind(this))
    //   );
  }
  _onBadgeClicked(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this };
    dispatchCustomEvent(ErrorCard.eventNames.badgeClicked, t);
  }
  _onLogoClicked(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this };
    dispatchCustomEvent(ErrorCard.eventNames.logoClicked, t);
  }
  _onMoreDetailsClick(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this, url: this.error.rule.urls[0].value };
    dispatchCustomEvent(ErrorCard.eventNames.moreDetailsClicked, t);
  }
  _onFixClick(e, t) {
    t.stopImmediatePropagation();
    const r = { errorCard: this, error: this.error, fixIndex: e };
    dispatchCustomEvent(ErrorCard.eventNames.fixSelected, r);
  }
  _onAddToDictionaryClick(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this, error: this.error };
    dispatchCustomEvent(ErrorCard.eventNames.addToDictionaryClicked, t);
  }
  _onIgnoreRuleClick(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this, error: this.error };
    dispatchCustomEvent(ErrorCard.eventNames.ignoreRuleClicked, t);
  }
  _onTemporarilyIgnoreWordClick(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this, error: this.error };
    dispatchCustomEvent(ErrorCard.eventNames.temporarilyIgnoreWordClicked, t);
  }
  _onTemporarilyIgnoreRuleClick(e) {
    e.stopImmediatePropagation();
    const t = { errorCard: this, error: this.error };
    dispatchCustomEvent(ErrorCard.eventNames.temporarilyIgnoreRuleClicked, t);
  }
  _onCloseClicked(e) {
    e.stopImmediatePropagation(), this.destroy();
  }
  _onUnload() {
    this.destroy();
  }
  _onKeyDown(e) {
    "Escape" === e.key && (this.destroy(), e.stopImmediatePropagation());
  }
  destroy() {
    if (this._container) {
      this._container.remove(), (this._container = null);
      const e = { errorCard: this, error: this.error };
      dispatchCustomEvent(ErrorCard.eventNames.destroyed, e);
    }
    window.removeEventListener("pagehide", this._onUnload, !0),
      this._eventListeners.forEach(e => {
        e.destroy();
      }),
      (this._eventListeners = []);
  }
}
(ErrorCard.CONTAINER_ELEMENT_NAME = "lt-errorcard"),
  (ErrorCard.eventNames = {
    moreDetailsClicked: "lt-errorCard.moreDetailsClicked",
    fixSelected: "lt-errorCard.fixSelected",
    addToDictionaryClicked: "lt-errorCard.addToDictionaryClicked",
    ignoreRuleClicked: "lt-errorCard.ignoreRuleClicked",
    temporarilyIgnoreWordClicked: "lt-errorCard.temporarilyIgnoreWordClicked",
    temporarilyIgnoreRuleClicked: "lt-errorCard.temporarilyIgnoreRuleClicked",
    badgeClicked: "lt-errorCard.badgeClicked",
    logoClicked: "lt-errorCard.logoClicked",
    destroyed: "lt-errorCard.destroyed"
  }),
  (ErrorCard.MESSAGES = {
    HEADLINE_SPELLING_ERROR: browser.i18n.getMessage("spellingError"),
    HEADLINE_SUGGESTION_ERROR: browser.i18n.getMessage("suggestionError"),
    HEADLINE_PUNCTUATION_ERROR: browser.i18n.getMessage("punctuationError"),
    HEADLINE_GRAMMAR_ERROR: browser.i18n.getMessage("grammarError"),
    LINK_MORE_DETAILS: browser.i18n.getMessage("moreDetails"),
    LINK_IGNORE_RULE: browser.i18n.getMessage("turnOffRule"),
    LINK_IGNORE_HERE: browser.i18n.getMessage("ignoreHere")
  });
