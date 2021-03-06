// @flow

import cuid from 'cuid';
import Immutable, { Map } from 'immutable';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import Parse from 'parse/node'; // eslint-disable-line import/no-extraneous-dependencies

export default config => {
  const serverHost = config.serverHost || 'localhost';
  const serverPort = config.serverPort || 8080;
  const parseServerUrl = `http://${serverHost}:${serverPort}/parse`;
  const parseServerApplicationId = config.parseServerApplicationId || 'micro-business-parse-server-backend-app-id';
  const parseServerMasterKey = config.parseServerMasterKey || cuid();
  const parseServerClientKey = config.parseServerClientKey || cuid();
  const parseServerJavascriptKey = config.parseServerJavascriptKey || cuid();
  const parseServerFileKey = config.parseServerFileKey || cuid();
  const parseServerDatabaseUri = config.parseServerDatabaseUri || 'mongodb://localhost:27017/dev';
  const parseServerDashboardApplicationName = config.parseServerDashboardApplicationName || 'micro-business-parse-server-backend-app';
  const parseServerDashboardAllowInsecureHTTP = config.parseServerDashboardAllowInsecureHTTP || false;
  const parseServerAllowClientClassCreation = config.parseServerAllowClientClassCreation || false;
  const parseServerLogLevel = config.parseServerLogLevel || 'info';
  const parseServerSessionLength = config.parseServerSessionLength || 31536000; // 1 Year - The default parse-server configuration value
  const parseServerEnableAnonymousUsers = config.parseServerEnableAnonymousUsers || false;
  const initializeParseSdk = config.initializeParseSdk || false;
  const parseServerConfig = Map({
    databaseURI: parseServerDatabaseUri,
    appId: parseServerApplicationId,
    masterKey: parseServerMasterKey,
    clientKey: parseServerClientKey,
    javascriptKey: parseServerJavascriptKey,
    fileKey: parseServerFileKey,
    serverURL: parseServerUrl,
    cloud: config.parseServerCloudFilePath,
    allowClientClassCreation: parseServerAllowClientClassCreation,
    logLevel: parseServerLogLevel,
    sessionLength: parseServerSessionLength,
    enableAnonymousUsers: parseServerEnableAnonymousUsers,
  })
    .merge(config.facebookAppIds ? Map({ oauth: Map({ facebook: Map({ appIds: Immutable.fromJS(config.facebookAppIds.split(',')) }) }) }) : Map())
    .merge(
      config.androidCloudMessagingSenderId && config.androidCloudMessagingServerKey
        ? Map({ push: { android: { senderId: config.androidCloudMessagingSenderId, apiKey: config.androidCloudMessagingServerKey } } })
        : Map(),
    );

  const parseServer = new ParseServer(parseServerConfig.toJS());
  let parseDashboard;

  if (config.startParseDashboard) {
    let users;

    if (config.parseDashboardAuthentication) {
      const [user, pass] = config.parseDashboardAuthentication.split(':');

      users = [{ user, pass }];
    }

    parseDashboard = ParseDashboard(
      {
        apps: [
          {
            serverURL: '/parse',
            appId: parseServerApplicationId,
            masterKey: parseServerMasterKey,
            appName: parseServerDashboardApplicationName,
          },
        ],
        users,
      },
      {
        allowInsecureHTTP: parseServerDashboardAllowInsecureHTTP,
      },
    );
  }

  if (initializeParseSdk) {
    Parse.initialize(parseServerApplicationId, parseServerJavascriptKey || 'unused', parseServerMasterKey);
    Parse.serverURL = parseServerUrl;
  }

  return Map({
    parseServer,
    parseDashboard,
    config: Map({
      serverHost,
      serverPort,
      parseServerUrl,
      parseServerDashboardApplicationName,
      parseServerDashboardAllowInsecureHTTP,
      parseServerConfig,
    }),
  });
};
