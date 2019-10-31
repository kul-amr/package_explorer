"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const package_1 = __importDefault(require("./package"));
class Parser {
    constructor() {
        this.packagesDependencies = {};
    }
    parsefile(filePath) {
        console.log("Start parsing file.");
        let data = fs_1.default.readFileSync(filePath, 'utf8');
        let requiredParams = ['Package', 'Version', 'Depends', 'Description'];
        let packagesList = data.split('\n\n');
        packagesList = packagesList.filter(v => v.length > 0);
        let packagesRes = [];
        packagesList.forEach((packageElement) => {
            let tempPkgParams = packageElement.split('\n');
            let pkgParamObj = {};
            let procKey;
            tempPkgParams.forEach((paramElm) => {
                //Concating the extended details line for any required param splitted because of the seperator.
                if (paramElm.startsWith(' ') && procKey) {
                    pkgParamObj[procKey] = pkgParamObj[procKey] + paramElm;
                }
                else {
                    let paramArr = paramElm.split(':');
                    let res = [];
                    if (paramArr.length < 2) { // No key value present.
                        return;
                    }
                    else { // Get key value and if multi occurances of seperator, ignore after first .
                        res = paramArr.slice(0, 1);
                        res.push(paramArr.slice(1).join(':'));
                        if (res.length == 2 && requiredParams.indexOf(paramArr[0]) >= 0) {
                            pkgParamObj[res[0]] = res[1]; //Fetching the required key-value.
                            procKey = res[0];
                        }
                        else {
                            procKey = "";
                        }
                    }
                }
            });
            let packageName = pkgParamObj['Package'];
            packageName = packageName.trim();
            let depends = [];
            let dependsStr = pkgParamObj['Depends'];
            if (dependsStr) {
                depends = dependsStr.trim().split(/\s*,\s*/);
            }
            if (packageName) {
                this.addDependencies(packageName, depends);
                let pkgObj = {
                    key: packageName,
                    val: new package_1.default(packageName, pkgParamObj['Description'], pkgParamObj['Version'], depends)
                };
                packagesRes.push(pkgObj);
            }
        });
        packagesRes.forEach((pkg) => {
            let dependsOnME = this.packagesDependencies[pkg['key']];
            pkg['val'].packagesDependingOnMe = dependsOnME;
        });
        return packagesRes;
    }
    addDependencies(packageName, depends) {
        depends.forEach((elmPkgName) => {
            if (this.packagesDependencies.hasOwnProperty(elmPkgName)) {
                this.packagesDependencies[elmPkgName].push(packageName);
            }
            else {
                this.packagesDependencies[elmPkgName] = [packageName];
            }
        });
    }
}
exports.default = Parser;
//# sourceMappingURL=parser.service.js.map