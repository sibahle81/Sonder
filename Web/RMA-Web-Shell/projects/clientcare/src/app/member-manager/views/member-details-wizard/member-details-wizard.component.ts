import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentSystemNameEnum } from 'projects/shared-components-lib/src/lib/document/document-system-name-enum';
import { ValidationResult } from 'projects/shared-components-lib/src/lib/wizard/shared/models/validation-result';
import { WizardDetailBaseComponent } from 'projects/shared-components-lib/src/lib/wizard/views/wizard-detail-base/wizard-detail-base.component';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';
import { AppEventsManager } from 'projects/shared-utilities-lib/src/lib/app-events-manager/app-events-manager';
import { BehaviorSubject } from 'rxjs';
import { QuoteV2 } from '../../../quote-manager/models/quoteV2';
import { LeadService } from '../../../lead-manager/services/lead.service';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { ProductService } from '../../../product-manager/services/product.service';
import { productUtility } from 'projects/shared-utilities-lib/src/lib/product-utility/product-utility';

@Component({
  templateUrl: './member-details-wizard.component.html',
  styleUrls: ['./member-details-wizard.component.css']
})

export class MemberDetailsWizardComponent extends WizardDetailBaseComponent<QuoteV2> implements OnInit {

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  quote: QuoteV2;
  rolePlayerId: number;
  allRequiredDocumentsUploaded = false;

  wizardId: string;
  documentSystemName = DocumentSystemNameEnum.MemberManager;
  documentSet = DocumentSetEnum.MemberDocumentSet;
  forceRequiredDocumentTypeFilter: DocumentTypeEnum[] = [];

  constructor(
    readonly appEventsManager: AppEventsManager,
    readonly authService: AuthService,
    readonly activatedRoute: ActivatedRoute,
    private readonly leadService: LeadService,
    private readonly productService: ProductService) {
    super(appEventsManager, authService, activatedRoute);
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.linkedId) {
        this.wizardId = params.linkedId;
      }
    });
  }

  createForm(id: number): void {
    return;
  }

  onLoadLookups(): void {
    return;
  }

  populateModel(): void { return; }

  populateForm(): void {
    this.quote = this.model;
    this.leadService.getLead(this.quote.leadId).subscribe(lead => {
      this.rolePlayerId = lead.rolePlayerId;

      this.productService.getProduct(this.quote.productId).subscribe(product => {
        if (product && productUtility.isCoid(product)) {
          this.forceRequiredDocumentTypeFilter.push(DocumentTypeEnum.SubclassConfirmation);
        }
      });

    });
    this.isLoading$.next(false);
  }

  isRequiredDocumentsUploaded(isUploaded: boolean) {
    this.allRequiredDocumentsUploaded = isUploaded;
  }

  onValidateModel(validationResult: ValidationResult): ValidationResult {
    if (!this.allRequiredDocumentsUploaded) {
      validationResult.errors += 1;
      validationResult.errorMessages.push('All required documents must be uploaded');
    }
    return validationResult;
  }
}
