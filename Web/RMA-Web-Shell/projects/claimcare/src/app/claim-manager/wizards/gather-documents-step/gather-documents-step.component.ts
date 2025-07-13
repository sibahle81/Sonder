import { Component, OnInit } from '@angular/core';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ClaimDocumentRequest } from '../../shared/entities/funeral/claim-document-request.model';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { TitleEnum } from 'projects/shared-models-lib/src/lib/enums/title-enum';
import { ContactDesignationTypeEnum } from 'projects/shared-models-lib/src/lib/enums/contact-designation-type-enum';

@Component({
  templateUrl: './gather-documents-step.component.html'
})
export class GatherDocumentsStepComponent extends WizardDetailBaseComponent<ClaimDocumentRequest> implements OnInit {

  documentSystemName = DocumentSystemNameEnum.ClaimManager;
  allRequiredDocumentsUploaded = false;
  rolePlayer: RolePlayer;

  constructor(
    private readonly appEventsManager: AppEventsManager,
    readonly activatedRoute: ActivatedRoute,
    readonly authService: AuthService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly router: Router) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() { }

  onLoadLookups() { }

  createForm() {  }

  populateModel() {  }

  populateForm() {
    console.log(this.model);
   }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if(!this.allRequiredDocumentsUploaded) {
      validationResult.errors++;
      validationResult.errorMessages.push('Gimme Dociumenst');
    }
    return validationResult;
   }

   setRequiredDocumentsUploaded($event: boolean) {
    this.allRequiredDocumentsUploaded = $event;
   }

   setRolePlayer($event: RolePlayer) {
    this.rolePlayer = $event;
   }
}
