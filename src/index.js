// @flow

import { Map } from 'immutable';
import express from 'express';
import { ParseServer } from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import Parse from 'parse/node';
import uuid from 'uuid/v4';

export default (config) => {
  const serverHost = config.serverHost || 'localhost';
  const serverPort = config.serverPort || 8080;
  const parseServerUrl = `http://${serverHost}:${serverPort}/parse`;
  const parseServerApplicationId = config.parseServerApplicationId || 'micro-business-parse-server-backend-app-id';
  const parseServerMasterKey = config.parseServerMasterKey || uuid();
  const parseServerClientKey = config.parseServerClientKey || uuid();
  const parseServerJavascriptKey = config.parseServerJavascriptKey || uuid();
  const parseServerFileKey = config.parseServerFileKey || uuid();
  const parseServerDatabaseUri = config.parseServerDatabaseUri || 'mongodb://localhost:27017/dev';
  const parseServerDashboardApplicationName = config.parseServerDashboardApplicationName || 'micro-business-parse-server-backend-app';
  const parseServerAllowClientClassCreation = config.parseServerAllowClientClassCreation || false;
  const parseServerLogLevel = config.parseServerLogLevel || 'info';
  const parseServerSessionLength = config.parseServerSessionLength || 31536000; // 1 Year - The default parse-server configuration value
  const parseServerEnableAnonymousUsers = config.parseServerEnableAnonymousUsers || false;
  const initializeParseSdk = config.initializeParseSdk || false;

  const server = express();

  server.use(
    '/parse',
    new ParseServer({
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
    }),
  );

  if (config.startParseDashboard) {
    let users;

    if (config.parseDashboardAuthentication) {
      const [user, pass] = config.parseDashboardAuthentication.split(':');

      users = [
        {
          user,
          pass,
        },
      ];
    }

    server.use(
      '/dashboard',
      ParseDashboard(
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
        true,
      ),
    );
  }

  if (initializeParseSdk) {
    Parse.initialize(parseServerApplicationId, parseServerJavascriptKey || 'unused', parseServerMasterKey);
    Parse.serverURL = parseServerUrl;
  }

  return Map({
    server,
    serverHost,
    serverPort,
    parseServerUrl,
    parseServerApplicationId,
    parseServerMasterKey,
    parseServerClientKey,
    parseServerJavascriptKey,
    parseServerFileKey,
    parseServerDatabaseUri,
    parseServerDashboardApplicationName,
  });
};
