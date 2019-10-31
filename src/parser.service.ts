import fs from "fs";
import Package from "./package";
import { ValueSetItem } from "node-cache";

interface IDict {
    [key: string]: Array<string>;
}

class Parser {

    packagesDependencies: IDict = {};

    parsefile(filePath: string) {

        console.log("Start parsing file.");

        let data = fs.readFileSync(filePath, 'utf8');
        let packagesList = data.split('\n\n');

        packagesList = packagesList.filter(v => v.length > 0);
        let packagesRes: any[] = [];

        packagesList.forEach((packageElement) => {

            let pkgParamObj = this.processPackageParams(packageElement);
            let pkgObj = this.createResElm(pkgParamObj);
            packagesRes.push(pkgObj);
            
        })

        packagesRes.forEach((pkg) => {
            let dependsOnME: string[] = this.packagesDependencies[pkg['key']];
            pkg['val'].packagesDependingOnMe = dependsOnME;
        })

        return packagesRes;
    }

    processPackageParams(packageElement: string) {

        let requiredParams = ['Package', 'Version', 'Depends', 'Description'];
        let tempPkgParams = packageElement.split('\n');
        let pkgParamObj: { [x: string]: string; } = {};

        let procKey: string;

        tempPkgParams.forEach((paramElm) => {

            //Concating the extended details line for any required param splitted because of the seperator.
            if (paramElm.startsWith(' ') && procKey) {
                pkgParamObj[procKey] = pkgParamObj[procKey] + paramElm;
            } else {
                let paramArr = paramElm.split(':');
                let res = [];
                if (paramArr.length < 2) { // No key value present.
                    return;
                } else {      // Get key value and if multi occurances of seperator, ignore after first .
                    res = paramArr.slice(0, 1);
                    res.push(paramArr.slice(1).join(':'));
                    if (res.length == 2 && requiredParams.indexOf(paramArr[0]) >= 0) {
                        pkgParamObj[res[0]] = res[1];    //Fetching the required key-value.
                        procKey = res[0];
                    } else {
                        procKey = "";
                    }
                }
            }
        })
        return pkgParamObj;
    }

    createResElm(pkgParamObj: { [x: string]: string; }) {

        let packageName = pkgParamObj['Package'] || "";
        packageName = packageName.trim();
        let depends: string[] = [];
        let dependsStr = pkgParamObj['Depends'];

        depends = dependsStr ? dependsStr.trim().split(/\s*,\s*/):[];
        
        if (packageName) {
            this.addDependencies(packageName, depends);
            let pkgObj: ValueSetItem<any> = {
                key: packageName,
                val: new Package(packageName, pkgParamObj['Description'],
                    pkgParamObj['Version'], depends)
            };
            return pkgObj;
        }
    }

    addDependencies(packageName: string, depends: string[]) {
        depends.forEach((elmPkgName: string) => {
            if (this.packagesDependencies.hasOwnProperty(elmPkgName)) {
                this.packagesDependencies[elmPkgName].push(packageName);
            } else {
                this.packagesDependencies[elmPkgName] = [packageName];
            }
        })
    }

}

export default Parser;