"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = __importDefault(require("lodash"));
var charset = require('superagent-charset');
var superagent_1 = __importDefault(require("superagent"));
charset(superagent_1.default);
var parser_1 = __importDefault(require("./parser"));
var Metafetch = (function () {
    function Metafetch() {
        this.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0";
    }
    Metafetch.prototype.setUserAgent = function (agent) {
        if (typeof agent == "string") {
            this.userAgent = agent;
        }
        else {
            throw "METAFETCH: Invalid User agent supplied";
        }
    };
    Metafetch.prototype.fetch = function (url, options, callback) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            url = url.split("#")[0];
            var http_options = {
                timeout: 20000,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'User-Agent': ""
                },
                followRedirects: false
            };
            var _options = {
                title: true,
                description: true,
                type: true,
                url: true,
                siteName: true,
                charset: true,
                image: true,
                meta: true,
                metaLinks: true,
                images: true,
                links: true,
                headers: true,
                language: true
            };
            var userAgent = _this.userAgent;
            if (typeof options === 'function') {
                callback = options;
            }
            else if (typeof options === 'object') {
                lodash_1.default.merge(http_options, options.http || {});
                lodash_1.default.merge(_options, options.flags || {});
                userAgent = options.userAgent || userAgent;
            }
            var finish = function (err, res) {
                if (typeof callback !== "undefined") {
                    return callback(err, res);
                }
                else if (err) {
                    return reject(err);
                }
                return resolve(res);
            };
            if (typeof url != "string" || url === "") {
                return finish("Invalid URL", (url || ""));
            }
            http_options.headers['User-Agent'] = userAgent;
            var redirectCount = 0;
            if (url.slice(-4) === ".pdf") {
                var pdf = function () {
                    superagent_1.default.get(url).set(http_options.headers).timeout(http_options.timeout).end(function (err, response) {
                        if (err && err.timeout) {
                            return finish("Timeout");
                        }
                        if (!!!response) {
                            return finish(err);
                        }
                        if (response.statusType === 2) {
                            var meta = parser_1.default(url, _options, "Metafetch does not support parsing PDF Content.");
                            return finish(null, meta);
                        }
                        else {
                            return finish(err.status);
                        }
                    });
                };
                pdf();
            }
            else {
                superagent_1.default.get(url).charset().set(http_options.headers).timeout(http_options.timeout).end(function (err, response) {
                    if (err && err.timeout) {
                        return finish("Timeout");
                    }
                    if (!!!response) {
                        return finish(err);
                    }
                    if (response.statusType === 2) {
                        var meta = parser_1.default(response.request.url, _options, response.text, response.header);
                        if (typeof meta == "string") {
                            return finish(meta);
                        }
                        return finish(null, meta);
                    }
                    else {
                        return finish(err.status);
                    }
                });
            }
        });
    };
    return Metafetch;
}());
var Client = new Metafetch();
module.exports = Client;
//# sourceMappingURL=index.js.map