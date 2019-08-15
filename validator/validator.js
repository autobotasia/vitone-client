const id = new URL(window.location.href).searchParams.get("id"),
    validatorElement = document.getElementById("text-field"),
    statusHeadline = document.getElementById("status-headline"),
    statusText = document.getElementById("status-text"),
    statusBox = document.getElementById("status-box"),
    statusButton = document.getElementById("status-button");
translateSection(document.documentElement), statusButton.addEventListener("click", () => {
    let t = "https://autobot.asia/webextension/upgrade?pk_campaign=addon2-validator-premium-errors";
    t += `&grammarMatches=${currentState.hiddenErrors.filter(t=>!t.isStyleError).length}`, t += `&styleMatches=${currentState.hiddenErrors.filter(t=>t.isStyleError).length}`, window.open(t, "_target")
}), id ? browser.runtime.sendMessage({
    command: "VALIDATOR_LOADED",
    id: id
}).then(t => {
    t.text && (validatorElement.value = t.text, resize()), history.replaceState({}, "", location.pathname)
}).catch(t => {
    Tracker.trackError("js", "validator_failed", "promise")
}).then(() => {
    Tracker.trackPageView()
}) : (validatorElement.value = localStorage.getItem("validator-text") || "", Tracker.trackPageView(), resize()), window.addEventListener("beforeunload", () => {
    localStorage.setItem("validator-text", validatorElement.value)
});
const storageController = new StorageController(() => {
    storageController.getUIState().hasPaidSubscription || storageController.isUsedCustomServer() || (document.querySelector("#sidebar").classList.remove("validator__sidebar--collapsed"), resize())
});
let initialized = !1,
    currentState = null;

function resize() {
    validatorElement.style.height = "0px", validatorElement.style.overflow = "hidden";
    const t = validatorElement.scrollHeight;
    validatorElement.style.height = t + "px", validatorElement.style.overflow = ""
}
document.addEventListener(LTAssistant.eventNames.updateState, t => {
    if (initialized || (initialized = !0, statusBox.setAttribute("data-initialized", "true")), validatorElement.value.length < config.MIN_TEXT_LENGTH) return statusHeadline.textContent = browser.i18n.getMessage("validatorNoTextStatus"), statusText.textContent = "", statusBox.className = "validator__status-box validator__status-box--no-errors", void(currentState = null);
    const e = t.detail;
    if (JSON.stringify(e) === JSON.stringify(currentState)) return;
    statusBox.className = "validator__status-box", currentState = e;
    const a = e.requestStatus;
    a === REQUEST_STATUS.IN_PROGRESS ? (statusBox.classList.add("validator__status-box--in-progress"), statusHeadline.textContent = browser.i18n.getMessage("validatorLoadingHint"), statusText.textContent = "") : a === REQUEST_STATUS.COMPLETED ? e.errors && e.errors.length ? (statusBox.classList.add("validator__status-box--has-errors"), statusHeadline.textContent = 1 === e.errors.length ? browser.i18n.getMessage("validatorHasMistakesHeadlineSingular") : browser.i18n.getMessage("validatorHasMistakesHeadlinePlural", [e.errors.length]), statusText.textContent = browser.i18n.getMessage("validatorHasMistakesText")) : e.hiddenErrors && e.hiddenErrors.length ? (statusBox.classList.add("validator__status-box--has-premium-errors"), statusHeadline.textContent = 1 === e.hiddenErrors.length ? browser.i18n.getMessage("validatorHasPremiumErrorsHeadlineSingular") : browser.i18n.getMessage("validatorHasPremiumErrorsHeadlinePlural", [e.hiddenErrors.length]), statusText.textContent = browser.i18n.getMessage("validatorHasPremiumErrorsText")) : (statusHeadline.textContent = browser.i18n.getMessage("validatorNoMistakesHeadline"), statusText.textContent = "", statusBox.classList.add("validator__status-box--no-errors")) : a === REQUEST_STATUS.FAILED && e.exceptionMessage ? (statusText.textContent = "", statusHeadline.textContent = e.exceptionMessage, statusBox.classList.add("validator__status-box--has-exception")) : a === REQUEST_STATUS.UNSUPPORTED_LANGUAGE ? (statusHeadline.textContent = browser.i18n.getMessage("dialogUnsupportedLanguageHeadline"), statusText.textContent = browser.i18n.getMessage("dialogUnsupportedLanguageText"), statusBox.classList.add("validator__status-box--has-exception")) : (statusText.textContent = "", statusHeadline.textContent = browser.i18n.getMessage("statusIconError"), statusBox.classList.add("validator__status-box--has-exception"))
}), window.addEventListener("resize", resize), validatorElement.addEventListener("input", resize);