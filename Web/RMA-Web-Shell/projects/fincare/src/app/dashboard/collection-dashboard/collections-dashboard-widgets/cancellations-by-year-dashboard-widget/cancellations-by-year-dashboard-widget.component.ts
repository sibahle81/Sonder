import { BehaviorSubject } from 'rxjs';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CancellationSummary } from 'projects/fincare/src/app/shared/models/cancellation-summary';
import { PolicyService } from 'projects/fincare/src/app/shared/services/policy.service';

@Component({
  selector: 'cancellations-by-year-dashboard-widget',
  templateUrl: './cancellations-by-year-dashboard-widget.component.html',
  styleUrls: ['./cancellations-by-year-dashboard-widget.component.css']
})
export class CancellationsByYearDashboardWidgetComponent implements OnInit, OnChanges {
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

  constructor(
    private readonly policyService: PolicyService
  ) { }

  ngOnInit() {
    this.getCancellationsSummary();
  }

  getCancellationsSummary() {
    this.isLoading$.next(true);
    this.policyService.getCancellationsSummaryPerYear().subscribe(result => {
      this.cancellationSummary = result;
      this.setGraphInputs();
      this.isLoading$.next(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getCancellationsSummary();
  }

  setGraphInputs() {
    this.lables = [];
    this.data = [];
    this.cancellationSummary.forEach(s => {
      this.lables.push(s.year);
      this.data.push(s.count);
    });
  }
}
