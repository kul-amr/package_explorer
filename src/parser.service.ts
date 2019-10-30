import fs from "fs";
import Package from "./package";
import { ValueSetItem } from "node-cache";


class Parser {

    parsefile(filePath: string) {

        console.log("Start parsing file.");

        let data = fs.readFileSync(filePath, 'utf8');
        let requiredParams = ['Package', 'Version', 'Depends', 'Description'];
        let packagesList = data.split('\n\n');

        packagesList = packagesList.filter(v => v.length > 0);
        let packagesRes: any[] = [];

        packagesList.forEach((packageElement) => {

            let tempPkgParams = packageElement.split('\n');
            let pkgJSONObj: any = {};

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
                } else {      // Get key value and if multi occurances of seperator, ignore after first .
                    res = paramArr.slice(0, 1);
                    res.push(paramArr.slice(1).join(':'));
                    if (res.length == 2 && requiredParams.indexOf(paramArr[0]) >= 0) {
                        pkgJSONObj[res[0]] = res[1];    //Fetching the required key-value.
                    }
                }
            })

            let packageName = pkgJSONObj['Package'];
            packageName = packageName.trim()
            let depends: string[] = [];
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
                    })
                })

                let pkgObj: ValueSetItem<any> = {
                    key: packageName,
                    val: new Package(packageName, pkgJSONObj['Description'],
                        pkgJSONObj['Version'], depends, packagesDependsOnME)
                };

                packagesRes.push(pkgObj);
            }
        })

        return packagesRes;
    }

}

export default Parser;