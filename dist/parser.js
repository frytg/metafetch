"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio_1 = __importDefault(require("cheerio"));
var URI = require("uri-js");
var franc_1 = __importDefault(require("franc"));
var langs_1 = __importDefault(require("langs"));
function default_1(url, options, body, header) {
    header = header || {};
    var uri = URI.parse(url);
    var $;
    try {
        $ = cheerio_1.default.load(body);
    }
    catch (e) {
        return "Invalid HTML";
    }
    $('script').remove();
    $('style').remove();
    $('applet').remove();
    $('embed').remove();
    $('object').remove();
    $('noscript').remove();
    var response = {};
    var title;
    if (options.title) {
        title = $('title').text();
    }
    if (options.charset) {
        response.charset = $("meta[charset]").attr("charset");
    }
    if (options.images) {
        var imagehash = {};
        response.images = $('img').map(function () {
            var src = $(this).attr('src');
            if (src) {
                return URI.resolve(url, src);
            }
            else {
                return "";
            }
        }).filter(function (e, f) {
            return (f.match(/\.(jpeg|jpg|gif|png|JPEG|JPG|GIF|PNG)$/) !== null);
        }).filter(function (i, item) {
            return imagehash.hasOwnProperty(item) ? false : (imagehash[item] = true);
        }).get();
    }
    if (options.links) {
        var linkhash = {};
        response.links = $('a').map(function () {
            var href = $(this).attr('href');
            if (href && href.trim().length && href[0] !== "#") {
                return URI.resolve(url, href);
            }
            else {
                return 0;
            }
        }).filter(function (i, item) {
            if (item === 0) {
                return false;
            }
            return linkhash.hasOwnProperty(item) ? false : (linkhash[item] = true);
        }).get();
    }
    if (options.metaLinks) {
        var link = $('link'), metaLinks = {};
        Object.keys(link).forEach(function (key) {
            var attribs = link[key].attribs;
            if (attribs && attribs.rel) {
                if (!metaLinks[attribs.rel.toLowerCase()]) {
                    metaLinks[attribs.rel.toLowerCase()] = [];
                }
                metaLinks[attribs.rel.toLowerCase()].push(attribs.href);
            }
        });
        response.metaLinks = metaLinks;
    }
    var meta = $('meta'), canonicalURL = $("link[rel=canonical]").attr('href'), ampURL = $("link[rel=amphtml]").attr('href'), metaData = {};
    if (ampURL) {
        ampURL = URI.resolve(url, ampURL);
    }
    Object.keys(meta).forEach(function (key) {
        var attribs = meta[key].attribs;
        if (attribs) {
            if (attribs.property) {
                metaData[attribs.property.toLowerCase()] = attribs.content;
            }
            if (attribs.name) {
                metaData[attribs.name.toLowerCase()] = attribs.content;
            }
            if (attribs['http-equiv']) {
                header[attribs['http-equiv']] = attribs.content;
            }
        }
    });
    if (options.language) {
        response.language = $("html").attr("lang") || $("html").attr("xml:lang") || header["Content-Language"] || header["content-language"];
        if (!!!response.language) {
            response.language = langs_1.default.where("2", franc_1.default($('body').text().replace(/\n\s*\n/g, '\n')));
            response.language = response.language && response.language[1];
        }
        else {
            response.language = response.language.split("-")[0];
        }
    }
    response.uri = uri;
    if (options.title) {
        response.title = metaData['og:title'] || title;
    }
    if (options.description) {
        response.description = metaData['og:description'] || metaData.description;
    }
    if (options.type) {
        response.type = metaData['og:type'];
    }
    if (options.url) {
        response.url = URI.resolve(url, canonicalURL || metaData['og:url'] || url);
        response.originalURL = url;
        response.ampURL = ampURL || null;
    }
    if (options.siteName) {
        response.siteName = metaData['og:site_name'];
    }
    if (options.image) {
        response.image = metaData['og:image'];
    }
    if (options.meta) {
        response.meta = metaData;
    }
    if (options.headers) {
        response.headers = header;
    }
    return response;
}
exports.default = default_1;
;
//# sourceMappingURL=parser.js.map