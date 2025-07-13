import { formatDate } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RefundSummary } from 'projects/fincare/src/app/shared/models/refund-summary';
import { RefundService } from 'projects/fincare/src/app/shared/services/refund.service';

@Component({
  selector: 'refund-dashboard-reason-widget',
  templateUrl: './refund-dashboard-reason-widget.component.html',
  styleUrls: ['./refund-dashboard-reason-widget.component.css']
})
export class RefundDashboardReasonWidgetComponent implements OnInit, OnChanges {

  @Input() refresh: any;

  isLoading$ = new BehaviorSubject(true);
  refundSummary: RefundSummary[] = [];

  data: number[] = [];
  lables: any[] = [];

  public chartColors: Array<any> = [
    {
      hoverBackgroundColor: ['#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6', '#1FBED6'],
      backgroundColor: ['#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6', '#ADD8E6'],
      borderWidth: 2,
    }];

  options: any = { maintainAspectRatio: false };

  constructor(
    private readonly refundService: RefundService
  ) { }

  ngOnInit() {
    this.getRefundSummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getRefundSummary();
  }

  getRefundSummary() {
    this.isLoading$.next(true);
    this.refundService.getRefundSummaryGroupedByReason().subscribe(result => {
      this.refundSummary = result;
      this.setGraphInputs();
      this.isLoading$.next(false);
    });
  }

  setGraphInputs() {
    this.lables = [];
    this.data = [];
    this.refundSummary.forEach(s => {
      if (s.reason === null) {
        this.lables.push('No reason defined');
      } else {
        this.lables.push(this.format(s.reason));
      }

      this.data.push(s.amount);
    });
  }

  format(reason: string): string {
    return reason.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }
}
