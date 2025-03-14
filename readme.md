# Dawn Validator bot

for keeping keep alive dawn to earn point

## Features

- Multi Account
- Uses proxies to avoid IP bans/Limit.
- Auto get new token and appid if expired

## Requirements

- NodeJS [Download](https://nodejs.org/en/download).
- Dawn Validator Account.
- 2Captcha / AntiCaptcha Apikey , if you don't have apikey services you can using telegram bot for solving captcha.
- Proxy (Optional).
- Get token telegram with bot father @BotFather (search in telegram)
- Get Chat ID with bot @userinfobot (search in telegram)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/ahlulmukh/dawn-bot.git
   cd dawn-bot
   ```

2. Instal Packages:

   ```sh
   npm install
   ```

3. Create a `proxy.txt` file in the root directory and add your proxies (one per line) (Optional).

   ```
   http://user:pass@host:port
   http://user:pass@host:port
   http://user:pass@host:port
   ```

4. Crete account file, `cp accounts.json.example accounts.json` and put your email password, if you dont have appid or token just leave it, bot can make it for you.

   ```json
   [
     {
       "email": "email",
       "password": "pw",
       "data": {
         "appid": "",
         "token": ""
       }
     },
     {
       "email": "email2",
       "password": "pw2",
       "data": {
         "appid": "",
         "token": ""
       }
     },
     {
       "email": "email3",
       "password": "pw3",
       "data": {
         "appid": "",
         "token": ""
       }
     }
   ]
   ```

5. Make config for captcha services `cp config.js.example config.js`

   ```js
   module.exports = {
     captchaServices: {
       captchaUsing: "2captcha", // '2captcha' or 'antiCaptcha' or 'manual' for telegram bot solving
       captcha2Apikey: ["your_apikey"], // array
       antiCaptcha: ["your_apikey"], // array
     },
     telegramConfig: {
       botToken: "your_bot_token", //change with your bot token
       chatId: "your_chat_id", // change with your id telegram
     },
   };
   ```

## Usage

1. Run the bot:

```sh
node .
```

2. And Done

## Stay Connected

- Channel Telegram : [Telegram](https://t.me/elpuqus)
- Channel WhatsApp : [Whatsapp](https://whatsapp.com/channel/0029VavBRhGBqbrEF9vxal1R)
- Discord : [Discord](https://discord.com/invite/uKM4UCAccY)

## Donation

If you would like to support the development of this project, you can make a donation using the following addresses:

- Solana: `5jQMndHzWVH8MCitXdUEYmshJZXVKCzUG12mxJku4WdX`
- EVM: `0x72120c3c9cf3fee3ad57a34d5fcdbffe45f4ff28`
- BTC: `bc1ppfl3w3l4spnda7lawlhlycwuq2ekz74c936c8emwfprfu9hyun6sq5k6xl`

## Disclaimer

This tool is for educational purposes only. Use it at your own risk.
