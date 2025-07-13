import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';


@Injectable({
  providedIn: 'root'
})
export class MedicalInvoiceHealthcareProviderService {
  private apiUrlHealthCareProvider = 'med/api/HealthCareProvider';

  constructor(
    private readonly commonService: CommonService) {
  }

  GetHealthCareProviderVatAmount( isVatRegistered:boolean, invoiceDate): Observable<number> {
    return this.commonService.getAll<number>(`${this.apiUrlHealthCareProvider}/GetHealthCareProviderVatAmount/${isVatRegistered}/${invoiceDate}`);
  }

}
