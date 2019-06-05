const expect = require('chai').expect;
const axios = require('axios');
const mobileServices = require('../../fixtures/mobile-services');
const sender = require("unifiedpush-node-sender");

describe('Auth', function () {
  this.timeout(0);

  let pushApplicationID;
  let masterSecret;

  before("create ups application", async () => {
    const serverKey = process.env.FIREBASE_SERVER_KEY;
    const senderId = process.env.FIREBASE_SENDER_ID;

    const config = mobileServices.services.find(service => service.name === 'ups');

    // create test application
    const application = await axios({
      method: 'post',
      url: `http://localhost:8089/rest/applications`,
      data: {
        name: "test",
      },
    });
    pushApplicationID = application.data.pushApplicationID;
    masterSecret = application.data.masterSecret;

    // create android variant
    const variant = await axios({
      method: 'post',
      url: `http://localhost:8089/rest/applications/${pushApplicationID}/android`,
      data: {
        name: "android",
        googleKey: serverKey,
        // googleKey: "AAAATRdW_Xs:APA91bE0VC90ktrkUjRg2P8PhlzIlEtPeK1XYGSYYwMB0LbzZaTzUHaKlTQpDpzWTJM3eQdx6n1466ZwXKv19Syf5LENvP03vsMu9424TO9XlwZ9xsWCtDfIUqShS8Cl8iCg4u5iRVNC",
        projectNumber: senderId,
        // projectNumber: "331104058747",
      },
    });

    // set variant and secret in config
    config.config.android.variantId = variant.data.variantID;
    config.config.android.variantSecret = variant.data.secret;
  })

  after("delete ups application", async () => {

    // delete test application
    await axios({
      method: "delete",
      url: `http://localhost:8089/rest/applications/${pushApplicationID}`
    });
  })

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

    // send test notification
    sender({
      url: "http://localhost:8089",
      applicationId: pushApplicationID,
      masterSecret: masterSecret,
    }).then(client => {
      client.sender.send({ alert: "test" }, { criteria: { alias: ["alias"] } });
    })

    // wait for the notification
    expect(await message).to.equal("test")
  });
});
