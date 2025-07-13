import { Injectable } from '@angular/core';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { SLAStatusChangeAudit } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit';
import { SLAStatusChangeAuditSearchRequest } from 'projects/shared-models-lib/src/lib/sla/sla-status-change-audit/sla-status-change-audit-search-request';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SLAService {
  private apiUrl = 'mdm/api/sla';

  constructor(
    private readonly commonService: CommonService) {
  }

  getSLAStatusChangeAudits(slaItemType: SLAItemTypeEnum, itemId: number): Observable<SLAStatusChangeAudit[]> {
    const slaStatusChangeAudit = new SLAStatusChangeAudit();
    slaStatusChangeAudit.slaItemType = slaItemType;
    slaStatusChangeAudit.itemId = itemId;

    return this.commonService.postGeneric<SLAStatusChangeAudit, SLAStatusChangeAudit[]>(`${this.apiUrl}/GetSLAStatusChangeAudits/`, slaStatusChangeAudit);
  }

  getPagedSLAStatusChangeAudits(slaStatusChangeAuditSearchRequest: SLAStatusChangeAuditSearchRequest): Observable<PagedRequestResult<SLAStatusChangeAudit>> {
    return this.commonService.postGeneric<SLAStatusChangeAuditSearchRequest, PagedRequestResult<SLAStatusChangeAudit>>(`${this.apiUrl}/GetPagedSLAStatusChangeAudits/`, slaStatusChangeAuditSearchRequest);
  }
}

