import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { RolePlayerService } from 'projects/clientcare/src/app/policy-manager/shared/Services/roleplayer.service';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { TermArrangement } from '../../../models/term-arrangement';
import { RolePlayerPolicyDeclaration } from 'projects/clientcare/src/app/policy-manager/shared/entities/role-player-policy-declaration';

@Component({
  selector: 'app-terms-arrangement-eligibility-check',
  templateUrl: './terms-arrangement-eligibility-check.component.html',
  styleUrls: ['./terms-arrangement-eligibility-check.component.css']
})
export class TermsArrangementEligibilityCheckComponent extends WizardDetailBaseComponent<TermArrangement> implements OnInit {
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  member: RolePlayer;
  declarations: RolePlayerPolicyDeclaration[] = [];

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly rolePlayerService: RolePlayerService,
    private readonly declarationService: DeclarationService) {
    super(appEventsManager, authService, activatedRoute);
    this.createForm(0);
  }

  ngOnInit() {
   }

  createForm(id: number): void {}

  onLoadLookups(): void {}

  populateModel(): void {}

  populateForm(): void {
    if (this.model.rolePlayerId) {
      this.rolePlayerService.getRolePlayer(this.model.rolePlayerId).subscribe(result => {
      this.member = result;
      this.getDeclaration(this.model.rolePlayerId);
    });
   }
  }

  getDeclaration(roleplayerId: number) {
    this.isLoading$.next(false);

  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.declarations || this.declarations.length === 0 ) {
      validationResult.errorMessages = ['Declarations not up to date.'];
      validationResult.errors = 1;
  }
    return validationResult;
  }
}

