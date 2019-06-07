# Lightning Selenium

Lightning Selenium is an E2E testing library that makes writing Selenium WebDriver E2E tests with Salesforce easier.

## Features

#### Login to a Salesforce org
Login in to any Salesforce org by passing the Selenium Webdriver instance along with a valid username
and password.
```JavaScript
  await LightningSelenium.login(driver, username, password);
```

#### Logout of a Salesforce org
Coming soon...

#### Create a Scratch Org and Login
```JavaScript
  // Generate a scratch org for testing
  const scratchOrg = new ScratchOrg();

  // Initialize the scratch org
  await scratchOrg.init();

  // Go to the scratch org login URL
  await driver.get(scratchOrg.instanceUrl);

  // Login to the scratch org
  await LightningSelenium.login(driver, scratchOrg.username, scratchOrg.password);
```

#### Delete a Scratch Org
```JavaScript
  await scratchOrg.delete();
```

## Known Issues
The Salesforce platform contains a lot of iframes. In order to access elements inside an iframe the context must be switched
to the iframe: `driver.switchTo().frame(driver.findElement(By.name("iFrameTitle")));`

## Contributing
Contributions are welcome.