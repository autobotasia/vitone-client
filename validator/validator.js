const id = new URL(window.location.href).searchParams.get("id"),
    statusBox = document.getElementById("status-box");
statusBox.setAttribute("data-initialized", "true");
translateSection(document.documentElement);
browser.runtime.sendMessage({
    command: "VALIDATOR_LOADED",
    id: id
}).then(t => {
    var bkg = chrome.extension.getBackgroundPage();
    bkg.console.log("t.text", t.text);
    let dataToSend = {}
    dataToSend.metaData = { EmailToAddress: "" }
    dataToSend.text = [
        { text: t.text, offset: 0 }
    ]
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://ai.nccsoft.vn:8888/check", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.status == 200) {

            let data = JSON.parse(xmlhttp.responseText);
            bkg.console.log("\n\n\n")
            bkg.console.log("data", data)
            let replacements = data.matches.replacements
            if(replacements.length > 0) {
                statusBox.classList.add("validator__status-box--has-errors")
                replacements.forEach(ele => {
                    const divMainContent = document.getElementById("div-main-content");
                    divMainContent.textContent = ""
                    const p = document.createElement("p")
                    const tagH4 = document.createElement("h4")
                    tagH4.textContent = ele.origin
                    p.appendChild(tagH4)
                    const tagP = document.createElement("p")
                    tagP.textContent = ele.replaceby
                    p.appendChild(tagP)
                    divMainContent.appendChild(p)
                })
            }
        }
    }
    xmlhttp.send(JSON.stringify(dataToSend));
}).catch(t => {
    Tracker.trackError("js", "validator_failed", "promise")
});
