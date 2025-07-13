import { Injectable } from '@angular/core';
import { Observable, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { Datasource } from 'projects/shared-utilities-lib/src/lib/datasource/datasource';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { BeneficiaryBankDetail } from '../../../../../../../shared-components-lib/src/lib/beneficiary-banking-detail/beneficiary-bank-detail.model';
import { BeneficiaryBankingDetail } from '../../../shared/entities/funeral/Beneficiary-Banking-Detail.model';

@Injectable({
  providedIn: 'root'
})

export class AddBeneficiaryBankingDetailsDataSource extends Datasource {

  filteredData: BeneficiaryBankingDetail[] = [];

  constructor(
    alertService: AlertService,
    appEventsManagerService: AppEventsManager,
    private readonly service: ClaimCareService) {
    super(appEventsManagerService, alertService);
    this.isLoading = false;
  }

  clearData(): void {
    this.dataChange.next(new Array());
  }

  getData(query: any): void {
    this.isLoading = true;
    this.service.GetBeneficiaryAndBankingDetail(query).subscribe(beneficiaryData => {
      const transformed = this.transformData(beneficiaryData);
      this.dataChange.next(transformed);
      this.stopLoading();
      this.isLoading = false;
    });
  }

  transformData(beneficiaryBankDetails: BeneficiaryBankDetail[]): any {
      let beneficiaryBankingDetail: BeneficiaryBankingDetail = null;
    const transformed: BeneficiaryBankingDetail[] = [];

    beneficiaryBankDetails.forEach(x => {
      if (x.bankAccounts.length > 0) {
        x.bankAccounts.forEach(y => {
          beneficiaryBankingDetail = {} as BeneficiaryBankingDetail;
          beneficiaryBankingDetail.accountNumber = y.accountNumber;
          beneficiaryBankingDetail.accountType = y.accountType;
          beneficiaryBankingDetail.accountId = y.id;
          beneficiaryBankingDetail.bankAccountTypeId = y.accountTypeId;
          beneficiaryBankingDetail.bankName = y.bankName;
          beneficiaryBankingDetail.beneficiaryId = x.beneficiaryId;
          beneficiaryBankingDetail.firstname = x.firstname;
          beneficiaryBankingDetail.beneficiaryTypeId = y.beneficiaryTypeId;
          beneficiaryBankingDetail.idNumber = x.idNumber;
          beneficiaryBankingDetail.insuredLifeId = x.insuredLifeId;
          beneficiaryBankingDetail.lastname = x.lastname;
          beneficiaryBankingDetail.messageText = x.messageText;
          beneficiaryBankingDetail.nameOfAccountHolder = y.nameOfAccountHolder;
          beneficiaryBankingDetail.passportNumber = x.passportNumber;
          beneficiaryBankingDetail.universalBranchCode = y.universalBranchCode;
          beneficiaryBankingDetail.haveAllDocumentsAccepted = y.haveAllDocumentsAccepted;
          beneficiaryBankingDetail.isWizardCompleted = y.isWizardCompleted;
          beneficiaryBankingDetail.reason = y.reason;
          beneficiaryBankingDetail.isApproved = y.isApproved;

          transformed.push(beneficiaryBankingDetail);
        });
      } else {
        beneficiaryBankingDetail = {} as BeneficiaryBankingDetail;
        beneficiaryBankingDetail.beneficiaryId = x.beneficiaryId;
        beneficiaryBankingDetail.firstname = x.firstname;
        beneficiaryBankingDetail.beneficiaryTypeId = x.beneficiaryTypeId;
        beneficiaryBankingDetail.idNumber = x.idNumber;
        beneficiaryBankingDetail.insuredLifeId = x.insuredLifeId;
        beneficiaryBankingDetail.lastname = x.lastname;
        beneficiaryBankingDetail.messageText = x.messageText;
        beneficiaryBankingDetail.passportNumber = x.passportNumber;
        transformed.push(beneficiaryBankingDetail);
      }
    });
    return transformed;
  }

  connect(): Observable<BeneficiaryBankDetail[]> {
    const displayDataChanges = [
      this.dataChange,
      this.sort.sortChange,
      this.filterChange,
      this.paginator.page
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      this.filteredData = this.data.slice();
      if (this.filteredData.length !== 0) {
        const sortedData = this.filteredData.slice();
        this.renderedData = sortedData;
      }
      const sortedData = this.getSortedData(this.filteredData.slice());
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      this.renderedData = sortedData.splice(startIndex, this.paginator.pageSize);
      return this.renderedData;
    }));
  }
}
