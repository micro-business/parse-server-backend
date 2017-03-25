import express from 'express';
import {
    ParseServer,
} from 'parse-server';
import ParseDashboard from 'parse-dashboard';

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || 'localhost';
const APP_ID = process.env.APP_ID || 'my-test-app';
const MASTER_KEY = process.env.MASTER_KEY || '70c6093dba5a7e55968a1c7ad3dd3e5a74ef5cac';
const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const DASHBOARD_AUTH = process.env.DASHBOARD_AUTH;
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://localhost:27017/dev';

console.log('Connecting to database: ', DATABASE_URI);

const server = express();

server.set('port', SERVER_PORT);

server.use(
    '/parse',
    new ParseServer({
      databaseURI: DATABASE_URI,
      appId: APP_ID,
      masterKey: MASTER_KEY,
      fileKey: 'f33fc1a9-9ba9-4589-95ca-9976c0d52cd5',
      serverURL: `http://${SERVER_HOST}:${SERVER_PORT}/parse`,
    }),
);


let users;
if (DASHBOARD_AUTH) {
  const [user, pass] = DASHBOARD_AUTH.split(':');
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
        appId: APP_ID,
        masterKey: MASTER_KEY,
        appName: 'my-test-app',
      }],
      users,
    }, true),
);


console.log(users || 'No username password provided to access database!!!');

server.get('/', (request, response) => {
  response.send('I am still there, running and alive and now in ES6!!!');
});

server.listen(server.get('port'), () => {
  console.log('My Node app is running on port', server.get('port'));
});
