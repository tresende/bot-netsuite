const puppeteer = require('puppeteer');
require('dotenv').config()

async function run() {
    await login();
    await secretResponse();
    await goToTimePage();
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
    page.evaluate(
        async (user, pass) => {
            document.querySelector('[name="email"]').value = user;
            document.querySelector('[name="password"]').value = pass;
            document.querySelector("form").submit();
        },
        user,
        pass
    );
    await secretResponse(page);
}


async function navigateTo(url) {
    let browserInstace = await getBrowserInstance();
    const page = await browserInstace.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    return page;
}

async function secretResponse(page) {
    await page.waitForSelector('.page-message.text-opensans', { visible: true, timeout: 0 });
    const answer = process.env.ANSWER;
    page.evaluate(
        async (answer) => {
            document.querySelector('[name="answer"]').value = answer;
            document.querySelector("form").submit();
        }, answer
    );
}
async function goToTimePage() { }


run()