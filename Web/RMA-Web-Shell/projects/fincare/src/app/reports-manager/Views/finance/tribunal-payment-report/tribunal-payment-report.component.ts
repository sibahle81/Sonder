import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tribunal-payment-report',
  templateUrl: './tribunal-payment-report.component.html'
})
export class TribunalPaymentReportComponent implements OnInit {

  standardFiltersExpanded: boolean;
  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string = 'RMA.Reports.FinCare/RMATribunalPayments'; 
  parameters: KeyValue<string, string>[];

  constructor() { }

  ngOnInit() {
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
    this.standardFiltersExpanded = false;
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

}
