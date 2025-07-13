import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { InvoiceFormService } from '../invoice-form.service';
import { ClaimInvoice } from '../../../entities/claim-invoice.model';
import { PayeeTypeEnum } from 'projects/medicare/src/app/medical-invoice-manager/enums/payee-type.enum';
import { SundryServiceProviderTypeEnum } from '../invoice-sundry/sundry-service-provider-type-enum';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import * as moment from 'moment';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-type-enum';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { Constants } from 'projects/claimcare/src/app/constants';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { UserReminderTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminderService } from 'projects/shared-services-lib/src/lib/services/user-reminder/user-reminder.service';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { TotalTemporaryDisability } from './totalTemporaryDisability';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { FinalInvoiceEnum } from 'projects/shared-models-lib/src/lib/enums/final-invoice-enum';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { UserReminderItemTypeEnum } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder-item-type-enum';
import { DaysOffInvoiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/daysoff-invoicetype-enum';
import { ClaimLiabilityStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-liability-status.enum';
import { NotesService } from 'projects/shared-components-lib/src/lib/notes/notes.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { Note } from 'projects/shared-components-lib/src/lib/notes/note';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { AccidentService } from 'projects/claimcare/src/app/claim-manager/Services/accident.service';
import { FirstMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/first-medical-report-form';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { ClaimInvoiceStatusEnum } from 'projects/shared-models-lib/src/lib/enums/claim-invoice-status.enum';
import { MatDialog } from '@angular/material/dialog';
import { HolisticSickNoteMedicalReportsComponent } from '../../claim-holistic-view/holistic-container-medical-reports/holistic-sicknote-medical-reports/holistic-sicknote-medical-reports.component';
import { MedicalInvoiceClaimService } from 'projects/medicare/src/app/medical-invoice-manager/services/medical-invoice-claim.service';
import { MedicalReportModel } from 'projects/claimcare/src/app/claim-manager/shared/entities/funeral/medicalReport.model';
import { ClaimBenefit } from '../../../entities/claim-benefit';
import { EstimateTypeEnum } from 'projects/shared-models-lib/src/lib/enums/estimate-type-enum';
import { ConfirmationDialogsService } from 'projects/shared-components-lib/src/lib/confirm-message/confirm-message.service';
import { ClaimEstimate } from '../../../entities/personEvent/claimEstimate';
import { DefaultConfirmationDialogComponent } from 'projects/shared-components-lib/src/lib/dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { ClaimNotificationRequest } from '../../../entities/personEvent/claim-notification-request';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MedicalFormReportTypeEnum } from 'projects/shared-models-lib/src/lib/enums/medical-form-report-type-enum';
import { MedicalFormService } from 'projects/digicare/src/app/medical-form-manager/services/medicalform.service';

@Component({
  selector: 'total-temporary-disability',
  templateUrl: './total-temporary-disability.component.html',
  styleUrls: ['./total-temporary-disability.component.css'],
  providers: [InvoiceFormService]
})
export class TotalTemporaryDisabilityComponent extends UnSubscribe implements OnChanges {

  claimInvoiceType = ClaimInvoiceTypeEnum.DaysOffInvoice;
  @Input() totalTemporaryDisability: TotalTemporaryDisability;
  @Input() isReadOnly = false;
  @Input() personEvent: PersonEventModel;
  @Input() documentSets: DocumentSetEnum[] = [];
  @Input() isRepay = false;
  @Input() selectedRepayReason: number;

  @Output() hideEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading days off invoice details...please wait');

  description$: BehaviorSubject<string> = new BehaviorSubject('');

  form: UntypedFormGroup;
  payeeTypes: PayeeTypeEnum[];
  invoiceTypes: DaysOffInvoiceTypeEnum[];
  finalInvoices: FinalInvoiceEnum[];
  payees: [];
  otherEmployers: SundryServiceProviderTypeEnum[];
  canSave: boolean;
  invoiceAmount = [Constants.invoiceAmount];
  users: User[];
  maxDate = new Date();
  minDate = new Date();
  endDate = new Date();
  minDateAlert: Date;
  showMinEventDate: Date;
  minEventDate: Date;
  isEdit = false;
  isDatesValid = false;
  firstMedicalReportForms: FirstMedicalReportForm[];
  documentSet = [DocumentSetEnum.TtdDocuments];
  filterRequiredDocuments = [DocumentTypeEnum.DaysOffInvoice];
  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  sickNote: MedicalReportModel[];
  ttdInvoices: TotalTemporaryDisability[];
  ttdInvoicesDateCheck: TotalTemporaryDisability[];

  selectedClaimEstimate: ClaimEstimate;
  claimNotificationRequest: ClaimNotificationRequest;

  dataSource = new MatTableDataSource<FirstMedicalReportForm>();
  selectedMedicalReport: FirstMedicalReportForm;


  constructor(private readonly formBuilder: UntypedFormBuilder,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly invoiceFormService: InvoiceFormService,
    public readonly claimCareService: ClaimCareService,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
    private readonly notesService: NotesService,
    private readonly authService: AuthService,
    private readonly userReminderService: UserReminderService,
    public readonly rolePlayerService: RolePlayerService,
    private readonly medicalFormService: MedicalFormService,
    public dialog: MatDialog) {
    super();
    this.getLookups();
  }

  ngOnChanges() {
    if (!this.totalTemporaryDisability) {
      this.totalTemporaryDisability = new TotalTemporaryDisability();
      this.totalTemporaryDisability.claimInvoice = new ClaimInvoice();
      this.totalTemporaryDisability.claimInvoice.claimInvoiceType = +this.claimInvoiceType;
    }
    this.createForm();
    this.getEvent();
    this.getEmployer();
    this.getFirstMedicalReportForm();
    this.getDaysOffInvoiceByPersonEventId();
    this.getClaimEstimate();
  }

  getFirstMedicalReportForm() {
    this.medicalFormService.GetFirstMedicalReportAccidentByPersonEventId(this.personEvent.personEventId).subscribe((firstMedicalReports) => {
      if (firstMedicalReports && firstMedicalReports.length > 0) {
        this.firstMedicalReportForms = firstMedicalReports;
        const linkedReport = this.firstMedicalReportForms.find(
          form => form.firstMedicalReportFormId === this.totalTemporaryDisability.firstMedicalReportFormId
        );

        if (linkedReport) {
          this.selectedMedicalReport = linkedReport;
        }

      } else {
        this.firstMedicalReportForms = [];
      }
      this.dataSource = new MatTableDataSource(this.firstMedicalReportForms);
    });
  }

  getLookups() {
    this.payeeTypes = this.ToArray(PayeeTypeEnum);
    this.invoiceTypes = this.ToArray(DaysOffInvoiceTypeEnum);
    this.finalInvoices = this.ToArray(FinalInvoiceEnum);
    this.otherEmployers = this.ToArray(SundryServiceProviderTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  getEmployer() {
    this.isLoading$.next(true);
    this.rolePlayerService.getRolePlayer(this.personEvent.companyRolePlayerId).subscribe(result => {
      this.form.controls["memberName"].setValue(result.displayName);
      this.isLoading$.next(false);
    })
  }

  populateForm() {
    if (this.totalTemporaryDisability.claimInvoiceId > 0) {
      this.GetDaysOffInvoicInvoice();
      if (!this.isRepay) {
        this.isEdit = true;
      }
    } else {
      this.setForm();
    }
  }

  GetDaysOffInvoicInvoice() {
    this.claimInvoiceService.GetDaysOffInvoicInvoice(this.totalTemporaryDisability.claimInvoiceId).subscribe(results => {
      this.totalTemporaryDisability = results;
      this.description$.next(results.description);
      this.totalTemporaryDisability.payeeRolePlayerId = results.payeeRolePlayerId;
      this.totalTemporaryDisability.claimInvoice.payeeRolePlayerId = results.payeeRolePlayerId;
      this.setForm();
    })
  }

  setForm() {
    this.endDate = this.totalTemporaryDisability && this.totalTemporaryDisability.daysOffTo ? this.totalTemporaryDisability.daysOffTo : null;
    this.form.patchValue({
      invoiceDate: this.totalTemporaryDisability && this.totalTemporaryDisability.dateReceived ? this.totalTemporaryDisability.dateReceived : null,
      dateReceived: this.totalTemporaryDisability && this.totalTemporaryDisability.dateReceived ? this.totalTemporaryDisability.dateReceived : null,
      payeeType: this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.payee ? this.totalTemporaryDisability.payee : null,
      payee: this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.payee ? this.totalTemporaryDisability.payee : null,
      invoiceAmount: this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.invoiceAmount ? this.totalTemporaryDisability.claimInvoice.invoiceAmount : null,
      invoiceType: this.totalTemporaryDisability && this.totalTemporaryDisability.invoiceType ? DaysOffInvoiceTypeEnum[this.totalTemporaryDisability.invoiceType] : null,
      description: this.totalTemporaryDisability && this.totalTemporaryDisability.description ? this.totalTemporaryDisability.description : null,
      memberName: this.totalTemporaryDisability && this.totalTemporaryDisability.memberName ? this.totalTemporaryDisability.memberName : null,
      dateOffFrom: this.totalTemporaryDisability && this.totalTemporaryDisability.daysOffFrom ? this.totalTemporaryDisability.daysOffFrom : null,
      dateOffTo: this.totalTemporaryDisability && this.totalTemporaryDisability.daysOffTo ? this.totalTemporaryDisability.daysOffTo : null,
      otherEmployer: this.totalTemporaryDisability && this.totalTemporaryDisability.otherEmployer ? this.totalTemporaryDisability.otherEmployer : null,
      finalInvoice: this.totalTemporaryDisability && this.totalTemporaryDisability.finalInvoice ? this.totalTemporaryDisability.finalInvoice : null,
    });
    this.totalTemporaryDisability.claimInvoice = new ClaimInvoice();
    this.totalTemporaryDisability.claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.DaysOffInvoice;
    this.totalTemporaryDisability.claimInvoice.invoiceDate = this.totalTemporaryDisability.dateReceived;
    this.endDateChanged(this.endDate);
    this.isLoading$.next(false);
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      dateReceived: [{ value: '' }],
      payeeType: [{ value: '' }],
      payee: [{ value: '' }],
      description: [{ value: null, disabled: false }],
      memberName: [{ value: '', disabled: this.isReadOnly }],
      otherEmployer: [{ value: '', disabled: this.isReadOnly }],
      dateOffFrom: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      dateOffTo: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      invoiceType: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      finalInvoice: [{ value: '', disabled: this.isReadOnly }, Validators.required],
    });
    this.invoiceFormService.addForm(this.form);
    this.populateForm();
  }

  readForm(): TotalTemporaryDisability {
    if (!this.form) { return; }

    const formDetails = this.form.getRawValue();
    const genericForm = this.invoiceFormService.getGenericForm();

    this.totalTemporaryDisability = new TotalTemporaryDisability();

    this.totalTemporaryDisability.personEventId = this.personEvent.personEventId;
    this.totalTemporaryDisability.dateReceived = genericForm.dateReceived ? genericForm.dateReceived : genericForm.invoiceDate;
    this.totalTemporaryDisability.authorisedDaysOff = this.getDateDiff(formDetails.dateOffFrom, formDetails.dateOffTo);
    this.totalTemporaryDisability.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
    this.totalTemporaryDisability.payee = genericForm.payee ? genericForm.payee : null;
    this.totalTemporaryDisability.payeeRolePlayerId = +genericForm.payeeRolePlayer;
    this.totalTemporaryDisability.description = genericForm.description ? genericForm.description : String.Empty;
    this.totalTemporaryDisability.memberName = formDetails.memberName;
    this.totalTemporaryDisability.otherEmployer = formDetails.otherEmployer ? formDetails.otherEmployer : null;
    this.totalTemporaryDisability.daysOffFrom = this.getAdjustedDate(new Date(formDetails.dateOffFrom));
    this.totalTemporaryDisability.daysOffTo = this.getAdjustedDate(new Date(formDetails.dateOffTo));
    this.totalTemporaryDisability.totalDaysOff = this.getDateDiff(formDetails.dateOffFrom, formDetails.dateOffTo);
    this.totalTemporaryDisability.invoiceType = +DaysOffInvoiceTypeEnum[formDetails.invoiceType];
    this.totalTemporaryDisability.finalInvoice = formDetails.finalInvoice ? formDetails.finalInvoice : null;
    this.totalTemporaryDisability.createdBy = this.personEvent.createdBy;
    this.totalTemporaryDisability.createdDate = this.personEvent.createdDate;
    this.totalTemporaryDisability.modifiedBy = this.personEvent.modifiedBy;
    this.totalTemporaryDisability.modifiedDate = this.personEvent.modifiedDate;
    this.totalTemporaryDisability.firstMedicalReportFormId = this.selectedMedicalReport.firstMedicalReportFormId;
    this.totalTemporaryDisability.claimInvoice = this.getClaimInvoice(this.personEvent.claims[0]);
    this.totalTemporaryDisability.claimInvoice.claimInvoiceRepayReason = this.selectedRepayReason > 0 ? this.selectedRepayReason : undefined;

    return this.totalTemporaryDisability;
  }

  getClaimInvoice(claim: Claim): ClaimInvoice {
    const genericForm = this.invoiceFormService.getGenericForm();
    let claimInvoice = new ClaimInvoice();
    claimInvoice.claimId = claim.claimId;
    claimInvoice.claimInvoiceType = ClaimInvoiceTypeEnum.DaysOffInvoice;
    claimInvoice.claimBenefitId = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.claimBenefitId ? this.totalTemporaryDisability.claimInvoice.claimBenefitId : 10;
    claimInvoice.dateReceived = genericForm.invoiceDate;
    claimInvoice.invoiceDate = genericForm.invoiceDate;
    claimInvoice.dateSubmitted = genericForm.invoiceDate;
    claimInvoice.invoiceAmount = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.invoiceAmount ? this.totalTemporaryDisability.claimInvoice.invoiceAmount : 0;
    claimInvoice.claimInvoiceStatusId = +ClaimInvoiceStatusEnum.Captured;
    claimInvoice.isAuthorised = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.isAuthorised ? this.totalTemporaryDisability.claimInvoice.isAuthorised : 0;
    claimInvoice.externalReferenceNumber = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.externalReferenceNumber ? this.totalTemporaryDisability.claimInvoice.externalReferenceNumber : 'Test Ref No';
    claimInvoice.internalReferenceNumber = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.internalReferenceNumber ? this.totalTemporaryDisability.claimInvoice.internalReferenceNumber : null;
    claimInvoice.claimReferenceNumber = claim.claimReferenceNumber;
    claimInvoice.policyId = claim && claim.policyId ? claim.policyId : 0;
    claimInvoice.policyNumber = this.totalTemporaryDisability.claimInvoice && this.totalTemporaryDisability.claimInvoice.policyNumber ? this.totalTemporaryDisability.claimInvoice.policyNumber : null;
    claimInvoice.capturedDate = new Date();
    return claimInvoice;
  }

  getDateDiff(dateOffFrom: Date, dateOffTo: Date) {
    let firstDate = moment(dateOffFrom);
    let secondDate = moment(dateOffTo);
    return Math.abs(firstDate.diff(secondDate, 'days')) + 1;
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formValid(): boolean {
    return this.invoiceFormService.isValidSave();
  }

  save() {
    if (!this.selectedMedicalReport) {
      this.openMessageDialog('Requirements Outstanding', 'Please select either first medical report or sick note report');
    } else if (this.selectedMedicalReport && !this.areDaysOffDatesValid()) {
      this.openMessageDialog('Requirements Outstanding', 'Please select days off from and to dates that will match with selected report dates');
    } else {
      this.isLoading$.next(true);
      this.hideEmit.emit(true);
      let totalTemporaryDisability = this.readForm();

      this.claimInvoiceService.getClaimBenefitsByClaimId(this.personEvent.claims[0].claimId).subscribe(result => {
        if (result && result[0].claimBenefitId > 0) {
          totalTemporaryDisability.claimInvoice.claimBenefitId = result[0].claimBenefitId;
          this.addInvoice(totalTemporaryDisability);
        }
        else {
          this.claimInvoiceService.getClaimBenefitFormulaByEstimateType(EstimateTypeEnum.DaysOff).subscribe(result => {
            if (result) {
              let claimBenefit = new ClaimBenefit();
              claimBenefit.claimId = this.personEvent.claims[0].claimId;
              claimBenefit.benefitId = result.benefitId;
              claimBenefit.estimatedValue = 0;

              this.claimInvoiceService.addClaimBenefit(claimBenefit).subscribe(result => {
                if (result && result > 0) {
                  totalTemporaryDisability.claimInvoice.claimBenefitId = result;
                  this.addInvoice(totalTemporaryDisability);
                }
              })
            }
          })
        }
      });
      this.createReminder();
    }
  }

  addInvoice(totalTemporaryDisabilityInvoice: TotalTemporaryDisability) {
    const isInvoiceAutoRejected = this.IsAutoRejectTTDLiabilityNotCaptured(this.personEvent.claims[0]);
    if (isInvoiceAutoRejected) {
      totalTemporaryDisabilityInvoice.claimInvoice.claimInvoiceStatusId = +ClaimInvoiceStatusEnum.Rejected;
      this.claimInvoiceService.AddDaysOffInvoice(totalTemporaryDisabilityInvoice).subscribe(result => {
        if (result) {
          const note = new Note();
          note.text = "Invoice is auto rejected due to pending liability decision.";
          note.itemId = totalTemporaryDisabilityInvoice.claimInvoiceId;
          note.itemType = 'DaysOffInvoice';
          note.isActive = true;
          this.notesService.addNote(ServiceTypeEnum.ClaimManager, note).subscribe();
          this.alertService.error("Invoice is auto rejected due to pending liability decision.", "Warning", true);
          this.claimInvoiceService.daysOffInvoiceRejectCommunication(this.personEvent.personEventId, totalTemporaryDisabilityInvoice.claimInvoiceId).subscribe();
          this.closeEmit.emit(true);
        }
      });

    }
    else {
      if (this.ttdInvoices?.length > 0) {
        const lastDateTo = this.ttdInvoices[this.ttdInvoices.length - 1].daysOffTo;
        const daysOffFromActual = this.getAdjustedDate(new Date(this.minDate));
        const daysDiff = this.getDateDiff(lastDateTo, daysOffFromActual);

        if (daysDiff > 2) {
          this.openDaysOffInvoiceDialog(totalTemporaryDisabilityInvoice);
        }
        else {
          this.addDaysOff(totalTemporaryDisabilityInvoice);
        }
      }
      else {
        this.addDaysOff(totalTemporaryDisabilityInvoice);
      }
    }
  }

  calculateDifference(newDaysOff: number): number {
    if (!this.selectedClaimEstimate || !this.selectedClaimEstimate.estimatedValue && !this.selectedClaimEstimate.estimatedDaysOff) {
      return 0;
    }

    const dailyRate = this.selectedClaimEstimate.estimatedValue / this.selectedClaimEstimate.estimatedDaysOff;

    const allocatedAmount = dailyRate * newDaysOff;

    return allocatedAmount;
  }


  addDaysOff(totalTemporaryDisabilityInvoice: TotalTemporaryDisability) {
    const result = this.calculateDifference(totalTemporaryDisabilityInvoice.totalDaysOff);

    totalTemporaryDisabilityInvoice.claimInvoice.authorisedAmount = result;
    totalTemporaryDisabilityInvoice.claimInvoice.invoiceAmount = result;

    this.claimInvoiceService.AddDaysOffInvoice(totalTemporaryDisabilityInvoice).subscribe(result => {
      if (!result) return; // Exit early if addition fails

      let originalTotalDaysOff = this.ttdInvoices.reduce((sum, item) => sum + item.totalDaysOff, 0);
      let newTotalDaysOff = originalTotalDaysOff + totalTemporaryDisabilityInvoice.totalDaysOff;
      let triggerRecalculate = newTotalDaysOff > this.selectedClaimEstimate.estimatedDaysOff;

      this.selectedClaimEstimate.estimatedDaysOff = triggerRecalculate
        ? newTotalDaysOff
        : this.selectedClaimEstimate.estimatedDaysOff;

      this.selectedClaimEstimate.authorisedDaysOff = totalTemporaryDisabilityInvoice.totalDaysOff;
      this.selectedClaimEstimate.allocatedDaysOff = totalTemporaryDisabilityInvoice.totalDaysOff;
      this.selectedClaimEstimate.authorisedValue = totalTemporaryDisabilityInvoice.claimInvoice.invoiceAmount;
      this.selectedClaimEstimate.allocatedValue = totalTemporaryDisabilityInvoice.claimInvoice.invoiceAmount;

      this.claimInvoiceService.updateClaimEstimate(this.selectedClaimEstimate).subscribe(result => {
        if (result && triggerRecalculate) {
          // If recalculation is needed, trigger recalculation
          this.claimInvoiceService.recalculateClaimEstimates([this.selectedClaimEstimate]).subscribe();
        }
        this.closeEmit.emit(true);
      });
      this.notifyPersonEventOwner('TTD invoice captured for claim number');
    });
  }

  notifyPersonEventOwner(message: string) {
    this.claimNotificationRequest = {
      personEventId: this.personEvent.personEventId,
      message,
      defaultRoleName: 'Claims Assessor'
    };

    this.claimCareService.notifyPersonEventOwnerOrDefault(this.claimNotificationRequest).subscribe(result => {
      this.alertService.success('Claim owner has been notified');
    });
  }

  IsAutoRejectTTDLiabilityNotCaptured(claim: Claim): boolean {
    const autoRejectStatuses = [
      ClaimLiabilityStatusEnum.Pending,
      ClaimLiabilityStatusEnum.LiabilityNotAccepted,
      ClaimLiabilityStatusEnum.NoCover,
      ClaimLiabilityStatusEnum.UnderInvestigation,
      ClaimLiabilityStatusEnum.Repudiated
    ];

    return autoRejectStatuses.includes(claim.claimLiabilityStatus);
  }

  openDaysOffInvoiceDialog(totalTemporaryDisabilityInvoice: TotalTemporaryDisability) {
    const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
      width: '40%',
      disableClose: true,
      data: {
        title: 'Days Off Invoice',
        text: `Days off invoice has gaps, would you like to continue?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addDaysOff(totalTemporaryDisabilityInvoice);
      } else {
        this.isLoading$.next(false);
      }
    });
  }

  update() {
    if (!this.selectedMedicalReport) {
      this.openMessageDialog('Requirements Outstanding', 'Please select either first medical report or sick note report');
    } else if (this.selectedMedicalReport && !this.areDaysOffDatesValid()) {
      this.openMessageDialog('Requirements Outstanding', 'Please select days off from and to dates that will match with selected report dates');
    } else {
    this.isLoading$.next(true);
    const formDetails = this.form.getRawValue();
    const genericForm = this.invoiceFormService.getGenericForm();
    this.claimInvoiceService.GetDaysOffInvoicInvoice(this.totalTemporaryDisability.claimInvoiceId).subscribe(result => {
      if (result) {
        result.description = genericForm.description ? genericForm.description : String.Empty;
        result.claimInvoice.invoiceDate = genericForm.invoiceDate;
        result.claimInvoice.dateReceived = genericForm.invoiceDate;
        result.payeeTypeId = +PayeeTypeEnum[genericForm.payeeType];
        result.payee = genericForm.payee;

        result.otherEmployer = formDetails.otherEmployer ? formDetails.otherEmployer : null;
        result.daysOffFrom = formDetails.dateOffFrom;
        result.daysOffTo = formDetails.dateOffTo;
        result.totalDaysOff = this.getDateDiff(formDetails.dateOffFrom, formDetails.dateOffTo);
        result.invoiceType = +DaysOffInvoiceTypeEnum[formDetails.invoiceType];
        result.finalInvoice = formDetails.finalInvoice ? formDetails.finalInvoice : null;
        result.payeeRolePlayerId = +genericForm.payeeRolePlayer;

        this.rolePlayerService.getRolePlayer(this.personEvent.companyRolePlayerId).subscribe(data => {
          this.claimInvoiceService.getTTDBenefit(data.company.industryClass, result.totalDaysOff, this.personEvent.personEventId).subscribe(benefit => {
            result.claimInvoice.authorisedAmount = benefit;
            result.claimInvoice.invoiceAmount = benefit;
            this.claimInvoiceService.updateDaysOffInvoice(result).subscribe(data => {
              if (data) {
                this.closeEmit.emit(true);
              }
            });
          });
        });
      }
    })
    }
  }

  createReminder() {
    let permission = Constants.ccaRole;
    var claim = this.personEvent.claims[0];

    this.userService.getUsersByRoleName(permission).subscribe(result => {
      if (result) {
        let alertDate = new Date(this.minDateAlert.setMonth(this.minDateAlert.getMonth() + 18));
        const alertDateBefore = new Date(alertDate.setDate(alertDate.getDate() - 7));
        const alertDateAfter = new Date(alertDate.setDate(alertDate.getDate() + 14));
        const users = result.filter(a => a.roleId != 1)
        this.users = result.filter(a => a.roleId != 1);
        users.forEach(user => {
          for (let i = 0; i < 2; i++) {
            if (i === 0) {
              this.createUserReminders(user, claim, alertDateBefore);
            }
            else if (i === 1) {
              this.createUserReminders(user, claim, alertDateAfter);
            }
          }

        });
      }
    });
  }

  createUserReminders(user: User, claim: Claim, alertDate: any) {
    const userReminders: UserReminder[] = [];
    const userReminder = new UserReminder();
    userReminder.userReminderType = UserReminderTypeEnum.Reminder;
    userReminder.assignedByUserId = this.authService.getCurrentUser().id;
    userReminder.text = `TTD 18 months with ref no : ${claim.claimReferenceNumber}`;;
    userReminder.assignedToUserId = user.id;
    userReminder.alertDateTime = alertDate;
    userReminder.itemId = this.personEvent.personEventId;
    userReminder.userReminderItemType = UserReminderItemTypeEnum.PersonEvent;
    userReminders.push(userReminder);
    this.userReminderService.createUserReminders(userReminders).subscribe(result => {
      if (result) {
      }
    });
  }

  getEvent() {
    this.claimCareService.getEvent(this.personEvent.eventId).subscribe(result => {
      this.minDateAlert = new Date(result.eventDate);
      this.setDocSetsFromEventType();
      if (result.eventType === EventTypeEnum.Accident) {
        this.minEventDate = new Date(result.eventDate);
      }
      else if (result.eventType === EventTypeEnum.Disease) {
        if (result.personEvents) {
          this.minEventDate = new Date(result.personEvents[0].personEventDiseaseDetail.dateDiagnosis);
        }
      }
    })
  }

  startDateChanged(value: Date) {
    this.minDate = value;
    if (this.endDate && this.endDate !== null) {
      this.endDateChanged(this.endDate);
    }
  }

  endDateChanged(value: Date) {
    const startDate = this.getAdjustedDate(new Date(this.minDate));
    this.endDate = this.getAdjustedDate(new Date(value));
    const dateDiff = this.getDateDiff(this.minDate, this.endDate);

    if (this.isEdit && this.ttdInvoices && this.ttdInvoices.length > 0) {
      const foundIndex = this.ttdInvoices.findIndex(x => x.claimInvoiceId === this.totalTemporaryDisability.claimInvoiceId);
      this.ttdInvoicesDateCheck = this.ttdInvoices.filter((data, idx) => idx !== foundIndex);
    }
    else {
      this.ttdInvoicesDateCheck = this.ttdInvoices;
    }

    if (this.ttdInvoicesDateCheck && this.ttdInvoicesDateCheck.length > 0) {
      const startDateOverlap = this.ttdInvoicesDateCheck.filter((item: any) =>
        this.getAdjustedDate(new Date(item.daysOffFrom)) <= startDate && this.getAdjustedDate(new Date(item.daysOffTo)) >= startDate
      );

      const endDateOverlap = this.ttdInvoicesDateCheck.filter((item: any) =>
        this.getAdjustedDate(new Date(item.daysOffFrom)) <= this.endDate && this.getAdjustedDate(new Date(item.daysOffTo)) >= this.endDate
      );

      if ((startDateOverlap && startDateOverlap.length > 0) || (endDateOverlap && endDateOverlap.length > 0)) {
        this.alertService.error("Date overlap with already existing invoice/s.", "Error", true);
        this.isDatesValid = false;
      }
      else {
        this.isDatesValid = true;
      }
    }
    else {
      this.isDatesValid = true;

    }

  }

  getAdjustedDate(date: Date): Date {
    const diff = date.getTimezoneOffset();
    const dtm = new Date(date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes() - diff,
      0);
    return dtm;
  }

  getDaysOffInvoiceByPersonEventId() {
    this.claimInvoiceService.getDaysOffInvoiceByPersonEventId(this.personEvent.personEventId).subscribe(result => {
      this.ttdInvoices = result;
    });
  }

  getClaimEstimate() {
    this.claimInvoiceService.GetClaimEstimateByPersonEvent(this.personEvent.personEventId).subscribe(results => {
      if (results?.length > 0) {
        this.selectedClaimEstimate = results.filter(s => s.estimateType === EstimateTypeEnum.TTD)[0];
      }
    });
  }

  setDocSetsFromEventType() {
    let isPersonalDocument = this.documentSets.some(a => a === +DocumentSetEnum.CommonPersonalDocuments)
    if (!isPersonalDocument) {
      this.documentSets.push(DocumentSetEnum.CommonPersonalDocuments);
    }
  }

  getDisplayedColumnsForFirstMedicalReport() {
    let columnDefinitions = [
      { def: 'select', show: true },
      { def: 'practitioner', show: true },
      { def: 'mechanismOfInjury', show: true },
      { def: 'clinicalDescription', show: true },
      { def: 'firstDayOff', show: true },
      { def: 'lastDayOff', show: true },
      { def: 'estDaysOff', show: true },
      { def: 'reportType', show: true },
    ];

    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }

  addCheckedItems($event: MatCheckboxChange, row: FirstMedicalReportForm) {
    if ($event.checked) {
      this.selectedMedicalReport = row;
    }
    else {
      this.selectedMedicalReport = null;
    }
  }

  autoSelectLinkedReport(row: FirstMedicalReportForm): boolean {
    return this.selectedMedicalReport?.firstMedicalReportFormId === row.firstMedicalReportFormId
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

  areDaysOffDatesValid() {
    return this.selectedMedicalReport &&
      new Date(this.selectedMedicalReport.firstDayOff).toDateString() === new Date(this.form.get('dateOffFrom')?.value).toDateString() &&
      new Date(this.selectedMedicalReport.lastDayOff).toDateString() === new Date(this.form.get('dateOffTo')?.value).toDateString();
  }

  getReportTypeLabel(reportTypeId: number): string {
    return MedicalFormReportTypeEnum[reportTypeId].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }
}
