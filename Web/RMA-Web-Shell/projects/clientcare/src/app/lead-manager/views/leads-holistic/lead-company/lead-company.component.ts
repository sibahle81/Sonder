import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Lead } from '../../../models/lead';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { MatDialog } from '@angular/material/dialog';
import { LeadCompany } from '../../../models/lead-company';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { LeadService } from '../../../services/lead.service';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { CompanyIdTypeEnum } from 'projects/shared-models-lib/src/lib/enums/company-id-type-enum';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { LeadIndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/lead-industry-type.enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
@Component({
  selector: 'lead-company',
  templateUrl: './lead-company.component.html',
  styleUrls: ['./lead-company.component.css']
})
export class LeadCompanyComponent extends UnSubscribe implements OnChanges {

  addPermission = 'Add Lead';
  editPermission = 'Edit Lead';
  viewPermission = 'View Lead';

  @Input() lead: Lead;
  @Input() isReadOnly = false;

  @Output() isCompletedEmit: EventEmitter<boolean> = new EventEmitter();

  form: UntypedFormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  isValidatingUniqueRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isValidatingUniqueCFReferenceNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isValidatingUniqueCFRegistrationNumber$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  industryClasses: IndustryClassEnum[];
  industryTypes: any;
  filteredIndustryTypes: any;
  companyIdTypes: CompanyIdTypeEnum[];

  selectedIndustryClass: IndustryClassEnum;
  supportedIndusties: string[] = [];

  isEdit: boolean;

  soleProprietor = ClientTypeEnum.SoleProprietor;
  other = IndustryClassEnum.Other;

  constructor(
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder,
    public dialog: MatDialog,
    private readonly leadService: LeadService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.lead) {
      this.getLookups();
    }
  }

  createForm() {
    this.form = this.formBuilder.group({
      industryClass: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      industryType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      registrationType: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      companyRegistrationNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      compensationFundReferenceNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
      compensationFundRegistrationNumber: [{ value: null, disabled: this.isReadOnly }, Validators.required],
    });

    this.setForm();
  }

  setForm() {
    this.form.patchValue({
      industryClass: this.lead.company && this.lead.company.industryClass ? IndustryClassEnum[+this.lead.company.industryClass] : null,
      industryType: this.lead.company && this.lead.company.industryTypeId ? this.lead.company.industryTypeId : null,
      registrationType: this.lead.company && this.lead.company.registrationType ? CompanyIdTypeEnum[+this.lead.company.registrationType] : null,
      companyRegistrationNumber: this.lead.company && this.lead.company.registrationNumber ? this.lead.company.registrationNumber : null,
      compensationFundReferenceNumber: this.lead.company && this.lead.company.compensationFundReferenceNumber ? this.lead.company.compensationFundReferenceNumber : null,
      compensationFundRegistrationNumber: this.lead.company && this.lead.company.compensationFundRegistrationNumber ? this.lead.company.compensationFundRegistrationNumber : null
    });

    if (this.lead.leadId > 0) {
      this.selectedIndustryClass = this.lead.company.industryClass ? this.lead.company.industryClass : null;
      this.form.controls.industryClass.disable();
      this.form.controls.industryType.disable();
    }

    this.disableForm();
    this.setValidation();
    this.isLoading$.next(false);
  }

  readForm() {
    if (!this.lead.company) { this.lead.company = new LeadCompany() }

    this.lead.company.leadId = this.lead.leadId;
    this.lead.company.name = this.lead.displayName;
    this.lead.company.industryClass = +IndustryClassEnum[this.form.controls.industryClass.value];
    this.lead.company.industryTypeId = +this.form.controls.industryType.value;
    this.lead.company.registrationType = +CompanyIdTypeEnum[this.form.controls.registrationType.value];
    this.lead.company.registrationNumber = this.form.controls.companyRegistrationNumber.value;
    this.lead.company.compensationFundReferenceNumber = this.form.controls.compensationFundReferenceNumber.value;
    this.lead.company.compensationFundRegistrationNumber = this.form.controls.compensationFundRegistrationNumber.value;

    this.form.markAsPristine();
  }

  edit() {
    this.isEdit = true;
    this.enableForm();
  }

  cancel() {
    this.isEdit = false;
    this.setForm();
  }

  disableForm() {
    if (this.lead && this.lead.leadId > 0) {
      this.form.controls.industryClass.disable();
      this.form.controls.industryType.disable();
      this.form.controls.registrationType.disable();
      this.form.controls.companyRegistrationNumber.disable();
      this.form.controls.compensationFundReferenceNumber.disable();
      this.form.controls.compensationFundRegistrationNumber.disable();
    }
  }

  enableForm() {
    if (!this.lead.isConverted) {
      this.form.controls.industryType.enable();
      this.form.controls.industryClass.enable();
      this.form.controls.registrationType.enable();
    }

    this.form.controls.companyRegistrationNumber.enable();
    this.form.controls.compensationFundReferenceNumber.enable();
    this.form.controls.compensationFundRegistrationNumber.enable();
  }

  industryClassChanged(industryClass: IndustryClassEnum) {
    this.selectedIndustryClass = +IndustryClassEnum[industryClass];
    this.filteredIndustryTypes = this.industryTypes.filter(x => x.industryClass === this.selectedIndustryClass && this.supportedIndusties.includes(x.name.replace(/\s/g, '')));

    this.setValidation();
  }

  getLookups() {
    this.industryClasses = this.ToArray(IndustryClassEnum);
    this.companyIdTypes = this.ToArray(CompanyIdTypeEnum);
    this.supportedIndusties = this.ToArray(LeadIndustryTypeEnum);

    if (!this.industryTypes) {
      this.lookupService.getIndustries().subscribe(results => {
        this.industryTypes = results;
        this.filteredIndustryTypes = this.industryTypes;
        this.createForm()
      });
    } else {
      this.createForm()
    }
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  isValid() {
    this.validateUniqueRegistrationNumber(this.form.controls.companyRegistrationNumber.value);
  }

  validateUniqueRegistrationNumber(registrationNumber: string) {
    this.isValidatingUniqueRegistrationNumber$.next(true);
    this.leadService.getLeadCompanyByRegistrationNumber(registrationNumber).subscribe(result => {
      if (result !== null && result.leadId != this.lead.leadId) {
        this.form.controls.companyRegistrationNumber.setErrors({ notUnique: true });
      } else {
        this.form.controls.companyRegistrationNumber.setErrors({ notUnique: false });
        this.form.controls.companyRegistrationNumber.updateValueAndValidity();
      }
      this.isValidatingUniqueRegistrationNumber$.next(false);

      this.validateUniqueCFReferenceNumber(this.form.controls.compensationFundReferenceNumber.value);
    });
  }

  validateUniqueCFReferenceNumber(cfReferenceNumber: string) {
    this.isValidatingUniqueCFReferenceNumber$.next(true);
    this.leadService.getLeadCompanyByCFReferenceNumber(cfReferenceNumber).subscribe(result => {
      if (result && result.leadId != this.lead.leadId) {
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
    this.leadService.getLeadCompanyByCFRegistrationNumber(cfRegistrationNumber).subscribe(result => {
      if (result && result.leadId != this.lead.leadId) {
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
      this.disableForm();
      this.readForm();

      if (this.lead.leadId > 0) {
        this.isLoading$.next(true);
        this.leadService.updateLead(this.lead).subscribe(result => {
          this.isEdit = false;
          this.isLoading$.next(false);
        });
      } else {
        if (this.lead.leadClientStatus == LeadClientStatusEnum.New) {
          this.isCompletedEmit.emit(true);
        }
      }
    }
  }

  reset() {
    this.form.reset();
  }

  setValidation() {
    if (this.selectedIndustryClass == IndustryClassEnum.Other) {
      this.clearValidationToFormControl('compensationFundReferenceNumber');
      this.clearValidationToFormControl('compensationFundRegistrationNumber');
    } else {
      this.applyValidationToFormControl(Validators.required, 'compensationFundReferenceNumber');
      this.applyValidationToFormControl(Validators.required, 'compensationFundRegistrationNumber');
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

  showMandatory(): boolean {
    return this.selectedIndustryClass != this.other;
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.LeadManager,
        clientItemType: LeadItemTypeEnum.Company,
        itemId: this.lead.leadId,
        heading: 'Company Details Audit',
        propertiesToDisplay: ['Name', 'RegistrationTypeId', 'RegistrationNumber', 'CompensationFundReferenceNumber', 'CompensationFundRegistrationNumber', 'IndustryClass', 'IndustryTypeId']
      }
    });
  }
}
