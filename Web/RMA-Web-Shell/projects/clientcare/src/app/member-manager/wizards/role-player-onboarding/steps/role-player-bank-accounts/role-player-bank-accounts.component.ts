    import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
    import { BehaviorSubject } from 'rxjs';
    import { ActivatedRoute } from '@angular/router';
    import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
    import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
    import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
    import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
    import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
    import { Company } from 'projects/clientcare/src/app/policy-manager/shared/entities/company';
    import { CompanyLevelEnum } from 'projects/shared-models-lib/src/lib/enums/company-level-enum';

    @Component({
    templateUrl: './role-player-bank-accounts.component.html'
    })

    export class RolePlayerBankAccountsComponent extends WizardDetailBaseComponent<RolePlayer> implements OnInit {
      
    isReadOnly = false;
    validationErrors: string[] = [];

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
      if (!this.model.rolePlayerBankingDetails || this.model.rolePlayerBankingDetails?.length <= 0) {
        validationResult.errors++;
        validationResult.errorMessages.push("At least one bank account is required");
      }

      return validationResult;
    }
    
  }
