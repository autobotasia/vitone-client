/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
var __decorate =
  (this && this.__decorate) ||
  function (e, t, n, r) {
    var s,
      i = arguments.length,
      a =
        i < 3
          ? t
          : null === r
          ? (r = Object.getOwnPropertyDescriptor(t, n))
          : r;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
      a = Reflect.decorate(e, t, n, r);
    else
      for (var o = e.length - 1; o >= 0; o--)
        (s = e[o]) && (a = (i < 3 ? s(a) : i > 3 ? s(t, n, a) : s(t, n)) || a);
    return i > 3 && a && Object.defineProperty(t, n, a), a;
  };
class CEElementInspector {
  constructor(e, t, n = !0) {
    if (
      ((this._ceElement = e),
      (this._parsingDetector = t),
      (this._nodePropertiesCache = new Map()),
      n)
    ) {
      (this._onCEElementChange = this._onCEElementChange.bind(this)),
        (this._ceElementObserver = new MutationObserver(
          this._onCEElementChange
        ));
      const e = {
        attributes: !0,
        attributeOldValue: !0,
        characterData: !0,
        characterDataOldValue: !1,
        childList: !0,
        subtree: !0,
      };
      this._ceElementObserver.observe(this._ceElement, e);
    }
  }
  static _replaceLineBreaks(e) {
    return e.replace(CEElementInspector.LINE_BREAKS_REGEXP, " ");
  }
  static _replaceWhitespaces(e) {
    return e.replace(CEElementInspector.WHITESPACES_REGEXP, " ");
  }
  static _removeZWS(e) {
    return e.replace(CEElementInspector.ZWS_REGEXP, "");
  }
  static _isBlankString(e) {
    return !e.trim();
  }
  static cached(e) {
    return (
      CEElementInspector._cacheInvalidationRules.push(e),
      function (t, n, r) {
        const s = r.value;
        return (
          (r.value = function (t) {
            const n = this._getCacheForNode(t);
            return e.key in n || (n[e.key] = s.call(this, t)), n[e.key];
          }),
          r
        );
      }
    );
  }
  _getCacheForNode(e) {
    let t = this._nodePropertiesCache.get(e);
    return t || ((t = {}), this._nodePropertiesCache.set(e, t)), t;
  }
  _deleteCacheForNode(e, t = !0) {
    if ((this._nodePropertiesCache.delete(e), t))
      for (const [t] of this._nodePropertiesCache)
        e.contains(t) && this._nodePropertiesCache.delete(t);
  }
  _normalizeMutations(e) {
    const t = {};
    e.forEach((e) => {
      "attributes" === e.type &&
        e.attributeName &&
        ((t[e.attributeName] = t[e.attributeName] || []),
        t[e.attributeName].push(e));
    });
    for (const n in t)
      if (t.hasOwnProperty(n)) {
        const r = t[n];
        if (r.length < 2) continue;
        const s = r[0];
        s.oldValue === s.target.getAttribute(n) &&
          r.forEach((t) => {
            e.splice(e.indexOf(t), 1);
          });
      }
  }
  _checkRuleConditions(e, t) {
    switch (t.type) {
      case "attributes":
        return (
          !!e.attributes &&
          (0 === e.attributes.length || e.attributes.includes(t.attributeName))
        );
      case "characterData":
        return !!e.characterData;
      case "childList":
        return !!e.childList;
    }
    return !1;
  }
  _onCEElementChange(e) {
    this._normalizeMutations(e);
    for (const t of e) {
      const e = t.target;
      if (!this._ceElement.contains(e)) {
        this._deleteCacheForNode(e);
        continue;
      }
      "childList" === t.type &&
        (t.addedNodes.forEach((e) => this._deleteCacheForNode(e)),
        t.removedNodes.forEach((e) => this._deleteCacheForNode(e)));
      const n = this.getBlockParent(e);
      for (const [r, s] of this._nodePropertiesCache) {
        const i = r === e,
          a = contains(e, r),
          o = r === n && e !== n,
          c = contains(n, r);
        for (const e of CEElementInspector._cacheInvalidationRules) {
          ((i && e.self && this._checkRuleConditions(e.self, t)) ||
            (a && e.parent && this._checkRuleConditions(e.parent, t)) ||
            (o && e.blockChild && this._checkRuleConditions(e.blockChild, t)) ||
            (c &&
              e.blockSibling &&
              this._checkRuleConditions(e.blockSibling, t)) ||
            (e.any && this._checkRuleConditions(e.any, t))) &&
            delete s[e.key];
        }
      }
    }
  }
  getComputedStyle(e) {
    return window.getComputedStyle(e);
  }
  isSkippingElement(e) {
    return (
      this._ceElement !== e &&
      (CEElementInspector.SKIPPING_TAGS.includes(e.tagName) ||
        "false" === e.getAttribute("contenteditable") ||
        "false" === e.getAttribute("spellcheck") ||
        this._parsingDetector.isQuote(e) ||
        this._parsingDetector.isSignature(e))
    );
  }
  isBlock(e) {
    if (isElementNode(e)) {
      const t = this.getComputedStyle(e);
      return CEElementInspector.DISPLAY_BLOCK_VALUES.includes(t.display || "");
    }
    return !1;
  }
  isBr(e) {
    return "BR" === e.tagName;
  }
  getParsingOptions(e) {
    const t = isElementNode(e) ? e : e.parentNode,
      n = this.getComputedStyle(t).whiteSpace;
    return {
      preserveLineBreaks: CEElementInspector.PRESERVE_LINEBREAKS_VALUES.includes(
        n || ""
      ),
      preserveWhitespaces: CEElementInspector.PRESERVE_WHITESPACES_VALUES.includes(
        n || ""
      ),
    };
  }
  getParsedText(e) {
    const t = this.getParsingOptions(e);
    let n = e.nodeValue;
    return (
      t.preserveLineBreaks || (n = CEElementInspector._replaceLineBreaks(n)),
      (n = CEElementInspector._removeZWS(n)),
      (n = CEElementInspector._replaceWhitespaces(n))
    );
  }
  getBlockParent(e) {
    let t = isElementNode(e) ? e : e.parentElement;
    for (; t !== this._ceElement && !this.isBlock(t); ) t = t.parentElement;
    return t;
  }
  isParagraphNonEmpty(e) {
    const t = new DOMWalker(e);
    for (t.next(); t.node(); ) {
      const e = t.node();
      if (isElementNode(e))
        if (this.isSkippingElement(e)) t.next(!0);
        else {
          if (this.isBr(e)) return !1;
          if (this.isBlock(e)) return !1;
          t.next();
        }
      else if (isTextNode(e)) {
        const n = this.getParsingOptions(e),
          r = this.getParsedText(e);
        if (
          (n.preserveWhitespaces && r) ||
          !CEElementInspector._isBlankString(r)
        )
          return !0;
        t.next();
      } else t.next();
    }
    return !1;
  }
  isLastTextInParagraph(e) {
    const t = this.getBlockParent(e),
      n = new DOMWalker(t, e);
    for (n.next(); n.node(); ) {
      const e = n.node();
      if (isElementNode(e))
        if (this.isSkippingElement(e)) n.next(!0);
        else {
          if (this.isBr(e)) return !0;
          if (this.isBlock(e)) return !0;
          n.next();
        }
      else if (isTextNode(e)) {
        if (this.getParsedText(e)) return !1;
        n.next();
      } else n.next();
    }
    return !0;
  }
  isParagraphEndsWithLineBreak(e) {
    const t = this.getBlockParent(e),
      n = new DOMWalker(this._ceElement, e);
    for (; n.node(); ) {
      const e = n.node();
      if (isElementNode(e))
        if (this.isSkippingElement(e)) n.next(!0);
        else {
          if (this.isBr(e)) return !0;
          if (this.isBlock(e) && this.isParagraphNonEmpty(e)) return !0;
          n.next();
        }
      else if (isTextNode(e)) {
        if (!contains(t, e)) {
          const t = this.getParsingOptions(e),
            n = this.getParsedText(e);
          if (
            (t.preserveWhitespaces && n) ||
            !CEElementInspector._isBlankString(n)
          )
            return !0;
        }
        n.next();
      } else n.next();
    }
    return !1;
  }
  destroy() {
    this._ceElementObserver && this._ceElementObserver.disconnect(),
      this._nodePropertiesCache.clear();
  }
}
(CEElementInspector.SKIPPING_TAGS = [
  "CODE",
  "NOSCRIPT",
  "OBJECT",
  "SCRIPT",
  "STYLE",
  "TEMPLATE",
  "VAR",
  "CANVAS",
  "IMG",
  "SVG",
  "BLOCKQUOTE",
]),
  (CEElementInspector.DISPLAY_BLOCK_VALUES = [
    "block",
    "list-item",
    "table",
    "table-caption",
    "table-row",
    "table-cell",
    "flex",
    "grid",
  ]),
  (CEElementInspector.PRESERVE_LINEBREAKS_VALUES = [
    "pre",
    "pre-wrap",
    "pre-line",
  ]),
  (CEElementInspector.PRESERVE_WHITESPACES_VALUES = ["pre", "pre-wrap"]),
  (CEElementInspector.ZWS = String.fromCharCode(8203)),
  (CEElementInspector.WHITESPACES = [
    8,
    9,
    32,
    8194,
    8195,
    8196,
    8197,
    8198,
    8199,
    8200,
    8201,
    8202,
    8203,
    8287,
    12288,
  ].map(function (e) {
    return String.fromCharCode(e);
  })),
  (CEElementInspector._cacheInvalidationRules = []),
  (CEElementInspector.LINE_BREAKS_REGEXP = /\n/g),
  (CEElementInspector.WHITESPACES_REGEXP = new RegExp(
    "[" + CEElementInspector.WHITESPACES.join("") + "]",
    "g"
  )),
  (CEElementInspector.ZWS_REGEXP = new RegExp(CEElementInspector.ZWS, "g")),
  __decorate(
    [
      CEElementInspector.cached({
        key: "computedStyle",
        self: { attributes: ["id", "class", "style"] },
        parent: { attributes: ["id", "class", "style"] },
      }),
    ],
    CEElementInspector.prototype,
    "getComputedStyle",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "isSkippingElement",
        any: { attributes: [], childList: !0 },
      }),
    ],
    CEElementInspector.prototype,
    "isSkippingElement",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "isBlock",
        self: { attributes: ["id", "class", "style"] },
        parent: { attributes: ["id", "class", "style"] },
      }),
    ],
    CEElementInspector.prototype,
    "isBlock",
    null
  ),
  __decorate(
    [CEElementInspector.cached({ key: "isBr" })],
    CEElementInspector.prototype,
    "isBr",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "parsingOptions",
        self: { attributes: ["id", "class", "style"] },
        parent: { attributes: ["id", "class", "style"] },
      }),
    ],
    CEElementInspector.prototype,
    "getParsingOptions",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "parsedText",
        self: { characterData: !0 },
        parent: { attributes: ["id", "class", "style"] },
      }),
    ],
    CEElementInspector.prototype,
    "getParsedText",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "blockParent",
        self: { attributes: ["id", "class", "style"] },
        parent: { attributes: ["id", "class", "style"] },
      }),
    ],
    CEElementInspector.prototype,
    "getBlockParent",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "isParagraphNonEmpty",
        parent: { attributes: ["id", "class", "style"] },
        blockChild: { attributes: [], characterData: !0, childList: !0 },
      }),
    ],
    CEElementInspector.prototype,
    "isParagraphNonEmpty",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "isLastTextInParagraph",
        parent: { attributes: [] },
        blockSibling: { attributes: [], characterData: !0, childList: !0 },
      }),
    ],
    CEElementInspector.prototype,
    "isLastTextInParagraph",
    null
  ),
  __decorate(
    [
      CEElementInspector.cached({
        key: "isParagraphEndsWithLineBreak",
        any: { attributes: [], characterData: !0, childList: !0 },
      }),
    ],
    CEElementInspector.prototype,
    "isParagraphEndsWithLineBreak",
    null
  );
