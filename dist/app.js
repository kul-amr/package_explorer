"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cache_service_1 = __importDefault(require("./cache.service"));
const parser_service_1 = __importDefault(require("./parser.service"));
const baseURL = "http://localhost:8080/";
const parserService = new parser_service_1.default();
const app = express_1.default();
app.set("port", process.env.PORT || 8080);
const ttl = 60 * 60 * 1; //Setting to an hour.
const cache = new cache_service_1.default(ttl);
const filePath = '/var/lib/dpkg/status';
app.get("/api/packages", (req, res) => {
    let page;
    if (req.query) {
        page = parseInt(req.query.page);
    }
    page = page || 0;
    let pkgList = cache.listAllKeys(page, () => { return parserService.parsefile(filePath); });
    let packages = pkgList.map((pkg) => {
        return { "packageName": pkg, "Links": [{ "rel": "self", "href": baseURL + "api/packages/" + pkg }] };
    });
    let prevPageURL, firstPageUrl = baseURL + "api/packages";
    let nextPageURL = baseURL + "api/packages?page=" + (page + 1);
    if (page > 0) {
        prevPageURL = baseURL + "api/packages?page=" + (page - 1);
    }
    res.status(200).send({
        "packages": packages,
        "Links": {
            "First": firstPageUrl,
            "Next": nextPageURL,
            "Prev": prevPageURL
        }
    });
});
app.get("/api/packages/:packagename", (req, res) => {
    let pkgName = req.params.packagename;
    let pkgDetails = cache.get(pkgName);
    let statusCode;
    if (!pkgDetails) {
        pkgDetails = { Message: "No data found." };
        statusCode = 404;
    }
    else {
        let firstPageUrl = baseURL + "api/packages";
        let links = { "Packages": firstPageUrl };
        pkgDetails["Links"] = links;
        statusCode = 200;
    }
    res.status(statusCode).send(pkgDetails);
});
app.delete("/clearcache", (req, res) => {
    cache.flush();
    res.send({ Message: "Cache cleared." });
});
exports.default = app;
//# sourceMappingURL=app.js.map