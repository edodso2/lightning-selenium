const fs = require('fs');
const { exec } = require('child_process');
const Utils = require('./utils');

const defaultOptions = {
  deeplink: '',
  alias: 'e2eTestOrg'
}

/**
 * Manages all SFDX scratch org related commands. Such as creation,
 * deletion, listing, etc. 
 */
class ScratchOrg {
  constructor(options = defaultOptions) {
    this.username = '';
    this.password = '';
    this.instanceUrl = '';
    this.deepLink = options.deeplink;
    this.alias = options.alias;
  }

  async init(options) {
    const createCommand = `sfdx force:org:create -f config/project-scratch-def.json -a ${this.alias}`;
    const generatePasswordCommand = `sfdx force:user:password:generate -u ${this.alias}`;
    const detailsCommand = `sfdx force:user:display -u ${this.alias}`;
    const pushCommand = `sfdx force:source:push -u ${this.alias}`;

    // Only create new org if alias for existing one was not provided
    if (this.alias === defaultOptions.alias) {
      console.log('Creating Scratch Org');

      // Create a new scratch org
      try {
        await this._runCommand(createCommand);
      } catch (error) {
        throw new Error('Unable to create new org: ' + error.message);
      }

      console.log('Created Scratch Org');
    }

    console.log('Generating Scratch Org password');

    // Generate scratch org password
    try {
      await this._runCommand(generatePasswordCommand);
    } catch (error) {
      throw new Error('Unable to generate password for new org: ' + error.message);
    }

    console.log('Generated Scratch Org password');

    console.log('Setting Scratch Org details');

    // Get & Set org details
    try {
      const orgDetails = await this._runCommand(detailsCommand);

      const orgDetailsObj = this._getOrgDetails(orgDetails);

      this.instanceUrl = orgDetailsObj.instanceUrl + this.deepLink;
      this.username = orgDetailsObj.username;
      this.password = orgDetailsObj.password;
    } catch (error) {
      throw new Error('Unable to set org details: ' + error.message);
    }

    // creates a security settings file for the scratch org that sets ip ranges
    // to accept the current running users ip which effectivly turns of
    // multifactor in the org
    if (options.disableMultifactor) {
      try {
        await this._writeSecuritySettingsFile();
      } catch(error) {
        throw new Error('Unable to create security settings file: ' + error);
      }
    }

    // Push source to scratch org
    try {
      await this._runCommand(pushCommand);

      // remove the file from the users source code
      if (options.disableMultifactor) {
        this._deleteSecuritySettingsFile();
      }
    } catch (error) {
      throw new Error ('Could not push source to org: ' + error);
    }

    console.log('Scratch Org initialization successful!');
  }

  async delete() {
    const deleteCommand = `sfdx force:org:delete -u ${this.alias} -p`;

    console.log('Deleting Scratch Org');

    try {
      await this._runCommand(deleteCommand);
    } catch (error) {
      throw new Error('Unable to delete org: ' + error.message);
    }

    console.log('Scratch Org deleted');
  }

  // Private Methods
  _runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout);
      });
    });
  }

  _getOrgDetails(details) {
    const getInstanceUrl = RegExp(/Instance Url\s*(.*)/);
    const instanceUrlResult = getInstanceUrl.exec(details);

    const getUsername = RegExp(/Username\s*(.*)/);
    const usernameResult = getUsername.exec(details);

    const getPassword = RegExp(/Password\s*(.*)/);
    const passwordResult = getPassword.exec(details);

    if (!instanceUrlResult) {
      throw new Error('Failed to extract login url from SFDX command');
    }

    if (!usernameResult) {
      throw new Error('Failed to extract username from SFDX command');
    }

    if (!passwordResult) {
      throw new Error('Failed to extract password from SFDX command');
    }

    return {
      instanceUrl: instanceUrlResult[1],
      username: usernameResult[1],
      password: passwordResult[1]
    }
  }

  async _writeSecuritySettingsFile() {
    const securitySettings = await Utils.getSecuritySettings();
    fs.mkdirSync('force-app/lightningselenium');
    fs.mkdirSync('force-app/lightningselenium/settings');
    fs.writeFileSync('force-app/lightningselenium/settings/Security.settings-meta.xml', securitySettings);
  }

  _deleteSecuritySettingsFile() {
    fs.unlinkSync('force-app/lightningselenium/settings/Security.settings-meta.xml');
    fs.rmdirSync('force-app/lightningselenium/settings');
    fs.rmdirSync('force-app/lightningselenium');
  }

}

module.exports = ScratchOrg;