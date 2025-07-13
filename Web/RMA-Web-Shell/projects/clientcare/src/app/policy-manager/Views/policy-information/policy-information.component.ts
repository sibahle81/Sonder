import { Component, ViewChild } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { Case } from '../../shared/entities/case';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { PolicyProductOptionsComponent } from '../policy-product-options/policy-product-options.component';
import { PolicyStatusEnum } from '../../shared/enums/policy-status.enum';
import { PolicyCancelReasonEnum } from '../../shared/enums/policy-cancel-reason.enum';
import { RolePlayerPolicy } from '../../shared/entities/role-player-policy';
import { LookupService } from 'projects/shared-services-lib/src/lib/services/lookup/lookup.service';

@Component({
  selector: 'policy-information',
  templateUrl: './policy-information.component.html',
  styleUrls: ['./policy-information.component.css']
})

export class PolicyInformationComponent extends WizardDetailBaseComponent<Case> {

  @ViewChild(PolicyProductOptionsComponent, { static: true }) policyProductOptionsComponent: PolicyProductOptionsComponent;

  detailsModel: Case;
  isCancelled = false;
  displayedColumns = ['cancellationReason', 'cancellationDate'];
  datasource: any = [];
  statusColor = '#acb9cd';
  policy: RolePlayerPolicy;
  hasJuristicRep: boolean;
  europAssistFee: any;
  minDate: Date;
  isAffordable: boolean;
  isCFP:boolean;
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly lookupService: LookupService,
    private readonly formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
  }

  onLoadLookups() {
    this.lookupService.getItemByKey('EuropAssistFee').subscribe(europAssistFee => {
      this.europAssistFee = europAssistFee;
    });
   }

  createForm() {
    this.form = this.formBuilder.group({
      policyInceptionDate: [null],
      policyNumber: [''],
      status: [''],
      clientReference: [''],
      brokerageName: { value: '' },
      representativeName: { value: '' },
      juristicRepresentativeName: { value: '' },
      isEuropAssist: { value: '' },
      europAssistInceptionDate: { value: '' },
      europAssistEndDate: { value: '' },
      insurer: [],
      affordabilityCheckPassed :  new UntypedFormControl(''),

    });
  }

  populateModel(): void { }

  populateForm(): void {
    if (this.model) {
      this.detailsModel = this.model;
      this.policy = this.model.mainMember && this.model.mainMember.policies && this.model.mainMember.policies.length > 0 ? this.model.mainMember.policies[0] : null;
      this.patchValues();
    }

    if (this.isDisabled && this.policyProductOptionsComponent && this.policyProductOptionsComponent.formProducts) {
      this.policyProductOptionsComponent.formProducts.disable();
      this.form.disable();
    }
  }

  isFirstDay = (d: Date): boolean => {
    const date = d.getDate();
    const val = date / 1 === 1;
    return val;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  patchValues() {
    if (this.policy) {
      this.isCancelled = this.policy.policyStatus === PolicyStatusEnum.PendingCancelled || this.policy.policyStatus === PolicyStatusEnum.Cancelled;

      if (this.isCancelled) {
        const reason = PolicyCancelReasonEnum[this.policy.policyCancelReason];
        if (reason) {
          const cancelReason = reason.replace(/\s/g, '');
          this.datasource = [{ cancellationReason: cancelReason, cancellationDate: this.policy.cancellationDate }];
        } else {
          this.datasource = [{ cancellationReason: 'Cancelled', cancellationDate: this.policy.cancellationDate }];
        }
      }

      this.hasJuristicRep = this.model.juristicRepresentative != null;
      if(this.model.mainMember.policies[0].policyLifeExtension != null && this.model.mainMember.policies[0].policyLifeExtension != undefined)
      {
         this.isCFP = true;
      }
      if (this.isCFP)
      {
        if ( this.model.mainMember?.policies[0].policyLifeExtension.affordabilityCheckPassed != null)
        {
            this.isAffordable =  this.model.mainMember?.policies[0].policyLifeExtension.affordabilityCheckPassed;
        }
      }
      this.form.patchValue({
        policyInceptionDate: (this.isPolicyInceptionDateDefault()) ? null : this.getFormattedDate(this.policy.policyInceptionDate),
        policyNumber: this.policy.policyNumber,
        status: this.formatStatus(PolicyStatusEnum[this.policy.policyStatus]),
        clientReference: this.policy.clientReference,
        brokerageName: this.model.brokerage ? this.model.brokerage.name : '',
        representativeName: this.model.representative ? this.model.representative.name : '',
        juristicRepresentativeName: this.model.juristicRepresentative ? this.model.juristicRepresentative.name : '',
        isEuropAssist: this.policy.isEuropAssist,
        europAssistInceptionDate: this.policy.europAssistEffectiveDate,
        europAssistEndDate: this.policy.europAssistEndDate,
        insurer: this.policy.insurer,
        affordabilityCheckPassed: this.isAffordable
      });
    }
  }

  formatStatus(statusText: string) {
    return statusText.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
  }

  isPolicyInceptionDateDefault(): boolean {
    return !this.policy && this.policy.policyInceptionDate.getFullYear() !== 1;
  }

  getFormattedDate(dt: Date): string {
    const dateToFormat = new Date(dt);
    const year = dateToFormat.getFullYear();
    const month = `${dateToFormat.getMonth() + 1}`.padStart(2, '0');
    const day = `${dateToFormat.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
