import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig} from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BrokerPolicyDocumentsComponent } from '../broker-policy-documents/broker-policy-documents.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/security/user.model';
import { MemberPortalBrokerService } from '../../member/services/member-portal-broker-service';
import { Policy } from 'src/app/shared/models/policy';
import { PolicyPaymentFrequencyEnum } from 'src/app/shared/enums/policy-payment-frequency.enum';
import { PaymentMethodEnum } from 'src/app/shared/enums/payment-method-enum';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';
import { MatRadioChange } from '@angular/material/radio';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { ReportsUrlConstants } from 'src/app/shared/constants/reports-url-constants';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { Router } from '@angular/router';
import { BrokerPolicyEmailAuditComponent } from '../broker-policy-email-audit/broker-policy-email-audit.component';
import { BrokerPolicySmsAuditComponent } from '../broker-policy-sms-audit/broker-policy-sms-audit.component';
import { PolicyDetailsDocumentComponent } from '../policy-details-document/policy-details-document.component';
import { MaintainPolicyDocumentsComponent } from '../maintain-policy-documents/maintain-policy-documents.component';
import { WizardService } from 'src/app/shared/components/wizard/shared/services/wizard.service';
import { UserLoginTypeEnum } from 'src/app/shared/enums/user-login-type.enum';
import { Wizard } from 'src/app/shared/models/wizard.model';
import { UserService } from 'src/app/core/services/user.service';
import { WizardStatus } from 'src/app/shared/enums/wizard-status.enum';
import { BrokerPolicyService } from '../services/broker-policy-service';

@Component({
  selector: 'app-broker-policy-list',
  templateUrl: './broker-policy-list.component.html',
  styleUrls: ['./broker-policy-list.component.scss']
})
export class BrokerPolicyListComponent implements OnInit {

  displayedColumns: string[] = ['policyNumber', 'policyOwner.displayName', 'policyStatus', 'policyInceptionDate', 'expiryDate', 'cancellationDate',
    'installmentPremium', 'paymentFrequency', 'paymentMethod', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public dataSource = new MatTableDataSource<Policy>();
  public menus: { title: string; url: string; disable: boolean }[];
  public startDate: Date;
  public endDate: Date;
  public start: any;
  public end: any;
  public paymentEnum = PolicyPaymentFrequencyEnum;
  public policyStatusEnum = PolicyStatus;
  public paymentMethodEnum = PaymentMethodEnum;
  public brokerageId: number;
  public placeHolder = 'Search by Policy Number or Name';
  public searchText;
  public reportName = ConstantPlaceholder.reportName;
  public maxDate: Date;
  public searchContainsNothing = true;
  public hidePaginator = false;
  wizardConfigIds = ConstantPlaceholder.BrokerMaintainCaseConfigs;

  // Report fields
  public reportUrlAudit: string;
  public selectedReportFormat: string;
  public reportFormats: string[] = ['PDF', 'EXCEL'];
  public errors: string[] = [];
  public showReport = false;
  public isDownloading = false;
  public isViewCommission = false;
  public parametersAudit: any;
  public reportServerAudit: string;
  public showParametersAudit: string;
  public languageAudit: string;
  public widthAudit: number;
  public heightAudit: number;
  public toolbarAudit: string;
  public formatAudit: string;
  public isDownload: string;
  public downloadMessage: string;
  public baseUrl: any;

  public startDt: FormControl;
  public endDt: FormControl;

  constructor(
    public readonly dialog: MatDialog,
    private readonly authService: AuthService,
    private readonly memberPortalBrokerService: MemberPortalBrokerService,
    public readonly lookupService: LookupService,
    private readonly wizardService: WizardService,
    private readonly brokerPolicyService: BrokerPolicyService,
    public readonly alertService: AlertService,
    public readonly router: Router,
    public datePipe: DatePipe,
  ) {
    this.dataSource.filterPredicate = (data, filter) =>
    (data.clientName.trim().toLowerCase().indexOf(filter.trim().toLowerCase()) !== -1 ||
      data.policyNumber.trim().toLowerCase().indexOf(filter.trim().toLowerCase()) !== -1);
    this.startDate = new Date();
    this.startDate.setMonth(this.startDate.getMonth() - 3);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
    this.startDt = new FormControl(this.startDate);

    this.endDate = new Date();
    this.endDt = new FormControl(this.endDate);
    const tempEndDate = new Date();
    tempEndDate.setDate(tempEndDate.getDate() + 1);
    this.end = this.datePipe.transform(tempEndDate, 'yyyy-MM-dd');
  }

  policyId = 0;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  currentUser: string;
  currentUserObject: User;
  policies: Policy[];
  loggedInUserId: number;
  message = 'No Policies Available';
  hide = true;

  ngOnInit(): void {
    this.maxDate = new Date();
    this.isDownload = 'true';
    this.isLoading$.next(true);
    this.currentUser = this.authService.getUserEmail();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.getBaseUrl();
    this.getMemberPolicies(this.loggedInUserId);
  }

  getMemberPolicies(userId: number) {
    this.memberPortalBrokerService.search(1, 5,'PolicyNumber','asc',userId.toString()).subscribe((result) => {
      if (result.data.length > 0) {
        this.dataSource.data = result.data;
        this.brokerageId = this.dataSource.data[0].brokerageId;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });

        this.searchContainsNothing = false;
        this.isLoading$.next(false);
      } else {
        this.hide = false;
        this.isLoading$.next(false);
      }
    }, error => {
      this.error(error);
      this.router.navigateByUrl('/');
    });
  }

  filterMenu(item: any) {
    this.menus = null;
    this.menus = [
      { title: ConstantPlaceholder.viewDocumentsAction, url: '', disable: true },
      { title: ConstantPlaceholder.viewPolicyDetailsAction, url: '', disable: true },
      { title: ConstantPlaceholder.viewPolicyEmailDetailsAction, url: '', disable: true },
      { title: ConstantPlaceholder.viewPolicySMSDetailsAction, url: '', disable: true },
      { title: ConstantPlaceholder.viewUploadPolicyDocumentsAction, url: '', disable: false },
      { title: ConstantPlaceholder.viewPolicyDocumentAction, url: '', disable: true },
      { title: ConstantPlaceholder.UpdatePolicyDetails, url: '', disable: true },
    ];
  }

  onMenuSelect(item: any, title: any) {
    if (title === ConstantPlaceholder.viewDocumentsAction) {
      this.isViewCommission = false;
      this.openDocumentDialog(this.isViewCommission, item.policyId);
    }
    if (title === ConstantPlaceholder.viewPolicyDetailsAction) {
      this.router.navigateByUrl(`policy-details/${item.policyId}`);
    }
    if (title === ConstantPlaceholder.viewPolicyEmailDetailsAction) {
      this.openEmailAuditDialog(item);
    }
    if (title === ConstantPlaceholder.viewPolicySMSDetailsAction) {
      this.openSMSAuditDialog(item);
    }
    if (title === ConstantPlaceholder.viewPolicyDocumentAction) {
      this.openPolicyDetailsDocumentDialog(item.policyId);
    }
    if (title === ConstantPlaceholder.UpdatePolicyDetails) {

      let actionCanOccur = this.checkIfActionCanOccurOnPolicy(item.policyStatusId);
      if (actionCanOccur) {
        this.CheckIfCaseAlreadyExist(this.wizardConfigIds, item)
      } else {
        switch (item.policyStatusId) {
          case PolicyStatus.Active:
            this.alertService.loading(ConstantPlaceholder.PolicyNotActive);
            break;
          case PolicyStatus.PendingFirstPremium:
            this.alertService.loading(ConstantPlaceholder.PolicyPendingFirstPremium);
            break;
          case PolicyStatus.PendingCancelled:
            this.alertService.loading(ConstantPlaceholder.PolicyPendingOrCancelled);
            break;
          case PolicyStatus.Cancelled:
            this.alertService.loading(ConstantPlaceholder.PolicyCancelled);
            break;
        }
      }
    }
  }

  CheckIfCaseAlreadyExist(wizardConfigIds: string, policy: Policy): void {
    this.isLoading$.next(true);
    this.wizardService.GetPortalWizardsByConfigIdsAndCreatedBy(wizardConfigIds, this.currentUserObject.email).subscribe(
      data => {
        if (data) {
          let wizard = data.find(d => (d.wizardStatusId === WizardStatus.InProgress
            || d.wizardStatusId === WizardStatus.AwaitingApproval
            || d.wizardStatusId === WizardStatus.Disputed) && d.linkedItemId === policy.policyId);

          if (wizard) {
            this.checkIfGroup(wizard, policy.policyNumber);

          } else { this.MaintainPolicyDocs(policy.policyNumber); }
        }
        this.isLoading$.next(false);
      });
  }


  checkIfGroup(wizard: Wizard, policyNumber: string) {
    this.brokerPolicyService.searchPoliciesForCase(policyNumber).subscribe(data => {
      if (data) {
        this.navigateToWizard(wizard, data[0].isGroupPolicy);
      }
    });
  }

  navigateToWizard(wizard: Wizard, isGroupPolicy: boolean) {
    switch (wizard.wizardStatusId) {
      case WizardStatus.InProgress:
      case WizardStatus.AwaitingApproval:
      case WizardStatus.Disputed:
        let itemType;
        if (isGroupPolicy) {
          itemType = 'manage-policy-group';
        } else {
          itemType = 'manage-policy-individual';
        }
        Wizard.redirect(this.router, itemType, wizard.id);
        break;
    }
  }

  openPolicyDetailsDocumentDialog(policyId: any): void {
    this.policyId = policyId; // 21803
    const dialog = this.dialog.open(PolicyDetailsDocumentComponent, {
      width: '1200px',
      height: 'auto',
      data: { policyId, BaseUrl: this.baseUrl }
    });
    dialog.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      if (result) {

      } else { this.isLoading$.next(false); }
    });
  }

  checkIfActionCanOccurOnPolicy(statusId: number): boolean {
    return (statusId === PolicyStatus.Active
      || statusId === PolicyStatus.PendingFirstPremium
      || statusId === PolicyStatus.PendingCancelled);
  }

  openDocumentDialog(isViewCommission: boolean, policyId: any): void {
    this.policyId = policyId; // 21803
    const dialog = this.dialog.open(BrokerPolicyDocumentsComponent, {
      width: '1200px',
      height: 'auto',
      data: { policyId, isViewCommission, BaseUrl: this.baseUrl }
    });
    dialog.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      if (result) {

      } else { this.isLoading$.next(false); }
    });
  }

  openCommissionDialog(): void {
    this.isViewCommission = true;
    const dialog = this.dialog.open(BrokerPolicyDocumentsComponent, {
      width: '1200px',
      height: 'auto',
      data: {
        isViewCommission: this.isViewCommission,
        StartDate: this.start,
        EndDate: this.end,
        BrokerageId: this.brokerageId,
        BaseUrl: this.baseUrl
      }
    });
    dialog.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      if (result) {

      } else { this.isLoading$.next(false); }
    });
  }

  openEmailAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: ConstantPlaceholder.PolicyItemType,
      itemId: row.policyId
    };
    this.dialog.open(BrokerPolicyEmailAuditComponent,
      dialogConfig);
  }

  MaintainPolicyDocs(policyNumber: string): void {
    const dialog = this.dialog.open(MaintainPolicyDocumentsComponent, {
      width: '1200px',
      height: 'auto',
      data: policyNumber
    });
    dialog.afterClosed().subscribe(result => {
      this.isLoading$.next(true);
      if (result) {

      } else { this.isLoading$.next(false); }
    });
  }

  openSMSAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: ConstantPlaceholder.PolicyItemType,
      itemId: row.policyId
    };
    this.dialog.open(BrokerPolicySmsAuditComponent,
      dialogConfig);
  }

  reportFormatChange(event: MatRadioChange) {
    this.downloadMessage = '';
    this.reportUrlAudit = null;
    this.selectedReportFormat = event.value;
  }

  startDateChange(value: Date) {
    this.startDate = new Date(value);
    this.start = this.datePipe.transform(this.startDate, 'yyyy-MM-dd');
  }

  endDateChange(value: Date) {
    this.endDate = new Date(value);
    this.endDate.setDate(this.endDate.getDate());
    this.end = this.datePipe.transform(this.endDate, 'yyyy-MM-dd');
  }

  downloadReport(): void {
    if (this.selectedReportFormat) {
      this.errors = [];
      this.showReport = false;
      this.isDownloading = true;
      this.showReport = false;
      this.lookupService.getItemByKey('ssrsBaseUrl').subscribe(
        (data: any) => {
          this.parametersAudit = {
            StartDate: this.start,
            EndDate: this.end,
            BrokerageId: this.brokerageId
          };

          this.reportServerAudit = data;
          this.reportUrlAudit = ReportsUrlConstants.memberPortalCommissionStatementReportURL;
          this.showParametersAudit = 'true';
          this.languageAudit = 'en-us';
          this.widthAudit = 10;
          this.heightAudit = 10;
          this.toolbarAudit = 'false';
          this.showReport = true;
          this.isDownloading = false;
        },
        error => {
          this.alertService.error(error);
          // this.isLoading = false;
        }
      );
    } else {
      this.downloadMessage = ConstantPlaceholder.ReportDownloadMessage;
    }
  }

  error(statusMassage: string) {
    this.alertService.error(statusMassage);
  }

  searchData(searchFilter) {
    this.applyFilter(searchFilter);
  }

  fillTable(isData) {
    if (isData) {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }

  setPaginatorFilter(paginatorLength: number) {
    if (paginatorLength === 0) {
      this.searchContainsNothing = true;
      this.hidePaginator = true;
    } else {
      this.searchContainsNothing = false;
      this.hidePaginator = false;
    }
  }

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.dataSource.paginator.firstPage();

    this.setPaginatorFilter(this.dataSource.paginator.length);
  }

  clearInput() {
    this.searchText = '';
    this.applyFilter(this.searchText);
  }

  getBaseUrl() {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.baseUrl = value;
    });
  }
}
