chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.infor == 'hello'){
        console.log('hello', message.msg);
    };
    return true;
});