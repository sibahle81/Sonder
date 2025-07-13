import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WorkPoolsAndUsersModel, PersonEventUpdateStatus } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/work-pool.model';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimPaymentModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/claim-payment.model';
import { StatusType } from 'projects/claimcare/src/app/claim-manager/shared/enums/status.enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { PolicyService } from 'projects/clientcare/src/app/policy-manager/shared/Services/policy.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { Case } from 'projects/clientcare/src/app/policy-manager/shared/entities/case';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { ClaimWorkpoolDataSource } from './claim-workpool.datasource';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import 'src/app/shared/extensions/string.extensions';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { CadPool } from '../../../shared/entities/funeral/cad-pool.model';
import { PersonEventType } from '../../../shared/enums/personEvent.enum';
import { ClaimNotificationAuditComponent } from '../../claim-notification-audit/claim-notification-audit.component';
import { ClaimSmsAuditComponent } from '../../claim-sms-audit/claim-sms-audit.component';
import { AllocateClaimUserComponent } from './allocate-claim-user/allocate-claim-user.component';
import { ManageClaimUserComponent } from './manage-claim-user/manage-claim-user.component';
import { ReAllocateClaimUserComponent } from './re-allocate-claim-user/re-allocate-claim-user.component';
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';

@Component({
  selector: 'app-claim-workpool',
  templateUrl: './claim-workpool.component.html',
  styleUrls: ['./claim-workpool.component.css']
})
export class ClaimWorkpoolComponent implements OnInit, OnDestroy {

  menus: { title: string, disable: boolean,hasPermission: boolean }[];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { read: ElementRef, static: true }) filter: ElementRef;
   claimsWorkPoolFeatureFlag = FeatureflagUtility.isFeatureFlagEnabled('ClaimsWorkPool141534');
  constructor(
    private readonly router: Router,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: AlertService,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly confirmservice: ConfirmationDialogsService,
    private readonly policyService: PolicyService) {
  }

  dataSource: ClaimWorkpoolDataSource;
  wizardId: number;
  loggedInUserId: number;
  selectedUserId: number = 0;
  selectedWorkPoolId: WorkPoolEnum;
  currentUser: string;
  loggedInUserRole: string;
  loggedInUserEmail: string;
  form: UntypedFormGroup;
  searchText: string = '';
  searchInput = new Subject<string>();
  
  checkedClaimsToAllocate: any[];

  buttonAccessToUser = true;
  isPolicyCancellationLoading = false;
  isCadPool = false;
  isCmcPool = false;
  isSCApool = false;
  isInvestigationPool = false;
  isEarningsAssessorPool = false;

  currentUserObject: User;
  statusEnum = StatusType;
  claimPaymentDetails: ClaimPaymentModel[];
  usersForWorkpool: WorkPoolsAndUsersModel[];
  workPoolsForUser: WorkPoolsAndUsersModel[];
  UsersForWorkPool: WorkPoolsAndUsersModel[];

  canSearchSortFilterPermission: boolean;
  canSelectWorkPool: boolean;  
  canSelectUser: boolean;
  canAllocateToUserPermission: boolean;
  canReAllocateToUserPermission: boolean;
  canManageUserPermission: boolean;
  disable_coid_vaps_e2e_claimcare = FeatureflagUtility.isFeatureFlagEnabled('Disable_COID_VAPS_E2E_ClaimCare');

  case = new Case();
  policies: Policy[];

  userWorkpoolSubscription: Subscription;
  placeHolder = 'Search by Claim Number, Policy or Life Assured';

  columnDefinitions: any[] = [
    { display: 'Select', def: 'select', show: (userUtility.hasPermission('Re-Allocate Claim to User') || userUtility.hasPermission('Allocate Claim to User'))},
    { display: 'Claim ID', def: 'claimId', show: false },
    { display: 'Case ID', def: 'caseId', show: false },
    { display: 'Claim Type ID', def: 'claimTypeId', show: false },
    { display: 'Claim Status ID', def: 'claimStatusId', show: false },
    { display: 'Assigned To UserId', def: 'assignedToUserId', show: false },
    { display: 'Work Pool Id', def: 'workPoolId', show: false },
    { display: 'User Id', def: 'userID', show: false },
    { display: 'start DateAndTime', def: 'startDateAndTime', show: false },
    { display: 'end DateAndTime', def: 'endDateAndTime', show: false },
    { display: 'Wizard User Id', def: 'wizardUserId', show: false },
    { display: 'Wizard URL', def: 'wizardURL', show: false },
    { display: 'Date', def: '[PE].[CreatedDate]', show: true },
    { display: 'Policy ID', def: '[P].[PolicyNumber]', show: true },
    { display: 'Claim Number', def: '[PE].[PersonEventId]', show: true },
    { display: 'Life Assured', def: '[RP].[DisplayName]', show: true },
    { display: 'Claim Status', def: '[ClaimStatus]', show: true },
    { display: 'Reason', def: '[ClaimStatusDisplayName]', show: true },
    { display: 'Created By', def: '[E].[CreatedBy]', show: true },
    { display: 'User Name', def: '[UserName]', show: true },
    { display: 'User SLA', def: '[UserSLAHours]', show: false },
    { display: 'Overall SLA', def: '[OverAllSLAHours]', show: false },
    { display: 'User SLA', def: '[UserSLAHours]', show: true },
    { display: 'Overall SLA', def: '[OverAllSLAHours]', show: true },
    { display: 'Last Worked On', def: '[CWU].[DisplayName]', show: true },
    { display: 'Action', def: 'actions', show: true }
  ];

  ngOnInit() {
    this.setPermissions();
      this.dataSource = new ClaimWorkpoolDataSource(this.claimCareService);
      this.currentUser = this.authService.getUserEmail();
      this.currentUserObject = this.authService.getCurrentUser();
      this.loggedInUserId = this.currentUserObject.id;
      this.loggedInUserEmail = this.currentUserObject.email;
      this.loggedInUserRole = this.currentUserObject.roleName;
      this.dataSource.clearData();
      this.selectedWorkPoolId = WorkPoolEnum.FuneralClaims;
      this.selectedUserId = 0;
      if (this.canSelectWorkPool ||  this.canSelectUser)   
      {          
        this.getUsersForWorkPool();
      }
      this.createForm();
      this.getData();

      this.checkedClaimsToAllocate = new Array();
         
  }
  getUsersForWorkPool(){
    
    this.userWorkpoolSubscription = forkJoin(
      this.claimCareService.getWorkPoolsForUser(this.loggedInUserId),

      this.claimCareService.getUsersForWorkPool(this.selectedWorkPoolId, this.loggedInUserRole, this.loggedInUserId)).subscribe(results => {
        this.workPoolsForUser = this.sanitizeClaimPermissions(results[0]),
          this.UsersForWorkPool = results[1];
      },
        (error) => {
          this.alertService.error('An error occurred while loading data');
        });
  }

  private sanitizeClaimPermissions(workpoolList: WorkPoolsAndUsersModel[]): WorkPoolsAndUsersModel[] {
    // Check if the Permission has been granted the user for the specific workpool.
    // If not granted, remove the item from the list so that the user cannot have an option to select it.
    // Else, its' cool the user should be able to select the workpool.
    let noPermissionForItemList: WorkPoolsAndUsersModel[] = [];
    workpoolList.forEach((workpool, index) => {
      if (this.getWorkPoolName(workpool.workPoolName) === this.getWorkPoolEnumName(WorkPoolEnum.CadPool)) {
        userUtility.hasPermission(workpool.workPoolName) === false ? noPermissionForItemList.push(workpool) : undefined;
      }
      else if (this.getWorkPoolName(workpool.workPoolName) === this.getWorkPoolEnumName(WorkPoolEnum.CmcPool)) {
        userUtility.hasPermission(workpool.workPoolName) === false ? noPermissionForItemList.push(workpool) : undefined;
      }
      else if (this.getWorkPoolName(workpool.workPoolName) === this.getWorkPoolEnumName(WorkPoolEnum.FatalInvestigationPool)) {
        userUtility.hasPermission(workpool.workPoolName) === false ? noPermissionForItemList.push(workpool) : undefined;
      }
      else if (this.getWorkPoolName(workpool.workPoolName) === this.getWorkPoolEnumName(WorkPoolEnum.ScaPool)) {
        userUtility.hasPermission(workpool.workPoolName) === false ? noPermissionForItemList.push(workpool) : undefined;
      }
      else if (this.getWorkPoolName(workpool.workPoolName) === this.getWorkPoolEnumName(WorkPoolEnum.EarningsAssessorPool)) {
        userUtility.hasPermission(workpool.workPoolName) === false ? noPermissionForItemList.push(workpool) : undefined;
      }
    });

    const hasPermissionToList = workpoolList.filter((el) => !noPermissionForItemList.includes(el));
    return hasPermissionToList;
  }

  private getWorkPoolName(name: string): string {
    return name.replace(/\s/g, "").toLowerCase();
  }

  private getWorkPoolEnumName(id: number): string {
    return WorkPoolEnum[id].toLowerCase();
  }

  searchData(data) {
    this.paginator.pageIndex = 0;
    this.searchInput.next(data);
  }

  ngOnDestroy(): void {
    if (this.userWorkpoolSubscription) {
      this.userWorkpoolSubscription.unsubscribe();
    }
    if(this.canSearchSortFilterPermission){
      this.searchInput.complete();
    }
  }

  filterMenu(item: any) {
    const index = item.wizardURL.lastIndexOf('/');
    this.wizardId = item.wizardURL.substring(index + 1);
    this.menus = [];
    
    this.menus =
    [
      { 
        title: 'View', 
        disable: false,
        hasPermission: userUtility.hasPermission('View Claim')
      },
      { 
        title: 'Notes', 
        disable: false,
        hasPermission: userUtility.hasPermission('View Claim Notes') 
      },
      { 
        title: 'Email Audit', 
        disable: false,
        hasPermission: userUtility.hasPermission('Email Audit') 
      },
      { 
        title: 'SMS Audit', 
        disable:false,
        hasPermission: userUtility.hasPermission('SMS Audit') 
      },
      {
        title: 'Decision',
        disable: (![this.statusEnum.Approved,this.statusEnum.AwaitingDecision,this.statusEnum.ReturnToAssessor,this.statusEnum.ReturnToAssessorAfterDeclined,this.statusEnum.Reopened,this.statusEnum.PolicyAdminCompleted,this.statusEnum.AwaitingDeclineDecision].includes(item.claimStatusId)) || (item.claimStatusId === this.statusEnum.Approved && item.lastWorkedOnUserId === this.loggedInUserId), 
        hasPermission: userUtility.hasPermission('Claim Decision')
      },
      {
        title: 'Cancel',
        disable: [this.statusEnum.Authorised,this.statusEnum.Declined,this.statusEnum.Cancelled,this.statusEnum.Paid,this.statusEnum.Unpaid,this.statusEnum.Closed,this.statusEnum.ExGratiaAuthorised].includes(item.claimStatusId),
        hasPermission: userUtility.hasPermission('Cancel Claim')
      },
      {
        title: 'Re-Open',
        disable: ![this.statusEnum.Cancelled,this.statusEnum.Closed,this.statusEnum.Declined].includes(item.claimStatusId),
        hasPermission: userUtility.hasPermission('Re-Open Claim')}, 
      {
        title: 'Close',
        disable: [this.statusEnum.Closed,this.statusEnum.Authorised,this.statusEnum.Paid,this.statusEnum.Unpaid,this.statusEnum.Declined,this.statusEnum.Cancelled,this.statusEnum.ExGratiaAuthorised].includes(item.claimStatusId),
        hasPermission: userUtility.hasPermission('Close Claim')
      },   
      { 
        title: 'Claimant Recovery', 
        disable: item.claimStatusId !== ClaimStatusEnum.Paid, 
        hasPermission: userUtility.hasPermission('Claimant Recovery')
      },
      { 
        title: 'Claim Investigation', 
        disable: false, 
        hasPermission: userUtility.hasPermission('Claim Investigation')
      },
      { 
        title: 'Policy Financial History', 
        disable: item.policyNumber === null, 
        hasPermission: userUtility.hasPermission('Policy Financial History') 
      },
      { 
        title: 'Single View History', 
        disable: item.policyNumber === null, 
        hasPermission: userUtility.hasPermission('Single View History')
      },
      { 
        title: 'Cancel policy Investigation', 
        disable: item.claimStatusId !== ClaimStatusEnum.InvestigationCompleted, 
        hasPermission: userUtility.hasPermission('Cancel policy Investigation') 
      },
      {
        title: 'Send For Investigation',
        disable: [ClaimStatusEnum.PendingInvestigations,ClaimStatusEnum.InvestigationCompleted].includes(item.claimStatusId),
        hasPermission: userUtility.hasPermission('Send For Investigation')
      },
      { 
        title: 'Repay', 
        disable: false,
        hasPermission: userUtility.hasPermission('Repay') 
      },
      { 
        title: 'Reverse Payment', 
        disable: ![this.statusEnum.Paid].includes(item.claimStatusId),
        hasPermission: userUtility.hasPermission('Reverse Payment') 
      },
      { 
        title: 'Tracing', 
        disable: ![this.statusEnum.Tracing].includes(item.claimStatusId),hasPermission: userUtility.hasPermission('Tracing') 
      }
  ];

    if (!this.disable_coid_vaps_e2e_claimcare) {
      this.menus = this.menus.filter(m => m.title !== 'Reverse Payment');
    }
  }

  enablePaymentReversal(item: any): boolean {
    if (item.claimStatusId === 14 || item.claimStatusId === 9 || item.claimStatusId === 23) {
      return false;
    } else {
      return true;
    }
  }


  allocateUserToClaim(allocateUserToClaim, item: CadPool): void {

    let valueExist = false;
        if (item !== null) {
          const assignedToUserId = item.assignedToUserId;
          if (assignedToUserId !== 0 && assignedToUserId !== null || (item.userName !== null)) {
            valueExist = true;
          }
        }

      if (valueExist === true) {
        return;
      }
      else{
        this.alertService.loading(`Allocating...`, 'Allocate', true);
        let claimId = item.claimId;
        const workPoolId = item.workPoolId;
        let nWorkPoolId = 0;
        if (workPoolId != null) {
          nWorkPoolId = workPoolId;
        }
        if (claimId == null) {
          claimId = 0;
        }
         this.claimCareService.updateClaimWithWorkPool(claimId, item.personEventId, nWorkPoolId, item.wizardId, item.claimStatusId, this.loggedInUserId).subscribe(result => {
          allocateUserToClaim;
          });
      }

    }

  onMenuSelect(item: any, title: any) {
    switch (title) {
      case 'View':
        if (item.workPoolId === WorkPoolEnum.PolicyManager && this.loggedInUserRole === 'Policy administrator') {
          this.router.navigateByUrl('clientcare/client-manager/bank-account-approval-list');
        } else if (item.workPoolId === WorkPoolEnum.Decline && this.loggedInUserRole === 'Claims Manager') {
          this.router.navigateByUrl('claimcare/claim-manager/funeral/decline-claim/' + item.id);
        } else {
          this.allocateUserToClaim('Allocate', item);
          this.router.navigateByUrl('claimcare/claim-manager/register-funeral-claim/continue/' + this.wizardId);

        }
        break;
      case 'Banking Details':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/claims-beneficiary-banking-detail/' + item.policyId + '/' + item.wizardId);
        break;
      case 'Decision': 
        this.claimCareService.GetClaimPaymentForAuthorisation(item.claimId).subscribe(detail => {
          this.claimPaymentDetails = detail;
          if (this.claimPaymentDetails != null && this.claimPaymentDetails !== undefined) {
            if (this.claimPaymentDetails['decisionId'] === 1 || this.claimPaymentDetails['decisionId'] === 4 || this.claimPaymentDetails['decisionId'] === 2 || this.claimPaymentDetails['decisionId'] === 3 || this.claimPaymentDetails['decisionId'] === 5 || this.claimPaymentDetails['decisionId'] === 6 || this.claimPaymentDetails['decisionId'] === 7) {
              if (item.claimStatusId === this.statusEnum.Repay) {
                this.router.navigateByUrl('claimcare/claim-manager/funeral/add-beneficiary-banking-details/' + item.claimId);
              } else {
                // tslint:disable-next-line: no-string-literal
                this.router.navigateByUrl('claimcare/claim-manager/funeral/claim-payment/' + item.claimId + '/' + this.claimPaymentDetails['beneficiaryId'] + '/' + this.claimPaymentDetails['rolePlayerBankingId']);
              }
            } else {
              this.router.navigateByUrl('claimcare/claim-manager/funeral/add-beneficiary-banking-details/' + item.claimId);
            }
          } else {
            this.router.navigateByUrl('claimcare/claim-manager/funeral/add-beneficiary-banking-details/' + item.claimId);
          }
          });
        break;
      case 'Reverse Payment':
        this.claimCareService.GetClaimPaymentForAuthorisation(item.claimId).subscribe(detail => {
          this.claimPaymentDetails = detail;
          if (this.claimPaymentDetails != null && this.claimPaymentDetails !== undefined) {
            this.router.navigateByUrl('claimcare/claim-manager/funeral/reverse-claim-payment/' + item.claimId + '/' + this.claimPaymentDetails['beneficiaryId'] + '/' + this.claimPaymentDetails['rolePlayerBankingId']);
          }
        });
        break;
      case 'Document Management':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/claims-document/' + item.claimId);
        break;
      case 'Notes':
        if (item.policyId > 0) {
          this.claimCareService.GetClaim(item.claimId).subscribe(result => {
            this.router.navigateByUrl('claimcare/claim-manager/claim-view/' + result.personEventId + '/' + result.policyId);
          });
        } else {
          this.router.navigateByUrl('claimcare/claim-manager/claim-notes/' + item.claimId + '/' + item.personEventReference + '/' + item.workPoolId);
        }
        break;
      case 'Email Audit':
        this.openEmailAuditDialog(item);
        // this.router.navigateByUrl('claimcare/claim-manager/funeral/cancel-claim/' + item.claimId + '/' + item.personEventId + '/' + item.policyId);
        break;
      case 'SMS Audit':
        this.openSmsAuditDialog(item);
        // this.router.navigateByUrl('claimcare/claim-manager/funeral/cancel-claim/' + item.claimId + '/' + item.personEventId + '/' + item.policyId);
        break;
      case 'Cancel':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/cancel-claim/' + item.claimId + '/' + item.personEventId + '/' + item.policyId);
        break;
      case 'Re-Open':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/reopen-claim/' + item.claimId + '/' + item.personEventId + '/' + item.policyId);
        break;
      case 'Close':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/close-claim/' + item.claimId + '/' + item.personEventId + '/' + item.policyId);
        break;
      case 'Recovery':
        this.claimCareService.GetClaimPaymentForAuthorisation(item.claimId).subscribe(detail => {
          this.claimPaymentDetails = detail;
          if (this.claimPaymentDetails != null && this.claimPaymentDetails !== undefined) {
            // tslint:disable-next-line: no-string-literal
            this.router.navigateByUrl('claimcare/claim-manager/funeral/claim-recovery/' + item.claimId + '/' + this.claimPaymentDetails['beneficiaryId'] + '/' + this.claimPaymentDetails['rolePlayerBankingId']);
          }
        });
        break;
      case 'Repay':
        this.router.navigateByUrl('claimcare/claim-manager/funeral/claim-repay/' + item.claimId);
        break;
      case 'Policy Financial History':
        this.router.navigateByUrl('/fincare/billing-manager/view-transactional');
        break;
      case 'Single View History':
        this.policyService.getPolicy(item.policyId).subscribe(result => {
          this.router.navigateByUrl('clientcare/member-manager/holistic-role-player-view/' + result.policyOwnerId);
        });
        break;
      case 'Claimant Recovery':
        this.wizardService.getWizardsByTypeAndLinkedItemId(item.personEventId, 'claimant-recovery-approval').subscribe(wizard => {
          if (wizard !== null) {
            this.router.navigateByUrl(`/claimcare/claim-manager/claimant-recovery-approval/continue/${wizard.id}`);
          } else {
            this.startRecoveryWizard(item.claimId);
          }
        });
        break;
      case 'Claim Investigation':
        this.wizardService.getWizardsByTypeAndLinkedItemId(item.personEventId, 'claims-investigation').subscribe(wizard => {
          if (wizard !== null) {
            this.router.navigateByUrl(`/claimcare/claim-manager/claims-investigation/continue/${wizard.id}`);
          } else {
            this.startInvestigation(item.personEventId);
          }
        });
        break;
      case 'Cancel policy Investigation':
        this.sendPolicyToBeCancelled(item.personEventId, item.insuredLifeId);
        break;
      case 'Send For Investigation':
        this.sendPersonEventToBeCancelled(item.personEventId);
        break;
      case 'Tracing':
        this.wizardService.getWizardsByTypeAndLinkedItemId(item.claimId, 'trace-document').subscribe(wizard => {
          if (wizard !== null) {
            this.router.navigateByUrl(`/claimcare/claim-manager/trace-document/continue/${wizard.id}`);
          } else {
            this.startTraceWizard(item.claimId);
          }
        });
        break;
    }
  }

  startTraceWizard(claimId: number): void {
    // Kick start the wizard for Recovery
    const request = new StartWizardRequest();
    request.type = 'trace-document';
    request.linkedItemId = claimId;
    this.wizardService.startWizard(request).subscribe(wizard => {
      this.router.navigateByUrl(`/claimcare/claim-manager/trace-document/continue/${wizard.id}`);
    });
  }

  openEmailAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: row.claimId != null ? 'Claim' : 'PersonEvent',
      itemId: row.claimId != null ? row.claimId : row.personEventId
    };
    this.dialog.open(ClaimNotificationAuditComponent,
      dialogConfig);
  }

  // Confiramtion on whether you want to add or not
  startRecoveryWizard(claimId: number): void {
    this.confirmservice.confirmWithoutContainer('Claimant Recovery', ` Are you sure you want to start a Claimant Recovery?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            // Kick start the wizard for Recovery
            const request = new StartWizardRequest();
            request.type = 'claimant-recovery-approval';
            request.linkedItemId = claimId;
            this.wizardService.startWizard(request).subscribe(wizard => {
              this.router.navigateByUrl(`/claimcare/claim-manager/claimant-recovery-approval/continue/${wizard.id}`);
            });
          }
        });
  }

  startInvestigation(personEventId: number): void {
    this.confirmservice.confirmWithoutContainer('Claim Investigation', ` Are you sure you want to start an investigation?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            // Kick start the wizard for Investigation
            const request = new StartWizardRequest();
            request.type = 'claims-investigation';
            request.linkedItemId = personEventId;
            this.wizardService.startWizard(request).subscribe(wizard => {
              this.router.navigateByUrl(`/claimcare/claim-manager/claims-investigation/continue/${wizard.id}`);
            });

          }
        });
  }

  sendPolicyToBeCancelled(personEventId: number, insuredLifeId: number): void {
    this.confirmservice.confirmWithoutContainer('Claim Investigation Cancel Policy', ` Are you sure you want to send Policy For cancellation?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.isPolicyCancellationLoading = true;
            this.claimCareService.getRolePlayerPolicies(insuredLifeId).subscribe(policies => {
              if (policies !== null) {
                this.policies = policies;
                // tslint:disable-next-line: forin
                for (let policy of this.policies) {
                  this.case.code = `Fraudulent Ref Number: ${personEventId.toString()}`;
                  const startWizardRequest = new StartWizardRequest();
                  startWizardRequest.type = 'cancel-policy-individual';
                  startWizardRequest.linkedItemId = policy.policyId;
                  startWizardRequest.data = JSON.stringify(this.case);
                  this.startCancelPolicyWizard(startWizardRequest, personEventId);
                }
              }
            });
          }
        });
  }

  sendPersonEventToBeCancelled(personEventId: number): void {
    this.confirmservice.confirmWithoutContainer('Claim Investigation', ` Are you sure you want to send the claim for an investigation?`,
      'Center', 'Center', 'Yes', 'No').subscribe(
        result => {
          if (result === true) {
            this.claimCareService.sendForInvestigation(personEventId).subscribe(result => {
              if (result === true) {
                this.alertService.success('Investigation request successfully sent...');
                this.getData();
              } else {
                this.alertService.error("Error while creating Wizard");
              }
            })
          }
        });
  }

  startCancelPolicyWizard(startWizardRequest: StartWizardRequest, personEventId: number) {
    this.wizardService.startWizard(startWizardRequest).subscribe(wizard => {
      this.alertService.success('Cancelation request successfully sent...');
      const personEventUpdateStatus: PersonEventUpdateStatus = {
        claimId: null,
        itemId: personEventId,
        PersonEventStatus: PersonEventType.Closed,
        itemType: 'Close Claim',
        fraudulentCase: true
      };
      this.claimCareService.updatePersonEventStatus(personEventUpdateStatus).subscribe(statusUpdated => {
        this.alertService.success('Claim Status is updated');
        this.isPolicyCancellationLoading = false;
        this.getData();
      })
    }
      // tslint:disable-next-line: no-shadowed-variable
      , error => {
        this.alertService.error(error.message);
        this.isPolicyCancellationLoading = false;
      }
    );
  }

  openSmsAuditDialog(row: any): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '1300px';
    dialogConfig.data = {
      itemType: row.claimId != null ? 'Claim' : 'PersonEvent',
      itemId: row.claimId != null ? row.claimId : row.personEventId
    };
    this.dialog.open(ClaimSmsAuditComponent,
      dialogConfig);
  }

  createForm(): void {
    if (this.form) { return; }

    this.form = this.formBuilder.group({});
    if(this.canSelectWorkPool)
      {
        this.form.addControl('filterWorkPoolId', new UntypedFormControl(WorkPoolEnum.FuneralClaims));
      } 
    if(this.canSelectUser )
      {
        this.form.addControl('filterUserId', new UntypedFormControl(0));
      }
    if(this.canSearchSortFilterPermission)
      {
        this.searchInput
        .pipe(debounceTime(1000))
        .subscribe((searchTerm: string) => {
          this.searchText = searchTerm;
          if(searchTerm.length >= 4 || searchTerm.length == 0){            
            this.getData();
          }        
        });      
      }
  }

  getDisplayedColumns(): any[] {
    return this.columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  getWorkPoolsForUser(query: any) {
    this.workPoolsForUser = new Array();
    this.claimCareService.getWorkPoolsForUser(query).subscribe(res => {
      this.workPoolsForUser = res;
    });
  }
  getData(): void {
    (this.dataSource as ClaimWorkpoolDataSource).getClaimsWorkPoolDataPaged(this.selectedWorkPoolId,this.loggedInUserId, this.selectedUserId, this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchText);    
  }
  getSortedData(){
    this.paginator.pageIndex = 0;
    this.getData();
  }
  selectedWorkPoolChanged($event: any) {   

    this.selectedUserId = 0;
    this.selectedWorkPoolId = $event.value as WorkPoolEnum;

    if(this.canSelectUser)   
      {this.form.patchValue({filterUserId: this.selectedUserId});}
    if(this.canSearchSortFilterPermission)   
      {this.searchInput.next(this.searchText);}
    else{this.getData();}    
  }
  selectedUserChanged($event: any) {
  
    this.selectedUserId = $event.value as number;

    if(this.canSearchSortFilterPermission)   
      {this.searchInput.next(this.searchText);}
    else{ this.getData(); }       
  }

  openAllocateToUsersPopup(): void {
    if (this.checkedClaimsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Allocate', true);
      return;
    }
    // ===Check if it already allocated to a user : if so then cant allocate again
    let valueExist = false;
    if (this.checkedClaimsToAllocate.length > 0) {
      for (const value of this.checkedClaimsToAllocate) {
        const index: number = this.checkedClaimsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const assignedToUserId = value.assignedToUserId;
          if (assignedToUserId !== 0 && assignedToUserId !== null || (value.userName !== null)) {
            valueExist = true;
          }
        }
      }
      if (valueExist === true) {
        this.alertService.error(`Already allocated. Cannot allocate again. Use Re-Allocate`, 'Allocate', true);
        return;
      }
    }

    // ===Check if it Claim exist
    let claimExist = true;
    if (this.checkedClaimsToAllocate.length > 0) {
      for (const value of this.checkedClaimsToAllocate) {
        const index: number = this.checkedClaimsToAllocate.indexOf(value);
        if (index % 2 !== 0) {
          const existingClaimId = value.claimId;
          if (existingClaimId === 0 || existingClaimId === null) {
            claimExist = false;
          }
        }
      }
      // if (claimExist === false) {
      //   this.alertService.error(`Cannot allocate. No claim exist`, 'Allocate', true);
      //   return;
      // }
    }

    const dialogRef = this.dialog.open(AllocateClaimUserComponent, {
      data: this.checkedClaimsToAllocate
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Allocate') {
        // this.getData(this.loggedInUserId);
        this.getData();
        this.checkedClaimsToAllocate = new Array();
      }
    });
  }

  openReAllocateToUsersPopup(): void {
    // ====Check how many items selected. if more than one than dont open popup for users to re allocate
    if (this.checkedClaimsToAllocate.length === 0) {
      this.alertService.error(`No item selected`, 'Re-Allocate', true);
      return;
    }
    if (this.checkedClaimsToAllocate.length <= 2) {
      if ((this.checkedClaimsToAllocate[1].userId === 0 || this.checkedClaimsToAllocate[1].userId === null) && this.checkedClaimsToAllocate[1].userName === null) {
        this.alertService.error(`You can only reallocate if the item is already allocated to a user`, 'Re-Allocate', true);
        return;
      } else {
        const dialogRef = this.dialog.open(ReAllocateClaimUserComponent, {
          data: this.checkedClaimsToAllocate
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'ReAllocate') {
            this.getData();
            this.checkedClaimsToAllocate = new Array();
          }
        });
      }
    } else {
      this.alertService.error(`More than one item selected`, 'Re-Allocate', true);
      return;
    }
  }

  openManageUsersPopup(): void {
    const def: any[] = [];
    const dialogRef = this.dialog.open(ManageClaimUserComponent, {
      data: this.checkedClaimsToAllocate
    });
  }

  AddCheckedItems(event, item) {
    if (event.checked === true) {
      let valueExist = false;
      for (const value of this.checkedClaimsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === false) {
        this.checkedClaimsToAllocate.push(item.id, item);
        if (item.lastWorkedOnUserId === 0 || item.lastWorkedOnUserId === undefined) {
          this.buttonAccessToUser = false;
        }
      }
    } else if (event.checked === false) {
      let valueExist = false;
      this.buttonAccessToUser = true;
      for (const value of this.checkedClaimsToAllocate) {
        if (value === item.id) {
          valueExist = true;
        }
      }
      if (valueExist === true) {
        const index: number = this.checkedClaimsToAllocate.indexOf(item.id);
        if (index !== -1) {
          this.checkedClaimsToAllocate.splice(index, 2);
        }
      }
    }
  }

  GoToClaimWizrd(item) {
    this.router.navigateByUrl(item.wizardURL);
  }

  disableIfNoClaim(item) {
    if (item.claimId === null) {
      return true;
    } else {
      return false;
    }
  }

  setPermissions(): void {
    this.canSearchSortFilterPermission = userUtility.hasPermission('Searching Sorting filtering Work-Pool');
    this.canSelectWorkPool = userUtility.hasPermission('Select Work-Pool');
    this.canSelectUser = userUtility.hasPermission('Select Work-Pool User');
    this.canAllocateToUserPermission = userUtility.hasPermission('Allocate Claim to User');
    this.canReAllocateToUserPermission = userUtility.hasPermission('Re-Allocate Claim to User');
    this.canManageUserPermission = userUtility.hasPermission('Manage Work-Pool User');
  } 
}
