import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { InterDebtorTransfer } from '../models/interDebtorTransfer';
@Injectable()
export class InterDebtorTransferService {
  private interDebtorTransferApi = 'bill/api/billing/InterDebtorTransfer';

  constructor(private readonly commonService: CommonService) { }

  submitInterDebtorTransfer(interDebtorTransfer: InterDebtorTransfer): Observable<InterDebtorTransfer> {
    return this.commonService.postGeneric<InterDebtorTransfer, InterDebtorTransfer>(`${this.interDebtorTransferApi}/InitiateTransferToDebtor`, interDebtorTransfer);
  }

  checkDebtorsHaveIdenticalIndustryClass(fromDebtorNumber: string, toDebtorNumber: string): Observable<boolean> {
    return this.commonService.getBoolean(`${this.interDebtorTransferApi}/CheckDebtorsHaveIdenticalIndustryClass/${fromDebtorNumber}/${toDebtorNumber}`);
  }

  CheckDebtorsHaveIdenticalBankAccounts(fromDebtorNumber: string, toDebtorNumber: string): Observable<boolean> {
    return this.commonService.getBoolean(`${this.interDebtorTransferApi}/CheckDebtorsHaveIdenticalBankAccounts/${fromDebtorNumber}/${toDebtorNumber}`);
  }
}
