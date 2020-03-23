const UpgradeTeaser = function(e, t) {
  (this._container = e), (this._componentName = t);
};
UpgradeTeaser.prototype = {
  render() {
    loadStylesheet("/teaser/upgrade/upgrade.css"),
      loadHTML("/teaser/upgrade/upgrade.html")
      .then(e => {
        (this._container.innerHTML = e), this._translate(), this._observe();
      });
  },
  _translate() {
    translateSection(this._container);
  },
  _observe() {}
};
