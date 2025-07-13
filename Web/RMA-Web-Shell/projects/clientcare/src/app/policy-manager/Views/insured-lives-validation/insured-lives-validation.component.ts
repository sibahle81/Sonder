import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { PremiumListing } from '../../shared/entities/premium-listing';
import { ImportInsuredLivesRequest } from '../../shared/entities/import-insured-lives-request';

@Component({
  selector: 'app-insured-lives-validation',
  templateUrl: './insured-lives-validation.component.html',
  styleUrls: ['./insured-lives-validation.component.css']
})

export class InsuredLivesValidationComponent extends WizardDetailBaseComponent<PremiumListing> {

  ruleRequestResult: RuleRequestResult;
  uploadingMembers = false;
  membersUploaded: boolean;
  pollingMessage = '';
  interval;

  get canUploadMembers(): boolean {
    if (!this.ruleRequestResult) { return false; }
    if (!this.ruleRequestResult.overallSuccess) { return false; }
    if (this.model) {
      return !this.model.membersUploaded;
    }
    return true;
  }

  get alreadyUploaded(): boolean {
    if (this.model) {
      return this.membersUploaded === true;
    }
    return false;
  }

  constructor(
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    appEventsManager: AppEventsManager,
    private readonly premiumListingService: PremiumListingService,
    private readonly alertService: AlertService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  createForm(): void { }

  onLoadLookups(): void { }

  populateModel(): void {
    this.model.membersUploaded = this.membersUploaded;
  }

  populateForm(): void {
    this.ruleRequestResult = null;
    const model = (Array.isArray(this.model)) ? this.model[0] : this.model;
    this.membersUploaded = model.membersUploaded || model.membersUploaded === 'true';

    if (this.membersUploaded) {
      this.populateValidations(model);
    } else {
      this.pollingMessage = 'Insured lives validations started...';
      this.startPolling();
      this.premiumListingService.importPolicyInsuredLives(this.getImportRequest(false)).subscribe(
        () => {
          this.populateValidations(model);
          this.stopPolling();
        },
        (error: HttpErrorResponse) => {
          this.stopPolling();
          this.alertService.error(error.message);
          this.uploadingMembers = false;
        }
      );
    }
  }

  populateValidations(model: PremiumListing): void {
    this.uploadingMembers = false;
    this.premiumListingService.getInsuredLivesValidationErrors(model.fileIdentifier).subscribe(
      data => {
        this.ruleRequestResult = data;
      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.message);
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.membersUploaded) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('The insured lives list has not been uploaded.');
    }
    return validationResult;
  }

  uploadMembers(): void {
    this.uploadingMembers = true;
    this.pollingMessage = 'Insured lives import started...';
    this.startPolling();

    this.model.membersUploaded = true;
    this.membersUploaded = true;

    this.premiumListingService.importInsuredLives(this.getImportRequest(true)).subscribe(
      () => {
        this.uploadingMembers = false;
        this.stopPolling();
      },
      (error: HttpErrorResponse) => {
        this.stopPolling();
        this.alertService.error(error.message);
        this.model.membersUploaded = false;
        this.membersUploaded = false;
        this.uploadingMembers = false;
      }
    );
  }

  private startPolling(): void {
    this.interval = setInterval(() => {
      this.premiumListingService.getUploadMessage(this.model.fileIdentifier).subscribe(
        data => {
          this.pollingMessage = data;
        }
      );
    }, 5000);
  }

  private stopPolling(): void {
    this.pollingMessage = 'Insured lives import has completed.';
    clearInterval(this.interval);
  }

  private getImportRequest(saveMembers: boolean): ImportInsuredLivesRequest {
    return {
      fileIdentifier: this.model.fileIdentifier, saveInsuredLives: saveMembers, createNewPolicies: this.model.createNewPolicies, version: this.model.version
    } as ImportInsuredLivesRequest;
  }

}

