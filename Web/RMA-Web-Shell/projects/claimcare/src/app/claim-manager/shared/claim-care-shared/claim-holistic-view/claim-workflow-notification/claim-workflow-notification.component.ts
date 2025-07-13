import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { BehaviorSubject } from 'rxjs';
import { ClaimNotificationDialogComponent } from './claim-notification-dialog/claim-notification-dialog.component';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { Constants } from 'projects/claimcare/src/app/constants';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { RoleEnum } from 'projects/shared-models-lib/src/lib/enums/role-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ClaimReferralQueryType } from '../../../entities/claim-referral-query-type';
import { WizardConfigurationService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard-configuration.service';
import { ClaimReferralDetail } from '../../../entities/claim-referral-detail';
import { ReferralStatusEnum } from 'projects/shared-models-lib/src/lib/enums/referral-status-enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardConfiguration } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-configuration';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { ClaimNote } from '../../../entities/claim-note';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { AutorityLimitRejectNoteDialogComponent } from 'projects/admin/src/app/configuration-manager/views/authority-limits/autority-limit-reject-note-dialog/autority-limit-reject-note-dialog.component';
import { DatePipe } from '@angular/common';
import { Claim } from '../../../entities/funeral/claim.model';

@Component({
  selector: 'claim-workflow-notification',
  templateUrl: './claim-workflow-notification.component.html',
  styleUrls: ['./claim-workflow-notification.component.css'],
})
export class ClaimWorkflowNotificationComponent implements OnInit {

  @Input() personEvent: PersonEventModel;
  @Input() claim: Claim;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading referral...please wait');
  showForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  userReminderItemType: UserReminderItemTypeEnum = UserReminderItemTypeEnum.Claim;
  form: UntypedFormGroup;
  selectedUserReminder: UserReminder;
  selectedUser: User;
  scaTeamLeadUsers: User[] = [];
  currentUser: User;
  triggerReset: boolean;
  showUserSelect: boolean;
  showSelectedUser: boolean;
  suspiciousTransaction: boolean = false;
  documentSets: DocumentSetEnum[] = [];
  documentSet = [DocumentSetEnum.InvestigationReferralDocuments];
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  filterRequiredDocuments = [DocumentTypeEnum.InvestigationReferralform];
  isSuspicious: boolean = false;
  isScaTeamLead: boolean = false;
  showAdd: true;

  roleTypes: RoleEnum[];
  referralQueryTypes: ClaimReferralQueryType[];
  referralQueryType: ClaimReferralQueryType;
  selectedClaimReferralName: string;
  filterByUserId: number;
  currentQuery: any;
  filteredUsers: User[];
  users: User[];
  user: User;
  maxDate = new Date();
  showTextBox: boolean = true;
  replybtnSelected: boolean = true;
  claimReferralDetails: ClaimReferralDetail[] = [];

  wizardConfigurationName: WizardConfiguration;
  dataSource: ClaimReferralDetail[];
  menus: { title: string; url: string; disable: boolean }[];

  displayedColumns: string[] = [
    'dateCreated',
    'generatedBy',
    'message',
    'referalQueryStage',
    'userReferredTo',
    'actions'
  ];

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private userReminderService: UserReminderService,
    private formBuilder: UntypedFormBuilder,
    public userService: UserService,
    private readonly datePipe: DatePipe,
    private readonly claimCareService: ClaimCareService,
    private readonly wizardConfigurationService: WizardConfigurationService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService,
  ) {
  }

  ngOnInit(): void {
    if (this.personEvent && this.claim) {
      this.getData();
      this.createForm();
    }
  }

  getData() {
    this.roleTypes = this.ToArray(RoleEnum);
    this.currentUser = this.authService.getCurrentUser();
    this.getReferralQueryType();
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      dateCreated: [{ value: null, disabled: true }],
      referralQueryType: [{ value: null, disabled: false }, [Validators.required],],
      textMessage: [{ value: '', disabled: false }, [Validators.required, Validators.minLength(3), Validators.maxLength(500),],],
      feedbackToQueryMessage: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3), Validators.maxLength(500),],],
      referToUser: [{ value: 0, disabled: false }],
      alertDateTime: [{ value: null, disabled: false }],
      ckBoxSuspicious: [{ value: '', disabled: false }],
      ckBoxInvestigation: [{ value: '', disabled: false }],
      roleType: [{ value: null, disabled: false }, [Validators.required]],
      resolutionStatus: [{ value: '', disabled: true }],
      rateFeedback: [{ value: '', disabled: true }],
      replyToUser: [{ value: '', disabled: true }],
      feedbackDate: [{ value: null, disabled: true }],
      generatedBy: [{ value: null, disabled: true }],
    });

    this.patchForm();
    this.isLoading$.next(false);
  }

  patchForm() {

    const createdDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const dateFeedback = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');

    this.form.patchValue({
      generatedBy: this.currentUser.displayName,
      resolutionStatus: this.getQueryType(ReferralStatusEnum.Open),
      dateCreated: createdDate,
      feedbackDate: dateFeedback,
    });
  }

  readForm(): ClaimReferralDetail {
    if (!this.form) { return; }

    var referalDetails = new ClaimReferralDetail();
    referalDetails.ClaimId = this.claim.claimId;
    referalDetails.ownerId = this.currentUser.id;
    referalDetails.referralQueryTypeId = this.form.controls.referralQueryType.value.referralQueryTypeId ? this.form.controls.referralQueryType.value.referralQueryTypeId
      : this.form.controls.referralQueryType.value;
    referalDetails.referralQuery = this.form.controls.textMessage.value
    referalDetails.receivedDate = new Date();
    referalDetails.referrerUser = this.form.controls.referToUser.value.id ? this.form.controls.referToUser.value.id
      : this.form.controls.referToUser.value;
    referalDetails.contextualData = `${Constants.holisticViewUrl}${this.personEvent.eventId}/${this.personEvent.personEventId}`;
    referalDetails.referredToUserName = this.form.controls.referToUser.value.email ? this.form.controls.referToUser.value.email
      : this.form.controls.replyToUser.value;
    referalDetails.referralStatusId = this.form.controls.resolutionStatus.value ? +ReferralStatusEnum[this.form.controls.resolutionStatus.value]
      : +ReferralStatusEnum[ReferralStatusEnum.Open];
    return referalDetails;
  }

  reset() {
    this.form.reset();
    this.selectedUserReminder = null;
    this.selectedUser = new User();
    this.showForm$.next(false);
    this.triggerReset = !this.triggerReset;
  }

  cancel() {
    this.showForm$.next(false);
    this.reset();
  }

  showForm(addReferral: ClaimReferralDetail) {
    if (addReferral) {
    }
    this.showForm$.next(true);
  }

  ToArray(anyEnum: { [x: string]: any }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map((key) => anyEnum[key]);
  }

  formatText(text: string): string {
    if (text) {
      return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }
  }

  userSelected(users: User[]) {
    this.selectedUser = users[0];
    this.showSelectedUser = true;
  }

  viewUserReminder($event: UserReminder) {
    this.selectedUserReminder = $event;
    this.openUserRemindersDialog();
  }

  openUserRemindersDialog() {
    const dialogRef = this.dialog.open(ClaimNotificationDialogComponent, {
      width: '70%',
      data: {
        selectedUserReminder: this.selectedUserReminder
      }
    });
  }

  disableClickBtnSuspiciousTransaction() {
    if (this.personEvent.suspiciousTransactionStatus == SuspiciousTransactionStatusEnum.Suspicious) {
      this.suspiciousTransaction = true;
    }
  }

  setDocSetsFromEventType() {
    let isPersonalDocument = this.documentSets.some(a => a === +DocumentSetEnum.CommonPersonalDocuments)
    if (!isPersonalDocument) {
      this.documentSets.push(DocumentSetEnum.CommonPersonalDocuments);
    }
  }

  checkSuspicious(value) {
    this.isSuspicious = !value;
  }

  checkUserRole() {
    this.isScaTeamLead = this.authService.getCurrentUser().roleName == Constants.scaTeamLeadRole ? true : false;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  getUsersByRoleType(roleType: string) {
    let roleTypeName = this.formatText(roleType);
    this.userService.getUsersByRoleName(roleTypeName).subscribe(results => {
      if (results) {
        this.users = results.filter(a => a.roleId != 1);
        this.filteredUsers = results.filter(a => a.roleId);
      }
    });
  }

  onDepartmentChanged($event: any) {
    var roleType = this.form.controls.roleType.value;
    this.getUsersByRoleType(roleType);
  }

  filterByUserName($event: any) {
    this.filterByUserId = $event.value;
    this.search(this.filterByUserId.toString());
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }

  onUserKeyChange(value) {
    if (value) {
      let filter = value.toLowerCase();
      this.filteredUsers = this.setData(filter, this.filteredUsers, this.users);
    }
    else {
      this.filteredUsers = this.users;
    }
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(user => user.displayName.toLocaleLowerCase().includes(filter));
    }
  }

  getReferralQueryType() {
    this.isLoading$.next(true);
    this.claimCareService.GetClaimsReferralQueryType().subscribe(results => {
      if (results) {
        this.referralQueryTypes = results;
        this.isLoading$.next(false);
      }
    });
  }

  onReferralQueryTypeChanged($event: any) {
    const claimReferralQueryType = this.form.controls.referralQueryType.value.referralQueryTypeId;
    this.selectedClaimReferralName = $event.value.name;
    const referralQueryType = this.referralQueryTypes.filter(b => b.referralQueryTypeId === claimReferralQueryType);
    if (referralQueryType.length > 0) {
      const queryTypeId = referralQueryType[0].referralQueryTypeId;
      this.form.controls.referralQueryType.setValue(queryTypeId);
    }
  }

  save() {
    let claimReferralDetail = this.readForm();
  }

  addClaimReferral(claimReferral: ClaimReferralDetail) {
    this.isLoading$.next(true);
    this.loadingMessages$.next('Saving claim referral detail ...please wait');
    this.claimCareService.AddClaimReferralDetail(claimReferral).subscribe((result) => {
      if (result) {
        this.alertService.success('Claim referral detail created successfully');
        this.GetClaimReferralQueryType();
        this.getDataValues();
        this.isLoading$.next(false);
      }
    });
  }

  getDataValues() {
    this.isLoading$.next(true);
    this.claimCareService.GetClaimReferralDetail(this.personEvent.claims[0].claimId).subscribe(results => {
      if (results) {
        this.dataSource = results;
        this.isLoading$.next(false);
        this.showTextBox = false;
      }
      if (this.dataSource.length == 0) {
        this.showTextBox = true;
        this.replybtnSelected = true;
      }
    });
  }

  startInvestigationWizard(ConfigIds: number) {
    const startWizardRequest = new StartWizardRequest();
    var assignedToUser = this.form.controls.referToUser.value.email ? this.form.controls.referToUser.value.email
      : this.form.controls.replyToUser.value;
    this.wizardConfigurationService.getWizardConfiguration(ConfigIds).subscribe(wizard => {
      if (wizard) {
        var systemNote = 'Referral is created and sent successfully to ' + assignedToUser;
        startWizardRequest.type = wizard.name;
        startWizardRequest.data = JSON.stringify(this.personEvent);
        startWizardRequest.linkedItemId = this.personEvent.personEventId;
        startWizardRequest.lockedToUser = assignedToUser;
        this.wizardService.startWizard(startWizardRequest).subscribe(r => {
          this.alertService.success(systemNote);
        })

        this.createClaimNote(systemNote);
        this.createUserReferrals();
      }
    })
  }

  createClaimNote(note: string) {
    const claimNote = new ClaimNote();
    claimNote.personEventId = this.personEvent.personEventId;
    claimNote.text = note;
    const currentUser = this.authService.getCurrentUser();
    claimNote.createdBy = currentUser.email;
    claimNote.createdDate = new Date();
    claimNote.modifiedBy = currentUser.email;
    claimNote.modifiedDate = new Date();
    this.claimCareService.addClaimNote(claimNote).subscribe((result) => { });
  }

  getQueryType(id: number) {
    return this.formatText(ReferralStatusEnum[id]);
  }

  filterMenu(item: ClaimReferralDetail) {
    this.menus = [];
    this.menus = [
      { title: 'Reply referral', url: '', disable: false },
      { title: 'Forward referral', url: '', disable: false },
      { title: 'Accept referral', url: '', disable: false },
      { title: 'Reject referral', url: '', disable: false },
    ];
  }

  onMenuSelect(item: ClaimReferralDetail, menu: any) {
    switch (menu.title) {
      case 'Reply referral':
        this.showTextBox = true;
        this.replybtnSelected = false;
        this.form.patchValue({
          txtmessageStatus: this.getQueryType(ReferralStatusEnum.Actioned),
          replyToUser: item.createdBy,
          referToUser: item.ownerId,
          referralWizardType: item.referralQueryTypeId
        });
        break;
      case 'Forward referral':
        this.showTextBox = true;
        this.replybtnSelected = true;
        this.form.patchValue({
          txtmessageStatus: this.getQueryType(ReferralStatusEnum.Forwarded),
        });
        break;
      case 'Accept referral':
        this.showTextBox = true;
        this.replybtnSelected = true;
        this.form.patchValue({
          txtmessageStatus: this.getQueryType(ReferralStatusEnum.Accepted),
        });
        var role = new Array<string>();
        role.push(RoleEnum.FinanceManager.toString())
        this.userService.getUsersByRole(role).subscribe((users: User[]) => {
          if (users) {
            var activeUsers = users.filter(u => u.isActive == true);
            this.personEvent.claims.forEach(c => {
              this.moveClaimToNext(c.claimId, activeUsers[0].id);
            });
          }
        });
        break;
      case 'Reject referral':
        this.onRejectClaim(item.ClaimId);
        break;
    }
  }

  onRejectClaim(claimId: any) {
    const dialogRef = this.dialog.open(AutorityLimitRejectNoteDialogComponent, {
      data: claimId
    });

    dialogRef.afterClosed().subscribe(() => {
      this.isLoading$.next(true);
      this.showTextBox = true;
      this.replybtnSelected = true;
      this.form.patchValue({
        txtmessageStatus: this.getQueryType(ReferralStatusEnum.Rejected),
      });
      this.GetClaimReferralQueryType();
      this.getDataValues();
      this.isLoading$.next(false);
    });
  }

  private async moveClaimToNext(claimId: number, userID: number) {
    let claim = await this.claimCareService.GetClaim(claimId).toPromise();
    claim.workPoolId = WorkPoolEnum.ReferralPool;
    claim.assignedToUserId = userID;
    this.claimCareService.updateClaim(claim).toPromise();
  }

  GetClaimReferralQueryType() {
    this.isLoading$.next(true);
    var referralQueryTypeId = this.form.controls.referralWizardType.value.referralQueryTypeId ? this.form.controls.referralWizardType.value.referralQueryTypeId
      : this.form.controls.referralWizardType.value;
    this.claimCareService.GetClaimReferralQueryType(referralQueryTypeId).subscribe(results => {
      if (results) {
        this.isLoading$.next(false);
        this.startInvestigationWizard(results.wizardConfigurationId);
      }
    });
  }

  createUserReferrals() {
    const userReminders: UserReminder[] = [];
    const userReminder = new UserReminder();
    var referrerUser = this.form.controls.referToUser.value.id ? this.form.controls.referToUser.value.id
      : this.form.controls.referToUser.value;

    userReminder.userReminderType = UserReminderTypeEnum.SystemNotification;
    userReminder.userReminderItemType = UserReminderItemTypeEnum.ClaimReferrals;
    userReminder.text = `Claim referral is created by : ${this.authService.getCurrentUser().email} and assigned to you, Please action it`;
    userReminder.assignedToUserId = referrerUser;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    userReminders.push(userReminder);
    this.userReminderService
      .createUserReminders(userReminders)
      .subscribe((result) => {
        if (result) {
          this.isLoading$.next(false);
        }
      });
  }
}
