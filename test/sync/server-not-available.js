require('chai').should();

const {
  initClient,
  performQuery,
  performWatchQuery,
  performOfflineMutation
} = require('../../util/sync-client');
const SyncServer = require('../../util/sync-server');
const SyncBrowser = require('../../util/sync-browser');

describe('Data Sync - Server not available', function() {
  this.timeout(0);

  let syncServer;
  let syncBrowser;

  let watchPromise;

  before('start browser client', async function() {
    syncBrowser = new SyncBrowser();
    await syncBrowser.start();
  });

  after('close browser client', async function() {
    await syncBrowser.stop();
  });

  it('should run the voyager server', async function() {
    syncServer = new SyncServer();
    await syncServer.start();
  });

  it('should initialize mobile client', async function() {
    await client.executeAsync(initClient, process.env.MOBILE_PLATFORM);
  });

  it('should initialize browser client', async function() {
    await syncBrowser.page.evaluate(initClient, 'browser');
  });

  it('should perform query in mobile', async function() {
    await client.executeAsync(performQuery);
    watchPromise = client.executeAsync(performWatchQuery);
  });

  it('should perform mutation in browser', async function() {
    syncBrowser.page.evaluate(() => {
      const { networkStatus } = window.aerogear;
      networkStatus.setOnline(false);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    await syncBrowser.page.evaluate(performOfflineMutation);
  });

  it('should shut down the server', async function() {
    await syncServer.stop();
  });

  it('should go online in browser', async function() {
    syncBrowser.page.evaluate(() => {
      const { networkStatus } = window.aerogear;
      networkStatus.setOnline(true);
    });
  });

  it('should spin up the server again', async function() {
    await syncServer.start();
  });

  it('should restart app in browser', async function() {
    await syncBrowser.reload();
  });

  it('should see the change on mobile', async function() {
    await watchPromise;
    const result = await client.executeAsync(performQuery);
    result.data.should.deep.equal([{
      __typename: 'Item',
      id: '0',
      title: 'test'
    }]);
  });

  it('should stop voyager server', async function() {
    await syncServer.stop();
  });
});
