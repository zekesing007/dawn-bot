const { getProxyAgent } = require("./proxy");
const UserAgent = require("user-agents");
const https = require("https");
const axios = require("axios");
const fs = require("fs");
const captchaServices = new (require("../utils/captchaServices"))();
const { logMessage } = require("../utils/logger");
const generator = new (require("../utils/generator"))();

module.exports = class dawnValidator {
  constructor(account, proxy = null, currentNum, total) {
    this.currentNum = currentNum;
    this.total = total;
    this.account = account;
    this.token = null;
    this.appid = null;
    this.proxy = proxy;
    this.axiosConfig = {
      ...(this.proxy && { httpsAgent: getProxyAgent(this.proxy) }),
      timeout: 120000,
    };
  }

  async makeRequest(method, url, config = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const userAgent = new UserAgent().toString();
        const headers = {
          "User-Agent": userAgent,
          ...config.headers,
        };
        const response = await axios({
          method,
          url,
          ...this.axiosConfig,
          ...config,
          headers,
        });

        if (response.status === 400) {
          throw new Error("400: Invalid token or request");
        }

        return response;
      } catch (error) {
        logMessage(
          this.currentNum,
          this.total,
          `Request Failed ${error.message}`,
          "error"
        );

        if (error.response && error.response.status === 400) {
          throw new Error("400: Invalid token or request");
        }

        logMessage(
          this.currentNum,
          this.total,
          `Retrying... (${i + 1}/${retries})`,
          "process"
        );
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
    }
    return null;
  }

  async getPuzzledId() {
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: `chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    try {
      const response = await this.makeRequest(
        "GET",
        `https://www.aeropres.in/chromeapi/dawn/v1/puzzle/get-puzzle?appid=${this.appid}`,
        {
          headers: headers,
        }
      );
      if (response.data.success === true) {
        logMessage(
          this.currentNum,
          this.total,
          `Success get puzzled id: ${response.data.puzzle_id}`,
          "success"
        );
        return response.data.puzzle_id;
      }
      return null;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Failed to get puzzled id: ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async getPuzzleImage(puzzleId) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: `chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    try {
      const response = await this.makeRequest(
        "GET",
        `https://www.aeropres.in/chromeapi/dawn/v1/puzzle/get-puzzle-image?puzzle_id=${puzzleId}&appid=${this.appid}`,
        {
          headers: headers,
        }
      );
      if (response.data.success === true) {
        logMessage(
          this.currentNum,
          this.total,
          `Success get puzzle image`,
          "success"
        );
        return response.data.imgBase64;
      }
      return null;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Failed to get puzzle image: ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async loginUser(puzzle_id, captcha) {
    logMessage(this.currentNum, this.total, "Trying login user...", "process");
    const current_datetime = new Date().toISOString();
    const headers = {
      "Content-Type": "application/json",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: `chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    const payload = {
      username: this.account.email,
      password: this.account.password,
      logindata: {
        _v: { version: "1.1.3" },
        datetime: current_datetime,
      },
      puzzle_id: puzzle_id,
      ans: captcha,
      appid: this.appid,
    };

    try {
      const response = await this.makeRequest(
        "POST",
        `https://www.aeropres.in/chromeapi/dawn/v1/user/login/v2?appid=${this.appid}`,
        {
          headers: headers,
          data: payload,
        }
      );
      if (response.data.status == true) {
        logMessage(
          this.currentNum,
          this.total,
          `Success login user`,
          "success"
        );
        return response.data.data.token;
      }
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Failed to login user: ${error.message}`,
        "error"
      );
      return null;
    }
  }

  async getPoints() {
    logMessage(
      this.currentNum,
      this.total,
      "Trying getting points...",
      "process"
    );
    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: `chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    try {
      const response = await this.makeRequest(
        "GET",
        `https://www.aeropres.in/api/atom/v1/userreferral/getpoint?appid=${this.appid}`,
        {
          headers: headers,
        }
      );

      if (response.data.status === true) {
        const { rewardPoint, referralPoint } = response.data.data;
        const totalPoints =
          (rewardPoint.points || 0) +
          (rewardPoint.registerpoints || 0) +
          (rewardPoint.signinpoints || 0) +
          (rewardPoint.twitter_x_id_points || 0) +
          (rewardPoint.discordid_points || 0) +
          (rewardPoint.telegramid_points || 0) +
          (rewardPoint.bonus_points || 0) +
          (referralPoint.commission || 0);
        logMessage(
          this.currentNum,
          this.total,
          `Success get points`,
          "success"
        );
        return totalPoints;
      }
      logMessage(this.currentNum, this.total, `Failed to get points`, "error");
      return null;
    } catch (error) {
      if (error.message.includes("400")) {
        await this.handleInvalidToken();
        return await this.getPoints();
      } else {
        logMessage(
          this.currentNum,
          this.total,
          `Failed to get points: ${error.message}`,
          "error"
        );
        return null;
      }
    }
  }

  async keepAliveRequest() {
    logMessage(this.currentNum, this.total, "Trying keep alive...", "process");

    const headers = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: `chrome-extension://fpdkjdnhkakefebpekbdhillbhonfjjp`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    };

    const payload = {
      username: this.account.email,
      extensionid: "fpdkjdnhkakefebpekbdhillbhonfjjp",
      numberoftabs: 0,
      _v: "1.1.3",
    };
    const ignoreSslAgent = new https.Agent({
      rejectUnauthorized: false,
    });
    try {
      const response = await this.makeRequest(
        "POST",
        `https://www.aeropres.in/chromeapi/dawn/v1/userreward/keepalive?appid=${this.appid}`,
        { headers: headers, data: payload, httpsAgent: ignoreSslAgent }
      );

      if (response.data.success === true) {
        logMessage(
          this.currentNum,
          this.total,
          `Success keep alive`,
          "success"
        );
        return true;
      }
      logMessage(
        this.currentNum,
        this.total,
        `Failed to keep alive: ${response.data.message}`,
        "error"
      );
      return false;
    } catch (error) {
      if (error.message.includes("400")) {
        await this.handleInvalidToken();
        return await this.keepAliveRequest();
      } else {
        logMessage(
          this.currentNum,
          this.total,
          `Failed to keep alive: ${error.message}`,
          "error"
        );
        return false;
      }
    }
  }

  async ensureAppidAndToken() {
    if (!this.account.data.appid || !this.account.data.token) {
      logMessage(
        this.currentNum,
        this.total,
        "AppID or Token is missing. Generating new ones...",
        "process"
      );
      const success = await this.generateAppidAndToken();
      if (success) {
        const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
        const updatedAccounts = accounts.map((acc) => {
          if (acc.email === this.account.email) {
            acc.data.appid = this.appid;
            acc.data.token = this.token;
          }
          return acc;
        });
        fs.writeFileSync(
          "accounts.json",
          JSON.stringify(updatedAccounts, null, 2)
        );
        logMessage(
          this.currentNum,
          this.total,
          "AppID and Token updated in accounts.json",
          "success"
        );
      } else {
        throw new Error("Failed to generate AppID and Token");
      }
    } else {
      this.appid = this.account.data.appid;
      this.token = this.account.data.token;
    }
  }

  async handleInvalidToken() {
    logMessage(
      this.currentNum,
      this.total,
      "Token is invalid. Attempting to generate a new one...",
      "process"
    );
    const success = await this.generateAppidAndToken();
    if (success) {
      const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
      const updatedAccounts = accounts.map((acc) => {
        if (acc.email === this.account.email) {
          acc.data.token = this.token;
        }
        return acc;
      });
      fs.writeFileSync(
        "accounts.json",
        JSON.stringify(updatedAccounts, null, 2)
      );
      logMessage(
        this.currentNum,
        this.total,
        "Token updated in accounts.json",
        "success"
      );
    } else {
      throw new Error("Failed to generate new Token");
    }
  }

  async generateAppidAndToken() {
    try {
      this.appid = generator.generateAppId();
      const puzzle_id = await this.getPuzzledId();
      const puzzle_image = await this.getPuzzleImage(puzzle_id);
      const captcha = await captchaServices.solveCaptcha(puzzle_image);
      const login = await this.loginUser(puzzle_id, captcha);
      this.token = login;
      return true;
    } catch (error) {
      logMessage(
        this.currentNum,
        this.total,
        `Failed generate app id and token ${error.message}`,
        "error"
      );
    }
  }

  async processKeepAlive() {
    try {
      await this.ensureAppidAndToken();
      const getPoint = await this.getPoints();
      const keepAlive = await this.keepAliveRequest();

      return {
        email: this.account.email,
        points: getPoint,
        keepAlive: keepAlive,
      };
    } catch (error) {
      if (error.message.includes("400")) {
        await this.handleInvalidToken();
        return await this.processKeepAlive();
      } else {
        logMessage(
          this.currentNum,
          this.total,
          `Failed to process account: ${error.message}`,
          "error"
        );
        throw error;
      }
    }
  }
};
