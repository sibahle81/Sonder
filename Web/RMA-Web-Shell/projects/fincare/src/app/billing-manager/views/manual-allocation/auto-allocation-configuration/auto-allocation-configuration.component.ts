import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BankAccount } from 'projects/shared-models-lib/src/lib/common/bank-account';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BillingService } from '../../../services/billing.service';
import { AutoAllocationAccount } from '../../../models/auto-account-allocation';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';

@Component({
  selector: 'app-auto-allocation-configuration',
  templateUrl: './auto-allocation-configuration.component.html',
  styleUrls: ['./auto-allocation-configuration.component.css']
})
export class AutoAllocationConfigurationComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  isAllAccountsSelected$ = new BehaviorSubject(true);
  selectedAccountIds = [];
  selectedAccounts: AutoAllocationAccount[] = [];
  datasource = new MatTableDataSource<AutoAllocationAccount>();
  displayedColumns = ['accountNumber', 'accountName', 'actions'];
  backLink = '/fincare/billing-manager';
  isLoadingAccounts$ = new BehaviorSubject(false);
  isSubmittingAccounts$ = new BehaviorSubject(false);
  removedAccounts = [];

  constructor(private billingService: BillingService,
    public readonly router: Router, private readonly toastr: ToastrManager,) { }

  ngOnInit(): void {
    this.getAutoAllocationAccounts();
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  ngAfterViewInit(): void {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  getAutoAllocationAccounts() {
    this.isLoadingAccounts$.next(true);
    this.billingService.getAutoAllocationAccounts().pipe(
      map(data => {
        if (data) {
          this.datasource.data = [...data];
          this.selectedAccounts = [...data].filter(c => c.isConfigured);
          this.isLoadingAccounts$.next(false);
        }
      })
    ).subscribe();
  }

  accountChecked(event: any, item: AutoAllocationAccount) {
    if (event.checked) {
      if (item.bankAccountId) {
        this.selectedAccountIds.push(item.bankAccountId);
        this.selectedAccounts.push(item);
      }
    } else {
      this.isAllAccountsSelected$.next(false);
      this.unTickItem(item.bankAccountId);
      const itemIndex = this.selectedAccounts.findIndex(c => c.bankAccountId === item.bankAccountId);
      if (itemIndex > -1) {
        item.isConfigured = false;
        this.removedAccounts.push(item);
      }
    }
  }

  unTickItem(itemId: number) {
    for (let i = 0; i < this.selectedAccountIds.length; i++) {
      if ((this.selectedAccountIds[i] === itemId)) {
        this.selectedAccountIds.splice(i, 1);
        const itemIndex = this.selectedAccounts.findIndex(c => c.bankAccountId === itemId);
        this.selectedAccounts.splice(itemIndex, 1);
        break;
      }
    }
  }

  save() {
    this.isSubmittingAccounts$.next(true);
    this.billingService.addAllocationAccounts(this.selectedAccounts.concat(this.removedAccounts)).
      subscribe(result => {
        this.toastr.successToastr('Accounts Submitted Successfully');
        this.isSubmittingAccounts$.next(false);
        this.getAutoAllocationAccounts();
      });
  }

  back() {
    this.router.navigateByUrl(this.backLink);
  }
}
