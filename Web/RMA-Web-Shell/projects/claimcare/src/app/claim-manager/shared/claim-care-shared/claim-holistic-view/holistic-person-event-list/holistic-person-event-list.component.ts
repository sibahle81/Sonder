import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { HolistPersonEventListDataSource } from './holistic-person-event-list.datasource';
import { SuspiciousTransactionStatusEnum } from 'projects/shared-models-lib/src/lib/enums/suspicious-transaction-status-enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { EventModel } from '../../../entities/personEvent/event.model';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { Claim } from '../../../entities/funeral/claim.model';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClaimItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-type-enum';
import { ClaimAcknowledgeViewComponent } from '../../claim-acknowledge-view/claim-acknowledge-view.component';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { PoolWorkFlowItemTypeEnum } from '../../../enums/pool-work-flow-item-type.enum';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { TopRankedEstimateAmount } from '../../../entities/top-ranked-estimate-amount';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { LiabilityDecisionDialogComponent } from './liability-decision-dialog/liability-decision-dialog.component';
import { PersonEventSmsAuditComponent } from '../../../../views/person-event-sms-audit/person-event-sms-audit.component';
import { ViewEmailAuditDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/view-email-audit/view-email-audit.component';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { ReferralTypeLimitConfiguration } from '../../claim-referral/referral-type-limit-configuration';
import { ClaimReferralTypeLimitGroupEnum } from '../../claim-referral/claim-referral-type-limit-group-enum';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';

@Component({
  selector: 'holistic-person-event-list',
  templateUrl: './holistic-person-event-list.component.html',
  styleUrls: ['./holistic-person-event-list.component.css']
})
export class HolisticPersonEventListComponent extends UnSubscribe implements OnChanges {
  acknowledgeClaimPermission = 'Acknowledge Claim';
  cadPermission = 'Cad Pool';
  ccaPermission = 'Cca Pool';
  scaPermission = 'Sca Pool';
  cmcPermission = 'Cmc Pool';
  viewAuditPermission = 'View Audits';
  viewSlaPermission = 'View SLA';

  @Input() event: EventModel;
  @Input() personEventId: number;
  @Input() selectedTab = 0;
  @Input() showMedicalInvoice = true;

  @Output() emitPersonEvent = new EventEmitter<PersonEventModel>();
  @Output() reloadPersonEventRequirements = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  dataSource: HolistPersonEventListDataSource;
  currentQuery: any;
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  updateSelectedPersonEvent: boolean = false;

  selectedPersonEvent: PersonEventModel;
  selectedClaim: Claim;

  eventTypeLabel = '';
  mode = ModeEnum.Default;

  beneficiary = RolePlayerTypeEnum.Beneficiary;

  manuallyAcknowledged = PersonEventStatusEnum.ManuallyAcknowledged;
  autoAcknowledged = PersonEventStatusEnum.AutoAcknowledged;
  closed = PersonEventStatusEnum.Closed;

  activeWizardsChecked$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isInvestigationInProgress = false;
  isComplianceReviewInProgress = false;

  triggerRefresh: boolean;

  currentUser: User;

  //sla
  acknowlegmentSLA = SLAItemTypeEnum.WorkPoolAcknowledgement;
  coidLiabilitySLA = SLAItemTypeEnum.WorkPoolLiabilityDecisionCOID;
  nonCoidLiabilitySLA = SLAItemTypeEnum.WorkPoolLiabilityDecisionNonCOID;
  estimatesSLA = SLAItemTypeEnum.WorkPoolEstimateVerification;
  nonZeroPdSLA = SLAItemTypeEnum.WorkPoolNonZeroPD;
  zeroPdSLA = SLAItemTypeEnum.WorkPoolZeroPD;

  //notes
  moduleType: ModuleTypeEnum[];
  moduleTypesExternalUser: ModuleTypeEnum[];
  noteItemType = NoteItemTypeEnum.PersonEvent;

  //referrals
  targetModuleType = ModuleTypeEnum.ClaimCare;
  referralItemType = ReferralItemTypeEnum.PersonEvent;
  referralItemTypeReference: string;

  //authority limit
  referralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];
  filteredReferralTypeLimitConfiguration: ReferralTypeLimitConfiguration[] = [];

  selectedClaimTabIndex = 0;
  showPensionInterviewForm = false;

  constructor(
    private readonly claimService: ClaimCareService,
    public dialog: MatDialog,
    private readonly alertService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly poolWorkFlowService: PoolWorkFlowService,
    private readonly authService: AuthService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly commonNotesService: CommonNotesService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
    this.moduleType = this.currentUser.isInternalUser ? [ModuleTypeEnum.ClaimCare] : [ModuleTypeEnum.Member];
    this.moduleTypesExternalUser = this.currentUser.isInternalUser ? null : [ModuleTypeEnum.ClaimCare, ModuleTypeEnum.Member];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.event) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.dataSource = new HolistPersonEventListDataSource(this.claimService);
      if (this.paginator && this.paginator.length > 0) {
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);
      }
      this.checkUrlSource();
      this.dataSource.hasPersonEvent.subscribe(result => {
        if (result) {
          this.autoSelect();
        }
      });
    }
  }

  checkUrlSource() {
    if (this.personEventId) {
      this.currentQuery = this.personEventId.toString();
      this.dataSource.isPersonEvent = true;
    } else {
      this.currentQuery = this.event.eventId.toString();
    }
    this.getData();
  }

  getData() {
    this.activeWizardsChecked$.next(false);
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  getSuspiciousTransactionStatus(id: number) {
    const suspiciousTransactionStatus = SuspiciousTransactionStatusEnum[id];
    return suspiciousTransactionStatus ? this.formatText(suspiciousTransactionStatus) : 'N/A';
  }

  getPersonEventStatus(personEventStatus: PersonEventStatusEnum): string {
    const perEventStatus = PersonEventStatusEnum[personEventStatus];
    return perEventStatus ? this.formatText(perEventStatus) : 'N/A';
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  showDetail($event: PersonEventModel) {
    const shallowEvent = { ...this.event, personEvents: [] } as EventModel;
    $event.event = shallowEvent;

    this.eventTypeLabel = this.event.eventType === EventTypeEnum.Disease ? 'Disease' : 'Injury';

    this.selectedPersonEvent = $event;
    this.emitPersonEvent.emit($event);
  }

  autoSelect() {
    if (!this.selectedPersonEvent) {
      this.selectedPersonEvent = this.dataSource.data.data[0];
      this.showDetail(this.selectedPersonEvent);
      this.getAuthorizationLimitsByReferralType();
    } else if (this.updateSelectedPersonEvent) {
      this.selectedPersonEvent = this.dataSource.data.data[0];
    }

    this.referralItemTypeReference = this.selectedPersonEvent ? this.selectedPersonEvent.personEventReferenceNumber : null;
  }

  refreshEventEmit($event: boolean) {
    this.getData();
    this.updateSelectedPersonEvent = $event;
    this.triggerRefresh = !this.triggerRefresh;
  }

  refreshTabsEmit($event: boolean) {
    this.triggerRefresh = !this.triggerRefresh;
    this.selectedClaim = null;
  }

  selectedTabChange(tabIndex: number) {
    if (tabIndex == 6) {
      this.reloadPersonEventRequirements = true;
    } else {
      this.reloadPersonEventRequirements = false;
    }
  }

  setSelectedClaim($event: Claim) {
    this.selectedClaim = $event;
  }

  resetClaim() {
    this.selectedClaim = null;
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'displayName', show: true },
      { def: 'idNumber', show: true },
      { def: 'personEventNumber', show: true },
      { def: 'personEventStatusId', show: true },
      { def: 'createdDate', show: true },
      { def: 'isStp', show: this.currentUser?.isInternalUser },
      { def: 'isStm', show: this.currentUser?.isInternalUser },
      { def: 'isFatal', show: true },
      { def: 'actions', show: this.currentUser?.isInternalUser }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  canAcknowledgePEV($event: PersonEventModel) {
    if (!$event.isFatal && (!$event.firstMedicalReport || !$event.firstMedicalReport.medicalReportForm)) {
      this.openMessageDialog('Requirements Outstanding', 'First medical report is required for non-fatal person event before claims can be acknowledged');
    } else {
      this.openAcknowledgeDialog($event, true);
    }
  }

  canUnacknowledgePEV($event: PersonEventModel) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      data: {
        title: 'Unacknowledge Claim',
        text: 'Are you sure you want to unacknowledge this claim?',
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.openAcknowledgeDialog($event, false);
      }
    });
  }

  openMessageDialog(title: string, message: string) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: title,
        text: message,
        showConfirmButton: false
      }
    });
  }

  openAcknowledgeDialog($event: PersonEventModel, acknowledgeClaim: boolean) {
    const dialogRef = this.dialog.open(ClaimAcknowledgeViewComponent, {
      width: '70%',
      maxHeight: '600px',
      disableClose: true,
      data: {
        rolePlayerId: $event.companyRolePlayerId,
        personEvent: $event,
        eventDate: this.event.eventDate,
        categoryInsured: $event.rolePlayer.person.personEmployments[0].isSkilled
      }
    });

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.startLoading('acknowledging claim...please wait');
        const claimServiceMethod = acknowledgeClaim ? this.claimService.acknowledgeClaims : this.claimService.unacknowledgeClaims;

        claimServiceMethod.call(this.claimService, data, $event.personEventId).subscribe(result => {
          if (result) {
            this.handleSuccess('Acknowledged successfully...');
          }
        });
      }
    });
  }

  private startLoading(message: string): void {
    this.isLoading$.next(true);
    this.loadingMessage$.next(message);
  }

  private stopLoading(): void {
    this.isLoading$.next(false);
  }

  private autoGenerateInvoicesForFatalClaim(personEventId: number): void {
    this.startLoading('autogenerating invoices if any...please wait');
    this.claimInvoiceService.AutoGenerateInvoices(personEventId).subscribe(_res => {
      if (!_res) {
        this.alertService.warningToastr('No invoices added for fatal type, please add manually.');
      } else {
        this.alertService.successToastr('Invoices autogenerated successfully for fatal type...');
      }
      this.refreshTabsEmit(true);
      this.stopLoading();
    });
  }

  private handleSuccess(message: string): void {
    this.alertService.successToastr(message);
    this.refreshEventEmit(true);
    this.stopLoading();
  }

  setActiveWizards($event: Wizard[]) {
    if ($event && $event.length > 0) {
      const investigationInProgress = $event.find(s => s.wizardConfiguration.name == 'claim-investigation-coid');
      const complianceReviewInProgress = $event.find(s => s.wizardConfiguration.name == 'claim-compliance');
      if (investigationInProgress) {
        this.isInvestigationInProgress = true;
      }

      if (complianceReviewInProgress) {
        this.isComplianceReviewInProgress = true;
      }
    }

    this.activeWizardsChecked$.next(true);
  }

  openConfirmationInvestigationDialog($event: PersonEventModel) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Investigation Confirmation',
        text: `Start investigation. Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.startInvestigation($event);
      }
    });
  }

  startInvestigation($event: PersonEventModel) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('starting investigation...please wait');

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = $event.personEventId;
    startWizardRequest.type = 'claim-investigation-coid';
    startWizardRequest.data = JSON.stringify($event);

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.addNote('investigation started successfully');
      this.refreshTabsEmit(true);
      this.alertService.successToastr('investigation started successfully');
      this.isLoading$.next(false);
    });
  }

  startComplianceWizard($event: PersonEventModel) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('starting compliance workflow...please wait');

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = $event.personEventId;
    startWizardRequest.type = 'claim-compliance';
    startWizardRequest.data = JSON.stringify($event);

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.refreshTabsEmit(true);
      this.alertService.successToastr('compliance workflow started successfully');
      this.isLoading$.next(false);
    });
  }

  startLiabilityApprovalWizard($event: PersonEventModel) {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'claim-liability-approval';
    startWizardRequest.linkedItemId = $event.personEventId;;
    startWizardRequest.data = JSON.stringify($event);

    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr('Laibility approval workflow created successfully');
    });
  }

  openAcceptLiabilityConfirmationDialog() {
    const hasAuthority = this.checkUserHasAcceptLiablityAuthorityLimit();
    if (!hasAuthority) {
      this.openMessageDialog(
        'Authority Limit',
        'You do not have the authority to accept liability for this claim. A workflow will be created and assigned to team lead.');
      this.startLiabilityApprovalWizard(this.selectedPersonEvent);
      return;
    }

    const isFatalWithEstimatedEarnings = this.isFatalWithEstimatedEarnings();
    if (isFatalWithEstimatedEarnings) {
      this.openMessageDialog(
        'Liability Decision',
        'You cannot accept liability for this claim without accident earnings captured. Please review the earnings details.');
      return;
    }

    const claimLiabilityStatus = this.selectedPersonEvent.earnings?.some(s => !s.isEstimated && s.isVerified) || this.selectedPersonEvent.isFatal ? ClaimLiabilityStatusEnum.FullLiabilityAccepted : ClaimLiabilityStatusEnum.MedicalLiability;
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Liability Decision`,
        text: `Liability will be updated to: ${this.getClaimLiabilityStatus(claimLiabilityStatus)}...Would you like to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateLiability(claimLiabilityStatus);
      }
    });
  }

  openDeclineLiabilityConfirmationDialog() {
    const dialogRef = this.dialog.open(LiabilityDecisionDialogComponent, {
      width: '70%',
      disableClose: true,
      data: {
        personEvent: this.selectedPersonEvent,
        claimLiabilityStatuses: [ClaimLiabilityStatusEnum.Repudiated, ClaimLiabilityStatusEnum.LiabilityNotAccepted],
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateLiability(result);
      } else {
        this.triggerRefresh = !this.triggerRefresh;
      }
    });
  }

  updateLiability(claimLiabilityStatus: ClaimLiabilityStatusEnum) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('applying liability decision...please wait');

    this.selectedPersonEvent.claims.forEach(s => {
      s.claimLiabilityStatus = claimLiabilityStatus;
      s.pdVerified = this.selectedPersonEvent.isFatal && this.selectedPersonEvent.earnings.some(s => !s.isEstimated && s.isVerified) && s.claimLiabilityStatus == ClaimLiabilityStatusEnum.FullLiabilityAccepted && s.underwriterId == UnderwriterEnum.RMAMutualAssurance;
      s.disabilityPercentage = s.pdVerified ? 100 : s.disabilityPercentage;
    });

    if (claimLiabilityStatus == ClaimLiabilityStatusEnum.Repudiated) {
      this.startComplianceWizard(this.selectedPersonEvent);
    } else {
      this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
        if (result) {
          this.addNote(`Liability decision updated: ${this.getClaimLiabilityStatus(claimLiabilityStatus)}`);

          if (claimLiabilityStatus == ClaimLiabilityStatusEnum.LiabilityNotAccepted) {
            const note = 'Liability not accepted';
            this.addNote(note);
            if (!this.selectedPersonEvent.assignedToUserId || this.selectedPersonEvent.assignedToUserId <= 0) {
              this.routeToWorkPool(WorkPoolEnum.ScaPool, note, true);
            } else {
              this.routeToWorkPoolUser(WorkPoolEnum.ScaPool, note, this.selectedPersonEvent.assignedToUserId, true);
            }
            this.refreshTabsEmit(true);
            this.isLoading$.next(false);
            return;
          }

          if (!this.selectedPersonEvent.isFatal) {
            this.routeToWorkPool(WorkPoolEnum.CcaPool, 'Estimated PD% verification required', false);
            this.refreshTabsEmit(true);
          } else {
            const pensionInitiationClaims = this.selectedPersonEvent.claims.filter(s => s.pdVerified);
            if (pensionInitiationClaims.length > 0) {
              const note = 'Pension case to manually initiated';
              if (!this.selectedPersonEvent.assignedToUserId || this.selectedPersonEvent.assignedToUserId <= 0) {
                this.routeToWorkPool(WorkPoolEnum.CmcPool, note, false);
              } else {
                this.routeToWorkPoolUser(WorkPoolEnum.CmcPool, note, this.selectedPersonEvent.assignedToUserId, false);
              }
              this.refreshTabsEmit(true);
            } else {
              const note = 'Pension case pended: Pension will start when verified earnings are submitted';
              this.addNote(note);
              if (!this.selectedPersonEvent.assignedToUserId || this.selectedPersonEvent.assignedToUserId <= 0) {
                this.routeToWorkPool(WorkPoolEnum.CmcPool, note, false);
              } else {
                this.routeToWorkPoolUser(WorkPoolEnum.CmcPool, note, this.selectedPersonEvent.assignedToUserId, false);
              }
              this.refreshTabsEmit(true);
            }
          }

          this.alertService.successToastr('Liability decision updated successfully...');

          if (this.selectedPersonEvent.isFatal) {
            this.autoGenerateInvoicesForFatalClaim(this.selectedPersonEvent.personEventId);
          } else {
            this.isLoading$.next(false);
          }
        }
      });
    }
  }

  getClaimLiabilityStatus(claimLiabilityStatus: ClaimLiabilityStatusEnum): string {
    return this.formatText(ClaimLiabilityStatusEnum[claimLiabilityStatus]);
  }

  addNote(message: string) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.selectedPersonEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = NoteTypeEnum.SystemAdded;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => { });
  }

  routeToWorkPoolUser(workPool: WorkPoolEnum, instruction: string, userId: number, closeWorkPool: boolean) {
    const poolWorkFlow = new PoolWorkFlow();

    poolWorkFlow.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlow.itemId = this.selectedPersonEvent.personEventId;
    poolWorkFlow.workPool = workPool;
    poolWorkFlow.assignedByUserId = this.currentUser.id;
    poolWorkFlow.assignedToUserId = userId;
    poolWorkFlow.effectiveFrom = new Date().getCorrectUCTDate();
    poolWorkFlow.instruction = instruction;

    if (closeWorkPool) {
      poolWorkFlow.effectiveTo = new Date().getCorrectUCTDate();
    } else {
      poolWorkFlow.effectiveTo = null;
    }

    this.poolWorkFlowService.handlePoolWorkFlow(poolWorkFlow).subscribe(result => {
      this.triggerRefresh = !this.triggerRefresh;
    });
  }

  routeToWorkPool(workPool: WorkPoolEnum, instruction: string, closeWorkPool: boolean) {
    const poolWorkFlow = new PoolWorkFlow();

    poolWorkFlow.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlow.itemId = this.selectedPersonEvent.personEventId;
    poolWorkFlow.workPool = workPool;
    poolWorkFlow.assignedByUserId = this.currentUser.id;
    poolWorkFlow.assignedToUserId = null;
    poolWorkFlow.effectiveFrom = new Date().getCorrectUCTDate();
    poolWorkFlow.instruction = instruction;

    if (closeWorkPool) {
      poolWorkFlow.effectiveTo = new Date().getCorrectUCTDate();
    } else {
      poolWorkFlow.effectiveTo = null;
    }

    this.poolWorkFlowService.handlePoolWorkFlow(poolWorkFlow).subscribe(result => {
      this.triggerRefresh = !this.triggerRefresh;
    });
  }

  liabilityDecisionPending(): boolean {
    return this.selectedPersonEvent.claims.some(s => s.claimLiabilityStatus == ClaimLiabilityStatusEnum.Pending);
  }

  isClaimValueAddedProduct(): boolean {
    return this.selectedPersonEvent.claims.length > 1 &&
      this.selectedClaim.underwriterId == UnderwriterEnum.RMALifeAssurance;
  }

  showPensionInterview(): boolean {
    return this.showPensionInterviewForm || this.selectedPersonEvent?.claimDisabilityPensions.length > 0;
  }

  openVerifyPdPercentageConfirmationDialog() {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Verify PD Percentage',
        text: `Would you like to verify the PD percentage?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('updating pd verification...please wait');

        this.claimInvoiceService.getTopRankedEstimatesFromMedicalReport(this.selectedPersonEvent).subscribe(result => {
          this.verifyPdPercentage(result);
        });
      }
    });
  }

  verifyPdPercentage(topRankedEstimate: TopRankedEstimateAmount) {
    let note = 'Estimated PD% verified';

    if (topRankedEstimate.pdExtentEstimate <= 0) {
      this.selectedPersonEvent.personEventStatus = PersonEventStatusEnum.Closed;
      note = 'Estimated PD% of 0% was verified, claim auto closed';
      this.claimService.zeroPercentClosure(this.selectedPersonEvent).subscribe();
    }

    this.selectedPersonEvent.claims.forEach(s => {
      s.pdVerified = true;

      if (topRankedEstimate.pdExtentEstimate <= 0) {
        s.claimStatusId = +ClaimStatusEnum.Closed;
      }
    });

    this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
      if (result) {
        if (topRankedEstimate.pdExtentEstimate > 0 && topRankedEstimate.pdExtentEstimate <= 10) {
          note = `Estimated PD% (${topRankedEstimate?.pdExtentEstimate ?? 0}%) was verified`;
          this.routeToWorkPool(WorkPoolEnum.ClaimsAssessorPool, note, false);
        } else if (topRankedEstimate.pdExtentEstimate > 10) {
          note = `Estimated PD% (${topRankedEstimate?.pdExtentEstimate ?? 0}%) was verified`;
          if (!this.selectedPersonEvent.assignedToUserId || this.selectedPersonEvent.assignedToUserId <= 0) {
            this.routeToWorkPool(WorkPoolEnum.ScaPool, note, false);
          } else {
            this.routeToWorkPoolUser(WorkPoolEnum.ScaPool, note, this.selectedPersonEvent.assignedToUserId, false);
          }
        } else {
          this.routeToWorkPool(WorkPoolEnum.ClaimsAssessorPool, note, true);
        }

        this.addNote(note);
        this.alertService.successToastr(`${note} successfully...`);
        this.refreshTabsEmit(true);
        this.isLoading$.next(false);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  verifyPdPercentagePending(): boolean {
    return this.selectedPersonEvent.claims.some(s => s.pdVerified == false);
  }

  isClaimStatusClosed(): boolean {
    return this.selectedPersonEvent.claims?.some(s => s.claimStatus == ClaimStatusEnum.Closed);
  }

  isClaimEventTypeDisease(): boolean {
    return this.selectedPersonEvent?.event?.eventType == EventTypeEnum.Disease;
  }

  openAuditDialog($event: PersonEventModel) {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClaimManager,
        clientItemType: ClaimItemTypeEnum.PersonEvent,
        itemId: $event.personEventId,
        heading: `PEV (${$event.personEventReferenceNumber}) Audit`,
        propertiesToDisplay: ['ClaimBucketClass', 'ParentInsuranceType', 'ClaimType', 'PersonEventReferenceNumber',
          'SendBrokerEmail', 'PersonEventStatus', 'PersonEventBucketClassId', 'DateReceived', 'DateCaptured', 'AssignedDate', 'AssignedToUserId',
          'DateSubmitted', 'SubmittedByUserId', 'DateAuthorised', 'AuthorisedByUserId', 'DateRejected', 'RejectionReason', 'InsuranceTypeId',
          'SuspiciousTransactionStatus', 'IsSpectacles', 'IsDentures', 'IsAssault', 'IsStraightThroughProcess', 'CompCarePevRefNumber',
          'DateOfStabilisation', 'IsFatal', 'IsHijack']
      }
    });
  }

  openEmailAuditDialog($event: PersonEventModel) {
    if ($event) {
      const rolePlayerContactOptions = [
        { key: 'Employer Contacts', value: $event.companyRolePlayerId },
        { key: 'Employee Contacts', value: $event.insuredLifeId }
      ];

      const dialogRef = this.dialog.open(ViewEmailAuditDialogComponent, {
        width: '80%',
        maxHeight: '750px',
        disableClose: true,
        data: {
          itemType: 'PersonEvent',
          itemId: $event.personEventId,
          rolePlayerContactOptions: rolePlayerContactOptions,
          documentSystemName: this.documentSystemName,
          keyName: 'PersonEventId',
          keyValue: $event.personEventId
        }
      });
    }
  }

  openSmsAuditDialog($event: PersonEventModel): void {
    const rolePlayerContactOptions = [
      { key: 'Employer Contacts', value: $event.companyRolePlayerId },
      { key: 'Employee Contacts', value: $event.insuredLifeId }
    ];

    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '80%';
    dialogConfig.maxHeight = '750px';
    dialogConfig.disableClose = true;

    dialogConfig.data = {
      itemType: 'PersonEvent',
      itemId: $event.personEventId,
      rolePlayerContactOptions: rolePlayerContactOptions
    };

    this.dialog.open(PersonEventSmsAuditComponent, dialogConfig);
  }

  setPensionerInterview($event: boolean) {
    this.selectedClaimTabIndex = 2;
    this.showPensionInterviewForm = $event;
  }

  openSendToPensionDialog($event: PersonEventModel) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Send Claim to Pensions Confirmation',
        text: `Send claim to pensions. Are you sure you want to proceed?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitClaimsToPension($event);
      }
    });
  }

  submitClaimsToPension($event: PersonEventModel) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('Sending claim to pensions... please wait');

    const pensionClaims = this.selectedPersonEvent.claims.filter(c => c.pdVerified);

    if (pensionClaims.length === 0) {
      this.alertService.errorToastr('No PD verified claims to send to pensions');
      this.isLoading$.next(false);
      return;
    }

    forkJoin(
      pensionClaims.map(claim => this.claimService.sendClaimToPensions(claim))
    ).subscribe({
      next: () => {
        this.alertService.successToastr('Claim sent to pensions successfully');
        pensionClaims.forEach(claim => this.closeClaim(claim));
      },
      error: (error) => {
        this.alertService.errorToastr('Error occurred sending claims to pensions');
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  canSendToPensions() {
    return this.selectedPersonEvent?.claims?.some(claim =>
      claim.claimLiabilityStatus === ClaimLiabilityStatusEnum.FullLiabilityAccepted
      && claim.claimStatus != ClaimStatusEnum.Closed) ?? false;
  }

  isExternalPayrollUser(): boolean {
    return !this.currentUser.isInternalUser && this.userHasPermission('Manage Employee Earnings');
  }

  isInternalUser(): boolean {
    return this.currentUser.isInternalUser;
  }

  isFatalWithEstimatedEarnings() {
    const latestEarning = this.selectedPersonEvent.earnings?.reduce((latest, current) =>
      current.createdDate > latest.createdDate ? current : latest
    );

    return this.selectedPersonEvent.isFatal &&
      latestEarning.isEstimated && !latestEarning.isVerified;
  }

  checkUserHasAcceptLiablityAuthorityLimit(): boolean {
    const claimEstimates = this.selectedPersonEvent?.claimEstimates ? this.selectedPersonEvent?.claimEstimates : null;
    const totalEstimatedAmount = claimEstimates ? claimEstimates.reduce((total, est) => total + est.estimatedValue, 0) : 0;

    if (this.filteredReferralTypeLimitConfiguration && claimEstimates) {
      return this.filteredReferralTypeLimitConfiguration.some(a => a.amountLimit >= totalEstimatedAmount);
    }
    return false;
  }

  getAuthorizationLimitsByReferralType() {
    this.claimService.getAuthorizationLimitsByReferralTypeLimitGroup(ClaimReferralTypeLimitGroupEnum.Liability).subscribe(result => {
      if (result) {
        this.referralTypeLimitConfiguration = result;
        this.filterReferralTypeLimitConfigPermission();
      }
    });
  }

  filterReferralTypeLimitConfigPermission() {
    this.referralTypeLimitConfiguration.forEach(permission => {
      if (this.userHasPermission(permission.permissionName)) {
        this.filteredReferralTypeLimitConfiguration.push(permission);
      }
    });
  }

  onTabChange() {
    this.triggerRefresh = !this.triggerRefresh;
  }

  closeClaim(claim: Claim) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('Updating claim status... please wait');

    this.selectedPersonEvent.personEventStatus = PersonEventStatusEnum.Closed;
    const index = this.selectedPersonEvent.claims.findIndex(s => s.claimId == claim.claimId);
    if (index > -1) {
      this.selectedPersonEvent.claims[index].claimStatus = ClaimStatusEnum.Closed;
      this.selectedPersonEvent.claims[index].claimStatusId = +ClaimStatusEnum.Closed;
    }

    this.claimService.updatePersonEvent(this.selectedPersonEvent).subscribe(result => {
      if (result) {
        this.alertService.successToastr('claim status updated successfully...');
        this.isLoading$.next(false);
      }
    });
  }
}
