const RatingTeaser = function(e, t, i) {
    this._container = e, this._componentName = t, this._url = i, this._storageController = new StorageController
};
RatingTeaser.prototype = {
    render() {
        loadStylesheet("/teaser/rating/rating.css"), loadHTML("/teaser/rating/rating.html").then(e => {
            this._container.innerHTML = e, this._element = this._container.querySelector("#rating-teaser"), this._link = this._container.querySelector("#rating-teaser-link"), BrowserDetector.isChrome() ? (this._element.classList.add("lt-rating-teaser--chrome"), this._link.href = "https://chrome.google.com/webstore/detail/grammar-and-spell-checker/oldceeleldhonbafppcapldpdifcinji/reviews") : BrowserDetector.isFirefox() && (this._element.classList.add("lt-rating-teaser--firefox"), this._link.href = "https://addons.mozilla.org/firefox/addon/languagetool/"), this._translate(), this._observe(), Tracker.trackEvent("Action", `${this._componentName}:rating_teaser`)
        })
    }, _translate() {
        translateSection(this._container);
        const e = document.querySelector("#review-headline");
        BrowserDetector.isFirefox() ? translateElement(e, "reviewFirefoxHeadline") : translateElement(e, "reviewChromeHeadline")
    }, _observe() {
        this._container.querySelector("[data-lt-emotion=like]").addEventListener("click", () => this._sendRating("like")), this._container.querySelector("[data-lt-emotion=dislike]").addEventListener("click", () => this._sendRating("dislike")), this._link.addEventListener("click", () => {
            Tracker.trackEvent("Action", "dialog:rating_teaser:click")
        })
    }, _sendRating(e) {
        Tracker.trackEvent("Stat", `rating:${getPrimaryLanguageCode(navigator.language)}`, e), this._storageController.updateStatistics({
            ratingValue: e
        }), this._storageController.updateUIState({
            hasRated: !0
        }), "like" === e ? BrowserDetector.isChrome() || BrowserDetector.isFirefox() ? this._showReviewContainer() : this._showThanksContainer() : "dislike" === e && (this._showThanksContainer(), this._openFeedbackForm(browser.i18n.getMessage("ratingUnhappyQuestion")), Tracker.trackEvent("Stat", "dislike_host", getCurrentHostname()))
    }, _showReviewContainer() {
        this._element.classList.remove("lt-rating-teaser--thanks-visible"), this._element.classList.add("lt-rating-teaser--review-visible")
    }, _showThanksContainer() {
        this._element.classList.remove("lt-rating-teaser--review-visible"), this._element.classList.add("lt-rating-teaser--thanks-visible")
    }, _openFeedbackForm(e) {
        browser.runtime.sendMessage({
            command: "OPEN_FEEDBACK_FORM",
            url: this._url,
            title: e
        })
    }
};