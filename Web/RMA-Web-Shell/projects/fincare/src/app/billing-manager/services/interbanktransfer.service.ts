import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RmaBankAccount } from '../models/rmaBankAccount';
import { RmaBankAccountTransaction } from '../models/rmaBankAccountTransaction';
import { InterBankTransfer } from '../models/interBankTransfer';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { CompanyBranchBankAccount } from '../models/company-branchBank-account';
@Injectable({
  providedIn: 'root'
})
export class InterBankTransferService {
  private interBankTransferApi = 'bill/api/billing/InterBankTransfer';

  constructor(private readonly commonService: CommonService) { }

  getRmaBankAccounts(): Observable<RmaBankAccount[]> {
    return this.commonService.getAll<RmaBankAccount[]>(`${this.interBankTransferApi}/GetBankAccounts`);
  }

  getCompanyBranchBankAccounts(): Observable<CompanyBranchBankAccount[]> {
    return this.commonService.getAll<CompanyBranchBankAccount[]>(`${this.interBankTransferApi}/GetCompanyBranchBankAccounts`);
  }

  getRmaBankAccountTransactions(rmaBankAccount: RmaBankAccount): Observable<RmaBankAccountTransaction> {
    return this.commonService.postGeneric<RmaBankAccount, RmaBankAccountTransaction>(`${this.interBankTransferApi}/GetTransactionByBank`, rmaBankAccount);
  }

  createInterBankTransferWizard(interBankTransfer: InterBankTransfer): Observable<boolean> {
    return this.commonService.postGeneric<InterBankTransfer, boolean>(`${this.interBankTransferApi}/CreateInterBankTransferWizard`, interBankTransfer);
  }

  getDebtorBankAccounts(selectedDebtorNumber: string): Observable<RmaBankAccount[]> {
    const urlQuery = encodeURIComponent(selectedDebtorNumber);
    return this.commonService.getAll<RmaBankAccount[]>(`${this.interBankTransferApi}/GetDebtorBankAccounts/${urlQuery}`);
  }
}
