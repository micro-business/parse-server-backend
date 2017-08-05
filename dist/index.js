'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _parseServer = require('parse-server');

var _parseDashboard = require('parse-dashboard');

var _parseDashboard2 = _interopRequireDefault(_parseDashboard);

var _node = require('parse/node');

var _node2 = _interopRequireDefault(_node);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {
  var serverHost = config.serverHost || 'localhost';
  var serverPort = config.serverPort || 8080;
  var parseServerUrl = 'http://' + serverHost + ':' + serverPort + '/parse';
  var parseServerApplicationId = config.parseServerApplicationId || 'micro-business-parse-server-backend-app-id';
  var parseServerMasterKey = config.parseServerMasterKey || (0, _v2.default)();
  var parseServerClientKey = config.parseServerClientKey || (0, _v2.default)();
  var parseServerJavascriptKey = config.parseServerJavascriptKey || (0, _v2.default)();
  var parseServerFileKey = config.parseServerFileKey || (0, _v2.default)();
  var parseServerDatabaseUri = config.parseServerDatabaseUri || 'mongodb://localhost:27017/dev';
  var parseServerDashboardApplicationName = config.parseServerDashboardApplicationName || 'micro-business-parse-server-backend-app';
  var parseServerAllowClientClassCreation = config.parseServerAllowClientClassCreation || false;
  var parseServerLogLevel = config.parseServerLogLevel || 'info';
  var parseServerSessionLength = config.parseServerSessionLength || 31536000; // 1 Year - The default parse-server configuration value
  var parseServerEnableAnonymousUsers = config.parseServerEnableAnonymousUsers || false;
  var initializeParseSdk = config.initializeParseSdk || false;
  var parseServerConfig = (0, _immutable.Map)({
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
    enableAnonymousUsers: parseServerEnableAnonymousUsers
  }).merge(config.facebookAppIds ? (0, _immutable.Map)({ oauth: (0, _immutable.Map)({ facebook: (0, _immutable.Map)({ appIds: _immutable2.default.fromJS(config.facebookAppIds.split(',')) }) }) }) : (0, _immutable.Map)()).merge(config.androidCloudMessagingSenderId && config.androidCloudMessagingServerKey ? (0, _immutable.Map)({ push: { android: (0, _immutable.Map)({ senderId: config.androidCloudMessagingSenderId, apiKey: config.androidCloudMessagingServerKey }) } }) : (0, _immutable.Map)());
  var server = (0, _express2.default)();

  server.use('/parse', new _parseServer.ParseServer(parseServerConfig.toJS()));

  if (config.startParseDashboard) {
    var users = void 0;

    if (config.parseDashboardAuthentication) {
      var _config$parseDashboar = config.parseDashboardAuthentication.split(':'),
          _config$parseDashboar2 = _slicedToArray(_config$parseDashboar, 2),
          user = _config$parseDashboar2[0],
          pass = _config$parseDashboar2[1];

      users = [{
        user: user,
        pass: pass
      }];
    }

    server.use('/dashboard', (0, _parseDashboard2.default)({
      apps: [{
        serverURL: '/parse',
        appId: parseServerApplicationId,
        masterKey: parseServerMasterKey,
        appName: parseServerDashboardApplicationName
      }],
      users: users
    }, true));
  }

  if (initializeParseSdk) {
    _node2.default.initialize(parseServerApplicationId, parseServerJavascriptKey || 'unused', parseServerMasterKey);
    _node2.default.serverURL = parseServerUrl;
  }

  return (0, _immutable.Map)({
    server: server,
    serverHost: serverHost,
    serverPort: serverPort,
    parseServerUrl: parseServerUrl,
    parseServerDashboardApplicationName: parseServerDashboardApplicationName,
    parseServerConfig: parseServerConfig
  });
};