const expect = require('chai').expect;
const axios = require('axios');
const mobileServices = require('../../fixtures/mobile-services');
const sender = require("unifiedpush-node-sender");

describe('Auth', function () {
  this.timeout(0);

  const upsUrl = process.env.UPS_URL;

  let pushApplicationID;
  let masterSecret;

  before("create ups application", async () => {
    const serverKey = process.env.FIREBASE_SERVER_KEY;
    const senderId = process.env.FIREBASE_SENDER_ID;

    const config = mobileServices.services.find(service => service.name === 'ups');

    // set sender id in config
    config.config.android.senderId = senderId;

    // create test application
    const application = await axios({
      method: 'post',
      url: `${upsUrl}/rest/applications`,
      data: {
        name: "test",
      },
    });
    pushApplicationID = application.data.pushApplicationID;
    masterSecret = application.data.masterSecret;

    // create android variant
    const variant = await axios({
      method: 'post',
      url: `${upsUrl}/rest/applications/${pushApplicationID}/android`,
      data: {
        name: "android",
        googleKey: serverKey,
        projectNumber: senderId,
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
      url: `${upsUrl}/rest/applications/${pushApplicationID}`
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
      url: upsUrl,
      applicationId: pushApplicationID,
      masterSecret: masterSecret,
    }).then(client => {
      client.sender.send({ alert: "test" }, { criteria: { alias: ["alias"] } });
    })

    // wait for the notification
    expect(await message).to.equal("test")
  });
});
