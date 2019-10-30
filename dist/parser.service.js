"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const package_1 = __importDefault(require("./package"));
class Parser {
    parsefile(filePath) {
        console.log("Start parsing file.");
        let data = fs_1.default.readFileSync(filePath, 'utf8');
        let requiredParams = ['Package', 'Version', 'Depends', 'Description'];
        let packagesList = data.split('\n\n');
        packagesList = packagesList.filter(v => v.length > 0);
        let packagesRes = [];
        packagesList.forEach((packageElement) => {
            let tempPkgParams = packageElement.split('\n');
            let pkgJSONObj = {};
            //Concating the extended details line for any point splitted because of new line.
            for (let index = tempPkgParams.length - 1; index > 0; index--) {
                let element = tempPkgParams[index];
                if (element.startsWith(' ')) {
                    tempPkgParams[index - 1] = tempPkgParams[index - 1] + element;
                }
            }
            //Filtering the lines starting with space as those are appneted above.
            tempPkgParams = tempPkgParams.filter(v => !v.startsWith(' '));
            tempPkgParams.forEach((paramElm) => {
                let paramArr = paramElm.split(':');
                let res = [];
                if (paramArr.length < 2) { // no key value present
                    return;
                }
                else { // Get key value and if multi occurances of seperator, ignore after first .
                    res = paramArr.slice(0, 1);
                    res.push(paramArr.slice(1).join(':'));
                    if (res.length == 2 && requiredParams.indexOf(paramArr[0]) >= 0) {
                        pkgJSONObj[res[0]] = res[1]; //Fetching the required key-value.
                    }
                }
            });
            let packageName = pkgJSONObj['Package'];
            packageName = packageName.trim();
            let depends = [];
            let dependsStr = pkgJSONObj['Depends'];
            if (dependsStr) {
                depends = dependsStr.trim().split(/\s*,\s*/);
            }
            if (packageName) {
                let packagesDependsOnME = packagesRes.filter((pkgElm) => {
                    if (pkgElm['val'].checkPackageInDepends(packageName)) {
                        return pkgElm['key'];
                    }
                }).map(elm => elm['key']);
                depends.forEach((elmPkgName) => {
                    packagesRes.forEach((pkgElm) => {
                        if (pkgElm['key'] == elmPkgName) {
                            pkgElm['val'].addPackagesDependingOnMe(packageName);
                            return;
                        }
                    });
                });
                let pkgObj = {
                    key: packageName,
                    val: new package_1.default(packageName, pkgJSONObj['Description'], pkgJSONObj['Version'], depends, packagesDependsOnME)
                };
                packagesRes.push(pkgObj);
            }
        });
        return packagesRes;
    }
}
exports.default = Parser;
//# sourceMappingURL=parser.service.js.map