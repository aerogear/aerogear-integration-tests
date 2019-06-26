const initClient = async (platform, done) => {
  try {
    const {
      app,
      agSync: {
        OfflineClient,
        CordovaNetworkStatus,
        CacheOperation,
        getUpdateFunction
      },
      gql,
      ToggleNetworkStatus
    } = window.aerogear;

    let networkStatus;

    if (platform === 'ios' || platform === 'browser') {
      // this is workaround for iOS as BrowserStack does not support
      // putting iOS devices offline
      networkStatus = new ToggleNetworkStatus();
    } else {
      networkStatus = new CordovaNetworkStatus();
    }
    
    window.aerogear.networkStatus = networkStatus;

    const itemsQuery = gql`
      query items {
        items {
          id
          title
        }
      }
    `;
    window.aerogear.itemsQuery = itemsQuery;

    const cacheUpdates = {
      create: getUpdateFunction('create', 'id', itemsQuery, CacheOperation.ADD)
    };
  
    const options = {
      openShiftConfig: app.config,
      networkStatus,
      mutationCacheUpdates: cacheUpdates
    };

    const offlineClient = new OfflineClient(options);

    window.aerogear.offlineStore = offlineClient.offlineStore;

    const apolloClient = await offlineClient.init();

    window.aerogear.apolloClient = apolloClient;

    if (done) {
      done();
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error.message;
    }
  }
}

const performQuery = async done => {
  try {
    const { apolloClient, itemsQuery } = window.aerogear;

    const { data } = await apolloClient.query({
      query: itemsQuery
    });

    if (done) {
      done({ data: data.items });
    } else {
      return { data: data.items };
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error.message;
    }
  }
}

const performWatchQuery = async done => {
  try {
    debugger;

    const {
      apolloClient,
      itemsQuery,
      agSync: {
        createSubscriptionOptions,
        CacheOperation
      },
      gql
    } = window.aerogear;

    const getItems = apolloClient.watchQuery({
      query: itemsQuery,
      fetchPolicy: 'cache-first',
      errorPolicy: 'none'
    });

    getItems.subscribeToMore(createSubscriptionOptions({
      subscriptionQuery: gql`
        subscription itemAdded {
          itemAdded {
            id
            title
          }
        }
      `,
      cacheUpdateQuery: itemsQuery,
      operationType: CacheOperation.ADD
    }));

    await new Promise(resolve => setTimeout(resolve, 5000));

    if (done) {
      done();
    }
  } catch (error) {
    if (done) {
      done({ error: error.message });
    } else {
      throw error;
    }
  }
};

const performOfflineMutation = async () => {
  try {
    const { apolloClient, gql, itemsQuery } = window.aerogear;

    await apolloClient.offlineMutation({
      mutation: gql`
        mutation create($title: String!) {
          create(title: $title) {
            id
            title
          }
        }
      `,
      variables: { title: 'test' },
      updateQuery: itemsQuery,
      typeName: 'Item'
    });

    throw new Error('network error offline was not thrown');
  } catch (error) {
    if (error.networkError && error.networkError.offline) {
      const offlineError = error.networkError;
      window.aerogear.offlineChangePromise = offlineError.watchOfflineChange();
      return;
    }

    throw error;
  }
};

module.exports = {
  initClient,
  performQuery,
  performWatchQuery,
  performOfflineMutation
};
