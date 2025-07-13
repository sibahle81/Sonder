import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BankAccount } from '../Entities/bank-account';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';

@Injectable({ providedIn: 'root' })
export class BankAccountService {

  private apiBankAccount = 'clc/api/Client/BankAccount';
  private apiLeadsAccount = 'clc/api/Lead/BankAccount';

  constructor(private readonly commonService: CommonService) {
  }

  listBankAccounts(): Observable<BankAccount[]> {
    return this.commonService.getAll<BankAccount[]>(`${this.apiBankAccount}`);
  }

  getBankAccount(id: number): Observable<BankAccount> {
    if (id === 0) {
      const account = new BankAccount();
      account.id = 0;
      return of(account);
    }
    return this.commonService.get<BankAccount>(id, `${this.apiBankAccount}`);
  }

  getBankAccountByClientId(clientId: number): Observable<BankAccount[]> {
    return this.commonService.get<BankAccount[]>(clientId, `${this.apiBankAccount}/GetBankAccountsForClient`);
  }

  addBankAccount(bankAccount: BankAccount): Observable<number> {
    return this.commonService.postGeneric<BankAccount, number>(`${this.apiBankAccount}`, bankAccount);
  }

  editBankAccount(bankAccount: BankAccount): Observable<boolean> {
    return this.commonService.edit<BankAccount>(bankAccount, `${this.apiBankAccount}`);
  }

  removeBankAccount(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${this.apiBankAccount}`);
  }

  getBankAccountByType(itemType: string, itemId: number): Observable<BankAccount[]> {
    const apiUrl = `${this.apiBankAccount}/${itemType}/${itemId}`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }

  getBankAccountsByTypeFromLeads(itemType: string, itemId: number): Observable<BankAccount[]> {
    const apiUrl = `${this.apiLeadsAccount}/ByClient/${itemId}`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }

  getBankAccountsPendingApproval(): Observable<BankAccount[]> {
    const apiUrl = `${this.apiBankAccount}/GetBankAccountsPendingApproval`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }
}
