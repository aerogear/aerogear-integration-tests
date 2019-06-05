const expect = require('chai').expect

const mobileServices = require('../../fixtures/mobile-services');

describe('Auth', function () {
  this.timeout(0);

  it('should recive the test notification', async function () {

    // register the app to the UPS server
    const error = await client.executeAsync((config, done) => {
      const { PushRegistration, init } = window.aerogear;

      document.addEventListener("deviceready", () => {

        const app = init(config);

        const push = window.PushNotification.init({
          android: {},
          ios: {},
        });

        push.on('registration', data => {

          const push = new PushRegistration(app.config);

          push.register(data.registrationId, "alias")
            .then(() => {
              done(null);
            }).catch(e => {
              done(e);
            });
        });

        push.on("error", e => {
          done(e);
        });

        window.push = push;

      }, false);
    }, mobileServices);

    expect(error).to.be.null;

    // start listening for notifications
    const message = client.executeAsync((done) => {
      const push = window.push;

      push.on("notification", (notification) => {
        done(notification.message);
      });
    });


    // // todo: send a notification

    // wait for the notification
    expect(await message).to.equal("test")

  });
});
