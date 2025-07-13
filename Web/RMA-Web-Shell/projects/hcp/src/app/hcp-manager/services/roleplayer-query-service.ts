import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RolePlayerItemQuery } from 'projects/hcp/src/app/hcp-manager/entities/roleplayer-item-query';
import { RolePlayerItemQueryResponse } from '../entities/roleplayer-item-query-response';
import { RolePlayerQueryItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-item-query-enums';

@Injectable({
  providedIn: 'root'
})
export class RolePlayerQueryService {

  private apiPath = 'mdm/api/RolePlayerQuery';

  constructor(
    private readonly commonService: CommonService) {
  }

  addRolePlayerItemQuery(value: RolePlayerItemQuery): Observable<RolePlayerItemQuery> {
    return this.commonService.postGeneric<RolePlayerItemQuery, RolePlayerItemQuery>(`${this.apiPath}/AddRolePlayerItemQuery`, value);
  }

  getPagedRolePlayerItemQueries(rolePlayerQueryItemType: RolePlayerQueryItemTypeEnum, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerItemQuery>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerItemQuery>>(`${this.apiPath}/GetPagedRolePlayerItemQueries/${rolePlayerQueryItemType}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  getPagedRolePlayerItemQueryResponses(pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<RolePlayerItemQueryResponse>> {
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<RolePlayerItemQueryResponse>>(`${this.apiPath}/GetPagedRolePlayerItemQueryResponses/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }
}