const puppeteer = require("puppeteer-extra");

const {
    parse
} = require("node-html-parser");

const {
    REST,
    Routes
} = require("discord.js");

const {
    readdirSync,
    readFileSync,
    writeFileSync
} = require("fs");

puppeteer.use(
    require("puppeteer-extra-plugin-stealth")()
);

module.exports.loadCommands = async function() {
    const rest = new REST({
        version: "10"
    }).setToken(config.TOKEN);

    for (const file of readdirSync("./src/command").filter(file => file.endsWith(".js"))) {
        const module = require("../command/" + file);
        const command = module.toJSON();

        commands[command.name] = command;
    }

    await rest.put(
        Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), {
            body: Object.values(commands)
        }
    );
}

module.exports.loadEvents = async function() {
    for (const file of readdirSync("./src/event").filter(file => file.endsWith(".js"))) {
        const event = require("../event/" + file);   
        const fileName = file.replace(/\.[^/.]+$/, "");     
        
        client.on(fileName, (...args) => event(...args));
    }
}

module.exports.request = async function(operation) {
    const url = config.URL + config.SCANS_PATH;
    const api = config.URL + config.API_PATH;

    const cookies = JSON.parse(readFileSync("./src/data/cookies.json").toString());

    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true,
        headless: "new"
    });

    let [page] = await browser.pages();
    let scans = [];

    await page.setViewport({
        width: 800,
        height: 800,
        deviceScaleFactor: 3
    });

    page.on("response", async (response) => {
        if (response.url() === api) {
            const resp = await response.json();
            scans = resp.data || [];
        }
    });

    await page.setCookie(...cookies);
    await page.goto(url);

    const needToLogin = await page.evaluate(() => {
        return !!document.querySelector(".login-main");
    });

    if (needToLogin) {
        let input = await page.waitForSelector("input[id=\"username\"]");
        await input.type(config.SOLTIX_EMAIL);

        input = await page.waitForSelector("input[id=\"password\"]");
        await input.type(config.SOLTIX_PASSWORD);

        await page.waitForTimeout(2000);
        
        await page.click("input[type=\"checkbox\"]");
        await page.click("button[id=\"submit\"]");

        await page.waitForTimeout(3000);
        await page.goto(url);

        const newCookies = await page.cookies(url);
        writeFileSync("./src/data/cookies.json", JSON.stringify(newCookies));
    }

    let link = null;

    switch (operation) {
        case null:
            const html = await page.content();
            const root = await parse(html);

            await browser.close();

            const pinElement = root.querySelector("input[id=\"pin\"]");
            return pinElement._attrs.value;
        default:
            await page.waitForTimeout(1500);

            for (const scan of scans) {
                if (scan[0] === operation) {
                    const root = await parse(scan[2]);
                    const span = root.querySelector("span[class=\"linkRow\"]");

                    link = span._attrs["data-value"];
                    break;
                }
            }
            break;
    }

    if (link === null) {
        await browser.close();
        return null;
    }

    await page.goto(config.URL + link);
    await page.waitForTimeout(1500);

    await page.screenshot({
        path: "./src/data/screenshots/" + operation + ".jpg",
        fullPage: true
    });

    await browser.close();
    return operation;
}