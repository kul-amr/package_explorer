"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Package {
    constructor(name, description, version, depends = [], packagesDependingOnMe = []) {
        this.packagesDependingOnMe = [];
        this.name = name;
        this.description = description;
        this.version = version;
        this.depends = depends;
        this.packagesDependingOnMe = packagesDependingOnMe;
    }
    checkPackageInDepends(packageName) {
        if (this.depends.indexOf(packageName) >= 0) {
            return true;
        }
        return false;
    }
    addPackagesDependingOnMe(packageName) {
        this.packagesDependingOnMe.push(packageName);
    }
}
exports.default = Package;
//# sourceMappingURL=package.js.map