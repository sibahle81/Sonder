import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MemberPortalBrokerService } from 'src/app/member/services/member-portal-broker-service';
import { PolicyListDataSource } from './policy-list.datasource';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { ConstantPlaceholder } from 'src/app/shared/constants/constant-placeholder';
import { PolicyStatus } from 'src/app/shared/enums/policy-status.enum';
import { WizardStatus } from 'src/app/shared/enums/wizard-status.enum';
import { LookupService } from 'src/app/shared/services/lookup.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { PolicyDetailsDocumentComponent } from '../../policy-details-document/policy-details-document.component';
import { WizardService } from 'src/app/shared/components/wizard/shared/services/wizard.service';
import { Policy } from 'src/app/shared/models/policy';
import { User } from 'src/app/core/models/security/user.model';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Wizard } from 'src/app/shared/models/wizard.model';
import { BrokerPolicyService } from '../../services/broker-policy-service';
import { MaintainPolicyDocumentsComponent } from '../../maintain-policy-documents/maintain-policy-documents.component';
import { BrokerPolicyDocumentsComponent } from '../../broker-policy-documents/broker-policy-documents.component';
import { BrokerPolicyEmailAuditComponent } from '../../broker-policy-email-audit/broker-policy-email-audit.component';
import { BrokerPolicySmsAuditComponent } from '../../broker-policy-sms-audit/broker-policy-sms-audit.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { PaymentMethodEnum } from 'src/app/shared/enums/payment-method-enum';
import { PolicyPaymentFrequencyEnum } from 'src/app/shared/enums/policy-payment-frequency.enum';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentStatusEnum } from 'src/app/shared/enums/document-status.enum';
import { PolicyDocumentsUploadComponent } from '../../policy-documents-upload/policy-documents-upload.component';

@Component({
  selector: 'policy-list',
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.scss']
})
export class PolicyListComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  displayedColumns: string[] = ['policyNumber', 'clientName', 'policyStatus', 'policyInceptionDate', 'expiryDate', 'cancellationDate',
    'installmentPremium', 'paymentFrequency', 'paymentMethod' ,'affordabilityCheckPassed', 'actions'];
  currentQuery: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public paymentMethodEnum = PaymentMethodEnum;
  public paymentEnum = PolicyPaymentFrequencyEnum;
  public policyStatusEnum = PolicyStatus;
  public isLoading = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('filter') filter: ElementRef;
  public dataSource: PolicyListDataSource;
  public menus: { title: string; url: string; disable: boolean }[];
  public isViewCommission = false;
  wizardConfigIds = ConstantPlaceholder.BrokerMaintainCaseConfigs;
  currentUserObject: User;
  policyId=0;
  public baseUrl: any;
  loggedInUserId: number;

  public policyDataSource = new MatTableDataSource<Policy>();

  constructor(
    public readonly memberPortalBrokerService: MemberPortalBrokerService,
    public readonly lookupService: LookupService,
    private readonly wizardService: WizardService,
    private readonly brokerPolicyService: BrokerPolicyService,
    public readonly dialog: MatDialog,
    private readonly authService: AuthService,
    public readonly alertService: AlertService,
    private readonly router: Router) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.getBaseUrl();
    this.currentUserObject = this.authService.getCurrentUser();
    this.loggedInUserId = this.currentUserObject.id;
    this.dataSource = new PolicyListDataSource(this.memberPortalBrokerService);
    this.dataSource.getData(1, 5, 'policyNumber', 'asc', this.loggedInUserId.toString());
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => {
          this.policyDataSource.filter = '';
          this.currentQuery = this.filter.nativeElement.value;
          if (this.currentQuery.length >= 3) {
            this.paginator.pageIndex = 0;
            this.loadData();
            this.policyDataSource.filter = this.currentQuery.toLowerCase();
          }
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadData())
      )
      .subscribe();

    this.dataSource.havePolicies$.subscribe(result => {
      if (result) {
        this.policyDataSource.data = this.dataSource.policies;
        this.policyDataSource.paginator = this.paginator;
        this.policyDataSource.sort = this.sort;
        this.isLoading = false;
      }
    })

    
  }

  search() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  getBaseUrl() {
    this.lookupService.getItemByKey('ssrsBaseUrl').subscribe((value: any) => {
      this.baseUrl = value;
    });
  }

  getData(userId: number) {
    this.dataSource.getData(0, 5, 'PolicyNumber', 'asc', userId.toString());
  }

  loadData(): void {
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction = 'asc', this.loggedInUserId.toString());
  }

  filterMenu(item: any) {
    this.menus = null;
    switch (item.policyStatus) {
      case PolicyStatus.Paused:
      case PolicyStatus.NotTakenUp:
      case PolicyStatus.Cancelled:
        this.menus = [
          { title: ConstantPlaceholder.viewDocumentsAction, url: '', disable: true },
          { title: ConstantPlaceholder.viewPolicyDetailsAction, url: '', disable: true },
          { title: ConstantPlaceholder.viewPolicyEmailDetailsAction, url: '', disable: true },
          { title: ConstantPlaceholder.viewPolicySMSDetailsAction, url: '', disable: true },
          { title: ConstantPlaceholder.viewUploadPolicyDocumentsAction, url: '', disable: false },
          { title: ConstantPlaceholder.viewPolicyDocumentAction, url: '', disable: true },
          { title: ConstantPlaceholder.UpdatePolicyDetails, url: '', disable: true },
        ];
        break;
      default:
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
    if (title === ConstantPlaceholder.viewUploadPolicyDocumentsAction) {
      this.openUploadPolicyDocumentsDialog(item.policyId);
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

  checkIfActionCanOccurOnPolicy(statusId: number): boolean {
    return (statusId === PolicyStatus.Active
      || statusId === PolicyStatus.PendingFirstPremium
      || statusId === PolicyStatus.PendingCancelled);
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

  checkIfGroup(wizard: Wizard, policyNumber: string) {
    this.brokerPolicyService.searchPoliciesForCase(policyNumber).subscribe(data => {
      if (data) {
        this.navigateToWizard(wizard, data[0].isGroupPolicy);
      }
    });
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

  openDocumentDialog(isViewCommission: boolean, policyId: any): void {
    this.policyId = policyId;
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
  openUploadPolicyDocumentsDialog( policyId: any): void {
    this.policyId = policyId;
    const dialog = this.dialog.open(PolicyDocumentsUploadComponent, {
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

  sortData(data: Policy[]): Policy[] {
    if (!this.sort.active || this.sort.direction === '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this.sort.active) {
        case 'policyNumber': [propertyA, propertyB] = [a.policyNumber, b.policyNumber]; break;
        case 'clientName': [propertyA, propertyB] = [a.clientName, b.clientName]; break;
        case 'policyStatus': [propertyA, propertyB] = [a.policyStatus, b.policyStatus]; break;
        case 'policyInceptionDate': [propertyA, propertyB] = [a.policyInceptionDate.toDateString(), b.policyInceptionDate.toDateString()]; break;
        case 'expiryDate': [propertyA, propertyB] = [a.expiryDate.toDateString(), b.expiryDate.toDateString()]; break;
        case 'cancellationDate': [propertyA, propertyB] = [a.cancellationDate.toDateString(), b.cancellationDate.toDateString()]; break;
        case 'installmentPremium': [propertyA, propertyB] = [a.installmentPremium, b.installmentPremium]; break;
        case 'paymentFrequency': [propertyA, propertyB] = [a.paymentFrequency, b.paymentFrequency]; break;
        case 'paymentMethod': [propertyA, propertyB] = [a.paymentMethod, b.paymentMethod]; break;
        case 'affordabilityCheckPassed': [propertyA, propertyB] = [a.policyLifeExtension.affordabilityCheckPassed.toString(), b.policyLifeExtension.affordabilityCheckPassed.toString()]; break;
      }

      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
    });
  }
}


