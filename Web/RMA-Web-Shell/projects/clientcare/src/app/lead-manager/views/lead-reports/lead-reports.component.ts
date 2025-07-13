import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';
import { Lead } from '../../models/lead';

@Component({
  selector: 'lead-reports',
  templateUrl: './lead-reports.component.html',
  styleUrls: ['./lead-reports.component.css']
})
export class LeadReportsComponent {

  reports = [
    { key: 'Lead Age Analysis Report', value: 'RMA.Reports.ClientCare.Leads/RMALeadAgeAnalysisReport_V2' },
    { key: 'Lead Status Report', value: 'RMA.Reports.ClientCare.Leads/RMALeadStatusReport_V2' },
    { key: 'Lead SLA Report', value: 'RMA.Reports.ClientCare.Leads/RMALeadSlaReport_V2' }
  ];

  selectedLead: Lead;

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

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
    this.selectedLead = null;
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

  setLead($event: Lead) {
    this.advancedFiltersExpanded = false;
    this.selectedLead = $event;
    const parameter = [{ key: 'ItemId', value: $event.leadId.toString() }]
    this.setParameters(parameter);
  }
}
