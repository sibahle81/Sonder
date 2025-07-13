import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RefundSummaryDetail } from 'projects/fincare/src/app/shared/models/refund-summary-detail';
import { RefundService } from 'projects/fincare/src/app/shared/services/refund.service';

@Component({
  selector: 'refund-dashboard-details-widget',
  templateUrl: './refund-dashboard-details-widget.component.html',
  styleUrls: ['./refund-dashboard-details-widget.component.css']
})
export class RefundDashboardDetailsWidgetComponent implements OnInit, OnChanges {

  @Input() refresh: any;

  isLoading$ = new BehaviorSubject(true);
  refundSummaryDetails: RefundSummaryDetail[] = [];

  constructor(
    private readonly refundService: RefundService
  ) { }

  ngOnInit() {
    this.getRefundSummaryDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRefundSummaryDetails();
  }

  getRefundSummaryDetails() {
    this.isLoading$.next(true);
    this.refundService.getRefundSummaryDetails().subscribe(result => {
      this.refundSummaryDetails = result;
      this.isLoading$.next(false);
    });
  }

  format(reason: string): string {
    return reason.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
