import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PensionLedgerService } from 'projects/penscare/src/app/pensioncase-manager/services/pension-ledger.service';
import { PensionLedger } from 'projects/shared-components-lib/src/lib/models/pension-ledger.model';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PensionLedgerStatusNotification } from '../../../../../shared-penscare/models/pension-ledger-status-notification.model';

@Component({
  selector: 'app-pension-ledger-status',
  templateUrl: './pension-ledger-status.component.html',
  styleUrls: ['./pension-ledger-status.component.css']
})
export class PensionLedgerStatusComponent extends WizardDetailBaseComponent<PensionLedgerStatusNotification> implements OnInit {
  pensionLedger: PensionLedger;
  isLoading = false;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    private pensionLedgerService: PensionLedgerService,
    private formBuilder: UntypedFormBuilder,
    activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.createForm();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

  createForm() {
    if (this.form) { return;}
    this.form = this.formBuilder.group({
    });
  }


  onLoadLookups(): void { }

  populateModel(): void {}
  populateForm(): void {
    if (this.model) {
      this.isLoading = true
      this.pensionLedgerService.getPensionLedgerById(this.model.pensionLedgerId).subscribe(
        response => {
          this.pensionLedger = response;
          this.pensionLedger.status = this.model.status;
          this.pensionLedger.reason = this.model.reason;
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
        }
      );
    }
  }
}
