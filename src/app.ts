import express from "express";
import { Request, Response } from "express";

import cacheService from "./cache.service";
import ParserService from "./parser.service";

const baseURL = "http://localhost:8080/";
const parserService: ParserService = new ParserService();

const app = express();
app.set("port", process.env.PORT || 8080);

const ttl = 60 * 60 * 1;        //Setting to an hour.
const cache = new cacheService(ttl);
const filePath = '/var/lib/dpkg/status';

app.get("/api/packages", (req: Request, res: Response) => {

    let page;

    if (req.query) {
        page = parseInt(req.query.page);
    }

    page = page || 0;

    let pkgList = cache.listAllKeys(page, () => { return parserService.parsefile(filePath) });

    let packages = pkgList.map((pkg) => {
        return { "packageName": pkg, "Links": [{ "rel": "self", "href": baseURL + "api/packages/" + pkg }] };
    })

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

app.get("/api/packages/:packagename", (req: Request, res: Response) => {

    let pkgName = req.params.packagename;
    let pkgDetails: any = cache.get(pkgName);
    let statusCode: number;

    if (!pkgDetails) {
        pkgDetails = { Message: "No data found." }
        statusCode = 404;
    } else {
        let firstPageUrl = baseURL + "api/packages";
        let links = { "Packages": firstPageUrl }
        pkgDetails["Links"] = links;
        statusCode = 200;
    }

    res.status(statusCode).send(pkgDetails);
});

app.delete("/clearcache", (req: Request, res: Response) => {
    cache.flush()
    res.send({ Message: "Cache cleared." })
})


export default app;