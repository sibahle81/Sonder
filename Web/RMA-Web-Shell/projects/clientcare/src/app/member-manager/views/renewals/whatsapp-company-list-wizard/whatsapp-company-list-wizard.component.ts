import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { CommunicationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/communication-type-enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';

@Component({
  templateUrl: './whatsapp-company-list-wizard.component.html'
})

export class WhatsappCompanyListWizardComponent extends WizardDetailBaseComponent<RolePlayer[]> {

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(id: number): void { return; }

  onLoadLookups(): void { return; }

  populateModel(): void { return; }

  populateForm(): void { }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    validationResult.errors = 0;
    validationResult.errorMessages = [];
    this.model.forEach(s => {
      if (!s.rolePlayerContacts || (s.rolePlayerContacts && s.rolePlayerContacts.length <= 0)) {
        validationResult.errors++;
        validationResult.errorMessages.push(`At least one declaration SMS contact is required for each Member: ${s.displayName}`);
      }
      if (s.rolePlayerContacts && s.rolePlayerContacts.length > 0) {
        const communicationType = s.rolePlayerContacts.some(t => t.communicationType === CommunicationTypeEnum.SMS);
        if (!communicationType) {
          validationResult.errors++;
          validationResult.errorMessages.push(`At least one declaration SMS contact is required for each Member: ${s.displayName}`);
        }
      }
    });
    return validationResult;
  }
}
