import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RolePlayerPolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/role-player-policy.service';
import { RolePlayerPolicy } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { PolicyProductCategory } from 'projects/fincare/src/app/billing-manager/models/policy-product-category';
import { BillingService } from 'projects/fincare/src/app/billing-manager/services/billing.service';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'debtor-policies',
  templateUrl: './debtor-policies.component.html',
  styleUrls: ['./debtor-policies.component.css'],
  animations:  [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('isExpanded', style({ height: '*', visibility: 'visible' })),
      transition('isExpanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class DebtorPoliciesComponent implements OnInit {
  @Input() roleplayer: RolePlayer;
  @Output() policiesSelectedHandler = new EventEmitter<PolicyProductCategory[]>();
  @Input() multiselect: boolean = true;
  @Input() showProductBalances: boolean = false;
  
  selectedPolicyIds: number[] = [];
  selectedPolicies: PolicyProductCategory[] = [];
  displayedColumns = ['expand', 'product', 'code', 'actions'];
  datasource = new MatTableDataSource<PolicyProductCategory>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  selectedProductOptionIds: number[] = [];
  policySearchResults: PolicyProductCategory[] = [];
  policyNumbers: string[] = [];
  displayedChildTableColumns = ['policyNumber', 'product', 'code', 'actions'];
  isLoadingPolicies$ = new BehaviorSubject(false);
  isAllPoliciesSelected$ = new BehaviorSubject(false);
  panelOpenStatePolicies$ = new BehaviorSubject(true);

  constructor(private roleplayerPolicyService: RolePlayerPolicyService,
     private productOptionService: ProductOptionService,
     private readonly billingService: BillingService) { }

  ngOnInit(): void {
    if (this.showProductBalances) {
      this.displayedChildTableColumns = ['code', 'product', 'policyNumber', 'productBalance','actions'];
    }
    else {
      this.displayedChildTableColumns = ['code', 'product', 'policyNumber','actions'];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.roleplayer) {
      this.getDebtorPolicies(true);
    }
  }

  policyChecked(event: any, item: PolicyProductCategory) {
    if (!this.multiselect) {
      this.selectedPolicyIds = [];
    }
    if (event.checked) {
      if (item.categoryPolicies) {
        this.unTickCategoryPolicies(item.categoryPolicies);
        item.categoryPolicies.forEach(element => {
          this.selectedPolicyIds.push(element.policyId);
          this.selectedPolicies.push(element);
        });
      }
      if (item.policyNumber) {
        this.selectedPolicyIds.push(item.policyId);
        this.selectedPolicies.push(item);
      }
    } else {
      if (item.categoryPolicies) {
        this.unTickCategoryPolicies(item.categoryPolicies);
      }
      else {
        this.isAllPoliciesSelected$.next(false);
        this.unTickPolicyItem(item.policyId);
      }
    }
  }

  getDebtorPolicies(isInitialProductsLoad = false) {
    this.isLoadingPolicies$.next(true);
    this.billingService.getPolicyProductCategoriesByRoleplayerId(this.roleplayer.rolePlayerId).pipe(tap((data) => {
      if (data && data.length > 0) {
        this.policySearchResults = [...data];
        this.datasource.data = this.policySearchResults;
        if (this.showProductBalances) {
          this.getPolicyProductBalances(isInitialProductsLoad);
        }
      }
      this.isLoadingPolicies$.next(false);
    }
    )).subscribe();
  }

  policiesAllChecked(event: any) {
    if (event.checked) {
      this.isAllPoliciesSelected$.next(true);
      this.selectedPolicyIds = [];
      [...this.datasource.data].forEach(element => {
        if (element.categoryPolicies) {
          this.unTickCategoryPolicies(element.categoryPolicies);
          element.categoryPolicies.forEach(item => {
            this.selectedPolicyIds.push(item.policyId);
            this.selectedPolicies.push(item);
          });
        }
        if (element.policyNumber) {
          this.selectedPolicyIds.push(element.policyId);
          this.selectedPolicies.push(element);
        }
      });
    } else {
      this.selectedPolicyIds = [];
      this.selectedPolicies = [];
      this.isAllPoliciesSelected$.next(false);
    }   
  }

  getPolicyProductBalances(isInitialProductsLoad: boolean) {
    let policyIds = [];
    if (isInitialProductsLoad) {
      this.policySearchResults.forEach(c => {
        if (c.categoryPolicies && c.categoryPolicies.length === 0) {
          policyIds.push(c.policyId);
        }
        else if (c.categoryPolicies && c.categoryPolicies.length > 0) {
          c.categoryPolicies.forEach(p => policyIds.push(p.policyId));
        }
      });
    }
    else {
      policyIds = this.selectedPolicyIds;
    }
    this.billingService.getProductBalancesByPolicyIds(this.roleplayer.rolePlayerId, policyIds).pipe(
      map(data => {
        if (data && data.length > 0) {
          data.forEach(c => {
            this.datasource.data.forEach(z => {
              if (z.categoryPolicies && z.categoryPolicies.length === 0) {
                if (z.productOption && z.productOption.id === c.productOptionId)
                  z.productBalance = c.balance;
              }
              else if (z.categoryPolicies && z.categoryPolicies.length > 0) {
                z.categoryPolicies.forEach(p => {
                  if (p.productOption && p.productOption.id === c.productOptionId)
                    p.productBalance = c.balance;
                }
                );
              }
            });
          });
        }
      })
    ).subscribe();
  }

  debtorPoliciesSelected() {
    this.policiesSelectedHandler.emit(this.selectedPolicies);
  }

  remove(item: RolePlayerPolicy) {
    this.unTickPolicyItem(item.policyId);
    this.debtorPoliciesSelected();
  }

  
  unTickPolicyItem(itemId: number) {
    for (let i = 0; i < this.selectedPolicyIds.length; i++) {
      if ((this.selectedPolicyIds[i] === itemId)) {
        this.selectedPolicyIds.splice(i, 1);
        const itemIndex = this.selectedPolicies.findIndex(c => c.policyId === itemId);
        this.selectedPolicies.splice(itemIndex, 1);
        break;
      }
    }
    this.debtorPoliciesSelected();
  }

  expandCollapse(row) {
    if (row.isExpanded) {
      row.isExpanded = false;
    } else {
      row.isExpanded = true;
    }
  }

  unTickCategoryPolicies(policies: PolicyProductCategory[]) {
    policies.forEach(element => {
      for (let i = 0; i < this.selectedPolicyIds.length; i++) {
        if ((this.selectedPolicyIds[i] === element.policyId)) {
          this.selectedPolicyIds.splice(i, 1);
          const itemIndex = this.selectedPolicies.findIndex(c => c.policyId === element.policyId);
          this.selectedPolicies.splice(itemIndex, 1);
          break;
        }
      }
    });
  }

  submit(){    
    this.policiesSelectedHandler.emit(this.selectedPolicies);
    this.panelOpenStatePolicies$.next(false);
  }

}
