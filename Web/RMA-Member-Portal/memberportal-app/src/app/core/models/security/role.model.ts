import { BaseClass } from "../base-class.model";

export class Role extends BaseClass {
    name: string;
    permissionIds: number[];
    securityRank: number;
}
