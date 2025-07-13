import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { MatDialog } from '@angular/material/dialog';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { CompensationFundStatusEnum } from 'projects/shared-models-lib/src/lib/enums/compensation-fund-status-enum';
import { ClientItemTypeEnum } from 'projects/shared-models-lib/src/lib/enums/client-item-type-enum';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'member-company',
  templateUrl: './member-company.component.html',
  styleUrls: ['./member-company.component.css']
})
export class MemberCompanyComponent extends UnSubscribe implements OnChanges {
  currentUser: User;

  addPermission = 'Add Member';
  editPermission = 'Edit Member';
  viewPermission = 'View Member';
  viewAuditPermission = 'View Audits';

  @Input() member: RolePlayer;
  @Input() isReadOnly = false;

  @Output() refreshEmit: EventEmitter<boolean> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isValidatingUniqueRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isValidatingUniqueCFReferenceNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isValidatingUniqueCFRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClasses: IndustryClassEnum[];
  industryTypes: IndustryTypeEnum[];
  registrationTypes: CompanyIdTypeEnum[];
  companyLevels: CompanyLevelEnum[];
  compensationFundStatuses: CompensationFundStatusEnum[];

  selectedCompanyLevel: CompanyLevelEnum;

  originalHoldingCompany: Company;
  selectedHoldingCompany: Company;

  isEdit: boolean;
  showCompanySearch: boolean;

  subsidiary = CompanyLevelEnum.Subsidiary;
  holdingCompany = CompanyLevelEnum.HoldingCompany;

  isSyncLead = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly memberService: MemberService,
    private readonly authService: AuthService,
    private readonly leadService: LeadService
  ) {
    super();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.member && this.member.company) {
      this.getLookups();
    }
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.registrationTypes = this.ToArray(CompanyIdTypeEnum);
    this.industryTypes = this.ToArray(IndustryTypeEnum);
    this.compensationFundStatuses = this.ToArray(CompensationFundStatusEnum);
    this.companyLevels = this.ToArray(CompanyLevelEnum);

    this.selectedCompanyLevel = this.member.company.companyLevel;
    this.getHoldingCompany();
  }

  getHoldingCompany() {
    if (this.member.company.linkedCompanyId) {
      this.memberService.getMember(this.member.company.linkedCompanyId).subscribe(result => {
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
      name: [{ value: null, disabled: true }, Validators.required],
      registrationType: [{ value: null, disabled: true }, Validators.required],
      registrationNumber: [{ value: null, disabled: true }, Validators.required],
      compensationFundReferenceNumber: [{ value: null, disabled: true }],
      compensationFundRegistrationNumber: [{ value: null, disabled: true }],
      industryClass: [{ value: null, disabled: true }, Validators.required],
      industryType: [{ value: null, disabled: true }, Validators.required],
      companyLevel: [{ value: null, disabled: true }, Validators.required],
      holdingCompany: [{ value: null, disabled: true }],
      vatRegistrationNo: [{ value: null, disabled: true }, Validators.required],
      compensationFundStatus: [{ value: null, disabled: true }, Validators.required],
      natureOfBusiness: [{ value: null, disabled: true }, Validators.required],
      isTopEmployer: [{ value: null, disabled: true }]
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      registrationType: this.member.company.companyIdType ? CompanyIdTypeEnum[this.member.company.companyIdType] : null,
      registrationNumber: this.member.company.idNumber ? this.member.company.idNumber : null,
      compensationFundReferenceNumber: this.member.company.compensationFundReferenceNumber ? this.member.company.compensationFundReferenceNumber : null,
      compensationFundRegistrationNumber: this.member.company.referenceNumber ? this.member.company.referenceNumber : null,
      industryClass: this.member.company.industryClass ? IndustryClassEnum[this.member.company.industryClass] : null,
      companyLevel: this.member.company.companyLevel ? CompanyLevelEnum[this.member.company.companyLevel] : CompanyLevelEnum[CompanyLevelEnum.Company],
      vatRegistrationNo: this.member.company.vatRegistrationNo ? this.member.company.vatRegistrationNo : null,
      industryType: this.member.company.industryId ? IndustryTypeEnum[this.member.company.industryId] : null,
      compensationFundStatus: this.member.company.compensationFundStatus ? CompensationFundStatusEnum[this.member.company.compensationFundStatus] : CompensationFundStatusEnum[CompensationFundStatusEnum.Confirmed],
      holdingCompany: this.selectedHoldingCompany ? this.selectedHoldingCompany.name : 'N/A',
      natureOfBusiness: this.member.company.natureOfBusiness ? this.member.company.natureOfBusiness : null,
    });

    this.disableForm();
    this.isLoading$.next(false);
  }

  readForm() {
    if (!this.member.company.rolePlayerId || this.member.company.rolePlayerId <= 0) {
      this.member.displayName = this.form.controls.name.value;
      this.member.company.name = this.member.displayName;
      this.member.company.industryClass = this.form.controls.vatRegistrationNo.value;
    }

    this.setLeadSync();

    this.member.company.vatRegistrationNo = this.form.controls.vatRegistrationNo.value;
    this.member.company.companyLevel = this.selectedCompanyLevel ? this.selectedCompanyLevel : null;
    this.member.company.linkedCompanyId = this.selectedHoldingCompany ? this.selectedHoldingCompany.rolePlayerId : null;
    this.member.company.compensationFundStatus = +CompensationFundStatusEnum[this.form.controls.compensationFundStatus.value];
    this.member.company.natureOfBusiness = this.form.controls.natureOfBusiness.value;
    this.member.company.industryId = +IndustryTypeEnum[this.form.controls.industryType.value];

    this.member.company.referenceNumber = this.form.controls.compensationFundRegistrationNumber.value;
    this.member.company.compensationFundReferenceNumber = this.form.controls.compensationFundReferenceNumber.value;
    this.member.company.companyIdType = +CompanyIdTypeEnum[this.form.controls.registrationType.value];
    this.member.company.idNumber = this.form.controls.registrationNumber.value;

    this.form.markAsPristine();
  }

  setLeadSync() {
    this.isSyncLead = this.member.company.referenceNumber.trim().toLowerCase() != this.form.controls.compensationFundRegistrationNumber.value.trim().toLowerCase()
      || this.member.company.compensationFundReferenceNumber.trim().toLowerCase() != this.form.controls.compensationFundReferenceNumber.value.trim().toLowerCase()
      || this.member.company.idNumber.trim().toLowerCase() != this.form.controls.registrationNumber.value.trim().toLowerCase()
      || this.member.company.industryId != +IndustryTypeEnum[this.form.controls.industryType.value]
      || this.member.company.companyIdType != +CompanyIdTypeEnum[this.form.controls.registrationType.value];
  }

  edit() {
    this.isEdit = true;
    this.enableForm();
  }

  isValid() {
    this.validateUniqueRegistrationNumber(this.form.controls.registrationNumber.value);
  }

  validateUniqueRegistrationNumber(registrationNumber: string) {
    this.isValidatingUniqueRegistrationNumber$.next(true);
    this.memberService.getMemberCompanyByRegistrationNumber(registrationNumber).subscribe(result => {
      if (result && result.rolePlayerId != this.member.rolePlayerId) {
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
      if (result && result.rolePlayerId != this.member.rolePlayerId) {
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
      if (result && result.rolePlayerId != this.member.rolePlayerId) {
        this.form.controls.compensationFundRegistrationNumber.setErrors({ notUnique: true });
      } else {
        this.form.controls.compensationFundRegistrationNumber.setErrors({ notUnique: false });
        this.form.controls.compensationFundRegistrationNumber.updateValueAndValidity();
      }
      this.isValidatingUniqueCFRegistrationNumber$.next(false);

      this.save();
    });
  }

  save() {
    if (this.form.valid) {
      this.isLoading$.next(true);
      this.disableForm();
      this.readForm();

      if (this.member.rolePlayerId > 0) {
        this.memberService.updateMember(this.member).subscribe(result => {

          if (this.isSyncLead) {
            this.syncLead();
          }

          this.isEdit = false;
          this.refreshEmit.emit(true);
          this.isLoading$.next(false);
        });
      }
    }
  }

  syncLead() {
    this.leadService.getLeadByRolePlayerId(this.member.rolePlayerId).subscribe(lead => {
      if (lead?.company) {
        lead.company.compensationFundReferenceNumber = this.member.company.compensationFundReferenceNumber;
        lead.company.compensationFundRegistrationNumber = this.member.company.referenceNumber;
        lead.company.registrationNumber = this.member.company.idNumber;
        lead.company.industryTypeId = this.member.company.industryId;
        lead.company.registrationType = +CompanyIdTypeEnum[this.form.controls.registrationType.value];

        this.leadService.updateLead(lead).subscribe(_ => { });
      }
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

      this.selectedCompanyLevel = this.member.company.companyLevel;
      this.selectedHoldingCompany = this.originalHoldingCompany ? this.originalHoldingCompany : null;

      this.setForm();
    }
  }

  disableForm() {
    if (!this.member.company.rolePlayerId || this.member.company.rolePlayerId <= 0) {
      this.form.controls.name.disable();
      this.form.controls.industryClass.disable();
    }

    if (this.member && this.member.rolePlayerId > 0) {
      this.form.controls.companyLevel.disable();
      this.form.controls.holdingCompany.disable();
      this.form.controls.vatRegistrationNo.disable();
      this.form.controls.compensationFundStatus.disable();
      this.form.controls.natureOfBusiness.disable();
      this.form.controls.isTopEmployer.disable();
      this.form.controls.industryType.disable();
      this.form.controls.compensationFundRegistrationNumber.disable();
      this.form.controls.compensationFundReferenceNumber.disable();
      this.form.controls.registrationType.disable();
      this.form.controls.registrationNumber.disable();
    }
  }

  enableForm() {
    if (!this.member.company.rolePlayerId || this.member.company.rolePlayerId <= 0) {
      this.form.controls.name.enable();
      this.form.controls.industryClass.enable();
    }

    this.form.controls.companyLevel.enable();
    this.form.controls.holdingCompany.enable();
    this.form.controls.vatRegistrationNo.enable();
    this.form.controls.compensationFundStatus.enable();
    this.form.controls.natureOfBusiness.enable();
    this.form.controls.isTopEmployer.enable();
    this.form.controls.industryType.enable();
    this.form.controls.compensationFundRegistrationNumber.enable();
    this.form.controls.compensationFundReferenceNumber.enable();
    this.form.controls.registrationType.enable();
    this.form.controls.registrationNumber.enable();
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

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.ClientManager,
        clientItemType: ClientItemTypeEnum.Company,
        itemId: this.member.rolePlayerId,
        heading: 'Company Details Audit',
        propertiesToDisplay: ['Name', 'Description', 'ReferenceNumber', 'CompensationFundReferenceNumber',
          'CompanyIdType', 'IdNumber', 'VatRegistrationNo', 'IndustryId',
          'IndustryClass', 'CompanyLevel', 'LinkedCompanyId', 'IsTopEmployer', 'NatureOfBusiness']
      }
    });
  }
}
