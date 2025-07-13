
import { Permission } from './permission'
export class PermissionGroup {
    id: number;
    name: string;
    moduleId: number;
    permissions: Permission[];

    constructor(id: number,name: string,moduleId: number,permissions: Permission[]) {
        this.id = id;
        this.name = name,
        this.moduleId = moduleId,      
        this.permissions = permissions; 
    }
}