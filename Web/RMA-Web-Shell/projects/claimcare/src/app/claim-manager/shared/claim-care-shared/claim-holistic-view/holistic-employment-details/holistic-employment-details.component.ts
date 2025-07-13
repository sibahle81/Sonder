import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ClaimCareService } from '../../../../Services/claimcare.service';
import { PatersonGrading } from '../../../entities/paterson-grading';
import { PersonEventModel } from '../../../entities/personEvent/personEvent.model';
import { MatDialog } from '@angular/material/dialog';
import { EventModel } from '../../../entities/personEvent/event.model';
import { Constants } from 'projects/claimcare/src/app/constants';
import { EventTypeEnum } from '../../../enums/event-type-enum';
import { ModeEnum } from 'projects/shared-models-lib/src/lib/enums/mode-enum';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { ICD10DiagnosticGroup } from 'projects/medicare/src/app/medi-manager/models/icd10-diagnostic-group';
import { ICD10CodeService } from 'projects/medicare/src/app/medi-manager/services/icd10-code-service';
import { HolisticBeneficiaryContainerComponent } from '../holistic-container-beneficiary/holistic-beneficiary-container/holistic-beneficiary-container.component';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';

@Component({
  selector: 'holistic-employment-details',
  templateUrl: './holistic-employment-details.component.html',
  styleUrls: ['./holistic-employment-details.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat },
  ],
})
export class HolisticEmploymentDetailsComponent extends UnSubscribe implements OnChanges {
  @Input() personEvent: PersonEventModel;
  @Input() isReadOnly = false;
  @Input() isWizard = false;
  @Input() mode = ModeEnum.Default;

  @Output() emitPersonEmployment: EventEmitter<PersonEventModel> = new EventEmitter();

  form: UntypedFormGroup;
  maxDate = new Date();
  isSkilled: boolean = false;
  petersonGradingId: number;
  designationTypeId: number;
  patersonGradings: PatersonGrading[];

  personEmployment: PersonEmployment;

  designationTypes: Lookup[] = [];
  filteredDesignationTypes: Lookup[] = [];
  monthsInOccupation = 0;
  daysInOccupation = 0;
  occupationYears: number;
  
  addingEmployee = false;
  employeeIsTrainee = false;
  isEditMode = false;
  isSTP = false;

  filter: string = '';
  hasAddPermission = false;
  isAddBeneficiary = true;
  isFatal = false;
  hasBeneficiaryData = false;
  hasAuditPermission = false;
  requiredClass = 'mat-label other-label mandatory-field';
  notRequiredClass = 'mat-label other-label';

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isIdLoading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isSaving$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  notFound$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClassEnum: IndustryClassEnum;
  mining = IndustryClassEnum.Mining;
  diagnosticGroups: ICD10DiagnosticGroup[] = [];

  newPerson = ModeEnum.NewPerson;
  viewMode = ModeEnum.View;
  editMode = ModeEnum.Edit;

  constructor(
    private readonly rolePlayerService: RolePlayerService,
    private readonly claimService: ClaimCareService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly medicalService: ICD10CodeService,
    private readonly lookUpService: LookupService,
    private readonly wizardService: WizardService,
    private readonly alertService: AlertService
  ) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.getDesignationType(this.filter);
    this.setPermissions();
    this.setGlobalVariables();
    this.getDiagnosticGroupsByEventTypeId(EventTypeEnum.Disease);
    this.createFormEmployment();
    this.checkSetIndustryRequiredField();

    if (!this.isWizard) {
      this.getPersonEmploymentDetails(this.personEvent.rolePlayer.rolePlayerId, this.personEvent.companyRolePlayerId);
    } else {
      this.form.get('yearsOccupation').disable();
      if (this.personEvent.rolePlayer.person.personEmployments && this.personEvent.rolePlayer.person.personEmployments[0]) {
        this.personEmployment = this.personEvent.rolePlayer.person.personEmployments[0];
        this.doOccupationValidation(this.personEvent.rolePlayer.person.personEmployments[0].startDate);

   
        this.personEvent.rolePlayer.person.personEmployments.forEach((item) => {
          if (item?.isSkilled) {
            this.isSkilled = item.isSkilled;
          }
        });

        this.getPatersonGrading(this.isSkilled);
        this.getDesignationType(this.filter);
        this.patchFormEmployment(this.personEvent.rolePlayer.person.personEmployments[0]);
      }

      this.isLoading$.next(false);
    }

    if (
      this.personEvent.personEventDiseaseDetail &&
      this.personEvent.personEventDiseaseDetail.dateDiagnosis
    ) {
      this.maxDate = new Date(
        this.personEvent.personEventDiseaseDetail.dateDiagnosis
      );
    } else if (!isNaN(+this.personEvent.eventDate)) {
      this.maxDate = new Date(this.personEvent.eventDate);
    }
  }

  onOccupationKey(value) {
    if (value.length > 2) {
      this.getDesignationType(value);
      this.designationTypes = this.dropDownSearch(value, 'nationality');
    }
  }

  dropDownSearch(value: string, name: string) {
    let filter = value.toLowerCase();
    return this.setData(
      filter,
      this.filteredDesignationTypes,
      this.designationTypes
    );
  }

  setData(filter: string, filteredList: Lookup[], originalList: Lookup[]) {
    if (String.isNullOrEmpty(filter)) {
      return (filteredList = originalList);
    } else {
      return filteredList.filter((option) =>
        option.name.toLocaleLowerCase().includes(filter)
      );
    }
  }

  getDesignationType(filter): void {
    this.lookUpService.getDesignationTypes(filter).subscribe((data) => {
      this.designationTypes = data;
      this.filteredDesignationTypes = data;
    });
  }

  checkIfFatal() {
    if (this.personEvent.eventType === EventTypeEnum.Disease) {
      if (this.personEvent && this.personEvent.physicalDamages?.length > 0) {
        this.isFatal = this.personEvent.physicalDamages[0]?.icd10DiagnosticGroupId == Constants.ICD10CodeDiseaseFatalDRG ? true : false;
      }
    }
  }

  setGlobalVariables() {
    this.isSTP = this.personEvent.isStraightThroughProcess;
  }

  setPermissions() {
    this.hasAddPermission = this.userHasPermission('View Person Employment Details');
    this.hasAuditPermission = userUtility.hasPermission('View Audits');
  }

  getDiagnosticGroupsByEventTypeId(eventType: EventTypeEnum) {
    this.medicalService
      .getICD10DiagonosticGroupsByEventType(eventType)
      .subscribe((groups) => {
        this.diagnosticGroups = groups;
        this.checkIfFatal();
      });
  }

  getPatersonGrading(isSkilledValue: boolean) {
  
    if(isSkilledValue == null)
    {
      isSkilledValue = false;
    }
    this.isSkilled = isSkilledValue

    this.claimService.getPatersonGradingsBySkill(this.isSkilled).pipe(takeUntil(this.unSubscribe$)).subscribe((results) => {
      this.patersonGradings = results;
    });
  }

  createFormEmployment() {
    this.form = this.formBuilder.group({
      personEmploymentId: [],
      skilled: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      trainee: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      employmentDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      yearsOccupation: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      yearsInIndustry: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      petersonGrading: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      rmaEmployeeNumber: [{ value: null, disabled: this.isReadOnly }],
      employeeNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      industryNumber: [{ value: null, disabled: this.isReadOnly }],
      designationTypeId: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });
  }

  patchFormEmployment(personEmployment: PersonEmployment) {
    this.isSkilled = personEmployment.isSkilled;
    this.petersonGradingId = personEmployment.patersonGradingId;
    this.designationTypeId = personEmployment.designationTypeId;
    this.form.patchValue({
      personEmploymentId: personEmployment.personEmpoymentId,
      skilled: personEmployment.isSkilled ? 'true' : 'false',
      trainee: personEmployment.isTraineeLearnerApprentice ? 'true' : 'false',
      employmentDate: personEmployment.startDate
        ? personEmployment.startDate
        : null,
      yearsOccupation: personEmployment.yearsInPresentOccupation,
      yearsInIndustry: personEmployment.yearsInIndustry,
      petersonGrading: personEmployment.patersonGradingId,
      rmaEmployeeNumber: personEmployment.rmaEmployeeRefNum,
      employeeNumber: personEmployment.employeeNumber,
      industryNumber: personEmployment.employeeIndustryNumber,
      designationTypeId: personEmployment.designationTypeId,
    });
  }

  getPersonEmploymentDetails( employeeRolePlayerId: number, employerRolePlayerId: number) {
    this.isLoading$.next(true);
    this.rolePlayerService.getPersonEmployment(employeeRolePlayerId, employerRolePlayerId)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((result) => {
        if (result) {
          this.personEmployment = result;
          this.doOccupationValidation(result.startDate);
          this.getPatersonGrading(result.isSkilled);
          this.patchFormEmployment(result);
          this.personEvent.rolePlayer.person.personEmployments = [];
          this.personEvent.rolePlayer.person.personEmployments.push(result);
        }
        this.isLoading$.next(false);
      });
  }

  doOccupationValidation(startDate: Date) {
    const currentDate = new Date();
    startDate = new Date(startDate);
    const totalYears = this.monthDiff(startDate, currentDate) / 12;
    if (totalYears % 1 !== 0) {
      this.occupationYears = this.truncate(totalYears, 0);
    } else {
      this.occupationYears = totalYears;
    }
    this.form.get('yearsOccupation').setValue(this.occupationYears);
    this.monthsInOccupation = 0;
    this.daysInOccupation = 0;
    if (this.occupationYears === 0) {
      const differenceInTime = currentDate.getTime() - startDate.getTime();
      const differenceInDays = differenceInTime / (1000 * 3600 * 24);
      const daysWorked = this.roundTwo(differenceInDays);
      if (daysWorked > 59) {
        const monthsWorked = (this.round(totalYears) + '').split('.');
        this.monthsInOccupation = Number(monthsWorked[1]);
        this.daysInOccupation = 0;
      } else {
        this.monthsInOccupation = 0;
        this.daysInOccupation = daysWorked;
      }
    }
  }

  monthDiff(startDate: Date, currentDate: Date): number {
    let months;
    startDate = new Date(startDate);
    months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += currentDate.getMonth();
    return months <= 0 ? 0 : months;
  }

  truncate(num: any, index = 0) {
    return +num.toString().slice(0, num.toString().indexOf('.') + (index + 1));
  }

  round(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(1));
    return (Math.round(m) / 100) * Math.sign(num);
  }

  roundTwo(num: any) {
    const m = Number((Math.abs(num) * 100).toPrecision(2));
    return (Math.round(m) / 100) * Math.sign(num);
  }

  skilledChange($event: boolean) {
    this.isSkilled = $event;

    this.form.get('petersonGrading').reset();
    this.getPatersonGrading(this.isSkilled);
  }


  validateEmploymentDate(value: any) {
    const startDate = new Date(value.value);
    this.doOccupationValidation(startDate);
  }

  yearsValidation() {
    if (this.form.get('employmentDate').value) {
      const startDate = new Date(this.form.get('employmentDate').value);
      this.doOccupationValidation(startDate);
    }
  }

  petersonGradingChanged(value: any) {
    this.petersonGradingId = value.value;
  }

  keyPressAlphanumeric(event) {
    const inp = String.fromCharCode(event.keyCode);
    if (/[a-zA-Z0-9]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  setIndustryValidators() {
    if (this.industryClassEnum == IndustryClassEnum.Mining) {
      this.clearValidationToFormControl('industryNumber');
      this.applyValidationToFormControl(Validators.required, 'industryNumber');
    } else {
      this.clearValidationToFormControl('industryNumber');
    }
  }

  checkSetIndustryRequiredField() {
    if (this.personEvent.companyRolePlayerId) {
       this.rolePlayerService.getRolePlayer(this.personEvent.companyRolePlayerId).subscribe({
        next: result => {
          if (result) {
            if (result.company) {
              this.industryClassEnum = result.company.industryClass;
              this.setIndustryValidators();
            }
          }
        },
        error: err => {
          this.popAlert("Could not load Employment details", "error");
          this.notFound$.next(true);
        },
        complete: () => {
          this.notFound$.next(false);
        }
      });
    }
  }

  popAlert(message: string, type: string) {
    if (type == 'error')
      this.alertService.error(message, type, false);
    if (type == 'success')
      this.alertService.success(message, type, false);
  }  

  omitSpecialChar(event: { charCode: any }) {
    const k = event.charCode;
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k === 8 ||
      k === 32 ||
      (k >= 48 && k <= 57)
    );
  }

  edit(): void {
    this.isReadOnly = false;
    this.isEditMode = true;
    this.form.enable();
    this.form.get('yearsOccupation').disable();
  }

  cancel() {
    this.reset();
  }

  reset() {
    this.isReadOnly = true;
    this.isEditMode = false;
    this.form.disable();
  }

  save() {
    this.isSaving$.next(true);

    const personEmploymentDetails = this.readFormEmployment();

    if (!this.isWizard) {
      this.rolePlayerService.updatePersonEmployment(personEmploymentDetails).pipe(takeUntil(this.unSubscribe$)).subscribe((result) => {
        if (result) {
          this.reset();
          this.isSaving$.next(false);
        }
      });
    } else {
      if (this.personEvent.rolePlayer.rolePlayerId > 0) {
        const index = this.personEvent.rolePlayer.person.personEmployments.findIndex(a => a.personEmpoymentId == personEmploymentDetails.personEmpoymentId);
        if (index > -1) {
          this.personEvent.rolePlayer.person.personEmployments[index] = personEmploymentDetails;
        } else {
          this.addPersonEmployment(personEmploymentDetails);
        }
      } else {
        this.addPersonEmployment(personEmploymentDetails);
      }

      this.emitPersonEmployment.emit(this.personEvent);

      this.reset();

      this.isSaving$.next(false);
    }
  }

  addPersonEmployment(personEmploymentDetails: PersonEmployment) {
    this.personEvent.rolePlayer.person.personEmployments ? this.personEvent.rolePlayer.person.personEmployments : [];

    const { personEmployments } = this.personEvent.rolePlayer.person;

    if (personEmployments && personEmployments.length > 0) {
      personEmployments[0] = personEmploymentDetails;
    } else {
      this.personEvent.rolePlayer.person.personEmployments = [personEmploymentDetails];
    }
  }

  readFormEmployment(): PersonEmployment {
    const personEmployment = new PersonEmployment();

    const formDetails = this.form.getRawValue();

    personEmployment.personEmpoymentId = this.form.controls.personEmploymentId.value != null ? this.form.controls.personEmploymentId.value : 0;
    personEmployment.employeeRolePlayerId = this.personEvent.rolePlayer.rolePlayerId ? this.personEvent.rolePlayer.rolePlayerId : 0;
    personEmployment.employerRolePlayerId = this.personEvent.companyRolePlayerId;
    personEmployment.isSkilled = formDetails.skilled === 'true' ? true : false;
    personEmployment.isTraineeLearnerApprentice = formDetails.trainee === 'true' ? true : false;
    personEmployment.patersonGradingId = this.petersonGradingId;
    personEmployment.startDate = new Date(formDetails.employmentDate).getCorrectUCTDate();
    personEmployment.yearsInPresentOccupation = formDetails.yearsOccupation;
    personEmployment.yearsInIndustry = formDetails.yearsInIndustry;
    personEmployment.rmaEmployeeRefNum = formDetails.rmaEmployeeNumber;
    personEmployment.employeeNumber = formDetails.employeeNumber;
    personEmployment.employeeIndustryNumber = formDetails.industryNumber;
    personEmployment.designationTypeId = formDetails.designationTypeId;

    return personEmployment;
  }

  startClaimSection51() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'claim-section51';
    startWizardRequest.data = JSON.stringify(this.personEvent);
    startWizardRequest.linkedItemId = this.personEvent.personEventId;
    this.wizardService.startWizard(startWizardRequest).subscribe((r) => {
      this.alertService.success(
        'Workflow notification created for section51',
        'Success',
        true
      );
    });
  }

  createEventVariables(): EventModel {
    let event = new EventModel();
    event.eventDate = this.personEvent.eventDate;
    event.eventType = this.personEvent.eventType;
    event.memberSiteId = this.personEvent.companyRolePlayerId;
    return event;
  }

  isLeap(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  addBeneficiary(): void {
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        beneficiary: new RolePlayer(),
        personEvent: this.personEvent,
        isReadOnly: false,
        isWizard: this.isWizard,
        mode: ModeEnum.NewBeneficiary,
        isEdit: false,
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data) {
        this.personEvent.beneficiaries = new Array();
        this.personEvent.beneficiaries.push(data);
        this.hasBeneficiaryData = true;

        this.form.markAsDirty();
        this.form.updateValueAndValidity();
      }
    });
  }

  occupationChanged(value: any) {
    this.designationTypeId = value.value;
  }

  openBeneficiaryDialogView(menu: any, item: RolePlayer): void {
    const type = menu;
    const dialogRef = this.dialog.open(HolisticBeneficiaryContainerComponent, {
      width: '1200px',
      maxHeight: '600px',
      data: {
        beneficiary: item,
        personEvent: this.personEvent,
        isReadOnly: false,
        isWizard: this.isWizard,
        isEdit: true,
      },
    });
    if (type === 'edit') {
      dialogRef.afterClosed().subscribe((data) => {
        if (data) {
          this.personEvent.beneficiaries = data.beneficiaries;
          this.hasBeneficiaryData = true;
        }
      });
    }
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.PersonEmployment,
        itemId: this.personEmployment.personEmpoymentId,
        heading: 'Employment Details Audit',
        propertiesToDisplay: [
          'Company',
          'EventOccupationType',
          'OccupationType',
          'EmployeeNumber',
          'OccupationTypeId',
          'StartDate',
          'EndDate',
          'IsTraineeLearnerApprentice',
          'IsSkilled',
          'YearsInIndustry',
          'YearsInPresentOccupation',
          'PatersonGradingId',
          'RmaEmployeeRefNum',
          'EmployeeIndustryNumber',
        ],
      },
    });
  }

  clearValidationToFormControl(controlName: string) {
    this.form.get(controlName).clearValidators();
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }

  applyValidationToFormControl(validationToApply: any, controlName: string) {
    this.form.get(controlName).setValidators(validationToApply);
    this.form.get(controlName).markAsTouched();
    this.form.get(controlName).updateValueAndValidity();
  }
}
