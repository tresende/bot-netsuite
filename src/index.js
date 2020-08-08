const puppeteer = require('puppeteer');
require('dotenv').config()

async function run() {
    let curentPage = {};
    curentPage = await login();
    curentPage = await secretResponse(curentPage);
    curentPage = await goToTimePage(curentPage);
}

async function getBrowserInstance() {
    if (this.browser) return this.browser;
    this.browser = await puppeteer.launch({ headless: false });
    return this.browser;
}

async function login() {
    const page = await navigateTo(process.env.BASE_URL);
    const user = process.env.USER;
    const pass = process.env.PASS;
    page.evaluate(async (user, pass) => {
        document.querySelector('[name="email"]').value = user;
        document.querySelector('[name="password"]').value = pass;
        document.querySelector("form").submit();
    },
        user,
        pass
    );
    return page;
}

async function navigateTo(url, currentPage) {
    let browserInstace = await getBrowserInstance();
    const page = currentPage || await browserInstace.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    return page;
}

async function secretResponse(page) {
    await page.waitForSelector('.page-message.text-opensans', { visible: true, timeout: 0 });
    const answer = process.env.ANSWER;
    page.evaluate(async (answer) => {
        document.querySelector('[name="answer"]').value = answer;
        document.querySelector("form").submit();
    }, answer);
    return page;
}

async function goToTimePage(page) {
    await page.waitForSelector('.ns-menu.uir-menu-main.ns-menubar', { visible: true, timeout: 0 });
    const currentPage = await navigateTo(process.env.TIME_PAGE, page);
    return await copyLastWeekValues(currentPage);
}

async function copyLastWeekValues(page) {
    await page.waitForSelector('#secondarycopytimesheet', { visible: true, timeout: 0 });
    page.evaluate(async () => {
        document.getElementById('secondarycopytimesheet').click();
    });

    await page.waitFor(6000);
    page.evaluate(async () => {
        [...document.querySelectorAll('iframe')][2].contentDocument.getElementById("copy").click();
    });

    await page.waitForSelector('#timeitem_row_4', { visible: true, timeout: 0 });
    page.evaluate(async () => {
        document.querySelector("#btn_secondarymultibutton_submitter").click();
    });
    return page;
}

run();