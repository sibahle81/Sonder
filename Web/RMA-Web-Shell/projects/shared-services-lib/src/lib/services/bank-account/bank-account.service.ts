import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { BankAccount } from 'projects/shared-models-lib/src/lib/common/bank-account';

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private bankAccountApi = 'mdm/api/BankAccount';

  constructor(private readonly commonService: CommonService) { }

  getBankAccounts(): Observable<BankAccount[]> {
    return this.commonService.getAll<BankAccount[]>(`${this.bankAccountApi}`);
  }
 }
