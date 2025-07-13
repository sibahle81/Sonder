import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { BrokerageService } from '../../services/brokerage.service';
import { Brokerage } from '../../models/brokerage';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Component } from '@angular/core';
import { MatDatePickerDateFormat, DatePickerDateFormat } from 'projects/shared-utilities-lib/src/lib/datepicker/dateformat';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { BrokerageRepresentativeRequest } from '../../models/brokerage-representative-request';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import { BrokerageTypeEnum } from 'projects/shared-models-lib/src/lib/enums/brokerage-type-enum';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { BrokerItemTypeEnum } from '../../models/enums/broker-item-type.enum';
import { MatDialog } from '@angular/material/dialog';
import { BrokerageType } from "../../models/enums/brokerage-type.enum";
import { FeatureflagUtility } from 'projects/shared-utilities-lib/src/lib/featureflag-utility/featureflag-utility';


@Component({
  // tslint:disable-next-line: component-selector
  selector: 'brokerage-details',
  templateUrl: './brokerage-details.component.html',
  styleUrls: ['./brokerage-details.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: MatDatePickerDateFormat
    },
    {
      provide: MAT_DATE_FORMATS, useValue: DatePickerDateFormat
    }
  ]
})

export class BrokerageDetailsComponent extends WizardDetailBaseComponent<Brokerage> {
  isSubmitting = true;
  firstName: string;
  step: string;
  isWizard: boolean;
  fspNumberResult: string;
  fspNumber: string;
  intermediaryTypeId: number;
  brokerageId: number;
  brokerage: Brokerage;
  isCodeGenerated: boolean;
  isChecked: boolean;
  dataImported: boolean;
  hideFSPImport = true;
  representativeIdNumbers: string[] = [];
  isNewOnboardingProcess = false;
  selectedFicaVerifiedOption: string;
  brokerageTitle = '';
  brokerageTypes: BrokerageType[];
  selectedBrokerageTypeId: number;

  get loadingBrokerage(): boolean {
    const brokerage = this.model || this.brokerage;
    return brokerage === undefined;
  }

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly brokerageService: BrokerageService,
    private readonly privateAlertService: AlertService,
    private readonly lookupService: LookupService,
    public dialog: MatDialog
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups(): void {
    this.brokerageTypes = this.ToKeyValuePair(BrokerageType);
  }

  // Please dont change the regno or the isloading this is now the third time I am fixing this....
  populateModel(): void {
    const formModel = this.form.getRawValue();
    this.model.id = formModel.id as number;
    this.model.name = formModel.name;
    this.model.code = formModel.code;
    this.model.fspNumber = formModel.fspNumber;
    this.model.tradeName = formModel.tradeName;
    this.model.legalCapacity = formModel.legalCapacity;
    this.model.regNo = formModel.registrationNumber;
    this.model.medicalAccreditationNo = formModel.medicalAccreditationNo;
    this.model.companyType = formModel.companyType;
    this.model.status = formModel.status;
    this.model.fspWebsite = formModel.fspWebsite;
    this.model.telNo = formModel.telNo;
    this.model.faxNo = formModel.faxNo;
    this.model.finYearEnd = formModel.finYearEnd;
    this.model.startDate = formModel.startDate;
    this.model.endDate = formModel.endDate;
    this.model.vatRegistrationNumber = formModel.vatRegistrationNumber;
    this.model.ficaVerified = formModel.ficaVerified;
    this.model.ficaRiskRating = formModel.ficaRiskRating;
    this.model.brokerageType = formModel.brokerageType;
  }

  populateForm(): void {
    this.form.patchValue({
      id: this.model.id,
      code: this.model.code,
      name: this.model.name,
      fspNumber: this.model.fspNumber,
      tradeName: this.model.tradeName,
      legalCapacity: this.model.legalCapacity,
      registrationNumber: this.model.regNo,
      medicalAccreditationNo: this.model.medicalAccreditationNo,
      companyType: this.model.companyType,
      status: this.model.status,
      fspWebsite: this.model.fspWebsite,
      telNo: this.model.telNo,
      faxNo: this.model.faxNo,
      statusText: this.model.statusText,
      finYearEnd: this.model.finYearEnd,
      startDate: this.model.startDate,
      endDate: this.model.endDate,
      vatRegistrationNumber: this.model.vatRegistrationNumber,
      ficaVerified: this.model.ficaVerified,
      ficaRiskRating: this.model.ficaRiskRating,
      brokerageType: this.model.brokerageType

    });

    this.selectedFicaVerifiedOption = String(this.model.ficaVerified);

    this.form.get('code').disable();
    this.form.get('name').disable();
    this.form.get('status').disable();
    this.form.get('statusText').disable();
    this.form.get('legalCapacity').disable();
    this.form.get('companyType').disable();
    this.form.get('tradeName').disable();
    this.form.get('registrationNumber').disable();

    this.isNewOnboardingProcess = FeatureflagUtility.isFeatureFlagEnabled('NewBrokerOnboardingProcess');
    if (!this.isNewOnboardingProcess) {
      this.form.get('tradeName').disable();
      this.form.get('medicalAccreditationNo').disable();
      this.form.get('fspWebsite').disable();
      this.form.get('telNo').disable();
      this.form.get('faxNo').disable();
      this.form.get('finYearEnd').disable();
      this.form.get('registrationNumber').disable();
    }

    this.dataImported = false;

    if (this.model.id > 0) {
      this.dataImported = true;
      this.hideFSPImport = true;
      this.form.get('fspNumber').disable();
    }

    this.setTitle();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (this.model != null) {
      if (this.model.fspNumber === null || this.model.fspNumber === '') {
        validationResult.errors = validationResult.errors + 1;
        validationResult.errorMessages.push('FSP Number is required');
      }
    }

    this.checkForErrors();
    return validationResult;
  }

  createForm(id: any): void {
    this.form = this.formBuilder.group({
      id: [id],
      code: [''],
      name: [''],
      fspNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
      idNumber: ['', [Validators.minLength(13), Validators.maxLength(13)]],
      tradeName: [''],
      legalCapacity: [''],
      registrationNumber: [''],
      medicalAccreditationNo: [''],
      companyType: [''],
      status: [''],
      fspWebsite: [''],
      telNo: [''],
      faxNo: [''],
      finYearEnd: [''],
      statusText: [''],
      startDate: ['', [Validators.required]],
      endDate: [''],
      vatRegistrationNumber: [''],
      ficaVerified: ['', [Validators.required]],
      ficaRiskRating: ['', [Validators.required]],
      brokerageType: ['']
    });

    this.isNewOnboardingProcess = FeatureflagUtility.isFeatureFlagEnabled('NewBrokerOnboardingProcess');
  }

  setTitle() {
    if (this.model.brokerageType === BrokerageTypeEnum.Brokerage) {
      this.brokerageTitle = 'Brokerage';
    } else {
      this.brokerageTitle = 'Binder Partner';
    }
  }

  addIdNumber() {
    const idNumber = this.form.get('idNumber').value;
    if (idNumber !== null) {
      if (this.representativeIdNumbers.indexOf(idNumber) === -1 && idNumber.length > 4) {
        this.representativeIdNumbers.push(idNumber);
        this.form.get('idNumber').reset();
      }
    }
  }

  removeIdNumber(idNumber: string) {
    const position = this.representativeIdNumbers.indexOf(idNumber);
    this.representativeIdNumbers.splice(position, 1);
  }

  searchFSPData() {
    const fspNumber = this.form.get('fspNumber').value;
    this.loadingStart('Searching FSP: ' + fspNumber + ' import details');
    this.brokerageService.getBrokerageImportRequestDetails(fspNumber).subscribe(
      data => {
        this.hideFSPImport = true;
        this.brokerage = data;
        this.model = this.brokerage;
        this.populateForm();
        this.loadingStop();
      },
      response => {
        this.hideFSPImport = !response.error.Error.includes('BR0002:');
        if (!this.hideFSPImport) {
          this.form.get('fspNumber').disable();
          this.privateAlertService.loading(response.error.Error, 'FSP Search');
        } else {
          this.privateAlertService.error(response.error.Error, 'FSP Search');
        }
        this.loadingStop();
      }
    );
  }

  importFSPData() {
    const fspNumber = this.form.get('fspNumber').value;
    const code = this.form.get('code').value;
    this.loadingStart('Importing FSP: ' + fspNumber + ' Details');
    this.brokerageService.getFSPNumberFromFsb(fspNumber, code).subscribe(
      data => {
        this.brokerage = data;
        this.model = this.brokerage;
        this.populateForm();
        this.loadingStop();
      },
      response => {
        this.privateAlertService.error(response.error.Error, 'Import FSP');
        this.loadingStop();
      }
    );
  }

  submitFSPDataImportRequest() {
    this.hideFSPImport = true;
    const fspNumber = this.form.get('fspNumber').value;
    const request = new BrokerageRepresentativeRequest();
    request.fspNumber = fspNumber;
    request.representativeIdNumbers = this.representativeIdNumbers;
    request.BrokerageType = this.model.brokerageType;

    this.loadingStart('Submitting FSP: ' + fspNumber + ' Import Request');
    this.brokerageService.submitFSPDataImportRequest(request).subscribe(
      result => {
        if (result === true) {
          this.privateAlertService.success('FSP: ' + fspNumber + ' Import Request Submitted Successfully', 'FSP Import Request');
        } else {
          this.privateAlertService.error('FSP: ' + fspNumber + ' Error Occured Submitting Import Request', 'FSP Import Request');
          this.hideFSPImport = false;
        }
        this.loadingStop();
      },
      response => {
        this.hideFSPImport = false;
        this.privateAlertService.error(response.error.Error, 'FSP Import Request');
        this.loadingStop();
      }
    );
  }

  getBrokerage(id: number): void {
    this.brokerageService.getBrokerage(id).subscribe(
      brokerage => {
        this.brokerage = brokerage;
      }
    );
  }

  statusChange(e: any) {
    this.form.value.activeStatus = e.checked;
    this.isChecked = e.checked;
  }

  getBrokerageStatusText(startDate: Date, endDate: Date): string {
    if (!this.model.isAuthorised) {
      return 'Inactive';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!startDate) { return 'Inactive'; }
    if (startDate > today) { return 'Inactive'; }

    if (endDate) {
      if (endDate < startDate) { return 'Inactive'; }
      if (endDate < today) { return 'Inactive'; }
    }
    return 'Active';
  }

  get hasRepresentativeIdNumbers(): boolean {
    return (this.representativeIdNumbers === undefined || this.representativeIdNumbers === null || this.representativeIdNumbers.length === 0);
  }

  get validateFspNumberLength(): boolean {
    const fspNumber = this.form.get('fspNumber').value;
    return (fspNumber === undefined || fspNumber === null || fspNumber.length < 1);
  }

  checkForErrors(): void {
    const startDate = new Date(this.form.get('startDate').value);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(this.form.get('endDate').value);
    endDate.setHours(0, 0, 0, 0);

    if (this.form.get('startDate').value && this.form.get('endDate').value && endDate < startDate) {
      this.form.get('endDate').setErrors({ min: true });
      this.form.get('startDate').setErrors({ min: true });
    }
  }

  validateDate(selectedDate: MatDatepickerInputEvent<Date>): void {
    this.checkForErrors();
  }

  openAuditDialog() {
    const brokerage = this.model || this.brokerage;
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.BrokerageManager,
        clientItemType: BrokerItemTypeEnum.Brokerage,
        itemId: brokerage.id,
        heading: 'Brokerage Details Audit',
        propertiesToDisplay: [
          'Id', 'Code', 'FspNumber', 'Name', 'TradeName', 'LegalCapacity', 'RegNo', 'Status', 'CompanyType', 'FaxNo', 'TelNo', 'FspWebsite', 'FinYearEnd',
          'MedicalAccreditationNo', 'StartDate', 'EndDate', 'PaymentMethod', 'PaymentFrequency', 'IsActive', 'IsDeleted', 'CreatedBy', 'CreatedDate', 'ModifiedBy',
          'ModifiedDate', 'IsAuthorised', 'OnboardAdminFee', 'OnboardPercentageShare', 'BrokerageType', 'FicaRiskRating', 'VatRegistrationNumber', 'FicaVerified'
        ]
      }
    });
  }

  formatLookup(lookup: string): string {
    return lookup ? lookup.replace(/([a-z])([A-Z])/g, "$1 $2").replace('_', '-') : "N/A";
  }

  ToKeyValuePair(enums: any) {
    const results = [];
    const keys = Object.values(enums).filter((v) => Number.isInteger(v));
    for (const key of keys) {
      if (key && enums[key as number]) {
        results.push({ id: key, name: enums[key as number] });
      }
    }
    return results;
  }
}
