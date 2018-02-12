'use strict';

var webRequest = require('../lib/webRequest.js');

module.exports = function(RED) {
  function MyStromSwitchNode(config) {
    RED.nodes.createNode(this, config);

    this.device = RED.nodes.getNode(config.device);
    this.report = config.report;
    this.action = config.action;
    this.name = config.name;

    var node = this;

    node.on('input', function(msg) {
      if (typeof node.action == 'undefined' || node.action === null) {
        var errMsg = JSON.stringify({error: 'No action selected!'});
        node.error(errMsg);
        node.status({fill: 'red', shape: 'ring', text: '400'});
        node.send(errMsg);
        return;
      }

      if (!node.device) {
        var errMsg = JSON.stringify({error: 'No device config found! You have to select or create one.'});
        node.error(errMsg);
        node.status({fill: 'red', shape: 'ring', text: '400'});
        node.send(errMsg);
      } else {
        var requestPath;
        switch (node.action) {
          case 'toggle':
            requestPath = '/toggle';
            break;
          case 'on':
            requestPath = '/relay?state=1';
            break;
          case 'off':
            requestPath = '/relay?state=0';
            break;
          default:
            requestPath = '/toggle';
            break;
        }

        var options = {
          hostname: node.device.address,
          port: 80,
          path: requestPath,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        };

        webRequest(false, 'txt', options, payload, function(res) {
          node.status({});
          if (res && res.statusCode / 100 !== 2) {
            node.error(res);
            node.status({fill: 'red', shape: 'ring', text: res.statusCode});
          }
          node.send(res);
        });
      }
    });

    node.on('close', function() {
      node.status({});
    });
  }

  RED.nodes.registerType('myStrom Switch', MyStromSwitchNode);
};
