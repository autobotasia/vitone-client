const id = new URL(window.location.href).searchParams.get("id"),
    statusBox = document.getElementById("status-box");
statusBox.setAttribute("data-initialized", "true");
translateSection(document.documentElement);
browser.runtime.sendMessage({
    command: "VALIDATOR_LOADED",
    id: id
}).then(t => {
    let dataToSend = {}
    dataToSend.metaData = { EmailToAddress: "" }
    dataToSend.text = [
        { text: t.text, offset: 0 }
    ]
    const divMainContent = document.getElementById("div-main-content");
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "http://ai.nccsoft.vn:8888/check", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

            let data = JSON.parse(xmlhttp.responseText);
            let replacements = data.matches.replacements
            if(replacements.length > 0) {
                statusBox.classList.add("validator__status-box--has-errors")
                replacements.forEach(ele => {
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
            } else {
                divMainContent.textContent = ""
                const tagH4 = document.createElement("h4")
                tagH4.textContent = "Không tìm thấy lỗi"
                divMainContent.appendChild(tagH4)
            }
        }
    }
    xmlhttp.send(JSON.stringify(dataToSend));
}).catch(t => {
    Tracker.trackError("js", "validator_failed", "promise")
});
