const { By, until } = require('selenium-webdriver');

/**
 * Methods for navigating around lightning experience.
 * Including login & logout
 */
class LightningSelenium {
  static async login(driver, username, password) {
    const usernameInput = await driver.findElement(By.id('username'));
    const passwordInput = await driver.findElement(By.id('password'));

    await usernameInput.sendKeys(username);
    await passwordInput.sendKeys(password);

    await driver.findElement(By.id('Login')).click();

    // If finds text "Register Your Mobile Phone"
    try {
      const onRegisterPage = await LightningSelenium._checkIfOnRegisterPage(driver);

      // then find and click "Remind Me Later"
      if (onRegisterPage) {
        await LightningSelenium._skipRegisterPage(driver);
      } else {
        throw new Error('Cannot find \"Remind Me Later\" link');
      }
    } catch (e) {
      console.log('Mobile phone registration page not shown.');
    }
  }

  /****************************************************************************************************************
   * PRIVATE HELPERS
   */
  static async _checkIfOnRegisterPage(driver) {
    const RegisterPageTitle = await driver.wait(until.elementLocated(By.xpath("//*[text()[contains(.,'Register Your Mobile Phone')]]")), 10000);
    return RegisterPageTitle;
  }

  static async _skipRegisterPage(driver) {
    const skipLink = await driver.findElement(By.xpath("//*[text()[contains(.,'Remind Me Later')]]"));
    await skipLink.click();
  }
}

module.exports = LightningSelenium;