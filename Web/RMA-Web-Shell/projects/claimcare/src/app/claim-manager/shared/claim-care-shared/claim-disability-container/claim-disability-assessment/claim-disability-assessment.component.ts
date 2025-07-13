import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DisabilityFormService } from '../disability-form.service';
import { Claim } from '../../../entities/funeral/claim.model';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { UserReminder } from 'projects/shared-models-lib/src/lib/user-reminders-and-messages/user-reminder';
import { FinalMedicalReportForm } from 'projects/digicare/src/app/medical-form-manager/models/final-medical-report-form';
import { ToastrManager } from 'ng6-toastr-notifications';
import { CommonNotesService } from 'projects/shared-services-lib/src/lib/services/common-notes.service';
import { CommonNote } from 'projects/shared-models-lib/src/lib/common/common-note';
import { NoteCategoryEnum } from 'projects/shared-models-lib/src/lib/enums/note-category-enum';
import { NoteItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-item-type-enum';
import { CommonNoteModule } from 'projects/shared-models-lib/src/lib/common/common-note-module';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { NoteTypeEnum } from 'projects/shared-models-lib/src/lib/enums/note-type-enum';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { DisabilityAssessmentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/disability-assessment-status-enum';
import { concatMap, finalize, switchMap } from 'rxjs/operators';
import { ClaimCareService } from '../../../../Services/claimcare.service';

@Component({
  selector: 'claim-disability-assessment',
  templateUrl: './claim-disability-assessment.component.html',
  styleUrls: ['./claim-disability-assessment.component.css']
})
export class ClaimDisabilityAssessmentComponent extends UnSubscribe implements OnChanges {

  @Input() claimDisabilityAssessment: ClaimDisabilityAssessment;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false; // optional
  @Input() user: User;
  @Input() actionType: string;

  claims: Claim[] = [];
  UserReminders: UserReminder[] = [];

  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() refreshClaimEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading disability details...please wait');

  form: UntypedFormGroup;
  filterByUserId: number;
  currentQuery: any;
  filteredUsers: User[];
  existingClaimDisabilities: ClaimDisabilityAssessment[];
  users: User[];
  maxDate: Date;
  currentUser: User;
  selectedMedicalReports = new Array<FinalMedicalReportForm>();
  invalidDate = false;
  duplicateAssessmentReport = false;
  isMedicalReportSelected = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public readonly disabilityFormService: DisabilityFormService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    public readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly claimCareService: ClaimCareService,
    private readonly alertService: ToastrManager,
    private readonly commonNotesService: CommonNotesService,
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(): void {
    this.getData();
    this.createForm();
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      assessmentDate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      finalFiagnosis: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      rawPdPercentage: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      netAssessedPdPercentage: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      assessedBy: [{ value: 0, disabled: true }, Validators.required],
      linkedReport: [{value: false, disabled: this.isReadOnly }]
    });

    this.disabilityFormService.addForm(this.form);
    this.populateForm();
  }

  getData() {
    this.maxDate = new Date();
    this.getClaim();
    this.getUsersByWorkPoolPermission();
    this.getDisabilityAssessmentDetails();
  }

  getDisabilityAssessmentDetails() {
    this.claimInvoiceService.getClaimDisabilityAssessment(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        this.existingClaimDisabilities = result;
      }
    });
  }

  populateForm() {
    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      assessmentDate: this.claimDisabilityAssessment && this.claimDisabilityAssessment.assessmentDate ? this.claimDisabilityAssessment.assessmentDate : null,
      finalFiagnosis: this.claimDisabilityAssessment && this.claimDisabilityAssessment.finalDiagnosis ? this.claimDisabilityAssessment.finalDiagnosis : null,
      rawPdPercentage: this.claimDisabilityAssessment && this.claimDisabilityAssessment.rawPdPercentage ? this.claimDisabilityAssessment.rawPdPercentage : null,
      netAssessedPdPercentage: this.claimDisabilityAssessment && this.claimDisabilityAssessment.nettAssessedPdPercentage ? this.claimDisabilityAssessment.nettAssessedPdPercentage : null,
      assessedBy: this.claimDisabilityAssessment && this.claimDisabilityAssessment.assessedBy ? this.claimDisabilityAssessment.assessedBy : this.setCurrentUserByDefault(),
    });

    this.isLoading$.next(false);
  }

  readForm(): ClaimDisabilityAssessment[] {
    const formDetails = this.form.getRawValue();
  
    return this.claims.map(claim => {
      const claimDisability = new ClaimDisabilityAssessment();
      
      claimDisability.claimDisabilityAssessmentId = this.claimDisabilityAssessment?.claimDisabilityAssessmentId 
                                                    ? this.claimDisabilityAssessment.claimDisabilityAssessmentId
                                                    : 0;
      claimDisability.personEventId = this.personEvent.personEventId;
      claimDisability.assessmentDate = formDetails.assessmentDate;
      claimDisability.rawPdPercentage = formDetails.rawPdPercentage;
      claimDisability.nettAssessedPdPercentage = formDetails.netAssessedPdPercentage;
      claimDisability.assessedBy = formDetails.assessedBy;
      claimDisability.finalDiagnosis = formDetails.finalFiagnosis;
      claimDisability.disabilityAssessmentStatus = DisabilityAssessmentStatusEnum.New;
      claimDisability.createdBy = this.currentUser.email.toLowerCase();
      claimDisability.createdDate = new Date().getCorrectUCTDate();
      claimDisability.modifiedBy = this.currentUser.email.toLowerCase();
      claimDisability.modifiedDate = new Date();
      claimDisability.claimId = claim.claimId;
      claimDisability.isAuthorised = false;
      claimDisability.medicalReportFormId = this.selectedMedicalReports[0]?.medicalReportForm?.medicalReportFormId;
  
      return claimDisability;
    });
  }
  

  getClaim() {
    this.claims = [...this.personEvent.claims];
  }

  formValid(): boolean {
    return this.form.valid && !this.form.pristine;
  }

  setCurrentUserByDefault(): number {
    return this.currentUser.id;
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

  onUserKeyChange(value: string) {
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
    }
    else {
      return filteredList.filter(user => user.displayName.toLocaleLowerCase().includes(filter));
    }
  }

  save() {
    const disabilityForms = this.readForm();
    if (!this.isDisabilityAssessmentDateValid()) { return; }
  
    if (this.isDisabilityAssessmentDuplicate(disabilityForms)) { return; }
  
    this.isLoading$.next(true);
  
    from(disabilityForms).pipe(
      concatMap(form =>
        this.claimInvoiceService.addClaimDisabilityAssessment(form).pipe(
          switchMap(() => this.updateClaimPD(form)) 
        )
      ),
      finalize(() => {
        this.alertService.successToastr('Disability assessment(s) created successfully', 'success', true);
        disabilityForms.forEach(form => {
          this.addNote(
            `Disability Assessed PD% (Raw - ${form.rawPdPercentage}% & Net - ${form.nettAssessedPdPercentage}%)`,
            NoteTypeEnum.DisabilityRelated
          );
        });
        this.closeEmit.emit(true);
        this.isLoading$.next(false);
      })
    ).subscribe();
  }
  

  isDisabilityAssessmentDateValid(): boolean {
    let isValidDate = false;
    const assessmentDate = this.getNormalizedDate(this.form.controls.assessmentDate.value);

    this.selectedMedicalReports.forEach(report => {
      const stabilizedDate = this.getNormalizedDate(report.medicalReportForm.consultationDate);
      if (this.formatDate(stabilizedDate) === this.formatDate(assessmentDate)
        || stabilizedDate < assessmentDate) {
        isValidDate = true;
      }
    });

    if (!isValidDate) {
      this.invalidDate = true;
      return false;
    }
    return true;
  }

  getNormalizedDate(dateValue: any): Date {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDisabilityAssessmentDuplicate(claimDisabilities: ClaimDisabilityAssessment[]): boolean {
    const duplicate = claimDisabilities.some(disability =>
      this.existingClaimDisabilities.some(existing =>
        existing.medicalReportFormId === disability.medicalReportFormId
      )
    );
  
    if (duplicate) {
      this.duplicateAssessmentReport = true;
      return true;
    }
  
    return false;
  }
  

  update() {
    const disabilityFormList = this.readForm();
    if (!this.isDisabilityAssessmentDateValid()) { return; }
  
    this.isLoading$.next(true);
  
    from(disabilityFormList).pipe(
      concatMap(disabilityForm =>
        this.claimInvoiceService.updateClaimDisabilityAssessment(disabilityForm).pipe(
          switchMap(result => {
            if (result) {
              this.alertService.successToastr('Disability assessment updated successfully', 'success', true);
              this.addNote(
                `Disability Updated PD% (Raw - ${disabilityForm.rawPdPercentage}% & Net - ${disabilityForm.nettAssessedPdPercentage}%)`,
                NoteTypeEnum.DisabilityRelated
              );
              return this.updateClaimPD(disabilityForm);
            }
            return of(null); 
          })
        )
      ),
      finalize(() => {
        this.closeEmit.emit(true);
        this.isLoading$.next(false);
      })
    ).subscribe({
      error: () => {
        this.isLoading$.next(false);
        this.alertService.errorToastr('Error updating one or more disability assessments', 'Error');
      }
    });
  }
  

  updateClaimPD(claimDisabilityAssessment: ClaimDisabilityAssessment): Observable<any> {
    const claim = this.claims.find(x => x.claimId === claimDisabilityAssessment.claimId);
    if (claim) {
      claim.disabilityPercentage = claimDisabilityAssessment.rawPdPercentage;
      return this.claimCareService.updateClaimPD(claim);
    }
    return of(null);
  }
  
  
  

  getUsersByWorkPoolPermission() {
    this.isLoading$.next(true);
    var workpool = WorkPoolEnum[WorkPoolEnum.CcaPool];
    let permission = this.formatText(workpool);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.filteredUsers = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.isLoading$.next(false);
      }
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  onSelectedFinalMedicalReport(medicalReports: FinalMedicalReportForm[]) {
    this.isMedicalReportSelected = false;
    if (medicalReports.length > 0) {
      this.isMedicalReportSelected = true;
      this.selectedMedicalReports = medicalReports;
      this.form.patchValue({ linkedReport: true });
      // mark the form as touched
      this.form.markAsDirty();
    }
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
}
