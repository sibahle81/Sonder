import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-child-allocation-results',
  templateUrl: './child-allocation-results.component.html',
  styleUrls: ['./child-allocation-results.component.css']
})
export class ChildAllocationResultsComponent implements OnInit {
  reportUrl: string;
  parameters: KeyValue<string, string>[];
  selectedReport: any;
  fileId = 0;

  reports = [
    { key: 'Recon Report', value: 'RMA.Reports.FinCare/ChildAllocationReconReport' },
    { key: 'Allocations Report', value: 'RMA.Reports.FinCare/PremiumListingPaymentResults' },
    { key: 'Exceptions Report', value: 'RMA.Reports.FinCare/ChildAllocationExceptionReport' },
    { key: 'Premium Listing Report', value: 'RMA.Reports.FinCare/PremiumListingFileReport'  }    
  ];

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.fileId = params.id ? +params.id : 0;
    });
    let parameter = [{ key: 'FileId', value: this.fileId.toString() }];
    this.setParameters(parameter);
  }

  constructor(private activatedRoute: ActivatedRoute) { }

  reportSelected($event: any) {
    this.selectedReport = $event;
    this.reportUrl = this.selectedReport.value;
    this.reset();
  }

  setParameters($event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = $event;
    } else {
      $event.forEach(parameter => {
        const index = this.parameters.findIndex(s => s.key == parameter.key);
        if (index > -1) {
          this.parameters[index] = parameter;
        } else {
          this.parameters.push(parameter);
        }
      });
      const item = [...this.parameters];
      this.parameters = null;
      this.parameters = item;
    }
  }

  reset() {
    let parameter = [{ key: 'fileId', value: this.fileId.toString() }];
    this.setParameters(parameter);
  }
}
