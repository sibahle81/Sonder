import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ClaimCareService } from 'projects/claimcare/src/app/claim-manager/Services/claimcare.service';
import { PatersonGrading } from 'projects/claimcare/src/app/claim-manager/shared/entities/paterson-grading';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'person-employment',
  templateUrl: './person-employment.component.html',
  styleUrls: ['./person-employment.component.css']
})
export class PersonEmploymentComponent implements OnChanges {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingPatersonGrading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() employerRolePlayer: RolePlayer;
  @Input() employeeRolePlayer: RolePlayer;
  @Input() personEmployment: PersonEmployment;
  @Input() isReadOnly = false;

  @Output() closeEmit = new EventEmitter<boolean>();

  form: UntypedFormGroup;
  isEdit = false;

  designationTypes: Lookup[];
  patersonGradings: PatersonGrading[];

  maxDate: Date;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly lookupService: LookupService,
    private readonly claimService: ClaimCareService,
    private readonly rolePlayerService: RolePlayerService,
    private readonly datePipe: DatePipe,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.employeeRolePlayer) {
      this.getDesignationTypes();
      if (!this.employeeRolePlayer.person.personEmployments || this.employeeRolePlayer.person.personEmployments.length <= 0) {
        this.getPatersonGrading(false);
      } else if (this.personEmployment) {
        this.getPatersonGrading(this.personEmployment.isSkilled);
      }
    }
  }

  getPatersonGrading(isSkilled: boolean) {
    this.isLoadingPatersonGrading$.next(true);

    this.claimService.getPatersonGradingsBySkill(isSkilled).subscribe(results => {
      this.patersonGradings = results;
      this.isLoadingPatersonGrading$.next(false);
    });
  }

  getDesignationTypes() {
    this.lookupService.getDesignationTypes('').subscribe(results => {
      this.designationTypes = results;
      this.createForm();
      this.isLoading$.next(false);
    });
  }

  createForm() {
    this.form = this.formBuilder.group({
      employeeNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      startDate: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      endDate: [{ value: null, disabled: this.isReadOnly }],
      isTraineeLearnerApprentice: [{ value: null, disabled: this.isReadOnly }],
      isSkilled: [{ value: null, disabled: this.isReadOnly }],
      yearsInIndustry: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      yearsInPresentOccupation: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      patersonGrading: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      rmaEmployeeRefNum: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      employeeIndustryNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      designationType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });

    if (this.personEmployment) {
      this.setForm();
    }
  }

  setForm() {
    this.form.patchValue({
      employeeNumber: this.personEmployment.employeeNumber,
      startDate: this.personEmployment.startDate,
      endDate: this.personEmployment.endDate,
      isTraineeLearnerApprentice: this.personEmployment.isTraineeLearnerApprentice,
      isSkilled: this.personEmployment.isSkilled,
      yearsInIndustry: this.personEmployment.yearsInIndustry,
      yearsInPresentOccupation: this.personEmployment.yearsInPresentOccupation,
      patersonGrading: this.personEmployment.patersonGradingId,
      rmaEmployeeRefNum: this.personEmployment.rmaEmployeeRefNum,
      employeeIndustryNumber: this.personEmployment.employeeIndustryNumber,
      designationType: this.personEmployment.designationTypeId
    });

    this.maxDate = new Date().getCorrectUCTDate();
  }

  readForm() {
    const personEmployment = new PersonEmployment();
    personEmployment.personEmpoymentId = this.personEmployment ? this.personEmployment.personEmpoymentId : 0;
    personEmployment.employerRolePlayerId = this.employerRolePlayer ? this.employerRolePlayer.rolePlayerId : this.personEmployment.employerRolePlayerId;
    personEmployment.employeeRolePlayerId = this.employeeRolePlayer.rolePlayerId;
    personEmployment.employeeNumber = this.form.controls.employeeNumber.value;
    personEmployment.startDate = new Date(this.datePipe.transform(this.form.controls.startDate.value, 'yyyy-MM-dd')).getCorrectUCTDate(); 
    personEmployment.endDate = (!this.form.controls.endDate.value) ? null : new Date(this.datePipe.transform(this.form.controls.endDate.value, 'yyyy-MM-dd')).getCorrectUCTDate();
    personEmployment.isTraineeLearnerApprentice = this.form.controls.isTraineeLearnerApprentice.value ? this.form.controls.isTraineeLearnerApprentice.value : false;
    personEmployment.isSkilled = this.form.controls.isSkilled.value ? this.form.controls.isSkilled.value : false;
    personEmployment.yearsInIndustry = this.form.controls.yearsInIndustry.value;
    personEmployment.yearsInPresentOccupation = this.form.controls.yearsInPresentOccupation.value;
    personEmployment.patersonGradingId = this.form.controls.patersonGrading.value;
    personEmployment.rmaEmployeeRefNum = this.form.controls.rmaEmployeeRefNum.value;
    personEmployment.employeeIndustryNumber = this.form.controls.employeeIndustryNumber.value;
    personEmployment.designationTypeId = this.form.controls.designationType.value;

    const index = this.employeeRolePlayer.person.personEmployments.findIndex(s => s.personEmpoymentId == personEmployment.personEmpoymentId);
    if (index > -1) {
      this.employeeRolePlayer.person.personEmployments[index] = personEmployment;
    } else {
      this.employeeRolePlayer.person.personEmployments.push(personEmployment);
    }
  }

  close($event: boolean) {
    this.closeEmit.emit($event);
  }

  save() {
    this.isLoading$.next(true);
    this.readForm();
    this.rolePlayerService.updateRolePlayer(this.employeeRolePlayer).subscribe(result => {
      this.employeeRolePlayer.person.personEmployments = [];
      this.close(true);
    });
  }

  skillLevelChanged($event: boolean) {
    this.getPatersonGrading($event);
  }

  traineeLearnerApprenticeChanged($event: boolean) {
    // TODO: Ryan Maree
  }

  formatLookup(lookup: string) {
    if (!lookup) { return; }
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
