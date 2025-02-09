/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
let currentDocumentElement, interval;
function destroyOldInstances() {
  window.ltAssistant && window.ltAssistant.destroy(),
    dispatchCustomEvent(LTAssistant.eventNames.destroy, {});
}
function initLTAssistant() {
  destroyOldInstances(),
    (currentDocumentElement = document.documentElement) &&
      !currentDocumentElement.hasAttribute("data-lt-installed") &&
      ((window.ltAssistant = new LTAssistant({
        onDestroy: () => {
          clearInterval(interval);
        }
      })),
      clearInterval(interval),
      (interval = setInterval(() => {
        currentDocumentElement !== document.documentElement &&
          initLTAssistant();
      }, 1e3)));
}
window.ltAssistant || initLTAssistant();
