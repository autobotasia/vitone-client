const PremiumErrorsTeaser=function(r,e,t){this._container=r,this._grammarErrorsCount=e,this._styleErrorsCount=t,this._totalErrorsCount=e+t};PremiumErrorsTeaser.prototype={render(){loadStylesheet("/teaser/premiumErrors/premiumErrors.css"),loadHTML("/teaser/premiumErrors/premiumErrors.html").then(r=>{this._container.innerHTML=r,this._element=this._container.querySelector("#premium-errors-teaser"),this._text=this._container.querySelector("#lt-premium-errors-teaser-text"),this._translate(),this._observe(),Tracker.trackEvent("Action","dialog:premium_teaser");let e="https://autobot.asia/webextension/upgrade?pk_campaign=addon2-dialog-premium-errors";e+=`&grammarMatches=${this._grammarErrorsCount}&styleMatches=${this._styleErrorsCount}`,this._element.href=e})},_translate(){translateSection(this._container);const r=1===this._totalErrorsCount?"premiumErrorsTextSingular":"premiumErrorsTextPlural";translateElement(this._text,{key:r,isHTML:!0,interpolations:[this._totalErrorsCount]})},_observe(){this._element.addEventListener("click",()=>{Tracker.trackEvent("Action","dialog:premium_teaser:click")})}};