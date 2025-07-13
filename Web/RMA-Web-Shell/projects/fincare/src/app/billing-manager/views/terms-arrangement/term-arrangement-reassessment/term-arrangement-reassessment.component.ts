import { Component, Inject, OnInit } from '@angular/core';
import { TermArrangementProductOption } from '../../../models/term-arrangement-productoption';
import { MatTableDataSource } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PolicyProductCategory } from '../../../models/policy-product-category';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-term-arrangement-reassessment',
  templateUrl: './term-arrangement-reassessment.component.html',
  styleUrls: ['./term-arrangement-reassessment.component.css']
})
export class TermArrangementReassessmentComponent implements OnInit {
  roleplayerId = 0;
  finPayeNumber: string;
  rolePlayerName: string;
  datasourceProducts = new MatTableDataSource<TermArrangementProductOption>();
  displayedColumnsProducts = ['finPayenumber', 'productName', 'amount', 'actions'];
  termArrangementProductOptions: TermArrangementProductOption[] = [];
  selectedPolicyIds: number[] = [];
  selectedPolicies: PolicyProductCategory[] = [];
  isLoadingProductBalances$ = new BehaviorSubject(false);
  hasZeroBalance = false;
  productsSearched = false;
  showSubmit = false;
  isPoliciesNotSelected = true;
  constructor(
    public dialogRef: MatDialogRef<TermArrangementReassessmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.roleplayerId = this.data.roleplayerId;
    this.finPayeNumber = this.data.finPayeNumber;
    this.rolePlayerName = this.data.rolePlayerName;
  }

  submit() {
    this.dialogRef.close({ termArrangementProductOptions: this.termArrangementProductOptions});
  }

  close() {
    this.dialogRef.close(null);
  }

  getProductTotals(): number {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    return +total;
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.selectedPolicyIds = [];
    this.selectedPolicies = [];
    this.selectedPolicies = policies;
    policies.forEach(c => {
      this.selectedPolicyIds.push(c.policyId);
      let option = new TermArrangementProductOption();
      option.productOptionId = c.productOption.id;
      option.contractAmount = c.productBalance;
      option.productOptionName = c.productOption.code;
      option.roleplayerId = this.roleplayerId;
      option.finPayenumber = this.finPayeNumber;
      option.policyId = c.policyId;
      if (this.termArrangementProductOptions.findIndex(d => d.productOptionId === c.productOption.id) < 0) {
        this.termArrangementProductOptions.push(option);
      }
    }
    );
    this.datasourceProducts.data = [...this.termArrangementProductOptions];

    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    if (+total === 0) {
      this.productsSearched = true;
      this.hasZeroBalance = true;
      this.showSubmit = false;
    }
    else {
      this.hasZeroBalance = false;
      this.showSubmit = true;
    }
  }
}

