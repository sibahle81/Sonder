export class SystemModuleViewModel {
    id: number;
    permissionGroupCount: number;
    moduleName:string;
    constructor(id: number,permissionGroupCount: number, moduleName:string) {
        this.id = id;
        this.permissionGroupCount = permissionGroupCount;
        this.moduleName =moduleName;
    }
}