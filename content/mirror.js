/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Mirror {
  constructor(e) {
    (this._mimickedElement = e),
      (this._domMeasurement = new DomMeasurement(
        this._mimickedElement.ownerDocument
      )),
      (this._render = bindAndCatch(this._render, this)),
      (this._updateText = bindAndCatch(this._updateText, this)),
      (this._onMimickedElementScroll = bindAndCatch(
        this._onMimickedElementScroll,
        this
      )),
      (this._onMimickedElementClick = bindAndCatch(
        this._onMimickedElementClick,
        this
      )),
      this._render(),
      this._mimickedElement.addEventListener(
        "scroll",
        this._onMimickedElementScroll
      ),
      this._mimickedElement.addEventListener(
        "mousemove",
        this._onMimickedElementClick
      ),
      this._mimickedElement.addEventListener(
        "click",
        this._onMimickedElementClick
      ),
      this._mimickedElement.addEventListener("input", this._updateText),
      window.ResizeObserver &&
        ((this._mimickedElementResizeObserver = new window.ResizeObserver(
          this._render
        )),
        this._mimickedElementResizeObserver.observe(this._mimickedElement)),
      (this._renderInterval = setAnimationFrameInterval(
        this._render,
        config.RENDER_INTERVAL
      ));
  }
  static getElementByPos(e, t, i) {
    const n = new DOMWalker(e);
    let s = null;
    do {
      const e = n.node();
      if (isElementNode(e)) {
        getBorderBoxes(e).some(e => isPointInsideRect(e, t, i)) && (s = e);
      }
    } while (n.next());
    return s;
  }
  _dispatchClick(e, t) {
    const i = new MouseEvent(Mirror.eventNames.click, {
      view: window,
      screenX: t.screenX,
      screenY: t.screenY,
      clientX: t.clientX,
      clientY: t.clientY,
      button: t.button,
      buttons: t.buttons,
      ctrlKey: t.ctrlKey,
      shiftKey: t.shiftKey,
      altKey: t.altKey,
      bubbles: !0,
      cancelable: !0
    });
    e.dispatchEvent(i);
  }
  _dispatchInput() {
    const e = new Event(Mirror.eventNames.input, {
      bubbles: !0,
      cancelable: !0
    });
    this.getCloneElement().dispatchEvent(e);
  }
  _render() {
    if (!this._mimickedElement.parentElement) return;
    this._domMeasurement.clearCache();
    const e = this._domMeasurement.getBorderBox(this._mimickedElement, !1),
      t = this._domMeasurement.getContentBox(this._mimickedElement);
    this._container ||
      ((this._container = document.createElement(
        Mirror.CONTAINER_ELEMENT_NAME
      )),
      (this._wrapper = document.createElement("lt-div")),
      this._wrapper.setAttribute("spellcheck", "false"),
      (this._wrapper.className = "lt-mirror__wrapper"),
      (this._canvas = document.createElement("lt-div")),
      (this._canvas.className = "lt-mirror__canvas"),
      this._wrapper.appendChild(this._canvas),
      this._container.appendChild(this._wrapper),
      (this._elementInlineLineHeight = this._domMeasurement.getInlineStyle(
        this._mimickedElement,
        "line-height"
      )),
      (this._elementComputedLineHeight = this._domMeasurement.getStyle(
        this._mimickedElement,
        "line-height"
      ))),
      this._mimickedElement.style.lineHeight === this._elementComputedLineHeight
        ? this._domMeasurement.setStyles(this._mimickedElement, {
            "line-height": this._elementInlineLineHeight
          })
        : (this._elementInlineLineHeight = this._domMeasurement.getInlineStyle(
            this._mimickedElement,
            "lineHeight"
          )),
      (this._elementComputedLineHeight = this._domMeasurement.getStyle(
        this._mimickedElement,
        "line-height"
      )),
      this._elementComputedLineHeight.includes("px") &&
        this._domMeasurement.setStyles(this._mimickedElement, {
          "line-height": this._elementComputedLineHeight
        });
    this._domMeasurement.copyStyles(
      this._mimickedElement,
      this._wrapper,
      [
        "border",
        "border-radius",
        "border-top-width",
        "border-right-width",
        "border-left-width",
        "border-bottom-width",
        "border-top-style",
        "border-right-style",
        "border-left-style",
        "border-bottom-style",
        "direction",
        "font",
        "font-family",
        "font-feature-settings",
        "font-kerning",
        "font-language-override",
        "font-size",
        "font-size-adjust",
        "font-stretch",
        "font-style",
        "font-synthesis",
        "font-variant",
        "font-variant-caps",
        "font-variant-east-asian",
        "font-variant-ligatures",
        "font-variant-numeric",
        "font-weight",
        "hyphens",
        "letter-spacing",
        "line-break",
        "line-height",
        "margin",
        "margin-top",
        "margin-left",
        "margin-bottom",
        "margin-right",
        "padding",
        "padding-top",
        "padding-left",
        "padding-right",
        "padding-bottom",
        "text-align",
        "text-decoration",
        "text-indent",
        "text-transform",
        "word-spacing",
        "word-wrap"
      ],
      !0
    ),
      this._updateText(),
      this._mimickedElement.previousElementSibling !== this._container &&
        this._mimickedElement.parentElement.insertBefore(
          this._container,
          this._mimickedElement
        ),
      this._domMeasurement.setStyles(
        this._wrapper,
        { width: t.width + "px", height: t.height + "px" },
        !0
      );
    const i = this._domMeasurement.getBorderBox(this._wrapper, !1),
      n = e.left - i.left;
    if (Math.abs(n) > 0.05) {
      let e = parseFloat(
        this._domMeasurement.getStyle(this._wrapper, "margin-left")
      );
      (e += n),
        this._domMeasurement.setStyles(
          this._wrapper,
          { "margin-left": e + "px" },
          !0
        );
    }
    const s = e.top - i.top;
    if (Math.abs(s) > 0.05) {
      let e = parseFloat(
        this._domMeasurement.getStyle(this._wrapper, "margin-top")
      );
      (e += s),
        this._domMeasurement.setStyles(
          this._wrapper,
          { "margin-top": e + "px" },
          !0
        );
    }
    const r = this._domMeasurement.getScrollDimensions(this._mimickedElement);
    let m = r.width - t.padding.left - t.padding.right,
      l = r.height - t.padding.top - t.padding.bottom;
    m === Math.round(t.width) && (m = t.width),
      this._domMeasurement.setStyles(
        this._canvas,
        { width: m + "px", height: l + "px" },
        !0
      ),
      this._updateScrolling(!1);
  }
  _updateScrolling(e = !0) {
    e && this._domMeasurement.clearCache();
    const t = this._domMeasurement.getScrollPosition(this._mimickedElement);
    this._domMeasurement.setStyles(
      this._canvas,
      { "margin-top": -t.top + "px", "margin-left": -t.left + "px" },
      !0
    ),
      (this._wrapper.dataset.ltScrollTop = t.top.toString()),
      (this._wrapper.dataset.ltScrollLeft = t.left.toString());
  }
  _updateText() {
    const e = this._mimickedElement.value;
    this._currentText !== e &&
      ((this._currentText = e),
      (this._canvas.textContent = e),
      this._updateScrolling(),
      this._dispatchInput());
  }
  _onMimickedElementScroll() {
    window.requestAnimationFrame(() => {
      this._updateScrolling();
    });
  }

  _onMimickedElementClick = debouncedOnEvent(config.EVENT_MOUSE_MOVE_DEBOUNCE_TIMEOUT, function(e, context) {
    if (void 0 === e.clientX || void 0 === e.clientY) return;
    const t = Mirror.getElementByPos(
      context.getCloneElement(),
      e.clientX,
      e.clientY
    );
    t && context._dispatchClick(t, e);
  });

  getCloneElement() {
    return this._wrapper;
  }
  enableRangeMeasurements() {
    this._wrapper.classList.add("lt-mirror-enable-range-measurement");
  }
  disableRangeMeasurements() {
    this._wrapper.classList.remove("lt-mirror-enable-range-measurement");
  }
  destroy() {
    this._mimickedElement.removeEventListener("input", this._updateText),
      this._mimickedElement.removeEventListener(
        "scroll",
        this._onMimickedElementScroll
      ),
      this._mimickedElement.removeEventListener(
        "click",
        this._onMimickedElementClick
      ),
      this._renderInterval && this._renderInterval.destroy(),
      this._container && this._container.remove(),
      this._mimickedElementResizeObserver &&
        this._mimickedElementResizeObserver.disconnect(),
      this._domMeasurement.clearCache();
  }
}
(Mirror.CONTAINER_ELEMENT_NAME = "lt-mirror"),
  (Mirror.eventNames = { input: "lt-mirror-input", click: "lt-mirror-click" });
