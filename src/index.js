import express from 'express';
import {
  ParseServer,
} from 'parse-server';
import ParseDashboard from 'parse-dashboard';
import uuid from 'uuid/v4';

export default function (config) {
  const serverHost = config.serverHost || 'localhost';
  const serverPort = config.serverPort || 8080;
  const parseServerUrl = `http://${serverHost}:${serverPort}/parse`;
  const parseServerApplicationId = config.parseServerApplicationId || 'micro-business-parse-server-backend-app-id';
  const parseServerMasterKey = config.parseServerMasterKey || uuid();
  const parseServerClientKey = config.parseServerClientKey || uuid();
  const parseServerFileKey = config.parseServerFileKey || uuid();
  const parseServerDatabaseUri = config.parseServerDatabaseUri || 'mongodb://localhost:27017/dev';
  const parseServerDashboardApplicationName = config.parseServerDashboardApplicationName || 'micro-business-parse-server-backend-app';

  const server = express();

  server.use(
    '/parse',
    new ParseServer({
      databaseURI: parseServerDatabaseUri,
      appId: parseServerApplicationId,
      masterKey: parseServerMasterKey,
      clientKey: parseServerClientKey,
      fileKey: parseServerFileKey,
      serverURL: parseServerUrl,
    }),
  );

  if (config.startParseDashboard) {
    let users;

    if (config.parseDashboardAuthentication) {
      const [user, pass] = config.parseDashboardAuthentication.split(':');

      users = [{
        user,
        pass,
      }];
    }

    server.use(
      '/dashboard',
      ParseDashboard({
        apps: [{
          serverURL: '/parse',
          appId: parseServerApplicationId,
          masterKey: parseServerMasterKey,
          appName: parseServerDashboardApplicationName,
        }],
        users,
      }, true),
    );
  }

  return {
    server,
    serverHost,
    serverPort,
    parseServerUrl,
    parseServerApplicationId,
    parseServerMasterKey,
    parseServerClientKey,
    parseServerFileKey,
    parseServerDatabaseUri,
    parseServerDashboardApplicationName,
  };
}
