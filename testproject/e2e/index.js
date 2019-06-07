const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

const ScratchOrg = require('../../lib/scratch-org');
const LightningSelenium = require('../../lib/lightning-selenium');

// This is the actual test
async function runTestOne(driver) {
  let firstResult = await driver.wait(until.elementLocated(By.linkText('New Flow')), 15000);
  console.log(firstResult);
}

// Setup
async function runTest() {
  let driver = await new Builder().forBrowser('chrome').build();
  let scratchOrg;

  try {
    // Generate a scratch org for testing
    scratchOrg = new ScratchOrg({
      alias: 'testorg',
      deeplink: '/lightning/setup/InteractionProcesses/home'
    });

    // Initialize the scratch org
    await scratchOrg.init({
      disableMultifactor: true
    });

    // Go to the scratch org login URL
    await driver.get(scratchOrg.instanceUrl);

    // Login to the scratch org
    await LightningSelenium.login(driver, scratchOrg.username, scratchOrg.password);

    await runTestOne(driver);

  } catch (error) {
    console.log(error);
  } finally {
    // await scratchOrg.delete();
    driver.quit();
  }
}

runTest();
