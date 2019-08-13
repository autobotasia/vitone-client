/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
const IMPORTANT_REG_EXP = /!important$/,
    NON_STATIC_POSITIONS = ["relative", "fixed", "absolute", "sticky"];
class DomMeasurement {
    constructor(t = document) {
        this._document = t, this._window = t.defaultView, this._elementCache = new Map, this._documentScroll = null, this._documentGap = null
    }
    clearCache() {
        this._elementCache = new Map, this._documentScroll = null, this._documentGap = null
    }
    _hasRelativePosition(t, e) {
        const o = this._getComputedStyle(t, e).position || "static";
        return NON_STATIC_POSITIONS.indexOf(o) > -1
    }
    _contains(t, e) {
        return t && t !== e && t.contains(e)
    }
    _getElementCache(t) {
        let e = this._elementCache.get(t);
        return e || (e = {}, this._elementCache.set(t, e)), e
    }
    _getBorderBox(t, e) {
        if (!e.borderBox) {
            const o = this._getBoundingClientRect(t, e);
            let n = o.top,
                i = o.left,
                s = o.bottom,
                l = o.right;
            e.borderBox = {
                width: o.width,
                height: o.height,
                top: n,
                right: l,
                bottom: s,
                left: i
            }
        }
        return e.borderBox
    }
    _getBorderBoxWithScroll(t, e) {
        if (!e.borderBoxWithScroll) {
            let {
                width: o,
                height: n,
                top: i,
                right: s,
                bottom: l,
                left: r
            } = this._getBorderBox(t, e);
            const c = this.getDocumentScroll();
            if (i += c.top, r += c.left, l += c.top, s += c.left, this._document.body && this._contains(this._document.body, t)) {
                const t = this.getDocumentGap();
                i -= t.top, s -= t.left, l -= t.top, r -= t.left
            }
            e.borderBoxWithScroll = {
                width: o,
                height: n,
                top: i,
                right: s,
                bottom: l,
                left: r
            }
        }
        return e.borderBoxWithScroll
    }
    getBorderBox(t, e = !0) {
        return e ? Object.assign({}, this._getBorderBoxWithScroll(t, this._getElementCache(t))) : Object.assign({}, this._getBorderBox(t, this._getElementCache(t)))
    }
    getPaddingBox(t, e = !0) {
        return Object.assign({}, this._getPaddingBox(t, e, this._getElementCache(t)))
    }
    _getPaddingBox(t, e, o) {
        const n = e ? "paddingBoxWithScroll" : "paddingBox";
        if (!o[n]) {
            let {
                width: i,
                height: s,
                top: l,
                left: r
            } = e ? this._getBorderBoxWithScroll(t, o) : this._getBorderBox(t, o);
            const c = this._getComputedStyle(t, o),
                h = parseFloat(c["border-top-width"]) || 0,
                d = parseFloat(c["border-right-width"]) || 0,
                g = parseFloat(c["border-bottom-width"]) || 0,
                a = parseFloat(c["border-left-width"]) || 0;
            let m = 0,
                u = 0;
            if ("BackCompat" !== this._document.compatMode || t !== this._document.body || t !== this._document.scrollingElement) {
                const e = t.clientWidth / this._getScaleFactor(t, o);
                u = s - t.clientHeight / this._getScaleFactor(t, o) - h - g, (m = i - e - a - d) < 1 && (m = 0), u < 1 && (u = 0)
            }
            i -= a + m + d, s -= h + u + g, l += h, r += a, o[n] = {
                width: i,
                height: s,
                top: l,
                right: r + i,
                bottom: l + s,
                left: r,
                border: {
                    top: h,
                    right: d,
                    bottom: g,
                    left: a
                }
            }
        }
        return o[n]
    }
    getContentBox(t, e = !0) {
        return Object.assign({}, this._getContentBox(t, e, this._getElementCache(t)))
    }
    _getContentBox(t, e, o) {
        const n = e ? "contentBoxWithScroll" : "contentBox";
        if (!o[n]) {
            let {
                width: i,
                height: s,
                top: l,
                left: r,
                border: c
            } = this._getPaddingBox(t, e, o);
            const h = this._getComputedStyle(t, o),
                d = parseFloat(h["padding-top"]) || 0,
                g = parseFloat(h["padding-right"]) || 0,
                a = parseFloat(h["padding-bottom"]) || 0,
                m = parseFloat(h["padding-left"]) || 0;
            i -= m + g, s -= d + a, l += d, r += m, o[n] = {
                width: i,
                height: s,
                top: l,
                right: r + i,
                bottom: l + s,
                left: r,
                border: c,
                padding: {
                    top: d,
                    right: g,
                    bottom: a,
                    left: m
                }
            }
        }
        return Object.assign({}, o[n])
    }
    getBoundingClientRect(t) {
        return Object.assign({}, this._getBoundingClientRect(t, this._getElementCache(t)))
    }
    _getBoundingClientRect(t, e) {
        if (!e.boundingClientRect) {
            const o = t.getBoundingClientRect();
            e.boundingClientRect = {
                top: o.top,
                right: o.right,
                bottom: o.bottom,
                left: o.left,
                width: o.width,
                height: o.height
            }
        }
        return e.boundingClientRect
    }
    getTextBoundingBoxes(t, e, o = this.getScrollPosition(e)) {
        Array.isArray(t) || (t = [t]);
        let n = [];
        const i = this.getDocumentScroll();
        let s = {
            top: 0,
            left: 0
        };
        this._contains(this._document.body, e) && (s = this.getDocumentGap());
        const l = this.getPaddingBox(e),
            r = i.left - s.left - l.left + o.left,
            c = i.top - s.top - l.top + o.top;
        for (const e of t) try {
            const t = this._document.createRange();
            t.setStart(e.textNode, e.start), t.setEnd(e.textNode, e.end);
            const o = Array.from(t.getClientRects());
            for (const t of o) n.push({
                top: t.top + c,
                left: t.left + r,
                bottom: t.bottom + c,
                right: t.right + r,
                width: t.width,
                height: t.height
            })
        } catch (t) {}
        return n
    }
    getTextBoundingBox(t, e) {
        const o = this.getTextBoundingBoxes(t, e),
            n = Math.min(...o.map(t => t.top)),
            i = Math.min(...o.map(t => t.left)),
            s = Math.max(...o.map(t => t.bottom)),
            l = Math.max(...o.map(t => t.right));
        return {
            top: n,
            left: i,
            bottom: s,
            right: l,
            width: l - i,
            height: s - n
        }
    }
    getScaleFactor(t) {
        return this._getScaleFactor(t, this._getElementCache(t))
    }
    _getScaleFactor(t, e) {
        if (!e.scaleFactor) {
            const o = this._getBoundingClientRect(t, e).width;
            if (o > 0) {
                const n = t.offsetWidth;
                Math.abs(o - n) > 1 ? e.scaleFactor = n / o : e.scaleFactor = 1
            } else e.scaleFactor = 1
        }
        return e.scaleFactor
    }
    getComputedStyle(t) {
        return this._getComputedStyle(t, this._getElementCache(t))
    }
    _getComputedStyle(t, e) {
        return e.computedStyle || (e.computedStyle = this._window.getComputedStyle(t)), e.computedStyle
    }
    getInlineStyle(t, e) {
        return this._getInlineStyle(t, e, this._getElementCache(t))
    }
    _getInlineStyle(t, e, o) {
        return t.style.getPropertyValue(e)
    }
    getStyle(t, e) {
        return this.getStyles(t, [e])[e]
    }
    getStyles(t, e) {
        let o, n = {};
        const i = this._getElementCache(t);
        for (const s of e) o = o || this._getComputedStyle(t, i), n[s] = "line-height" === s || "lineHeight" === s ? this._getInlineStyle(t, s, i) || o[s] || "" : o[s] || "";
        return n
    }
    setStyles(t, e, o = !1) {
        for (const n in e) {
            let i = e[n].trim();
            const s = o || IMPORTANT_REG_EXP.test(i);
            i = i.replace(IMPORTANT_REG_EXP, ""), t.style.setProperty(n, i, s ? "important" : "")
        }
    }
    copyStyles(t, e, o, n = !1) {
        const i = this.getStyles(t, o);
        this.setStyles(e, i, n)
    }
    isStackingContext(t) {
        const e = this.getComputedStyle(t);
        return !!(e.position && NON_STATIC_POSITIONS.indexOf(e.position) > -1) || ("none" !== e.transform || "none" !== e.filter || "none" !== e.clipPath || "none" !== e.perspective || Number(e.opacity) < 1)
    }
    getStackingContextWithZIndex(t) {
        const e = this.getComputedStyle(t),
            o = parseInt(e.zIndex || "");
        if (isNaN(o)) return null;
        if (e.position && NON_STATIC_POSITIONS.indexOf(e.position) > -1) return {
            zIndex: o
        };
        if (t.parentElement) {
            if ("flex" === this.getComputedStyle(t.parentElement).display) return {
                zIndex: o
            }
        }
        return null
    }
    getZIndex(t, e = this._document.documentElement) {
        let o = "auto",
            n = t;
        if (!n.ownerDocument) return "auto";
        const i = n.ownerDocument.defaultView.Element;
        for (; n && n !== this._document && n !== e && n instanceof i;) {
            const t = this.getStackingContextWithZIndex(n);
            t && (o = t.zIndex), n = n.parentElement
        }
        return o
    }
    getScrollDimensions(t) {
        return Object.assign({}, this._getScrollDimensions(t, this._getElementCache(t)))
    }
    _getScrollDimensions(t, e) {
        return e.scrollDimensions || (e.scrollDimensions = {
            width: t.scrollWidth,
            height: t.scrollHeight
        }), e.scrollDimensions
    }
    getScrollPosition(t) {
        return Object.assign({}, this._getScrollPosition(t, this._getElementCache(t)))
    }
    _getScrollPosition(t, e) {
        if (!e.scrollPosition) {
            const o = t === this._document.body && "BackCompat" === this._document.compatMode,
                n = o ? 0 : t.scrollTop,
                i = o ? 0 : t.scrollLeft;
            e.scrollPosition = {
                top: n,
                left: i
            }
        }
        return e.scrollPosition
    }
    getDocumentScroll() {
        if (!this._documentScroll) {
            const t = this._document.documentElement && this._document.documentElement.scrollTop || this._document.body && this._document.body.scrollTop || 0,
                e = this._document.documentElement && this._document.documentElement.scrollLeft || this._document.body && this._document.body.scrollLeft || 0;
            this._documentScroll = {
                top: t,
                left: e
            }
        }
        return Object.assign({}, this._documentScroll)
    }
    getDocumentGap() {
        if (!this._documentGap && (this._documentGap = {
                top: 0,
                left: 0
            }, this._document.body && this._hasRelativePosition(this._document.body, this._getElementCache(this._document.body)))) {
            const t = this.getBoundingClientRect(this._document.documentElement),
                e = this.getBoundingClientRect(this._document.body),
                o = e.top - t.top + this._document.documentElement.offsetTop,
                n = e.left - t.left + this._document.documentElement.offsetLeft,
                i = this.getComputedStyle(this._document.body),
                s = parseFloat(i["border-top-width"]) || 0,
                l = parseFloat(i["border-left-width"]) || 0;
            this._documentGap = {
                top: o + s,
                left: n + l
            }
        }
        return Object.assign({}, this._documentGap)
    }
}