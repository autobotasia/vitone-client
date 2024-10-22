/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
const LANGUAGES = [
  { code: "vi", name: browser.i18n.getMessage("vi") },
  // { code: "ast", name: browser.i18n.getMessage("ast") },
  // { code: "be", name: browser.i18n.getMessage("be") },
  // { code: "br", name: browser.i18n.getMessage("br") },
  // { code: "ca-es", name: browser.i18n.getMessage("ca") },
  // { code: "ca-es-valencia", name: browser.i18n.getMessage("ca_ES_valencia") },
  // { code: "da-dk", name: browser.i18n.getMessage("da_DK") },
  // { code: "de-at", name: browser.i18n.getMessage("de_AT") },
  // { code: "de-ch", name: browser.i18n.getMessage("de_CH") },
  // { code: "de-de", name: browser.i18n.getMessage("de_DE") },
  // { code: "el", name: browser.i18n.getMessage("el") },
  // { code: "en-au", name: browser.i18n.getMessage("en_AU") },
  // { code: "en-ca", name: browser.i18n.getMessage("en_CA") },
  // { code: "en-gb", name: browser.i18n.getMessage("en_GB") },
  // { code: "en-nz", name: browser.i18n.getMessage("en_NZ") },
  { code: "en-us", name: browser.i18n.getMessage("en_US") },
  // { code: "en-za", name: browser.i18n.getMessage("en_ZA") },
  // { code: "eo", name: browser.i18n.getMessage("eo") },
  // { code: "es", name: browser.i18n.getMessage("es") },
  // { code: "fa", name: browser.i18n.getMessage("fa") },
  // { code: "fr", name: browser.i18n.getMessage("fr") },
  // { code: "gl", name: browser.i18n.getMessage("gl") },
  // { code: "it", name: browser.i18n.getMessage("it") },
  // { code: "ja", name: browser.i18n.getMessage("ja") },
  // { code: "km", name: browser.i18n.getMessage("km") },
  // { code: "nl", name: browser.i18n.getMessage("nl") },
  // { code: "pl", name: browser.i18n.getMessage("pl") },
  // { code: "pt-ao", name: browser.i18n.getMessage("pt_AO") },
  // { code: "pt-br", name: browser.i18n.getMessage("pt_BR") },
  // { code: "pt-mz", name: browser.i18n.getMessage("pt_MZ") },
  // { code: "pt-pt", name: browser.i18n.getMessage("pt_PT") },
  // { code: "ro", name: browser.i18n.getMessage("ro") },
  // { code: "ru", name: browser.i18n.getMessage("ru") },
  // { code: "sk", name: browser.i18n.getMessage("sk") },
  // { code: "sl", name: browser.i18n.getMessage("sl") },
  // { code: "sv", name: browser.i18n.getMessage("sv") },
  // { code: "ta", name: browser.i18n.getMessage("ta") },
  // { code: "tl", name: browser.i18n.getMessage("tl") },
  // { code: "uk", name: browser.i18n.getMessage("uk") },
  // { code: "zh", name: browser.i18n.getMessage("zh") }
];
function getDefaultLanguage() {
  for (const e of navigator.languages) {
    if (e.includes("-") && e.startsWith(navigator.language)) return e;
  }
  return navigator.language;
}
function getPreferredVariantFromBrowserLanguage(e) {
  const t = { "en-in": "en-gb", "en-ie": "en-gb" },
    a = navigator.languages || [];
  for (let n of a) {
    n = t[(n = n.toLowerCase())] || n;
    for (const t of e) {
      const e = t.toLowerCase();
      if (n.length > 2 && n === e) return t;
    }
  }
}
function getUserLanguageCodes() {
  const e = navigator.languages.map(e =>
    getPrimaryLanguageCode(e).toLowerCase()
  );
  try {
    e.push(getPrimaryLanguageCode(browser.i18n.getUILanguage()).toLowerCase());
  } catch (e) {}
  return uniq(e);
}
function getPrimaryLanguageCode(e) {
  return e.split("-")[0];
}
function translateElement(e, t) {
  let a = t;
  "string" == typeof t && (a = { key: t });
  let n = e;
  "string" == typeof e && (n = document.querySelector(e)),
    a.isHTML
      ? (n.innerHTML = browser.i18n.getMessage(a.key, a.interpolations))
      : a.attr
      ? (n[a.attr] = browser.i18n.getMessage(a.key, a.interpolations))
      : (n.textContent = browser.i18n.getMessage(a.key, a.interpolations));
}
function translateSection(e) {
  Array.from(e.querySelectorAll("[data-t]")).forEach(e => {
    translateElement(e, e.getAttribute("data-t"));
  }),
    Array.from(e.querySelectorAll("[data-t-placeholder]")).forEach(e => {
      translateElement(e, {
        key: e.getAttribute("data-t-placeholder"),
        attr: "placeholder"
      });
    }),
    Array.from(e.querySelectorAll("[data-t-html]")).forEach(e => {
      translateElement(e, { key: e.getAttribute("data-t-html"), isHTML: !0 });
    }),
    Array.from(e.querySelectorAll("[data-t-title]")).forEach(e => {
      translateElement(e, {
        key: e.getAttribute("data-t-title"),
        attr: "title"
      });
    });
}
function getLanguagesForGeoIPCountry() {
  return new Promise(function(e, t) {
    let a = !1;
    const n = setTimeout(() => {
      (a = !0), t(new Error("timeout"));
    }, 15e3);
    fetch("https://autobot.asia/webextension/init", {
      method: "GET",
      mode: "cors"
    })
      .then(e => e.json())
      .then(t => {
        if (!a) {
          (t.geoIpCountry || "").toUpperCase();
          e({
            geoIpLanguages: t.geoIpLanguages || [],
            geoIpCountry: t.geoIpCountry
          }),
            clearTimeout(n);
        }
      })
      .catch(e => {
        a || (t(e), clearTimeout(n));
      });
  });
}
LANGUAGES.sort(function(e, t) {
  return e.name < t.name ? -1 : e.name > t.name ? 1 : 0;
});
