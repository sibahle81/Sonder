import { Injectable } from '@angular/core';
import { AuthorityLimitConfiguration } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-configuration';
import { AuthorityLimitItemTypePermissions } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-item-type-permissions';
import { AuthorityLimitRequest } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-request';
import { AuthorityLimitResponse } from 'projects/shared-models-lib/src/lib/authority-limits/authority-limit-response';
import { AuthorityLimitSearchRequest } from 'projects/shared-models-lib/src/lib/enums/authority-limits/authority-limit-search-request';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorityLimitService {
  private apiUrl = 'mdm/api/AuthorityLimit';

  constructor(
    private readonly commonService: CommonService) {
  }

  checkUserHasAuthorityLimit(request: AuthorityLimitRequest): Observable<AuthorityLimitResponse> {
    return this.commonService.postGeneric<AuthorityLimitRequest, AuthorityLimitResponse>(`${this.apiUrl}/CheckUserHasAuthorityLimit`, request);
  }

  // think about only having access to this on the backend...needed for testing now
  createUserAuthorityLimitConfigurationAudit(request: AuthorityLimitRequest): Observable<boolean> {
    return this.commonService.postGeneric<AuthorityLimitRequest, boolean>(`${this.apiUrl}/CreateUserAuthorityLimitConfigurationAudit`, request);
  }

  getPagedAuthorityLimits(authorityLimitSearchRequest: AuthorityLimitSearchRequest): Observable<PagedRequestResult<AuthorityLimitConfiguration>> {
    return this.commonService.postGeneric<AuthorityLimitSearchRequest, PagedRequestResult<AuthorityLimitConfiguration>>(`${this.apiUrl}/GetPagedAuthorityLimits/`, authorityLimitSearchRequest);
  }

  getAuthorityLimitItemTypesPermissions(): Observable<AuthorityLimitItemTypePermissions[]> {
    return this.commonService.getAll<AuthorityLimitItemTypePermissions[]>(`${this.apiUrl}/GetAuthorityLimitItemTypesPermissions`);
  }

  updateAuthorityLimits(authorityLimitConfigurations: AuthorityLimitConfiguration[]): Observable<boolean> {
    return this.commonService.postGeneric<AuthorityLimitConfiguration[], boolean>(`${this.apiUrl}/UpdateAuthorityLimits/`, authorityLimitConfigurations);
  }
}
