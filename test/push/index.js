require('chai').should();

const mobileServices = require('../../fixtures/mobile-services');

describe('Auth', function () {
  this.timeout(0);

  it('should register push', async function () {

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

    if (error !== null) {
      throw new Error(error);
    }

    // start listening for notifications
    notification = client.executeAsync((done) => {
      const push = window.push;

      push.on("notification", (notification) => {
        done(notification.message);
      });
    });

    // todo: send a notification

    // wait for the notification
    console.log(await notification);

  });
});
