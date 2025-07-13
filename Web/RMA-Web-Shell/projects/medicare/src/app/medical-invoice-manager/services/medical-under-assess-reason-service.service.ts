
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InvoiceStatusEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/invoice-status.enum';
import { UnderAssessReason } from '../models/under-assess-reason';
import { InvoiceUnderAssessReason } from '../models/invoice-under-assess-reason';

@Injectable({
  providedIn: 'root'
})
export class MedicalUnderAssessReasonServiceService {
  private api = 'mdm/api/UnderAssessReason';

  constructor(private readonly commonService: CommonService) {
  }

  getUnderAssessReasons(): Observable<UnderAssessReason[]> {
    return this.commonService.getAll<UnderAssessReason[]>(this.api + `/GetUnderAssessReasons`);
  }

  getLineUnderAssessReasons(): Observable<UnderAssessReason[]> {
    return this.commonService.getAll<UnderAssessReason[]>(this.api + `/GetLineUnderAssessReasons`);
  }

  geUnderAssessReason(invoiceId: number): Observable<UnderAssessReason> {
    return this.commonService.get<UnderAssessReason>(invoiceId, `${this.api}/GeUnderAssessReason`);
  }

  getUnderAssessReasonsByInvoiceStatus(invoiceStatus: InvoiceStatusEnum): Observable<UnderAssessReason[]> {
    return this.commonService.get<UnderAssessReason[]>(invoiceStatus, `${this.api}/GetUnderAssessReasonsByInvoiceStatus`);
  }

  setInvoiceUnderAssessReason(underAssessReason: UnderAssessReason): Observable<number> {
    return this.commonService.postGeneric<UnderAssessReason, number>(this.api + `/SetInvoiceUnderAssessReason`, underAssessReason);
  }
  
}

