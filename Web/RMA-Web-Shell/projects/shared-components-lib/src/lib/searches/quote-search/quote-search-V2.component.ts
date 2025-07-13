import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { debounceTime } from 'rxjs/operators';
import { PermissionHelper } from 'projects/shared-models-lib/src/lib/common/permission-helper';
import { QuoteV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteV2';
import { QuoteSearchV2DataSource } from './quote-search-V2.datasource';
import { QuoteService } from 'projects/clientcare/src/app/quote-manager/services/quote.service';
import { QuoteDetailsV2 } from 'projects/clientcare/src/app/quote-manager/models/quoteDetailsV2';
import { BehaviorSubject } from 'rxjs';
import { ProductOption } from 'projects/clientcare/src/app/product-manager/models/product-option';
import { ProductOptionService } from 'projects/clientcare/src/app/product-manager/services/product-option.service';
import { QuoteStatusEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/quote-status.enum';
import { ClientTypeEnum } from 'projects/clientcare/src/app/policy-manager/shared/enums/client-type-enum';
import { SLAItemTypeEnum } from 'projects/shared-models-lib/src/lib/sla/sla-item-type-enum';
import { Product } from 'projects/clientcare/src/app/product-manager/models/product';
import { ProductService } from 'projects/clientcare/src/app/product-manager/services/product.service';

@Component({
    selector: 'quote-search-V2',
    templateUrl: './quote-search-V2.component.html',
    styleUrls: ['./quote-search-V2.component.css']
})

export class QuoteSearchV2Component extends PermissionHelper implements OnInit, OnChanges {

    editPermission = 'Edit Quote';
    viewPermission = 'View Quote';
    viewSlaPermission = 'View SLA';

    // all inputs are optional
    @Input() basicMode = true; // hides extra filters by default
    @Input() rolePlayerId: number; // if supplied will filter and only return results within this context
    @Input() triggerReset: boolean; // if toggled the component will reset
    @Input() hideLeadColumn = false;

    @Output() quoteSelectedEmit = new EventEmitter<QuoteV2>();

    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) sort: MatSort;

    dataSource: QuoteSearchV2DataSource;

    public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
    public loadingMessage$: BehaviorSubject<string> = new BehaviorSubject('loading...please wait');

    form: any;

    quoteStatuses: QuoteStatusEnum[];
    clientTypes: ClientTypeEnum[];

    searchTerm = '';
    selectedQuote: QuoteV2;

    products: Product[];
    productOptions: ProductOption[];

    slaItemType = SLAItemTypeEnum.Quote;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly quoteService: QuoteService,
        private readonly productService: ProductService,
        private readonly productOptionService: ProductOptionService
    ) {
        super();
        this.dataSource = new QuoteSearchV2DataSource(this.quoteService);
    }

    ngOnInit() {
        this.createForm();
        this.configureSearch();
        this.getLookups();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.triggerReset) {
            this.getData();
        }
    }

    getLookups() {
        this.quoteStatuses = this.ToArray(QuoteStatusEnum);
        this.clientTypes = this.ToArray(ClientTypeEnum);
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
        this.productOptionService.getProductOptionsIncludeDeleted().subscribe(results => {
            this.productOptions = results;
            this.isLoading$.next(false);
            this.getData();
        });
    }

    createForm(): void {
        if (this.form) { return; }
        this.form = this.formBuilder.group({
            quoteStatusFilter: [{ value: null, disabled: false }],
            clientTypeFilter: [{ value: null, disabled: false }],
            searchTerm: [{ value: null, disabled: false }]
        });
    }

    configureSearch() {
        this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.rowCount$.subscribe(count => this.paginator.length = count);

        this.form.get('searchTerm').valueChanges.pipe(debounceTime(1000)).subscribe(response => {
            this.search(response as string);
        });
    }

    search(searchTerm: string) {
        this.paginator.pageIndex = 0;
        this.searchTerm = searchTerm;
        !this.searchTerm || this.searchTerm === '' ? this.getData() : this.searchTerm?.length >= 3 ? this.getData() : null;
    }

    getData() {
        this.dataSource.rolePlayerId = this.rolePlayerId && this.rolePlayerId > 0 ? this.rolePlayerId : 0;
        this.dataSource.getData(this.paginator.pageIndex + 1, this.paginator.pageSize, this.sort.active, this.sort.direction, this.searchTerm);
    }

    getProductOptionNames(quoteDetails: QuoteDetailsV2[]): string {
        let productOptionName = String.Empty;
        const unique = [...new Set(quoteDetails.map((item) => item.productOptionId))];

        if (!unique || unique?.length <= 0) { return productOptionName; }

        for (let index = 0; index < unique?.length; index++) {
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
        if (this.productOptions) {
            const productOption = this.productOptions.find(s => s.id === productOptionId);
            return productOption ? productOption.name + ' (' + productOption.code + ')' : 'N/A';
        }
    }

    getProductName(productId: number): string {
        if (this.products) {
            const product = this.products.find(s => s.id == productId);
            return product ? product.name + ' (' + product.code + ')' : 'N/A';
        }
    }

    quoteSelected(quote: QuoteV2) {
        this.selectedQuote = quote;
        this.quoteSelectedEmit.emit(this.selectedQuote);
    }

    quoteStatusFilterChanged($event: QuoteStatusEnum) {
        this.dataSource.quoteStatusId = +QuoteStatusEnum[$event];
        this.search(this.searchTerm)
    }

    clientTypeFilterChanged($event: ClientTypeEnum) {
        this.dataSource.clientTypeId = +ClientTypeEnum[$event];
        this.search(this.searchTerm)
    }

    reset() {
        this.searchTerm = null;
        this.selectedQuote = null;

        this.dataSource.quoteStatusId = 0;
        this.dataSource.clientTypeId = 0;

        this.form.controls.quoteStatusFilter.reset();
        this.form.controls.clientTypeFilter.reset();

        this.form.patchValue({
            searchTerm: this.searchTerm
        });
    }

    getQuoteStatus(quoteStatus: QuoteStatusEnum): string {
        return this.formatLookup(QuoteStatusEnum[+quoteStatus]);
    }

    ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    formatLookup(lookup: string) {
        return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    getDisplayedColumns() {
        const columnDefinitions = [
            { def: 'leadId', show: !this.hideLeadColumn },
            { def: 'quotationNumber', show: true },
            { def: 'product', show: true },
            { def: 'productOption', show: true },
            { def: 'quoteStatus', show: true },
            { def: 'sla', show: !this.basicMode && this.userHasPermission(this.viewSlaPermission) && (this.dataSource && this.dataSource.data && this.dataSource.data.pageSize && this.dataSource.data.pageSize <= 10) },
            { def: 'actions', show: (this.userHasPermission(this.viewPermission) || this.userHasPermission(this.editPermission)) }
        ];
        return columnDefinitions
            .filter(cd => cd.show)
            .map(cd => cd.def);
    }
}
