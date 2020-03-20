/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Highlighter {
  constructor(e, t, i = e, s, n = !1) {
    (this._currentZIndex = null),
      (this._inputArea = e),
      (this._inputAreaWrapper = t),
      (this._ceElement = i),
      (this._appearance = s),
      (this._isMirror = n),
      (this._highlightedText = ""),
      (this._highlightedBlocks = []),
      (this._domMeasurement = new DomMeasurement(e.ownerDocument)),
      (this._onInputAreaScroll = bindAndCatch(this._onInputAreaScroll, this)),
      (this._onCEElementClick = bindAndCatch(this._onCEElementClick, this)),
      (this._onContentChanged = bindAndCatch(this._onContentChanged, this)),
      (this._render = bindAndCatch(this._render, this)),
      this._inputArea.addEventListener("scroll", this._onInputAreaScroll),
      this._ceElement.addEventListener("click", this._onCEElementClick),
      this._ceElement.addEventListener(
        Mirror.eventNames.click,
        this._onCEElementClick
      ),
      (this._isDraftJsIssue = Boolean(
        this._ceElement.firstElementChild &&
          this._ceElement.firstElementChild.hasAttribute("data-contents")
      )),
      (this._contentChangedObserver = new MutationObserver(
        this._onContentChanged
      ));
    const r = {
      attributes: !1,
      attributeOldValue: !1,
      characterData: !0,
      characterDataOldValue: !1,
      childList: !0,
      subtree: !0
    };
    n ||
      ((r.attributes = !0),
      (r.attributeFilter = ["style", "class", "size", "face", "align"])),
      this._contentChangedObserver.observe(this._ceElement, r),
      window.ResizeObserver &&
        ((this._ceElementResizeObserver = new window.ResizeObserver(
          this._render
        )),
        this._ceElementResizeObserver.observe(this._ceElement)),
      (this._renderInterval = setAnimationFrameInterval(
        this._render,
        config.RENDER_INTERVAL
      )),
      this._render();
  }
  _toPageCoordinates(e, t) {
    const i = this._domMeasurement.getPaddingBox(t),
      s = this._getCEElementScroll(),
      n = e.top + i.top - s.top,
      r = e.left + i.left - s.left;
    return {
      top: n,
      left: r,
      bottom: n + e.height,
      right: r + e.width,
      width: e.width,
      height: e.height
    };
  }
  _toElementCoordinates(e, t) {
    const i = this._domMeasurement.getPaddingBox(t, !1),
      s = this._getCEElementScroll();
    return { x: e.x - i.left + s.left, y: e.y - i.top + s.top };
  }
  _getCEElementScroll(e = !0) {
    return this._isMirror
      ? {
          top: +this._ceElement.dataset.ltScrollTop,
          left: +this._ceElement.dataset.ltScrollLeft
        }
      : (e && this._domMeasurement.clearCache(),
        this._domMeasurement.getScrollPosition(this._ceElement));
  }
  _getTargetElement() {
    return this._isDraftJsIssue &&
      this._ceElement.parentNode &&
      this._ceElement.parentNode.parentNode
      ? this._ceElement.parentNode
      : this._ceElement;
  }
  _render() {
    if (!this._ceElement.parentNode || !this._inputArea.parentNode) return;
    const e = this._inputArea.ownerDocument;
    this._domMeasurement.clearCache(),
      this._container ||
        ((this._container = e.createElement(
          Highlighter.CONTAINER_ELEMENT_NAME
        )),
        this._container.setAttribute("contenteditable", "false"),
        (this._wrapper = e.createElement("lt-div")),
        this._wrapper.setAttribute("spellcheck", "false"),
        (this._wrapper.className = "lt-highlighter__wrapper"),
        (this._canvas = e.createElement("canvas")),
        (this._canvas.className = "lt-highlighter__canvas"),
        this._wrapper.appendChild(this._canvas),
        this._container.appendChild(this._wrapper));
    const t = {};
    if (
      this._inputArea === e.body &&
      e.scrollingElement === e.documentElement &&
      "BackCompat" !== e.compatMode
    ) {
      const e = this._domMeasurement.getStyles(this._inputArea, [
        "overflow-x",
        "overflow-y"
      ]);
      (t["overflow-x"] = "hidden" === e["overflow-x"] ? "hidden" : "visible"),
        (t["overflow-y"] = "hidden" === e["overflow-y"] ? "hidden" : "visible");
    }
    const i = this._domMeasurement.getPaddingBox(this._ceElement),
      s = this._domMeasurement.getScaleFactor(this._ceElement),
      n = i.width * s,
      r = i.height * s,
      h = this._width,
      o = this._height;
    (t.width = n + "px"),
      (t.height = r + "px"),
      this._domMeasurement.setStyles(this._wrapper, t, !0);
    const a =
        this._isDraftJsIssue && this._ceElement.parentNode.parentNode
          ? this._ceElement.parentNode
          : this._inputArea,
      l = this._appearance.getZIndex(a, this._domMeasurement);
    l !== this._currentZIndex &&
      (null !== l && l > 0
        ? ((this._currentZIndex = l),
          this._domMeasurement.setStyles(
            this._container,
            { "z-index": String(l) },
            !0
          ))
        : this._currentZIndex &&
          ((this._currentZIndex = null),
          this._domMeasurement.setStyles(
            this._container,
            { "z-index": "auto" },
            !0
          ))),
      this._updateScrolling();
    const c = this._getTargetElement();
    c.previousElementSibling !== this._container &&
      c.parentNode.insertBefore(this._container, c);
    const _ = this._domMeasurement.getPaddingBox(this._wrapper),
      d = i.top - _.top;
    if (Math.abs(d) > 0.05) {
      let e = parseFloat(
        this._domMeasurement.getStyle(this._wrapper, "margin-top")
      );
      (e += d),
        this._domMeasurement.setStyles(
          this._wrapper,
          { "margin-top": e + "px" },
          !0
        );
    }
    const m = i.left - _.left;
    if (Math.abs(m) > 0.05) {
      let e = parseFloat(
        this._domMeasurement.getStyle(this._wrapper, "margin-left")
      );
      (e += m),
        this._domMeasurement.setStyles(
          this._wrapper,
          { "margin-left": e + "px" },
          !0
        );
    }
    const g = this._domMeasurement.getScrollDimensions(this._inputArea);
    (n === h &&
      r === o &&
      this._canvas.width === g.width &&
      this._canvas.height === g.height) ||
      ((this._width = n), (this._height = r), this._redraw(!1));
  }
  _redraw(e = !0) {
    e && this._domMeasurement.clearCache(),
      (this._highlightedText = this._inputAreaWrapper.getText());
    const t = this._domMeasurement.getScrollDimensions(this._inputArea),
      i = t.width,
      s = t.height;
    if (
      ((this._canvas.width = i),
      (this._canvas.height = s),
      !this._highlightedBlocks.length)
    )
      return;
    const n = this._canvas.getContext("2d");
    n.lineWidth = 2;
    const r = this._getCEElementScroll(!1),
      h = this._domMeasurement.getScaleFactor(this._ceElement);
    for (const e of this._highlightedBlocks) {
      const t = this._inputAreaWrapper.getTextRanges(e.offset, e.length),
        o = this._domMeasurement.getTextBoundingBoxes(t, this._ceElement, r);
      if (e.isEmphasized) {
        n.fillStyle = e.backgroundColor;
        for (const e of o) {
          const t = Math.max(0, (e.left - 1) * h),
            r = Math.min(i, (e.right + 1) * h),
            o = Math.max(0, e.top * h),
            a = Math.min(s, e.bottom * h);
          n.fillRect(t, o, r - t, a - o);
        }
      }
      if (e.isUnderlined) {
        n.strokeStyle = e.underlineColor;
        for (const e of o) {
          const t = Math.max(0, (e.left - 1) * h),
            r = Math.min(i, (e.right + 1) * h),
            o = Math.min(s - 1, e.bottom * h);
          n.beginPath(), n.moveTo(t, o), n.lineTo(r, o), n.stroke();
        }
      }
      e.textBoxes = o;
    }
  }
  _updateScrolling() {
    const e = this._getCEElementScroll();
    this._domMeasurement.setStyles(
      this._canvas,
      { "margin-top": -e.top + "px", "margin-left": -e.left + "px" },
      !0
    );
  }
  _onInputAreaScroll() {
    this._container &&
      window.requestAnimationFrame(() => {
        this._updateScrolling();
      });
  }
  _onCEElementClick(e) {
    if ((this._isMirror && e.stopImmediatePropagation(), !this._container))
      return;
    this._domMeasurement.clearCache();
    let t = { x: e.clientX, y: e.clientY };
    t = this._toElementCoordinates(t, this._ceElement);
    for (const e of this._highlightedBlocks) {
      const i = e.textBoxes.find(e => isPointInsideRect(e, t));
      if (i) {
        const t = {
          highlighter: this,
          blockId: e.id,
          clickedRectangle: this._toPageCoordinates(i, this._ceElement)
        };
        return void dispatchCustomEvent(Highlighter.eventNames.blockClicked, t);
      }
    }
  }
  _onContentChanged(e) {
    if (!this._container) return;
    const t = this._inputAreaWrapper.getText(),
      i = e.some(e => {
        if ("attributes" === e.type) return !0;
        if (this._isMirror) return !1;
        return (
          !!Array.from(e.addedNodes || []).some(
            e => e.nodeType === document.ELEMENT_NODE
          ) ||
          !!Array.from(e.removedNodes || []).some(
            e => e.nodeType === document.ELEMENT_NODE
          )
        );
      });
    (this._highlightedText !== t || i) && this._redraw();
  }
  highlight(e = []) {
    (this._highlightedBlocks = e), this._redraw();
  }
  destroy() {
    this._inputArea.removeEventListener("scroll", this._onInputAreaScroll),
      this._ceElement.removeEventListener("click", this._onCEElementClick),
      this._ceElement.removeEventListener(
        Mirror.eventNames.click,
        this._onCEElementClick
      ),
      this._contentChangedObserver.disconnect(),
      this._renderInterval && this._renderInterval.destroy(),
      this._container && this._container.remove(),
      this._ceElementResizeObserver &&
        this._ceElementResizeObserver.disconnect(),
      this._domMeasurement.clearCache();
  }
}
(Highlighter.CONTAINER_ELEMENT_NAME = "lt-highlighter"),
  (Highlighter.eventNames = { blockClicked: "lt-highlighter.blockClicked" });
