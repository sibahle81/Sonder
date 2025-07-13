import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { QuoteV2 } from '../../../models/quoteV2';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { BehaviorSubject } from 'rxjs';

@Component({
  templateUrl: './rml-quote-preview.component.html',
  styleUrls: ['./rml-quote-preview.component.css']
})
export class RmlQuotePreviewComponent extends WizardDetailBaseComponent<QuoteV2> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  parameters: any[];
  reporturl: string;

  vapsAssistanceTemplate = 'RMA.Reports.ClientCare.Quote/RMLAssuranceQuote/RMLAssuranceQuotePreview';
  vapsNoneStatutoryTemplate = 'RMA.Reports.ClientCare.Quote/RMLAssuranceQuote/RMLNonCoidQuotePreview';

  wizardId: number;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly productService: ProductService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.wizardId = params.linkedId;
      this.parameters = [{ key: 'WizardId', value: this.wizardId }];
    });
  }

  setReportTemplate() {
    this.productService.getProduct(this.model.productId).subscribe(result => {
      if (result && result.productCategoryType) {
        this.reporturl = result.productCategoryType == ProductCategoryTypeEnum.VapsAssistance ? this.vapsAssistanceTemplate : this.vapsNoneStatutoryTemplate;
      }
      this.isLoading$.next(false);
    });
  }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    if (this.wizardId) {
      this.parameters = [{ key: 'WizardId', value: this.wizardId }];
    }

    this.setReportTemplate();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    return validationResult;
  }

}
