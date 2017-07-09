'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _immutable = require('immutable');

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
  var initializeParseSdk = config.initializeParseSdk || false;

  var server = (0, _express2.default)();

  server.use('/parse', new _parseServer.ParseServer({
    databaseURI: parseServerDatabaseUri,
    appId: parseServerApplicationId,
    masterKey: parseServerMasterKey,
    clientKey: parseServerClientKey,
    javascriptKey: parseServerJavascriptKey,
    fileKey: parseServerFileKey,
    serverURL: parseServerUrl,
    cloud: config.parseServerCloudFilePath
  }));

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
    parseServerApplicationId: parseServerApplicationId,
    parseServerMasterKey: parseServerMasterKey,
    parseServerClientKey: parseServerClientKey,
    parseServerJavascriptKey: parseServerJavascriptKey,
    parseServerFileKey: parseServerFileKey,
    parseServerDatabaseUri: parseServerDatabaseUri,
    parseServerDashboardApplicationName: parseServerDashboardApplicationName
  });
};