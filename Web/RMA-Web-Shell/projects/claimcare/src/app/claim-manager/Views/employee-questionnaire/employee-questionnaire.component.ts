import { PersonEventQuestionnaire } from './../../shared/entities/personEvent/personEventQuestionnaire.model';
import { DatePipe } from '@angular/common';
import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { DatePickerDateFormat, MatDatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { ClaimCareService } from '../../Services/claimcare.service';
import { PatersonGrading } from '../../shared/entities/paterson-grading';
import { EventModel } from '../../shared/entities/personEvent/event.model';
import { PersonEventModel } from '../../shared/entities/personEvent/personEvent.model';
import { Constants } from '../../../constants';
import { BehaviorSubject } from 'rxjs';
import { ClaimRequirementService } from '../../Services/claim-requirement.service';

@Component({
  selector: 'employee-questionnaire',
  templateUrl: './employee-questionnaire.component.html',
  styleUrls: ['./employee-questionnaire.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MatDatePickerDateFormat },
    { provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat }
  ]
})
export class EmployeeQuestionnaireComponent implements OnInit {
  @Input() personEvent: PersonEventModel;
  @Input() isWizard: boolean;
  @Input() isReadOnly = false;

  displayedColumns = ['name', 'surname', 'idPassportNumber', 'isVopdVerified', 'actions'];
  menus: { title: string, action: string, disable: boolean }[];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingRolePlayer$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  questionnaire: UntypedFormGroup;
  currentUser: string;
  canAdd = false;
  maxDate = new Date();
  employee: RolePlayer;
  user: User;
  employeeIsTrainee: boolean;
  isUnderTwentySix: boolean;
  patersonGradings: PatersonGrading[];
  personEventQuestionnaire: PersonEventQuestionnaire;
  employeeAge: number;
  isViewOnly = false;

  constructor(
    public dialogRef: MatDialogRef<EmployeeQuestionnaireComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)  public data: any,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly claimService: ClaimCareService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly authService: AuthService,
    private readonly claimRequirementService: ClaimRequirementService,
    public readonly datepipe: DatePipe) {
      // this.getLookups();
     }

    ngOnInit() {
      if(this.data){
        this.getLookups();
      }
    }

    onNoClick(): void {
      this.dialogRef.close(null);
    }

    setFormOnAction() {
      switch (this.data.dataType) {
        case 'view':
          this.viewOnly();
          break;
        case 'edit':
          this.editOnly();
          break;
      }
    }

    viewOnly() {
      this.disableFormFields();
      this.isViewOnly = true;
    }

    editOnly() {
      this.enabledFormFields();
      this.isViewOnly = false;
    }

    getMemberDetails() {
      this.isLoadingRolePlayer$.next(true);
      this.rolePlayerService.getRolePlayer(this.personEvent.event.memberSiteId).subscribe(rolePlayer => {
        if (rolePlayer) {
          this.questionnaire.patchValue({
            employerName: rolePlayer.company.name,
            companyNumber: rolePlayer.company.referenceNumber,
            dateOfAccident: this.personEvent.event.eventDate,
          });
        }
        this.isLoadingRolePlayer$.next(false);
      }, error => {
      });
    }

    getEmployeeDetails() {
      const numberValue = Number(this.data.pattersonBand);
      this.questionnaire.patchValue({
        employeeName: this.data.employeeName,
        idNumber: this.data.idNumber,
        dateOfBirth: this.data.dateOfBirth,
        employeeAge: this.data.employeeAge,
        presentOccupation: null,
        pattersonBand: numberValue,
        isTrainee: `${this.data.isTrainee}`,
      });

      if (this.data.isTrainee && !(this.employeeAge < Constants.minAge)) {
        this.employeeIsTrainee = this.data.isTrainee;
        this.isUnderTwentySix = false;
      }

      if (!this.data.isTrainee && (this.employeeAge < Constants.minAge)) {
        this.employeeIsTrainee = false;
        this.isUnderTwentySix = true;
      }

      if (this.data.isTrainee && (this.employeeAge < Constants.minAge)) {
        this.employeeIsTrainee = true;
        this.isUnderTwentySix = false;
      }
    }

    createForm() {
      this.questionnaire = this.formBuilder.group({
        employerName: [{ value: '', disabled: true }],
        employeeName: [{ value: '', disabled: true }],
        companyNumber: [{ value: '', disabled: true }],
        idNumber: [{ value: '', disabled: true }],
        dateOfAccident: [{ value: '', disabled: true }],
        dateOfBirth: [{ value: '', disabled: true }],
        employeeAge: [{ value: '', disabled: true }],
        presentOccupation: [{ value: '', disabled: false }],
        pattersonBand: [{ value: '', disabled: true }],
        isTrainee: [{ value: '', disabled: true }],
        traineeLocation: [{ value: '', disabled: false }],
        averageEarnings: [{ value: '', disabled: false }],
        basicRate: [{ value: '', disabled: false }],
        secondBasicRateAverage: [{ value: '', disabled: false }],
        annualBonus: [{ value: '', disabled: false }],
        secondAnnualBonusAverage: [{ value: '', disabled: false }],
        subTotal: [{ value: '', disabled: false }],
        subTotalSecond: [{ value: '', disabled: false }],
        employeeNumber: [{ value: '', disabled: false }],
        employeeNumberPrimary: [{ value: '', disabled: false }],
        employeeLocation: [{ value: '', disabled: false }],
        employeeAverageEarnings: [{ value: '', disabled: false }],
        employeeBasicRate: [{ value: '', disabled: false }],
        employeeAnnualBonus: [{ value: '', disabled: false }],
        firstHousingQuarters: [{ value: '', disabled: false }],
        secondAverageEarnings: [{ value: '', disabled: false }],
        secondBasicRate: [{ value: '', disabled: false }],
        secondAnnualBonus: [{ value: '', disabled: false }],
        secondHousingQuarters: [{ value: '', disabled: false }],
        secondEmployeeNumber: [{ value: '', disabled: false }],
      });
      
    }

    readForm() {
        const formDetails = this.questionnaire.getRawValue();

        this.personEvent.personEventQuestionnaire.isTrainee = formDetails.isTrainee === 'true' ? true : false;
        if (this.personEvent.personEventQuestionnaire.isTrainee) {
          this.personEvent.personEventQuestionnaire.traineeLocation = formDetails.traineeLocation;
          this.personEvent.personEventQuestionnaire.averageEarnings = formDetails.averageEarnings;
          this.personEvent.personEventQuestionnaire.basicRate = formDetails.basicRate;
          this.personEvent.personEventQuestionnaire.secondBasicRate = formDetails.secondBasicRateAverage;
          this.personEvent.personEventQuestionnaire.annualBonus = formDetails.annualBonus;
          this.personEvent.personEventQuestionnaire.secondAnnualBonus = formDetails.secondAnnualBonusAverage;
          this.personEvent.personEventQuestionnaire.subTotal = formDetails.subTotal;
          this.personEvent.personEventQuestionnaire.subTotalSecond = formDetails.subTotalSecond;
          this.personEvent.personEventQuestionnaire.employeeNumber = formDetails.employeeNumber;
          this.personEvent.personEventQuestionnaire.secondEmployeeNumber = formDetails.employeeNumberPrimary;
          this.personEvent.personEventQuestionnaire.employeeLocation = null;
          this.personEvent.personEventQuestionnaire.employeeAverageEarnings = null;
          this.personEvent.personEventQuestionnaire.employeeBasicRate = null;
          this.personEvent.personEventQuestionnaire.employeeAnnualBonus = null;
          this.personEvent.personEventQuestionnaire.firstHousingQuarters = null;
          this.personEvent.personEventQuestionnaire.secondAverageEarnings = null;
          this.personEvent.personEventQuestionnaire.secondHousingQuarters = null;
        } else {
          this.personEvent.personEventQuestionnaire.traineeLocation = null;
          this.personEvent.personEventQuestionnaire.averageEarnings = null;
          this.personEvent.personEventQuestionnaire.basicRate = null;
          this.personEvent.personEventQuestionnaire.annualBonus = null;
          this.personEvent.personEventQuestionnaire.subTotal = null;
          this.personEvent.personEventQuestionnaire.employeeNumber = formDetails.employeeNumber ? formDetails.employeeNumber : formDetails.secondEmployeeNumber;
          this.personEvent.personEventQuestionnaire.employeeLocation = formDetails.employeeLocation;
          this.personEvent.personEventQuestionnaire.employeeAverageEarnings = formDetails.employeeAverageEarnings;
          this.personEvent.personEventQuestionnaire.employeeBasicRate = formDetails.employeeBasicRate;
          this.personEvent.personEventQuestionnaire.employeeAnnualBonus = formDetails.employeeAnnualBonus;
          this.personEvent.personEventQuestionnaire.firstHousingQuarters = formDetails.firstHousingQuarters;
          this.personEvent.personEventQuestionnaire.secondAverageEarnings = formDetails.secondAverageEarnings;
          this.personEvent.personEventQuestionnaire.secondBasicRate = formDetails.secondBasicRate;
          this.personEvent.personEventQuestionnaire.secondAnnualBonus = formDetails.secondAnnualBonus;
          this.personEvent.personEventQuestionnaire.secondHousingQuarters = formDetails.secondHousingQuarters;
          this.personEvent.personEventQuestionnaire.secondEmployeeNumber = formDetails.secondEmployeeNumber;
        }
        this.personEvent.personEventQuestionnaire.createdBy = this.currentUser;
        this.personEvent.personEventQuestionnaire.createdDate = new Date();
        this.personEvent.personEventQuestionnaire.modifiedDate = new Date();
        this.personEvent.personEventQuestionnaire.modifiedBy = this.currentUser;
    }

    patchForm() {
      if (this.employeeIsTrainee) {
      this.questionnaire.patchValue({
          traineeLocation: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.traineeLocation : null,
          averageEarnings: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.averageEarnings : null,
          basicRate: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.basicRate : null,
          secondBasicRateAverage: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondBasicRate : null,
          annualBonus: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.annualBonus : null,
          secondAnnualBonusAverage: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondAnnualBonus : null,
          subTotal: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.subTotal : null,
          subTotalSecond: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.subTotalSecond : null,
          employeeNumber: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeNumber : null,
          employeeNumberPrimary: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondEmployeeNumber : null,
          });
        } else {
          this.questionnaire.patchValue({
          employeeLocation: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeLocation : null,
          employeeAverageEarnings: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeAverageEarnings : null,
          employeeBasicRate: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeBasicRate : null,
          employeeAnnualBonus: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeAnnualBonus : null,
          firstHousingQuarters: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.firstHousingQuarters : null,
          secondAverageEarnings: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondAverageEarnings : null,
          secondBasicRate: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondBasicRate : null,
          secondAnnualBonus: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondAnnualBonus : null,
          secondHousingQuarters: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondHousingQuarters : null,
          secondEmployeeNumber: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.secondEmployeeNumber : null,
          employeeNumber: this.personEvent.personEventQuestionnaire ? this.personEvent.personEventQuestionnaire.employeeNumber : null,
        });
      }
    }

    isTraineeChange(): void {
      const formDetails = this.questionnaire.getRawValue();
      const isTrainee = formDetails.isTrainee;
    }

    checkPermissions(permission: string): boolean {
      return userUtility.hasPermission(permission);
    }

    getLookups() {
      this.getPatersonGrading(this.data.isSkilled);
    }

    getPatersonGrading(isSkilled: boolean) {
      this.claimService.getPatersonGradingsBySkill(isSkilled).subscribe(results => {
        this.patersonGradings = results;

        this.personEvent = this.data.personEvent;
        this.employeeAge = this.data.employeeAge;
        this.user = this.authService.getCurrentUser();
        this.currentUser = this.user.email.toLowerCase();

        this.createForm();
        this.getMemberDetails();
        this.getEmployeeDetails();
        
        this.claimService.EmployeeListChange$.subscribe(result => {
          if (result) {
            this.getEmployeeDetails();
          }
        });

        
        this.setFormOnAction();
        
        if (this.data.dataType === 'edit' || this.data.dataType === 'view') {
          this.personEvent.personEventQuestionnaire = this.data.personEvent.personEventQuestionnaire;
          this.patchForm();
        } else {
          this.personEvent.personEventQuestionnaire = new PersonEventQuestionnaire();
        }

        
       
        this.isLoading$.next(false);
      });
    }

    enabledFormFields() {
      this.enableFormControl('traineeLocation');
      this.enableFormControl('averageEarnings');
      this.enableFormControl('basicRate');
      this.enableFormControl('secondBasicRateAverage');
      this.enableFormControl('annualBonus');
      this.enableFormControl('secondAnnualBonusAverage');
      this.enableFormControl('subTotal');
      this.enableFormControl('subTotalSecond');
      this.enableFormControl('employeeNumber');
      this.enableFormControl('employeeNumberPrimary');
      this.enableFormControl('employeeLocation');
      this.enableFormControl('employeeAverageEarnings');
      this.enableFormControl('employeeBasicRate');
      this.enableFormControl('employeeAnnualBonus');
      this.enableFormControl('firstHousingQuarters');
      this.enableFormControl('secondAverageEarnings');
      this.enableFormControl('secondBasicRate');
      this.enableFormControl('secondAnnualBonus');
      this.enableFormControl('secondHousingQuarters');
      this.enableFormControl('secondEmployeeNumber');
    }

    disableFormFields() {
      this.disableFormControl('traineeLocation');
      this.disableFormControl('averageEarnings');
      this.disableFormControl('basicRate');
      this.disableFormControl('secondBasicRateAverage');
      this.disableFormControl('annualBonus');
      this.disableFormControl('secondAnnualBonusAverage');
      this.disableFormControl('subTotal');
      this.disableFormControl('subTotalSecond');
      this.disableFormControl('employeeNumber');
      this.disableFormControl('employeeNumberPrimary');
      this.disableFormControl('employeeLocation');
      this.disableFormControl('employeeAverageEarnings');
      this.disableFormControl('employeeBasicRate');
      this.disableFormControl('employeeAnnualBonus');
      this.disableFormControl('firstHousingQuarters');
      this.disableFormControl('secondAverageEarnings');
      this.disableFormControl('secondBasicRate');
      this.disableFormControl('secondAnnualBonus');
      this.disableFormControl('secondHousingQuarters');
      this.disableFormControl('secondEmployeeNumber');
    }

    setValidations() {
      const validators = [Validators.required];
      if (this.employeeIsTrainee) {
        this.applyValidationToFormControl(validators, 'traineeLocation');
        this.applyValidationToFormControl(validators, 'averageEarnings');
        this.applyValidationToFormControl(validators, 'basicRate');
        this.applyValidationToFormControl(validators, 'secondBasicRateAverage');
        this.applyValidationToFormControl(validators, 'annualBonus');
        this.applyValidationToFormControl(validators, 'secondAnnualBonusAverage');
        this.applyValidationToFormControl(validators, 'subTotal');
        this.applyValidationToFormControl(validators, 'subTotalSecond');
        this.applyValidationToFormControl(validators, 'employeeNumber');
        this.applyValidationToFormControl(validators, 'employeeNumberPrimary');
        this.clearValidationToFormControl('employeeLocation');
        this.clearValidationToFormControl('employeeAverageEarnings');
        this.clearValidationToFormControl('employeeBasicRate');
        this.clearValidationToFormControl('employeeAnnualBonus');
        this.clearValidationToFormControl('firstHousingQuarters');
        this.clearValidationToFormControl('secondAverageEarnings');
        this.clearValidationToFormControl('secondBasicRate');
        this.clearValidationToFormControl('secondAnnualBonus');
        this.clearValidationToFormControl('secondHousingQuarters');
        this.clearValidationToFormControl('secondEmployeeNumber');
      } else {
        this.applyValidationToFormControl(validators, 'employeeLocation');
        this.applyValidationToFormControl(validators, 'employeeAverageEarnings');
        this.applyValidationToFormControl(validators, 'employeeBasicRate');
        this.applyValidationToFormControl(validators, 'employeeAnnualBonus');
        this.applyValidationToFormControl(validators, 'firstHousingQuarters');
        this.applyValidationToFormControl(validators, 'secondAverageEarnings');
        this.applyValidationToFormControl(validators, 'secondBasicRate');
        this.applyValidationToFormControl(validators, 'secondAnnualBonus');
        this.applyValidationToFormControl(validators, 'secondHousingQuarters');
        this.applyValidationToFormControl(validators, 'secondEmployeeNumber');
        this.clearValidationToFormControl('traineeLocation');
        this.clearValidationToFormControl('averageEarnings');
        this.clearValidationToFormControl('basicRate');
        this.clearValidationToFormControl('secondBasicRateAverage');
        this.clearValidationToFormControl('annualBonus');
        this.clearValidationToFormControl('secondAnnualBonusAverage');
        this.clearValidationToFormControl('subTotal');
        this.clearValidationToFormControl('subTotalSecond');
        this.clearValidationToFormControl('employeeNumber');
        this.clearValidationToFormControl('employeeNumberPrimary');
      }
    }

    disableFormControl(controlName: string) {
      this.questionnaire.get(controlName).disable();
    }

    enableFormControl(controlName: string) {
      this.questionnaire.get(controlName).enable();
    }

    reset() {
      this.questionnaire.controls.traineeLocation.reset();
      this.questionnaire.controls.averageEarnings.reset();
      this.questionnaire.controls.basicRate.reset();
      this.questionnaire.controls.secondBasicRateAverage.reset();
      this.questionnaire.controls.annualBonus.reset();
      this.questionnaire.controls.secondAnnualBonusAverage.reset();
      this.questionnaire.controls.subTotal.reset();
      this.questionnaire.controls.subTotalSecond.reset();
      this.questionnaire.controls.employeeNumber.reset();
      this.questionnaire.controls.employeeNumberPrimary.reset();
      this.questionnaire.controls.employeeLocation.reset();
      this.questionnaire.controls.employeeAverageEarnings.reset();
      this.questionnaire.controls.employeeBasicRate.reset();
      this.questionnaire.controls.employeeAnnualBonus.reset();
      this.questionnaire.controls.firstHousingQuarters.reset();
      this.questionnaire.controls.secondAverageEarnings.reset();
      this.questionnaire.controls.secondBasicRate.reset();
      this.questionnaire.controls.secondAnnualBonus.reset();
      this.questionnaire.controls.secondHousingQuarters.reset();
      this.questionnaire.controls.secondEmployeeNumber.reset();
    }

    submit(): void {
      this.setValidations();
      if (!this.questionnaire.valid) {
        return;
      }
      this.readForm();
      this.dialogRef.close(this.personEvent);
      this.updateRequirementDateCloseConditions( Constants.futureProbableEarnings);
    }

    clearValidationToFormControl(controlName: string) {
      this.questionnaire.get(controlName).clearValidators();
      this.questionnaire.get(controlName).markAsTouched();
      this.questionnaire.get(controlName).updateValueAndValidity();
    }

    applyValidationToFormControl(validationToApply: any, controlName: string) {
      this.questionnaire.get(controlName).setValidators(validationToApply);
      this.questionnaire.get(controlName).markAsTouched();
      this.questionnaire.get(controlName).updateValueAndValidity();
    }

    traineeLocationChange() {
      this.calculateSubtotal();
    }

    calculateSubtotal(){
      const traineeLocationVal = this.questionnaire.get('traineeLocation').value;
      const basicRateVal = this.questionnaire.get('basicRate').value;
      const annualBonusVal = this.questionnaire.get('annualBonus').value;

      const traineeLocationVal1 = traineeLocationVal && traineeLocationVal != '' ? parseFloat(traineeLocationVal) : 0;
      const basicRateVal1 = basicRateVal && basicRateVal != '' ? parseFloat(basicRateVal) : 0;
      const annualBonusVal1 = annualBonusVal && annualBonusVal != '' ? parseFloat(annualBonusVal) : 0;

      const subTotalVal = traineeLocationVal1
                          + basicRateVal1
                          + annualBonusVal1;

      this.questionnaire.get('subTotal').setValue(subTotalVal);
    }

    averageEarningsChange(){
      this.calculateSubtotalSecondary();
    }

    calculateSubtotalSecondary(){
      const averageEarningsVal = this.questionnaire.get('averageEarnings').value;
      const secondBasicRateAverageVal = this.questionnaire.get('secondBasicRateAverage').value;
      const secondAnnualBonusAverageVal = this.questionnaire.get('secondAnnualBonusAverage').value;

      const averageEarningsVal1 = averageEarningsVal && averageEarningsVal != '' ? parseFloat(averageEarningsVal) : 0;
      const secondBasicRateAverageVal1 = secondBasicRateAverageVal && secondBasicRateAverageVal != '' ? parseFloat(secondBasicRateAverageVal) : 0;
      const secondAnnualBonusAverageVal1 = secondAnnualBonusAverageVal && secondAnnualBonusAverageVal != '' ? parseFloat(secondAnnualBonusAverageVal) : 0;

      const subTotalVal = averageEarningsVal1
                          + secondBasicRateAverageVal1
                          + secondAnnualBonusAverageVal1;

      this.questionnaire.get('subTotalSecond').setValue(subTotalVal);
    }

    updateRequirementDateCloseConditions(categoryId: number)
    {
      if(this.personEvent.isFatal){
        this.updateRequirementDateClose(categoryId);
      }
      
    }
    updateRequirementDateClose(categoryId: number)
    {
      this.claimRequirementService.getPersonEventRequirementByCategoryId(this.personEvent.personEventId, categoryId).subscribe(results => {
        if (results) {
          results.dateClosed = new Date();
          this.claimRequirementService.updatePersonEventClaimRequirement(results).subscribe(results => {
            if (results) {
            }
          });    
        }
      })  
    }
}
