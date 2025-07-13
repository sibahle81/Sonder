import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CommonService } from '../../common/common.service';
import { Role } from 'projects/shared-models-lib/src/lib/security/role';
import { Permission } from 'projects/shared-models-lib/src/lib/security/permission';

@Injectable()
export class RoleService {
    private apiUrl = 'sec/api/Role';
    constructor(
        private readonly commonService: CommonService) {
    }

    searchRoles(query: string): Observable<Role[]> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<Role[]>(`${this.apiUrl}/Search/${urlQuery}`);
    }

    getLastViewedUsers(): Observable<Role[]> {
        return this.commonService.getAll<Role[]>(`${this.apiUrl}/LastViewed`);
    }

    getRole(id: any): Observable<Role> {
        return this.commonService.get<Role>(id, this.apiUrl);
    }

    getRoles(): Observable<Role[]> {
        return this.commonService.getAll<Role[]>(this.apiUrl);
    }

    addRole(role: Role): Observable<number> {
        return this.commonService.postGeneric<Role, number>(this.apiUrl, role);
    }

    editRole(role: Role): Observable<boolean> {
        return this.commonService.edit<Role>(role, this.apiUrl);
    }

    getRolesByPermission(permissionName: string): Observable<Role[]> {
        return this.commonService.getAll<Role[]>(`${this.apiUrl}/GetRolesByPermission/${permissionName}`);
    }
    
    getRolePermissions(id: any): Observable<Permission[]> {
        return this.commonService.getAll<Permission[]>(`${this.apiUrl}/GetRolePermissions/${id}`);
    }
}
