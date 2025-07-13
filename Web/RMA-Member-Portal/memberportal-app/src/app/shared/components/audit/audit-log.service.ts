import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditResult } from 'src/app/core/models/audit-models';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ServiceType } from '../../enums/service-type.enum';
import { PagedRequestResult } from 'src/app/core/models/pagination/PagedRequestResult.model';

@Injectable()
export class AuditLogService {

  private apiUrl = 'bpm/api/AuditLog';
  constructor( private readonly commonService: CommonService) { }

  getAuditLog(serviceType: ServiceType, id: number): Observable<AuditResult> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult>(`${apiUrl}/ById/${id}`);
  }

  getAuditLogs(serviceType: ServiceType, itemType: number, itemId: number): Observable<AuditResult[]> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult[]>(`${apiUrl}/ByType/${itemType}/${itemId}`);
  }

  getCorrolationAuditLog(serviceType: ServiceType, corrolationToken: string): Observable<AuditResult> {
    const apiUrl = this.getApiUrl(serviceType);
    return this.commonService.getAll<AuditResult>(`${apiUrl}/ByToken/${corrolationToken}`);
  }

  getPagedAuditLogs(serviceType: ServiceType, itemType: number, pageNumber: number, pageSize: number, orderBy: string, sortDirection: string, query: string): Observable<PagedRequestResult<AuditResult>> {
    const apiUrl = this.getApiUrl(serviceType);
    const urlQuery = encodeURIComponent(query);
    return this.commonService.getAll<PagedRequestResult<AuditResult>>(`${apiUrl}/ByTypePaged/${itemType}/${pageNumber}/${pageSize}/${orderBy}/${sortDirection}/${urlQuery}`);
  }

  private getApiUrl(serviceType: ServiceType): string {
    switch (serviceType) {
      case ServiceType.MasterData: return 'mdm/api/AuditLog';
      case ServiceType.Security: return 'sec/api/AuditLog';
      case ServiceType.CampaignManager: return 'cmp/api/AuditLog';
      case ServiceType.BusinessProcessManager: return 'bpm/api/AuditLog';
      case ServiceType.LeadManager: return 'clc/api/Lead/AuditLog';
      case ServiceType.ProductManager: return 'clc/api/Product/AuditLog';
      case ServiceType.ClientManager: return 'clc/api/Client/AuditLog';
      case ServiceType.PolicyManager: return 'clc/api/Policy/AuditLog';
      case ServiceType.BillingManager: return 'fin/api/Billing/AuditLog';
      case ServiceType.PaymentManager: return 'fin/api/AuditLog';
      case ServiceType.ClaimManager: return 'clm/api/AuditLog';
      case ServiceType.BrokerageManager: return 'clc/api/Broker/AuditLog';
      default: throw new Error('no default route for audit log');
    }
  }
}
