import { Component, OnInit } from '@angular/core';
import { GroupPolicySchemeSelectionComponent } from '../group-policy-scheme-selection/group-policy-scheme-selection.component';

@Component({
  templateUrl: '../group-policy-scheme-selection/group-policy-scheme-selection.component.html',
  styleUrls: ['../group-policy-scheme-selection/group-policy-scheme-selection.component.css']
})
export class GroupPolicySchemeSourceComponent extends GroupPolicySchemeSelectionComponent implements OnInit{

  ngOnInit(): void {
    this.isSourceScheme = true;
  }

  populateForm(): void {
    this.form.patchValue({
      policyId: this.model.sourcePolicyId,
      policyNumber: this.model.sourcePolicyNumber,
    });
    this.loadPolicyDetails(this.model.sourcePolicyId);
  }

  populateModel(): void {
    const values = this.form.getRawValue();
    this.model.sourcePolicyId = values.policyId;
    this.model.sourcePolicyNumber = values.policyNumber;
  }
}
