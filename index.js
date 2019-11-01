require('dotenv').config();

const fs = require("fs");
const login = require("facebook-chat-api");
const readline = require("readline");

const option = {
    logLevel:"silent",
    forceLogin:true,
    userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0"
    //* cách lấy userAgent: F12-> tab console gõ 'navigator.userAgent' Link: https://imgur.com/oQ5hUkH
};


function reLogin (){
    let  dataLogin = {email: process.env.FB_USERNAME, password: process.env.FB_PASSWORD};

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
        fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState())).then(function () {
            startBot ();
        });
    });
}

function startBot (){
    login({
        appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))
    }, function(err, api) {
        if (err) {
            console.error(err);
            reLogin();
        }

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
                api.sendMessage("Bot không hiểu bạn nói. Xin lỗi nha :(", message.threadID);
                return;
            }

            //block all group : Chỗ này block all nhóm chát, k thíc thì comment lại
            if (message.isGroup) return console.log("block all group");
            //Simsimi


            if (message.body == "bot" || message.body == "Bot") {
                botStatusThreads[message.threadID] = true;
                isSimsimi = true;
                api.sendMessage("Đã bật chế độ nói chuyện với bot (gõ offbot để tắt). Bắt đầu nào!", message.threadID);
                return console.log("On sim");
            } else if (message.body == "offbot" || message.body == "Offbot") {
                isSimsimi = false;
                botStatusThreads[message.threadID] = false;
                api.sendMessage("Đã tắt chế độ nói chuyện với bot.", message.threadID);
            }

            if (isSimsimi && botStatusThreads.hasOwnProperty(message.threadID)) {
                var user = yourId + "_" + message.threadID;
                console.log(user);
                //#1. use simsimi
                useSimsimi(message.threadID,message.body,api);

                return console.log("Pet next");
            }

            if (!answeredThreads.hasOwnProperty(message.threadID)) {

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
                api.sendMessage("Tin nhắn trả lời tự động.\n- Trả lời `bot` để nói chuyện đỡ buồn.", message.threadID);
            }
        });

    });
}

var request = require('request');

var answeredThreads = {};
var botStatusThreads = {};
var isSimsimi = false;

const simsimi = require('simsimi')({
    key: process.env.SIMSIMI_KEY, //key get here: https://workshop.simsimi.com
    lang: "vn",
    atext_bad_prob_max: 0.0, // Chỉ số nói tục
    atext_bad_prob_min: 0.0,
});
useSimsimi = function (threadID, text, api) {
    (async () => {
        try {
            if (blockGroupChat(threadID)) {
                return;
            };
            if (blockUserChat(threadID)) {
                return;
            };
            const response = await simsimi(text);

            api.sendMessage(response, threadID);
        } catch (e){
            console.log("==============",e);
            api.sendMessage("Pet không hiểu bạn nói. Xin lỗi nha :(", threadID);
        }
    })();
};

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



