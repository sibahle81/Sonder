import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrManager } from 'ng6-toastr-notifications';
import { RmaBankAccount } from 'projects/fincare/src/app/billing-manager/models/rmaBankAccount';
import { BillingService } from 'projects/fincare/src/app/billing-manager/services/billing.service';
import { InterBankTransferService } from 'projects/fincare/src/app/billing-manager/services/interbanktransfer.service';
import { ProductCrossRefTranType } from 'projects/fincare/src/app/finance-manager/models/productCrossRefTranType.model';
import { ProductCrossRefTranTypeService } from 'projects/fincare/src/app/finance-manager/services/productCrossRefTranType.service';
import { ChartsProductCodeEnum } from 'projects/fincare/src/app/shared/enum/charts-productcode.enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-debtor-recon-report',
  templateUrl: './debtor-recon-report.component.html',
  styleUrls: ['./debtor-recon-report.component.css']
})
export class DebtorReconReportComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  reportServerAudit: string;
  reportUrlAudit: string;
  showParametersAudit: string;
  parametersAudit: any;
  languageAudit: string;
  widthAudit: number;
  heightAudit: number;
  toolbarAudit: string;
  errors: string[] = [];
  counter = 1;

  companies: { id: number, name: string }[] = [];
  branches: { id: number, name: string }[] = [];

  form: UntypedFormGroup;
  displayEndDate: Date;
  maxDate: Date;
  showReport = false;
  isLoading = false;
  isDownloading = false;
  isAssigning = false;
  selectAll = false;
  searchText: string;
  format = 'pdf';
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  ssrsBaseUrl: string;
  hideBranches = true;
  controlNames: ProductCrossRefTranType[] = [];
  selectedCompanyNumber = 0;
  selectedBranchNumber = 0;
  productCodeId = 0;
  rmaBankAccounts: RmaBankAccount[];
  isLoadingBankAccounts$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedBankAccountId: number;
  selectedBankAccount: RmaBankAccount;
  industryClasses: Lookup[] = [];
  selectedRoleplayerIds = [];
  selectedIndustryClassId = 0;
  datasource = new MatTableDataSource<{ roleplayerId: number, finPayeNumber: string, displayName: string, industryClassId: number }>();
  displayedColumns = ['finPayeNumber', 'displayName', 'action'];
  isLoadingDebtors$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isDownLoadingReport$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly userService: UserService,
    private toastr: ToastrManager,
    private readonly productCrossRefTranTypeService: ProductCrossRefTranTypeService,
    private datePipe: DatePipe,
    private readonly interBankTransferService: InterBankTransferService,
    private readonly billingService: BillingService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    const today = new Date();
    this.maxDate = today;
    this.getCompanyNumbers();
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.ssrsBaseUrl = value;
      this.isLoading$.next(false);
    },
      error => {
        this.toastr.errorToastr(error.message);
        this.isLoading$.next(false);
      });
  }

  ngAfterViewInit() {
    this.datasource.paginator = this.paginator;
    this.datasource.sort = this.sort;
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      company: [''],
      branch: [''],
      bankAccount: []
    });
  }

  getControlNames(): void {
    this.isLoading$.next(true);
    this.productCrossRefTranTypeService.getProductCrossRefTranTypes().subscribe(controlNames => {
      const filteredControlNames = controlNames.filter(c => c.origin.includes(ChartsProductCodeEnum[ChartsProductCodeEnum.Coid].toUpperCase()) || c.origin.includes(ChartsProductCodeEnum[ChartsProductCodeEnum.Funeral].toUpperCase()));
      this.controlNames = this.getUnique([...filteredControlNames].filter(x => x.productCodeId === ChartsProductCodeEnum.Coid || x.productCodeId === ChartsProductCodeEnum.NonCoid).reverse(), 'companyNo').sort();
      if (this.controlNames && this.controlNames.length > 0) {
        this.controlNames.forEach(element => {
          this.companies.push({ id: element.companyNo, name: element.companyNo.toString() });
        });
      }
      this.isLoading$.next(false);
    });
  }

  getUnique(array, parameter) {
    const unique = array.map(e => e[parameter])
      .map((e, i, final) => final.indexOf(e) === i && i)
      .filter((e) => array[e]).map(e => array[e]);
    return unique;
  }

  companyChanged(event: any): void {
    this.selectedCompanyNumber = +event.value;
    this.getBranchesByCompanyNumber();
  }


  branchChanged(event: any): void {
    this.selectedBranchNumber = +event.value;
    this.isLoadingDebtors$.next(true);
    const startDate = this.form.get('startDate').value as Date;
    const endDate = this.form.get('endDate').value as Date;
    this.billingService.getDebtorsByCompanyBranchAndDate(this.selectedCompanyNumber, this.selectedBranchNumber, startDate, endDate).subscribe(
      (data: { roleplayerId: number, finPayeNumber: string, displayName: string, industryClassId: number }[]) => {
        if (data && data.length > 0) {
          this.datasource.data = [...data];
          this.selectedIndustryClassId = [...data][0].industryClassId;
        }
        this.isLoadingDebtors$.next(false);
      }
    );
  }

  loadReport() {
    this.showReport = false;
    this.isDownLoadingReport$.next(true);
    const value = this.form.getRawValue();
    const endDate = this.datePipe.transform(value.endDate, 'yyyy-MM-dd');
    const startDate = this.datePipe.transform(value.startDate, 'yyyy-MM-dd');
    let debtorIds = (this.selectedRoleplayerIds.length > 0) ? this.selectedRoleplayerIds.join(',') : '-1';
    this.parametersAudit = {
      startDate,
      endDate,
      branchNo: this.selectedBranchNumber,
      companyNo: this.selectedCompanyNumber,
      debtorIds,
      industryClassId: this.selectedIndustryClassId
    };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMADetailBillingPolicyRecon';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.isDownLoadingReport$.next(false);
    this.showReport = true;
  }

  downloadReport(): void {
    this.showReport = false;
    this.isDownLoadingReport$.next(true);
    const value = this.form.getRawValue();
    const endDate = this.datePipe.transform(value.endDate, 'yyyy-MM-dd');
    const startDate = this.datePipe.transform(value.startDate, 'yyyy-MM-dd');
    let debtorIds = (this.selectedRoleplayerIds.length > 0) ? this.selectedRoleplayerIds.join(',') : '-1';
    this.parametersAudit = {
      startDate,
      endDate,
      branchNo: this.selectedBranchNumber,
      companyNo: this.selectedCompanyNumber,
      debtorIds,
      industryClassId: this.selectedIndustryClassId
    };
    this.reportServerAudit = this.ssrsBaseUrl;
    this.reportUrlAudit = 'RMA.Reports.FinCare/RMADetailBillingPolicyRecon';
    this.showParametersAudit = 'true';
    this.languageAudit = 'en-us';
    this.widthAudit = 150;
    this.heightAudit = 100;
    this.toolbarAudit = 'false';
    this.format = 'excel';
    this.isDownLoadingReport$.next(false);
    this.showReport = false;
  }


  parseDate(date: Date): string {
    const dtm = new Date(date);
    const month = this.padLeft(dtm.getMonth() + 1);
    const day = this.padLeft(dtm.getDate());
    return `${dtm.getFullYear()}-${month}-${day}`;
  }

  padLeft(value: number): string {
    let result = `0${value}`;
    result = result.substring(result.length - 2);
    return result;
  }

  completeDownload(event: any): void {
    this.isDownloading = !event;
  }

  getRmaBankAccounts() {
    this.isLoadingBankAccounts$.next(true);
    this.interBankTransferService.getRmaBankAccounts().subscribe(results => {
      this.rmaBankAccounts = results;
      this.form.get('bankAccount').setValue(0);
      this.isLoadingBankAccounts$.next(false);
    }, error => { this.toastr.errorToastr(error.message); this.isLoadingBankAccounts$.next(false); });
  }

  selectedBankAccountChanged($event: { value: number; }) {
    this.selectedBankAccountId = $event.value;
    if (this.selectedBankAccountId === 0) {
      this.selectedBankAccount = null;
    } else {
      this.selectedBankAccount = this.rmaBankAccounts.find(s => s.rmaBankAccountId === this.selectedBankAccountId);
    }
  }

  debtorChecked(event: any, itemId: number) {
    if (event.checked) {
      this.selectedRoleplayerIds.push(itemId);
    } else {
      this.unTickDebtorItem(itemId);
    }
  }

  unTickDebtorItem(itemId: number) {
    for (let i = 0; i < this.selectedRoleplayerIds.length; i++) {
      if ((this.selectedRoleplayerIds[i] === itemId)) {
        this.selectedRoleplayerIds.splice(i, 1);
        break;
      }
    }
  }

  getCompanyNumbers() {
    this.billingService.getCompanies().subscribe(
      (data: { companyNumber: number, companyName: string }[]) => {
        if (data && data.length > 0) {
          [...data].sort((a, b) => a.companyNumber - b.companyNumber).forEach(item => {
            if (this.companies.findIndex(c => c.id === item.companyNumber) < 0)
              this.companies.push({ id: item.companyNumber, name: item.companyNumber.toString() });
          });
        }
      }
    );
  }

  getBranchesByCompanyNumber() {
    this.billingService.getBrachesByCompany(this.selectedCompanyNumber).subscribe(
      (data: { branchNumber: number, branchName: string }[]) => {
        if (data && data.length > 0) {
          [...data].forEach(item => {
            if (this.branches.findIndex(c => c.id === item.branchNumber) < 0)
              this.branches.push({ id: item.branchNumber, name: item.branchNumber.toString() });
          });;
        }
      }
    );
  }

  refresh() {
    this.form.reset();
    this.datasource.data = [];
  }
}
