import { Lead } from 'projects/clientcare/src/app/lead-manager/models/lead';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { IndustryTypeEnum } from 'projects/shared-models-lib/src/lib/enums/industry-type.enum';
import { IndustryClassEnum } from 'projects/shared-models-lib/src/lib/enums/industry-class.enum';
import { ToastrManager } from 'ng6-toastr-notifications';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { UnderwriterEnum } from 'projects/shared-models-lib/src/lib/enums/underwriter-enum';
import { LeadService } from 'projects/clientcare/src/app/lead-manager/services/lead.service';
import { IndustryClassDeclarationConfiguration } from 'projects/clientcare/src/app/member-manager/models/industry-class-declaration-configuration';
import { DeclarationService } from 'projects/clientcare/src/app/member-manager/services/declaration.service';
import { RateIndustry } from 'projects/clientcare/src/app/policy-manager/shared/entities/rate-industry';
import { CategoryInsuredEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/categoryInsuredEnum';
import { LeadClientStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/leadClientStatusEnum';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductOptionDependency } from 'projects/clientcare/src/app/product-manager/models/product-option-dependency';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { QuoteDetailsV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteDetailsV2';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { productUtility } from 'projects/shared-utilities-lib/src/lib/product-utility/product-utility';
import { MemberService } from 'projects/clientcare/src/app/member-manager/services/member.service';
import { RolePlayer } from 'projects/clientcare/src/app/policy-manager/shared/entities/roleplayer';
import { DocumentTypeEnum } from 'projects/shared-models-lib/src/lib/enums/document-type.enum';
import { DocumentSystemNameEnum } from '../document/document-system-name-enum';
import { DocumentSetEnum } from 'projects/shared-models-lib/src/lib/enums/document-set.enum';
import { DefaultConfirmationDialogComponent } from '../dialogs/default-confirmation-dialog/default-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'product-selector-V2',
  templateUrl: './product-selector-V2.component.html',
  styleUrls: ['./product-selector-V2.component.css']
})
export class ProductSelectorV2Component extends UnSubscribe implements OnChanges {

  addQuotePermission = 'Add Quote';

  @Input() lead: Lead;
  //OR
  @Input() rolePlayerId: number;

  @Output() triggerRefreshEmit: EventEmitter<boolean> = new EventEmitter();

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');
  form: UntypedFormGroup;

  products: Product[];
  supportedProducts: Product[] = [];
  selectedProduct: Product;

  productOptions: ProductOption[];
  filteredProductOptions: ProductOption[];
  selectedProductOption: ProductOption;

  categoryInsureds: CategoryInsuredEnum[];
  allProductOptionDependancies: ProductOptionDependency[];

  industryClassDeclarationConfiguration: IndustryClassDeclarationConfiguration;
  industryRates: RateIndustry[];
  industryClass: string;

  newQuotes: QuoteV2[] = [];
  existingQuotes: QuoteV2[] = [];

  declined = LeadClientStatusEnum.Declined;

  member: RolePlayer;

  documentSystemName = DocumentSystemNameEnum.MemberManager;
  documentSet = DocumentSetEnum.MemberDocumentSet;
  documentTypeFilter: DocumentTypeEnum[] = [];
  requiredDocumentsUploaded = false;
  documentComponentReady = false;

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly alertService: ToastrManager,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    private readonly declarationService: DeclarationService,
    private readonly quoteService: QuoteService,
    private readonly leadService: LeadService,
    private readonly memberService: MemberService,
    public dialog: MatDialog
  ) {
    super();
    this.categoryInsureds = this.ToArray(CategoryInsuredEnum);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.rolePlayerId) {
      this.leadService.getLeadByRolePlayerId(this.rolePlayerId).subscribe(result => {
        if (result) {
          this.lead = result;
          if (this.lead && this.lead.company && this.lead.company.industryClass && this.lead.company.industryTypeId) {
            this.getMember();
          }
        } else {
          this.isLoading$.next(false);
        }
      });
    } else {
      if (this.lead && this.lead.company && this.lead.company.industryClass && this.lead.company.industryTypeId) {
        this.getMember();
      } else {
        this.isLoading$.next(false);
      }
    }
  }

  getMember() {
    this.loadingMessage$.next('checking member...please wait');
    this.memberService.getMember(this.lead.rolePlayerId).subscribe(result => {
      this.member = result;
      this.getProducts();
    });
  }

  getProducts() {
    this.loadingMessage$.next('loading products...please wait');
    this.productService.getProducts().subscribe(results => {
      this.products = results;
      this.setSupportedProducts();
      this.getProductOptions();
    });
  }

  setSupportedProducts() {
    this.loadingMessage$.next('loading supported products...please wait');
    if (this.products && this.products?.length > 0) {
      this.supportedProducts = [];
      this.products.forEach(product => {
        if (this.member) {
          if ((this.member.hasActiveCoidPolicies || this.member.company.industryClass == IndustryClassEnum.Other) && productUtility.isVaps(product)) {
            this.supportedProducts.push(product);
          }
          if (productUtility.isCoid(product)) {
            this.supportedProducts.push(product);
          }
        } else {
          if (productUtility.isCoid(product) && this.lead.company.industryClass != IndustryClassEnum.Other) {
            this.supportedProducts.push(product);
          }
          if (productUtility.isVaps(product) && this.lead.company.industryClass == IndustryClassEnum.Other) {
            this.supportedProducts.push(product);
          }
        }
      });
    }
  }

  getProductOptions() {
    this.loadingMessage$.next('loading product options...please wait');
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptions = results;
      this.getAllProductDependancies();
    });
  }

  getAllProductDependancies() {
    this.loadingMessage$.next('loading product option dependencies...please wait');
    this.productService.getProductOptionDependencies().subscribe(results => {
      this.allProductOptionDependancies = results;
      this.getIndustryRates();
    });
  }

  getIndustryRates() {
    this.loadingMessage$.next('loading industry rates...please wait');
    const industryType = IndustryTypeEnum[this.lead.company.industryTypeId];
    this.industryClass = IndustryClassEnum[+this.lead.company.industryClass];

    this.declarationService.getRatesForIndustry(industryType, this.industryClass).subscribe(results => {
      this.industryRates = results;
      this.getIndustryClassDeclarationConfiguration();
    });
  }

  getIndustryClassDeclarationConfiguration() {
    this.loadingMessage$.next('loading configuration...please wait');
    this.declarationService.getIndustryClassDeclarationConfiguration(+IndustryClassEnum[this.industryClass]).subscribe(result => {
      if (result) {
        this.industryClassDeclarationConfiguration = result;
        this.getQuotes();
      }
    });
  }

  getQuotes() {
    this.loadingMessage$.next('loading existing quotes...please wait');
    this.quoteService.getQuotesV2(this.lead.leadId).subscribe(results => {
      this.existingQuotes = results.filter(s => s.quoteStatus !== QuoteStatusEnum.Declined && s.quoteStatus !== QuoteStatusEnum.Rejected);
      this.createForm();
    })
  }

  createForm() {
    this.form = this.formBuilder.group({
      products: [{ value: null, disabled: false }],
      productOptions: [{ value: null, disabled: false }]
    });
    this.isLoading$.next(false);
  }

  productSelected(product: Product) {
    this.selectedProduct = product;
    this.selectedProductOption = null;

    this.syncProductOptionFilter(this.selectedProduct);

    this.setupDependentProductOptionLabel();
    this.autoSelectProductOption();
  }

  syncProductOptionFilter(product: Product) {
    this.filteredProductOptions = this.productOptions.filter(s => s.productId === product.id);
    this.existingQuotes?.forEach(quote => {
      quote.quoteDetailsV2?.forEach(quoteDetail => {
        const index = this.filteredProductOptions.findIndex(s => s.id === quoteDetail.productOptionId);
        if (index > -1) {
          this.filteredProductOptions.splice(index, 1);
        }
      });
    });
  }

  setupDependentProductOptionLabel() {
    if (!(this.lead.company && this.lead.company.industryClass)) { return; }
    this.allProductOptionDependancies.forEach(dependency => {
      const childOption = this.productOptions.find(s => s.id === dependency.childOptionId && this.lead.company.industryClass === dependency.industryClass);
      if (childOption) {
        const index = this.filteredProductOptions.findIndex(s => s.id === dependency.productOptionId);
        if (index > -1 && !this.filteredProductOptions[index].name.includes('+')) {
          this.filteredProductOptions[index].name = this.filteredProductOptions[index].name + ` (${this.filteredProductOptions[index].code})` + ' + ' + childOption.name + `(${childOption.code})`;
        }
      }
    });
  }

  autoSelectProductOption() {
    if (this.filteredProductOptions && this.filteredProductOptions?.length === 1) {
      this.form.patchValue({
        productOptions: this.filteredProductOptions[0]
      });
      this.productOptionSelected(this.filteredProductOptions[0]);
      this.form.get('productOptions').disable();
    } else {
      this.form.get('productOptions').enable();
    }
  }

  productOptionSelected(productOption: ProductOption) {
    this.selectedProductOption = productOption;
  }

  addQuote() {
    const quote = new QuoteV2();
    quote.leadId = this.lead.leadId > 0 ? this.lead.leadId : 0;
    quote.underwriterId = this.selectedProduct.underwriterId ? this.selectedProduct.underwriterId : 0;
    quote.productId = this.selectedProduct.id ? this.selectedProduct.id : 0;
    quote.quoteStatus = QuoteStatusEnum.New;

    quote.quoteDetailsV2 = this.getQuoteDetails(quote);

    this.newQuotes.push(quote);
    this.existingQuotes.push(quote);

    this.handleRequiredDocuments(this.selectedProduct, false);

    this.reset();
  }

  handleRequiredDocuments(product: Product, isDelete: boolean) {
    this.setDocumentComponentReady(false);

    if (productUtility.isCoid(product)) {
      if (isDelete) {
        if (!this.newQuotes.some(s => s.productId == product.id)) {
          const index = this.documentTypeFilter.indexOf(DocumentTypeEnum.COIDDeclarationForm);
          if (index > -1) {
            this.documentTypeFilter.splice(index, 1);
          }
        }
      } else if (!this.documentTypeFilter.includes(DocumentTypeEnum.COIDDeclarationForm)) {
        this.documentTypeFilter.push(DocumentTypeEnum.COIDDeclarationForm);
      }
    }

    if (productUtility.isVaps(product)) {
      if (isDelete) {
        if (!this.newQuotes.some(s => s.productId == product.id)) {
          const index = this.documentTypeFilter.indexOf(DocumentTypeEnum.VAPSDeclarationForm);
          if (index > -1) {
            this.documentTypeFilter.splice(index, 1);
          }
        }
      } else if (!this.documentTypeFilter.includes(DocumentTypeEnum.VAPSDeclarationForm)) {
        this.documentTypeFilter.push(DocumentTypeEnum.VAPSDeclarationForm);
      }
    }

    this.documentTypeFilter = JSON.parse(JSON.stringify(this.documentTypeFilter)) as DocumentTypeEnum[];
  }

  deleteQuote(quote: QuoteV2) {
    const newQuoteIndex = this.newQuotes.findIndex(s => s === quote);
    if (newQuoteIndex > -1) {
      this.newQuotes.splice(newQuoteIndex, 1);
    }

    const existingQuoteIndex = this.existingQuotes.findIndex(s => s === quote);
    if (existingQuoteIndex > -1) {
      this.existingQuotes.splice(existingQuoteIndex, 1);
    }

    const product = this.products.find(s => s.id === quote.productId);
    this.handleRequiredDocuments(product, true);
    this.syncProductOptionFilter(product);

    this.reset();
  }

  saveQuotes() {
    this.isLoading$.next(true);
    this.loadingMessage$.next(`we're letting someone know that you have shown interest in our products...please wait`);
    this.quoteService.createQuotes(this.newQuotes).subscribe(result => {
      if (result) {
        this.triggerRefreshEmit.emit(true);
        this.newQuotes = [];
        this.alertService.successToastr('...someone has been notified');
        this.getQuotes();
        this.documentTypeFilter = [];
      }
    });
  }

  setRequiredDocumentsUploaded($event: boolean) {
    this.requiredDocumentsUploaded = $event;
  }

  setDocumentComponentReady($event: boolean) {
    this.documentComponentReady = $event;
  }

  openConfirmationDialog() {
    if (this.requiredDocumentsUploaded && this.documentTypeFilter && this.documentTypeFilter?.length > 0) {
      this.saveQuotes();
    } else {
      const dialogRef = this.dialog.open(DefaultConfirmationDialogComponent, {
        width: '40%',
        disableClose: true,
        data: {
          title: `Documents`,
          text: `The required documents will be needed before the quotation can be completed. Proceed anyway?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.saveQuotes();
        }
      });
    }
  }

  getQuoteDetails(quote: QuoteV2): QuoteDetailsV2[] {
    const quoteDetails: QuoteDetailsV2[] = [];

    // CALCULATE SPLIT
    const childProductOptionDependencies = this.getChildProductOptionDependencies(this.selectedProductOption);
    let parentPercentageSplit = 100;
    let totalChildrenPecentage = 0;
    childProductOptionDependencies.forEach(childProductOptionDependency => {
      totalChildrenPecentage += childProductOptionDependency.childPremiumPecentage;
    });
    parentPercentageSplit -= totalChildrenPecentage;

    // PARENT
    this.categoryInsureds.forEach(categoryInsured => {
      const quoteDetail = new QuoteDetailsV2();
      quoteDetail.categoryInsured = categoryInsured;
      quoteDetail.productOptionId = this.selectedProductOption.id;
      quoteDetail.parentChildSplitPercentage = parentPercentageSplit;

      const industryRate = this.getRate(quote, +CategoryInsuredEnum[categoryInsured]);
      quoteDetail.industryRate = +(industryRate * (quoteDetail.parentChildSplitPercentage / 100)).toFixed(4)

      quoteDetails.push(quoteDetail);
    });

    // CHILDREN
    childProductOptionDependencies.forEach(childProductOptionDependeny => {
      this.categoryInsureds.forEach(categoryInsured => {
        const quoteDetail = new QuoteDetailsV2();
        quoteDetail.categoryInsured = categoryInsured;
        quoteDetail.productOptionId = childProductOptionDependeny.childOptionId;
        quoteDetail.parentChildSplitPercentage = childProductOptionDependeny.childPremiumPecentage;

        const industryRate = this.getRate(quote, +CategoryInsuredEnum[categoryInsured]);
        quoteDetail.industryRate = industryRate * (quoteDetail.parentChildSplitPercentage / 100)

        quoteDetails.push(quoteDetail);
      });
    })

    return quoteDetails;
  }

  getRate(quote: QuoteV2, categoryInsured: CategoryInsuredEnum): number {
    let rate: number;

    if (quote.underwriterId === +UnderwriterEnum.RMAMutualAssurance) {
      const ratingYear = this.getRatingYear(new Date());
      const industryRate = this.industryRates.find(s => s.ratingYear === ratingYear && categoryInsured == s.skillSubCategory);
      rate = industryRate ? industryRate.indRate : 0;
    } else if (quote.underwriterId === +UnderwriterEnum.RMALifeAssurance) {
      rate = this.selectedProductOption.baseRate ? this.selectedProductOption.baseRate : 0;
    }

    return rate;
  }

  getChildProductOptionDependencies(parentProductOption: ProductOption): ProductOptionDependency[] {
    let childProductOptionDependencies: ProductOptionDependency[] = [];
    childProductOptionDependencies = this.allProductOptionDependancies.filter(s => s.productOptionId === parentProductOption.id && s.industryClass === this.lead.company.industryClass);
    return childProductOptionDependencies;
  }

  getRatingYear(date: Date): number {
    const configuredRenewalMonth = this.industryClassDeclarationConfiguration.renewalPeriodStartMonth;
    const configuredRenewalDay = this.industryClassDeclarationConfiguration.renewalPeriodStartDayOfMonth;

    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month < configuredRenewalMonth) || (month === configuredRenewalMonth && day < configuredRenewalDay)) {
      return date.getFullYear() - 1;
    }

    return date.getFullYear();
  }

  getProductName(productId: number): string {
    const product = this.products.find(s => s.id === productId);
    return product ? product.name + ' (' + product.code + ')' : 'N/A';
  }

  getProductOptionNames(quoteDetails: QuoteDetailsV2[]): string {
    let productOptionName = String.Empty;
    const unique = [...new Set(quoteDetails.map((item) => item.productOptionId))];

    if (!unique || unique?.length <= 0) { return productOptionName; }

    if (unique && unique?.length === 1) {
      productOptionName += this.getProductOptionName(unique[0]);
    } else {
      productOptionName = this.productOptions.find(s => s.id == unique[0])?.name;
    }

    return productOptionName;
  }

  getProductOptionName(productOptionId: number): string {
    const productOption = this.productOptions.find(s => s.id === productOptionId);
    return productOption ? productOption.name + ' (' + productOption.code + ')' : 'N/A';
  }

  reset() {
    this.selectedProduct = null;
    this.selectedProductOption = null;

    this.form.controls.products.reset();
    this.form.controls.productOptions.reset();
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
  }
}
