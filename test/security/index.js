require('chai').should();

describe('Device Security', function() {
  it('should be possible to run `rooted` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.rootEnabled);
  
      done(result);
    });

    // From BrowserStack support: "...there are certain changes made in the boot images
    // of our devices. Due to those changes, a few plugins report the device as rooted
    // when in reality it is not..."
    // Because of that BrowserStack Android device we use for testing is reported as rooted
    // by the plugin we use. So we actually check that Android device is rooted and iOS is not.
    result.passed.should.equal(process.env.MOBILE_PLATFORM !== 'ios');
  });
});
