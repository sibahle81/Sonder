import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InvoiceAllocation } from 'projects/claimcare/src/app/claim-manager/shared/entities/invoice-allocation.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalmedicalInvoiceAssessService {
  private apiUrlInvoiceUnderAssessReason = 'med/api/InvoiceUnderAssessReason';

  constructor(
    private readonly commonService: CommonService) {
  }

  addinvoiceAllocations(invoiceAllocation: InvoiceAllocation): Observable<number> {
    return this.commonService.postGeneric<InvoiceAllocation, number>(this.apiUrlInvoiceUnderAssessReason + `/AddinvoiceAllocations`, invoiceAllocation);
  }

  editinvoiceAllocations(invoiceAllocation: InvoiceAllocation): Observable<boolean> {
    return this.commonService.edit(invoiceAllocation, this.apiUrlInvoiceUnderAssessReason + `/EditinvoiceAllocations`);
  }
}
