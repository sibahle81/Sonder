import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CancellationSummary } from 'projects/fincare/src/app/shared/models/cancellation-summary';
import { PolicyService } from 'projects/fincare/src/app/shared/services/policy.service';

@Component({
  selector: 'cancellations-by-month-dashboard-widget',
  templateUrl: './cancellations-by-month-dashboard-widget.component.html',
  styleUrls: ['./cancellations-by-month-dashboard-widget.component.css']
})
export class CancellationsByMonthDashboardWidgetComponent implements OnInit, OnChanges {

  @Input() refresh: any;

  isLoading$ = new BehaviorSubject(true);
  cancellationSummary: CancellationSummary[] = [];

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
    private readonly policyService: PolicyService
  ) { }

  ngOnInit() {
    this.getCancellationsSummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCancellationsSummary();
  }

  getCancellationsSummary() {
    this.isLoading$.next(true);
    this.policyService.getCancellationsSummaryPerMonth().subscribe(result => {
      this.cancellationSummary = result;
      this.setGraphInputs();
      this.isLoading$.next(false);
    });
  }

  setGraphInputs() {
    this.lables = [];
    this.data = [];
    this.cancellationSummary.forEach(s => {
      this.lables.push(this.months[s.month] + ' ' + s.year);
      this.data.push(s.count);
    });
  }
}
