import { Component, OnInit } from '@angular/core';
import { QuoteV2 } from '../../../models/quoteV2';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { ActivatedRoute } from '@angular/router';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { productUtility } from 'projects/shared-utilities-lib/src/lib/product-utility/product-utility';
import { BehaviorSubject } from 'rxjs';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';

@Component({
  templateUrl: './rma-rml-quote-details.component.html',
  styleUrls: ['./rma-rml-quote-details.component.css']
})
export class RmaRmlQuoteDetailsComponent extends WizardDetailBaseComponent<QuoteV2> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isLoadingIndustryClassConfiguration$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  documentSystemName = DocumentSystemNameEnum.MemberManager;
  documentSet = DocumentSetEnum.MemberDocumentSet;
  documentTypeFilter: DocumentTypeEnum[] = [];
  requiredDocumentsUploaded = false;

  lead: Lead;
  product: Product;

  currentCoverPeriodEndDate: Date;

  constructor(
    appEventsManager: AppEventsManager,
    authService: AuthService,
    activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly declarationService: DeclarationService
  ) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit(): void { }

  getProduct() {
    this.productService.getProduct(this.model.productId).subscribe(result => {
      if (result) {
        this.product = result;
        if (productUtility.isCoid(this.product)) {
          if (!this.documentTypeFilter.includes(DocumentTypeEnum.COIDDeclarationForm)) {
            this.documentTypeFilter.push(DocumentTypeEnum.COIDDeclarationForm);
          }
        }

        if (productUtility.isVaps(this.product)) {
          if (!this.documentTypeFilter.includes(DocumentTypeEnum.VAPSDeclarationForm)) {
            this.documentTypeFilter.push(DocumentTypeEnum.VAPSDeclarationForm);
          }
        }
        this.isLoading$.next(false);
      }
    });
  }

  getIndustryClassDeclarationConfiguration() {
    this.currentCoverPeriodEndDate = null;
    this.declarationService.getDefaultRenewalPeriodStartDate(+this.lead.company.industryClass, new Date()).subscribe(result => {
      if (result) {
        const date = new Date(new Date(result).getFullYear() + 1, new Date(result).getMonth(), new Date(result).getDate());
        this.currentCoverPeriodEndDate = new Date(date.setDate(date.getDate() - 1));
      }

      this.isLoadingIndustryClassConfiguration$.next(false);
    });
  }

  createForm(id: number): void { }

  onLoadLookups(): void { }

  populateModel(): void { }

  populateForm(): void {
    this.getProduct();
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.model.totalPremium || this.model.totalPremium <= 0) {
      validationResult.errors++;
      validationResult.errorMessages.push('All selected quote details must have a premium calculated that is greater then zero');
    }

    if (!this.requiredDocumentsUploaded) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All required documents must be uploaded');
    }

    return validationResult;
  }

  setLead($event) {
    this.lead = $event;
    this.getIndustryClassDeclarationConfiguration();
  }

  setRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
  }
}
