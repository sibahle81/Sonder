import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { QuoteV2 } from '../../models/quoteV2';

@Component({
  selector: 'quote-reports',
  templateUrl: './quote-reports.component.html',
  styleUrls: ['./quote-reports.component.css']
})
export class QuoteReportsComponent {

  reports = [
    { key: 'Quote Age Analysis Report', value: 'RMA.Reports.ClientCare.Quote/RMAQuoteAgeAnalysisReport_V2' },
    { key: 'Quote Status Report', value: 'RMA.Reports.ClientCare.Quote/RMAQuoteStatusReport_V2' },
    { key: 'Quote SLA Report', value: 'RMA.Reports.ClientCare.Quote/RMAQuoteSlaReport_V2' }
  ];

  selectedQuote: QuoteV2;
  advancedFiltersExpanded: boolean;
  standardFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  constructor() { }

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
    this.standardFiltersExpanded = false;
    this.advancedFiltersExpanded = false;
    this.selectedQuote = null;
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

  setQuote($event: QuoteV2) {
    this.advancedFiltersExpanded = false;
    this.selectedQuote = $event;
    const parameter = [{ key: 'ItemId', value: $event.quoteId.toString() }]
    this.setParameters(parameter);
  }
}
