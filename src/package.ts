class Package {

    name: string;
    description: string;
    version: string;
    depends: string[];
    packagesDependingOnMe: string[] = [];

    constructor(name: string, description: string, version: string,
        depends: string[] = [], packagesDependingOnMe: string[] = []) {
            
        this.name = name;
        this.description = description;
        this.version = version;
        this.depends = depends;
        this.packagesDependingOnMe = packagesDependingOnMe;
    }

    checkPackageInDepends(packageName: string) {
        if (this.depends.indexOf(packageName) >= 0) {
            return true;
        }
        return false;
    }

    addPackagesDependingOnMe(packageName: string) {
        this.packagesDependingOnMe.push(packageName);
    }


}

export default Package;