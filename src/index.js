const dawnValidator = require("./class/dawnbot");
const chalk = require("chalk");
const { getRandomProxy, loadProxies } = require("./class/proxy");
const fs = require("fs");
const { logMessage } = require("./utils/logger");

async function main() {
  console.log(
    chalk.cyan(`
░█▀▄░█▀█░█░█░█▀█
░█░█░█▀█░█▄█░█░█
░▀▀░░▀░▀░▀░▀░▀░▀
    https://t.me/cryptokom2
    https://t.me/cryptokom1
 Use it at your own risk
  `)
  );

  try {
    const accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
    const count = accounts.length;
    const proxiesLoaded = loadProxies();
    if (!proxiesLoaded) {
      logMessage(
        null,
        null,
        "Failed to load proxies, using default IP",
        "warning"
      );
    }
    while (true) {
      logMessage(null, null, "Starting new process, Please wait...", "debug");
      const results = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        try {
          console.log(chalk.white("-".repeat(85)));
          const currentProxy = await getRandomProxy();
          const dawn = new dawnValidator(account, currentProxy, i + 1, count);
          const data = await dawn.processKeepAlive();
          results.push({
            email: data.email,
            points: data.points || 0,
            keepAlive: data.keepAlive || false,
            proxy: currentProxy,
          });
        } catch (error) {
          logMessage(
            null,
            null,
            `Failed to process account: ${error.message}`,
            "error"
          );
          results.push({
            email: "N/A",
            points: 0,
            keepAlive: false,
            proxy: "N/A",
          });
        }
      }
      console.log("\n" + "═".repeat(70));
      results.forEach((result) => {
        logMessage(null, null, `Account: ${result.email}`, "success");
        logMessage(null, null, `Total Points: ${result.points}`, "success");
        const keepAliveStatus = result.keepAlive
          ? chalk.green("✔ Keep Alive Success")
          : chalk.red("✖ Keep Alive Failed");
        logMessage(null, null, `Keep Alive: ${keepAliveStatus}`, "success");
        logMessage(null, null, `Proxy: ${result.proxy}`, "success");
        console.log("─".repeat(70));
      });

      logMessage(
        null,
        null,
        "Process completed, waiting for 10 minutes before starting new process",
        "success"
      );

      await new Promise((resolve) => setTimeout(resolve, 60000 * 10));
    }
  } catch (error) {
    logMessage(null, null, `Main process failed: ${error.message}`, "error");
  }
}

main();
