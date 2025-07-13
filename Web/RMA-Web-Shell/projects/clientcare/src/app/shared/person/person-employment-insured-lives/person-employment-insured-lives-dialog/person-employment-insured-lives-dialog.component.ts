import { Component, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ToastrManager } from 'ng6-toastr-notifications';
import {GroupRiskPolicyCaseService} from "projects/clientcare/src/app/policy-manager/shared/Services/group-risk-policy-case.service";
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { Benefit } from 'projects/clientcare/src/app/product-manager/models/benefit';
import { EmployeeOtherInsuredlifeModel } from 'projects/clientcare/src/app/policy-manager/shared/entities/employee-other-insured-life-model';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { PersonEmployment } from 'projects/clientcare/src/app/policy-manager/shared/entities/person-employment';
import { PolicyDetail } from "projects/clientcare/src/app/policy-manager/shared/entities/policy-detail";
import { PolicyBenefitCategory } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy-benefit-category';
import { PersonInsuredCategoryStatusEnum } from 'projects/shared-models-lib/src/lib/enums/person-insured-category-status-enum';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
import { IdTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/idTypeEnum';
import { MaritalStatusEnum } from 'projects/shared-models-lib/src/lib/enums/marital-status-enum';
import { Error } from 'projects/shared-models-lib/src/lib/common/error';

@Component({
  selector: 'person-employment-insured-lives-dialog',
  templateUrl: './person-employment-insured-lives-dialog.component.html',
  styleUrls: ['./person-employment-insured-lives-dialog.component.css']
})
export class PersonEmploymentInsuredLivesDialogComponent implements OnChanges {
    @Input() otherInsureLifeRolePlayer: RolePlayer; // required: 
    @Input() employeeRolePlayer: RolePlayer; // required: 
    @Input() personEmployment: PersonEmployment; // required: 
    @Input() employeeOtherInsuredlifeModel: EmployeeOtherInsuredlifeModel;
    @Input() isReadOnly = false;

    @Output() closeEmit = new EventEmitter<boolean>();
    @Output() saveEmit = new EventEmitter<EmployeeOtherInsuredlifeModel>();

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    form: UntypedFormGroup;
    isEdit = false;    

    Policies: PolicyDetail[];
    Benefits: Benefit[];
    BenefitCategories: PolicyBenefitCategory[];
    relationships: RolePlayerTypeEnum[] = [RolePlayerTypeEnum.Spouse, RolePlayerTypeEnum.Child, RolePlayerTypeEnum.Niece, RolePlayerTypeEnum.Nephew, RolePlayerTypeEnum.Mother, RolePlayerTypeEnum.Father, RolePlayerTypeEnum.Other];
    idTypes: IdTypeEnum[] = [IdTypeEnum.Passport_Document, IdTypeEnum.SA_ID_Document];
    titles: Lookup[] = [];
    genders: Lookup[] = [];
    maritalStatuses: Lookup[] = [];
    nationalities: Lookup[] = [];

    
    employerRolePlayerId: number;
    selectedPolicyId: number;
    selectedBenefitId: number;
    selectedEffectiveDate: Date;
    selectedBenefitCategoryId: number;
    addedEmployeeOtherInsuredlifeModel: EmployeeOtherInsuredlifeModel
    selectedPolicyName: string;
    selectedBenefitName: string;
    selectedBenefitCategoryName: string;

    constructor(
        private readonly formBuilder: UntypedFormBuilder,
        readonly groupRiskPolicyCaseService: GroupRiskPolicyCaseService,
        private readonly lookupService: LookupService,
        private readonly rolePlayerService: RolePlayerService,
        private readonly alert: ToastrManager,
    ) { }

    ngOnInit()
    {
        this.createForm();
        this.getLookups();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
    }   
    
    createForm() {
        this.form = this.formBuilder.group({
            relationship: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            title: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            initials: [{ value: null, disabled: this.isReadOnly }],
            name: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            surname: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            idNumber: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            dateOfBirth: [{ value: null, disabled: this.isReadOnly }, [Validators.required]],
            taxNumber: [{ value: null, disabled: this.isReadOnly }],
            gender: [{ value: null, disabled: this.isReadOnly }],
            idType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
            nationality: [{ value: null, disabled: this.isReadOnly }, Validators.required]
        });
    
        if (this.employeeOtherInsuredlifeModel) {
            this.setForm();
        }  
        this.isLoading$.next(false);       
    }
    
    setForm() {
        this.form.patchValue({
            relationship: this.employeeOtherInsuredlifeModel.relationship,
            title: this.employeeOtherInsuredlifeModel.title,
            initials: this.employeeOtherInsuredlifeModel.initials,
            name: this.employeeOtherInsuredlifeModel.name,
            surname: this.employeeOtherInsuredlifeModel.surname,
            idNumber: this.employeeOtherInsuredlifeModel.idNumber,
            dateOfBirth: this.employeeOtherInsuredlifeModel.dateOfBirth,
            taxNumber: this.employeeOtherInsuredlifeModel.taxNumber,
            gender: this.employeeOtherInsuredlifeModel.gender,
            maritalStatus: this.employeeOtherInsuredlifeModel.maritalStatus,
            idType: this.employeeOtherInsuredlifeModel.idType,
            nationality: this.employeeOtherInsuredlifeModel.nationality
        });
    }
    
    readForm() {
        const employeeOtherInsuredlifeModel = new EmployeeOtherInsuredlifeModel();
        employeeOtherInsuredlifeModel.employeeRolePlayerId = this.employeeOtherInsuredlifeModel ? this.employeeOtherInsuredlifeModel.employeeRolePlayerId : this.employeeRolePlayer?.rolePlayerId
        employeeOtherInsuredlifeModel.otherInsureLifeRolePlayerId = this.employeeOtherInsuredlifeModel ? this.employeeOtherInsuredlifeModel.otherInsureLifeRolePlayerId : 0
        employeeOtherInsuredlifeModel.relationship = this.form.controls.relationship.value;
        employeeOtherInsuredlifeModel.title = this.form.controls.title.value;
        employeeOtherInsuredlifeModel.initials = this.form.controls.initials.value;
        employeeOtherInsuredlifeModel.name = this.form.controls.name.value;
        employeeOtherInsuredlifeModel.surname = this.form.controls.surname.value;
        employeeOtherInsuredlifeModel.dateOfBirth = this.form.controls.dateOfBirth.value;
        employeeOtherInsuredlifeModel.taxNumber  = this.form.controls.taxNumber.value;
        employeeOtherInsuredlifeModel.gender  = this.form.controls.gender.value;        
        employeeOtherInsuredlifeModel.idType  = this.form.controls.idType.value;
        employeeOtherInsuredlifeModel.nationality  = this.form.controls.nationality.value;
        employeeOtherInsuredlifeModel.idNumber = this.form.controls.idNumber.value;
        employeeOtherInsuredlifeModel.maritalStatus = MaritalStatusEnum.Single;
        this.addedEmployeeOtherInsuredlifeModel = employeeOtherInsuredlifeModel;
    }
    
    newEffectiveDateChanged($event: any) {
        this.selectedEffectiveDate = new Date($event.value) ;
    }
    close($event: boolean) {
        this.closeEmit.emit($event);
    }
    
    save() {
        this.isLoading$.next(true);
        this.readForm();
        if (this.addedEmployeeOtherInsuredlifeModel.otherInsureLifeRolePlayerId>0)
        {          
          this.groupRiskPolicyCaseService.updateEmployeeOtherInsuredLife(this.addedEmployeeOtherInsuredlifeModel).subscribe(result => {           
            if(result){
                this.saveEmit.emit(this.addedEmployeeOtherInsuredlifeModel);
                this.alert.successToastr('updated successfully');
                this.isLoading$.next(false);
            }
            else
            {
                this.isLoading$.next(false);
            }
          },(error) => {
                          this.alert.errorToastr(error.message,'Failed to update insured life' );
                          this.isLoading$.next(false); 
          });
        }
        else
        {
          this.groupRiskPolicyCaseService.createEmployeeOtherInsuredLife(this.addedEmployeeOtherInsuredlifeModel).subscribe(result => {           
            if(result){
                this.saveEmit.emit(this.addedEmployeeOtherInsuredlifeModel);
                this.alert.successToastr('created successfully');
                this.isLoading$.next(false);
            }
            else
            {
                this.isLoading$.next(false);
            }
         }); 
       }
    }  
  
    getLookups() {
      this.getTitles();
      this.getGenders();
      this.getMaritalStatus();
      this.getNationalities();
    }
  
    getTitles() {
      this.lookupService.getTitles().subscribe((titles) => {
        this.titles = titles;
      });
    }
  
    getGenders() {
      this.lookupService.getGenders().subscribe((genders) => {
        this.genders = genders;
      });
    }
  
    getMaritalStatus() {
      this.lookupService.getMaritalStatus().subscribe((maritalStatuses) => {
        this.maritalStatuses = maritalStatuses;
      });
    }

    getNationalities(){
        this.lookupService.getNationalities().subscribe((nationalities) => {
            this.nationalities = nationalities;
        });
    }

    getRelationshipType(rolePlayerType: RolePlayerTypeEnum) {
      return this.formatText(RolePlayerTypeEnum[rolePlayerType]);
    }

    getIdType(idType: IdTypeEnum) {
      return this.formatText(IdTypeEnum[idType]);
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
} 
