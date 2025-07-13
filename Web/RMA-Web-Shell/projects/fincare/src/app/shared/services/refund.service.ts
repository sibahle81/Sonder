import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../../../../shared-services-lib/src/lib/services/common/common.service';
import { RefundSummary } from '../models/refund-summary';
import { RefundSummaryDetail } from '../models/refund-summary-detail';

@Injectable()
export class RefundService {
  private refundHeaderApiUrl = 'fin/api/Finance/RefundHeader';
  constructor(private readonly commonService: CommonService) { }

  getRefundSummaryGroupedByDate(): Observable<RefundSummary[]> {
    return this.commonService.getAll<RefundSummary[]>(`${this.refundHeaderApiUrl}/GetRefundSummaryGroupedByDate`);
  }

  getRefundSummaryGroupedByReason(): Observable<RefundSummary[]> {
    return this.commonService.getAll<RefundSummary[]>(`${this.refundHeaderApiUrl}/GetRefundSummaryGroupedByReason`);
  }

  getRefundSummaryDetails(): Observable<RefundSummaryDetail[]> {
    return this.commonService.getAll<RefundSummaryDetail[]>(`${this.refundHeaderApiUrl}/GetRefundSummaryDetails`);
  }
}
