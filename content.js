console.log("Chrome extension is running!");

chrome.runtime.onMessage.addListener(receiver);

function receiver(request, sender, sendResponse) {
    if (request.text1 == 'package01') {
        document.getElementsByClassName('gLFyf gsfi')[0].value = 'hôm nay thứ mấy';  
    }
    //console.log('request.text1', request.text1);

    else if (request.text1 == 'package02') {
        document.getElementsByClassName('gLFyf gsfi')[0].value = 'HOM NAY THU MAY ';
    }
    // console.log('request.text2', request.text2);

    if (request.from == "popup"){
        var domInfo = {
            total: document.getElementsByClassName('gLFyf gsfi')[0].value
        };
        console.log(domInfo.total);
        sendResponse(domInfo);
    }
}

document.addEventListener('input', function(e){
    var information = {
        infor : 'hello',
        msg : document.getElementsByClassName('gLFyf gsfi')[0].value
    }
    chrome.extension.sendMessage(information, function(response){
        console.log('hello');
    });
}, false);
