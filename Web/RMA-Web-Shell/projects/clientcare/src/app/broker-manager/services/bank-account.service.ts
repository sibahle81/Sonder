import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BankAccount } from '../models/bank-account';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable({ providedIn: 'root' })
export class BankAccountService {

  private apiBankAccount = 'clc/api/Client/BankAccount';

  constructor(private readonly commonService: CommonService) {
  }

  getBankAccount(id: number): Observable<BankAccount> {
    if (id === 0) {
      const account = new BankAccount();
      account.id = 0;
      return of(account);
    }
    return this.commonService.get<BankAccount>(id, `${this.apiBankAccount}`);
  }
}
