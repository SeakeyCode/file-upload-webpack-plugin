"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var path = require('path');

var Colorette = require('colorette');

var _require = require('node-ssh'),
    NodeSSH = _require.NodeSSH;

var FileUploadWebpackPlugin = /*#__PURE__*/function () {
  function FileUploadWebpackPlugin(options) {
    _classCallCheck(this, FileUploadWebpackPlugin);

    this.ssh = new NodeSSH();
    this.color = Colorette;
    this.options = options;
  }

  _createClass(FileUploadWebpackPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.afterEmit.tap('FileUploadWebpackPlugin', function (compilation) {
        var outputPath = compilation.outputOptions.path;
        var port = _this.options.port || '22';
        var sshCommand = "ssh ".concat(_this.options.username, "@").concat(_this.options.host, " -p ").concat(port); // ssh connect

        _this.ssh.connect({
          host: _this.options.host,
          port: port,
          username: _this.options.username,
          privateKey: _this.options.privateKey
        }).then(function () {
          console.log("--> ".concat(_this.color.green(sshCommand), " login success"));
          console.log("--> Uploading file..."); // ssh putDirectory

          _this.ssh.putDirectory(outputPath, _this.options.remotePath, {
            recursive: true,
            concurrency: _this.options.concurrency || 10,
            tick: function tick(localPath, remotePath, error) {
              if (error) {
                console.log("".concat(_this.color.red('X'), " uploaded file ").concat(_this.color.red(path.basename(localPath))));
              } else {
                console.log("".concat(_this.color.green('✔'), " uploaded file ").concat(_this.color.green(path.basename(localPath))));
              }
            }
          }).then(function (status) {
            console.log('File uploaded', status ? _this.color.green('successfully') : _this.color.red('failed'));

            _this.ssh.dispose();
          })["catch"](function (err) {
            console.log("--> ".concat(sshCommand, " put directory fail:"), err);

            _this.ssh.dispose();
          });
        })["catch"](function (err) {
          console.log("--> ".concat(sshCommand, " login fail:"), err);

          _this.ssh.dispose();
        });
      });
    }
  }]);

  return FileUploadWebpackPlugin;
}();

module.exports = FileUploadWebpackPlugin;