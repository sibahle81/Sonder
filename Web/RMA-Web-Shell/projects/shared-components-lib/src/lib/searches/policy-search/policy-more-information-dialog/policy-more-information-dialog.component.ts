import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { PolicySearchV2Component } from '../policy-search-V2.component';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  templateUrl: './policy-more-information-dialog.component.html',
  styleUrls: ['./policy-more-information-dialog.component.css']
})

export class PolicyMoreInformationDialogComponent {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  information: string;

  selectedPolicy: Policy;
  broker: string;
  scheme: string;
  relationship: string;
  parentPolicy: string;
  benefit: string;
  benefitAmount: string;
  currPremium: string;
  annualPremium: string;

  constructor(
    public dialogRef: MatDialogRef<PolicySearchV2Component>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.information) {
      this.selectedPolicy = data.policy;
      this.information = data.information;
      if (this.information) {
        this.setInformation();
      }
    }
  }

  setInformation() {
    if (this.information.length <= 0) {
      this.broker = 'No Data';
      this.scheme = 'No Data';
      this.relationship = 'No Data';
      this.parentPolicy = 'No Data';
      this.benefit = 'No Data';
      this.benefitAmount = 'No Data';
      this.currPremium = 'No Data';
      this.annualPremium = 'No Data';
    }
    else {
      const arrayData: any[] = JSON.parse(this.information);
      this.broker = arrayData[0].PolicyRecord.BrokerName;
      this.scheme = arrayData[0].PolicyRecord.SchemeName;
      this.relationship = arrayData[0].PolicyRecord.Relation;
      this.parentPolicy = arrayData[0].PolicyRecord.Parentpolicynumber;
      this.benefit = arrayData[0].PolicyRecord.BenefitName;
      this.benefitAmount = arrayData[0].PolicyRecord.BenefitAmount;
      this.currPremium = arrayData[0].PolicyRecord.CurrentPremium;
      this.annualPremium = arrayData[0].PolicyRecord.AnnualPremium;
    }
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
