import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { BehaviorSubject, Observable, Subscription, forkJoin, of } from 'rxjs';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimPagedDisabilityDataSource } from './claim-paged-disability.datasource';
import { PagedParams } from '../../../entities/personEvent/paged-parameters';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { ClaimDisabilityTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-disabiity-type-enum';
import { ClaimDisabilityDialogComponent } from '../claim-disability-dialog/claim-disability-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Earning } from '../../../entities/earning-model';
import { ClaimEarningService } from '../../../../Services/claim-earning.service';
import { ClaimPdAwardCalculationComponent } from '../claim-pdlumpsum-award/claim-pd-award-calculation/claim-pd-award-calculation.component';
import { switchMap } from 'rxjs/operators';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { PdAward } from '../claim-pdlumpsum-award/PdAward';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { EventModel } from '../../../entities/personEvent/event.model';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { InvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/invoice-status-enum';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { ClaimHearingAssessment } from '../../../entities/claim-hearing-assessment';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { PoolWorkFlowService } from 'projects/shared-services-lib/src/lib/services/pool-work-flow/pool-work-flow.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { PoolWorkFlow } from 'projects/shared-models-lib/src/lib/common/pool-work-flow';
import { PoolWorkFlowItemTypeEnum } from '../../../enums/pool-work-flow-item-type.enum';
import { DisabilityFormService } from '../disability-form.service';
import { ClaimDisabilityService } from '../../../../Services/claim-disability.service';
import { DisabilityAssessmentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/disability-assessment-status-enum';
import { ClaimEstimate } from '../../../entities/personEvent/claimEstimate';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { PersonEventStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-event-status.enum';
import { ClaimStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-status.enum';

@Component({
  selector: 'claim-paged-disability',
  templateUrl: './claim-paged-disability.component.html',
  styleUrls: ['./claim-paged-disability.component.css']
})
export class ClaimPagedDisabilityComponent extends UnSubscribe implements OnChanges, OnDestroy {

  @Input() user: User;
  @Input() personEvent: PersonEventModel;
  @Input() disabilityType: ClaimDisabilityTypeEnum;
  @Input() query: ClaimDisabilityTypeEnum;
  @Input() selectedClaim: Claim;
  @Input() triggerRefresh: boolean;

  @Output() disabilityTypeEmit: EventEmitter<ClaimDisabilityTypeEnum> = new EventEmitter();
  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() emitPensionerInterviewForm: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading disability...please wait');

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: ClaimPagedDisabilityDataSource;
  opinionOfMedicalPractitioner: boolean;
  scaPermission = 'Sca Pool';
  caPermission = 'Claims Assessor Pool';
  currentUser: string;

  menus: { title: string; url: string; disable: boolean }[];
  params = new PagedParams();

  currentQuery = '';
  earning: Earning;
  calculatedPdAward: number;
  nettAssessedPdPercentage: number;
  claimDisabilityAssessment: ClaimDisabilityAssessment;

  claimEvent: EventModel;
  medicalReportForm: FinalMedicalReportForm[] = [];
  userReminders: UserReminder[] = [];
  subscription = new Subscription();
  isSubmitDisabled = false;
  isSubmitToPdDisabled = false;
  totalPercentage = 0;
  calcOperands: string;
  claimEstimates: ClaimEstimate[] = [];

  constructor(
    public dialog: MatDialog,
    public userService: UserService,
    private disabilityFormService: DisabilityFormService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly claimEarningService: ClaimEarningService,
    private readonly alertService: ToastrManager,
    private readonly claimService: ClaimCareService,
    private readonly commonNotesService: CommonNotesService,
    private readonly authService: AuthService,
    private readonly wizardService: WizardService,
    private readonly poolWorkFlowService: PoolWorkFlowService,
    private readonly userReminderService: UserReminderService,
    private readonly claimDisabilityService: ClaimDisabilityService,
  ) {
    super();
    this.currentUser = this.authService.getUserEmail().toLowerCase();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(): void {
    if (this.personEvent && this.selectedClaim) {
      this.setPaginatorOnSortChanges();
      this.dataSource.personEventId = this.personEvent.personEventId;
      this.getData();
      this.getClaimDisabilityAssessmentsByPersonEvent();
      this.getClaimEstimatesByPersonEvent();
    }
  }

  setPaginatorOnSortChanges() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new ClaimPagedDisabilityDataSource(this.claimDisabilityService, this.disabilityFormService);
    this.dataSource.rowCount$.subscribe((count) => this.paginator.length = count);
  }

  getData() {
    this.setParams();
    this.dataSource.getData(this.params.pageIndex, this.params.pageSize, this.params.orderBy, this.params.direction, this.params.currentQuery);
  }

  setParams() {
    this.params.pageIndex = this.paginator.pageIndex ? this.paginator.pageIndex + 1 : 1;
    this.params.pageSize = this.paginator.pageSize ? this.paginator.pageSize : 5;
    this.params.orderBy = this.sort.active && this.sort.active !== undefined ? this.sort.active : 'createdDate';
    this.params.direction = this.sort.direction ? this.sort.direction : 'desc';
    this.params.currentQuery = this.currentQuery ? this.currentQuery : '';
  }

  getDisplayedColumns(): any[] {
    let columnDefinitions = [
      { def: 'authorised', show: true },
      { def: 'rawPdPercentage', show: true },
      { def: 'netAssessedPdPercentage', show: true },
      { def: 'createdBy', show: false },
      { def: 'assessedBy', show: true },
      { def: 'assessmentDate', show: true },
      { def: 'claimReferenceNumber', show: true },
      { def: 'finalDiagnosis', show: true },
      { def: 'actions', show: true },
      { def: 'status', show: this.userHasPermission(this.scaPermission) || this.userHasPermission(this.caPermission) },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  formatText(text: string): string {
    return text && text.length > 0 ? text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim() : 'No data';
  }

  addCheckedItems($event: any) {
    if ($event > -1) { }
  };

  disabilityTypeChanged($event: ClaimDisabilityTypeEnum) {
    this.query = $event;
    this.disabilityTypeEmit.emit($event);
  }

  disableSubmit($event: ClaimDisabilityAssessment): boolean {
    if ($event.disabilityAssessmentStatus === DisabilityAssessmentStatusEnum.Submitted
      || $event.disabilityAssessmentStatus === DisabilityAssessmentStatusEnum.Approved
      || $event.disabilityAssessmentStatus === DisabilityAssessmentStatusEnum.SubmittedToPension || (this.totalPercentage > 30 && this.isSubmitDisabled)) {
      return true;
    }
    return false;
  }

  disableSubmitToPD($event: ClaimDisabilityAssessment): boolean {
    if ($event.disabilityAssessmentStatus === DisabilityAssessmentStatusEnum.SubmittedToPension
      || $event.disabilityAssessmentStatus === DisabilityAssessmentStatusEnum.Approved) {
      return true;
    }
    return false;
  }

  filterMenu(item: ClaimDisabilityAssessment) {
    this.menus = [];

    if (this.totalPercentage <= 30) {
      this.menus = [
        { title: 'Approve', url: '', disable: !this.userHasPermission('Approve PD Percentage') || item.isAuthorised },
        {
          title: 'Decline', url: '', disable: !this.userHasPermission('Decline PD Percentage')
                                    || item.disabilityAssessmentStatus == DisabilityAssessmentStatusEnum.Declined
        },
      ];
    }
    else if (this.totalPercentage > 30) {
      this.menus = [
        { 
          title: 'Submit PD Pension', url: '', disable: !this.userHasPermission('Submit PD Pension') 
                            || item.isAuthorised 
                            || this.isSubmitDisabled 
                            || this.isSubmitToPdDisabled 
                            || item.disabilityAssessmentStatus == DisabilityAssessmentStatusEnum.SubmittedToPension 
                            || item.disabilityAssessmentStatus == DisabilityAssessmentStatusEnum.Approved 
        },
      ];
    }
  }

  onMenuItemClick(item: ClaimDisabilityAssessment, menu: any): void {
    switch (menu.title) {
      case 'Approve':
        this.approveDisabilityAssessment(item);
        break;
      case 'Decline':
        this.declineDisabilityAssessment(item);
        break;
      case 'Submit PD Pension':
        this.submitDisabilityToPension(item);
        break;
    }
  }

  calculateTotalNettPD(): number {
    if (!this.dataSource?.data?.data) return 0;

    this.totalPercentage = this.dataSource.data.data.reduce((sum, item) => sum + (item.nettAssessedPdPercentage), 0);
    return this.totalPercentage;
  }

  calculateProRataPension(claimDisabilities: ClaimDisabilityAssessment[]): number {
    return claimDisabilities.reduce((sum, item) => sum + item.nettAssessedPdPercentage, 0);
  }
  
  submitDisabilityToPension(disabilityAssessment: ClaimDisabilityAssessment) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('Sending disability to pensions... please wait');
  
    const pensionClaims = this.personEvent.claims.filter(c => c.pdVerified);
  
    if (pensionClaims.length === 0) {
      this.alertService.errorToastr('No PD verified claims to send to pensions');
      this.isLoading$.next(false);
      return;
    }

    const message = {
      successMessage: 'Disability sent to pensions successfully...',
      errorMessage: 'Error occurred sending disability to pensions...'
    };
  
    forkJoin(
      pensionClaims.map(claim => this.claimService.sendClaimToPensions(claim))
    ).subscribe({
      next: () => {
        this.submitDisabilityAssessment(disabilityAssessment, DisabilityAssessmentStatusEnum.SubmittedToPension, message);
        pensionClaims.forEach(claim => this.closeClaim(claim));
      },
      error: (error) => {
        this.alertService.errorToastr('Error occurred sending disability to pensions.');
      },
      complete: () => {
        this.isLoading$.next(false);
      }
    });
  }

  approveDisabilityAssessment(disabilityAssessment: ClaimDisabilityAssessment) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('approving disability assessment...please wait');

    this.validatePersonEventEarnings().subscribe(result => {
      if (result) {
        this.claimEstimates.forEach(estimate => {
          if (estimate.estimateType == EstimateTypeEnum.PDLumpSum) {
            estimate.estimatePd = disabilityAssessment.nettAssessedPdPercentage; // new body PD percentage
          }
        });
        // calculate PD lump sum award based on new body PD percentage
        this.claimInvoiceService.recalculateClaimEstimates(this.claimEstimates).subscribe(results => {
          if (results) {
            this.calculatedPdAward = results.find(e => e.estimateType == EstimateTypeEnum.PDLumpSum).estimatedValue;
            this.calcOperands = results.find(e => e.estimateType == EstimateTypeEnum.PDLumpSum).calcOperands;
            this.openPDAwardCalculationDialog(disabilityAssessment);
          }
        });
      }
    });
  }

  declineDisabilityAssessment(disabilityAssessment: ClaimDisabilityAssessment) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Decline Disability Assessment`,
        text: `Are you sure you want to decline disability assessment?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('decline disability assessment...please wait');
        disabilityAssessment.isAuthorised = false;
        disabilityAssessment.disabilityAssessmentStatus = DisabilityAssessmentStatusEnum.Declined;
        disabilityAssessment.modifiedDate = new Date();
        disabilityAssessment.modifiedBy = this.currentUser;

        this.claimInvoiceService.updateClaimDisabilityAssessment(disabilityAssessment).subscribe(result => {
          if (result) {
            this.createDisabilityApprovalWizard(this.personEvent.personEventId);
            this.addNote(`PD percentage have been declined (Percentage- ${disabilityAssessment.nettAssessedPdPercentage}%)`, NoteTypeEnum.DisabilityRelated);
          }
        });
      }
    });
  }

  createDisabilityApprovalWizard(itemId: number) {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'disability-assessment-approval';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    startWizardRequest.linkedItemId = itemId;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr('Workflow notification created for CCA team', 'success', true);
      this.isLoading$.next(false);
    });
  }

  openPDAwardCalculationDialog(disabilityAssessment: ClaimDisabilityAssessment) {
    const dialogRef = this.dialog.open(ClaimPdAwardCalculationComponent, {
      width: '60%',
      maxHeight: '80vh',
      disableClose: true,
      data: {
        selectedPersonEvent: this.personEvent,
        nettAssessedPdPercentage: disabilityAssessment.nettAssessedPdPercentage,
        earning: this.earning.total,
        calculatedPdAward: this.calculatedPdAward,
        calcOperands: this.calcOperands,
        payee: `${this.personEvent.rolePlayer.person.firstName} ${this.personEvent.rolePlayer.person.surname}`,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading$.next(true);
        this.loadingMessage$.next('processing PD award...please wait');

        this.subscription.add(
          this.claimInvoiceService.approveClaimDisabilityAssessmentStatus(disabilityAssessment).subscribe(result => {
            if (result) {
              this.createPdLumpSumAward(disabilityAssessment);
              this.addNote(`PD percentage have been approved (Percentage- ${disabilityAssessment.nettAssessedPdPercentage}%)`, NoteTypeEnum.DisabilityRelated);
            }
          })
        );
      }
      else {
        this.isLoading$.next(false);
      }
    });
  }

  createPdLumpSumAward(disabilityAssessment: ClaimDisabilityAssessment) {
      const estimateBenefitId = this.claimEstimates.find(estimate => estimate.claimId === this.selectedClaim.claimId && 
                                estimate.estimateType === EstimateTypeEnum.PDLumpSum)?.benefitId;

      const pdAward = new PdAward();
      pdAward.claimId = this.selectedClaim.claimId;
      pdAward.payeeId = this.personEvent.rolePlayer.rolePlayerId;
      pdAward.awardPercentage = disabilityAssessment.nettAssessedPdPercentage;
      pdAward.awardAmount = this.calculatedPdAward;
      pdAward.awardStatusId = +InvoiceStatusEnum.Captured;
      pdAward.medicalAssessmentId = disabilityAssessment.claimDisabilityAssessmentId;

      pdAward.claimInvoice = new ClaimInvoice();
      pdAward.claimInvoice.invoiceDate = new Date();
      pdAward.claimInvoice.dateReceived = new Date();
      pdAward.claimInvoice.invoiceAmount = this.calculatedPdAward || null;
      pdAward.claimInvoice.claimAmount = this.calculatedPdAward;
      pdAward.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.PDAward;
      pdAward.claimInvoice.isAuthorised = 0;
      pdAward.claimInvoice.internalReferenceNumber = this.selectedClaim.claimReferenceNumber;
      pdAward.claimInvoice.claimReferenceNumber = this.selectedClaim.claimReferenceNumber;
      pdAward.claimInvoice.claimId = this.selectedClaim.claimId;
      pdAward.claimInvoice.claimInvoiceStatusId = ClaimInvoiceStatusEnum.Captured;
      pdAward.claimInvoice.claimBenefitId = estimateBenefitId 
                                            ? this.selectedClaim.claimBenefits.find(b => b.benefitId === estimateBenefitId)?.claimBenefitId 
                                            : null;;
      pdAward.isActive = 1;
      pdAward.isDeleted = 0;

    this.claimInvoiceService.addClaimPdLumpsumAward(pdAward).subscribe({ 
      next: (result) => {
        if (result) {
          this.alertService.successToastr('PD lump sum has been created successfully', 'success', true);
          this.updatePersonEventClaimFinalPD(disabilityAssessment);
        }
      },
      error: (error) => {
        this.alertService.errorToastr('Failed to create PD lump sum successfully', 'error', true);
      }
    });
  }

  updatePersonEventClaimFinalPD(disabilityAssessment: ClaimDisabilityAssessment) {
    this.selectedClaim.pdVerified = true;
    this.selectedClaim.disabilityPercentage = disabilityAssessment.nettAssessedPdPercentage;

    this.claimService.updateClaim(this.selectedClaim).subscribe(result => {
      if (result) {
        this.updatePersonEventClaimsFinalPD(disabilityAssessment);
        this.refresh();
      }
      this.isLoading$.next(false);
    });
  }

  updatePersonEventClaimsFinalPD(disabilityAssessment: ClaimDisabilityAssessment) {
    if (this.personEvent?.claims?.length > 0) {
      this.personEvent.claims.forEach(claim => {
        claim.pdVerified = true;
        claim.disabilityPercentage = disabilityAssessment.nettAssessedPdPercentage;
      });
      this.claimService.updatePersonEvent(this.personEvent).subscribe(result => { });
    }
  }

  refresh() {
    this.getData();
    this.refreshClaimEmit.emit(true);
  }

  showDetail($event: any, actionType: any, readOnly: boolean) {
    const dialogRef = this.dialog.open(ClaimDisabilityDialogComponent, {
      width: '80%',
      maxHeight: '700px',
      disableClose: true,
      data: {
        disabilityType: this.query,
        claimDisability: this.getDisabilityType(),
        personEvent: this.personEvent,
        user: this.user,
        claimDisabilityAssessment: $event,
        actionType: actionType,
        isReadOnly: readOnly
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePersonEventClaimFinalPD(result);
      }
    });
  }

  getDisabilityType() {
    switch (+ClaimDisabilityTypeEnum[this.query]) {
      case ClaimDisabilityTypeEnum.DisabilityAssessment:
        return new ClaimDisabilityAssessment();
      case ClaimDisabilityTypeEnum.HearingAssessment:
        return new ClaimHearingAssessment();
      default:
        break;
    }
  }

  onRemove($event: any, actionType: any) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: `Remove Disability Assessment`,
        text: `Are you sure you want to remove disability assessment?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.claimDisabilityAssessment = $event;
        this.claimDisabilityAssessment.disabilityAssessmentStatus = DisabilityAssessmentStatusEnum.Deleted;
        this.claimDisabilityAssessment.isDeleted = true;
        this.claimInvoiceService.deleteClaimDisabilityAssessment($event).subscribe(result => {
          if (result) {
            this.getData();
            this.isLoading$.next(false);
          }
        });
      }
    });
  }

  validatePersonEventEarnings(): Observable<boolean> {
    return this.claimEarningService.getEarningsByPersonEventId(this.personEvent.personEventId).pipe(
      switchMap(results => {
        if (results.length === 0) {
          this.alertService.warningToastr('Please ensure that earnings are captured for claim.');
          return of(false);
        }

        this.earning = results[results.length - 1]

        if (!this.earning.isVerified) {
          this.alertService.warningToastr('Please ensure that earnings are verified.');
          return of(false);
        }

        return of(true);
      }));
  }

  userHasEditPermission(row: { isAuthorised: boolean }): boolean {
    return !row.isAuthorised && this.userHasPermission('Edit Disability');
  }

  userHasDeletePermission(row: { isAuthorised: boolean }): boolean {
    return !row.isAuthorised && this.userHasPermission('Delete Disability');
  }

  addNote(message: string, noteType: NoteTypeEnum) {
    const commonSystemNote = new CommonNote();
    commonSystemNote.itemId = this.personEvent.personEventId;
    commonSystemNote.noteCategory = NoteCategoryEnum.PersonEvent;
    commonSystemNote.noteItemType = NoteItemTypeEnum.PersonEvent;
    commonSystemNote.noteType = noteType;
    commonSystemNote.text = message;
    commonSystemNote.isActive = true;

    commonSystemNote.noteModules = [];
    const moduleType = new CommonNoteModule();
    moduleType.moduleType = ModuleTypeEnum.ClaimCare;
    commonSystemNote.noteModules.push(moduleType);

    this.commonNotesService.addNote(commonSystemNote).subscribe(result => { });
  }

  routeToWorkPool($event: ClaimDisabilityAssessment) {
    const disabilityAssessment = $event;
    const pdPercentage = $event.nettAssessedPdPercentage;

    this.isLoading$.next(true);
    var claim = this.personEvent.claims[0];

    if (pdPercentage > 10) {
      claim.pdVerified = true;
      claim.disabilityPercentage = pdPercentage;
      claim.workPoolId = WorkPoolEnum.ScaPool;
      this.updateClaim(claim, pdPercentage);
      this.createPoolWorkFlow(WorkPoolEnum.ScaPool, `Disability PD% (${pdPercentage}%) approval required`, false);
    }
    else {
      claim.pdVerified = true;
      claim.disabilityPercentage = pdPercentage;
      claim.workPoolId = WorkPoolEnum.ClaimsAssessorPool;
      this.updateClaim(claim, pdPercentage);
      this.createPoolWorkFlow(WorkPoolEnum.ClaimsAssessorPool, `Disability PD% (${pdPercentage}%) approval required`, false);
    }

    const message = {
      successMessage: 'Disability assessment submitted successfully',
      errorMessage: 'Disability assessment failed to submit'
    };

    this.submitDisabilityAssessment(disabilityAssessment, DisabilityAssessmentStatusEnum.Submitted, message);
  }

  submitDisabilityAssessment(disabilityAssessment: ClaimDisabilityAssessment, disabilityAssessmentStatus: DisabilityAssessmentStatusEnum , message) {
    disabilityAssessment.disabilityAssessmentStatus = disabilityAssessmentStatus;
    disabilityAssessment.modifiedDate = new Date().getCorrectUCTDate();
    disabilityAssessment.modifiedBy = this.currentUser;

    this.claimInvoiceService.updateClaimDisabilityAssessment(disabilityAssessment).subscribe(result => {
      if (result) {
        this.alertService.successToastr(message.successMessage, 'success', true);
        this.getData();
        this.isLoading$.next(false);
      } else {
        this.alertService.errorToastr(message.errorMessage);
      }
    });
  }

  updateClaim(claim: Claim, pdPercentage: number) {
    this.claimService.updateClaim(claim).subscribe(result => {
      if (result) {
        this.createReminders(claim, pdPercentage);
      }
    });
  }

  createReminders(claim: Claim, pdPercentage: number) {
    if (pdPercentage > 10) {
      this.getUsersByPermission('Sca Pool', claim, UserReminderItemTypeEnum.ScaPool, pdPercentage);
    }
    else {
      this.getUsersByPermission('Claims Assessor Pool', claim, UserReminderItemTypeEnum.ClaimsAssessorPool, pdPercentage);
    }
  }

  getUsersByPermission(permission: string, claim: Claim, userReminderItemTypeEnum: UserReminderItemTypeEnum, pdPercentage: number) {
    const wokPoolId = userReminderItemTypeEnum == UserReminderItemTypeEnum.ClaimsAssessorPool ? WorkPoolEnum.ClaimsAssessorPool : WorkPoolEnum.ScaPool;
    this.poolWorkFlowService.getPoolWorkFlowItem(claim.claimId, wokPoolId).subscribe(result => {

      if (result && result.assignedToUserId > 0) {
        this.createUserReminders(result.assignedToUserId, claim, userReminderItemTypeEnum, pdPercentage);
      }
      else {
        this.userService.getUsersByPermission(permission).subscribe(result => {
          if (result) {
            const users = result.filter(a => a.roleId != 1);
            users.forEach(user => {
              this.createUserReminders(user.id, claim, userReminderItemTypeEnum, pdPercentage);
            });
          }
        });
      }
    })
  }

  createUserReminders(userId: number, claim: Claim, userReminderItemTypeEnum: UserReminderItemTypeEnum, pdPercentage) {
    const userReminder = new UserReminder();
    this.userReminders = [];
    userReminder.userReminderType = UserReminderTypeEnum.Message;
    userReminder.userReminderItemType = userReminderItemTypeEnum;
    userReminder.text = `PD (${pdPercentage}%) percentage for claim reference number: ${claim.claimReferenceNumber} requires approval`;
    userReminder.assignedByUserId = this.authService.getCurrentUser().id;
    userReminder.assignedToUserId = userId;
    userReminder.alertDateTime = new Date().getCorrectUCTDate();
    userReminder.linkUrl = `claimcare/claim-manager/holistic-claim-view/${this.personEvent.eventId}/${this.personEvent.personEventId}`;

    this.userReminders.push(userReminder);

    this.userReminderService.createUserReminders(this.userReminders).subscribe(result => { });
  }

  createPoolWorkFlow(workPool: WorkPoolEnum, instruction: string, closeWorkPool: boolean) {
    const poolWorkFlow = new PoolWorkFlow();

    poolWorkFlow.poolWorkFlowItemType = PoolWorkFlowItemTypeEnum.PersonEvent;
    poolWorkFlow.itemId = this.personEvent.personEventId;
    poolWorkFlow.workPool = workPool;
    poolWorkFlow.assignedByUserId = this.user.id;
    poolWorkFlow.assignedToUserId = null;
    poolWorkFlow.effectiveFrom = new Date().getCorrectUCTDate();
    poolWorkFlow.instruction = instruction;

    if (closeWorkPool) {
      poolWorkFlow.effectiveTo = new Date().getCorrectUCTDate();
    } else {
      poolWorkFlow.effectiveTo = null;
    }

    this.poolWorkFlowService.handlePoolWorkFlow(poolWorkFlow).subscribe(result => { });
  }

  getDisabilityPension() {
    this.claimDisabilityService.getClaimDisabilityPensionByPersonEventId(this.personEvent.personEventId).subscribe(result => {
      this.isSubmitDisabled = !result;
      this.getEarnings();
    });
  }

  getEarnings() {
    this.claimEarningService.getEarningsByPersonEventId(this.personEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.isSubmitToPdDisabled = !results.some(result => !result.isEstimated);
      } else {
        this.isSubmitToPdDisabled = true;
      }
      this.isLoading$.next(false);
    });
  }

  getClaimDisabilityAssessmentsByPersonEvent() {
    this.isLoading$.next(true);
    this.claimInvoiceService.getClaimDisabilityAssessment(this.personEvent.personEventId).subscribe(results => {
      if (results && results.length > 0) {
        this.totalPercentage = this.calculateProRataPension(results);
        if (this.totalPercentage >= 31) {
          this.getDisabilityPension();
        }
      }
      this.isLoading$.next(false);
    });
  }

  getClaimEstimatesByPersonEvent() {
    this.isLoading$.next(true);
    this.claimInvoiceService.GetClaimEstimateByPersonEvent(this.personEvent.personEventId).subscribe((results) => {
      if (results?.length > 0) {
        this.claimEstimates = results.filter(result => result.claimId === null || result.claimId === this.selectedClaim.claimId);
      } 
      this.isLoading$.next(false);
    });
  }

  closeClaim(claim: Claim) {
    this.isLoading$.next(true);
    this.loadingMessage$.next('Updating claim status... please wait');

    this.personEvent.personEventStatus = PersonEventStatusEnum.Closed;
    const index = this.personEvent.claims.findIndex(s => s.claimId == claim.claimId);
    if (index > -1) {
      this.personEvent.claims[index].claimStatus = ClaimStatusEnum.Closed;
      this.personEvent.claims[index].claimStatusId = +ClaimStatusEnum.Closed;
    }

    this.claimService.updatePersonEvent(this.personEvent).subscribe(result => {
      if (result) {
        this.alertService.successToastr('claim status updated successfully...');
        this.isLoading$.next(false);
      }
    });
  }
}
