import { Injectable } from '@angular/core';
import { CommonService } from '../../common/common.service';
import { Observable } from 'rxjs';
import { PermissionGroup } from 'projects/shared-models-lib/src/lib/security/permissiongroup';

@Injectable({
  providedIn: 'root'
})
export class PermissionGroupService {
  private apiUrl = 'sec/api/PermissionGroup';
  constructor(
      private readonly commonService: CommonService) {
  }
  getPermissionGroups() : Observable<PermissionGroup[]> {//de
    return this.commonService.getAll<PermissionGroup[]>(`${this.apiUrl}/0`);
  }
  getPermissionGroupsForUser(id:number) : Observable<PermissionGroup[]> {
    return this.commonService.getAll<PermissionGroup[]>(`${this.apiUrl}/${id}`);
  }
  getPermissionGroupsForRole() : Observable<PermissionGroup[]> {
    return this.commonService.getAll<PermissionGroup[]>(`${this.apiUrl}/0`);
  }
  getPermissonGroup(id: any): Observable<PermissionGroup> {
      return this.commonService.get<PermissionGroup>(id, this.apiUrl);
  }
  getPermissionGroupsOnly() : Observable<PermissionGroup[]> {
    return this.commonService.getAll<PermissionGroup[]>(`${this.apiUrl}/getPermissionGroupsOnly`);
  }
  getPermissionGroupByGroupId(id: number) : Observable<PermissionGroup> {
    return this.commonService.getAll<PermissionGroup>(`${this.apiUrl}/getByGroupId/${id}`);
  }
  
}
