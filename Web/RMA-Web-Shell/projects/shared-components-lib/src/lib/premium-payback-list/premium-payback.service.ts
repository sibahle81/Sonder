import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { CommonService } from "projects/shared-services-lib/src/lib/services/common/common.service";
import { PremiumPaybackItem } from "projects/shared-models-lib/src/lib/policy/premium-payback-item";

@Injectable({
  providedIn: 'root'
})
export class PremiumPaybackService {
  private api = 'clc/api/Policy/Policy';

  constructor(private readonly commonService: CommonService) { }

  public sendPaybackNotification(payback: PremiumPaybackItem): Observable<PremiumPaybackItem> {
    const url = `${this.api}/SendPaybackNotification`;
    return this.commonService.postGeneric<PremiumPaybackItem, PremiumPaybackItem>(url, payback);
  }

  public validatePaybackBankAccount(payback: PremiumPaybackItem): Observable<PremiumPaybackItem> {
    const url = `${this.api}/ValidatePaybackBankAccount`;
    return this.commonService.postGeneric<PremiumPaybackItem, PremiumPaybackItem>(url, payback);
  }

  public rejectPaybackPayment(payback: PremiumPaybackItem): Observable<PremiumPaybackItem> {
    const url = `${this.api}/RejectPaybackPayment`;
    return this.commonService.postGeneric<PremiumPaybackItem, PremiumPaybackItem>(url, payback);
  }
}