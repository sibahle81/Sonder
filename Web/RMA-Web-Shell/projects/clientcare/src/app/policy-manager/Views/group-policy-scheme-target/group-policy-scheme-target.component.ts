import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GroupPolicySchemeSelectionComponent } from '../group-policy-scheme-selection/group-policy-scheme-selection.component';

@Component({
  templateUrl: '../group-policy-scheme-selection/group-policy-scheme-selection.component.html',
  styleUrls: ['../group-policy-scheme-selection/group-policy-scheme-selection.component.css']
})
export class GroupPolicySchemeTargetComponent extends GroupPolicySchemeSelectionComponent implements OnInit{

  ngOnInit(): void {
    this.isSourceScheme = false;
  }

  populateForm(): void {
    this.form.patchValue({
      policyId: this.model.destinationPolicyId,
      policyNumber: this.model.destinationPolicyNumber,
    });
    this.loadPolicyDetails(this.model.destinationPolicyId);
  }

  populateModel(): void {
    const values = this.form.getRawValue();
    this.model.destinationPolicyId = values.policyId;
    this.model.destinationPolicyNumber = values.policyNumber;
  }

}
