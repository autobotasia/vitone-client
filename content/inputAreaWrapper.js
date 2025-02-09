/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class InputAreaWrapper {
  constructor(e, t, n) {
    if (
      ((this._inputAreaObserver = null),
        (this._scrollToInterval = null),
        (this._inputArea = e),
        (this._ceElement = t),
        (this._ceElementInspector = new CEElementInspector(
          t,
          n,
          "TEXTAREA" !== this._inputArea.tagName
        )),
        (this._domMeasurement = new DomMeasurement(
          this._inputArea.ownerDocument
        )),
        this._updateTextChunks(),
        (this._currentText = this.getText()),
        (this._scrollToInterval = null),
        (this._onScroll = bindAndCatch(this._onScroll, this)),
        (this._onBlur = bindAndCatch(this._onBlur, this)),
        (this._onPaste = bindAndCatch(this._onPaste, this)),
        (this._onClick = bindAndCatch(this._onClick, this)),
        (this._onInput = bindAndCatch(this._onInput, this)),
        this._inputArea.addEventListener("scroll", this._onScroll),
        "BODY" === this._inputArea.nodeName &&
        window.addEventListener("scroll", this._onScroll),
        this._inputArea.addEventListener("blur", this._onBlur),
        this._inputArea.addEventListener("paste", this._onPaste),
        this._inputArea.addEventListener("click", this._onClick),
        (this._scrollTop = this._inputArea.scrollTop),
        (this._scrollLeft = this._inputArea.scrollLeft),
        isCEElement(this._inputArea))
    ) {
      this._inputAreaObserver = new MutationObserver(this._onInput);
      const e = {
        attributes: !0,
        attributeOldValue: !1,
        characterData: !0,
        characterDataOldValue: !1,
        childList: !0,
        subtree: !0,
        attributeFilter: ["id", "class", "style"]
      };
      this._inputAreaObserver.observe(this._inputArea, e);
    }
    this._ceElement.addEventListener(Mirror.eventNames.input, this._onInput);
  }
  static _indexWithZWS(e, t) {
    let n = 0;
    for (; t > 0 && n < e.length;) e[n] !== InputAreaWrapper.ZWS && t--, n++;
    return n;
  }
  static _appendTrailingLineBreak(e) {
    return (e && "\n" === e[e.length - 1]) || (e += "\n"), e;
  }
  static _selectText(e, t = 0, n = e.nodeValue.length) {
    (t = Math.max(t, 0)), (n = Math.min(n, e.nodeValue.length));
    const s = window.getSelection();
    s.empty();
    const r = new Range();
    r.setStart(e, t), r.setEnd(e, n), s.addRange(r);
  }
  static _simulateSelection(e) {
    const t = window.getSelection();
    t.empty();
    const n = new Range();
    n.setStart(e, 0), n.collapse(), t.addRange(n);
    const s = new MouseEvent("mousedown", { bubbles: !0, cancelable: !1 }),
      r = new MouseEvent("mouseup", { bubbles: !0, cancelable: !1 });
    e.dispatchEvent(s), e.dispatchEvent(r);
  }
  static _applyReplacement(e, t = !0) {
    let n = Promise.resolve();
    return (
      t &&
      (n = n
        .then(() =>
          InputAreaWrapper._simulateSelection(e.textNode.parentNode)
        )
        .then(() => wait())),
      (n = n
        .then(() => {
          const t = InputAreaWrapper._indexWithZWS(
            e.textNode.nodeValue,
            e.offset
          ),
            n = InputAreaWrapper._indexWithZWS(
              e.textNode.nodeValue,
              e.offset + e.length
            );
          InputAreaWrapper._selectText(e.textNode, t, n);
        })
        .then(() => {
          document.querySelectorAll("span[data-text='true']").forEach(function (element) {
            element.innerText = element.innerText.replace(element.innerText, e.replacementText);
          });
          // document.execCommand("insertText", !1, e.replacementText) 
        })),
      BrowserDetector.isFirefox() &&
      e.replacementText.includes(InputAreaWrapper.NBSP) &&
      (n = n.then(() => (e.textNode.nodeValue = e.newText))),
      n
    );
  }
  _updateTextChunks() {
    const e = new DOMWalker(this._ceElement),
      t = [];
    let n = 0;
    do {
      const s = e.node();
      let r = "",
        i = "";
      if (isElementNode(s)) {
        if (this._ceElementInspector.isSkippingElement(s)) {
          e.next(!0);
          continue;
        }
        this._ceElementInspector.isBr(s) && (i = "\n");
      } else
        isTextNode(s) &&
          ((r = s.nodeValue),
            (i = this._ceElementInspector.getParsedText(s)) &&
            this._ceElementInspector.isLastTextInParagraph(s) &&
            this._ceElementInspector.isParagraphEndsWithLineBreak(s) &&
            (i = InputAreaWrapper._appendTrailingLineBreak(i)));
      if (
        (t.push({ node: s, rawText: r, parsedText: i }),
          (n += i.length) > config.MAX_TEXT_LENGTH_PREMIUM)
      )
        break;
      e.next();
    } while (e.node());
    this._textChunks = t;
  }
  _getTextPosition(e) {
    for (const { node: t, parsedText: n, rawText: s } of this._textChunks) {
      if (isTextNode(t) && e <= n.length)
        return { textNode: t, offset: InputAreaWrapper._indexWithZWS(s, e) };
      e -= n.length;
    }
    return null;
  }
  _getTextOffset(e, t) {
    let n = 0;
    for (const t of this._textChunks) {
      if (t.node === e) break;
      n += t.parsedText.length;
    }
    return (
      n +
      (t -
        (e.nodeValue || "")
          .substring(0, t)
          .split("")
          .reduce((e, t) => (t === InputAreaWrapper.ZWS ? e + 1 : e), 0))
    );
  }
  _onScroll() {
    let e = 0,
      t = 0;
    if (
      ("BODY" === this._inputArea.nodeName
        ? ((e =
          (document.body && document.body.scrollTop) ||
          (document.documentElement && document.documentElement.scrollTop) ||
          0),
          (t =
            (document.body && document.body.scrollLeft) ||
            (document.documentElement && document.documentElement.scrollLeft) ||
            0))
        : ((e = this._inputArea.scrollTop), (t = this._inputArea.scrollLeft)),
        this._scrollTop === e && this._scrollLeft === t)
    )
      return;
    (this._scrollTop = e), (this._scrollLeft = t);
    const n = { inputAreaWrapper: this };
    dispatchCustomEvent(InputAreaWrapper.eventNames.scroll, n);
  }
  _onPaste() {
    const e = { inputAreaWrapper: this };
    dispatchCustomEvent(InputAreaWrapper.eventNames.paste, e);
  }
  _onBlur() {
    const e = { inputAreaWrapper: this };
    dispatchCustomEvent(InputAreaWrapper.eventNames.blur, e);
  }
  _onClick() {
    const e = { inputAreaWrapper: this };
    dispatchCustomEvent(InputAreaWrapper.eventNames.click, e);
  }
  _onInput() {
    this._updateTextChunks();
    const e = this.getText();
    if (this._currentText === e) return;
    this._currentText = e;
    const t = { inputAreaWrapper: this, text: e };
    dispatchCustomEvent(InputAreaWrapper.eventNames.textChanged, t);
  }
  getText() {
    return this._textChunks.map(e => e.parsedText).join("");
  }
  getTextRanges(e, t) {
    const n = [];
    for (const { node: s, parsedText: r, rawText: i } of this._textChunks)
      if (isTextNode(s)) {
        if (0 === e) {
          const a = InputAreaWrapper._indexWithZWS(i, e),
            o = InputAreaWrapper._indexWithZWS(i, t);
          n.push({ textNode: s, start: a, end: o }), (t -= r.length);
        } else if (e < r.length) {
          const a = InputAreaWrapper._indexWithZWS(i, e),
            o = InputAreaWrapper._indexWithZWS(i, e + t);
          n.push({ textNode: s, start: a, end: o }),
            (t -= r.length - e),
            (e = 0);
        } else e -= r.length;
        if (t <= 0) break;
      } else e -= r.length;
    return n;
  }
  replaceText(e, t, n) {
    const s = e + n.length;
    if (isTextArea(this._inputArea) || isTextInput(this._inputArea)) {
      this.setSelection({ start: e, end: e + t });
      const r = document.execCommand("insertText", !1, n),
        i = BrowserDetector.isFirefox() && n.includes(InputAreaWrapper.NBSP);
      if (r) {
        if (i) {
          const t = this._inputArea.value,
            s = t.substring(0, e) + n + t.substring(e + n.length);
          this._inputArea.value = s;
        }
      } else {
        const s = this._inputArea.value,
          r = s.substring(0, e) + n + s.substring(e + t);
        this._inputArea.value = r;
      }
      this.setSelection({ start: s }), r || this.simulateInput(n);
    } else if (isCEElement(this._inputArea)) {
      const r = Promise.resolve(),
        i =
          !isTinyMCE(this._inputArea) &&
          !isGutenberg(this._inputArea) &&
          !isTrixEditor(this._inputArea);
      return (
        i && r.then(() => InputAreaWrapper._simulateSelection(this._inputArea)),
        r
          .then(() => wait(50))
          .then(() => {
            const r = [];
            for (const { node: s, parsedText: i } of this._textChunks) {
              if (isTextNode(s) && e < i.length) {
                let a = Math.min(i.length - e, n.length);
                e + t <= i.length && (a = n.length);
                const o = i.substr(0, e) + n.substr(0, a) + i.substr(e + t);
                s.nodeValue !== o &&
                  r.push({
                    textNode: s,
                    offset: e,
                    length: t,
                    replacementText: n.substr(0, a),
                    newText: o
                  }),
                  (t = Math.max(e + t - i.length, 0)),
                  (e = 0),
                  (n = n.substr(a));
              } else e -= i.length;
              if (0 === t && "" === n) break;
            }
            r.reverse()
              .reduce(
                (e, t) =>
                  e.then(() => InputAreaWrapper._applyReplacement(t, i)),
                Promise.resolve()
              )
              .then(() => {
                this.setSelection({ start: s });
              })
              .then(() => this.simulateInput(n));
          })
      );
    }
    return Promise.resolve();
  }
  simulateInput(e = "") {
    const t = new window.InputEvent("input", {
      bubbles: !0,
      cancelable: !1,
      inputType: "insertText",
      data: e
    });
    this._inputArea.dispatchEvent(t);
    const n = new Event("compositionend", { bubbles: !0, cancelable: !1 });
    this._inputArea.dispatchEvent(n);
    const s = new Event("change", { bubbles: !0, cancelable: !1 });
    this._inputArea.dispatchEvent(s);
  }
  getSelection() {
    if (isTextArea(this._inputArea) || isTextInput(this._inputArea))
      return this._inputArea !== document.activeElement
        ? null
        : {
          start: this._inputArea.selectionStart,
          end: this._inputArea.selectionEnd
        };
    {
      const e = window.getSelection();
      if (!e.anchorNode) return null;
      if (!this._inputArea.contains(e.anchorNode)) return null;
      const t = this._getTextOffset(e.anchorNode, e.anchorOffset);
      return {
        start: t,
        end: e.isCollapsed ? t : this._getTextOffset(e.focusNode, e.focusOffset)
      };
    }
  }
  setSelection(e) {
    if (
      (void 0 === e.end && (e.end = e.start),
        this._inputArea.focus(),
        isTextArea(this._inputArea) || isTextInput(this._inputArea))
    )
      (this._inputArea.selectionStart = e.start),
        (this._inputArea.selectionEnd = e.end);
    else if (isCEElement(this._inputArea)) {
      const t = this._getTextPosition(e.start);
      if (!t) return;
      const n = window.getSelection();
      n.removeAllRanges();
      const s = new Range();
      if ((s.setStart(t.textNode, t.offset), e.start !== e.end)) {
        const t = this._getTextPosition(e.end);
        if (!t) return;
        s.setEnd(t.textNode, t.offset);
      } else s.collapse();
      n.addRange(s);
    }
  }
  scrollToText(e, t, n = 300) {
    function s(e, t, n, s) {
      return (e /= s / 2) < 1
        ? (n / 2) * e * e + t
        : (-n / 2) * (--e * (e - 2) - 1) + t;
    }
    if (isTextArea(this._inputArea) || isTextInput(this._inputArea)) {
      this._scrollToInterval &&
        (this._scrollToInterval.destroy(), (this._scrollToInterval = null));
      const r = this.getTextRanges(e, t),
        i = {
          top: this._inputArea.scrollTop,
          left: this._inputArea.scrollLeft
        };
      this._domMeasurement.clearCache();
      const a = this._domMeasurement.getTextBoundingBox(r, this._ceElement),
        o = this._inputArea.getBoundingClientRect();
      let l = a.top;
      o.top < 0 && (l += o.top);
      let p = Math.max(0, a.right - o.width);
      o.left < 0 && (p += o.left);
      const u = i.top,
        h = i.left,
        c = l - u,
        d = p - h;
      let _ = 0;
      this._scrollToInterval = setAnimationFrameInterval(() => {
        const e = s((_ += InputAreaWrapper.SCROLL_TO_FRAME_INTERVAL), u, c, n),
          t = s(_, h, d, n);
        (this._inputArea.scrollTop = e),
          (this._inputArea.scrollLeft = t),
          _ >= n &&
          this._scrollToInterval &&
          (this._scrollToInterval.destroy(), (this._scrollToInterval = null));
      }, InputAreaWrapper.SCROLL_TO_FRAME_INTERVAL);
    } else if (isCEElement(this._inputArea)) {
      const t = this._getTextPosition(e);
      t &&
        t.textNode.parentElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
    }
  }
  destroy() {
    this._inputArea.removeEventListener("scroll", this._onScroll),
      this._inputArea.removeEventListener("blur", this._onBlur),
      this._inputArea.removeEventListener("paste", this._onPaste),
      this._inputArea.removeEventListener("click", this._onClick),
      window.removeEventListener("scroll", this._onScroll),
      this._ceElement.removeEventListener(
        Mirror.eventNames.input,
        this._onInput
      ),
      this._ceElementInspector.destroy(),
      this._scrollToInterval && this._scrollToInterval.destroy(),
      this._inputAreaObserver && this._inputAreaObserver.disconnect();
  }
}
(InputAreaWrapper.eventNames = {
  textChanged: "lt-inputAreaWrapper.textChanged",
  scroll: "lt-inputAreaWrapper.scroll",
  paste: "lt-inputAreaWrapper.paste",
  blur: "lt-inputAreaWrapper.blur",
  click: "lt-inputAreaWrapper.click"
}),
  (InputAreaWrapper.SCROLL_TO_FRAME_INTERVAL = 20),
  (InputAreaWrapper.NBSP = String.fromCharCode(160)),
  (InputAreaWrapper.ZWS = String.fromCharCode(8203));
