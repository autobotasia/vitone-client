/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Validator {
    static _constructor() {
        Validator._isInitialized || (Validator._checkForException = Validator._checkForException.bind(Validator), Validator._isInitialized = !0)
    }
    static _getUserAgent() {
        let e = "webextension";
        return BrowserDetector.isChrome() ? e += "-chrome" : BrowserDetector.isFirefox() ? e += "-firefox" : BrowserDetector.isOpera() ? e += "-opera" : BrowserDetector.isEdge() ? e += "-edge" : BrowserDetector.isYaBrowser() ? e += "-chrome" : e += "-unknown", e + "-ng"
    }
    static _getServerBaseUrl(e = !1, t = !0) {
        const {
            apiServerUrl: r
        } = this._storageController.getSettings(), {
            hasPaidSubscription: a
        } = this._storageController.getUIState(), s = t && (e ? this._usePartialValidationFallbackServer : this._useValidationFallbackServer) && !this._storageController.isUsedCustomServer();
        return a ? s ? config.FALLBACK_PREMIUM_SERVER_URL : config.PREMIUM_SERVER_URL : s ? config.FALLBACK_MAIN_SERVER_URL : r || config.MAIN_SERVER_URL
    }
    static _getServerFullUrl(e, t = !1, r = !1) {
        let a = this._getServerBaseUrl(t);
        a += a.endsWith("/") ? "check" : "/check", a += `?instanceId=${encodeURIComponent(e.instanceId)}`, a += "&c=1", r && (a += "&languageChanged=true");
        const s = browser.runtime.getManifest(),
            o = s && s.version || "unknown";
        return a += `&v=${encodeURIComponent(o)}`
    }
    static _abortValidationRequest(e) {
        Validator._validationAbortControllers[e] && Validator._validationAbortControllers[e].abort()
    }
    static _abortPartialValidationRequest(e) {
        Validator._partialValidationAbortControllers[e] && Validator._partialValidationAbortControllers[e].abort()
    }
    static _ignoreText(e) {
        for (const t in Validator.IGNORE_TEXT_REGEXP) {
            const r = Validator.IGNORE_TEXT_REGEXP[t];
            e = e.replace(r, e => "\ufeff".repeat(e.length))
        }
        for (const t of Validator.IGNORE_ASCII_SMILEYS_REGEXPS) e = e.replace(t, (e, t, r) => `${t}${"\ufeff".repeat(r.length)}`);
        return e
    }
    static _getRequestData(e, t, r, a) {
        const s = new URLSearchParams,
            {
                username: o,
                password: i,
                token: n,
                motherTongue: l,
                enVariant: E,
                deVariant: _,
                ptVariant: d,
                caVariant: u
            } = this._storageController.getSettings(),
            {
                hasPaidSubscription: c
            } = this._storageController.getUIState(),
            g = {
                text: e,
                metaData: {
                    EmailToAddress: a.recipientInfo.address
                }
            };
        if (s.append("data", JSON.stringify(g)), c && o && i ? (s.append("username", o), s.append("password", i)) : c && o && n && (s.append("username", o), s.append("tokenV2", n)), s.append("textSessionId", a.instanceId), c || s.append("enableHiddenRules", "true"), l && s.append("motherTongue", l), t) s.append("language", t.code);
        else {
            s.append("language", "auto"), s.append("noopLanguages", uniq(r || []).join(",")), s.append("preferredLanguages", uniq(r || []).join(","));
            const e = [];
            E && e.push(E), _ && e.push(_), d && e.push(d), u && e.push(u), e.length > 0 && s.append("preferredVariants", e.toString())
        }
        return s.append("disabledRules", "WHITESPACE_RULE"), s.append("useragent", this._getUserAgent()), s
    }
    static _getValidationRequestData(e, t, r, a) {
        const s = this._getRequestData(e, t, r, a);
        return s.append("mode", "textLevelOnly"), s
    }
    static _getPartialValidationRequestData(e, t, r, a, s) {
        const o = this._getRequestData(e, t, r, a);
        return o.append("mode", "allButTextLevelOnly"), o.append("allowIncompleteResults", s.toString()), o
    }
    static _sendRequest(e, t, r = config.REQUEST_TIMEOUT) {
        const a = fetch(e, t).catch(t => {
                throw "AbortError" === t.name ? {
                    reason: "AbortError",
                    status: 0,
                    message: "",
                    response: t.message || ""
                } : {
                    reason: "ConnectionError",
                    status: 0,
                    message: browser.i18n.getMessage("connectionProblem", e.replace(/\?.*/, "")) + " (#1, code=" + t.status + ")",
                    response: t.message || ""
                }
            }).then(Validator._checkForException).then(e => e.json()),
            s = new Promise((t, a) => {
                setTimeout(() => {
                    a({
                        reason: "TimeoutError",
                        status: 0,
                        message: browser.i18n.getMessage("connectionProblem", e.replace(/\?.*/, "")) + " (#1, timeout)",
                        response: ""
                    })
                }, r)
            });
        return Promise.race([a, s])
    }
    static _checkForException(e) {
        return e.ok ? e : e.text().catch(() => "").then(t => {
            const r = t.toLowerCase();
            if (r.includes("too many error")) throw {
                status: e.status,
                message: browser.i18n.getMessage("tooManyErrors"),
                response: t
            };
            if (413 === e.status || r.includes("your text exceeds the limit")) throw {
                status: e.status,
                message: browser.i18n.getMessage("textTooLong"),
                response: t
            };
            if (t.toLowerCase().includes("checking took longer than")) throw {
                status: e.status,
                message: browser.i18n.getMessage("timeoutError", [e.url ? e.url.replace(/\?.*/, "?...") : "unknown"]),
                response: t
            };
            if (403 === e.status) {
                if (r.includes("client request size limit") || r.includes("client request limit") || r.includes("ip request limit") || r.includes("ip request size limit")) throw {
                    status: e.status,
                    message: browser.i18n.getMessage("tooManyRequests"),
                    response: t
                };
                if (r.includes("authexception")) throw {
                    status: e.status,
                    message: browser.i18n.getMessage("invalidUsernameOrPassword"),
                    response: t
                };
                throw {
                    status: e.status,
                    message: browser.i18n.getMessage("accessDeniedError2"),
                    response: t
                }
            }
            if (r.includes("checking took longer than")) throw {
                status: e.status,
                message: browser.i18n.getMessage("timeoutError", [e.url ? e.url.replace(/\?.*/, "?...") : "unknown"]),
                response: t
            };
            throw {
                status: e.status,
                message: browser.i18n.getMessage("unknownError") + " (" + e.status + ")",
                response: t
            }
        })
    }
    static _isConnectionOrServerIssue(e) {
        return config.SWITCH_TO_FALLBACK_SERVER_ERRORS.includes(e.status) || ["ConnectionError", "TimeoutError"].includes(e.reason)
    }
    static _transformMatches(e, t, r, a = !1) {
        return e.map((e, s) => {
            const o = Validator.SPELLING_RULES_ID.some(t => e.rule.id.includes(t)),
                i = Validator.STYLE_ISSUE_TYPES.some(t => e.rule.issueType === t),
                n = "typographical" === e.rule.issueType && "CASING" !== e.rule.category.id || "PUNCTUATION" === e.rule.category.id || "TYPOGRAPHY" === e.rule.category.id || e.rule.category.name.includes("KOMMA"),
                l = t.substr(e.offset, e.length),
                E = `...${t.substr(Math.max(0,e.offset-7),e.length+7)}...`;
            let _ = "";
            return o && (_ = l), {
                id: s + 1,
                isPartialValidation: a,
                rule: e.rule,
                isSpellingError: o,
                isStyleError: i,
                isPunctuationError: n,
                contextForSureMatch: e.contextForSureMatch,
                language: {
                    code: r.code,
                    name: r.name
                },
                description: e.message,
                shortDescription: e.shortMessage,
                offset: e.offset,
                length: e.length,
                originalPhrase: l,
                contextPhrase: E,
                misspelledWord: _,
                fixes: e.replacements
            }
        })
    }
    static _adjustErrors(e, t, r, a) {
        const s = Validator._storageController.getValidationSettings(r),
            o = a.split(" ").filter(e => e);
        return e.filter(e => {
            if (!s.shouldCapitalizationBeChecked) {
                if (e.fixes.some(t => t.value.toLowerCase() === e.originalPhrase.toLowerCase())) return !1;
                if ("UPPERCASE_SENTENCE_START" === e.rule.id) return !1
            }
            if (Validator.EMAIL_SIGNATURE_SEPARATOR_REGEXP.test(e.misspelledWord)) return !1;
            if (e.rule.id.endsWith("WORD_REPEAT_BEGINNING_RULE") && Validator.ONLY_NUMBERS_REGEXP.test(e.originalPhrase)) return !1;
            if ("LEERZEICHEN_HINTER_DOPPELPUNKT" === e.rule.id && Validator.COLON_WHITESPACE_REGEXP.test(e.originalPhrase)) return !1;
            const r = t.substring(e.offset - 25, e.offset);
            if ("DE_CASE" === e.rule.id && Validator.BULLET_POINT_REGEXP.test(r)) return !1;
            const a = t.substring(e.offset + e.length, e.offset + e.length + 25);
            if ("WORD_CONTAINS_UNDERSCORE" === e.rule.id && (!Validator.LOWERCASE_REGEXP.test(e.originalPhrase) || e.originalPhrase.includes("-") || e.originalPhrase.includes("__") || r.match(this.SLASH_AT_END_REGEXP) || a.match(this.SLASH_AT_BEGINNING_REGEXP))) return !1;
            if (e.isSpellingError || "WORD_CONTAINS_UNDERSCORE" === e.rule.id) {
                const t = e.originalPhrase.charAt(0),
                    s = e.originalPhrase.toLowerCase();
                if (a.startsWith("_") || r.endsWith("_")) return !1;
                if (e.originalPhrase.startsWith("$") && a.startsWith("}") && r.endsWith("{")) return !1;
                if (Validator.COMMON_TLDS.some((e, t) => s.endsWith("." + e) || Validator.COMMON_TLD_WITH_DOT_REGEXPS[t].test(a))) return !1;
                if (Validator.DOT_WITH_PREFIX_REGEXP.test(r) && Validator.COMMON_TLDS.includes(s)) return !1;
                if (Validator.COMMON_FILE_TYPES.some((e, t) => s.endsWith("." + e) || Validator.COMMON_FILE_TYPE_WITH_DOT_REGEXPS[t].test(a))) return !1;
                if (Validator.DOT_WITH_PREFIX_REGEXP.test(r) && Validator.COMMON_FILE_TYPES.includes(s)) return !1;
                const i = "@" === t || r.endsWith("@"),
                    n = "#" === t || r.endsWith("#");
                if (i || n) return !1;
                if (o.some(t => t.toLowerCase() === e.originalPhrase.toLowerCase())) return !1;
                for (const t of o)
                    if (t.toLowerCase() === e.originalPhrase.toLowerCase() && !e.fixes.some(e => e.value === t)) {
                        e.fixes.unshift({
                            value: t
                        });
                        break
                    }
                    "grammarly" === e.originalPhrase.toLowerCase() && (e.fixes = [{
                    value: "LanguageTool"
                }])
            }
            return !0
        })
    }
    static _processResponse(e, t, r, a) {
        let s = this._transformMatches(e.matches, t, e.language, a);
        s = this._adjustErrors(s, t, getHostNameFromUrl(r.url), r.recipientInfo.fullName);
        let o = [];
        const {
            hasPaidSubscription: i
        } = Validator._storageController.getUIState(), {
            frenchPremiumRules: n
        } = Validator._storageController.getTestFlags();
        return !i && !Validator._storageController.isUsedCustomServer() && e.language && e.language.code.startsWith("fr") && (s = s.filter(e => "test" !== n || !Validator.FR_PREMIUM_RULES.includes(e.rule.id) || (o.push(e), !1))), i && s.forEach(e => {
            "test" === n && Validator.FR_PREMIUM_RULES.includes(e.rule.id) && (e.rule.isPremium = !0), Validator.NL_PREMIUM_RULES.includes(e.rule.id) && (e.rule.isPremium = !0)
        }), !i && !Validator._storageController.isUsedCustomServer() && e.language && e.language.code.startsWith("nl") && (s = s.filter(e => !Validator.NL_PREMIUM_RULES.includes(e.rule.id) || (o.push(e), !1))), e.hiddenMatches && (o = o.concat(Validator._transformMatches(e.hiddenMatches, t, e.language, a))), {
            errors: s,
            hiddenErrors: o
        }
    }
    static _correctErrorOffsets(e, t) {
        const r = [];
        let a = 0;
        for (const s of e) {
            const e = s.text.length;
            for (const o of t)
                if (o.offset >= a && o.offset + o.length <= a + e) {
                    const e = Object.assign({}, o);
                    e.offset = e.offset - a + s.offset, r.push(e)
                }
            a += e + 2
        }
        return r
    }
    static validate(e, t, r, a, s = !1) {
        if (!(e = this._ignoreText(e)).trim() || /^( *\n)* *$/g.test(e)) return Promise.resolve({
            language: t,
            errors: [],
            hiddenErrors: []
        });
        this._abortValidationRequest(a.instanceId), this._validationAbortControllers[a.instanceId] = new AbortController, this._useValidationFallbackServer && Date.now() - this._mainServerUnavailabilityTimeStamp >= config.MAIN_SERVER_RECHECK_TIME && (this._useValidationFallbackServer = !1);
        const o = this._getServerFullUrl(a, !1, s),
            i = {
                method: "post",
                mode: "cors",
                body: Validator._getValidationRequestData(e, t, r, a),
                signal: this._validationAbortControllers[a.instanceId].signal
            };
        return this._sendRequest(o, i).then(t => {
            const {
                errors: r,
                hiddenErrors: s
            } = this._processResponse(t, e, a, !1);
            return {
                language: {
                    code: t.language.code,
                    name: t.language.name
                },
                errors: r,
                hiddenErrors: s
            }
        }).catch(s => {
            if (this._isConnectionOrServerIssue(s)) {
                this._abortValidationRequest(a.instanceId);
                const o = this._getServerBaseUrl(!1, !1);
                if (s.message = s.message || browser.i18n.getMessage("connectionProblem", o) + " (#1, code=" + s.status + ")", !this._storageController.isUsedCustomServer() && !this._useValidationFallbackServer) return this._useValidationFallbackServer = !0, this._mainServerUnavailabilityTimeStamp = Date.now(), this.validate(e, t, r, a)
            }
            throw s
        })
    }
    static partialValidate(e, t, r, a, s = !1) {
        if (e.forEach(e => {
                e.text = this._ignoreText(e.text)
            }), 0 === e.length) return Promise.resolve({
            language: t,
            errors: [],
            hiddenErrors: [],
            isIncompleteResult: !1
        });
        if (!e.some(e => !!e.text.trim())) return Promise.resolve({
            language: t,
            errors: [],
            hiddenErrors: [],
            isIncompleteResult: !1
        });
        this._abortPartialValidationRequest(a.instanceId), this._partialValidationAbortControllers[a.instanceId] = new AbortController, this._usePartialValidationFallbackServer && Date.now() - this._mainServerUnavailabilityTimeStamp >= config.MAIN_SERVER_RECHECK_TIME && (this._usePartialValidationFallbackServer = !1);
        const o = this._getServerFullUrl(a, !0),
            i = e.map(e => e.text).join("\n\n"),
            n = {
                method: "post",
                mode: "cors",
                body: this._getPartialValidationRequestData(i, t, r, a, s),
                signal: this._partialValidationAbortControllers[a.instanceId].signal
            };
        return this._sendRequest(o, n).then(t => {
            const {
                errors: r,
                hiddenErrors: s
            } = this._processResponse(t, i, a, !0), o = this._correctErrorOffsets(e, r), n = this._correctErrorOffsets(e, s);
            return {
                language: {
                    code: t.language.code,
                    name: t.language.name
                },
                errors: o,
                hiddenErrors: n,
                isIncompleteResult: !!t.warnings && t.warnings.incompleteResults
            }
        }).catch(o => {
            if (this._isConnectionOrServerIssue(o)) {
                this._abortPartialValidationRequest(a.instanceId);
                const i = this._getServerBaseUrl(!0, !1);
                if (o.message = browser.i18n.getMessage("connectionProblem", i) + " (#2, code=" + o.status + ")", !this._storageController.isUsedCustomServer() && !this._usePartialValidationFallbackServer) return this._usePartialValidationFallbackServer = !0, this._mainServerUnavailabilityTimeStamp = Date.now(), this.partialValidate(e, t, r, a, s)
            }
            throw o
        })
    }
}
Validator.FR_PREMIUM_RULES = ["IMP_PRON", "FR_COMPOUNDS", "AUX_ETRE_VCONJ", "XXieme", "A_ACCENT_A", "QUI_VCONJ", "QUASI_NOM", "ET_BIEN", "SE_CE", "AU_DESSOUS", "ACCORD_V_QUESTION", "ADRESSES_FRANCE", "AU_DELA", "VACANCE", "POSTULER_A", "MON_NFS", "SOI_DISANT", "VOIRE_MEME", "PAREIL_QUE", "A_LE", "NOM_MAL_EPELE", "T_EUPHONIQUE", "FORCEMENT", "S_IL_TE_PLAIT", "NUL_PART", "D_AVANTAGE", "COMMENCER_AVEC", "FAIRE_PARTI", "PARCE", "NOTRE", "ARRIVEE", "ETRE_DANS_LE_MEME_BATEAU", "RAPPELER_DE", "PEUT_IMPORTE", "EN_CAS_OU", "CI-ATTACHE", "kWh", "NORD_SUD", "AJOUTER_EN_PLUS", "URL", "COUR_COURS_COURT", "ALIGNER_AVEC", "PARTICIPER_DANS", "RIM", "LA_PLUS_PART", "QUANT_QUAND", "MILLES", "COMPLETER_UN_FORMULAIRE", "Y_A_T_IL", "COMME_PREVU", "FOIS_FOIE_FOI", "ACCORD_QUEL_QUE_SOIT", "DE_DAUTRES", "DEGOUTTER_DEGOUTER", "GRES_GRE", "MOINS_PIRE", "ADJ_ADV_INV", "VIEUX", "CARNET_DE_CHEQUE", "AUX_DEPENDS", "DE_TOUTE_FACON", "SALE_SALLE", "AUTANT_POUR_MOI", "MONTER_EN_HAUT"], Validator.NL_PREMIUM_RULES = ["VAAG", "FAAG_VAAG", "OVERDRIJVING", "KOMMA_HOEWEL", "TOO_LONG_SENTENCE", "NADRUKTEKENS", "AFKO_PUNT", "AAN_DE_HAND_VAN", "_2_LEESTEKENS", "IN_DE", "EURO", "WEEKEND", "CASU_QUO", "MOMENTEEL", "SLECHTS", "LOSSE_LETTERS", "LEENWOORDEN", "KOMMA_HOOR", "RELEVANT", "ZAL_ZUL", "HINTS", "OR_EENH_GETAL", "CHECKEN", "ALLEEN_BE", "MACHTE", "ECHTER", "COMMUNICEREN", "DESIGN", "SANDAAL_ZANDAAL", "N", "MIDDELS", "INTEGREREN", "PRIMAIR", "OVERIGENS", "BETREFFENDE", "AGENDA", "ERGO", "TEN_BEHOEVE", "KOMMA_AANH", "TM", "IE", "TER_ZAKE", "SIGNIFICANT", "GELIEVE", "BEHOREN", "NAAR_AANLEIDING_VAN", "VAN_PLAN_ZIJN", "HEDEN", "TEN_DODE", "VREEMD_VRZ_HIJ", "DES", "IMPACT", "IMMER", "BOVENSTAAND", "XXXYJE", "DUTCH_WRONG_WORD_IN_CONTEXT", "LANCEREN", "MET_BEHULP_VAN", "PRIORITEIT", "UWENTWEGE", "CATEGORIE", "CRITERIUM", "GEMOTIVEERD", "HOOFDZAKELIJK", "SPOORT_SPORT", "ERG_LANG_WOORD", "IN_DE_KINDERSCHOENEN", "CAVA_KAVA", "GROTERE_ALS", "BE_NL_VERSCHIL", "INTENTIE", "ONDERHAVIG", "EVALUATIE", "LOOPT_JIJ", "TARGET", "ESSENTIEEL", "TIJD", "FAKE_VAKE", "AFRONDEN", "DE_MENING_TOEGEDAAN", "ALDUS", "TEN_EINDE", "X-EN", "VAN_TEVOREN", "VERMANEN", "INCIDENT", "EXPLOSIEF", "DOORONTWIKKELEN", "MEDEDELEN", "IN_HET_KADER_VAN"], Validator.IGNORE_TEXT_REGEXP = {
    QUOTED_LINE: /^[ \t]*>.*?$/gm,
    HTML_OPENING_TAG: /<[a-z]+\b[^>]*>/gi,
    HTML_CLOSING_TAG: /<\/[a-z]+>/gi,
    MARKDOWN_IMAGE: /!\[.+?\]\(.*?\)/g,
    MARKDOWN_LINK: /\[.+?\]\(.*?\)/g,
    BB_OPENING_TAG: /\[(img|url|email|post|quote|list|youtube|vimeo|googlemaps|googlewidget|code|modalurl|topic|highlight|left|center|right|font|size|color|s|u|i|b)\b[^\]]*\]/gi,
    BB_CLOSING_TAG: /\[\/(img|url|email|post|quote|list|youtube|vimeo|googlemaps|googlewidget|code|modalurl|topic|highlight|left|center|right|font|size|color|s|u|i|b)\]/gi,
    WIKI_PLACEHOLDER_MARKUP: /\[\[[a-z:].+?\]\]/gi,
    JIRA_OPENING_TAG: /\{(color|code|noformat|quote)\:[a-z0-9#]+?\}/gi,
    JIRA_CLOSING_TAG: /\{(color|code|noformat|quote)\}/gi,
    JIRA_TEXT_TAG: /^(h[1-6]|bq)\./gim
}, Validator.IGNORE_ASCII_SMILEYS_REGEXPS = [/(\s|^)(xD)(?=\s|[\!\.\?\)]|$)/gi, /(\s|^)(\:\w+\:)(?=\s|[\!\.\?\)]|$)/g, /(\s|^)(\<[\/\\]?3)(?=\s|[\!\.\?]|$)/g, /(\s|^)([\(\)\\D|\*$][\-\^]?[\:\;\=])(?=\s|[\!\.\?]|$)/g, /(\s|^)([\:\;\=B8][\-\^]?[3DOPp\@\$\*\\\)\(\/\|])(?=\s|[\!\.\?\)]|$)/g, /(\s|^)(\((?:y|n|x|i|\-|\?|\!|\*|\*r|\*g|\*b|\*y|\+|on|off|flag|flagoff)\))(?=\s|[\!\.\?\)]|$)/g], Validator.SPELLING_RULES_ID = ["SPELLER_RULE", "MORFOLOGIK_RULE", "HUNSPELL", "SPELLING_RULE"], Validator.STYLE_ISSUE_TYPES = ["style", "locale-violation", "register"], Validator.EMAIL_SIGNATURE_SEPARATOR_REGEXP = /^[\‐|\-]{2,}|[\‐|\-]{2,}$/, Validator.ONLY_NUMBERS_REGEXP = /^[0-9]+$/, Validator.COLON_WHITESPACE_REGEXP = /^[;:]\s/, Validator.BULLET_POINT_REGEXP = /(\u25b6\ufe0e|\u25BA|\*|-|\u2606|\u2605|\u25cf|\u2022|\u25e6|\u27A4)\s+$/, Validator.LOWERCASE_REGEXP = /[a-z]/, Validator.DOT_WITH_PREFIX_REGEXP = /\w\.$/, Validator.SLASH_AT_END_REGEXP = /(\/|\\)$/, Validator.SLASH_AT_BEGINNING_REGEXP = /^(\/|\\)/, Validator.COMMON_TLDS = ["com", "co", "org", "net", "de", "info", "biz", "es", "fr", "be", "in", "gov", "nl", "ca", "com.br", "br", "at", "us", "au", "ru", "pl", "ly", "it", "cat", "edu", "jp", "ko", "cn", "se", "no", "mil", "ch", "dk", "com.mx", "mx", "eu", "co.uk", "uk", "ir", "cz", "ua", "kr", "gr", "tw", "nz", "co.nz", "za", "ro", "vn", "io", "tr", "me", "fi", "tv", "xyz", "pt", "ie"], Validator.COMMON_TLD_WITH_DOT_REGEXPS = Validator.COMMON_TLDS.map(e => new RegExp(`^\\.${e.replace(".","\\.")}\\b`, "i")), Validator.COMMON_FILE_TYPES = ["jpeg", "jpg", "gif", "png", "bmp", "svg", "ai", "sketch", "ico", "ps", "psd", "tiff", "tif", "mp3", "wav", "midi", "mid", "aif", "mpa", "ogg", "wma", "wpl", "cda", "7z", "arj", "deb", "pkg", "rar", "rpm", "tar.gz", "tar", "zip", "bin", "dmg", "iso", "toast", "vcd", "csv", "dat", "db", "log", "mdb", "sav", "sql", "xml", "apk", "bat", "bin", "cgi", "com", "exe", "gadget", "jar", "py", "js", "json", "wsf", "fnt", "fon", "otf", "ttf", "woff", "woff2", "rb", "java", "php", "html", "asp", "aspx", "cer", "cfm", "cgi", "pl", "css", "htm", "jsp", "part", "rss", "xhtml", "key", "odp", "pps", "ppt", "pptx", "class", "cpp", "cs", "h", "sh", "swift", "vb", "ods", "xlr", "xls", "xlt", "xltx", "bak", "cab", "cfg", "cpl", "cur", "dll", "dmp", "msi", "ini", "tmp", "3g2", "3gp", "avi", "flv", "h264", "m4v", "mkv", "mov", "mp4", "mpg", "mpeg", "rm", "swf", "vob", "wmv", "doc", "docx", "dot", "dotx", "pdf", "rtf", "text", "tex", "wks", "wps", "wpd", "txt"], Validator.COMMON_FILE_TYPE_WITH_DOT_REGEXPS = Validator.COMMON_FILE_TYPES.map(e => new RegExp(`^[\\wáàâóòìíéèùúâôîêûäöüß\\-\\.\\(\\)]*?\\.${e}\\b`, "i")), Validator._storageController = new StorageController, Validator._validationAbortControllers = new Map, Validator._partialValidationAbortControllers = new Map, Validator._useValidationFallbackServer = !1, Validator._usePartialValidationFallbackServer = !1, Validator._mainServerUnavailabilityTimeStamp = 0, Validator._isInitialized = !1, Validator._constructor(), "undefined" != typeof module && (module.exports = Validator);