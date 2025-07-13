/** @description The Permission data. */
export class Permission {
    id: number;
    name: string;
    securityRank:number;
    isActive : boolean;
    overridesRolePermission : boolean;

    constructor(id: number,name: string,securityRank:number){
        this.id=id;
        this.name=name;
        this.securityRank=securityRank;
    }
}
