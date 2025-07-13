import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditResult } from './audit-models';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { error } from 'util';
import { AuditItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/audit-item-type.enum';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { ReportViewedAudit } from 'projects/shared-models-lib/src/lib/common/audits/report-viewed-audit';
import { PagedRequest } from 'projects/shared-models-lib/src/lib/pagination/PagedRequest';
import { ReportViewedAuditPagedRequest } from 'projects/shared-models-lib/src/lib/common/audits/report-viewed-audit-paged-request';

@Injectable()
export class AuditLogService {

  private api = 'mdm/api/AuditLog';
  private apiUrl = 'bpm/api/AuditLog';
  constructor(private readonly commonService: CommonService) { }

  getAuditLog(serviceType: ServiceTypeEnum, id: number): Observable<AuditResult> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult>(`${apiUrl}/ById/${id}`);
  }

  getAuditLogs(serviceType: ServiceTypeEnum, itemType: number, itemId: number): Observable<AuditResult[]> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult[]>(`${apiUrl}/ByType/${itemType}/${itemId}`);
  }

  GetAuditRequest(serviceType: ServiceTypeEnum, itemType: AuditItemTypeEnum, itemId: number): Observable<AuditResult[]> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult[]>(`${apiUrl}/GetAuditRequest/${itemType}/${itemId}`);
  }

  getCorrolationAuditLog(serviceType: ServiceTypeEnum, corrolationToken: string): Observable<AuditResult> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult>(`${apiUrl}/ByToken/${corrolationToken}`);
  }

  getPagedAuditLogs(serviceType: ServiceTypeEnum, itemType: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<AuditResult>> {
    const apiUrl = this.getApiUrl(serviceType);
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<AuditResult>>(`${apiUrl}/ByTypePaged/${itemType}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  createReportViewedAudit(reportViewedAudit: ReportViewedAudit): Observable<number> {
    return this.commonService.postGeneric<ReportViewedAudit, number>(this.api + '/CreateReportViewedAudit', reportViewedAudit);
  }

  getPagedReportViewedAudit(reportViewedAuditPagedRequest: ReportViewedAuditPagedRequest): Observable<PagedRequestResult<ReportViewedAudit>> {
    return this.commonService.postGeneric<ReportViewedAuditPagedRequest, PagedRequestResult<ReportViewedAudit>>(`${this.api}/GetPagedReportViewedAudit`, reportViewedAuditPagedRequest);
  }

  private getApiUrl(serviceType: ServiceTypeEnum): string {
    switch (serviceType) {
      case ServiceTypeEnum.MasterData: return 'mdm/api/AuditLog';
      case ServiceTypeEnum.Security: return 'sec/api/AuditLog';
      case ServiceTypeEnum.CampaignManager: return 'cmp/api/AuditLog';
      case ServiceTypeEnum.BusinessProcessManager: return 'bpm/api/AuditLog';
      case ServiceTypeEnum.LeadManager: return 'clc/api/Lead/AuditLog';
      case ServiceTypeEnum.ProductManager: return 'clc/api/Product/AuditLog';
      case ServiceTypeEnum.ClientManager: return 'clc/api/Client/AuditLog';
      case ServiceTypeEnum.PolicyManager: return 'clc/api/Policy/AuditLog';
      case ServiceTypeEnum.BillingManager: return 'fin/api/Billing/AuditLog';
      case ServiceTypeEnum.PaymentManager: return 'fin/api/AuditLog';
      case ServiceTypeEnum.ClaimManager: return 'clm/api/Claim/AuditLog';
      case ServiceTypeEnum.BrokerageManager: return 'clc/api/Broker/AuditLog';
      case ServiceTypeEnum.QuoteManager: return 'clc/api/Quote/AuditLog';
      case ServiceTypeEnum.MemberManager: return 'clc/api/Member/AuditLog';
      case ServiceTypeEnum.MediCareManager: return 'med/api/Medicare/AuditLog';
      default: throw new error('no default route for audit log');
    }
  }
}
