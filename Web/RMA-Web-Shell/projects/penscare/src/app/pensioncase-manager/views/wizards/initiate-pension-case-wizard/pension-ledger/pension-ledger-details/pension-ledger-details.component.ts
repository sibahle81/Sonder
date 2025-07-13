import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdditionalTax } from 'projects/penscare/src/app/pensioncase-manager/models/additional-tax.model';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { PensCareNote } from 'projects/penscare/src/app/shared-penscare/models/penscare-note';
import { CalculateTaxRequest } from 'projects/penscare/src/app/tax-manager/models/calculate-tax-request.model';
import { CalculateTaxResponse } from 'projects/penscare/src/app/tax-manager/models/calculate-tax-response.model';
import { PensionTaxService } from 'projects/penscare/src/app/tax-manager/services/pension-tax.service';
import { VerifyCVCalculationResponse } from 'projects/shared-components-lib/src/lib/models/pension-case.model';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { Lookup } from 'projects/shared-models-lib/src/lib/lookup/lookup';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';
import {CorrectiveEntryNotification} from '../../../../../../../../../shared-components-lib/src/lib/models/corrective-entry-notification.model';
import {PensionLedgerService} from '../../../../../services/pension-ledger.service';

class ComponentData {
  public pensionLedger: PensionLedger;
  public verifyCVCalculationResponse? : VerifyCVCalculationResponse;
  public pensionCaseContext? : PensionCaseContextEnum
}

@Component({
  selector: 'app-pension-ledger-details',
  templateUrl: './pension-ledger-details.component.html',
  styleUrls: ['./pension-ledger-details.component.css']
})
export class PensionLedgerDetailsComponent implements OnInit {
  @Input() componentData: ComponentData;
  pensionCaseContext = PensionCaseContextEnum;
  form: UntypedFormGroup;
  currentMonthlyTaxResponse: CalculateTaxResponse;
  normalMonthlyTaxResponse: CalculateTaxResponse;
  isLoading = false;
  isCalculatingNormalMonthlyTax: boolean;
  isCalculatingCurrentMonthlyTax: boolean;
  ledgerStatusChangeReasons: Lookup[] = []
  ledgerStatuses: Lookup[] = [];
  step = 0;
  isLoadingNotes: boolean;
  notes: PensCareNote[];
  creatingWizard = false;
  isAddAddTax = false;
  pensionCaseId: number;
  constructor(
              private taxRatesService: PensionTaxService,
              private lookupService: LookupService,
              private formBuilder: UntypedFormBuilder,
              private wizardService: WizardService,
              private alertService: AlertService,
              private readonly router: Router,
              private activatedRoute: ActivatedRoute,
              public datepipe: DatePipe,
              private  pensionLedgerService: PensionLedgerService) { }

  ngOnInit() {
    this.createForm();
    this.onLoadLookups();
    this.activatedRoute.params.subscribe((params: any) => {
      if (params?.pensionCaseId){
        this.pensionCaseId = +params.pensionCaseId;
      }
    });
  }

  createForm(): void {
    const pensionLedger = this.componentData.pensionLedger;
    if (this.form) {
      return
    }
    this.form = this.formBuilder.group({
      beneficiaryName: new UntypedFormControl({value: `${pensionLedger.beneficiaryFirstName ? pensionLedger.beneficiaryFirstName: '' } ${pensionLedger.beneficiarySurname}` , disabled: true}),
      dateOfStabilisation: new UntypedFormControl({value: this.datepipe.transform(pensionLedger.dateOfStabilisation, 'yyyy/MM/dd'), disabled: true}),
      statusReason: new UntypedFormControl({value: pensionLedger.reason, disabled: true}),
      status: new UntypedFormControl({value: pensionLedger.status, disabled: true}),
      earnings: new UntypedFormControl({
        value: pensionLedger.earnings ? pensionLedger.earnings.toFixed(2): 0,
        disabled: true
      }),
      normalMonthlyPension: new UntypedFormControl({
        value: pensionLedger.normalMonthlyPension ? pensionLedger.normalMonthlyPension.toFixed(2): 0,
        disabled: true
      }),
      av: new UntypedFormControl({
        value: pensionLedger.av ? pensionLedger.av.toFixed(2): 0,
        disabled: true
      }),
      currentMonthlyPension : new UntypedFormControl({
        value: pensionLedger.currentMonthlyPension ? pensionLedger.currentMonthlyPension.toFixed(2): 0,
        disabled: true
      }),
      capitalValue : new UntypedFormControl({
        value: pensionLedger.capitalValue ? pensionLedger.capitalValue.toFixed(2): 0,
        disabled: true
      }),
    });
  }

  onLoadLookups(): void {
    this.lookupService.getLedgerStatusChangeReasons().subscribe(response => {
      this.ledgerStatusChangeReasons = response;
    })

    this.lookupService.getLedgerStatuses().subscribe(response => {
      this.ledgerStatuses = response;
    })
  }

  calculateMonthlyTax() {
    this.step = 1;
    if (this.normalMonthlyTaxResponse && this.currentMonthlyTaxResponse) {
      return;
    }
    const normalMonthlyTaxRequest: CalculateTaxRequest = {
      amount: this.componentData.pensionLedger.normalMonthlyPension,
      paymentDate: new Date(this.componentData.pensionLedger.dateOfStabilisation),
      age: this.componentData.pensionLedger.ageAtDateOfStabilization
    }
    const currentMonthlyTaxRequest: CalculateTaxRequest = {
      amount: this.componentData.pensionLedger.normalMonthlyPension,
      paymentDate: new Date(this.componentData.pensionLedger.dateOfStabilisation),
      age: this.componentData.pensionLedger.ageAtDateOfStabilization
    }

    this.isCalculatingNormalMonthlyTax = true;
    this.isCalculatingCurrentMonthlyTax = true;

    this.taxRatesService.calculateTax(normalMonthlyTaxRequest).subscribe(
      response => {
        this.isCalculatingNormalMonthlyTax = false;
        this.normalMonthlyTaxResponse = response;
      }
    )

    this.taxRatesService.calculateTax(currentMonthlyTaxRequest).subscribe(response => {
        this.isCalculatingCurrentMonthlyTax = false;
        this.currentMonthlyTaxResponse = response;
    });
  }

  createAdditionalTax(): void {
    this.isAddAddTax = !this.isAddAddTax;
  }

  addAdditionalTax(): void {
    this.createAdditionalTax();
    this.startWizard(this.createNotification());

  }

  createNotification(): AdditionalTax {
    const pensionLedger = this.componentData.pensionLedger;
    const additionalTaxNotification: AdditionalTax = {
      ledgerId: this.pensionCaseId,
      id: 0,
      createdBy: '',
      modifiedBy: '',
      createdDate: undefined,
      modifiedDate: undefined,
      isActive: false,
      isDeleted: false,
      canEdit: false,
      canAdd: false,
      canRemove: false,
      permissionIds: []
    };
    return additionalTaxNotification;
  }

  startWizard(data: AdditionalTax) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'additional-tax-wizard';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe((result) => {
      this.creatingWizard = false;
      this.alertService.success('Additional tax wizard started successfully');
      this.router.navigateByUrl(`/penscare/tax-manager/additional-tax-wizard/continue/${result.id}`);
    });
  }

  loadCorrectiveEntries() {
    this.step = 2;
  }


  addCorrectiveEntry() {
    if (!this.componentData.pensionLedger) {
      this.creatingWizard = true;
      this.pensionLedgerService.getPensionLedgerById(this.pensionCaseId).subscribe(
        response => {
          this.startCreateCorrectiveEntryWizard(this.createLedgerNotification('add', response));
        }
      );
    } else {
      this.startCreateCorrectiveEntryWizard(this.createLedgerNotification('add', this.componentData.pensionLedger));
    }
  }


  createLedgerNotification(action: string, pensionLedger: PensionLedger): CorrectiveEntryNotification {
    const correctiveEntryNotification: CorrectiveEntryNotification = {
      action: action,
      ledger: pensionLedger
    }
    return correctiveEntryNotification;
  }

  startCreateCorrectiveEntryWizard(data: CorrectiveEntryNotification) {
    const startWizardRequest = new StartWizardRequest();

    startWizardRequest.data = JSON.stringify(data);
    startWizardRequest.type = 'corrective-entry';
    this.creatingWizard = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.creatingWizard = false;
      this.alertService.success(String.capitalizeFirstLetter(data.action) + ' corrective entry wizard started successfully');
      this.router.navigateByUrl(`/penscare/pensioncase-manager/corrective-entry/continue/${result.id}`);
    });
  }

}
