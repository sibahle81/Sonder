import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BeneficiaryBankingDetailService } from './beneficiary-banking-detail.service';
import { BeneficiaryBankDetail } from './beneficiary-bank-detail.model';

@Injectable({
  providedIn: 'root'
})
export class BeneficiaryBankingDetailDataSource extends Datasource {

  beneficiaryBankAccounts: any;
  bankaccounts: any[];


  constructor(
    appEventsManager: AppEventsManager,
    alertService: AlertService,
    private BenBankingDetailService: BeneficiaryBankingDetailService) {
    super(appEventsManager, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(policyId: number): void {
    this.isLoading = true;
    // this is getting all the beneficiaries and their bank details
    this.BenBankingDetailService.GetBeneficiariesAndBankingDetails(policyId).subscribe(results => {
      this.beneficiaryBankAccounts = results;
      if (results.length > 0) {
        results.forEach(a => this.bankaccounts = a.bankAccounts);
        this.dataChange.next(this.bankaccounts);
      }
      this.stopLoading();
      this.isLoading = false;
    });
  }

  connect(): Observable<BeneficiaryBankDetail[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.filteredData = this.data.slice().filter((item: BeneficiaryBankDetail) => {
          const searchStr = '';
          return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
        });

        const sortedData = this.getSortedData(this.filteredData.slice());
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
        return this.renderedData;
      })
    );
  }
}
