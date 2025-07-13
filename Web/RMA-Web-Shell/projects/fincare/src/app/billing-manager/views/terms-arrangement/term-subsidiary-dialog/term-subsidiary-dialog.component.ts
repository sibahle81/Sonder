import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DebtorSearchResult } from 'projects/shared-components-lib/src/lib/models/debtor-search-result';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { PolicyProductCategory } from '../../../models/policy-product-category';
import { TermArrangementService } from 'projects/fincare/src/app/shared/services/term-arrangement.service';
import { TermArrangementProductOption } from '../../../models/term-arrangement-productoption';

@Component({
  selector: 'app-term-subsidiary-dialog',
  templateUrl: './term-subsidiary-dialog.component.html',
  styleUrls: ['./term-subsidiary-dialog.component.css']
})
export class TermSubsidiaryDialogComponent implements OnInit {
  selectedDebtor: DebtorSearchResult;
  roleplayerId = 0;
  rolePlayerName: string;
  finPayeNumber: string;
  expanded = true;
  isCheckingDeclarations$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  nonCompliant = false;
  datasourceProducts = new MatTableDataSource<TermArrangementProductOption>();
  isLoadingProductBalances$ = new BehaviorSubject(false);
  selectedPolicyIds: number[] = [];
  message = '';
  hasZeroBalance = false;
  productsSearched = false;
  displayedColumnsProducts = ['finPayenumber', 'productName','onActiveTerms', 'amount', 'actions'];
  isdebtorNotSelected = true;
  isPoliciesNotSelected = true;
  panelOpenStatePolicies$ = new BehaviorSubject(true);
  selectedPolicies: PolicyProductCategory[] = [];
  termArrangementProductOptions: TermArrangementProductOption[] = [];
  showSubmit = false;
  activeTermArrangementProductOptions: TermArrangementProductOption[] = [];
  retrievingActiveTermArrangementProductOptions$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(public dialogRef: MatDialogRef<TermSubsidiaryDialogComponent>
    ,private readonly termArrangementService: TermArrangementService)
     { }

  ngOnInit(): void {
  }


  onAccountSelected(debtorSearchResult: DebtorSearchResult) {
    this.roleplayerId = debtorSearchResult.roleplayerId;
    this.rolePlayerName = debtorSearchResult.displayName;
    this.finPayeNumber = debtorSearchResult.finPayeNumber;
    this.isdebtorNotSelected = false;
    this.selectedDebtor = debtorSearchResult;
  }

  submit() {
    this.dialogRef.close({ termArrangementProductOptions: this.termArrangementProductOptions, debtor: this.selectedDebtor, activeTermArrangementProductOptions: this.activeTermArrangementProductOptions });
  }

  close() {
    this.dialogRef.close(null);
  }

  getProductTotals(): number {
    const total = this.datasourceProducts.data.reduce((a, b) => a + b.contractAmount, 0).toFixed(2);
    return +total;
  }

  policiesSelected(policies: PolicyProductCategory[]) {
    this.getActiveTermArrangementsProductOptionsByRolePlayerId(this.roleplayerId);
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
      option.finPayenumber = this.selectedDebtor.finPayeNumber;
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

  validateIfRolePlayerProductIsOnActiveTermArrangement(roleplayerId: number, productOptionId: number): Boolean
  {
   if(this.activeTermArrangementProductOptions.find(x=>x.roleplayerId === roleplayerId && x.productOptionId === productOptionId))
   {
    return true;
   }
   else
   {
    return false;
   }
  }

  getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId:number)
  {
    if(this.activeTermArrangementProductOptions.find(x=>x.roleplayerId === roleplayerId) == undefined)
    {
      this.retrievingActiveTermArrangementProductOptions$.next(true);
      this.termArrangementService.getActiveTermArrangementsProductOptionsByRolePlayerId(roleplayerId).subscribe(
        res=>
        {
          this.activeTermArrangementProductOptions.push(...res);
          this.retrievingActiveTermArrangementProductOptions$.next(false);
        }
      );
    }
  }

}
