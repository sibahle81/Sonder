import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Group } from '../Entities/group';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';

@Injectable()
export class GroupService {

    private apiGroup = 'clc/api/Client/Group';

    constructor(private readonly commonService: CommonService) {
    }

    getGroups(): Observable<Group[]> {
        return this.commonService.getAll<Group[]>(`${this.apiGroup}`);
    }

    getGroup(id: number): Observable<Group> {
        return this.commonService.get<Group>(id, `${this.apiGroup}`);
    }

    addGroup(group: Group): Observable<number> {
        return this.commonService.postGeneric<Group, number>(`${this.apiGroup}`, group);
    }

    editGroup(group: Group): Observable<boolean> {
        return this.commonService.edit<Group>(group, `${this.apiGroup}`);
    }

    removeGroup(id: number): Observable<boolean> {
        return this.commonService.remove(id, `${this.apiGroup}`);
    }

    searchGroups(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<Group>> {
        const urlQuery = encodeURIComponent(query);
        return this.commonService.getAll<PagedRequestResult<Group>>(`${this.apiGroup}/Search/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
    }

    getLastViewedGroups(): Observable<Group[]> {
        return this.commonService.getAll<Group[]>(`${this.apiGroup}/LastViewed`);
    }
}
