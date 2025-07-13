import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { RolePlayer } from '../../../policy-manager/shared/entities/roleplayer';

@Component({
  selector: 'app-member-banking-details-wizard',
  templateUrl: './member-banking-details-wizard.component.html',
  styleUrls: ['./member-banking-details-wizard.component.css']
})
export class MemberBankingDetailsWizardComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router,
    private readonly alert: ToastrManager) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
  }

  createForm(id: number): void {
    return;
  }
  onLoadLookups(): void { return; }
  populateModel(): void { return; }
  populateForm(): void { return; }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
