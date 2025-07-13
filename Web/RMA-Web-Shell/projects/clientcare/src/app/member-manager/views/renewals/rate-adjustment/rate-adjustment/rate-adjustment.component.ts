import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ClientRate } from 'projects/clientcare/src/app/policy-manager/shared/entities/client-rate';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { Wizard } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard';
import { WizardStatus } from 'projects/shared-components-lib/src/lib/wizard/shared/models/wizard-status.enum';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { BehaviorSubject } from 'rxjs';
import { DeclarationService } from '../../../../services/declaration.service';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';

@Component({
  selector: 'rate-adjustment',
  templateUrl: './rate-adjustment.component.html',
  styleUrls: ['./rate-adjustment.component.css']
})
export class RateAdjustmentComponent implements OnChanges {

  @Input() roleplayerId: number;
  @Input() _clientRates: ClientRate[];
  @Input() isWizard = false;
  @Input() isReadOnly = false;

  form: FormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  clientRates: ClientRate[];
  wizardsInProgress: Wizard[] = [];
  policies: Policy[];
  selectedPolicyNumber: string;

  showForm = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly router: Router,
    private readonly alertService: ToastrManager,
    private readonly declarationService: DeclarationService,
    private readonly wizardService: WizardService,
    private readonly rolePlayerService: RolePlayerService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.createForm();
    this.getRunningWizardProcesses();
    if (!this.isWizard) {
      this.getClientRates();
    } else {
      this.clientRates = this._clientRates;
      this.getRolePlayer();
    }
  }

  getRolePlayer(){
    this.rolePlayerService.getFinPayeeByDebtorNumber(this.clientRates[0].memberNo).subscribe(result => {
      this.roleplayerId = result.rolePlayerId;
      this.isLoading$.next(false);
    });
  }

  getClientRates() {
    this.declarationService.getClientRates(this.roleplayerId).subscribe(results => {
      this.clientRates = results;
      this.isLoading$.next(false);
    });
  }

  createForm() {
    if (this.form) { return; }
    this.form = this.formBuilder.group({
      ratesId: [{ value: null, disabled: true }],
      productOption: [{ value: null, disabled: true }],
      categoryInsured: [{ value: null, disabled: true }],
      ratingYear: [{ value: null, disabled: true }],
      rate: [{ value: null, disabled: this.isReadOnly }]
    });
  }

  setForm(clientRate: ClientRate) {
    this.form.patchValue({
      ratesId: clientRate.ratesId,
      productOption: clientRate.product,
      categoryInsured: clientRate.category,
      ratingYear: clientRate.ratingYear,
      rate: clientRate.rate
    });
  }

  readForm() {
    const ratesId = this.form.controls.ratesId.value;
    const rate = this.form.controls.rate.value;

    const index = this.clientRates.findIndex(s => s.ratesId === ratesId);
    if (index > -1) {
      this.clientRates[index].rate = rate;
    }

    this.toggleForm(null);
  }

  checkExistingMaintenenceTasks() {
    if (this.wizardsInProgress.length > 0) {
      this.alertService.infoToastr('Rate Adjustment is already being performed for this member');
    } else {
      this.startWizard();
    }
  }

  getRunningWizardProcesses() {
    if (this.isWizard) { return; }
    this.wizardService.getWizardsInProgressByTypesAndLinkedItemId(this.roleplayerId, 'rate-adjustment').subscribe(results => {
      if (results) {
        this.wizardsInProgress = results.filter(y => y.wizardStatusId == WizardStatus.AwaitingApproval || y.wizardStatusId == WizardStatus.InProgress);
      }
    });
  }

  startWizard() {
    this.isLoading$.next(true);
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.type = 'rate-adjustment';
    startWizardRequest.linkedItemId = this.roleplayerId;
    startWizardRequest.data = JSON.stringify(this.clientRates);
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr('Rate Adjustment wizard started successfully');
      this.back();
    });
  }

  toggleForm(clientRate: ClientRate) {
    if (clientRate) {
      this.selectedPolicyNumber = clientRate.policyNumber ? clientRate.policyNumber : null;
      this.setForm(clientRate);
    } else {
      this.selectedPolicyNumber = null;
    }
    this.showForm = !this.showForm;
  }

  getCategoryInsuredName(id: number): string {
    return CategoryInsuredEnum[id];
  }

  back() {
    this.isLoading$.next(true);
    this.router.navigateByUrl('clientcare/member-manager');
  }
}
