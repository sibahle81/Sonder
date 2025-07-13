import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { ConstantApi } from '../constants/constant';
import { BankAccount } from '../models/bank-account';

@Injectable({ providedIn: 'root' })
export class BankAccountService {

  constructor(private readonly commonService: CommonService) {
  }

  listBankAccounts(): Observable<BankAccount[]> {
    return this.commonService.getAll<BankAccount[]>(`${ConstantApi.ClientApiBankAccount}`);
  }

  getBankAccount(id: number): Observable<BankAccount> {
    if (id === 0) {
      const account = new BankAccount();
      account.id = 0;
      return of(account);
    }
    return this.commonService.get<BankAccount>(id, `${ConstantApi.ClientApiBankAccount}`);
  }

  getBankAccountByClientId(clientId: number): Observable<BankAccount[]> {
    return this.commonService.get<BankAccount[]>(clientId, `${ConstantApi.ClientApiBankAccount}/GetBankAccountsForClient`);
  }

  addBankAccount(bankAccount: BankAccount): Observable<number> {
    return this.commonService.add<BankAccount>(bankAccount, `${ConstantApi.ClientApiBankAccount}`);
  }

  editBankAccount(bankAccount: BankAccount): Observable<boolean> {
    return this.commonService.edit<BankAccount>(bankAccount, `${ConstantApi.ClientApiBankAccount}`);
  }

  removeBankAccount(id: number): Observable<boolean> {
    return this.commonService.remove(id, `${ConstantApi.ClientApiBankAccount}`);
  }

  getBankAccountByType(itemType: string, itemId: number): Observable<BankAccount[]> {
    const apiUrl = `${ConstantApi.ClientApiBankAccount}/${itemType}/${itemId}`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }

  getBankAccountsByTypeFromLeads(itemType: string, itemId: number): Observable<BankAccount[]> {
    const apiUrl = `${ConstantApi.LeadApiLeadsAccount}/ByClient/${itemId}`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }

  getBankAccountsPendingApproval(): Observable<BankAccount[]> {
    const apiUrl = `${ConstantApi.ClientApiBankAccount}/GetBankAccountsPendingApproval`;
    return this.commonService.getAll<BankAccount[]>(apiUrl);
  }
}
