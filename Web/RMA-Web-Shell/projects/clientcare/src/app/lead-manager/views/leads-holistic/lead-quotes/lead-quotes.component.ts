import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { userUtility } from 'projects/shared-utilities-lib/src/lib/user-utility/user-utility';
import { BehaviorSubject } from 'rxjs';
import { Lead } from '../../../models/lead';
import { UnSubscribe } from 'projects/shared-models-lib/src/lib/common/unsubscribe';
import { LeadQuotesDataSource } from './lead-quotes.datasource';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { Router } from '@angular/router';
import { QuoteDetailsV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteDetailsV2';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';

@Component({
  selector: 'lead-quotes',
  templateUrl: './lead-quotes.component.html',
  styleUrls: ['./lead-quotes.component.css']
})
export class LeadQuotesComponent extends UnSubscribe implements OnChanges {

  viewQuotePermission = 'View Quote';
  viewSlaPermission = 'View SLA';

  @Input() lead: Lead;
  @Input() refresh: boolean;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  dataSource: LeadQuotesDataSource;
  currentQuery: any;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

  requiredAuditPermission = 'View Audits';
  hasAuditPermission = false;

  quoteStatuses: QuoteStatusEnum[];
  products: Product[];
  productOptions: ProductOption[];

  newQuoteStatus = QuoteStatusEnum.New;
  pendingQuoteStatus = QuoteStatusEnum.New;

  slaItemType = SLAItemTypeEnum.Quote;

  constructor(
    private readonly quoteService: QuoteService,
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    public dialog: MatDialog,
    private readonly router: Router
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.hasAuditPermission = userUtility.hasPermission(this.requiredAuditPermission);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.dataSource = new LeadQuotesDataSource(this.quoteService);
    this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

    if (this.lead && this.lead.leadId > 0) {
      this.currentQuery = this.lead.leadId.toString();
      this.getLookups();
    }
  }

  getLookups() {
    this.quoteStatuses = this.ToArray(QuoteStatusEnum);
    this.getProducts();
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
    this.productOptionService.getProductOptions().subscribe(results => {
      this.productOptions = results;
      this.isLoading$.next(false);
      this.getData();
    });
  }

  getData() {
    this.loadingMessage$.next('loading quotes...please wait');
    this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.currentQuery);
  }

  view(quote: QuoteV2) {
    this.router.navigateByUrl(`/clientcare/quote-manager/quote-view/${quote.quoteId}`);
  }

  ToArray(anyEnum: { [x: string]: any; }) {
    const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
    return Object.keys(anyEnum)
      .filter(StringIsNumber)
      .map(key => anyEnum[key]);
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
    const productOption = this.productOptions.find(s => s.id === productOptionId)
    return productOption ? productOption.name + ' (' + productOption.code + ')' : 'N/A';
  }

  getQuoteStatus(quoteStatus: QuoteStatusEnum) {
    return this.formatLookup(QuoteStatusEnum[quoteStatus]);
  }

  formatLookup(lookup: string): string {
    return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  formatMoney(value: string): string {
    return value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }

  getDisplayedColumns() {
    const columnDefinitions = [
      { def: 'quotationNumber', show: true },
      { def: 'productId', show: true },
      { def: 'productOptionId', show: true },
      { def: 'quoteStatus', show: true },
      { def: 'totalPremium', show: true },
      { def: 'sla', show: this.userHasPermission(this.viewSlaPermission) && (this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10) },
      { def: 'actions', show: this.userHasPermission(this.viewQuotePermission) }
    ];
    return columnDefinitions
      .filter(cd => cd.show)
      .map(cd => cd.def);
  }
}
