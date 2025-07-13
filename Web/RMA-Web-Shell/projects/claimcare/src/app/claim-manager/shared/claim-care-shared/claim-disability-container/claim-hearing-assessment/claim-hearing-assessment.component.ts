import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormArray, Validators, FormArray, FormGroup } from '@angular/forms';
import { DisabilityFormService } from '../disability-form.service';
import { Claim } from '../../../entities/funeral/claim.model';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { UserService } from 'projects/shared-services-lib/src/lib/services/security/user/user.service';
import { WorkPoolEnum } from 'projects/shared-models-lib/src/lib/enums/work-pool-enum';
import { AssessmentTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/AssessmentTypeEnum';
import { AccidentService } from '../../../../Services/accident.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { ClaimHearingAssessment } from '../../../entities/claim-hearing-assessment';
import { AudioGramItem } from '../../../entities/audio-gram-item';
import { ClaimInvoiceService } from '../../../../services/claim-invoice.service';
import { ClaimDisabilityAssessment } from '../../../entities/claim-disability-assessment';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ToastrManager } from 'ng6-toastr-notifications';
import { DisabilityAssessmentStatusEnum } from 'projects/shared-models-lib/src/lib/enums/disability-assessment-status-enum';


@Component({
  selector: 'claim-hearing-assessment',
  templateUrl: './claim-hearing-assessment.component.html',
  styleUrls: ['./claim-hearing-assessment.component.css']
})
export class ClaimHearingAssessmentComponent extends UnSubscribe implements OnChanges {

  @Input() claimHearingAssessment: ClaimHearingAssessment;
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() user: User;
  @Input() actionType: string;

  claim: Claim;
  users: User[];

  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessages$: BehaviorSubject<string> = new BehaviorSubject('loading disability details...please wait');
  
  form: UntypedFormGroup;
  filterByUserId: number;
  currentQuery: any;
  filteredUsers: User[];
  
  currentUser: User;
  maxDate: Date;
  assessmentTypes: AssessmentTypeEnum[];
  hearingAssessmentType: AssessmentTypeEnum;
  existingHearingAssessments: ClaimHearingAssessment[];
  isDisabled: boolean = true;
  isAudiogramSelected: boolean = false;
  isDiagnosticSelected: boolean = false;
  newBaselinePercentage: number;
  permDisabilityPercentage: number;

  constructor(
    public userService: UserService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly disabilityFormService: DisabilityFormService,
    private readonly claimAccidentService: AccidentService,
    private readonly claimInvoiceService: ClaimInvoiceService,
    private readonly authService: AuthService,
    private readonly alertService: ToastrManager,
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(): void {
    this.getData();
    this.createForm();
  }

  getData() {
    this.maxDate = new Date();
    this.getLookups();
    this.getClaim();
    this.getUsersByWorkPoolPermission();
  }

  createForm() {
    if (this.form) { return; }

    this.form = this.formBuilder.group({
      assessmentType: [{ value: 0, disabled: this.isReadOnly },],
      description: [{ value: '', disabled: this.isReadOnly }],
      memberName: [{ value: '', disabled: this.isReadOnly }],
      assessedBy: [{ value: '', disabled: true }],
      assessmentDate: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      captureAudiogram: [{ value: '', disabled: this.isReadOnly }, Validators.required],
      percentageHl: [{ value: 0.0, disabled: true }, Validators.required],
      audioGramItems: this.formBuilder.array([]),
      baselinePHL: [{ value: 0.0, disabled: true }],
      totalPermanentDisablement: [{ value: 0.0, disabled: true }]
    });
    // initialize audiogram items
    [500, 1000, 2000, 3000, 4000].forEach(frequency => {
      this.audioGramItemsFormArray.push(this.item({ frequency }));
    });

    this.disabilityFormService.addForm(this.form);
  }

  populateForm() {
    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      assessmentType: this.claimHearingAssessment && this.claimHearingAssessment.hearingAssessmentTypeId ? AssessmentTypeEnum[this.claimHearingAssessment.hearingAssessmentTypeId] : null,
      description: this.claimHearingAssessment && this.claimHearingAssessment.description ? this.claimHearingAssessment.description : null,
      memberName: this.claimHearingAssessment && this.claimHearingAssessment.assessedByName ? this.claimHearingAssessment.assessedByName : null,
      assessedBy: this.claimHearingAssessment && this.claimHearingAssessment.assessedByUserId ? this.claimHearingAssessment.assessedByUserId : this.setCurrentUserByDefault(),
      assessmentDate: this.claimHearingAssessment && this.claimHearingAssessment.assessmentDate ? this.claimHearingAssessment.assessmentDate : null,
      captureAudiogram: this.claimHearingAssessment && this.claimHearingAssessment.captureAudiogram ? this.claimHearingAssessment.captureAudiogram : false,
      percentageHl: this.claimHearingAssessment && this.claimHearingAssessment.percentageHl ? this.claimHearingAssessment.percentageHl : null,
      audioGramItems: this.claimHearingAssessment && this.claimHearingAssessment.audioGramItems ? this.claimHearingAssessment.audioGramItems : null,
    });

    if (this.claimHearingAssessment?.audioGramItems) {
      this.isAudiogramSelected = true;
      this.form.patchValue({ captureAudiogram: 'Yes' });
      this.populateAudioGramFormArray(this.claimHearingAssessment.audioGramItems);
      this.setPreviousBaselineHearing();
    }
  };

  readForm(): ClaimHearingAssessment {
    if (!this.form) { return; }

    const formDetails = this.form.getRawValue();

    const claimHearing = this.claimHearingAssessment ? this.claimHearingAssessment : new ClaimHearingAssessment();

    const newBaselineAudiogram = +AssessmentTypeEnum[formDetails.assessmentType] === AssessmentTypeEnum.Diagnostic
                    ? (formDetails.percentageHl - formDetails.baselinePHL) : 0.0;

    claimHearing.rolePlayerId = this.personEvent.insuredLifeId;
    claimHearing.hearingAssessmentTypeId = +AssessmentTypeEnum[formDetails.assessmentType];
    claimHearing.assessedByUserId = formDetails.assessedBy;
    claimHearing.assessedByName = formDetails.memberName;
    claimHearing.description = formDetails.description;
    claimHearing.assessmentDate = formDetails.assessmentDate;
    claimHearing.personEventId = this.personEvent.personEventId;
    claimHearing.captureAudiogram = this.isAudiogramSelected;
    claimHearing.percentageHl = formDetails.percentageHl;
    claimHearing.baselinePhl = formDetails.baselinePHL ? formDetails.baselinePHL : 0.0;
    claimHearing.createdBy = claimHearing.createdBy ? claimHearing.createdBy : this.currentUser.email.toLowerCase();
    claimHearing.createdDate = claimHearing.createdDate ? claimHearing.createdDate : new Date();
    claimHearing.modifiedBy = this.currentUser.email.toLowerCase();
    claimHearing.modifiedDate = new Date;
    claimHearing.isActive = this.isAudiogramSelected;
    claimHearing.baselineAudiogram = newBaselineAudiogram;
    claimHearing.audioGramItems = this.getUpdatedAudioGramItems(formDetails);

    return claimHearing;
  }

  getUpdatedAudioGramItems(formDetails: any): AudioGramItem[] {
    return formDetails.audioGramItems.map((item, index) => ({
      audioGramItemId: this.claimHearingAssessment ? this.claimHearingAssessment.audioGramItems[index].audioGramItemId : 0,
      hearingAssessmentId: this.claimHearingAssessment ? this.claimHearingAssessment.audioGramItems[index].hearingAssessmentId : 0,
      dbLossLeftEar: item.dbLossLeftEar,
      dbLossRightEar: item.dbLossRightEar,
      frequency: item.frequency,
      percentageHl: item.percentageHl,
      createdBy: this.claimHearingAssessment ? this.claimHearingAssessment.audioGramItems[index].createdBy : this.currentUser.email.toLowerCase(),
      createdDate: this.claimHearingAssessment ? this.claimHearingAssessment.audioGramItems[index].createdDate : new Date().getCorrectUCTDate(),
      modifiedBy: this.currentUser.email.toLowerCase(),   
      modifiedDate: new Date().getCorrectUCTDate(),
    }));
  }

  get audioGramItemsFormArray() {
    return this.form.get('audioGramItems') as FormArray;
  }

  disabilityForm(hearingAssessment: ClaimHearingAssessment): ClaimDisabilityAssessment {

    const claimDisabilityForm = new ClaimDisabilityAssessment();

    claimDisabilityForm.personEventId = this.personEvent.personEventId;
    claimDisabilityForm.assessmentDate = hearingAssessment.assessmentDate;
    claimDisabilityForm.rawPdPercentage = this.permDisabilityPercentage;
    claimDisabilityForm.nettAssessedPdPercentage = this.permDisabilityPercentage;
    claimDisabilityForm.assessedBy = hearingAssessment.assessedByUserId;
    claimDisabilityForm.finalDiagnosis = hearingAssessment.description;
    claimDisabilityForm.disabilityAssessmentStatus = DisabilityAssessmentStatusEnum.New;
    claimDisabilityForm.createdBy = this.currentUser.email.toLowerCase();
    claimDisabilityForm.createdDate = new Date().getCorrectUCTDate();
    claimDisabilityForm.modifiedBy = this.currentUser.email.toLowerCase();
    claimDisabilityForm.modifiedDate = new Date().getCorrectUCTDate();
    claimDisabilityForm.claimId = this.claim.claimId;
    claimDisabilityForm.isAuthorised = false;

    return claimDisabilityForm;
  }

  setPreviousBaselineHearing() {
    this.isDiagnosticSelected = this.claimHearingAssessment.hearingAssessmentTypeId === +AssessmentTypeEnum.Diagnostic;

    if (this.isDiagnosticSelected) {
      this.form.patchValue({
        baselinePHL: this.claimHearingAssessment.baselinePhl,
        totalPermanentDisablement: this.caluculatePermanentDisablement(
          this.claimHearingAssessment.percentageHl, this.claimHearingAssessment.baselinePhl)
      });
    }
  }

  caluculatePermanentDisablement(percentageHl: number, previousBaseline: number): number {
    const percentage = Math.abs((percentageHl - previousBaseline) / 2);
    this.permDisabilityPercentage = parseFloat(percentage.toFixed(2)); // round to 2 decimal places
    return this.permDisabilityPercentage;
  }

  populateAudioGramFormArray(audioGramItems: AudioGramItem[]) {
    const arrayControl = this.audioGramItemsFormArray;

    if (arrayControl.length !== audioGramItems.length) {
      arrayControl.clear();
      audioGramItems.forEach(() => {
        arrayControl.push(this.item());
      });
    }

    audioGramItems.forEach((result, index) => {
      arrayControl.at(index).patchValue({
        audioGramItemId: result.audioGramItemId,
        hearingAssessmentId: result.hearingAssessmentId,
        dBLossLeftEar: result.dbLossLeftEar,
        dBLossRightEar: result.dbLossLeftEar,
        frequency: result.frequency,
        percentageHl: result.percentageHl,
      });
    });
  }

  item(data: Partial<AudioGramItem> = {}): UntypedFormGroup {
    return this.formBuilder.group({
      frequency: [{ value: data.frequency || 0, disabled: this.isReadOnly }],
      dbLossLeftEar: [{ value: +data.dbLossLeftEar || 0, disabled: this.isReadOnly }, Validators.min(0)],
      dbLossRightEar: [{ value: +data.dbLossRightEar || 0, disabled: this.isReadOnly }, Validators.min(0)],
      percentageHl: [{ value: +data.percentageHl || 0, disabled: this.isReadOnly }, Validators.required]
    });
  }

  getClaim() {
    this.personEvent.claims.forEach((result, index) => {
      if (index == 0) {
        this.claim = result;
      }
    });
  }

  getHearingAssessmentDetails() {
    this.claimInvoiceService.getClaimHearingAssessment(this.personEvent.personEventId).subscribe(result => {
      if (result) {
        this.existingHearingAssessments = result.sort((a, b) => b.hearingAssessmentId - a.hearingAssessmentId);
        this.populateForm();
        this.isLoading$.next(false);
      }
      else {
        this.isLoading$.next(false);
      }
    });
  }

  formValid(): boolean {
    return this.form.valid && !this.form.pristine;
  }

  setCurrentUserByDefault(): number {
    return this.currentUser.id;
  }

  onFilterByUserNameChanged($event: any) {
    this.filterByUserId = $event.value;
    this.search(this.filterByUserId.toString());
  }

  search(searchTerm: string) {
    this.currentQuery = searchTerm;
    if (this.currentQuery.length >= 3) {
      this.currentQuery = this.currentQuery.trim();
    }
  }

  onUserKeyChanged(value) {
    if (value) {
      let filter = value.toLowerCase();
      this.filteredUsers = this.setData(filter, this.filteredUsers, this.users);
    }
  }

  setData(filter: string, filteredList: any, originalList: any) {
    if (String.isNullOrEmpty(filter)) {
      return filteredList = originalList;
    } else {
      return filteredList.filter(user => user.displayName.toLocaleLowerCase().includes(filter));
    }
  }

  save() {
    this.isLoading$.next(true);
    let hearingAssessmentForm = this.readForm();
    this.claimAccidentService.addClaimHearingAssessment(hearingAssessmentForm).subscribe(result => {
      if (result) {
        const shouldCreateDisability = hearingAssessmentForm.hearingAssessmentTypeId === +AssessmentTypeEnum.Diagnostic;
        if (shouldCreateDisability) {
          this.createClaimDisabilityAssessment(hearingAssessmentForm);
        }
        else {
          this.alertService.successToastr('Disability assessment created successfully', 'success', true);
          this.isLoading$.next(false);
          this.closeEmit.emit(true);
        }
      }
    });
  }

  update() {
    this.isLoading$.next(true);
    const hearingAssessmentForm = this.readForm();
    this.claimAccidentService.updateClaimHearingAssessment(hearingAssessmentForm).subscribe(result => {
      if (result) {
        this.alertService.successToastr('Disability assessment updated successfully', 'success', true);
        this.isLoading$.next(false);
        this.closeEmit.emit(true);
      }
    });
  }

  createClaimDisabilityAssessment(hearingAssessment: ClaimHearingAssessment) {
    let claimDisabilityForm = this.disabilityForm(hearingAssessment);
    this.claimInvoiceService.addClaimDisabilityAssessment(claimDisabilityForm).subscribe(result => {
      if (result) {
        this.alertService.successToastr('Disability assessment created successfully', 'success', true);
        this.isLoading$.next(false);
        this.closeEmit.emit(true);
      }
    });
  }

  getUsersByWorkPoolPermission() {
    this.isLoading$.next(true);
    var workpool = WorkPoolEnum[WorkPoolEnum.CcaPool];
    let permission = this.formatText(workpool);
    this.userService.getUsersByPermission(permission).subscribe(result => {
      if (result) {
        this.users = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.filteredUsers = result.filter(a => a.roleId != 1 || a.id != this.user.id);
        this.getHearingAssessmentDetails();
      }
    });
  }

  formatText(text: string): string {
    return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  getLookups() {
    this.assessmentTypes = this.ToArray(AssessmentTypeEnum);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  get Info(): UntypedFormArray {
    return this.form.get('audioGramItems') as UntypedFormArray;
  }

  onChanged(index: number) {
    let frequency = (this.Info.at(index).get('frequency').value || 0);
    let leftEar = (this.Info.at(index).get('dbLossLeftEar').value || 0.0);
    let rightEar = (this.Info.at(index).get('dbLossRightEar').value || 0.0);
    var subTotal = 0.0;
    let previousBaseline = this.newBaselinePercentage;

    if (leftEar > 0 || rightEar > 0) {
      this.claimAccidentService.getTotalHearingLossPercentage(frequency, leftEar, rightEar).subscribe((result) => {
        if (result) {
          subTotal = parseFloat(result.toFixed(2)); // round to 2 decimal places
          this.Info.at(index).get('percentageHl').setValue(subTotal);
          const total = this.Info.value.map(acc => acc.percentageHl).reduce(function (acc, curr) {
            return acc + curr;
          }, 0); // Start with an initial value of 0
          this.form.get('percentageHl').setValue(parseFloat(total.toFixed(2)));

          if (previousBaseline) {
            const totalPercentage = this.caluculatePermanentDisablement(total, previousBaseline);
            this.form.get('totalPermanentDisablement').setValue(totalPercentage);
          }
        }
      });
    }
  }

  onCheckChanged(isChecked: boolean) {
    this.isAudiogramSelected = isChecked;
  }

  onAssessmentTypeChanged($event: AssessmentTypeEnum) {
    this.hearingAssessmentType = $event;
    this.isDiagnosticSelected = +AssessmentTypeEnum[this.hearingAssessmentType] === AssessmentTypeEnum.Diagnostic;

    if (this.isDiagnosticSelected) {

      const latestHearingDiagnostic = this.existingHearingAssessments?.[0]; //get latest hearing diagnostic as a new baseline.

      this.newBaselinePercentage = latestHearingDiagnostic?.percentageHl ? latestHearingDiagnostic.percentageHl : 0.0; //set latest hearing as new baseline.
      this.form.get('baselinePHL').setValue(this.newBaselinePercentage);
    }
    else {
      this.newBaselinePercentage = 0.0;
    }
  }
}
