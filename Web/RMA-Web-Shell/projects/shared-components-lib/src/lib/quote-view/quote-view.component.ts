import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrManager } from 'ng6-toastr-notifications';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeclineReasonDialogComponent } from './decline-reason-dialog/decline-reason-dialog.component';
import { AcceptQuoteDialogComponent } from './accept-quote-dialog/accept-quote-dialog.component';
import { ServiceTypeEnum } from 'projects/shared-models-lib/src/lib/enums/service-type.enum';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { EmailDialogComponent } from './email-dialog/email-dialog.component';
import { StartWizardRequest } from 'projects/shared-components-lib/src/lib/wizard/shared/models/start-wizard-request';
import { WizardService } from 'projects/shared-components-lib/src/lib/wizard/shared/services/wizard.service';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { LeadItemTypeEnum } from 'projects/clientcare/src/app/broker-manager/models/enums/lead-item-type.enum';
import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { LeadContactV2 } from 'projects/clientcare/src/app/lead-manager/models/lead-contact-V2';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { QuoteDetailsV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteDetailsV2';
import { QuoteEmailRequest } from 'projects/clientcare/src/app/quote-manager/models/quoteEmailRequest';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { GeneralAuditDialogComponent } from 'projects/clientcare/src/app/shared/general-audits/general-audit-dialog/general-audit-dialog.component';
import { ProductCategoryTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/product-category-type.enum';
import { ModuleTypeEnum } from 'projects/shared-models-lib/src/lib/enums/module-type-enum';
import { ReferralItemTypeEnum } from 'projects/shared-models-lib/src/lib/referrals/referral-item-type-enum';
import { KeyValue } from '@angular/common';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { AuthService } from 'projects/shared-services-lib/src/lib/services/security/auth/auth.service';

@Component({
  selector: 'quote-view-V2',
  templateUrl: './quote-view.component.html',
  styleUrls: ['./quote-view.component.css']
})
export class QuoteViewV2Component extends UnSubscribe implements OnChanges {
  currentUser: User;

  viewSlaPermission = 'View SLA';

  addPermission = 'Add Quote';
  editPermission = 'Edit Quote';
  viewPermission = 'View Quote';

  viewLeadPermission = 'View Lead';
  editLeadPermission = 'Edit Lead';

  requiredAuditPermission = 'View Audits';

  startQuoteWizardPermission = 'Start RMA RML Quote Wizard';
  continueRMAQuoteWizardPermission = 'Process RMA Quote Wizard';
  continueRMLQuoteWizardPermission = 'Process RML Quote Wizard';

  @Input() quoteId: number;

  @Output() viewLeadClickedEmit: EventEmitter<any> = new EventEmitter();

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  quote: QuoteV2;
  lead: Lead;

  ssrsRMAAssuranceQuoteUrl = 'RMA.Reports.ClientCare.Quote/RMAAssuranceQuote/RMAAssuranceQuote';
  ssrsRMLAssuranceQuoteUrl = 'RMA.Reports.ClientCare.Quote/RMLAssuranceQuote/RMLAssuranceQuote';
  ssrsRMLNonStatutoryQuoteUrl = 'RMA.Reports.ClientCare.Quote/RMLAssuranceQuote/RMLNonCoidQuote';

  quoteAuditType = LeadItemTypeEnum.Quote;

  _new = QuoteStatusEnum.New;
  accepted = QuoteStatusEnum.Accepted;
  declined = QuoteStatusEnum.Declined;
  amending = QuoteStatusEnum.Amending;
  rejected = QuoteStatusEnum.Rejected;
  autoAccepted = QuoteStatusEnum.AutoAccepted;
  quoted = QuoteStatusEnum.Quoted;

  parameters: any[];
  reporturl: string;

  products: Product[];
  productOptions: ProductOption[];

  slaItemType = SLAItemTypeEnum.Quote;

  targetModuleType = ModuleTypeEnum.ClientCare;
  referralItemType = ReferralItemTypeEnum.Quote;
  referralItemTypeReference: string;

  rolePlayerContactOptions: KeyValue<string, number>[];

  constructor(
    private readonly quoteService: QuoteService,
    private readonly leadService: LeadService,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly alertService: ToastrManager,
    private readonly wizardService: WizardService,
    private readonly authService: AuthService,
    private readonly router: Router,
    public dialog: MatDialog
  ) { super();
    this.currentUser = this.authService.getCurrentUser();
   }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.quoteId) {
      this.getProducts();
    }
  }

  getProducts() {
    this.loadingMessage$.next('loading products...please wait');
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.getProductOptions();
    });
  }

  getProductOptions() {
    this.loadingMessage$.next('loading product options...please wait');
    this.productOptionService.getProductOptionsIncludeDeleted().subscribe(results => {
      this.productOptions = results;
      this.getQuote();
    });
  }

  getQuote() {
    this.loadingMessage$.next('loading quote...please wait');
    this.quoteService.getQuoteV2(this.quoteId).subscribe(result => {
      this.quote = result;

      this.referralItemTypeReference = this.quote.quotationNumber;

      const product = this.products.find(s => s.id == this.quote.productId);

      if (product.productCategoryType == ProductCategoryTypeEnum.Coid) {
        this.reporturl = this.ssrsRMAAssuranceQuoteUrl;
      } else if (product.productCategoryType == ProductCategoryTypeEnum.VapsAssistance) {
        this.reporturl = this.ssrsRMLAssuranceQuoteUrl;
      } else if (product.productCategoryType == ProductCategoryTypeEnum.VapsNoneStatutory) {
        this.reporturl = this.ssrsRMLNonStatutoryQuoteUrl;
      }

      this.parameters = [{ key: 'QuoteId', value: this.quote.quoteId }];
      this.getLead();
    });
  }

  getLead() {
    this.loadingMessage$.next('loading lead...please wait');
    this.leadService.getLead(this.quote.leadId).subscribe(result => {
      this.lead = result;

      this.rolePlayerContactOptions = [
        { key: 'Lead', value: this.lead.rolePlayerId }
      ];

      this.isLoading$.next(false);
    });
  }

  getProductName(productId: number): string {
    const product = this.products.find(s => s.id === productId);
    return product ? product.name + ' (' + product.code + ')' : 'N/A';
  }

  getProductOptionNames(quoteDetails: QuoteDetailsV2[]): string {
    let productOptionName = String.Empty;
    const unique = [...new Set(quoteDetails.map((item) => item.productOptionId))];

    if (!unique || unique.length <= 0) { return productOptionName; }

    for (let index = 0; index < unique.length; index++) {
      const productOptionId = unique[index];
      if (index === 0) {
        productOptionName += this.getProductOptionName(productOptionId);
      } else {
        productOptionName += ' + ' + this.getProductOptionName(productOptionId);
      }
    }
    return productOptionName;
  }

  getProductOptionName(productOptionId: number): string {
    const productOption = this.productOptions.find(s => s.id === productOptionId);
    return productOption ? productOption.name + ' (' + productOption.code + ')' : 'N/A';
  }

  openAcceptDialog() {
    const dialogRef = this.dialog.open(AcceptQuoteDialogComponent, {
      width: '1024px',
      data: { quote: this.quote }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accept();
      }
    });
  }

  accept() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('accepting quote...please wait');
    this.quote.quoteStatus = QuoteStatusEnum.Accepted;
    this.quoteService.updateQuote(this.quote).subscribe(result => {
      if (result) {
        this.startMemberWizard();
      }
    });
  }

  startMemberWizard() {
    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.lead.rolePlayerId;
    startWizardRequest.type = 'member';
    startWizardRequest.data = JSON.stringify(this.quote);
    startWizardRequest.allowMultipleWizards = true;
    this.wizardService.startWizard(startWizardRequest).subscribe(result => {
      this.alertService.successToastr('quotation accepted');
      this.isLoading$.next(false);
    });
  }

  openDeclineDialog() {
    const dialogRef = this.dialog.open(DeclineReasonDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        if (data != null) {
          this.quote.declineReason = data.declineReason as string;
          this.decline();
        }
      }
    });
  }

  decline() {
    this.isLoading$.next(true);
    this.loadingMessage$.next('declining quote...please wait');
    this.quote.quoteStatus = QuoteStatusEnum.Declined;
    this.quoteService.updateQuote(this.quote).subscribe(result => {
      if (result) {
        this.alertService.successToastr('quotation declined');
        this.isLoading$.next(false);
      }
    });
  }

  openEmailDialog() {
    const dialogRef = this.dialog.open(EmailDialogComponent, {
      width: '1024px',
      data: { quote: this.quote }
    });

    dialogRef.afterClosed().subscribe({
      next: (data: LeadContactV2[]) => {
        if (data != null) {
          const quoteEmailRequest = new QuoteEmailRequest();
          quoteEmailRequest.quote = this.quote;

          data.forEach(contact => {
            this.isLoading$.next(true);
            this.loadingMessage$.next('emailing quote...please wait');

            if (!quoteEmailRequest.emailAddresses) { quoteEmailRequest.emailAddresses = []; }

            quoteEmailRequest.emailAddresses.push(contact.emailAddress);
          });

          this.quoteService.emailQuote(quoteEmailRequest).subscribe(result => {
            this.alertService.successToastr('email sent successfully');
            this.isLoading$.next(false);
          });
        }
      }
    });
  }

  getIndustryClass(industryClass: IndustryClassEnum): string {
    return this.formatLookup(IndustryClassEnum[industryClass]);
  }

  getClientType(clientType: ClientTypeEnum): string {
    return this.formatLookup(ClientTypeEnum[clientType]);
  }

  getQuoteStatus(quoteStatus: QuoteStatusEnum): string {
    return this.formatLookup(QuoteStatusEnum[quoteStatus]);
  }

  formatLookup(lookup: string) {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  viewLead() {
    this.viewLeadClickedEmit.emit();
    this.router.navigateByUrl(`/clientcare/lead-manager/lead-view/${this.quote.leadId}`);
  }

  viewQuote($event: QuoteV2) {
    this.isLoading$.next(true);
    this.quoteId = $event.quoteId;
    this.getQuote();
  }

  startAmendQuoteWizard() {
    this.isLoading$.next(true);

    this.quote.quoteStatus = QuoteStatusEnum.Amending;

    const startWizardRequest = new StartWizardRequest();
    startWizardRequest.linkedItemId = this.quote.quoteId;
    startWizardRequest.data = JSON.stringify(this.quote);

    let type = String.Empty;
    if (this.quote.underwriterId === +UnderwriterEnum.RMAMutualAssurance) {
      type = 'rma-quotation';
    } else if (this.quote.underwriterId === +UnderwriterEnum.RMALifeAssurance) {
      type = 'rml-quotation';
    }

    startWizardRequest.type = type;
    this.createWizard(startWizardRequest);
  }

  createWizard(startWizardRequest: StartWizardRequest) {
    this.wizardService.startWizard(startWizardRequest).subscribe(() => {
      this.isLoading$.next(false);
    });
  }

  openAuditDialog() {
    const dialogRef = this.dialog.open(GeneralAuditDialogComponent, {
      width: '70%',
      data: {
        serviceType: ServiceTypeEnum.QuoteManager,
        clientItemType: LeadItemTypeEnum.QuoteV2,
        itemId: this.quote.quoteId,
        heading: 'Quote Audit',
        propertiesToDisplay: ['QuoteNumber', 'QuoteStatus', 'TotalPremium']
      }
    });
  }
}
