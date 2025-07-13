import { Injectable } from "@angular/core";
import { OverPayment, OverPaymentsWriteOff } from "../models/overpayment";
import { Pagination } from "projects/shared-models-lib/src/lib/pagination/pagination";
import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { Observable } from "rxjs";

@Injectable()
export class OverPaymentService {
  private apiUrl = 'pen/api/PensionOverPayment';

  constructor(private readonly commonService: CommonService,) {}

  public getIncreases(query: string, pagination: Pagination,): Observable<OverPayment[]> {
    const searchTerm = encodeURIComponent(query)
    return this.commonService.getAll<OverPayment[]>(`${this.apiUrl}/GetOverPayments/${pagination.pageNumber}/${pagination.pageSize}/CreatedDate/asc/${searchTerm}`);
  }

  public getOutstandingOverpayments(query: string, pagination: Pagination, fromDate: string = null, toDate: string  = null): Observable<OverPayment[]> {
    const searchTerm = encodeURIComponent(query)  ;
    return this.commonService.getAll<OverPayment[]>(`${this.apiUrl}/GetOutstandingOverpayments/${pagination.pageNumber}/${pagination.pageSize}/CreatedDate/asc/${searchTerm}/${fromDate}/${toDate}`);
  }

  public writeOffOverPayment(writeOff: OverPaymentsWriteOff): Observable<OverPaymentsWriteOff> {
    return this.commonService.postGeneric<OverPaymentsWriteOff, OverPaymentsWriteOff>(`${this.apiUrl}/WriteOffOverPayment`, writeOff);
  }

  public writeOffOverPayments(writeOff: OverPaymentsWriteOff[]): Observable<OverPaymentsWriteOff> {
    return this.commonService.postGeneric<OverPaymentsWriteOff[], OverPaymentsWriteOff>(`${this.apiUrl}/WriteOffOverPayment`, writeOff);
  }
}
