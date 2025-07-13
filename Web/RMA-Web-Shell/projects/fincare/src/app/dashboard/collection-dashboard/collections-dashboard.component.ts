import { Component, OnInit } from '@angular/core';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-collections-dashboard',
  templateUrl: './collections-dashboard.component.html',
  styleUrls: ['./collections-dashboard.component.css']
})
export class CollectionsDashboardComponent implements OnInit {
  ssrsBaseUrl: string;
  reportUrl = '';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  format = 'pdf';
  tabChanged: any;

  constructor(
    private readonly lookupService: LookupService
  ) { }

  ngOnInit() {
    this.getReportParameters();
  }

  getReportParameters() {
    this.isLoading$.next(true);
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.reportUrl = 'RMA.Reports.FinCare/RMADOCRReport';
      this.isLoading$.next(false);
    });
  }

  export() {
    this.format = 'excel';
  }

  resetFormat() {
    this.format = 'pdf';
  }

  onTabChanged($event) {
    this.tabChanged = $event;
  }
}
