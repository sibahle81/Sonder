import { Component } from '@angular/core';

@Component({
  selector: 'report-example',
  templateUrl: './report-example.component.html'
})
export class ReportExampleComponent {
  reportServer = 'https://ssrsdev.randmutual.co.za/reportserver';
  reportUrl = 'ExampleReports/Heatmap%20Calendar';
  showParameters = 'true';
  parameters: any = {
    "ReportFolder": "ExampleReports"
    };
  language = 'en-us';
  width = 100;
  height = 100;
  toolbar = 'true';
  format = 'PDF';
}
