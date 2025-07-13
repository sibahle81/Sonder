import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditResult } from '../models/audit-models';
import { CommonService } from '../../core/services/common/common.service';
import { ServiceType } from '../../shared/enums/service-type.enum';
import { ConstantApi } from 'src/app/shared/constants/constant';

@Injectable()
export class AuditLogService {

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

  private getApiUrl(serviceType: ServiceType): string {
    switch (serviceType) {
      case ServiceType.MasterData: return ConstantApi.MasterDataAuditLogApiUrl;
      case ServiceType.Security: return ConstantApi.SecurityAuditLogApiUrl;
      case ServiceType.CampaignManager: return ConstantApi.CampaignManagerAuditLogApiUrl;
      case ServiceType.BusinessProcessManager: return ConstantApi.BusinessProcessManagerAuditLogApiUrl;
      case ServiceType.LeadManager: return ConstantApi.LeadManagerAuditLogApiUrl;
      case ServiceType.ProductManager: return ConstantApi.ProductManagerAuditLogApiUrl;
      case ServiceType.ClientManager: return ConstantApi.ClientManagerAuditLogApiUrl;
      case ServiceType.PolicyManager: return ConstantApi.PolicyManagerAuditLogApiUrl;
      case ServiceType.BillingManager: return ConstantApi.BillingManagerAuditLogApiUrl;
      case ServiceType.PaymentManager: return ConstantApi.PaymentManagerAuditLogApiUrl;
      case ServiceType.ClaimManager: return ConstantApi.ClaimManagerAuditLogApiUrl;
      case ServiceType.BrokerageManager: return ConstantApi.BrokerageManagerAuditLogApiUrl;
      default: throw Error('no default route for audit log');
    }
  }
}
