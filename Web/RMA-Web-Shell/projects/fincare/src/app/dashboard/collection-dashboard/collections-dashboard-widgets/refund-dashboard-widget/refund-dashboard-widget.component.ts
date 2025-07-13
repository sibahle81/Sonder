import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { RefundSummary } from 'projects/fincare/src/app/shared/models/refund-summary';
import { RefundService } from 'projects/fincare/src/app/shared/services/refund.service';

@Component({
  selector: 'refund-dashboard-widget',
  templateUrl: './refund-dashboard-widget.component.html',
  styleUrls: ['./refund-dashboard-widget.component.css']
})
export class RefundDashboardWidgetComponent implements OnInit , OnChanges {

  @Input() refresh: any;

  isLoading$ = new BehaviorSubject(true);
  refundSummary: RefundSummary[] = [];

  data: number[] = [];
  lables: any[] = [];

   public chartColors: Array<any> = [
    {
      hoverBackgroundColor: '#1FBED6',
      backgroundColor: '#ADD8E6',
      borderWidth: 2,
    }];

    options: any = { maintainAspectRatio: false };

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    this.refundService.getRefundSummaryGroupedByDate().subscribe(result => {
      this.refundSummary = result;
      this.setGraphInputs();
      this.isLoading$.next(false);
    });
  }

  setGraphInputs() {
    this.lables = [];
    this.data = [];
    this.refundSummary.forEach(s => {
      this.lables.push(this.months[s.month] + ' ' + s.year);
      this.data.push(s.amount);
    });
  }
}
