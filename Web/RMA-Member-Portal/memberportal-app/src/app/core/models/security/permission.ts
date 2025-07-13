/** @description The Permission data. */
export class Permission {
    id: number;
    name: string;
    securityRank: number;

    constructor(id: number, name: string, securityRank: number) {
        this.id = id;
        this.name = name;
        this.securityRank = securityRank;
    }
}
