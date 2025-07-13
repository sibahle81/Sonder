import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { RuleRequestResult } from 'projects/shared-components-lib/src/lib/rules-engine/shared/models/rule-request-result';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AlertService } from 'projects/shared-services-lib/src/lib/services/alert/alert.service';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';

import { ImportInsuredLivesRequest } from '../../shared/entities/import-insured-lives-request';
import { PremiumListingService } from './../../shared/Services/premium-listing.service';
import { PremiumListing } from '../../shared/entities/premium-listing';

@Component({
  selector: 'app-premium-listing-validation',
  templateUrl: './premium-listing-validation.component.html',
  styleUrls: ['./premium-listing-validation.component.css']
})
export class PremiumListingValidationComponent extends WizardDetailBaseComponent<PremiumListing> {

  ruleRequestResult: RuleRequestResult;
  uploadingMembers = false;
  membersUploaded: boolean;
  pollingMessage = '';
  interval;

  get canUploadMembers(): boolean {
    if (!userUtility.hasPermission('Approve Premium Listing')) { return false; }
    if (!this.ruleRequestResult) { return false; }
    if (!this.ruleRequestResult.overallSuccess) { return false; }
    if (this.model) {
      return !this.model.membersUploaded;
    }
    return false;
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
      this.pollingMessage = 'Member validations started...';
      this.startPolling();
      this.premiumListingService.importInsuredLives(this.getImportRequest(false)).subscribe(
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
    this.premiumListingService.getValidationErrors(model.fileIdentifier).subscribe(
      data => {
        this.ruleRequestResult = data;
        // check: this.ruleRequestResult.overallSuccess

      },
      (error: HttpErrorResponse) => {
        this.alertService.error(error.message);
      }
    );
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.membersUploaded) {
      validationResult.errors = validationResult.errors + 1;
      validationResult.errorMessages.push('The member list has not been uploaded.');
    }
    return validationResult;
  }

  uploadMembers(): void {
    this.uploadingMembers = true;
    this.pollingMessage = 'Member import started...';
    this.startPolling();

    this.premiumListingService.importInsuredLives(this.getImportRequest(true)).subscribe(
      () => {
        this.model.membersUploaded = true;
        this.uploadingMembers = false;
        this.membersUploaded = true;
        this.stopPolling();
      },
      (error: HttpErrorResponse) => {
        this.stopPolling();
        this.alertService.error(error.message);
        this.model.membersUploaded = false;
        this.uploadingMembers = false;
        this.membersUploaded = false;
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
    this.pollingMessage = 'Member import has completed.';
    clearInterval(this.interval);
  }

  private getImportRequest(saveMembers: boolean): ImportInsuredLivesRequest {
    return {
      fileIdentifier: this.model.fileIdentifier, saveInsuredLives: saveMembers, createNewPolicies: this.model.createNewPolicies, version: this.model.version
    } as ImportInsuredLivesRequest;
  }
}
