import { KeyValue } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-view-remittance-report',
  templateUrl: './view-remittance-report.component.html',
  styleUrls: ['./view-remittance-report.component.css']
})
export class ViewRemittanceReportComponent {

  paymentId: any;
  reportTitle: string;
  reportUrl: string;
  parameters: KeyValue<string, string>[];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.paymentId = data.Id;
    this.reportTitle = data.ReportTitle;
    this.reportUrl = data.ReportUrl;
    if (this.reportTitle === 'Under Payment' || this.reportTitle === 'Non Payment') {
      this.setParameters([{key: 'StartDate', value: data.StartDate}, {key: 'EndDate', value: data.EndDate}]);
    } else {
      this.setParameters([{key: 'PaymentId', value: data.Id}]);
    }
  }

  setParameters(event: KeyValue<string, string>[]) {
    if (!this.parameters) {
      this.parameters = [];
      this.parameters = event;
    } else {

      event.forEach(parameter => {
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

}
