require('chai').should();

describe('Device Security', function() {
  it('should be possible to run `rooted` check', async function() {
    const result = await client.executeAsync(async done => {
      const { SecurityService, DeviceCheckType } = window.aerogear.agSecurity;
      const securityService = new SecurityService();
  
      const result = await securityService.check(DeviceCheckType.rootEnabled);
  
      done(result);
    });

    result.passed.should.equal(process.env.MOBILE_PLATFORM !== 'ios');
  });
});
