import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from 'projects/shared-services-lib/src/lib/services/common/common.service';
import { PagedRequestResult } from 'projects/shared-models-lib/src/lib/pagination/PagedRequestResult';
import { RecoveryReceipt } from '../models/recovery-receipt.model';
import { RecoveryReceiptSearchRequest } from '../models/recovery-receipt-search-request.model';

@Injectable()
export class RecoveryReceiptService {

    private apiUrl = 'fin/api/finance/RecoveryReceipt';

    constructor(
        private readonly commonService: CommonService) {
    }

    createRecoveryReceipt(recoveryReceipt: RecoveryReceipt): Observable<RecoveryReceipt> {
        return this.commonService.postGeneric<RecoveryReceipt, RecoveryReceipt>(`${this.apiUrl}/CreateRecoveryReceipt`, recoveryReceipt);
    }

    getRecoveryReceipt(recoveryReceiptId: number): Observable<RecoveryReceipt> {
        return this.commonService.postGeneric<number, RecoveryReceipt>(`${this.apiUrl}/GetRecoveryReceipt`, recoveryReceiptId);
    }

    updateRecoveryReceipt(recoveryReceipt: RecoveryReceipt): Observable<RecoveryReceipt> {
        return this.commonService.postGeneric<RecoveryReceipt, RecoveryReceipt>(`${this.apiUrl}/UpdateRecoveryReceipt`, recoveryReceipt);
    }

    getPagedRecoveryReceipts(recoveryReceiptSearchRequest: RecoveryReceiptSearchRequest): Observable<PagedRequestResult<RecoveryReceipt>> {
        return this.commonService.postGeneric<RecoveryReceiptSearchRequest, PagedRequestResult<RecoveryReceipt>>(`${this.apiUrl}/GetPagedRecoveryReceipts/`, recoveryReceiptSearchRequest);
    }
}
