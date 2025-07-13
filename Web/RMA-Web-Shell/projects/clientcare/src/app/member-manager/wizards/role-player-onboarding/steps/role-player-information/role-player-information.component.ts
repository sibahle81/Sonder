    import { ActivatedRoute } from '@angular/router';
    import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
    import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
    import { BehaviorSubject } from 'rxjs';

    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
    import { RolePlayerRelation } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer-relation';
    import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
    import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';

    import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
    import { MatDialog } from '@angular/material/dialog';
    import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
    import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
    import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
    import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
    import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
    import { CompensationFundStatusEnum } from 'projects/shared-models-lib/src/lib/enums/compensation-fund-status-enum';
    import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
    import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
    import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
    import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
    import { RolePlayerTypeEnum } from 'projects/shared-models-lib/src/lib/enums/role-player-type-enum';
    import { MemberStatusEnum } from 'projects/shared-models-lib/src/lib/enums/member-status-enum';
    import { RolePlayerIdentificationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/roleplayer-identification-type-enum';

    @Component({
    templateUrl: './role-player-information.component.html'
    })

    export class RolePlayerInformationComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

    addPermission = 'Add Member';
    editPermission = 'Edit Member';
    viewPermission = 'View Member';
    viewAuditPermission = 'View Audits';
  
    rolePlayer: RolePlayer;
    isReadOnly = false;
    
    form: UntypedFormGroup;
    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  
    isValidatingUniqueRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isValidatingUniqueCFReferenceNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    isValidatingUniqueCFRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  
    clientTypes: ClientTypeEnum[];
    industryClasses: IndustryClassEnum[];
    industryTypes: IndustryTypeEnum[];
    registrationTypes: CompanyIdTypeEnum[];
    companyLevels: CompanyLevelEnum[];
    compensationFundStatuses: CompensationFundStatusEnum[];
  
    selectedCompanyLevel: CompanyLevelEnum;
    rolePlayerRelation: RolePlayerRelation;
  
    originalHoldingCompany: Company;
    selectedHoldingCompany: Company;
  
    isEdit: boolean;
    showCompanySearch: boolean;
  
    branch = CompanyLevelEnum.Branch;
    subsidiary = CompanyLevelEnum.Subsidiary;
    holdingCompany = CompanyLevelEnum.HoldingCompany;  
    company = CompanyLevelEnum.Company;  

    constructor(
        readonly appEventsManager: AppEventsManager,
        readonly authService: AuthService,
        readonly activatedRoute: ActivatedRoute,
        private readonly formBuilder: UntypedFormBuilder,
        public dialog: MatDialog,
        private readonly memberService: MemberService,
        private readonly leadService: LeadService
    ) {
        super(appEventsManager, authService, activatedRoute);
    }

    onLoadLookups(): void {
        this.getLookups();
    }

    populateModel(): void { 
        this.readForm();
        this.model = this.rolePlayer;
    }

    populateForm(): void { 
        if(this.model){
            this.rolePlayer = this.model;
            if(!this.rolePlayer.company)
            {
                this.rolePlayer.rolePlayerId = 0;
                this.rolePlayer.company = new Company();
                this.rolePlayer.memberStatus = MemberStatusEnum.New;
                this.rolePlayer.rolePlayerIdentificationType = RolePlayerIdentificationTypeEnum.Company;
            }
        }
    }

    onValidateModel(validationResult: ValidationResult): ValidationResult {
        return validationResult;
    }
  
    getLookups() {
        this.clientTypes = this.ToArray(ClientTypeEnum);
        this.industryClasses = this.ToArray(IndustryClassEnum);
        this.registrationTypes = this.ToArray(CompanyIdTypeEnum);
        this.industryTypes = this.ToArray(IndustryTypeEnum);
        this.compensationFundStatuses = this.ToArray(CompensationFundStatusEnum);
        this.companyLevels = this.ToArray(CompanyLevelEnum);
    
        this.selectedCompanyLevel = this.rolePlayer.company.companyLevel;
        this.getHoldingCompany();
    }
    
    getHoldingCompany() {
        if (this.rolePlayer.company.linkedCompanyId) {
            this.memberService.getMember(this.rolePlayer.company.linkedCompanyId).subscribe(result => {
                this.originalHoldingCompany = result.company;
                this.selectedHoldingCompany = result.company;
                this.createForm();
            });
        } else {
            this.createForm();
        }
    }
    
    createForm() {
        this.form = this.formBuilder.group({
            name: [{ value: null, disabled: false }, Validators.required],
            clientType: [{ value: null, disabled: false }, Validators.required],
            registrationType: [{ value: null, disabled: false }, Validators.required],
            registrationNumber: [{ value: null, disabled: false }, Validators.required],
            compensationFundReferenceNumber: [{ value: null, disabled: false }],
            compensationFundRegistrationNumber: [{ value: null, disabled: false }],
            industryClass: [{ value: null, disabled: false }, Validators.required],
            industryType: [{ value: null, disabled: false }, Validators.required],
            companyLevel: [{ value: null, disabled: false }, Validators.required],
            holdingCompany: [{ value: null, disabled: false }],
            vatRegistrationNo: [{ value: null, disabled: false }],
            compensationFundStatus: [{ value: null, disabled: false }, Validators.required],
            natureOfBusiness: [{ value: null, disabled: false }, Validators.required],
            isTopEmployer: [{ value: null, disabled: false }]
        }); 
        
        if(this.rolePlayer?.company)
        {
            this.setForm();
        }            
    }
    
    setForm() {
        this.form.patchValue({
            name: this.rolePlayer.displayName ? this.rolePlayer.displayName : null,
            clientType: this.rolePlayer.clientType ? ClientTypeEnum[this.rolePlayer.clientType] : null,
            registrationType: this.rolePlayer.company.companyIdType ? CompanyIdTypeEnum[this.rolePlayer.company.companyIdType] : null,
            registrationNumber: this.rolePlayer.company.idNumber ? this.rolePlayer.company.idNumber : null,
            compensationFundReferenceNumber: this.rolePlayer.company.compensationFundReferenceNumber ? this.rolePlayer.company.compensationFundReferenceNumber : null,
            compensationFundRegistrationNumber: this.rolePlayer.company.referenceNumber ? this.rolePlayer.company.referenceNumber : null,
            industryClass: this.rolePlayer.company.industryClass ? IndustryClassEnum[this.rolePlayer.company.industryClass] : null,
            companyLevel: this.rolePlayer.company.companyLevel ? CompanyLevelEnum[this.rolePlayer.company.companyLevel] : CompanyLevelEnum[CompanyLevelEnum.Company],
            vatRegistrationNo: this.rolePlayer.company.vatRegistrationNo ? this.rolePlayer.company.vatRegistrationNo : null,
            industryType: this.rolePlayer.company.industryId ? IndustryTypeEnum[this.rolePlayer.company.industryId] : null,
            compensationFundStatus: this.rolePlayer.company.compensationFundStatus ? CompensationFundStatusEnum[this.rolePlayer.company.compensationFundStatus] : CompensationFundStatusEnum[CompensationFundStatusEnum.Confirmed],
            holdingCompany: this.selectedHoldingCompany ? this.selectedHoldingCompany.name : 'N/A',
            natureOfBusiness: this.rolePlayer.company.natureOfBusiness ? this.rolePlayer.company.natureOfBusiness : null,
        });
           
        this.isLoading$.next(false);
    }
    
    readForm() {
        if (!this.rolePlayer.company.rolePlayerId || this.rolePlayer.company.rolePlayerId <= 0) {
          this.rolePlayer.displayName = this.form.controls.name.value;
          this.rolePlayer.company.name = this.rolePlayer.displayName;
          this.rolePlayer.company.industryClass = +IndustryClassEnum[this.form.controls.industryClass.value];
          this.rolePlayer.clientType = +ClientTypeEnum[this.form.controls.clientType.value]
        }
        
        this.rolePlayer.company.vatRegistrationNo = this.form.controls.vatRegistrationNo.value;
        this.rolePlayer.company.companyLevel = this.selectedCompanyLevel ? this.selectedCompanyLevel : +CompanyLevelEnum[this.form.controls.companyLevel.value];
        this.rolePlayer.company.linkedCompanyId = this.selectedHoldingCompany ? this.selectedHoldingCompany.rolePlayerId : null;
        this.rolePlayer.company.compensationFundStatus = +CompensationFundStatusEnum[this.form.controls.compensationFundStatus.value];
        this.rolePlayer.company.natureOfBusiness = this.form.controls.natureOfBusiness.value;
        this.rolePlayer.company.industryId = +IndustryTypeEnum[this.form.controls.industryType.value];
    
        this.rolePlayer.company.referenceNumber = this.form.controls.compensationFundRegistrationNumber.value;
        this.rolePlayer.company.compensationFundReferenceNumber = this.form.controls.compensationFundReferenceNumber.value;
        this.rolePlayer.company.companyIdType = +CompanyIdTypeEnum[this.form.controls.registrationType.value];
        this.rolePlayer.company.idNumber = this.form.controls.registrationNumber.value;

        if(this.selectedHoldingCompany)
        {
            this.rolePlayer.company.linkedCompanyId = this.selectedHoldingCompany.rolePlayerId;
            this.rolePlayerRelation = new RolePlayerRelation();
            this.rolePlayerRelation.fromRolePlayerId = this.rolePlayer.rolePlayerId;
            this.rolePlayerRelation.toRolePlayerId = this.selectedHoldingCompany.rolePlayerId;
            this.rolePlayerRelation.rolePlayerTypeId = +RolePlayerTypeEnum.Branch;
            if(this.rolePlayer.fromRolePlayers && this.rolePlayer.fromRolePlayers.length > 0)
            {
                this.rolePlayer.fromRolePlayers = [];
            }
            this.rolePlayer.fromRolePlayers.push(this.rolePlayerRelation);
        }
    
        this.form.markAsPristine();
    }

    isValid() {
        this.validateUniqueRegistrationNumber(this.form.controls.registrationNumber.value);
    }
    
    validateUniqueRegistrationNumber(registrationNumber: string) {
        this.isValidatingUniqueRegistrationNumber$.next(true);
        this.memberService.getMemberCompanyByRegistrationNumber(registrationNumber).subscribe(result => {
            if (result && result.rolePlayerId != this.rolePlayer.rolePlayerId) {
                this.form.controls.registrationNumber.setErrors({ notUnique: true });
            } else {
                this.form.controls.registrationNumber.setErrors(null);
                this.form.controls.registrationNumber.updateValueAndValidity();
            }
            this.isValidatingUniqueRegistrationNumber$.next(false);
    
          this.validateUniqueCFReferenceNumber(this.form.controls.compensationFundReferenceNumber.value);
        });
    }
    
    validateUniqueCFReferenceNumber(cfReferenceNumber: string) {
        this.isValidatingUniqueCFReferenceNumber$.next(true);
        this.memberService.getMemberCompanyByCFReferenceNumber(cfReferenceNumber).subscribe(result => {
            if (result && result.rolePlayerId != this.rolePlayer.rolePlayerId) {
                this.form.controls.compensationFundReferenceNumber.setErrors({ notUnique: true });
            } else {
                this.form.controls.compensationFundReferenceNumber.setErrors({ notUnique: false });
                this.form.controls.compensationFundReferenceNumber.updateValueAndValidity();
            }
            this.isValidatingUniqueCFReferenceNumber$.next(false);
        
            this.validateUniqueCFRegistrationNumber(this.form.controls.compensationFundRegistrationNumber.value);
        });
    }
    
    validateUniqueCFRegistrationNumber(cfRegistrationNumber: string) {
        this.isValidatingUniqueCFRegistrationNumber$.next(true);
        this.memberService.getMemberCompanyByCFRegistrationNumber(cfRegistrationNumber).subscribe(result => {
          if (result && result.rolePlayerId != this.rolePlayer.rolePlayerId) {
            this.form.controls.compensationFundRegistrationNumber.setErrors({ notUnique: true });
          } else {
            this.form.controls.compensationFundRegistrationNumber.setErrors({ notUnique: false });
            this.form.controls.compensationFundRegistrationNumber.updateValueAndValidity();
          }
          this.isValidatingUniqueCFRegistrationNumber$.next(false);
    
          //this.save();
        });
    }
    
    toggleCompanySearch() {
        this.showCompanySearch = !this.showCompanySearch;
    }
    
    setCompany($event: Company) {
        this.selectedHoldingCompany = $event;
    
        this.form.patchValue({
          holdingCompany: $event.name
        });
    
        this.toggleCompanySearch();
        this.form.markAsDirty();
    }
    
    companyLevelChanged($event: CompanyLevelEnum) {
        this.selectedCompanyLevel = +CompanyLevelEnum[$event];
    
        if (this.selectedCompanyLevel === CompanyLevelEnum.Subsidiary) {
          this.applyValidationToFormControl(Validators.required, 'holdingCompany')
        } else {
          this.clearValidationToFormControl('holdingCompany')
          this.form.patchValue({ holdingCompany: this.originalHoldingCompany ? this.originalHoldingCompany.name : null });
          this.selectedHoldingCompany = null;
        }
    }
    
    cancel() {
        if (this.showCompanySearch) {
          this.toggleCompanySearch();
        } else {
          this.isEdit = false;
    
          this.selectedCompanyLevel = this.rolePlayer.company.companyLevel;
          this.selectedHoldingCompany = this.originalHoldingCompany ? this.originalHoldingCompany : null;
    
          this.setForm();
        }
    }

    applyValidationToFormControl(validationToApply: any, controlName: string) {
        this.form.get(controlName).setValidators(validationToApply);
        this.form.get(controlName).markAsTouched();
        this.form.get(controlName).updateValueAndValidity();
    }
    
    clearValidationToFormControl(controlName: string) {
        this.form.get(controlName).clearValidators();
        this.form.get(controlName).markAsTouched();
        this.form.get(controlName).updateValueAndValidity();
    }
    
    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
          .filter(StringIsNumber)
          .map(key => anyEnum[key]);
    }
    
    formatLookup(lookup: string) {
        if (lookup) {
            return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
    }
}
