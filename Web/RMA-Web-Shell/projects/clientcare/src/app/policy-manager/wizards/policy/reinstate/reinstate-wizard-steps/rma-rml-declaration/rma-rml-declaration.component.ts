import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PolicyStatusChangeAudit } from '../../../../../shared/entities/policy-status-change-audit';
import { Policy } from 'projects/clientcare/src/app/policy-manager/shared/entities/policy';
import { DatePipe } from '@angular/common';

@Component({
  templateUrl: './rma-rml-declaration.component.html',
  styleUrls: ['./rma-rml-declaration.component.css']
})

export class RMARMLDeclarationComponent extends WizardDetailBaseComponent<PolicyStatusChangeAudit> implements OnInit {

  _requiredDeclarationsSubmitted = false;
  today: Date;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly datePipe: DatePipe) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void { 
    this.today = new Date().getCorrectUCTDate();
  }

  getStartDate(policy: Policy, startDate: Date) {
    const selectedReinstateDate = new Date(this.datePipe.transform(startDate, 'yyyy-MM-dd'));
    const cancellationDate = new Date(this.datePipe.transform(policy.cancellationDate, 'yyyy-MM-dd'));
    return selectedReinstateDate < cancellationDate ? policy.cancellationDate : startDate;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  requiredDeclarationsSubmitted($event: boolean) {
    this._requiredDeclarationsSubmitted = $event;
  }
}
