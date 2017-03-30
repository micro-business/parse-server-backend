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
  const parseServerFileKey = config.parseServerFileKey || uuid();
  const parseServerDatabaseUri = config.parseServerDatabaseURI || 'mongodb://localhost:27017/dev';

  const server = express();

  server.use(
    '/parse',
    new ParseServer({
      databaseURI: parseServerDatabaseUri,
      appId: parseServerApplicationId,
      masterKey: parseServerMasterKey,
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
          appName: 'micro-business-parse-server-backend-app',
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
    parseServerFileKey,
    parseServerDatabaseUri,
  };
}
