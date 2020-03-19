/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
function hasFirefoxDesignMode(t) {
  return Boolean(
    t.ownerDocument &&
      "on" === t.ownerDocument.designMode &&
      "read-write" ===
        t.ownerDocument.defaultView.getComputedStyle(t)["-moz-user-modify"]
  );
}
function hasFocus(t) {
  return (
    t.matches(":focus") ||
    ("BODY" === t.nodeName &&
      hasFirefoxDesignMode(t) &&
      t.ownerDocument.hasFocus())
  );
}
function isCEElement(t) {
  return (
    t.isContentEditable || ("BODY" === t.nodeName && hasFirefoxDesignMode(t))
  );
}
function isTextArea(t) {
  return t instanceof HTMLTextAreaElement;
}
function isTextInput(t) {
  return (
    t instanceof HTMLInputElement && ("text" === t.type || "search" === t.type)
  );
}
function isInputArea(t) {
  return isCEElement(t) || isTextArea(t) || isTextInput(t);
}
function isElementNode(t) {
  return t.nodeType === document.ELEMENT_NODE;
}
function isTextNode(t) {
  return t.nodeType === document.TEXT_NODE;
}
function wait(t = 25, e = null) {
  return new Promise(n => setTimeout(() => n(e), t));
}
function setAnimationFrameTimeout(t, e) {
  let n = null,
    o = !1;
  const r = window.setTimeout(() => {
    o || (n = window.requestAnimationFrame(() => t()));
  }, e);
  return {
    destroy: () => {
      (o = !0), window.clearTimeout(r), n && window.cancelAnimationFrame(n);
    }
  };
}
function setAnimationFrameInterval(t, e) {
  let n = null,
    o = !1;
  const r = () => {
    n = setAnimationFrameTimeout(() => {
      o || (t(), r());
    }, e);
  };
  return (
    r(),
    {
      destroy: () => {
        (o = !0), n && (n.destroy(), (n = null));
      }
    }
  );
}
function isIntersect(t, e, n, o, r = !1) {
  return r ? t <= o && e >= n : t < o && e > n;
}
function isRectsIntersect(t, e) {
  return !(
    t.left > e.right ||
    t.right < e.left ||
    t.top > e.bottom ||
    t.bottom < e.top
  );
}
function isPointInsideRect(t, e, n) {
  return (
    void 0 === n && ((n = e.y), (e = e.x)),
    t.left <= e && e <= t.right && t.top <= n && n <= t.bottom
  );
}
function contains(t, e) {
  return t !== e && t.contains(e);
}
function closestElement(t, e) {
  return t.closest ? t.closest(e) : null;
}
function getFrameElement(t) {
  return t.frameElement;
}
function getBorderBoxes(t) {
  return Array.from(t.getClientRects(), t => ({
    top: t.top,
    left: t.left,
    bottom: t.bottom,
    right: t.right,
    width: t.width,
    height: t.height
  }));
}
const getVisibleTopAndBottom = (() => {
  const t = (t, e, n, o) => {
    const r = t.ownerDocument;
    let i = r.elementFromPoint(n, o);
    if (!i) return !1;
    if (t === i || t.contains(i)) return !0;
    if (!e.length) return !1;
    const s = e.find(t => t.contains(i));
    return (
      s && (i = r.elementsFromPoint(n, o).find(t => !s.contains(t)) || null),
      Boolean(i && (t === i || t.contains(i)))
    );
  };
  return (e, n, o, r) => {
    const i = n.getPaddingBox(e, !1);
    if (i.bottom < 0 || i.top > o) return { top: 0, bottom: i.height };
    let s = [];
    r && (s = Array.from(e.ownerDocument.querySelectorAll(r)));
    let c = i.left + Math.round((i.width / 100) * 33);
    const a = Math.max(i.top, 0);
    let l = a;
    for (;;) {
      if (t(e, s, c, l)) {
        if (l === a) break;
        for (; l--; )
          if (!t(e, s, c, l)) {
            l++;
            break;
          }
        break;
      }
      if (l === i.bottom) break;
      l = Math.min(i.bottom, l + 6);
    }
    const u = Math.min(i.bottom, o);
    let f = u;
    for (;;) {
      if (t(e, s, c, f - 1)) {
        if (f === u) break;
        for (; f++ < u; )
          if (!t(e, s, c, f - 1)) {
            f--;
            break;
          }
        break;
      }
      if (f === l) break;
      f = Math.max(l, f - 6);
    }
    return {
      top: Math.round(Math.max(0, l - i.top)),
      bottom: Math.round(Math.max(0, f - i.top))
    };
  };
})();
function isVisible(t) {
  return (
    (t.offsetWidth > 0 || t.offsetHeight > 0) &&
    "hidden" !== new DomMeasurement(document).getStyle(t, "visibility")
  );
}
function fadeOut(t, e) {
  let n = 1;
  const o = new DomMeasurement(t.ownerDocument),
    r = setAnimationFrameInterval(() => {
      if ((n -= 0.08) <= 0) return r.destroy(), void (e && e());
      o.setStyles(t, { opacity: n + " !important" });
    }, 16);
}
function fadeOutAndRemove(t, e) {
  let n = 1;
  const o = new DomMeasurement(t.ownerDocument),
    r = setAnimationFrameInterval(() => {
      if ((n -= 0.08) <= 0) return t.remove(), r.destroy(), void (e && e());
      o.setStyles(t, { opacity: n + " !important" });
    }, 16);
}
function observeScrollableAncestors(t, e) {
  const n = new DomMeasurement(t.ownerDocument);
  const o = (function(t) {
    const e = [];
    let o = t.parentElement;
    for (; o && o !== document.body && o !== document.documentElement; ) {
      const t = n.getStyles(o, ["overflow-x", "overflow-y"]),
        r = t["overflow-x"],
        i = t["overflow-y"];
      ("auto" !== i && "scroll" !== i && "auto" !== r && "scroll" !== r) ||
        e.push(o),
        (o = o.parentElement);
    }
    return e;
  })(t);
  let r = !1;
  const i = () => {
    r ||
      ((r = !0),
      window.requestAnimationFrame(() => {
        (r = !1), e();
      }));
  };
  return (
    o.forEach(t => {
      t.addEventListener("scroll", i);
    }),
    {
      destroy() {
        o.forEach(t => {
          t.removeEventListener("scroll", i);
        }),
          (r = !0);
      }
    }
  );
}
const onElementDisabled = (() => {
    let t;
    const e = [];
    return (n, o) => {
      e.push({ element: n, callback: o }),
        (t =
          t ||
          window.setInterval(() => {
            const n = [];
            e.forEach(t => {
              (t.element.readOnly ||
                t.element.disabled ||
                !isVisible(t.element)) &&
                (n.push(t), t.callback(t.element));
            }),
              n.forEach(t => {
                e.splice(e.indexOf(t), 1);
              }),
              e.length || (clearInterval(t), (t = null));
          }, 600));
    };
  })(),
  onElementRemoved = (() => {
    let t;
    const e = [];
    return (n, o) => {
      e.push({ element: n, callback: o }),
        t ||
          (t = new MutationObserver(n => {
            const o = [];
            e.forEach(t => {
              n.find(
                e =>
                  Array.prototype.indexOf.call(e.removedNodes, t.element) > -1
              ) && (o.push(t), t.callback(t.element));
            }),
              o.forEach(t => {
                e.splice(e.indexOf(t), 1);
              }),
              e.length || (t.disconnect(), (t = null));
          })).observe(document.documentElement, { childList: !0, subtree: !0 });
    };
  })();
function getTextsDiff(t, e) {
  if (t === e) return null;
  let n = 0;
  const o = Math.max(t.length, e.length);
  for (n = 0; n < o && t[n] === e[n]; n++);
  let r = 0;
  const i = Math.min(t.length, e.length);
  for (; n + r < i; ) {
    if (t[t.length - r - 1] !== e[e.length - r - 1]) break;
    r++;
  }
  return {
    from: n,
    oldFragment: t.substring(n, t.length - r),
    newFragment: e.substring(n, e.length - r)
  };
}
function getParagraphsDiff(t, e) {
  const n = [],
    o = t.split("\n"),
    r = e.split("\n");
  let i = 0;
  const s = Math.max(o.length, r.length);
  for (i = 0; i < s && o[i] === r[i]; i++);
  let c = 0;
  const a = Math.min(o.length, r.length);
  for (; i + c < a; ) {
    if (o[o.length - c - 1] !== r[r.length - c - 1]) break;
    c++;
  }
  let l = 0;
  for (let t = 0; t < i; t++) l += o[t].length + 1;
  let u = l;
  for (let t = i; t < s - c; t++) {
    const e = t < o.length - c ? o[t] : null,
      i = t < r.length - c ? r[t] : null;
    (e === i && l === u) ||
      n.push({
        oldText: e,
        newText: i,
        oldOffset: l,
        newOffset: u,
        textDiff: getTextsDiff(e || "", i || "")
      }),
      null !== e && (l += e.length + 1),
      null !== i && (u += i.length + 1);
  }
  if (l !== u)
    for (let t = c - 1; t >= 0; t--) {
      const e = o[o.length - t - 1],
        i = r[r.length - t - 1];
      n.push({
        oldText: e,
        newText: i,
        oldOffset: l,
        newOffset: u,
        textDiff: null
      }),
        (l += e.length + 1),
        (u += i.length + 1);
    }
  return n;
}
function uniq(t) {
  const e = [];
  return (
    t.forEach(t => {
      -1 === e.indexOf(t) && e.push(t);
    }),
    e
  );
}
function isSameObjects(t, e) {
  return t === e || JSON.stringify(t) === JSON.stringify(e);
}
function dispatchCustomEvent(t, e = {}) {
  const n = new CustomEvent(t, { detail: e });
  document.dispatchEvent(n);
}
function loadHTML(t) {
  const e = browser.runtime.getURL(t);
  return fetch(e).then(t => t.text());
}
function loadStylesheet(t) {
  const e = document.createElement("link");
  (e.rel = "stylesheet"),
    (e.type = "text/css"),
    (e.href = browser.runtime.getURL(t)),
    (document.head || document.body).appendChild(e);
}
function getRangeAtPoint(t) {
  if (document.caretRangeFromPoint)
    return document.caretRangeFromPoint(t.x, t.y);
  if (document.caretPositionFromPoint) {
    const e = document.caretPositionFromPoint(t.x, t.y);
    if (!e || !e.offsetNode) return null;
    try {
      const t = new Range();
      return (
        t.setStart(e.offsetNode, e.offset), t.setEnd(e.offsetNode, e.offset), t
      );
    } catch (t) {
      return null;
    }
  }
  return null;
}
function isSameRange(t, e) {
  return !(
    !t ||
    !e ||
    t.startContainer !== e.startContainer ||
    t.startOffset !== e.startOffset ||
    t.endOffset !== e.endOffset ||
    t.endContainer !== e.endContainer
  );
}
function getSelectedText() {
  const t = document.activeElement,
    e = t ? t.tagName.toLowerCase() : null;
  return "textarea" === e ||
    ("input" === e &&
      /^(?:text|search|password|tel|url)$/i.test(t.type) &&
      "number" == typeof t.selectionStart)
    ? t.value.slice(t.selectionStart, t.selectionEnd)
    : window.getSelection && window.getSelection()
    ? window.getSelection().toString()
    : "";
}
function addUseCaptureEvent(t, e, n) {
  const o = t instanceof HTMLDocument ? t : t.ownerDocument,
    r = e => {
      if (!e.target) return;
      const o = e.target;
      (isElementNode(o) || isTextNode(o)) && t.contains(o) && n(e);
    };
  return (
    o.defaultView.addEventListener(e, r, !0),
    {
      destroy() {
        o.defaultView.removeEventListener(e, r, !0);
      }
    }
  );
}
function generateStackTrace(t) {
  if (!t.stack) return;
  let e = [];
  if (
    (t.stack.split(/\n/).forEach(t => {
      const n = t.match(/([\w_<>]+)\s+\(.+?([\w_\-]+\.(js|html))/);
      n && e.push(`${n[2]}:${n[1]}`);
    }),
    !e.length)
  ) {
    const n = t.stack.match(/([\w_\-]+\.(js|html))/);
    n && e.push(n[1]);
  }
  return e.join(",").substr(0, 140);
}
function bindAndCatch(t, e = null) {
  return function() {
    if (BrowserDetector.isFirefox()) return t.apply(e, arguments);
    try {
      return t.apply(e, arguments);
    } catch (e) {
      let n = t.name;
      const o = generateStackTrace(e);
      throw (o && (n += "|" + o),
      window.event && window.event.type && (n += "|" + window.event.type),
      Tracker.trackError("js", e.message, n),
      e);
    }
  };
}
function isLTAvailable(t) {
  try {
    return t.document.documentElement.hasAttribute("data-lt-installed");
  } catch (t) {}
  return !1;
}
function isRuntimeConnected() {
  try {
    return browser.runtime.getManifest(), !0;
  } catch (t) {
    return !1;
  }
}
const isProductionEnvironment = (() => {
  let t;
  return () => (
    void 0 === t &&
      (t = BrowserDetector.isFirefox()
        ? !browser.runtime.id.match("temporary-addon")
        : "update_url" in browser.runtime.getManifest()),
    t
  );
})();
function isTinyMCE(t) {
  return (
    t.classList.contains("mce-content-body") ||
    t.classList.contains("mceContentBody")
  );
}
function isGutenberg(t) {
  return t.classList.contains("editor-rich-text__editable");
}
function isTrixEditor(t) {
  return "trix-editor" === t.nodeName.toLowerCase();
}
function getCurrentUrl() {
  if ("about:blank" === location.href || "about:srcdoc" === location.href)
    try {
      return window.parent.location.href;
    } catch (t) {}
  return location.href;
}
function getCurrentHostname() {
  const t = document.location || document.defaultView.location;
  if (t && t.hostname) return t.hostname.replace(/^www./, "");
  try {
    return window.parent.location.hostname.replace(/^www./, "");
  } catch (t) {}
  return "";
}
function getMainPageHostname() {
  const t = window.parent !== window;
  let e;
  return (
    document.referrer && t && (e = getHostNameFromUrl(document.referrer)),
    e || (e = getCurrentHostname()),
    e
  );
}
function getHostNameFromUrl(t) {
  try {
    const { hostname: e } = new URL(t);
    return e;
  } catch (e) {
    return t;
  }
}
function getSubdomains(t) {
  const e = [t];
  for (; t.split(".").length > 2; ) {
    const n = t.indexOf(".");
    (t = t.substr(n + 1)), e.push(t);
  }
  return e.reverse();
}
function loadContentScripts(t) {
  isRuntimeConnected() &&
    browser.runtime.getManifest().content_scripts.forEach(e => {
      if (e.js) {
        const n = e.js.map(t => {
          const e = browser.runtime.getURL(t);
          return fetch(e).then(t => t.text());
        });
        Promise.all(n).then(e => {
          let n = "";
          e.forEach(t => {
            n += t + "\n";
          }),
            t.eval(n);
        });
      }
      if (e.css) {
        const n = e.css.map(t => {
          const e = browser.runtime.getURL(t);
          return fetch(e).then(t => t.text());
        });
        Promise.all(n).then(e => {
          e.forEach(e => {
            const n = t.document.createElement("style");
            (n.textContent = e),
              (t.document.head || t.document.documentElement).appendChild(n);
          });
        });
      }
    });
}
