/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */

const config= {
    MAX_TEXT_LENGTH:1e4,
    MAX_TEXT_LENGTH_PREMIUM:4e4,
    REQUEST_TIMEOUT:25e3,
    SWITCH_TO_FALLBACK_SERVER_ERRORS:[502,
    503,
    504],
    MAIN_SERVER_RECHECK_TIME:18e5,
    MAX_FIXES_COUNT:5,
    MAX_EXCEPTION_COUNT:10,
    VALIDATION_DEBOUNCE_TIMEOUT:1400,
    INTERMEDIATE_VALIDATION_INTERVAL:3500,
    CHECK_EXTENSION_HEALTH_INTERVAL:3e3,
    STOPPED_TYPING_TIMEOUT:2250,
    RENDER_INTERVAL:300,
    DECREASE_SIZE_INTERVAL:900,
    INSTALL_URL:"https://autobot.asia/webextension/install",
    UNINSTALL_URL:"https://autobot.asia/webextension/uninstall",
    MIN_TEXT_LENGTH:5,
    MAIN_SERVER_URL:"https://api.autobot.asia/v2",
    FALLBACK_MAIN_SERVER_URL:"https://api-fallback.autobot.asia/v2",
    PREMIUM_SERVER_URL:"https://autobot.asia/api/v2",
    FALLBACK_PREMIUM_SERVER_URL:"https://api.autobot.asia/v2",
    LOCAL_SERVER_URL:"http://localhost:8081/v2",
    MAX_USAGE_COUNT_ONBOARDING:5,
    COLORS: {
        GRAMMAR: {
            UNDERLINE: "#F8C639", BACKGROUND: "#F8C63950", TITLE: "#D2A013"
        }
        ,
        STYLE: {
            UNDERLINE: "#8F7FFF", BACKGROUND: "#8F7FFF50", TITLE: "#5C4CFF"
        }
        ,
        SPELLING: {
            UNDERLINE: "#F91A47", BACKGROUND: "#F91A4733", TITLE: "#F91A47"
        }
    }
}

;