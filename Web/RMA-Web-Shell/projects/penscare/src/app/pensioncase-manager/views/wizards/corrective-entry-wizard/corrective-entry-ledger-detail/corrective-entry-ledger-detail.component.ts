import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensionCaseContextEnum } from 'projects/penscare/src/app/shared-penscare/enums/pensioncase-context-enum';
import { CorrectiveEntryNotification } from 'projects/shared-components-lib/src/lib/models/corrective-entry-notification.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  selector: 'app-corrective-entry-ledger-detail',
  templateUrl: './corrective-entry-ledger-detail.component.html',
  styleUrls: ['./corrective-entry-ledger-detail.component.css']
})
export class CorrectiveEntryLedgerDetailComponent extends WizardDetailBaseComponent<CorrectiveEntryNotification> implements OnInit{
  pensionCaseContext = PensionCaseContextEnum.LedgerCorrectiveEntries;
  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private formBuilder: UntypedFormBuilder) {
    super(appEventsManager, authService, activatedRoute);
    this.onLoadLookups();
  }

  ngOnInit(): void {
  }
  createForm(id: number): void {}
  onLoadLookups(): void {}
  populateModel(): void {}
  populateForm(): void {}
  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}

