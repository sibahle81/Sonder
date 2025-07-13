import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from "@angular/common";
import { ToastrManager } from 'ng6-toastr-notifications';

import {GroupRiskPolicyCaseService} from "projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service";
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { EmployeeInsuredCategoryModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-insured-category-model';
import { EmployeeOtherInsuredlifeModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-other-insured-life-model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { PolicyDetail } from "projects/clientcare/src/app/policy-manager/shared/entities/policy-detail";
import { PolicyBenefitCategory } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-benefit-category';

import { PersonInsuredCategoryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-insured-category-status-enum';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';

@Component({
  selector: 'person-employment-benefit-details-dialog',
  templateUrl: './person-employment-benefit-details-dialog.component.html',
  styleUrls: ['./person-employment-benefit-details-dialog.component.css']
})
export class PersonEmploymentBenefitDetailsDialogComponent implements OnChanges {
    @Input() employerRolePlayer: RolePlayer; // required: 
    @Input() employeeRolePlayer: RolePlayer; // required: 
    @Input() personEmployment: PersonEmployment; // required: 
    @Input() employeeInsuredBenefitModel: EmployeeInsuredCategoryModel;
    @Input() isReadOnly = false;
    @Input() isEdit = false;

    @Output() closeEmit = new EventEmitter<boolean>();
    @Output() saveEmit = new EventEmitter<EmployeeInsuredCategoryModel>();

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    form: UntypedFormGroup;

    personInsuredCategoryStatuses: Lookup[] = [];
    insuredlives: EmployeeOtherInsuredlifeModel[];
    Policies: PolicyDetail[];
    Benefits: Benefit[];
    BenefitCategories: PolicyBenefitCategory[];
    effectiveDates: Date[];
    categoryStatuses: PersonInsuredCategoryStatusEnum[];

    employerRolePlayerId: number;
    selectedInsureLifeId: number;
    selectedPolicyId: number;
    selectedBenefitId: number;
    selectedEffectiveDate: Date;
    selectedBenefitCategoryId: number;
    benefitDetailId: number;
    personIsMainMember: boolean;

    addedEmployeeInsuredBenefitModel: EmployeeInsuredCategoryModel
    mainMember: EmployeeOtherInsuredlifeModel;

    selectedPolicyName: string;
    selectedBenefitName: string;
    selectedBenefitCategoryName: string;
    isEffectiveDateFirstOfMonth: boolean = false;
    isDateJoinedPolicyFirstOfMonth: boolean = false;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
        private readonly lookupService: LookupService,
        private readonly rolePlayerService: RolePlayerService,
        private readonly alert: ToastrManager,
        private readonly datePipe: DatePipe
    ) { }

    ngOnInit()
    {
        this.createForm();
        this.getLookups();
        this.getInsuredLives(this.employeeRolePlayer.rolePlayerId, this.employerRolePlayer.rolePlayerId);
        this.AddMainMemberIntoInsureLives();
        this.loadPolicies();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
    }
    
    getLookups() {
        this.categoryStatuses = this.ToArray(PersonInsuredCategoryStatusEnum);
        this.getPersonInsuredCategoryStatuses();
    }
    
    createForm() {
        this.form = this.formBuilder.group({
            selectedDetailDate: [{ value: null}],
            selectedInsuredLife: [{ value: null,  disabled: this.isEdit || this.isReadOnly }, [Validators.required]],
            policyId: [{ value: null, disabled: this.isEdit || this.isReadOnly }, [Validators.required]],
            benefitId: [{ value: null, disabled: this.isEdit || this.isReadOnly }, [Validators.required]],
            effectiveDate: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            benefitCategoryId: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            dateJoinedPolicy: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            annualSalary: [{ value: null, disabled: this.isReadOnly }],
            premium: [{ value: null, disabled: this.isReadOnly }],
            potentialCoverAmount: [{ value: null, disabled: this.isReadOnly }],
            potentialWaiverAmount: [{ value: null, disabled: this.isReadOnly }],
            actualCoverAmount: [{ value: null, disabled: this.isReadOnly }],
            actualWaiverAmount: [{ value: null, disabled: this.isReadOnly }],
            medicalPremWaiverAmount: [{ value: null, disabled: this.isReadOnly }],
            shareOfFund: [{ value: null, disabled: this.isReadOnly }],
            personInsuredCategoryStatus: [{ value: null, disabled: this.isReadOnly }, [Validators.required]]
        });
    
        if (this.employeeInsuredBenefitModel) {
            this.selectedPolicyId = this.employeeInsuredBenefitModel.policyId;
            if(this.isEdit || this.isReadOnly){
                this.loadEffectiveDates();
            }
            this.getInsuredLives(this.employeeRolePlayer.rolePlayerId, this.employerRolePlayer.rolePlayerId)
            this.AddMainMemberIntoInsureLives();
            this.loadPolicies();
            this.selectedBenefitId = this.employeeInsuredBenefitModel.benefitId;
            this.loadPolicyBenefits();
            this.loadBenefitCategories();
            this.setForm();
        }         
    }
    
    setForm() {
        this.form.patchValue({
            policyId: this.employeeInsuredBenefitModel.policyId,
            benefitId: this.employeeInsuredBenefitModel.benefitId,
            effectiveDate: this.setEffectiveDate(),
            selectedDetailDate: this.setEffectiveDate(),
            benefitCategoryId: this.employeeInsuredBenefitModel.benefitCategoryId,
            dateJoinedPolicy: this.employeeInsuredBenefitModel.dateJoinedPolicy,
            annualSalary: this.employeeInsuredBenefitModel.annualSalary,
            premium: this.employeeInsuredBenefitModel.premium,
            potentialCoverAmount: this.employeeInsuredBenefitModel.potentialCoverAmount,
            potentialWaiverAmount: this.employeeInsuredBenefitModel.potentialWaiverAmount,
            actualCoverAmount: this.employeeInsuredBenefitModel.actualCoverAmount,
            actualWaiverAmount: this.employeeInsuredBenefitModel.actualWaiverAmount,
            medicalPremWaiverAmount: this.employeeInsuredBenefitModel.medicalPremWaiverAmount,
            shareOfFund: this.employeeInsuredBenefitModel.shareOfFund,
            personInsuredCategoryStatus: this.employeeInsuredBenefitModel.personInsuredCategoryStatusId,
            selectedInsuredLife: this.employeeInsuredBenefitModel.personId
        });
    }
    
    setEffectiveDate(): Date
    {
        if(this.employeeInsuredBenefitModel)
        {
            if(this.employeeInsuredBenefitModel.personInsuredCategoryEffectiveDate >= this.employeeInsuredBenefitModel.insuredSumAssuredEffectiveDate){
                return this.employeeInsuredBenefitModel.personInsuredCategoryEffectiveDate;
            }
            else
            {
                return this.employeeInsuredBenefitModel.insuredSumAssuredEffectiveDate;
            }
        }
    }
    
    readForm() {
        const employeeInsuredBenefitModel = new EmployeeInsuredCategoryModel();
        employeeInsuredBenefitModel.policyId = this.form.controls.policyId.value;
        employeeInsuredBenefitModel.benefitId = this.form.controls.benefitId.value;
        employeeInsuredBenefitModel.policyName = this.selectedPolicyName ? this.selectedPolicyName : '';
        employeeInsuredBenefitModel.benefitName = this.selectedBenefitName ?  this.selectedBenefitName : '';

        employeeInsuredBenefitModel.personId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.personId : this.selectedInsureLifeId;
        employeeInsuredBenefitModel.benefitDetailId = this.benefitDetailId;
        employeeInsuredBenefitModel.rolePlayerTypeId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.rolePlayerTypeId : this.getInsuredLifeRolePlayerTypeid(employeeInsuredBenefitModel.personId);
        employeeInsuredBenefitModel.effectiveDate = new Date(this.datePipe.transform(this.form.controls.effectiveDate.value, "yyyy-MM-dd")).getCorrectUCTDate();
        if(this.isEdit && !this.isReadOnly){
            employeeInsuredBenefitModel.selectedDetailDate =  this.form.controls.selectedDetailDate.value;
        } 
        else{
            employeeInsuredBenefitModel.selectedDetailDate = new Date(this.datePipe.transform(this.form.controls.effectiveDate.value, "yyyy-MM-dd")).getCorrectUCTDate();
        }    

        employeeInsuredBenefitModel.personInsuredCategoryId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.personInsuredCategoryId : 0;
        employeeInsuredBenefitModel.personInsuredCategoryEffectiveDate = this.employeeInsuredBenefitModel ? 
                                                                        new Date(this.datePipe.transform(this.employeeInsuredBenefitModel.personInsuredCategoryEffectiveDate, "yyyy-MM-dd")).getCorrectUCTDate(): 
                                                                        new Date(this.datePipe.transform(this.form.controls.effectiveDate.value, "yyyy-MM-dd")).getCorrectUCTDate();
        employeeInsuredBenefitModel.benefitCategoryId = this.form.controls.benefitCategoryId.value;
        employeeInsuredBenefitModel.benefitCategoryName = this.selectedBenefitCategoryName ?  this.selectedBenefitCategoryName : '';
        if(employeeInsuredBenefitModel.rolePlayerTypeId == RolePlayerTypeEnum.MainMemberSelf){
            employeeInsuredBenefitModel.personEmploymentId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.personEmploymentId : this.personEmployment?.personEmpoymentId;
        }
        else{
            employeeInsuredBenefitModel.personEmploymentId = -1;
        }
    
        employeeInsuredBenefitModel.personInsuredCategoryStatusId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.personInsuredCategoryStatusId : this.form.controls.personInsuredCategoryStatus.value;
        employeeInsuredBenefitModel.dateJoinedPolicy = new Date(this.datePipe.transform(this.form.controls.dateJoinedPolicy.value, "yyyy-MM-dd")).getCorrectUCTDate();

        employeeInsuredBenefitModel.insuredSumAssuredId = this.employeeInsuredBenefitModel ? this.employeeInsuredBenefitModel.insuredSumAssuredId : 0;
        employeeInsuredBenefitModel.insuredSumAssuredEffectiveDate = this.employeeInsuredBenefitModel ? 
                                                new Date(this.datePipe.transform(this.employeeInsuredBenefitModel.insuredSumAssuredEffectiveDate, "yyyy-MM-dd")).getCorrectUCTDate(): 
                                                new Date(this.datePipe.transform(this.form.controls.effectiveDate.value, "yyyy-MM-dd")).getCorrectUCTDate();
        employeeInsuredBenefitModel.annualSalary = this.form.controls.annualSalary.value;
        employeeInsuredBenefitModel.premium = this.form.controls.premium.value;
        employeeInsuredBenefitModel.potentialCoverAmount = this.form.controls.potentialCoverAmount.value;
        employeeInsuredBenefitModel.potentialWaiverAmount = this.form.controls.potentialWaiverAmount.value;
        employeeInsuredBenefitModel.actualCoverAmount = this.form.controls.actualCoverAmount.value;
        employeeInsuredBenefitModel.actualWaiverAmount = this.form.controls.actualWaiverAmount.value;
        employeeInsuredBenefitModel.medicalPremWaiverAmount = this.form.controls.medicalPremWaiverAmount.value;
        employeeInsuredBenefitModel.shareOfFund = this.form.controls.shareOfFund.value;

        this.addedEmployeeInsuredBenefitModel = employeeInsuredBenefitModel;
    }
    
    loadEffectiveDates() {
        this.isLoading$.next(true);
        let personEmploymentId = this.employeeInsuredBenefitModel.personEmploymentId? this.employeeInsuredBenefitModel.personEmploymentId : -1;
        this.groupRiskPolicyCaseService.getInsuredCategoryEffectiveDates(this.employeeInsuredBenefitModel.personId, 
            personEmploymentId, this.employeeInsuredBenefitModel.rolePlayerTypeId, 
            this.employeeInsuredBenefitModel.benefitDetailId)
            .subscribe((results) => {
                this.effectiveDates = results;
                this.isLoading$.next(false);
        });
    }

    newEffectiveDateChanged($event: any) {
        this.selectedEffectiveDate = new Date($event.value);        
    }

    getInsuredLives(employeeRoleplayerId: number, employerRolePlayerId: number) {
        this.isLoading$.next(true);
        let sub = this.groupRiskPolicyCaseService.getEmployeeOtherInsuredLives(employeeRoleplayerId, employerRolePlayerId).subscribe(result => {
            if (result) {
                this.insuredlives = result;
                this.AddMainMemberIntoInsureLives();
                this.isLoading$.next(false);
            }
        });
    }

    getInsuredLifeRolePlayerTypeid(employeeRoleplayerId: number) : number{
        let rolePlayerTypeid = 0
        if(this.insuredlives)
        {
            rolePlayerTypeid = this.insuredlives.find(life => life.otherInsureLifeRolePlayerId === employeeRoleplayerId).relationship;
        }

        this.personIsMainMember = rolePlayerTypeid == RolePlayerTypeEnum.MainMemberSelf ? true : false;
        return rolePlayerTypeid;
    }

    AddMainMemberIntoInsureLives()
    {  
        this.mainMember = new EmployeeOtherInsuredlifeModel();
        this.mainMember.otherInsureLifeRolePlayerId = this.employeeRolePlayer.rolePlayerId;
        this.mainMember.name = this.employeeRolePlayer.person.firstName;
        this.mainMember.surname = this.employeeRolePlayer.person.surname;
        this.mainMember.relationship = RolePlayerTypeEnum.MainMemberSelf;

        if(this.insuredlives){
            this.insuredlives.push(this.mainMember);
        }
    }

    onInsuredLifeChanged($event: any){
        this.selectedInsureLifeId = $event;
    }

    loadPolicies() {
        if(this.employerRolePlayer && this.employerRolePlayer.rolePlayerId){
            if (!this.Policies || this.Policies.length === 0) {
                this.isLoading$.next(true);
                this.groupRiskPolicyCaseService.getPolicyDetailByEmployerRolePlayerId(this.employerRolePlayer.rolePlayerId)
                    .subscribe((results) => {
                        this.Policies = results;
                        this.isLoading$.next(false);
                });
            }
        }
    }
    
    onDetailsDateChanged(selectedDate: Date) {
        this.isLoading$.next(true);
        this.employeeInsuredBenefitModel.selectedDetailDate = selectedDate;
        let personEmploymentId = this.employeeInsuredBenefitModel.personEmploymentId? this.employeeInsuredBenefitModel.personEmploymentId : -1
        this.groupRiskPolicyCaseService.getInsuredCategoryByEffectiveDate(this.employeeInsuredBenefitModel.personId, 
            personEmploymentId, this.employeeInsuredBenefitModel.rolePlayerTypeId, 
            this.employeeInsuredBenefitModel.benefitDetailId, this.employeeInsuredBenefitModel.selectedDetailDate.toString())
            .subscribe((results) => {
                this.employeeInsuredBenefitModel = results;
                this.setForm();
                this.isLoading$.next(false);
        });
    }
   
    selectedPolicyChange($event: any) {
        this.selectedPolicyId = $event.value;
        this.selectedPolicyName = $event.source.triggerValue;
        this.loadPolicyBenefits();
    } 

    loadPolicyBenefits() {
        this.isLoading$.next(true);
        this.groupRiskPolicyCaseService
            .getPolicyBenefit(this.selectedPolicyId)
            .subscribe((results) => {
                this.Benefits = results;   
                if(this.Benefits && this.Benefits.length == 1) {
                    this.form.patchValue({
                        benefitId:   this.Benefits[0].id,
                    });
                    this.selectedBenefitId =  this.Benefits[0].id;
                    this.selectedBenefitName = this.Benefits[0].name;
                    this.loadBenefitCategories();
                }    
            this.isLoading$.next(false);
            });
    }  

    selectedBenefitChange($event: any) {
        this.selectedBenefitId = $event.value;
        this.selectedBenefitName = $event.source.triggerValue;
        this.loadBenefitCategories();
    }

    loadBenefitCategories() {
        if (this.selectedPolicyId > 0 && this.selectedBenefitId > 0) {
            this.isLoading$.next(true);    
            this.groupRiskPolicyCaseService
                .getPolicyBenefitCategory(this.selectedPolicyId, this.selectedBenefitId)
                .subscribe((results) => {
                    this.BenefitCategories = results;
                    this.benefitDetailId = this.BenefitCategories[0].benefitDetailId;
                    if(this.BenefitCategories && this.BenefitCategories.length > 0){            
                        if( this.BenefitCategories.length == 1){
                            this.selectedBenefitCategoryId = this.BenefitCategories[0].benefitCategoryId;
                            this.selectedBenefitCategoryName = this.BenefitCategories[0].name;
                            this.form.patchValue({
                                benefitCategoryId:  this.selectedBenefitCategoryId
                                });                
                        }
            
                    }
                });
    
          this.isLoading$.next(false);    
        }
    } 

    selectedBenefitCategoryChange($event: any) {
        this.selectedBenefitCategoryId = $event.value;
        this.selectedBenefitCategoryName = $event.source.triggerValue;
    }

    close($event: boolean) {
        this.closeEmit.emit($event);
    }
    
    save() {
        this.isLoading$.next(true);
        this.readForm();
        this.isDateJoinedPolicyFirstOfMonth = this.datePipe.transform(this.addedEmployeeInsuredBenefitModel.dateJoinedPolicy, "d") === "1";
        if (!this.isDateJoinedPolicyFirstOfMonth) {
            this.alert.errorToastr('The date joined policy should be on the first day of the month');
            this.isLoading$.next(false);
            return;
        }

        this.isEffectiveDateFirstOfMonth = this.datePipe.transform(this.addedEmployeeInsuredBenefitModel.effectiveDate, "d") === "1";
        if (!this.isEffectiveDateFirstOfMonth) {
            this.alert.errorToastr('The effective date should be on the first day of the month');
            this.isLoading$.next(false);
            return;
        }

        if(this.addedEmployeeInsuredBenefitModel.personInsuredCategoryId > 0)
            {
                this.groupRiskPolicyCaseService.updateEmployeeInsuredCategory(this.addedEmployeeInsuredBenefitModel).subscribe(result => {           
                    if(result){
                        this.isLoading$.next(false);
                        this.alert.successToastr('benefit category updated successfully');
                        this.saveEmit.emit(this.addedEmployeeInsuredBenefitModel);
                    }
                    else
                    {
                        this.alert.successToastr('benefit category was unsuccessfully updated');
                        this.isLoading$.next(false);
                    }
                });
            }
        else
        {
            this.groupRiskPolicyCaseService.createEmployeeInsuredCategory(this.addedEmployeeInsuredBenefitModel).subscribe(result => {           
                if(result){
                    this.isLoading$.next(false);
                    this.alert.successToastr('benefit category created successfully');
                    this.saveEmit.emit(this.addedEmployeeInsuredBenefitModel);
                }
                else
                {
                    this.alert.successToastr('benefit category was unsuccessfully created');
                    this.isLoading$.next(false);
                }
            });
        }
    }   

    getRelationshipType(rolePlayerType: RolePlayerTypeEnum) {
        return this.formatText(RolePlayerTypeEnum[rolePlayerType]);
    }

    getPersonInsuredCategoryStatus(rolePlayerType: PersonInsuredCategoryStatusEnum) {
        return this.formatText(PersonInsuredCategoryStatusEnum[rolePlayerType]);
    }

    getPersonInsuredCategoryStatuses() {
        this.lookupService.getPersonInsuredCategoryStatuses().subscribe((personInsuredCategoryStatuses) => {
          this.personInsuredCategoryStatuses = personInsuredCategoryStatuses;
        });
    }

    formatText(text: string): string {
        if (!text) { return ''; }
        return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
    }
      
    formatLookup(lookup: string): string {
        return lookup
          ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace("_", "-")
          : "N/A";
    }
    
    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
          .filter(StringIsNumber)
          .map(key => anyEnum[key]);
    }
}
