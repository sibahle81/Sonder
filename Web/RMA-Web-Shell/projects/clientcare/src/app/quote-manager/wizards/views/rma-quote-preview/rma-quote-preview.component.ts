import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { QuoteV2 } from '../../../models/quoteV2';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';

@Component({
  templateUrl: './rma-quote-preview.component.html',
  styleUrls: ['./rma-quote-preview.component.css']
})
export class RmaQuotePreviewComponent extends WizardDetailBaseComponent<QuoteV2> implements OnInit {

  parameters: any[];
  reporturl = 'RMA.Reports.ClientCare.Quote/RMAAssuranceQuote/RMAAssuranceQuotePreview';

  wizardId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardId = params.linkedId;
      this.parameters = [{ key: 'WizardId', value: this.wizardId }];
    });
  }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    if (this.wizardId) {
      this.parameters = [{ key: 'WizardId', value: this.wizardId }];
    }
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }
}
