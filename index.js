require('dotenv').config();

const fs = require("fs");
const login = require("facebook-chat-api");
const readline = require("readline");
var request = require('request');

const option = {
    logLevel:"silent",
    forceLogin:true,
    userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0"
    //* cách lấy userAgent: F12-> tab console gõ 'navigator.userAgent' Link: https://imgur.com/oQ5hUkH
};


function reLogin (){
    let  dataLogin = {email: process.env.FB_USERNAME, password: process.env.FB_PASSWORD};
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    login(dataLogin, option, (err, api) => {
        if(err) {
            switch (err.error) {
                case 'login-approval':
                    console.log('Enter code > ');
                    rl.on('line', (line) => {
                        err.continue(line);
                        rl.close();
                    });
                    break;
                default:
                    console.error(err);
            }
            return;
        }
        // Logged in wirite cookie!
        fs.writeFile('appstate.json', JSON.stringify(api.getAppState()),function (err) {
            if(err)
                return  console.log(err);

            return startBot ();
        });
    });
}

function startBot (){
    console.log("==============restart BOT");
    fs.readFile('appstate.json',{encoding:'utf8'}, function (err, data) {
        if(err || data == "")
            return reLogin();

        login({
            appState: JSON.parse(data)
        }, function(err, api) {
            if (err) {
                console.error(err);
                return reLogin();
            }
            console.log("============== BOT READY");
            api.setOptions({
                selfListen: false,
                logLevel: option.logLevel,
                updatePresence: false,
                userAgent: option.userAgent
            });


            let yourId = api.getCurrentUserID(); //lấy Id người login hiện tại

            api.listen(function callback(err, message) {
                //block icon: fix bug khi nhận đc icon
                if (message.body == '') {
                    api.sendMessage("[From: Chủ tịch]Nói gì vậy, nói lại nghe coi :(", message.threadID);
                    return;
                }

                //block all group : Chỗ này block all nhóm chát, k thíc thì comment lại
                if (message.isGroup) return console.log("block all group");
                //Simsimi

                if (botStatusThreads.hasOwnProperty(message.threadID)) {
                    api.sendMessage(" [From: Chủ tịch]: Đã ghi nhận yêu cầu của bạn, chủ tịch sẽ phản hồi sớm nhất có thể", message.threadID);
                }

                /*if (!answeredThreads.hasOwnProperty(message.threadID)) {*/
                if (true) {

                    //Chức năng này dành cho người muốn bỏ qua ID nào đó
                    // Tìm id ở đây https://findmyfbid.in/
                    // Thêm 1 người vào chỉ cần thêm dấu ,"ID người"
                    // Group cũng thế

                    //if(blockGroupChat(message.threadID)){
                    //	return;
                    //};
                    if (blockUserChat(message.threadID)) {
                        return;
                    };

                    answeredThreads[message.threadID] = true;
                    api.sendMessage("[From: Chủ tịch]: Chủ tịch đang bận, sẽ phản hồi bạn ngay khi có thể", message.threadID);
                }
            });

        });
    })
    

}


var answeredThreads = {};
var botStatusThreads = {};

blockGroupChat = function (threadID) {
    var blockGroupIds = ["id gourup chat", "id gourup chat"];
    if (blockGroupIds.find(x => x == threadID)) {
        console.error("block GroupId: " + threadID);
        return true;
    }
    return false;
};

blockUserChat = function (threadID) {
    var blockUserIds = ["id user", "id user"];
    if (blockUserIds.find(x => x == threadID)) {
        console.error("block ID: " + threadID);
        return true;
    }
    return false;
};

startBot();



