import { KeyValue } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-bundle-raise-collections',
  templateUrl: './bundle-raise-collections.component.html',
  styleUrls: ['./bundle-raise-collections.component.css']
})
export class BundleRaiseCollectionsComponent implements OnInit {

  reports = [
    { key: 'Bundle Raise Report', value: 'RMA.Reports.ClientCare.Member/Collections/RMABundleRaiseReport' },
    { key: 'Member Collections Report', value: 'RMA.Reports.ClientCare.Member/Collections/RMAMemberCollectionsReport' }
  ];

  standardFiltersExpanded: boolean;
  advancedFiltersExpanded: boolean;

  selectedReport: any;
  triggerReset: boolean;

  selectedDebtor: RolePlayer;

  reportUrl: string;
  parameters: KeyValue<string, string>[];

  constructor() {
  }
  ngOnInit(): void {
   
  }

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
    this.selectedDebtor = null;
    this.parameters = null;
    this.triggerReset = !this.triggerReset;
  }

  setDebtor($event: RolePlayer) {
    this.advancedFiltersExpanded = false;
    this.selectedDebtor = $event;
    const parameter = [{ key: 'RolePlayerId', value: $event.rolePlayerId.toString() }]
    this.setParameters(parameter);
  }
}
