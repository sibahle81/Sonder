import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { UnallocatedBankImportPayment } from '../models/unallocatedBankImportPayment';
import { PaymentAllocationLookup } from '../models/allocation-lookup';

@Injectable({
  providedIn: 'root'
})
export class AllocationLookupService {
  private paymentAllocationApi = 'bill/api/billing/AllocationLookup';
  private billingApi = 'bill/api/billing/AllocationLookup';
  
  constructor(private readonly commonService: CommonService) { }

  getPayment(paymentId: number): Observable<PaymentAllocationLookup> {
    return this.commonService.get<PaymentAllocationLookup>(paymentId, `${this.paymentAllocationApi}/GetUnAllocatedPaymentById`);
  }

  getAllocationLookupsByDebtorNumber(debtorNumber: string): Observable<PaymentAllocationLookup[]> {
    return this.commonService.get<PaymentAllocationLookup[]>(debtorNumber, `${this.paymentAllocationApi}/GetAllocationLookupsByDebtorNumber`);
  }

  getAllocationLookups(): Observable<PaymentAllocationLookup[]> {
    return this.commonService.get<PaymentAllocationLookup[]>('', `${this.paymentAllocationApi}/GetAllocationLookups`);
  }

  editAllocationLookup(allocationLookups: PaymentAllocationLookup[]): Observable<any> {
    return this.commonService.postGeneric<any, any>(`${this.paymentAllocationApi}/EditAllocationLookups/`, allocationLookups);
  }

  createAllocationLookups(allocationLookups: PaymentAllocationLookup[]): Observable<number> {
    return this.commonService.postGeneric<any, number>(`${this.billingApi}/createAllocationLookups`, allocationLookups);
  }

  deleteAllocationLookup(id: number): Observable<boolean> {
    return this.commonService.postGeneric<any, boolean>(`${this.billingApi}/DeleteAllocationLookup`, id);
  }
}
