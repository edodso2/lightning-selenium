const publicIp = require('public-ip');

class Utils {
  static async getPublicIp() {
    return await publicIp.v4();
  }

  // Returns security settings with the
  // accepted ip ranges set to running users IP
  static async getSecuritySettings() {
    const ip = await Utils.getPublicIp();

    return `
      <?xml version="1.0" encoding="UTF-8" ?>
      <SecuritySettings xmlns="http://soap.sforce.com/2006/04/metadata">
        <networkAccess>
          <ipRanges>
            <end>${ip}</end>
            <start>${ip}</start>
          </ipRanges>
        </networkAccess>
      </SecuritySettings>
    `.trim();
  }
}

module.exports = Utils;