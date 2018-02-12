'use strict';

var webRequest = require('../lib/webRequest.js');

module.exports = function(RED) {
  function MyStromSwitchConfig(config) {
    RED.nodes.createNode(this, config);

    this.type = config.type;
    this.address = config.address;
    this.mac = config.mac;
    this.name = config.name || ('Switch ' + config.address);
  }

  RED.httpAdmin.get('/node-red/switch-report', function(req, res) {
    var device;
    if (req.query && req.query.device) {
      device = RED.nodes.getNode(req.query.device);
    }

    if (!device) {
      var resObjErr = {};
      resObjErr.error = 'The device config with id "' + req.query.device + '" was not found! Please deploy the flow at least once.';
      resObjErr.statusCode = 500;
      res.send(JSON.stringify(resObjErr));
    } else {
      var payload = null;
      var options = {
        hostname: device.address,
        port: 80,
        path: '/report',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };

      webRequest(false, 'txt', options, payload, function(resObj) {
        res.setHeader('Content-Type', 'application/json');
        if (resObj && resObj.statusCode / 100 !== 2) {
          res.send(JSON.stringify(resObj));
        } else {
          res.send(resObj.payload);
        }
      });
    }
  });

  RED.nodes.registerType('mystrom-switch-config', MyStromSwitchConfig);
};
