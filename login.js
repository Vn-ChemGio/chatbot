require('dotenv').config();

const fs = require("fs");
const login = require("facebook-chat-api");
const readline = require("readline");


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const option = {
    logLevel:"silent",
    forceLogin:true,
    userAgent:  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0"
   //* cách lấy userAgent: F12-> tab console gõ 'navigator.userAgent' Link: https://imgur.com/oQ5hUkH
};

const obj = {email: process.env.FB_USERNAME, password: process.env.FB_PASSWORD};

login(obj, option, (err, api) => {
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
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
    
     
});


 